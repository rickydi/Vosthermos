import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "updated_desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = q ? {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ],
  } : {};

  const orderByMap = {
    updated_desc: { updatedAt: "desc" },
    updated_asc: { updatedAt: "asc" },
    created_desc: { createdAt: "desc" },
    created_asc: { createdAt: "asc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
    city_asc: { city: "asc" },
  };
  const orderBy = orderByMap[sort] || orderByMap.updated_desc;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { _count: { select: { workOrders: true } } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

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
