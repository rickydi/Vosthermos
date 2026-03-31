import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = parseInt(searchParams.get("limit") || "8");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: limit,
    orderBy: { sku: "asc" },
  });

  return NextResponse.json(products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    images: p.images,
  })));
}
