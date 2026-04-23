import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const managers = await prisma.managerUser.findMany({
    include: {
      clients: { include: { client: { select: { id: true, name: true, city: true } } } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    managers.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      lastLoginAt: m.lastLoginAt?.toISOString() || null,
      clients: m.clients.map((mc) => ({
        clientId: mc.clientId,
        clientName: mc.client.name,
        clientCity: mc.client.city,
        permissions: mc.permissions,
      })),
    }))
  );
}

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const { email, firstName, lastName, phone, clientIds = [] } = body;

  if (!email || !firstName || !lastName) {
    return NextResponse.json({ error: "Email, prenom et nom requis" }, { status: 400 });
  }

  const normalized = String(email).trim().toLowerCase();
  const existing = await prisma.managerUser.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "Un gestionnaire avec cet email existe deja" }, { status: 400 });
  }

  const manager = await prisma.managerUser.create({
    data: {
      email: normalized,
      firstName,
      lastName,
      phone: phone || null,
      clients: clientIds.length > 0 ? {
        create: clientIds.map((id) => ({
          clientId: Number(id),
          permissions: ["view_work_orders", "view_invoices", "request_intervention"],
        })),
      } : undefined,
    },
    include: { clients: { include: { client: true } } },
  });

  return NextResponse.json({ ok: true, manager });
}
