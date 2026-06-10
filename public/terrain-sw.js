// Service worker terrain : minimal et SÛR (network-first).
// But : rendre l'app installable + tolérer une coupure réseau ponctuelle sur la route.
// On ne met JAMAIS en cache agressivement les assets (évite le bug du contenu périmé).
const CACHE = "vt-terrain-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  // Navigations terrain : réseau d'abord, cache de secours hors-ligne.
  if (req.mode === "navigate" && url.pathname.startsWith("/terrain")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/terrain"))),
    );
  }
});
