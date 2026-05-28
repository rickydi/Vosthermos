import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { touchPresence, leavePresence } from "@/lib/presence";
import { publishAdminEvent } from "@/lib/event-bus";

// POST /api/admin/presence
// body: { entityType, entityId, action? }
//   action "leave" -> retire la presence (a la fermeture)
//   sinon          -> heartbeat (a appeler toutes les ~15 s)
// Retourne { viewers: [{ id, name, email }] } = les AUTRES employes presents.
export async function POST(request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { entityType, entityId, action } = body || {};
  if (!entityType || entityId === undefined || entityId === null) {
    return NextResponse.json({ error: "entityType et entityId requis" }, { status: 400 });
  }

  const admin = { id: session.id, email: session.email };
  const { viewers, changed } =
    action === "leave"
      ? leavePresence(entityType, entityId, admin.id)
      : touchPresence(entityType, entityId, admin);

  // Notifie les autres onglets seulement quand la composition change vraiment.
  if (changed) {
    publishAdminEvent({ type: "presence.changed", entityType, entityId });
  }

  return NextResponse.json({ viewers });
}
