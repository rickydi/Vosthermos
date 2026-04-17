import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id, unitId } = await params;
  const body = await req.json();
  const data = {};
  if (body.code !== undefined) data.code = String(body.code).trim();
  if (body.description !== undefined) data.description = body.description || null;
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.isActive !== undefined) data.isActive = !!body.isActive;

  try {
    const unit = await prisma.clientUnit.update({
      where: { id: parseInt(unitId), clientId: parseInt(id) },
      data,
    });
    return NextResponse.json(unit);
  } catch (err) {
    if (err.code === "P2002") return NextResponse.json({ error: "Code deja existant" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id, unitId } = await params;
  // Soft delete: set isActive false (preserve links in work orders)
  const unit = await prisma.clientUnit.update({
    where: { id: parseInt(unitId), clientId: parseInt(id) },
    data: { isActive: false },
  });
  return NextResponse.json(unit);
}
