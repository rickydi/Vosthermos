import prisma from "@/lib/prisma";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { upsertClientFromLead } from "@/lib/upsert-client";
import { composeDateTime, generateWorkOrderNumber, withWorkOrderNumberRetry } from "@/lib/work-order-utils";

const SERVICE_LABELS = {
  quincaillerie: "Quincaillerie",
  thermos: "Vitre thermos",
  "portes-bois": "Portes en bois",
  moustiquaires: "Moustiquaires",
};

function normalizeEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return value || null;
}

function phoneSuffix(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-7);
  return digits.length >= 7 ? digits : null;
}

function firstTimeSlotValue(timeSlot) {
  const match = String(timeSlot || "").match(/(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null;
}

function appointmentServiceLabel(appointment) {
  return SERVICE_LABELS[appointment?.serviceType] || appointment?.serviceType || "Intervention";
}

async function findClientForAppointment(appointment) {
  const email = normalizeEmail(appointment?.email);
  if (email) {
    const byEmail = await prisma.client.findUnique({ where: { email } });
    if (byEmail) return byEmail;
  }

  const suffix = phoneSuffix(appointment?.phone);
  if (suffix) {
    const byPhone = await prisma.client.findFirst({
      where: {
        OR: [
          { phone: { contains: suffix } },
          { secondaryPhone: { contains: suffix } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });
    if (byPhone) return byPhone;
  }

  return upsertClientFromLead({
    name: appointment?.name,
    phone: appointment?.phone,
    email: appointment?.email,
    address: appointment?.address,
    city: appointment?.city,
    notes: appointment?.notes,
    source: `rendez-vous ${appointmentServiceLabel(appointment)}`,
    service: appointmentServiceLabel(appointment),
  });
}

export async function ensureWorkOrderForAppointment(appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(appointmentId) },
    include: { workOrder: true },
  });
  if (!appointment) return null;
  if (appointment.workOrder) return appointment.workOrder;

  const client = await findClientForAppointment(appointment);
  if (!client?.id) return null;

  const time = firstTimeSlotValue(appointment.timeSlot);
  const arrivalAt = composeDateTime(appointment.date, time);
  const description = [
    appointmentServiceLabel(appointment),
    appointment.notes,
  ].filter(Boolean).join("\n\n");

  const workOrder = await withWorkOrderNumberRetry(async () => prisma.workOrder.create({
    data: {
      number: await generateWorkOrderNumber(),
      clientId: client.id,
      appointmentId: appointment.id,
      date: appointment.date,
      arrivalAt,
      interventionAddress: appointment.address || client.address || null,
      interventionCity: appointment.city || client.city || null,
      description: description || "Rendez-vous planifie",
      notes: `Cree depuis le rendez-vous ${appointment.timeSlot}`,
      statut: "scheduled",
      visibleAuClient: true,
    },
    include: { client: true },
  }));

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder, client, followUpStatus: "scheduled" });
  } catch (err) {
    console.error("[appointment-work-order] follow-up sync error:", err?.message || err);
  }

  return workOrder;
}

export function serializeAppointment(appointment) {
  if (!appointment) return null;
  return {
    ...appointment,
    date: appointment.date?.toISOString() || null,
    createdAt: appointment.createdAt?.toISOString() || null,
    workOrder: appointment.workOrder ? {
      id: appointment.workOrder.id,
      number: appointment.workOrder.number,
      statut: appointment.workOrder.statut,
    } : null,
  };
}
