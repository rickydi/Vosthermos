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
import { createOrTouchFollowUpFromWorkOrder, getSavedFollowUpColumns } from "@/lib/follow-up-utils";
import { workOrderStatutFromFollowUpStatus } from "@/lib/follow-up-columns";
import { parseDateOnly } from "@/lib/date-only";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";
import { buildPaymentTrackingData } from "@/lib/payment-tracking";
import { staleUpdateResponse } from "@/lib/optimistic-lock";
import { publishAdminEvent } from "@/lib/event-bus";
import { isInvoiceStatus, isQuoteStatus } from "@/lib/work-order-document";
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

async function latestClientFollowUp(clientId, followUpId) {
  if (followUpId) {
    const linked = await prisma.clientFollowUp.findUnique({
      where: { id: followUpId },
      select: { id: true, status: true, title: true },
    });
    if (linked) return linked;
  }

  if (!clientId) return null;
  return prisma.clientFollowUp.findFirst({
    where: {
      clientId,
      status: { not: "archived" },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true, title: true },
  });
}

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
      payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
    },
  });

  if (!wo) return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  const followUp = await latestClientFollowUp(wo.clientId, wo.followUpId);

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
    quoteDepositPercent: wo.quoteDepositPercent === null ? null : Number(wo.quoteDepositPercent),
    quotePaymentSchedule: wo.quotePaymentSchedule || null,
    payments: (wo.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: wo.items.filter((item) => !item.sectionId).map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
    followUp,
    followUpStatus: followUp?.status || null,
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

  // Verrou optimiste: refuse d'ecraser si un collegue a sauvegarde entre-temps.
  const conflict = await staleUpdateResponse({
    expected: body.expectedUpdatedAt,
    current: existing.updatedAt,
    entityType: "work_order",
    entityId: woId,
    actorEmail: session.email,
  });
  if (conflict) return conflict;

  const nextClientId = body.clientId ? parseInt(body.clientId) : existing.clientId;
  let nextFollowUpId = existing.followUpId;
  if (body.followUpId !== undefined) {
    const requestedFollowUpId = body.followUpId ? parseInt(body.followUpId) : null;
    try {
      nextFollowUpId = await validateFollowUpForClient(requestedFollowUpId, nextClientId);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }
  const settings = await getWorkOrderSettings();
  const followUpColumns = body.followUpStatus ? await getSavedFollowUpColumns() : null;
  const explicitStatut = typeof body.statut === "string" && body.statut.trim() ? body.statut.trim() : null;
  const followUpStatut = body.followUpStatus
    ? workOrderStatutFromFollowUpStatus(body.followUpStatus, followUpColumns)
    : null;
  const explicitDocumentStatut = isQuoteStatus(explicitStatut) || isInvoiceStatus(explicitStatut);
  const statut = explicitDocumentStatut ? explicitStatut : followUpStatut || explicitStatut || existing.statut;
  const quoteDepositPercent = body.quoteDepositPercent !== undefined
    ? normalizeQuoteDepositPercent(body.quoteDepositPercent)
    : existing.quoteDepositPercent;
  if (quoteDepositPercent === undefined) {
    return NextResponse.json({ error: "Pourcentage d'acompte invalide" }, { status: 400 });
  }
  const quotePaymentSchedule = body.quotePaymentSchedule !== undefined
    ? normalizeQuotePaymentSchedule(body.quotePaymentSchedule)
    : existing.quotePaymentSchedule;
  if (quotePaymentSchedule === undefined) {
    return NextResponse.json({ error: "Echeancier de paiement invalide: le total doit faire 100 %" }, { status: 400 });
  }
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
  const clientForPayment = await prisma.client.findUnique({
    where: { id: nextClientId },
    select: { paymentTermsDays: true },
  });
  const paymentTracking = buildPaymentTrackingData({
    statut,
    existing,
    client: clientForPayment,
    invoiceDate: newDate,
  });

  const wo = await prisma.$transaction(async (tx) => {
    if (rebuildLines) {
      await tx.workOrderItem.deleteMany({ where: { workOrderId: woId } });
      await tx.workOrderSection.deleteMany({ where: { workOrderId: woId } });
    }

    const updated = await tx.workOrder.update({
      where: { id: woId },
      data: {
        clientId: nextClientId,
        followUpId: nextFollowUpId,
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
        statut,
        visibleAuClient: body.visibleAuClient ?? existing.visibleAuClient,
        quoteDepositPercent,
        quotePaymentSchedule,
        laborRate,
        ...totals,
        ...paymentTracking,
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
        payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
      },
    });
  });

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder: wo, client: wo.client, followUpStatus: body.followUpStatus });
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
        "interventionCity", "description", "notes", "statut", "followUpId", "visibleAuClient",
        "quoteDepositPercent", "quotePaymentSchedule", "invoiceIssuedAt", "paymentDueAt", "paidAt",
      ]),
      statusFrom: existing.statut,
      statusTo: wo.statut,
      total: Number(wo.total),
    },
  });

  publishAdminEvent({
    type: "work_order.changed",
    entityType: "work_order",
    entityId: wo.id,
    clientId: wo.clientId,
    actor: session.id,
    origin: req.headers.get("x-admin-tab") || undefined,
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
    quoteDepositPercent: wo.quoteDepositPercent === null ? null : Number(wo.quoteDepositPercent),
    quotePaymentSchedule: wo.quotePaymentSchedule || null,
    payments: (wo.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: wo.items.filter((item) => !item.sectionId).map(ser),
    sections: wo.sections.map((s) => ({ ...s, items: s.items.map(ser) })),
  });
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: { select: { id: true, name: true, email: true } },
      payments: true,
    },
  });
  if (!existing) return NextResponse.json({ error: "Bon introuvable" }, { status: 404 });

  // Garde-fou comptable : impossible d'effacer une facture avec de l'argent
  // encaisse sans laisser de trace. L'admin doit choisir : note de credit
  // (argent garde) ou remboursement (argent rendu). La note snapshot tout ce
  // qu'il faut pour la comptable avant la suppression.
  const { workOrderPaidTotal, createCreditNoteFromWorkOrder, serializeCreditNote } = await import("@/lib/credit-note");
  const paidTotal = workOrderPaidTotal({
    ...existing,
    total: Number(existing.total || 0),
    payments: (existing.payments || []).map((payment) => ({ ...payment, amount: Number(payment.amount || 0) })),
  });
  const body = await req.json().catch(() => ({}));
  const resolution = body?.resolution && typeof body.resolution === "object" ? body.resolution : null;

  let creditNote = null;
  if (paidTotal > 0.005) {
    if (!resolution || !["credit", "refund"].includes(resolution.type)) {
      return NextResponse.json({
        requiresResolution: true,
        number: existing.number,
        clientName: existing.client?.name || "Client",
        paidTotal,
        error: "Cette facture a des paiements inscrits: choisir note de credit ou remboursement.",
      }, { status: 409 });
    }

    const isRefund = resolution.type === "refund";
    creditNote = await prisma.$transaction(async (tx) => {
      const note = await createCreditNoteFromWorkOrder(tx, {
        ...existing,
        total: Number(existing.total || 0),
        subtotal: Number(existing.subtotal || 0),
        tps: Number(existing.tps || 0),
        tvq: Number(existing.tvq || 0),
      }, {
        // On credite/rembourse ce qui a ete ENCAISSE (la facture disparait des
        // rapports avec le bon ; la note trace l'argent recu puis annule).
        amount: paidTotal,
        reason: isRefund
          ? `Remboursement - facture ${existing.number} supprimee`
          : `Facture ${existing.number} supprimee - montant garde en credit`,
        refundMethod: isRefund ? (String(resolution.method || "").trim() || "Autre") : null,
        refundRef: isRefund ? resolution.ref : null,
        keepLink: false,
      });
      await tx.workOrder.delete({ where: { id: existing.id } });
      return note;
    });
  } else {
    await prisma.workOrder.delete({ where: { id: existing.id } });
  }

  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "work_order",
    entityId: id,
    label: `Bon supprime: ${existing.number || id}`,
    metadata: {
      number: existing.number,
      clientId: existing.clientId,
      status: existing.statut,
      total: existing.total === undefined || existing.total === null ? null : Number(existing.total),
      paidTotal,
      creditNote: creditNote?.number || null,
      creditNoteType: creditNote ? (creditNote.refundMethod ? "refund" : "credit") : null,
    },
  });
  return NextResponse.json({ ok: true, creditNote: creditNote ? serializeCreditNote(creditNote) : null });
}
