import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { generateWorkOrderNumber, calcTotals, getWorkOrderSettings } from "@/lib/work-order-utils";

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

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.clientId) return NextResponse.json({ error: "Client requis" }, { status: 400 });

  const number = await generateWorkOrderNumber();
  const settings = await getWorkOrderSettings();

  const items = (body.items || []).map((item, i) => ({
    productId: item.productId || null,
    description: item.description || "",
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    totalPrice: Math.round(Number(item.quantity || 0) * Number(item.unitPrice || 0) * 100) / 100,
    itemType: item.itemType || "piece",
    position: i,
  }));

  const laborHours = Number(body.laborHours) || 0;
  const totals = calcTotals(
    items,
    laborHours,
    settings.labor_rate_per_hour,
    settings.tps_rate,
    settings.tvq_rate
  );

  const workOrder = await prisma.workOrder.create({
    data: {
      number,
      clientId: parseInt(body.clientId),
      technicianId: body.technicianId ? parseInt(body.technicianId) : null,
      date: body.date ? new Date(body.date) : new Date(),
      heureArrivee: body.heureArrivee || null,
      heureDepart: body.heureDepart || null,
      description: body.description || null,
      photos: body.photos || [],
      notes: body.notes || null,
      statut: body.statut || "draft",
      ...totals,
      items: { create: items },
    },
    include: { client: true, items: true },
  });

  return NextResponse.json({
    ...workOrder,
    total: Number(workOrder.total),
    subtotal: Number(workOrder.subtotal),
    totalPieces: Number(workOrder.totalPieces),
    totalLabor: Number(workOrder.totalLabor),
  });
}
