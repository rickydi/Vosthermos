import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function serialize(s) {
  return { ...s, price: Number(s.price) };
}

export async function PUT(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json();
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.category !== undefined) data.category = body.category;
  if (body.price !== undefined) data.price = body.price;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isPreset !== undefined) data.isPreset = body.isPreset;
  if (body.position !== undefined) data.position = body.position;
  if (body.code !== undefined) data.code = body.code;

  const service = await prisma.service.update({
    where: { id: parseInt(id) },
    data,
  });
  return NextResponse.json(serialize(service));
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  // Soft-delete: mark inactive so referenced items keep integrity.
  await prisma.service.update({ where: { id: parseInt(id) }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
