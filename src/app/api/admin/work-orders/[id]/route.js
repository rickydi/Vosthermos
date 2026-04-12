import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const wo = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: true,
      technician: { select: { id: true, name: true, phone: true } },
      items: {
        orderBy: { position: "asc" },
        include: { product: { select: { id: true, sku: true, name: true } } },
      },
    },
  });

  if (!wo) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  return NextResponse.json({
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map((i) => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
  });
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  await prisma.workOrder.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
