import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeFollowUp } from "@/lib/follow-up-utils";

function dateOrNull(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
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
  try { await requireAdmin(); }
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
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
  });

  return NextResponse.json(serializeFollowUp(followUp));
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  await prisma.clientFollowUp.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
