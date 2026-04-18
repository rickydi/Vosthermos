const KEY = "vosthermos-indexnow-key-2026";
const HOST = "www.vosthermos.com";

function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `https://${HOST}${u}`;
  return `https://${HOST}/${u}`;
}

export async function submitToIndexNow(urls) {
  const urlList = (Array.isArray(urls) ? urls : [urls]).map(normalizeUrl).filter(Boolean);
  if (urlList.length === 0) return { ok: false, reason: "no urls" };

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
    return { ok: res.status === 200 || res.status === 202, status: res.status, count: urlList.length };
  } catch (e) {
    return { ok: false, status: 0, reason: e.message };
  }
}

// Fire-and-forget helper — ne bloque pas la reponse de l'API appelante
export function pingIndexNowAsync(urls) {
  submitToIndexNow(urls).catch(() => {});
}
