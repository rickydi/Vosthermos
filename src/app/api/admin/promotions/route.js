import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request) {
  try {
    await requireAdmin();
    const data = await request.json();

    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Titre, date debut et date fin requis" }, { status: 400 });
    }

    const promo = await prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type || "percent",
        value: parseFloat(data.value) || 0,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate + "T23:59:59"),
        bgColor: data.bgColor || "#e30718",
      },
    });

    return NextResponse.json(promo);
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
