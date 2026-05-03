import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  calcTotals,
  calcTotalsFromPieces,
  getWorkOrderSettings,
  DEFAULT_LABOR_RATE,
  composeDateTime,
  computeDurationMinutes,
  flattenSectionsBody,
  attachSectionsAndItems,
} from "@/lib/work-order-utils";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { parseDateOnly } from "@/lib/date-only";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";

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
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
  });
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const woId = parseInt(id);
  const existing = await prisma.workOrder.findUnique({ where: { id: woId } });
  if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  const body = await req.json();
  const settings = await getWorkOrderSettings();
  const rebuildLines = body.items !== undefined || body.sections !== undefined;
  const shouldRecalcTotals = rebuildLines || body.laborHours !== undefined || body.laborRate !== undefined;
  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const existingLaborRate = Number(existing.laborRate) || Number(settings.labor_rate_per_hour) || DEFAULT_LABOR_RATE;
  const laborRate = body.laborRate !== undefined
    ? (Number(body.laborRate) || existingLaborRate)
    : existingLaborRate;
  const laborHours = body.laborHours !== undefined
    ? Number(body.laborHours) || 0
    : (Number(existing.totalLabor) / laborRate || 0);
  const totals = rebuildLines
    ? calcTotals(allForCalc, laborHours, laborRate, settings.tps_rate, settings.tvq_rate)
    : shouldRecalcTotals
      ? calcTotalsFromPieces(existing.totalPieces, laborHours, laborRate, settings.tps_rate, settings.tvq_rate)
      : {
        totalPieces: Number(existing.totalPieces),
        totalLabor: Number(existing.totalLabor),
        subtotal: Number(existing.subtotal),
        tps: Number(existing.tps),
        tvq: Number(existing.tvq),
        total: Number(existing.total),
      };

  const newDate = body.date ? parseDateOnly(body.date, existing.date) : existing.date;
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
        laborRate,
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

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "work_order",
    entityId: wo.id,
    label: `Bon modifie: ${wo.number}`,
    metadata: {
      number: wo.number,
      changedFields: changedFields(existing, wo, [
        "clientId", "technicianId", "appointmentId", "date", "interventionAddress",
        "interventionCity", "description", "notes", "statut", "visibleAuClient",
      ]),
      statusFrom: existing.statut,
      statusTo: wo.statut,
      total: Number(wo.total),
    },
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
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
  });
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, number: true, clientId: true, total: true, statut: true },
  });
  await prisma.workOrder.delete({ where: { id: parseInt(id) } });
  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "work_order",
    entityId: id,
    label: `Bon supprime: ${existing?.number || id}`,
    metadata: {
      number: existing?.number,
      clientId: existing?.clientId,
      status: existing?.statut,
      total: existing?.total === undefined || existing?.total === null ? null : Number(existing.total),
    },
  });
  return NextResponse.json({ ok: true });
}
