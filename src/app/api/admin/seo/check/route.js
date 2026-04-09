import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

const SCAN_STATE_KEY = "seo_scan_state";
const HEARTBEAT_TIMEOUT_MS = 30000; // 30s without tick = scan dead

// ─── DB-backed scan state ─────────────────────────────────────────
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

// ─── Serper API call ──────────────────────────────────────────────
async function getSerperKey() {
  let apiKey = process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'api_key_serper'`
    );
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  return apiKey;
}

async function checkRankingSerper(cityName, keywordBase) {
  const apiKey = await getSerperKey();
  if (!apiKey) return { position: null, aiMention: false, url: null };

  const query = `${keywordBase} ${cityName}`;
  const MAX_PAGES = 2; // up to top 20 results
  let aiMention = false;

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, gl: "ca", hl: "fr", page }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`Serper HTTP ${res.status} for "${query}" page ${page}: ${body.slice(0, 200)}`);
        return { position: null, aiMention, url: null, error: `HTTP ${res.status}` };
      }

      const data = await res.json();

      // Check AI overview on first page only
      if (page === 1) {
        for (const key of ["answerBox", "knowledgeGraph", "aiOverview"]) {
          if (data[key] && JSON.stringify(data[key]).toLowerCase().includes("vosthermos")) {
            aiMention = true;
            break;
          }
        }
      }

      // Look for vosthermos in this page
      // Serper's `position` is page-relative (1-10 per page), so compute absolute
      for (const o of data.organic || []) {
        if ((o.link || "").includes("vosthermos")) {
          const pagePos = o.position || 0;
          const absolutePos = (page - 1) * 10 + pagePos;
          return { position: absolutePos, aiMention, url: o.link };
        }
      }

      // If this page has fewer than 10 results, no point paginating further
      if ((data.organic || []).length < 10) break;
    }

    return { position: null, aiMention, url: null };
  } catch (err) {
    console.error(`Error checking ${cityName}:`, err.message);
    return { position: null, aiMention: false, url: null, error: err.message };
  }
}

// ─── Debug: raw Serper response (same pagination as real scan) ──
async function debugSerper(cityName, keywordBase) {
  const apiKey = await getSerperKey();
  if (!apiKey) return { error: "no api key" };

  const query = `${keywordBase} ${cityName}`;
  const allResults = [];
  let vosthermosFound = null;

  try {
    for (let page = 1; page <= 2; page++) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, gl: "ca", hl: "fr", page }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { query, status: res.status, error: data.message };
      }
      const organic = (data.organic || []).map(o => ({
        page,
        pos: o.position,
        title: o.title?.slice(0, 60),
        link: o.link,
        isVosthermos: (o.link || "").toLowerCase().includes("vosthermos"),
      }));
      allResults.push(...organic);
      if (!vosthermosFound) {
        const vt = organic.find(o => o.isVosthermos);
        if (vt) vosthermosFound = vt;
      }
      if (organic.length < 10) break;
    }

    return {
      query,
      totalResults: allResults.length,
      vosthermosFound,
      allResults,
    };
  } catch (err) {
    return { error: err.message };
  }
}

// ─── POST: tick one city (frontend-driven scan) ───────────────────
// - POST with { action: "start", keyword, city? } = initialize scan state
// - POST with { action: "tick" } = process next city, return progress
// - POST with { action: "stop" } = mark scan as stopped
export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  let body = {};
  try { body = await request.json(); } catch {}
  const action = body.action || "start"; // default backward-compat

  // ─── Action: start ────
  if (action === "start") {
    const apiKey = await getSerperKey();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "SERPER_API_KEY manquant" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    const keywordBase = body.keyword || "remplacement vitre thermos";
    const cityFilter = body.city || null;
    const citiesToCheck = cityFilter
      ? CITIES.filter(c => c.slug === cityFilter)
      : CITIES;

    await writeScanState({
      running: true,
      current: 0,
      total: citiesToCheck.length,
      city: "Demarrage...",
      keyword: keywordBase,
      citySlugs: citiesToCheck.map(c => c.slug),
      results: [],
      startedAt: Date.now(),
    });

    return new Response(JSON.stringify({
      started: true, total: citiesToCheck.length,
    }), { headers: { "Content-Type": "application/json" } });
  }

  // ─── Action: tick ────
  if (action === "tick") {
    const state = await readScanState();
    if (!state || !state.running) {
      return new Response(JSON.stringify({
        running: false, done: true, error: "no scan in progress",
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (state.current >= state.total) {
      // Finished
      await writeScanState({ ...state, running: false, city: "Termine" });
      return new Response(JSON.stringify({
        running: false, done: true, current: state.total, total: state.total,
        results: state.results,
      }), { headers: { "Content-Type": "application/json" } });
    }

    const slug = state.citySlugs[state.current];
    const city = CITIES.find(c => c.slug === slug);
    if (!city) {
      // Skip unknown city
      await writeScanState({ ...state, current: state.current + 1 });
      return new Response(JSON.stringify({
        running: true, current: state.current + 1, total: state.total,
        city: slug, skipped: true,
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Process this city
    const keyword = `${state.keyword} ${city.name}`;
    let result = { position: null, aiMention: false, url: null };
    try {
      result = await checkRankingSerper(city.name, state.keyword);
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
    } catch (err) {
      console.error(`Tick error for ${city.name}:`, err.message);
    }

    const newResults = [
      ...state.results,
      { city: city.name, slug: city.slug, position: result.position, aiMention: result.aiMention },
    ];

    await writeScanState({
      ...state,
      current: state.current + 1,
      city: city.name,
      results: newResults,
    });

    return new Response(JSON.stringify({
      running: state.current + 1 < state.total,
      done: state.current + 1 >= state.total,
      current: state.current + 1,
      total: state.total,
      city: city.name,
      lastResult: { city: city.name, slug: city.slug, position: result.position, aiMention: result.aiMention },
    }), { headers: { "Content-Type": "application/json" } });
  }

  // ─── Action: stop ────
  if (action === "stop") {
    const state = await readScanState();
    if (state) {
      await writeScanState({ ...state, running: false, city: "Arrete" });
    }
    return new Response(JSON.stringify({ stopped: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "unknown action" }), {
    status: 400, headers: { "Content-Type": "application/json" },
  });
}

// ─── GET: scan progress OR debug ──────────────────────────────────
export async function GET(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  // Debug mode
  const { searchParams } = new URL(request.url);
  const debugCity = searchParams.get("debug_city");
  if (debugCity) {
    const kw = searchParams.get("keyword") || "remplacement vitre thermos";
    const cityObj = CITIES.find(c => c.slug === debugCity);
    if (!cityObj) {
      return new Response(JSON.stringify({ error: "city not found" }), { status: 404 });
    }
    const result = await debugSerper(cityObj.name, kw);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Regular progress check
  const state = await readScanState();
  if (!state) {
    return new Response(JSON.stringify({
      running: false, current: 0, total: 0, city: "", results: [], done: false,
    }), { headers: { "Content-Type": "application/json" } });
  }

  // Heartbeat check
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
    done: !running && (state.total || 0) > 0 && (state.current || 0) >= (state.total || 0),
    heartbeatAge: state.heartbeat ? Math.round((Date.now() - state.heartbeat) / 1000) : null,
  }), { headers: { "Content-Type": "application/json" } });
}
