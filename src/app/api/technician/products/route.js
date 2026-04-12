import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";

export async function GET(req) {
  try {
    await requireTech();
  } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q || q.length < 2) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, sku: true, name: true, price: true },
    take: 15,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products.map((p) => ({ ...p, price: Number(p.price) })));
}
