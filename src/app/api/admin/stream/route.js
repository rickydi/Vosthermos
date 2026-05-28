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

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          /* flux deja ferme */
        }
      };

      send({ type: "connected" });
      unsubscribe = subscribeAdminEvents(send);

      // Commentaire SSE periodique: garde la connexion vivante a travers les proxies.
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* ignore */
        }
      }, 25000);

      const cleanup = () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* deja ferme */
        }
      };
      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe();
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
