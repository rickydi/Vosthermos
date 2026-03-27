import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const data = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.nameEn !== undefined) data.nameEn = body.nameEn?.trim() || null;
    if (body.slug !== undefined) data.slug = body.slug.trim();

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error.code === "P2002") return NextResponse.json({ error: "Ce slug existe deja" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const catId = parseInt(id);

    const cat = await prisma.category.findUnique({
      where: { id: catId },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!cat) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    if (cat._count.products > 0) {
      return NextResponse.json({ error: "Impossible de supprimer: cette categorie contient des produits" }, { status: 400 });
    }
    if (cat._count.children > 0) {
      return NextResponse.json({ error: "Impossible de supprimer: cette categorie contient des sous-categories" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: catId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
