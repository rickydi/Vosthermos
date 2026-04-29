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
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";

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
  const rebuildLines = body.items !== undefined || body.sections !== undefined;
  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = body.laborHours !== undefined
    ? Number(body.laborHours) || 0
    : (Number(existing.totalLabor) / Number(settings.labor_rate_per_hour) || 0);
  const totals = rebuildLines
    ? calcTotals(allForCalc, laborHours, settings.labor_rate_per_hour, settings.tps_rate, settings.tvq_rate)
    : {
        totalPieces: Number(existing.totalPieces),
        totalLabor: Number(existing.totalLabor),
        subtotal: Number(existing.subtotal),
        tps: Number(existing.tps),
        tvq: Number(existing.tvq),
        total: Number(existing.total),
      };

  const newDate = body.date ? new Date(body.date) : existing.date;
  const arrivalAt = body.heureArrivee !== undefined
    ? composeDateTime(newDate, body.heureArrivee)
    : existing.arrivalAt;
  const departureAt = body.heureDepart !== undefined
    ? composeDateTime(newDate, body.heureDepart)
    : existing.departureAt;

  const wo = await prisma.$transaction(async (tx) => {
    if (rebuildLines) {
      await tx.workOrderItem.deleteMany({ where: { workOrderId: woId } });
      await tx.workOrderSection.deleteMany({ where: { workOrderId: woId } });
    }

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

    if (rebuildLines) {
      await attachSectionsAndItems(tx, updated.id, updated.clientId, flatItems, sections);
    }

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

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder: wo, client: wo.client });
  } catch (err) {
    console.error("[work-orders] follow-up sync error:", err?.message || err);
  }

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
