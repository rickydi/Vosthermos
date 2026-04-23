import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
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
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  // Unités du bâtiment : on les détache (buildingId = null) plutôt que les supprimer
  await prisma.clientUnit.updateMany({
    where: { buildingId: Number(id) },
    data: { buildingId: null },
  });
  await prisma.building.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
