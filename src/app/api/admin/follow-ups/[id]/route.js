import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeFollowUp, syncLatestWorkOrderFromFollowUpStatus } from "@/lib/follow-up-utils";
import { deriveFollowUpStatus, FOLLOW_UP_MILESTONE_KEYS } from "@/lib/follow-up-columns";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";

// Mêmes créneaux que le calendrier public (BookingCalendar) : un RDV par créneau
// (contrainte unique date+timeSlot en base).
const VISIT_TIME_SLOTS = ["9h", "10h", "11h", "13h", "14h", "15h", "16h"];

// Annule (best effort) l'Appointment créé pour le RDV de visite de ce suivi.
// On le retrouve par date + créneau + la note posée à la création — jamais par
// simple téléphone, pour ne pas annuler le RDV d'un autre dossier.
async function cancelVisitAppointment(followUp) {
  if (!followUp.visitScheduledAt || !followUp.visitTimeSlot) return;
  try {
    const day = followUp.visitScheduledAt.toISOString().slice(0, 10);
    await prisma.appointment.updateMany({
      where: {
        date: new Date(`${day}T00:00:00.000Z`),
        timeSlot: followUp.visitTimeSlot,
        status: { not: "cancelled" },
        notes: { contains: `suivi #${followUp.id}` },
      },
      data: { status: "cancelled" },
    });
  } catch (err) {
    console.error("[follow-ups] annulation RDV visite:", err?.message || err);
  }
}

function dateOrNull(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const followUpId = Number(id);
  // client inclus : la création d'un RDV de visite (visitRdv) a besoin du
  // téléphone/adresse du client quand le suivi ne les porte pas lui-même.
  const existing = await prisma.clientFollowUp.findUnique({
    where: { id: followUpId },
    include: { client: { select: { id: true, name: true, phone: true, email: true, address: true, city: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Suivi introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data = {};

  for (const key of ["title", "source", "status", "priority", "contactName", "phone", "email", "service", "nextAction", "lostReason", "notes"]) {
    const value = cleanOrNull(body[key]);
    if (value !== undefined) data[key] = value;
  }

  if (body.clientId !== undefined) data.clientId = body.clientId ? Number(body.clientId) : null;

  const estimateAmount = numberOrNull(body.estimateAmount);
  if (estimateAmount !== undefined) data.estimateAmount = estimateAmount;

  for (const key of ["estimateSentAt", "acceptedAt", "jobCompletedAt", "contactedAt", "visitDoneAt", "invoicedAt", "nextActionDate"]) {
    const value = dateOrNull(body[key]);
    if (value !== undefined) data[key] = value;
  }

  // Issue finale (open/won/lost) — refonte suivi.
  if (body.outcome !== undefined) {
    data.outcome = ["won", "lost"].includes(body.outcome) ? body.outcome : "open";
  }

  // Toggle d'un jalon depuis la liste à cases : { toggleMilestone: "visitDoneAt", on: true|false }.
  // Cocher horodate (now) ; décocher remet à null. Idempotent si déjà dans cet état.
  if (body.toggleMilestone && FOLLOW_UP_MILESTONE_KEYS.includes(body.toggleMilestone)) {
    data[body.toggleMilestone] = body.on ? (existing[body.toggleMilestone] || new Date()) : null;
  }

  // Type de soumission piloté par le menu Soumission : "written" (écrite) | "phone"
  // (verbale) | null (réinitialisée). L'écrite est aussi posée automatiquement côté
  // bon de travail (voir follow-up-utils), ici c'est le réglage manuel.
  if (body.estimateType !== undefined) {
    data.estimateType = ["phone", "written"].includes(body.estimateType) ? body.estimateType : null;
  }

  // État de la visite piloté par le menu Visite : "todo" (à faire) | "done" (faite) |
  // "rdv" (planifiée) | "anytime" (passage libre — client toujours sur place) |
  // "none" (sans visite) | null.
  if (body.visitStatus !== undefined) {
    data.visitStatus = ["todo", "done", "none", "rdv", "anytime"].includes(body.visitStatus) ? body.visitStatus : null;
  }

  // Visite avec RDV : { visitRdv: { date: "YYYY-MM-DD", timeSlot: "9h" } }.
  // Crée l'Appointment (même calendrier que le site public, un RDV par créneau),
  // annule l'ancien RDV de visite s'il y en avait un, puis pose l'état "rdv".
  let createdAppointment = null;
  if (body.visitRdv) {
    const rdvDate = String(body.visitRdv.date || "");
    const rdvSlot = String(body.visitRdv.timeSlot || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rdvDate) || !VISIT_TIME_SLOTS.includes(rdvSlot)) {
      return NextResponse.json({ error: "Date ou plage horaire invalide" }, { status: 400 });
    }
    const dateObj = new Date(`${rdvDate}T00:00:00.000Z`);
    const taken = await prisma.appointment.findFirst({
      where: { date: dateObj, timeSlot: rdvSlot, status: { not: "cancelled" } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: "Cette plage horaire est déjà réservée. Choisissez-en une autre." }, { status: 409 });
    }
    await cancelVisitAppointment(existing); // ancien RDV de visite -> annulé (best effort)
    try {
      createdAppointment = await prisma.appointment.create({
        data: {
          clientId: existing.clientId || null,
          name: existing.contactName || existing.client?.name || existing.title,
          phone: existing.phone || existing.client?.phone || "—",
          email: existing.email || existing.client?.email || null,
          serviceType: existing.service || "Visite",
          date: dateObj,
          timeSlot: rdvSlot,
          address: existing.client?.address || null,
          city: existing.client?.city || null,
          notes: `Visite planifiée depuis le suivi #${existing.id}`,
          status: "confirmed",
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        return NextResponse.json({ error: "Cette plage horaire est déjà réservée. Choisissez-en une autre." }, { status: 409 });
      }
      throw err;
    }
    data.visitStatus = "rdv";
    data.visitDoneAt = null;
    data.visitScheduledAt = new Date(`${rdvDate}T12:00:00.000Z`);
    data.visitTimeSlot = rdvSlot;
  } else if (
    existing.visitStatus === "rdv" &&
    data.visitStatus !== undefined &&
    data.visitStatus !== "rdv"
  ) {
    // On quitte l'état "rdv" : visite faite -> le RDV a eu lieu, on le laisse ;
    // sinon (à faire / passage libre / sans visite) le RDV n'a plus lieu d'être.
    if (data.visitStatus !== "done") {
      await cancelVisitAppointment(existing);
    }
    data.visitScheduledAt = null;
    data.visitTimeSlot = null;
  }

  // Tentatives de contact sans réponse. { bumpAttempt: true } = +1 et horodate la
  // tentative ; { resetAttempts: true } = remet à zéro. On accepte aussi une valeur
  // directe contactAttempts (clampée >= 0).
  if (body.bumpAttempt) {
    data.contactAttempts = Math.min((existing.contactAttempts || 0) + 1, 9);
    data.lastAttemptAt = new Date();
  } else if (body.resetAttempts) {
    data.contactAttempts = 0;
    data.lastAttemptAt = null;
  } else {
    const attempts = numberOrNull(body.contactAttempts);
    if (attempts !== undefined) {
      data.contactAttempts = attempts === null ? 0 : Math.max(0, Math.min(Math.round(attempts), 9));
      if (data.contactAttempts > (existing.contactAttempts || 0)) data.lastAttemptAt = new Date();
    }
  }

  // Auto-horodatage legacy si un status est poussé directement.
  if (body.status === "estimate_sent" && !existing.estimateSentAt && data.estimateSentAt === undefined) data.estimateSentAt = new Date();
  if (body.status === "won" && !existing.acceptedAt && data.acceptedAt === undefined) data.acceptedAt = new Date();
  if (body.status === "completed" && !existing.jobCompletedAt && data.jobCompletedAt === undefined) data.jobCompletedAt = new Date();

  // Statut legacy dérivé des jalons (sauf si un status explicite est fourni) -> garde la sync WorkOrder cohérente.
  const touchesMilestones =
    body.toggleMilestone ||
    ["contactedAt", "visitDoneAt", "estimateSentAt", "acceptedAt", "jobCompletedAt", "invoicedAt", "outcome"].some((k) => data[k] !== undefined);
  if (touchesMilestones && body.status === undefined) {
    data.status = deriveFollowUpStatus({ ...existing, ...data });
  }

  const followUp = await prisma.clientFollowUp.update({
    where: { id: followUpId },
    data,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          secondaryPhone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
  });

  if (data.status !== undefined) {
    try {
      await syncLatestWorkOrderFromFollowUpStatus(followUp);
    } catch (err) {
      console.error("[follow-ups] work-order sync error:", err?.message || err);
    }
  }

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "follow_up",
    entityId: followUp.id,
    label: `Suivi modifie: ${followUp.title}`,
    metadata: {
      changedFields: changedFields(existing, followUp, Object.keys(data)),
      statusFrom: existing.status,
      statusTo: followUp.status,
      clientId: followUp.clientId,
    },
  });

  publishAdminEvent({
    type: "follow_up.changed",
    entityType: "follow_up",
    entityId: followUp.id,
    clientId: followUp.clientId,
    actor: session.id,
    origin: req.headers.get("x-admin-tab") || undefined,
  });

  // RDV de visite créé ou annulé -> le calendrier des rendez-vous doit se rafraîchir.
  if (createdAppointment || (existing.visitStatus === "rdv" && data.visitScheduledAt === null)) {
    publishAdminEvent({
      type: "appointment.changed",
      entityType: "appointment",
      entityId: createdAppointment?.id,
      clientId: followUp.clientId,
      actor: session.id,
      origin: req.headers.get("x-admin-tab") || undefined,
    });
  }

  return NextResponse.json(serializeFollowUp(followUp));
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.clientFollowUp.findUnique({ where: { id: Number(id) } });
  await prisma.clientFollowUp.delete({ where: { id: Number(id) } });
  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "follow_up",
    entityId: id,
    label: `Suivi supprime: ${existing?.title || id}`,
    metadata: { status: existing?.status, clientId: existing?.clientId },
  });
  publishAdminEvent({
    type: "follow_up.changed",
    entityType: "follow_up",
    entityId: Number(id),
    clientId: existing?.clientId,
    actor: session.id,
    origin: req.headers.get("x-admin-tab") || undefined,
  });
  return NextResponse.json({ ok: true });
}
