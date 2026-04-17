import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";

export async function GET(_req, { params }) {
  try { await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const units = await prisma.clientUnit.findMany({
    where: { clientId: parseInt(id), isActive: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, description: true },
  });
  return NextResponse.json(units);
}
