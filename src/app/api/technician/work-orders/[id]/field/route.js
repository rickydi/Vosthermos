import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { computeDurationMinutes } from "@/lib/work-order-utils";
import { publishAdminEvent } from "@/lib/event-bus";

// Actions terrain légères : { action: "arrived"|"completed", lat?, lng? }.
// "arrived"  -> arrivalAt + GPS (capté au tap, Loi 25) -> coche Visite faite côté suivi.
// "completed"-> departureAt + statut completed -> coche Service fait. Live au bureau via SSE.
export async function POST(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const woId = parseInt(id);
  if (!Number.isFinite(woId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const existing = await prisma.workOrder.findUnique({ where: { id: woId } });
  if (!existing || existing.technicianId !== session.id) {
    return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data = {};

  if (body.action === "arrived") {
    data.arrivalAt = existing.arrivalAt || new Date();
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      data.arrivalLat = lat;
      data.arrivalLng = lng;
    }
  } else if (body.action === "completed") {
    const departureAt = new Date();
    data.departureAt = departureAt;
    data.durationMinutes = computeDurationMinutes(existing.arrivalAt, departureAt);
    if (["draft", "scheduled", "in_progress", "quote_accepted"].includes(existing.statut)) {
      data.statut = "completed";
    }
  } else {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const wo = await prisma.workOrder.update({ where: { id: woId }, data, include: { client: true } });

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder: wo, client: wo.client });
  } catch (err) {
    console.error("[technician-field] follow-up sync error:", err?.message || err);
  }

  // Live au bureau : la case du suivi se coche en direct.
  const actor = `tech:${session.id}`;
  publishAdminEvent({ type: "work_order.changed", entityType: "work_order", entityId: wo.id, clientId: wo.clientId, actor });
  if (wo.followUpId) {
    publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: wo.followUpId, clientId: wo.clientId, actor });
  }

  return NextResponse.json({ ok: true, id: wo.id, statut: wo.statut, arrivalAt: wo.arrivalAt, departureAt: wo.departureAt });
}
