import { EventEmitter } from "events";

// Bus d'evenements in-process pour le temps reel admin (SSE).
// 1 instance PM2 -> un seul EventEmitter suffit, pas de Redis.
// Survit au hot-reload de Next.js en dev.
const bus = globalThis.__vosthermosBus || (globalThis.__vosthermosBus = new EventEmitter());
bus.setMaxListeners(0); // chaque connexion SSE = 1 listener, pas de plafond

const CHANNEL = "admin-event";

// event: { type, entityType?, entityId?, clientId?, actor? }
// type ex: "follow_up.changed", "work_order.changed", "appointment.changed",
//          "presence.changed", "chat.message"
export function publishAdminEvent(event) {
  if (!event?.type) return;
  bus.emit(CHANNEL, event);
}

export function subscribeAdminEvents(listener) {
  bus.on(CHANNEL, listener);
  return () => bus.off(CHANNEL, listener);
}
