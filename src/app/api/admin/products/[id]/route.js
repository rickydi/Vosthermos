import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { parseMoneyOrNull, roundMoney } from "@/lib/money";

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: { orderBy: { position: "asc" } },
        category: { include: { parent: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Produit non trouve" }, { status: 404 });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.detailedDescription !== undefined) updateData.detailedDescription = data.detailedDescription;
    // parseFloat("20,50") vaut 20 : les cents etaient perdus en silence des que
    // le prix etait saisi avec une virgule. parseMoneyOrNull lit les deux graphies.
    if (data.price !== undefined) {
      const price = parseMoneyOrNull(data.price);
      if (price === null || price < 0) {
        return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
      }
      updateData.price = roundMoney(price);
    }
    if (data.compareAtPrice !== undefined) {
      const compareAt = parseMoneyOrNull(data.compareAtPrice);
      updateData.compareAtPrice = compareAt === null || compareAt <= 0 ? null : roundMoney(compareAt);
    }
    if (data.availability !== undefined) updateData.availability = data.availability;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn || null;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn || null;
    if (data.detailedDescriptionEn !== undefined) updateData.detailedDescriptionEn = data.detailedDescriptionEn || null;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ ...product, price: Number(product.price) });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
