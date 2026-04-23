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
  if (body.buildingId !== undefined) data.buildingId = body.buildingId ? Number(body.buildingId) : null;
  if (body.code !== undefined) data.code = String(body.code).trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  const unit = await prisma.clientUnit.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json({ ok: true, unit });
}

export async function DELETE(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  // Soft delete pour préserver l'historique dans les WO
  await prisma.clientUnit.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
