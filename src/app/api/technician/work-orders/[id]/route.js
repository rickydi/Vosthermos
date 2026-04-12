import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import { calcTotals, getWorkOrderSettings } from "@/lib/work-order-utils";

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

export async function GET(_req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const wo = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: true,
      technician: { select: { id: true, name: true } },
      items: { orderBy: { position: "asc" }, include: { product: { select: { id: true, sku: true, name: true } } } },
    },
  });

  if (!wo || wo.technicianId !== session.id) {
    return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  }

  return NextResponse.json(serializeWO(wo));
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.workOrder.findUnique({ where: { id: parseInt(id) } });
  if (!existing || existing.technicianId !== session.id) {
    return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  }
  if (existing.statut === "sent") {
    return NextResponse.json({ error: "Ce bon a deja ete envoye" }, { status: 400 });
  }

  const body = await req.json();
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
  const totals = calcTotals(items, laborHours, settings.labor_rate_per_hour, settings.tps_rate, settings.tvq_rate);

  // Delete old items and recreate
  await prisma.workOrderItem.deleteMany({ where: { workOrderId: parseInt(id) } });

  const wo = await prisma.workOrder.update({
    where: { id: parseInt(id) },
    data: {
      clientId: body.clientId || existing.clientId,
      date: body.date ? new Date(body.date) : existing.date,
      heureArrivee: body.heureArrivee ?? existing.heureArrivee,
      heureDepart: body.heureDepart ?? existing.heureDepart,
      description: body.description ?? existing.description,
      photos: body.photos ?? existing.photos,
      signatureUrl: body.signatureUrl ?? existing.signatureUrl,
      notes: body.notes ?? existing.notes,
      statut: body.statut || existing.statut,
      ...totals,
      items: { create: items },
    },
    include: { client: true, items: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(serializeWO(wo));
}
