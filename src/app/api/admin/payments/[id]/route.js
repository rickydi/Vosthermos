import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { sendInvoicePaymentUpdateEmail, sendPaidInvoiceEmail } from "@/lib/paid-invoice-email";
import { documentPaymentSummary } from "@/lib/vosthermos-document";
import { scopeWorkOrderThroughPayment } from "@/lib/payment-snapshot";
import {
  buildPaymentTrackingData,
  isOpenPaymentStatus,
  parsePaymentDateInput,
  roundMoney,
  serializePaymentWorkOrder,
} from "@/lib/payment-tracking";

function cleanText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function parseMoneyInput(value) {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, "");
  const amount = roundMoney(Number(normalized));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Montant de paiement invalide");
  }
  return amount;
}

function includePaymentRelations() {
  return {
    client: {
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        secondaryPhone: true,
        email: true,
        city: true,
        paymentTermsDays: true,
      },
    },
    technician: { select: { id: true, name: true } },
    followUp: { select: { id: true, title: true, status: true } },
    payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
    creditNotes: { orderBy: [{ issuedAt: "asc" }, { id: "asc" }] },
  };
}

function includeFullWorkOrder() {
  return {
    client: true,
    technician: { select: { name: true } },
    items: {
      orderBy: { position: "asc" },
      include: { product: { select: { sku: true, name: true } } },
    },
    sections: {
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
          include: { product: { select: { sku: true, name: true } } },
        },
      },
    },
    payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
  };
}

function openStatusFromBody(body, existing) {
  if (isOpenPaymentStatus(body.statut)) return body.statut;
  return existing.invoiceSentAt ? "sent" : "invoiced";
}

function paymentMethodFromBody(body, existing) {
  return cleanText(body.paymentMethod ?? body.method) ?? existing.paymentMethod ?? "Interac";
}

function paymentNoteFromBody(body, fallback = undefined) {
  const note = cleanText(body.paymentNotes ?? body.note);
  return note === undefined ? fallback : note;
}

function paymentReferenceFromBody(body) {
  return cleanText(body.reference ?? body.monerisRef) ?? null;
}

function paymentClientKeyFromBody(body) {
  const key = cleanText(body.clientKey);
  return key ? key.slice(0, 64) : null;
}

async function fetchPaymentWorkOrder(workOrderId) {
  return prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: includePaymentRelations(),
  });
}

async function fetchFullWorkOrder(workOrderId) {
  return prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: includeFullWorkOrder(),
  });
}

function remainingBalance(workOrder) {
  const summary = documentPaymentSummary({ ...workOrder, statut: isOpenPaymentStatus(workOrder.statut) ? workOrder.statut : "invoiced", paidAt: null });
  return roundMoney(Number(workOrder.total || 0) - Number(summary.paidTotal || 0));
}

async function syncFollowUp(workOrder) {
  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder, client: workOrder.client });
  } catch (err) {
    console.error("[payments] follow-up sync error:", err?.message || err);
  }
}

async function addPaymentAndRecompute(tx, existing, body) {
  const amount = parseMoneyInput(body.amount);
  const paidAt = parsePaymentDateInput(body.paidAt, new Date()) || new Date();
  const method = paymentMethodFromBody(body, existing);
  const note = paymentNoteFromBody(body, null);
  const reference = paymentReferenceFromBody(body);
  const clientKey = paymentClientKeyFromBody(body);

  // Idempotence: un double-clic renvoie le meme clientKey -> le depot n'est
  // inscrit qu'une fois (la contrainte unique en DB reste le filet de secours).
  if (clientKey) {
    const duplicate = await tx.workOrderPayment.findUnique({
      where: { clientKey },
      select: { id: true },
    });
    if (duplicate) return;
  }

  const before = await tx.workOrder.findUnique({
    where: { id: existing.id },
    include: { client: true, payments: true },
  });
  const balanceBefore = remainingBalance(before);
  if (amount > balanceBefore + 0.005) {
    throw new Error(`Le montant depasse le solde restant (${balanceBefore.toFixed(2)}$)`);
  }

  await tx.workOrderPayment.create({
    data: {
      workOrderId: existing.id,
      amount,
      method,
      reference,
      note,
      clientKey,
      paidAt,
    },
  });

  const current = await tx.workOrder.findUnique({
    where: { id: existing.id },
    include: { client: true, payments: true },
  });
  const balance = remainingBalance(current);
  const data = {
    paymentMethod: method,
    paymentNotes: note ?? current.paymentNotes,
  };

  if (balance <= 0.005 && isOpenPaymentStatus(current.statut)) {
    Object.assign(data, {
      ...buildPaymentTrackingData({
        statut: "paid",
        existing: current,
        client: current.client,
        invoiceDate: current.invoiceIssuedAt || current.date,
        now: paidAt,
      }),
      statut: "paid",
      paidAt,
    });
  }

  await tx.workOrder.update({ where: { id: existing.id }, data });
}

async function markPaidWithFinalPayment(tx, existing, body) {
  const paidAt = parsePaymentDateInput(body.paidAt, new Date()) || new Date();
  const method = paymentMethodFromBody(body, existing);
  const note = paymentNoteFromBody(body, existing.paymentNotes) ?? "Paiement final";
  const reference = paymentReferenceFromBody(body);
  const current = await tx.workOrder.findUnique({
    where: { id: existing.id },
    include: { client: true, payments: true },
  });
  const balance = remainingBalance(current);

  if (balance > 0.005) {
    await tx.workOrderPayment.create({
      data: {
        workOrderId: existing.id,
        amount: balance,
        method,
        reference,
        note,
        clientKey: paymentClientKeyFromBody(body),
        paidAt,
      },
    });
  }

  await tx.workOrder.update({
    where: { id: existing.id },
    data: {
      ...buildPaymentTrackingData({
        statut: "paid",
        existing: current,
        client: current.client,
        invoiceDate: current.invoiceIssuedAt || current.date,
        now: paidAt,
      }),
      statut: "paid",
      paidAt,
      paymentMethod: method,
      paymentNotes: note,
    },
  });
}

async function deletePaymentAndRecompute(tx, existing, body) {
  const paymentId = Number(body.paymentId);
  if (!Number.isInteger(paymentId) || paymentId <= 0) throw new Error("Paiement introuvable");

  const payment = await tx.workOrderPayment.findFirst({
    where: { id: paymentId, workOrderId: existing.id },
    select: { id: true },
  });
  if (!payment) throw new Error("Paiement introuvable");

  await tx.workOrderPayment.delete({ where: { id: payment.id } });
  const current = await tx.workOrder.findUnique({
    where: { id: existing.id },
    include: { client: true, payments: true },
  });
  const balance = remainingBalance(current);
  const data = {};
  if ((current.payments || []).length === 0) {
    data.paymentMethod = null;
  }
  // Ne repasser en "a payer" que les documents factures : retirer le depot
  // d'une soumission acceptee ne doit pas la transformer en facture.
  if (balance > 0.005 && (isOpenPaymentStatus(current.statut) || current.statut === "paid")) {
    const statut = openStatusFromBody(body, current);
    Object.assign(data, {
      ...buildPaymentTrackingData({
        statut,
        existing: current,
        client: current.client,
        invoiceDate: current.invoiceIssuedAt || current.date,
      }),
      statut,
      paidAt: null,
    });
  }
  if (Object.keys(data).length > 0) {
    await tx.workOrder.update({ where: { id: existing.id }, data });
  }
}

export async function PATCH(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  // try/catch global: toute erreur non geree doit sortir en JSON (une page
  // HTML 500 fait planter le parse cote client, surtout iOS Safari).
  try {
  const { id } = await params;
  const workOrderId = Number(id);
  const body = await req.json().catch(() => ({}));

  const existing = await fetchPaymentWorkOrder(workOrderId);
  if (!existing) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  let activityLabel = `Paiement modifie: ${existing.number}`;
  let updated;

  try {
    if (body.action === "add-payment") {
      await prisma.$transaction((tx) => addPaymentAndRecompute(tx, existing, body));
      activityLabel = `Paiement ajoute: ${existing.number}`;
    } else if (body.action === "delete-payment") {
      await prisma.$transaction((tx) => deletePaymentAndRecompute(tx, existing, body));
      activityLabel = `Paiement retire: ${existing.number}`;
    } else if (body.action === "mark-paid") {
      await prisma.$transaction((tx) => markPaidWithFinalPayment(tx, existing, body));
      activityLabel = `Facture payee: ${existing.number}`;
    } else if (body.action === "resend-paid-email") {
      if (existing.statut !== "paid" && !documentPaymentSummary(existing).isPaid) {
        return NextResponse.json({ error: "La facture n'est pas payee" }, { status: 400 });
      }
      activityLabel = `Facture payee renvoyee: ${existing.number}`;
    } else if (body.action === "send-payment-email") {
      const { payment } = scopeWorkOrderThroughPayment(existing, body.paymentId);
      if (!payment) throw new Error("Paiement introuvable");
      activityLabel = `Facture paiement renvoyee: ${existing.number}`;
    } else if (body.action === "create-credit-note") {
      const { createCreditNoteFromWorkOrder, workOrderPaidTotal } = await import("@/lib/credit-note");
      const creditType = body.creditType === "refund" ? "refund" : "credit";
      const paidTotal = workOrderPaidTotal(existing);
      if (paidTotal <= 0.005) {
        return NextResponse.json({ error: "Aucun montant encaisse sur cette facture" }, { status: 400 });
      }
      const amount = body.amount === undefined || body.amount === null || body.amount === ""
        ? paidTotal
        : roundMoney(Number(String(body.amount).replace(",", ".")));
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
      }
      if (amount > paidTotal + 0.005) {
        return NextResponse.json({ error: `Le montant depasse ce qui a ete encaisse (${paidTotal.toFixed(2)}$)` }, { status: 400 });
      }
      const creditNote = await prisma.$transaction((tx) => createCreditNoteFromWorkOrder(tx, existing, {
        amount,
        reason: cleanText(body.reason) || (creditType === "refund"
          ? `Remboursement sur la facture ${existing.number}`
          : `Avoir sur la facture ${existing.number}`),
        refundMethod: creditType === "refund" ? (cleanText(body.refundMethod) || "Autre") : null,
        refundRef: creditType === "refund" ? cleanText(body.refundRef) : null,
      }));
      activityLabel = `${creditType === "refund" ? "Remboursement" : "Note de credit"} ${creditNote.number}: ${existing.number}`;
    } else if (body.action === "mark-open") {
      const statut = openStatusFromBody(body, existing);
      await prisma.$transaction(async (tx) => {
        await tx.workOrderPayment.deleteMany({ where: { workOrderId: existing.id } });
        await tx.workOrder.update({
          where: { id: existing.id },
          data: {
            ...buildPaymentTrackingData({
              statut,
              existing,
              client: existing.client,
              invoiceDate: existing.invoiceIssuedAt || existing.date,
            }),
            statut,
            paidAt: null,
            paymentMethod: null,
          },
        });
      });
      activityLabel = `Facture remise a recevoir: ${existing.number}`;
    } else {
      const data = {};
      if (body.invoiceIssuedAt !== undefined) {
        data.invoiceIssuedAt = parsePaymentDateInput(body.invoiceIssuedAt, existing.invoiceIssuedAt);
      }
      if (body.invoiceSentAt !== undefined) {
        data.invoiceSentAt = parsePaymentDateInput(body.invoiceSentAt, existing.invoiceSentAt);
      }
      if (body.paymentDueAt !== undefined) {
        data.paymentDueAt = parsePaymentDateInput(body.paymentDueAt, existing.paymentDueAt);
      }
      if (body.paidAt !== undefined) {
        data.paidAt = parsePaymentDateInput(body.paidAt, existing.paidAt);
        if (data.paidAt) {
          data.statut = "paid";
        } else if (existing.statut === "paid") {
          // Retirer la date de paiement rouvre la facture (sinon elle restait
          // "payee" sans date de paiement).
          data.statut = existing.invoiceSentAt ? "sent" : "invoiced";
        }
      }
      if (body.paymentMethod !== undefined) data.paymentMethod = cleanText(body.paymentMethod);
      if (body.paymentNotes !== undefined) data.paymentNotes = cleanText(body.paymentNotes);

      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
      }

      await prisma.workOrder.update({ where: { id: workOrderId }, data });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur paiement" }, { status: 400 });
  }

  updated = await fetchPaymentWorkOrder(workOrderId);
  if (body.action !== "send-payment-email") {
    await syncFollowUp(updated);
  }

  let emailResult = null;
  let emailError = null;
  if (body.action === "add-payment" && body.sendEmail === true) {
    try {
      const fullWorkOrder = await fetchFullWorkOrder(workOrderId);
      emailResult = await sendInvoicePaymentUpdateEmail(fullWorkOrder, { to: cleanText(body.to) });
    } catch (err) {
      emailError = err.message || "Erreur d'envoi du courriel de facture mise a jour";
    }
  } else if ((body.action === "mark-paid" && body.sendEmail !== false) || body.action === "resend-paid-email") {
    try {
      const fullWorkOrder = await fetchFullWorkOrder(workOrderId);
      emailResult = await sendPaidInvoiceEmail(fullWorkOrder, { to: cleanText(body.to) });
    } catch (err) {
      emailError = err.message || "Erreur d'envoi du courriel paye";
    }
  } else if (body.action === "send-payment-email") {
    try {
      const fullWorkOrder = await fetchFullWorkOrder(workOrderId);
      const { workOrder: scopedWorkOrder, payment } = scopeWorkOrderThroughPayment(fullWorkOrder, body.paymentId);
      if (!payment) throw new Error("Paiement introuvable");
      emailResult = await sendInvoicePaymentUpdateEmail(scopedWorkOrder, { to: cleanText(body.to) });
    } catch (err) {
      emailError = err.message || "Erreur d'envoi du courriel de paiement";
    }
  }

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "work_order",
    entityId: updated.id,
    label: activityLabel,
    metadata: {
      number: updated.number,
      clientId: updated.clientId,
      clientName: updated.client?.name,
      changedFields: changedFields(existing, updated, [
        "statut",
        "invoiceIssuedAt",
        "invoiceSentAt",
        "paymentDueAt",
        "paidAt",
        "paymentMethod",
        "paymentNotes",
      ]),
      total: Number(updated.total),
      balanceDue: Number(serializePaymentWorkOrder(updated).balanceDue || 0),
      emailSent: Boolean(emailResult),
      emailError,
    },
  });

  return NextResponse.json({
    ...serializePaymentWorkOrder(updated),
    emailSent: Boolean(emailResult),
    emailTo: emailResult?.to || null,
    emailFilename: emailResult?.filename || null,
    emailError,
  });
  } catch (err) {
    console.error("PATCH /api/admin/payments/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur pendant la sauvegarde du paiement" }, { status: 500 });
  }
}
