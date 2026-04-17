import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  calcTotals,
  getWorkOrderSettings,
  composeDateTime,
  computeDurationMinutes,
  flattenSectionsBody,
  attachSectionsAndItems,
} from "@/lib/work-order-utils";

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
      sections: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
            include: { product: { select: { id: true, sku: true, name: true } } },
          },
        },
      },
    },
  });

  if (!wo) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  const ser = (i) => ({
    ...i,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  });

  return NextResponse.json({
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
  });
}

export async function PUT(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const woId = parseInt(id);
  const existing = await prisma.workOrder.findUnique({ where: { id: woId } });
  if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  const body = await req.json();
  const settings = await getWorkOrderSettings();
  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = Number(body.laborHours) || 0;
  const totals = calcTotals(
    allForCalc,
    laborHours,
    settings.labor_rate_per_hour,
    settings.tps_rate,
    settings.tvq_rate,
  );

  const newDate = body.date ? new Date(body.date) : existing.date;
  const arrivalAt = body.heureArrivee !== undefined
    ? composeDateTime(newDate, body.heureArrivee)
    : existing.arrivalAt;
  const departureAt = body.heureDepart !== undefined
    ? composeDateTime(newDate, body.heureDepart)
    : existing.departureAt;

  const wo = await prisma.$transaction(async (tx) => {
    await tx.workOrderItem.deleteMany({ where: { workOrderId: woId } });
    await tx.workOrderSection.deleteMany({ where: { workOrderId: woId } });

    const updated = await tx.workOrder.update({
      where: { id: woId },
      data: {
        clientId: body.clientId ? parseInt(body.clientId) : existing.clientId,
        technicianId: body.technicianId !== undefined
          ? (body.technicianId ? parseInt(body.technicianId) : null)
          : existing.technicianId,
        appointmentId: body.appointmentId !== undefined
          ? (body.appointmentId ? parseInt(body.appointmentId) : null)
          : existing.appointmentId,
        date: newDate,
        arrivalAt,
        departureAt,
        durationMinutes: computeDurationMinutes(arrivalAt, departureAt),
        interventionAddress: body.interventionAddress ?? existing.interventionAddress,
        interventionCity: body.interventionCity ?? existing.interventionCity,
        interventionPostalCode: body.interventionPostalCode ?? existing.interventionPostalCode,
        description: body.description ?? existing.description,
        photos: body.photos ?? existing.photos,
        signatureUrl: body.signatureUrl ?? existing.signatureUrl,
        notes: body.notes ?? existing.notes,
        statut: body.statut || existing.statut,
        visibleAuClient: body.visibleAuClient ?? existing.visibleAuClient,
        ...totals,
      },
    });

    await attachSectionsAndItems(tx, updated.id, updated.clientId, flatItems, sections);

    return tx.workOrder.findUnique({
      where: { id: woId },
      include: {
        client: true,
        technician: { select: { id: true, name: true, phone: true } },
        items: { orderBy: { position: "asc" } },
        sections: {
          orderBy: { position: "asc" },
          include: { items: { orderBy: { position: "asc" } } },
        },
      },
    });
  });

  const ser = (i) => ({
    ...i,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  });

  return NextResponse.json({
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
  });
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  await prisma.workOrder.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
