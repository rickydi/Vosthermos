// Presence collaborative en memoire (1 instance PM2 -> pas de table ni de Redis).
// But: savoir qui consulte/edite quoi pour ne pas se marcher dessus entre employes.
// Cle = `${entityType}:${entityId}` (ex: "client:57", "work_order:12").
// Une entree expire apres PRESENCE_TTL_MS sans heartbeat.

const PRESENCE_TTL_MS = 30_000; // 30 s sans heartbeat = parti

// Survit au hot-reload de Next.js en dev (sinon le module est recree a chaque edit).
const store = globalThis.__vosthermosPresence || (globalThis.__vosthermosPresence = new Map());

function keyFor(entityType, entityId) {
  return `${entityType}:${entityId}`;
}

// "marc.tremblay@vosthermos.com" -> "Marc Tremblay"
export function nameFromEmail(email) {
  if (!email) return "Employe";
  const local = String(email).split("@")[0];
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || local;
}

function purge(viewers) {
  const now = Date.now();
  for (const [adminId, info] of viewers) {
    if (now - info.lastSeen > PRESENCE_TTL_MS) viewers.delete(adminId);
  }
}

// Enregistre/rafraichit la presence d'un admin sur une entite.
// Retourne { viewers, changed }: viewers = les AUTRES employes presents;
// changed = true si la composition a change (nouveau venu ou expire purge) ->
// sert a ne notifier le temps reel que sur un vrai changement, pas a chaque battement.
export function touchPresence(entityType, entityId, admin) {
  if (!entityType || entityId === undefined || entityId === null || !admin?.id) {
    return { viewers: [], changed: false };
  }
  const key = keyFor(entityType, entityId);
  let viewers = store.get(key);
  if (!viewers) {
    viewers = new Map();
    store.set(key, viewers);
  }
  const isNew = !viewers.has(admin.id);
  viewers.set(admin.id, {
    id: admin.id,
    email: admin.email || "",
    name: nameFromEmail(admin.email),
    lastSeen: Date.now(),
  });
  const sizeBefore = viewers.size;
  purge(viewers);
  const changed = isNew || viewers.size !== sizeBefore;
  if (viewers.size === 0) store.delete(key);
  return { viewers: others(viewers, admin.id), changed };
}

// Retire explicitement un admin (a la fermeture du panneau).
export function leavePresence(entityType, entityId, adminId) {
  const key = keyFor(entityType, entityId);
  const viewers = store.get(key);
  if (!viewers) return { viewers: [], changed: false };
  const had = viewers.delete(adminId);
  purge(viewers);
  if (viewers.size === 0) {
    store.delete(key);
    return { viewers: [], changed: had };
  }
  return { viewers: others(viewers, adminId), changed: had };
}

function others(viewers, selfId) {
  const now = Date.now();
  const result = [];
  for (const info of viewers.values()) {
    if (info.id === selfId) continue;
    if (now - info.lastSeen > PRESENCE_TTL_MS) continue;
    result.push({ id: info.id, name: info.name, email: info.email });
  }
  return result;
}

export { PRESENCE_TTL_MS };
