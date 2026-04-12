import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json();
  const data = {
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    isActive: body.isActive ?? true,
  };

  if (body.pin && body.pin.length === 4 && /^\d{4}$/.test(body.pin)) {
    data.pin = await bcrypt.hash(body.pin, 10);
  }

  const tech = await prisma.technician.update({ where: { id: parseInt(id) }, data });
  return NextResponse.json(tech);
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  await prisma.technician.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
