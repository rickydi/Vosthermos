import prisma from "@/lib/prisma";
import {
  DEFAULT_FOLLOW_UP_COLUMNS,
  FOLLOW_UP_COLUMNS_SETTINGS_KEY,
  followUpStatusFromWorkOrderStatut,
  normalizeFollowUpColumns,
  workOrderStatutFromFollowUpStatus,
} from "@/lib/follow-up-columns";
import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
import { getPaymentDueDate, isOpenPaymentStatus, paymentDateOnlyTime } from "@/lib/payment-tracking";

export const FOLLOW_UP_TERMINAL_STATUSES = ["lost", "completed", "archived"];

function dateOnlyIso(value) {
  return value?.toISOString?.().slice(0, 10) || null;
}

export function serializeFollowUp(followUp) {
  if (!followUp) return null;
  return {
    ...followUp,
    estimateAmount: followUp.estimateAmount === null || followUp.estimateAmount === undefined
      ? null
      : Number(followUp.estimateAmount),
    estimateSentAt: followUp.estimateSentAt?.toISOString() || null,
    acceptedAt: followUp.acceptedAt?.toISOString() || null,
    jobCompletedAt: followUp.jobCompletedAt?.toISOString() || null,
    contactedAt: followUp.contactedAt?.toISOString() || null,
    visitDoneAt: followUp.visitDoneAt?.toISOString() || null,
    invoicedAt: followUp.invoicedAt?.toISOString() || null,
    lastAttemptAt: followUp.lastAttemptAt?.toISOString() || null,
    nextActionDate: dateOnlyIso(followUp.nextActionDate),
    createdAt: followUp.createdAt?.toISOString() || null,
    updatedAt: followUp.updatedAt?.toISOString() || null,
  };
}

export function normalizePhoneDigits(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  return digits.length >= 7 ? digits : null;
}

export async function getSavedFollowUpColumns() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: FOLLOW_UP_COLUMNS_SETTINGS_KEY },
      select: { value: true },
    });
    return normalizeFollowUpColumns(setting?.value ? JSON.parse(setting.value) : null);
  } catch {
    return DEFAULT_FOLLOW_UP_COLUMNS;
  }
}

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function primaryContactPhone(client) {
  return client?.phone || client?.secondaryPhone || null;
}

function primaryContactName(client) {
  return client?.contactName || client?.name || null;
}

function appendNote(existing, next) {
  const cleanNext = cleanText(next);
  if (!cleanNext) return existing || null;
  if (existing && existing.includes(cleanNext)) return existing;
  return [existing, cleanNext].filter(Boolean).join("\n");
}

function paymentDueDate(workOrder, client) {
  if (!workOrder) return null;
  return getPaymentDueDate({ ...workOrder, client: client || workOrder.client });
}

function isDueTodayOrLate(date, now = new Date()) {
  const dueTime = paymentDateOnlyTime(date);
  const todayTime = paymentDateOnlyTime(now);
  return dueTime !== null && todayTime !== null && dueTime <= todayTime;
}

function serviceFromSource(source) {
  const text = cleanText(source);
  if (!text) return null;
  if (text.toLowerCase().startsWith("rendez-vous ")) {
    return text.slice("rendez-vous ".length).trim() || null;
  }
  return null;
}

export async function createOrTouchFollowUpFromLead({ client, source, notes, service } = {}) {
  if (!client?.id) return null;

  const sourceText = cleanText(source) || "lead";
  const serviceText = cleanText(service) || serviceFromSource(sourceText);
  const leadNote = [
    `[auto: ${sourceText} ${new Date().toISOString().slice(0, 10)}]`,
    cleanText(notes),
  ].filter(Boolean).join("\n");

  const existing = await prisma.clientFollowUp.findFirst({
    where: {
      clientId: client.id,
      status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return prisma.clientFollowUp.update({
      where: { id: existing.id },
      data: {
        source: existing.source || sourceText,
        contactName: existing.contactName || primaryContactName(client),
        phone: existing.phone || primaryContactPhone(client),
        email: existing.email || client.email || null,
        service: existing.service || serviceText,
        notes: appendNote(existing.notes, leadNote),
      },
    });
  }

  return prisma.clientFollowUp.create({
    data: {
      clientId: client.id,
      title: `${client.name || "Client"} - suivi`,
      source: sourceText,
      contactName: primaryContactName(client),
      phone: primaryContactPhone(client),
      email: client.email || null,
      service: serviceText,
      nextAction: "Appeler le client",
      notes: leadNote || null,
    },
  });
}

async function findRelevantFollowUp(clientId, nextStatus, workOrder) {
  if (workOrder?.followUpId) {
    const linked = await prisma.clientFollowUp.findUnique({
      where: { id: workOrder.followUpId },
    });
    if (linked && linked.status !== "archived") return { followUp: linked, ambiguous: false };
  }

  const active = await prisma.clientFollowUp.findMany({
    where: {
      clientId,
      status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
    },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });
  if (active.length === 1) return { followUp: active[0], ambiguous: false };
  if (active.length > 1) return { followUp: null, ambiguous: true };
  if (!FOLLOW_UP_TERMINAL_STATUSES.includes(nextStatus)) return { followUp: null, ambiguous: false };

  const nonArchived = await prisma.clientFollowUp.findMany({
    where: {
      clientId,
      status: { not: "archived" },
    },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });
  if (nonArchived.length === 1) return { followUp: nonArchived[0], ambiguous: false };
  return { followUp: null, ambiguous: nonArchived.length > 1 };
}

export async function createOrTouchFollowUpFromWorkOrder({ workOrder, client, followUpStatus } = {}) {
  if (!client?.id || !workOrder?.id) return null;

  const columns = await getSavedFollowUpColumns();
  const status = cleanText(followUpStatus) || (workOrder.statut === "draft" ? "to_call" : followUpStatusFromWorkOrderStatut(workOrder.statut, columns));
  const { followUp: existing, ambiguous } = await findRelevantFollowUp(client.id, status, workOrder);
  const documentMeta = getWorkOrderDocumentMeta(workOrder.statut);
  const invoiceOpen = isOpenPaymentStatus(workOrder.statut);
  const invoicePaid = workOrder.statut === "paid";
  const dueDate = invoiceOpen ? paymentDueDate(workOrder, client) : null;
  const dueNow = invoiceOpen && isDueTodayOrLate(dueDate);
  const sourceText = documentMeta.type === "invoice"
    ? "facture"
    : documentMeta.type === "quote"
      ? "soumission"
      : "bon de travail";
  const defaultNextAction = invoiceOpen
    ? "Relancer la facture a payer"
    : invoicePaid
      ? "Facture payee"
      : documentMeta.type === "quote"
        ? "Relancer la soumission"
        : "Appeler le client";

  const note = `[auto: ${sourceText} ${workOrder.number || `#${workOrder.id}`}${dueDate ? ` echeance ${dateOnlyIso(dueDate)}` : ""} ${new Date().toISOString().slice(0, 10)}]`;

  let followUp;
  if (existing) {
    followUp = await prisma.clientFollowUp.update({
      where: { id: existing.id },
      data: {
        source: invoiceOpen || invoicePaid ? sourceText : existing.source || sourceText,
        status,
        priority: dueNow ? "high" : existing.priority,
        contactName: existing.contactName || primaryContactName(client),
        phone: existing.phone || primaryContactPhone(client),
        email: existing.email || client.email || null,
        estimateAmount: existing.estimateAmount ?? (documentMeta.type !== "work_order" ? workOrder.total : null),
        nextAction: invoiceOpen || invoicePaid ? defaultNextAction : existing.nextAction || (status === "scheduled" ? "Suivre le bon planifie" : defaultNextAction),
        nextActionDate: invoiceOpen ? dueDate : invoicePaid ? null : existing.nextActionDate,
        notes: appendNote(existing.notes, note),
      },
    });
  } else if (!ambiguous) {
    followUp = await prisma.clientFollowUp.create({
      data: {
        clientId: client.id,
        title: `${client.name || "Client"} - ${workOrder.number || sourceText}`,
        source: sourceText,
        status,
        priority: dueNow ? "high" : "normal",
        contactName: primaryContactName(client),
        phone: primaryContactPhone(client),
        email: client.email || null,
        estimateAmount: documentMeta.type !== "work_order" ? workOrder.total : null,
        nextAction: status === "scheduled" && !invoiceOpen ? "Suivre le bon planifie" : defaultNextAction,
        nextActionDate: invoiceOpen ? dueDate : null,
        notes: note,
      },
    });
  }

  // Jalons horodatés dérivés de l'état du bon (refonte suivi : arrivée terrain -> Visite faite,
  // job fait -> Service fait, facturé -> Facturé). Idempotent : ne remplit que les jalons vides.
  if (followUp?.id) {
    const st = workOrder.statut;
    const ms = {};
    if (workOrder.arrivalAt) {
      if (!followUp.contactedAt) ms.contactedAt = workOrder.arrivalAt;
      if (!followUp.visitDoneAt) ms.visitDoneAt = workOrder.arrivalAt;
    }
    // "quote" inclus : dès qu'une soumission existe dans le système (même pas encore
    // envoyée), le jalon "Soumission" se coche tout seul. La soumission verbale, elle,
    // reste cochée à la main depuis le suivi.
    if (["quote", "quote_sent", "quote_accepted", "scheduled", "in_progress", "completed", "invoiced", "sent", "paid"].includes(st) && !followUp.estimateSentAt) ms.estimateSentAt = new Date();
    // Un vrai document de soumission (statut quote*) = soumission ÉCRITE -> type posé
    // automatiquement (c'est le "tu sais pourquoi" : l'écrite vient du système).
    if (["quote", "quote_sent", "quote_accepted"].includes(st) && followUp.estimateType !== "written") ms.estimateType = "written";
    if (["quote_accepted", "scheduled", "in_progress", "completed", "invoiced", "sent", "paid"].includes(st) && !followUp.acceptedAt) ms.acceptedAt = new Date();
    if (["completed", "invoiced", "sent", "paid"].includes(st) && !followUp.jobCompletedAt) ms.jobCompletedAt = workOrder.departureAt || new Date();
    if (["invoiced", "sent", "paid"].includes(st) && !followUp.invoicedAt) ms.invoicedAt = workOrder.invoiceSentAt || workOrder.invoiceIssuedAt || new Date();
    const wantWon = ["quote_accepted", "scheduled", "in_progress", "completed", "invoiced", "sent", "paid"].includes(st);
    if (wantWon && followUp.outcome !== "won" && followUp.outcome !== "lost") ms.outcome = "won";
    if (Object.keys(ms).length) {
      followUp = await prisma.clientFollowUp.update({ where: { id: followUp.id }, data: ms });
    }
  }

  if (followUp?.id && workOrder.followUpId !== followUp.id) {
    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: { followUpId: followUp.id },
    });
  }

  return followUp;
}

async function findLinkedWorkOrderForFollowUp(followUp) {
  if (!followUp?.id) return null;
  const linked = await prisma.workOrder.findFirst({
    where: { followUpId: followUp.id },
    orderBy: [
      { updatedAt: "desc" },
      { id: "desc" },
    ],
  });
  if (linked) return linked;

  const clientId = followUp?.clientId || followUp?.client?.id;
  if (!clientId) return null;

  const candidates = await prisma.workOrder.findMany({
    where: {
      clientId,
      followUpId: null,
      statut: { not: "paid" },
    },
    orderBy: [
      { updatedAt: "desc" },
      { id: "desc" },
    ],
    take: 2,
  });
  if (candidates.length !== 1) return null;

  return prisma.workOrder.update({
    where: { id: candidates[0].id },
    data: { followUpId: followUp.id },
  });
}

export async function syncLatestWorkOrderFromFollowUpStatus(followUp, columns) {
  const status = cleanText(followUp?.status);
  if (!followUp?.id || !status) return null;

  const normalizedColumns = columns || await getSavedFollowUpColumns();
  const nextStatut = workOrderStatutFromFollowUpStatus(status, normalizedColumns);
  const workOrder = await findLinkedWorkOrderForFollowUp(followUp);
  if (!workOrder || workOrder.statut === nextStatut) return workOrder;

  return prisma.workOrder.update({
    where: { id: workOrder.id },
    data: { statut: nextStatut },
  });
}
