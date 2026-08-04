import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import { applyFollowUpUpdate, cancelVisitAppointment } from "@/lib/follow-up-update";

// La logique de mise a jour vit dans lib/follow-up-update.js, PARTAGEE avec
// l'app mobile (/api/app/follow-up/[id]) : cocher un jalon depuis le telephone
// ou depuis cette page doit produire exactement le meme resultat.

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await applyFollowUpUpdate({
    followUpId: Number(id),
    body,
    actor: session.id,
    origin: req.headers.get("x-admin-tab") || undefined,
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "follow_up",
    entityId: result.raw.id,
    label: `Suivi modifie: ${result.raw.title}`,
    metadata: {
      changedFields: changedFields(result.existing, result.raw, result.dataKeys),
      statusFrom: result.existing.status,
      statusTo: result.raw.status,
      clientId: result.raw.clientId,
    },
  });

  return NextResponse.json(result.followUp);
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.clientFollowUp.findUnique({ where: { id: Number(id) } });
  // Le RDV de visite associe (Appointment) doit etre annule, sinon il reste actif
  // dans le calendrier alors que le dossier n'existe plus.
  if (existing) await cancelVisitAppointment(existing);
  await prisma.clientFollowUp.delete({ where: { id: Number(id) } });
  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "follow_up",
    entityId: id,
    label: `Suivi supprime: ${existing?.title || id}`,
    metadata: { status: existing?.status, clientId: existing?.clientId },
  });
  publishAdminEvent({
    type: "follow_up.changed",
    entityType: "follow_up",
    entityId: Number(id),
    clientId: existing?.clientId,
    actor: session.id,
    origin: req.headers.get("x-admin-tab") || undefined,
  });
  return NextResponse.json({ ok: true });
}
