import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import { generateWorkOrderNumber, calcTotals, getWorkOrderSettings } from "@/lib/work-order-utils";

function serializeWO(wo) {
  return {
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items?.map((i) => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
  };
}

export async function GET(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const dateFilter = searchParams.get("date");

  const where = { technicianId: session.id };
  if (dateFilter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    where.date = { gte: today, lt: tomorrow };
  }

  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, address: true, city: true, phone: true } },
      items: { orderBy: { position: "asc" } },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(workOrders.map(serializeWO));
}

export async function POST(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const number = await generateWorkOrderNumber();
  const settings = await getWorkOrderSettings();

  const items = (body.items || []).map((item, i) => ({
    productId: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: Math.round(Number(item.quantity) * Number(item.unitPrice) * 100) / 100,
    itemType: item.itemType || "piece",
    position: i,
  }));

  const laborHours = body.laborHours || 0;
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
      clientId: body.clientId,
      technicianId: session.id,
      date: body.date ? new Date(body.date) : new Date(),
      heureArrivee: body.heureArrivee || null,
      heureDepart: body.heureDepart || null,
      description: body.description || null,
      photos: body.photos || [],
      notes: body.notes || null,
      statut: "draft",
      ...totals,
      items: { create: items },
    },
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
    },
  });

  return NextResponse.json(serializeWO(workOrder));
}
