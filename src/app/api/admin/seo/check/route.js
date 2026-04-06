import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

// In-memory scan state (survives across requests within same PM2 process)
let scanState = { running: false, current: 0, total: 0, city: "", results: [], keyword: "" };

async function checkRankingSerper(cityName, keywordBase) {
  // Read API key from site_settings first, fallback to env
  let apiKey = process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'api_key_serper'`);
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  if (!apiKey) return { position: null, aiMention: false, url: null };

  const query = `${keywordBase} ${cityName}`;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "ca", hl: "fr", num: 20 }),
    });

    if (!res.ok) return { position: null, aiMention: false, url: null };

    const data = await res.json();
    let position = null;
    let foundUrl = null;

    for (const o of data.organic || []) {
      if ((o.link || "").includes("vosthermos")) {
        position = o.position || null;
        foundUrl = o.link;
        break;
      }
    }

    let aiMention = false;
    for (const key of ["answerBox", "knowledgeGraph", "aiOverview"]) {
      if (data[key] && JSON.stringify(data[key]).toLowerCase().includes("vosthermos")) {
        aiMention = true;
        break;
      }
    }

    return { position, aiMention, url: foundUrl };
  } catch (err) {
    console.error(`Error checking ${cityName}:`, err.message);
    return { position: null, aiMention: false, url: null };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runScan(keywordBase, citiesToCheck) {
  scanState = { running: true, current: 0, total: citiesToCheck.length, city: "", results: [], keyword: keywordBase };

  for (let i = 0; i < citiesToCheck.length; i++) {
    const city = citiesToCheck[i];
    const keyword = `${keywordBase} ${city.name}`;

    scanState.current = i + 1;
    scanState.city = city.name;

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

      scanState.results.push({
        city: city.name,
        slug: city.slug,
        position: result.position,
        aiMention: result.aiMention,
      });
    } catch (err) {
      console.error(`Scan error for ${city.name}:`, err.message);
      scanState.results.push({ city: city.name, slug: city.slug, position: null, aiMention: false });
    }

    if (i < citiesToCheck.length - 1) await sleep(1500);
  }

  scanState.running = false;
}

// POST: start a scan
export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check API key from site_settings first, then env
  let hasSerperKey = !!process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'api_key_serper'`);
    if (rows[0]?.value) hasSerperKey = true;
  } catch {}
  if (!hasSerperKey) {
    return new Response(JSON.stringify({ error: "SERPER_API_KEY manquant" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (scanState.running) {
    return new Response(JSON.stringify({ error: "Scan deja en cours", state: scanState }), {
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
  runScan(keywordBase, citiesToCheck);

  return new Response(JSON.stringify({ started: true, total: citiesToCheck.length }), {
    headers: { "Content-Type": "application/json" },
  });
}

// GET: check scan progress
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    running: scanState.running,
    current: scanState.current,
    total: scanState.total,
    city: scanState.city,
    keyword: scanState.keyword,
    results: scanState.results.slice(-10),
    done: !scanState.running && scanState.total > 0,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
