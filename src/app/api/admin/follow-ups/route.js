import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES, serializeFollowUp } from "@/lib/follow-up-utils";

export const dynamic = "force-dynamic";

function dateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clean(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

export async function GET(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";
  const q = clean(searchParams.get("q"));
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  const where = {};
  if (status === "active") {
    where.status = { notIn: FOLLOW_UP_TERMINAL_STATUSES };
  } else if (status && status !== "all") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { service: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q } } },
      { client: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const followUps = await prisma.clientFollowUp.findMany({
    where,
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
    orderBy: [
      { nextActionDate: "asc" },
      { updatedAt: "desc" },
    ],
    take: limit,
  });

  return NextResponse.json(followUps.map(serializeFollowUp));
}

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId ? Number(body.clientId) : null;
  const client = clientId
    ? await prisma.client.findUnique({ where: { id: clientId } })
    : null;

  const title = clean(body.title) || client?.name || clean(body.contactName);
  if (!title) {
    return NextResponse.json({ error: "Nom ou titre requis" }, { status: 400 });
  }

  const followUp = await prisma.clientFollowUp.create({
    data: {
      clientId: client?.id || null,
      title,
      source: clean(body.source),
      status: clean(body.status) || "to_call",
      priority: clean(body.priority) || "normal",
      contactName: clean(body.contactName) || client?.name || null,
      phone: clean(body.phone) || client?.phone || null,
      email: clean(body.email) || client?.email || null,
      service: clean(body.service),
      estimateAmount: numberOrNull(body.estimateAmount),
      estimateSentAt: dateOrNull(body.estimateSentAt),
      acceptedAt: dateOrNull(body.acceptedAt),
      jobCompletedAt: dateOrNull(body.jobCompletedAt),
      nextAction: clean(body.nextAction),
      nextActionDate: dateOrNull(body.nextActionDate),
      lostReason: clean(body.lostReason),
      notes: clean(body.notes),
    },
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
