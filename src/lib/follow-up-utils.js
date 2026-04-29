import prisma from "@/lib/prisma";

export const FOLLOW_UP_TERMINAL_STATUSES = ["lost", "completed"];

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
    nextActionDate: followUp.nextActionDate?.toISOString() || null,
    createdAt: followUp.createdAt?.toISOString() || null,
    updatedAt: followUp.updatedAt?.toISOString() || null,
  };
}

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
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
        phone: existing.phone || client.phone || null,
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
      phone: client.phone || null,
      email: client.email || null,
      service: serviceText,
      nextAction: "Appeler le client",
      notes: leadNote || null,
    },
  });
}
