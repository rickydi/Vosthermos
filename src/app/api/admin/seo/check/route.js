import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

const SCAN_STATE_KEY = "seo_scan_state";
const HEARTBEAT_TIMEOUT_MS = 60000; // 1 minute without update = scan dead

// ─── DB-backed scan state (survives PM2 restarts + cluster mode) ───
async function readScanState() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = $1`,
      SCAN_STATE_KEY
    );
    if (!rows[0]?.value) return null;
    return JSON.parse(rows[0].value);
  } catch {
    return null;
  }
}

async function writeScanState(state) {
  try {
    const value = JSON.stringify({ ...state, heartbeat: Date.now() });
    await prisma.$executeRawUnsafe(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      SCAN_STATE_KEY, value
    );
  } catch (err) {
    console.error("Failed to write scan state:", err.message);
  }
}

async function isScanAlive() {
  const state = await readScanState();
  if (!state || !state.running) return false;
  // Heartbeat check: if no update in HEARTBEAT_TIMEOUT_MS, scan is dead
  if (Date.now() - (state.heartbeat || 0) > HEARTBEAT_TIMEOUT_MS) {
    // Mark as dead
    await writeScanState({ ...state, running: false });
    return false;
  }
  return true;
}

// ─── Serper API call ───────────────────────────────────────────────
async function checkRankingSerper(cityName, keywordBase) {
  let apiKey = process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'api_key_serper'`
    );
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  if (!apiKey) return { position: null, aiMention: false, url: null };

  const query = `${keywordBase} ${cityName}`;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "ca", hl: "fr", num: 100 }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Serper HTTP ${res.status} for "${query}": ${body.slice(0, 200)}`);
      return { position: null, aiMention: false, url: null, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    let position = null;
    let foundUrl = null;

    // Check organic results
    for (const o of data.organic || []) {
      if ((o.link || "").includes("vosthermos")) {
        position = o.position || null;
        foundUrl = o.link;
        break;
      }
    }

    // If not in organic, check localResults and placesResults (local pack)
    if (position === null) {
      for (const key of ["localResults", "placesResults", "places"]) {
        const arr = data[key]?.places || data[key] || [];
        if (Array.isArray(arr)) {
          for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if ((item.website || item.link || "").includes("vosthermos")) {
              position = position || (100 + i + 1); // local pack positioned after organic
              foundUrl = item.website || item.link;
              break;
            }
          }
        }
        if (position !== null) break;
      }
    }

    let aiMention = false;
    for (const key of ["answerBox", "knowledgeGraph", "aiOverview"]) {
      if (data[key] && JSON.stringify(data[key]).toLowerCase().includes("vosthermos")) {
        aiMention = true;
        break;
      }
    }

    return {
      position,
      aiMention,
      url: foundUrl,
      organicCount: (data.organic || []).length,
    };
  } catch (err) {
    console.error(`Error checking ${cityName}:`, err.message);
    return { position: null, aiMention: false, url: null, error: err.message };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Background scan runner ────────────────────────────────────────
async function runScan(keywordBase, citiesToCheck) {
  const results = [];
  await writeScanState({
    running: true,
    current: 0,
    total: citiesToCheck.length,
    city: "Demarrage...",
    keyword: keywordBase,
    results,
    startedAt: Date.now(),
  });

  for (let i = 0; i < citiesToCheck.length; i++) {
    const city = citiesToCheck[i];
    const keyword = `${keywordBase} ${city.name}`;

    // Update progress BEFORE the API call so heartbeat stays fresh
    await writeScanState({
      running: true,
      current: i + 1,
      total: citiesToCheck.length,
      city: city.name,
      keyword: keywordBase,
      results: results.slice(-15),
      startedAt: Date.now(),
    });

    try {
      const result = await checkRankingSerper(city.name, keywordBase);

      await prisma.seoRanking.create({
        data: {
          city: city.slug,
          cityName: city.name,
          keyword,
          position: result.position,
          aiMention: result.aiMention,
          url: result.url,
        },
      });

      results.push({
        city: city.name,
        slug: city.slug,
        position: result.position,
        aiMention: result.aiMention,
      });
    } catch (err) {
      console.error(`Scan error for ${city.name}:`, err.message);
      results.push({ city: city.name, slug: city.slug, position: null, aiMention: false });
    }

    // Update with new result + heartbeat
    await writeScanState({
      running: true,
      current: i + 1,
      total: citiesToCheck.length,
      city: city.name,
      keyword: keywordBase,
      results: results.slice(-15),
      startedAt: Date.now(),
    });

    if (i < citiesToCheck.length - 1) await sleep(1500);
  }

  // Mark as finished
  await writeScanState({
    running: false,
    current: citiesToCheck.length,
    total: citiesToCheck.length,
    city: "Termine",
    keyword: keywordBase,
    results: results.slice(-15),
    finishedAt: Date.now(),
  });
}

// ─── POST: start scan ──────────────────────────────────────────────
export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let hasSerperKey = !!process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'api_key_serper'`
    );
    if (rows[0]?.value) hasSerperKey = true;
  } catch {}
  if (!hasSerperKey) {
    return new Response(JSON.stringify({ error: "SERPER_API_KEY manquant" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if a scan is already running (with heartbeat validation)
  if (await isScanAlive()) {
    const state = await readScanState();
    return new Response(JSON.stringify({ error: "Scan deja en cours", state }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  let keywordBase = "remplacement vitre thermos";
  let cityFilter = null;
  try {
    const body = await request.json();
    if (body.keyword) keywordBase = body.keyword;
    cityFilter = body.city || null;
  } catch {}

  const citiesToCheck = cityFilter
    ? CITIES.filter((c) => c.slug === cityFilter)
    : CITIES;

  // Start scan in background (don't await)
  runScan(keywordBase, citiesToCheck).catch(err => {
    console.error("runScan error:", err);
    writeScanState({ running: false, error: err.message });
  });

  return new Response(JSON.stringify({ started: true, total: citiesToCheck.length }), {
    headers: { "Content-Type": "application/json" },
  });
}

// ─── GET: scan progress ────────────────────────────────────────────
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const state = await readScanState();
  if (!state) {
    return new Response(JSON.stringify({
      running: false, current: 0, total: 0, city: "", results: [], done: false,
    }), { headers: { "Content-Type": "application/json" } });
  }

  // Heartbeat check: if scan claims running but no update in 60s, mark dead
  let running = state.running;
  if (running && Date.now() - (state.heartbeat || 0) > HEARTBEAT_TIMEOUT_MS) {
    running = false;
    await writeScanState({ ...state, running: false });
  }

  return new Response(JSON.stringify({
    running,
    current: state.current || 0,
    total: state.total || 0,
    city: state.city || "",
    keyword: state.keyword || "",
    results: state.results || [],
    done: !running && (state.total || 0) > 0,
    heartbeatAge: state.heartbeat ? Math.round((Date.now() - state.heartbeat) / 1000) : null,
  }), { headers: { "Content-Type": "application/json" } });
}
