export async function POST() {
  const sitemapUrl = "https://www.vosthermos.com/sitemap.xml";
  const results = {};

  // Ping Google
  try {
    const g = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.google = g.status;
  } catch { results.google = "error"; }

  // Ping Bing (via IndexNow)
  try {
    const b = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.bing = b.status;
  } catch { results.bing = "error"; }

  return Response.json({ pinged: true, results });
}
