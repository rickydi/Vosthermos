import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  generateWorkOrderNumber,
  calcTotals,
  getWorkOrderSettings,
  DEFAULT_LABOR_RATE,
  composeDateTime,
  computeDurationMinutes,
  flattenSectionsBody,
  attachSectionsAndItems,
  withWorkOrderNumberRetry,
} from "@/lib/work-order-utils";
import { createOrTouchFollowUpFromWorkOrder, getSavedFollowUpColumns } from "@/lib/follow-up-utils";
import { followUpColumnMeta, followUpStatusFromWorkOrderStatut, workOrderStatutFromFollowUpStatus } from "@/lib/follow-up-columns";
import { parseDateOnly } from "@/lib/date-only";
import { logAdminActivity } from "@/lib/admin-activity";
import { buildPaymentTrackingData, serializePaymentWorkOrder } from "@/lib/payment-tracking";
import { clampInt } from "@/lib/api-utils";
import { INVOICE_STATUSES, QUOTE_STATUSES, WORK_ORDER_STATUSES, isInvoiceStatus, isQuoteStatus } from "@/lib/work-order-document";
import { normalizeQuoteDepositPercent, normalizeQuotePaymentSchedule } from "@/lib/vosthermos-document";

async function validateFollowUpForClient(followUpId, clientId) {
  if (!followUpId) return null;
  const followUp = await prisma.clientFollowUp.findFirst({
    where: { id: followUpId, clientId },
    select: { id: true },
  });
  if (!followUp) throw new Error("Le suivi choisi n'appartient pas a ce client");
  return followUp.id;
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut");
  const documentType = searchParams.get("documentType");
  const paymentState = searchParams.get("paymentState");
  const techId = searchParams.get("technicianId");
  const q = searchParams.get("q") || "";
  const page = clampInt(searchParams.get("page"), 1, { min: 1, max: 100000 });
  const limit = clampInt(searchParams.get("limit"), 50, { min: 1, max: 200 });

  const where = {};
  if (statut) {
    where.statut = statut;
  } else if (documentType === "quote") {
    where.statut = { in: [...QUOTE_STATUSES] };
  } else if (documentType === "invoice") {
    where.statut = { in: [...INVOICE_STATUSES] };
  } else if (documentType === "work_order") {
    where.statut = { in: [...WORK_ORDER_STATUSES] };
  }
  if (techId) where.technicianId = parseInt(techId);
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q } } },
      { client: { secondaryPhone: { contains: q } } },
    ];
  }

  const [workOrders, total, followUpColumns] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true, secondaryPhone: true, address: true, city: true, paymentTermsDays: true } },
        technician: { select: { id: true, name: true } },
        route: { select: { id: true, name: true, date: true, area: true } },
        payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workOrder.count({ where }),
    getSavedFollowUpColumns(),
  ]);

  let serializedWorkOrders = workOrders.map((wo) => {
    const followUpStatus = followUpStatusFromWorkOrderStatut(wo.statut, followUpColumns);
    const followUpStatusMeta = followUpColumnMeta(followUpColumns, followUpStatus);
    return {
      ...serializePaymentWorkOrder(wo),
      followUpStatus,
      followUpStatusLabel: followUpStatusMeta.label,
      followUpStatusIcon: followUpStatusMeta.icon,
      followUpStatusTone: followUpStatusMeta.tone,
    };
  });

  if (paymentState === "open") {
    serializedWorkOrders = serializedWorkOrders.filter((wo) => ["receivable", "overdue"].includes(wo.paymentState));
  } else if (paymentState === "partial") {
    serializedWorkOrders = serializedWorkOrders.filter((wo) => wo.hasPartialPayments && wo.paymentState !== "paid");
  } else if (["receivable", "overdue", "paid"].includes(paymentState)) {
    serializedWorkOrders = serializedWorkOrders.filter((wo) => wo.paymentState === paymentState);
  }

  const responseTotal = paymentState ? serializedWorkOrders.length : total;

  return NextResponse.json({
    workOrders: serializedWorkOrders,
    total: responseTotal,
    page,
    pages: Math.ceil(responseTotal / limit),
  });
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.clientId) return NextResponse.json({ error: "Client requis" }, { status: 400 });
  const clientId = parseInt(body.clientId);
  const clientForPayment = await prisma.client.findUnique({
    where: { id: clientId },
    select: { paymentTermsDays: true },
  });
  const requestedFollowUpId = body.followUpId ? parseInt(body.followUpId) : null;
  let followUpId = null;
  try {
    followUpId = await validateFollowUpForClient(requestedFollowUpId, clientId);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const settings = await getWorkOrderSettings();
  const followUpColumns = body.followUpStatus ? await getSavedFollowUpColumns() : null;
  const explicitStatut = typeof body.statut === "string" && body.statut.trim() ? body.statut.trim() : null;
  const followUpStatut = body.followUpStatus
    ? workOrderStatutFromFollowUpStatus(body.followUpStatus, followUpColumns)
    : null;
  const explicitDocumentStatut = isQuoteStatus(explicitStatut) || isInvoiceStatus(explicitStatut);
  const statut = explicitDocumentStatut ? explicitStatut : followUpStatut || explicitStatut || "draft";
  const quoteDepositPercent = normalizeQuoteDepositPercent(body.quoteDepositPercent);
  if (quoteDepositPercent === undefined) {
    return NextResponse.json({ error: "Pourcentage d'acompte invalide" }, { status: 400 });
  }
  const quotePaymentSchedule = normalizeQuotePaymentSchedule(body.quotePaymentSchedule);
  if (quotePaymentSchedule === undefined) {
    return NextResponse.json({ error: "Echeancier de paiement invalide: le total doit faire 100 %" }, { status: 400 });
  }

  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = Number(body.laborHours) || 0;
  const laborRate = Number(body.laborRate ?? settings.labor_rate_per_hour) || DEFAULT_LABOR_RATE;
  const totals = calcTotals(
    allForCalc,
    laborHours,
    laborRate,
    settings.tps_rate,
    settings.tvq_rate
  );

  const woDate = body.date ? parseDateOnly(body.date) : new Date();
  const arrivalAt = composeDateTime(woDate, body.heureArrivee);
  const departureAt = composeDateTime(woDate, body.heureDepart);
  const paymentTracking = buildPaymentTrackingData({
    statut,
    client: clientForPayment,
    invoiceDate: woDate,
  });

  const workOrder = await withWorkOrderNumberRetry(() => prisma.$transaction(async (tx) => {
    const number = await generateWorkOrderNumber(tx);
    const created = await tx.workOrder.create({
      data: {
        number,
        clientId,
        followUpId,
        technicianId: body.technicianId ? parseInt(body.technicianId) : null,
        appointmentId: body.appointmentId ? parseInt(body.appointmentId) : null,
        date: woDate,
        arrivalAt,
        departureAt,
        durationMinutes: computeDurationMinutes(arrivalAt, departureAt),
        interventionAddress: body.interventionAddress || null,
        interventionCity: body.interventionCity || null,
        interventionPostalCode: body.interventionPostalCode || null,
        description: body.description || null,
        photos: body.photos || [],
        notes: body.notes || null,
        statut,
        visibleAuClient: body.visibleAuClient ?? true,
        quoteDepositPercent,
        quotePaymentSchedule,
        laborRate,
        ...totals,
        ...paymentTracking,
      },
    });
    await attachSectionsAndItems(tx, created.id, clientId, flatItems, sections);
    return tx.workOrder.findUnique({
      where: { id: created.id },
      include: {
        client: true,
        items: { orderBy: { position: "asc" } },
        sections: {
          orderBy: { position: "asc" },
          include: { items: { orderBy: { position: "asc" } } },
        },
      },
    });
  }));

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder, client: workOrder.client, followUpStatus: body.followUpStatus });
  } catch (err) {
    console.error("[work-orders] follow-up sync error:", err?.message || err);
  }

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "work_order",
    entityId: workOrder.id,
    label: `Bon cree: ${workOrder.number}`,
    metadata: {
      number: workOrder.number,
      clientId: workOrder.clientId,
      clientName: workOrder.client?.name,
      status: workOrder.statut,
      total: Number(workOrder.total),
    },
  });

  return NextResponse.json({
    ...workOrder,
    total: Number(workOrder.total),
    subtotal: Number(workOrder.subtotal),
    totalPieces: Number(workOrder.totalPieces),
    totalLabor: Number(workOrder.totalLabor),
    laborRate: Number(workOrder.laborRate),
    quoteDepositPercent: workOrder.quoteDepositPercent === null ? null : Number(workOrder.quoteDepositPercent),
    quotePaymentSchedule: workOrder.quotePaymentSchedule || null,
    items: (workOrder.items || []).filter((item) => !item.sectionId).map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    sections: (workOrder.sections || []).map((section) => ({
      ...section,
      items: (section.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    })),
  });
}
