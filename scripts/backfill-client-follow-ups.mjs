import "dotenv/config";
import prisma from "../src/lib/prisma.js";

const TERMINAL = ["lost", "completed"];

function clean(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function cleanEmail(value) {
  const email = clean(value);
  return email ? email.toLowerCase() : null;
}

function normalizePhoneDigits(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  return digits.length >= 7 ? digits : null;
}

function workOrderStatus(statut) {
  if (statut === "scheduled" || statut === "in_progress") return "scheduled";
  if (statut === "completed" || statut === "invoiced" || statut === "sent" || statut === "paid") return "completed";
  return "to_call";
}

function appointmentStatus(status) {
  if (status === "confirmed") return "scheduled";
  if (status === "completed") return "completed";
  return "to_call";
}

function contactKey({ clientId, phone, email }) {
  if (clientId) return `client:${clientId}`;
  const cleanPhone = normalizePhoneDigits(phone);
  if (cleanPhone) return `phone:${cleanPhone}`;
  const cleanMail = cleanEmail(email);
  if (cleanMail) return `email:${cleanMail}`;
  return null;
}

function findClient(clients, { phone, email }) {
  const cleanMail = cleanEmail(email);
  if (cleanMail) {
    const byEmail = clients.find((c) => cleanEmail(c.email) === cleanMail);
    if (byEmail) return byEmail;
  }

  const cleanPhone = normalizePhoneDigits(phone);
  if (cleanPhone) {
    const suffix = cleanPhone.slice(-7);
    return clients.find((c) => normalizePhoneDigits(c.phone)?.endsWith(suffix)) || null;
  }

  return null;
}

async function main() {
  const [clients, existingFollowUps, chats, appointments, workOrders] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, name: true, phone: true, email: true, notes: true, city: true },
    }),
    prisma.clientFollowUp.findMany({
      where: { status: { notIn: TERMINAL } },
      select: { clientId: true, phone: true, email: true },
    }),
    prisma.chatConversation.findMany({
      include: { messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true } } },
      orderBy: { lastMessageAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: { status: { notIn: ["completed", "cancelled"] } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.workOrder.findMany({
      where: { statut: { notIn: ["paid"] } },
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const seen = new Set(existingFollowUps.map(contactKey).filter(Boolean));
  let created = 0;

  async function createIfMissing(data) {
    const key = contactKey(data);
    if (!key || seen.has(key)) return;
    seen.add(key);

    await prisma.clientFollowUp.create({
      data: {
        clientId: data.clientId || null,
        title: data.title,
        source: data.source,
        status: data.status || "to_call",
        priority: data.priority || "normal",
        contactName: data.contactName || null,
        phone: data.phone || null,
        email: data.email || null,
        service: data.service || null,
        nextAction: data.nextAction || "Faire le suivi du client",
        nextActionDate: data.nextActionDate || null,
        notes: data.notes || null,
      },
    });
    created += 1;
  }

  for (const wo of workOrders) {
    await createIfMissing({
      clientId: wo.clientId,
      title: `${wo.client?.name || "Client"} - ${wo.number}`,
      source: "bon de travail",
      status: workOrderStatus(wo.statut),
      contactName: wo.client?.name,
      phone: wo.client?.phone,
      email: wo.client?.email,
      nextAction: wo.statut === "draft" ? "Traiter le bon / appeler le client" : "Suivre le bon de travail",
      notes: `[import: bon ${wo.number}] statut ${wo.statut}`,
    });
  }

  for (const chat of chats) {
    const client = findClient(clients, { phone: chat.clientPhone, email: chat.clientEmail });
    await createIfMissing({
      clientId: client?.id || null,
      title: `${client?.name || chat.clientName} - chat`,
      source: "chat",
      status: chat.unreadCount > 0 ? "to_call" : "called",
      contactName: chat.clientName,
      phone: chat.clientPhone,
      email: chat.clientEmail,
      nextAction: chat.unreadCount > 0 ? "Repondre au chat client" : "Verifier si le chat demande un suivi",
      notes: chat.messages?.[0]?.content ? `[import: dernier chat]\n${chat.messages[0].content}` : "[import: conversation chat]",
    });
  }

  for (const appt of appointments) {
    const client = findClient(clients, { phone: appt.phone, email: appt.email });
    await createIfMissing({
      clientId: client?.id || null,
      title: `${client?.name || appt.name} - rendez-vous`,
      source: "rendez-vous",
      status: appointmentStatus(appt.status),
      contactName: appt.name,
      phone: appt.phone,
      email: appt.email,
      service: appt.serviceType,
      nextAction: appt.status === "confirmed" ? "Preparer le rendez-vous" : "Confirmer le rendez-vous",
      nextActionDate: appt.date,
      notes: appt.notes ? `[import: rendez-vous]\n${appt.notes}` : `[import: rendez-vous ${appt.serviceType}]`,
    });
  }

  for (const client of clients) {
    if (!client.notes?.includes("[auto:")) continue;
    await createIfMissing({
      clientId: client.id,
      title: `${client.name} - suivi`,
      source: "historique client",
      status: "to_call",
      contactName: client.name,
      phone: client.phone,
      email: client.email,
      nextAction: "Verifier le besoin client",
      notes: client.notes,
    });
  }

  console.log(`Backfill follow-ups created: ${created}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
