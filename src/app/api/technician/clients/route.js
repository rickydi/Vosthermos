import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";

export async function GET(req) {
  try {
    await requireTech();
  } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const clients = await prisma.client.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ],
    } : {},
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(clients);
}

export async function POST(req) {
  try {
    await requireTech();
  } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      company: body.company || null,
      address: body.address || null,
      city: body.city || null,
      province: body.province || "QC",
      postalCode: body.postalCode || null,
      phone: body.phone || null,
      email: body.email || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(client);
}
