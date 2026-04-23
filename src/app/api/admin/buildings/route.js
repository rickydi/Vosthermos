import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId requis" }, { status: 400 });

  const buildings = await prisma.building.findMany({
    where: { clientId: Number(clientId) },
    include: { _count: { select: { units: true } } },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(buildings);
}

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const { clientId, code, name, address, position } = body;
  if (!clientId || !code || !name) {
    return NextResponse.json({ error: "clientId, code et name requis" }, { status: 400 });
  }

  const existing = await prisma.building.findFirst({
    where: { clientId: Number(clientId), code: code.trim() },
  });
  if (existing) return NextResponse.json({ error: "Un bâtiment avec ce code existe déjà" }, { status: 400 });

  const building = await prisma.building.create({
    data: {
      clientId: Number(clientId),
      code: code.trim(),
      name: name.trim(),
      address: address?.trim() || null,
      position: position ?? 0,
    },
  });
  return NextResponse.json({ ok: true, building });
}
