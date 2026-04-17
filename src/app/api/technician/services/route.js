import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";

export async function GET(req) {
  try { await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

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
  return NextResponse.json(services.map((s) => ({ ...s, price: Number(s.price) })));
}
