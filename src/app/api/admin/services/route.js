import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function serialize(s) {
  return { ...s, price: Number(s.price) };
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const isPreset = searchParams.get("isPreset");

  const where = { isActive: true };
  if (category) where.category = category;
  if (isPreset === "true") where.isPreset = true;

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ category: "asc" }, { position: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(services.map(serialize));
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.code || !body.name || !body.category || body.price == null) {
    return NextResponse.json({ error: "code, name, category, price requis" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      code: body.code,
      name: body.name,
      category: body.category,
      price: body.price,
      description: body.description || null,
      isActive: body.isActive !== false,
      isPreset: !!body.isPreset,
      position: body.position || 0,
    },
  });
  return NextResponse.json(serialize(service));
}
