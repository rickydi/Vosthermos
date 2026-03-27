import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req) {
  try {
    await requireAdmin();
    const { items } = await req.json();

    // items = [{ id, order, parentId? }]
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items requis" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map(({ id, order }) =>
        prisma.category.update({ where: { id }, data: { order } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
