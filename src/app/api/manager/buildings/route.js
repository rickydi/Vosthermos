import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { clientId, code, name, address } = body;
  if (!clientId || !code || !name) return NextResponse.json({ error: "clientId, code et name requis" }, { status: 400 });

  const mc = canAccessClient(manager, Number(clientId));
  if (!mc || !hasPermission(mc, "manage_units")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const existing = await prisma.building.findFirst({
    where: { clientId: Number(clientId), code: code.trim() },
  });
  if (existing) return NextResponse.json({ error: "Un bâtiment avec ce code existe déjà" }, { status: 400 });

  const maxPos = await prisma.building.aggregate({
    where: { clientId: Number(clientId) },
    _max: { position: true },
  });

  const building = await prisma.building.create({
    data: {
      clientId: Number(clientId),
      code: code.trim(),
      name: name.trim(),
      address: address?.trim() || null,
      position: (maxPos._max.position || 0) + 1,
    },
  });
  return NextResponse.json({ ok: true, building });
}
