import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cache la reponse 60 secondes (CDN-friendly)
export const revalidate = 60;

export async function GET() {
  try {
    const now = new Date();
    const promo = await prisma.promotion.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    if (!promo) {
      return NextResponse.json({ promo: null }, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    return NextResponse.json(
      {
        promo: {
          title: promo.title,
          description: promo.description,
          bgColor: promo.bgColor,
          categorySlug: promo.category?.slug || null,
        },
      },
      {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      }
    );
  } catch {
    return NextResponse.json({ promo: null }, { status: 200 });
  }
}
