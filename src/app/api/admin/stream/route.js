import { requireAdmin } from "@/lib/admin-auth";
import { subscribeAdminEvents } from "@/lib/event-bus";

// Flux temps reel (Server-Sent Events) pour l'admin. Le client s'y connecte via
// EventSource et recoit les evenements pousses par les mutations (bus in-process).
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // EventEmitter partage -> runtime Node obligatoire

export async function GET(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat = null;
  let closed = false;
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      // Nettoyage idempotent: stoppe le heartbeat, se desabonne du bus, ferme le flux.
      cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* deja ferme */
        }
      };

      // Ecrit sur le flux; si la connexion est morte (onglet ferme/recharge), nettoie
      // tout immediatement. Filet de securite si "abort" ne se declenche pas: la
      // connexion fantome est nettoyee au plus tard au prochain heartbeat (<=15 s),
      // donc le timer et le listener du bus ne fuient jamais.
      const safeEnqueue = (chunk) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          cleanup();
        }
      };

      const send = (obj) => safeEnqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      send({ type: "connected" });
      unsubscribe = subscribeAdminEvents(send);

      // Commentaire SSE periodique: garde la connexion vivante a travers les proxies
      // (15 s pour rester sous les timeouts d'inactivite des proxies).
      heartbeat = setInterval(() => safeEnqueue(encoder.encode(`: ping\n\n`)), 15000);

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
