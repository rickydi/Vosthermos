import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

async function authorize(id, manager) {
  const building = await prisma.building.findUnique({
    where: { id: Number(id) },
    select: { clientId: true },
  });
  if (!building) return { error: "Bâtiment introuvable", status: 404 };
  const mc = canAccessClient(manager, building.clientId);
  if (!mc || !hasPermission(mc, "manage_units")) {
    return { error: "Permission refusée", status: 403 };
  }
  return { building };
}

export async function PUT(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const data = {};
  if (body.code !== undefined) data.code = String(body.code).trim();
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.address !== undefined) data.address = body.address?.trim() || null;
  if (body.position !== undefined) data.position = Number(body.position);

  const building = await prisma.building.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json({ ok: true, building });
}

export async function DELETE(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Détacher les unités avant de supprimer
  await prisma.clientUnit.updateMany({
    where: { buildingId: Number(id) },
    data: { buildingId: null },
  });
  await prisma.building.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
