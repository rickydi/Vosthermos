// Limiteur de debit en memoire. Suffisant ici : l'app tourne en 1 seule instance PM2
// (pas de cluster), donc l'etat partage en memoire est coherent. Fenetre glissante par cle.
const buckets = new Map();

let _lastSweep = Date.now();

// Nettoyage paresseux pour eviter que la Map grossisse indefiniment (cles d'IP one-shot).
function sweep(windowMs) {
  const now = Date.now();
  if (now - _lastSweep < windowMs) return;
  _lastSweep = now;
  for (const [key, hits] of buckets) {
    const kept = hits.filter((t) => now - t < windowMs);
    if (kept.length) buckets.set(key, kept);
    else buckets.delete(key);
  }
}

// Retourne { ok: true } si autorise, sinon { ok: false, retryAfter: <secondes> }.
export function rateLimit(key, { max = 10, windowMs = 60_000 } = {}) {
  sweep(windowMs);
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

// Extraction d'IP coherente avec le reste du code (derriere le reverse-proxy Apache/cPanel).
export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}
