import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut");
  const techId = searchParams.get("technicianId");
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = {};
  if (statut) where.statut = statut;
  if (techId) where.technicianId = parseInt(techId);
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q } } },
    ];
  }

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true, address: true, city: true } },
        technician: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({
    workOrders: workOrders.map((wo) => ({
      ...wo,
      total: Number(wo.total),
      subtotal: Number(wo.subtotal),
      totalPieces: Number(wo.totalPieces),
      totalLabor: Number(wo.totalLabor),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
