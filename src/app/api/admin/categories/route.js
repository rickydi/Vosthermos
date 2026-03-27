import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { products: true } },
        children: {
          include: { _count: { select: { products: true } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    const { name, slug, parentId, nameEn } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const finalSlug = slug?.trim() || name.trim().toLowerCase()
      .replace(/[éèêë]/g, "e").replace(/[àâä]/g, "a").replace(/[ùûü]/g, "u")
      .replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const maxOrder = await prisma.category.aggregate({
      where: { parentId: parentId || null },
      _max: { order: true },
    });

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        nameEn: nameEn?.trim() || null,
        slug: finalSlug,
        parentId: parentId || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ce slug existe deja" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
