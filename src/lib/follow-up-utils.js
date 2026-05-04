import prisma from "@/lib/prisma";
import { followUpStatusFromWorkOrderStatut } from "@/lib/follow-up-columns";

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

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function primaryContactPhone(client) {
  return client?.phone || client?.secondaryPhone || null;
}

function appendNote(existing, next) {
  const cleanNext = cleanText(next);
  if (!cleanNext) return existing || null;
  if (existing && existing.includes(cleanNext)) return existing;
  return [existing, cleanNext].filter(Boolean).join("\n");
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
        contactName: existing.contactName || client.name || null,
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
      contactName: client.name || null,
      phone: primaryContactPhone(client),
      email: client.email || null,
      service: serviceText,
      nextAction: "Appeler le client",
      notes: leadNote || null,
    },
  });
}

async function findRelevantFollowUp(clientId, nextStatus) {
  const active = await prisma.clientFollowUp.findFirst({
    where: {
      clientId,
      status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (active) return active;
  if (!FOLLOW_UP_TERMINAL_STATUSES.includes(nextStatus)) return null;

  return prisma.clientFollowUp.findFirst({
    where: {
      clientId,
      status: { not: "archived" },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createOrTouchFollowUpFromWorkOrder({ workOrder, client, followUpStatus } = {}) {
  if (!client?.id || !workOrder?.id) return null;

  const status = cleanText(followUpStatus) || (workOrder.statut === "draft" ? "to_call" : followUpStatusFromWorkOrderStatut(workOrder.statut));
  const existing = await findRelevantFollowUp(client.id, status);

  const note = `[auto: bon de travail ${workOrder.number || `#${workOrder.id}`} ${new Date().toISOString().slice(0, 10)}]`;

  if (existing) {
    return prisma.clientFollowUp.update({
      where: { id: existing.id },
      data: {
        source: existing.source || "bon de travail",
        status,
        contactName: existing.contactName || client.name || null,
        phone: existing.phone || primaryContactPhone(client),
        email: existing.email || client.email || null,
        nextAction: existing.nextAction || (status === "scheduled" ? "Suivre le bon planifie" : "Faire le suivi du bon"),
        notes: appendNote(existing.notes, note),
      },
    });
  }

  return prisma.clientFollowUp.create({
    data: {
      clientId: client.id,
      title: `${client.name || "Client"} - ${workOrder.number || "bon de travail"}`,
      source: "bon de travail",
      status,
      contactName: client.name || null,
      phone: primaryContactPhone(client),
      email: client.email || null,
      nextAction: status === "scheduled" ? "Suivre le bon planifie" : "Appeler le client",
      notes: note,
    },
  });
}
