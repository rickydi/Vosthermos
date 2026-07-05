import prisma from "@/lib/prisma";
import { getWorkOrderSettings } from "@/lib/work-order-utils";
import { documentPaymentSummary, resolveDocumentNumber } from "@/lib/vosthermos-document";

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

// Decompose un montant TTC en sous-total + TPS + TVQ dont la somme retombe
// EXACTEMENT sur le montant (la TVQ absorbe le cent d'arrondi residuel).
export function decomposeTtc(amountTtc, tpsRate, tvqRate) {
  const ttc = round2(amountTtc);
  const t1 = Number(tpsRate) || 0;
  const t2 = Number(tvqRate) || 0;
  const subtotal = round2(ttc / (1 + t1 + t2));
  const tps = round2(subtotal * t1);
  const tvq = round2(ttc - subtotal - tps);
  return { subtotal, tps, tvq, total: ttc };
}

function buildCreditNoteNumber(dateLike = new Date()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const d = isNaN(date.getTime()) ? new Date() : date;
  const pad = (value) => String(value).padStart(2, "0");
  return [
    "NC",
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    pad(d.getHours()),
    pad(d.getMinutes()),
  ].join("");
}

export async function generateCreditNoteNumber(db = prisma) {
  const now = new Date();
  for (let offset = 0; offset < 60; offset++) {
    const candidate = buildCreditNoteNumber(new Date(now.getTime() + offset * 60000));
    const existing = await db.creditNote.findUnique({
      where: { number: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return buildCreditNoteNumber(new Date(now.getTime() + 60 * 60000));
}

// Cree une note de credit (avoir pur) ou un recu de remboursement a partir
// d'un WorkOrder facture. Snapshot COMPLET : la note reste valable pour la
// comptable meme si le bon/facture est supprime ensuite.
//
// options:
//   amount        montant TTC a crediter/rembourser. Si absent ou egal au
//                 total de la facture -> montants figes de la facture ;
//                 sinon decomposition TTC (taux courants).
//   reason        raison affichee sur le document.
//   refundMethod  mode de remboursement ("Carte", "Comptant", ...). null =
//                 avoir pur (argent garde).
//   refundRef     n° de confirmation Moneris / reference du remboursement.
//   keepLink      false pour ne pas lier au WorkOrder (quand il va etre
//                 supprime dans la meme transaction).
export async function createCreditNoteFromWorkOrder(tx, workOrder, options = {}) {
  const db = tx || prisma;
  const settings = await getWorkOrderSettings();
  const woTotal = round2(workOrder.total);
  const requested = options.amount === undefined || options.amount === null
    ? null
    : round2(options.amount);

  if (requested !== null && (!Number.isFinite(requested) || requested <= 0)) {
    throw new Error("Montant de note de credit invalide");
  }

  let amounts;
  if (requested === null || Math.abs(requested - woTotal) <= 0.005) {
    amounts = {
      subtotal: round2(workOrder.subtotal),
      tps: round2(workOrder.tps),
      tvq: round2(workOrder.tvq),
      total: woTotal,
    };
  } else {
    amounts = decomposeTtc(requested, settings.tps_rate, settings.tvq_rate);
  }

  const number = await generateCreditNoteNumber(db);
  const refundMethod = String(options.refundMethod || "").trim() || null;

  return db.creditNote.create({
    data: {
      number,
      workOrderId: options.keepLink === false ? null : workOrder.id,
      invoiceNumber: resolveDocumentNumber(workOrder),
      clientId: workOrder.clientId ?? workOrder.client?.id ?? null,
      clientName: workOrder.client?.name || "Client",
      clientEmail: workOrder.client?.email || null,
      reason: String(options.reason || "").trim() || null,
      refundMethod,
      refundRef: refundMethod ? (String(options.refundRef || "").trim() || null) : null,
      subtotal: amounts.subtotal,
      tps: amounts.tps,
      tvq: amounts.tvq,
      total: amounts.total,
    },
  });
}

// Montant encaisse sur un WorkOrder (sert de defaut au remboursement et de
// plafond de validation).
export function workOrderPaidTotal(workOrder) {
  return round2(documentPaymentSummary(workOrder).paidTotal);
}

export function serializeCreditNote(creditNote) {
  if (!creditNote) return null;
  return {
    id: creditNote.id,
    number: creditNote.number,
    workOrderId: creditNote.workOrderId ?? null,
    invoiceNumber: creditNote.invoiceNumber,
    clientId: creditNote.clientId ?? null,
    clientName: creditNote.clientName,
    clientEmail: creditNote.clientEmail || null,
    reason: creditNote.reason || null,
    refundMethod: creditNote.refundMethod || null,
    refundRef: creditNote.refundRef || null,
    isRefund: Boolean(creditNote.refundMethod),
    subtotal: round2(creditNote.subtotal),
    tps: round2(creditNote.tps),
    tvq: round2(creditNote.tvq),
    total: round2(creditNote.total),
    issuedAt: creditNote.issuedAt instanceof Date
      ? creditNote.issuedAt.toISOString()
      : (creditNote.issuedAt || null),
    createdAt: creditNote.createdAt instanceof Date
      ? creditNote.createdAt.toISOString()
      : (creditNote.createdAt || null),
  };
}
