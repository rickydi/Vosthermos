import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeFollowUp } from "@/lib/follow-up-utils";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";

function dateOrNull(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const followUpId = Number(id);
  const existing = await prisma.clientFollowUp.findUnique({ where: { id: followUpId } });
  if (!existing) return NextResponse.json({ error: "Suivi introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data = {};

  for (const key of ["title", "source", "status", "priority", "contactName", "phone", "email", "service", "nextAction", "lostReason", "notes"]) {
    const value = cleanOrNull(body[key]);
    if (value !== undefined) data[key] = value;
  }

  if (body.clientId !== undefined) data.clientId = body.clientId ? Number(body.clientId) : null;

  const estimateAmount = numberOrNull(body.estimateAmount);
  if (estimateAmount !== undefined) data.estimateAmount = estimateAmount;

  for (const key of ["estimateSentAt", "acceptedAt", "jobCompletedAt", "nextActionDate"]) {
    const value = dateOrNull(body[key]);
    if (value !== undefined) data[key] = value;
  }

  if (body.status === "estimate_sent" && !existing.estimateSentAt && data.estimateSentAt === undefined) {
    data.estimateSentAt = new Date();
  }
  if (body.status === "won" && !existing.acceptedAt && data.acceptedAt === undefined) {
    data.acceptedAt = new Date();
  }
  if (body.status === "completed" && !existing.jobCompletedAt && data.jobCompletedAt === undefined) {
    data.jobCompletedAt = new Date();
  }

  const followUp = await prisma.clientFollowUp.update({
    where: { id: followUpId },
    data,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          secondaryPhone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
  });

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "follow_up",
    entityId: followUp.id,
    label: `Suivi modifie: ${followUp.title}`,
    metadata: {
      changedFields: changedFields(existing, followUp, Object.keys(data)),
      statusFrom: existing.status,
      statusTo: followUp.status,
      clientId: followUp.clientId,
    },
  });

  return NextResponse.json(serializeFollowUp(followUp));
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.clientFollowUp.findUnique({ where: { id: Number(id) } });
  await prisma.clientFollowUp.delete({ where: { id: Number(id) } });
  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "follow_up",
    entityId: id,
    label: `Suivi supprime: ${existing?.title || id}`,
    metadata: { status: existing?.status, clientId: existing?.clientId },
  });
  return NextResponse.json({ ok: true });
}
