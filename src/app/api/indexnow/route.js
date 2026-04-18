import sitemap from "@/app/sitemap";

const KEY = "vosthermos-indexnow-key-2026";
const HOST = "www.vosthermos.com";

function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `https://${HOST}${u}`;
  return `https://${HOST}/${u}`;
}

async function submitBatch(urlList) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text().catch(() => "");
    return { status: res.status, ok: res.status === 200 || res.status === 202, body: text.slice(0, 200) };
  } catch (e) {
    return { status: 0, ok: false, body: e.message };
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const mode = body.mode || "custom";

  let urls = [];

  if (mode === "all") {
    const items = await sitemap();
    urls = items.map((i) => i.url).filter(Boolean);
  } else {
    urls = Array.isArray(body.urls) ? body.urls : [];
  }

  urls = urls.map(normalizeUrl).filter(Boolean);
  const total = urls.length;

  if (total === 0) {
    return Response.json({ error: "Aucune URL fournie" }, { status: 400 });
  }

  // IndexNow accepte max 10 000 URLs par requete mais Bing limite pratique ~100
  const BATCH_SIZE = 100;
  const batches = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    const r = await submitBatch(batch);
    results.push({ count: batch.length, ...r });
  }

  const okCount = results.filter((r) => r.ok).reduce((s, r) => s + r.count, 0);
  const failCount = total - okCount;

  return Response.json({
    host: HOST,
    mode,
    totalSubmitted: total,
    okCount,
    failCount,
    batches: results,
    message: okCount === total
      ? `${total} URLs soumises a IndexNow (Bing + Yandex)`
      : `${okCount}/${total} URLs acceptees, ${failCount} en erreur`,
  });
}

export async function GET() {
  return Response.json({
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    endpoint: "/api/indexnow",
    usage: 'POST avec { "mode": "all" } ou { "urls": [...] }',
  });
}
