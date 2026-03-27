export async function POST(req) {
  const { urls } = await req.json();
  const key = "vosthermos-indexnow-key-2026";
  const host = "www.vosthermos.com";

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls.map(u => u.startsWith("http") ? u : `https://${host}${u}`),
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return Response.json({ status: res.status, submitted: urls.length });
}
