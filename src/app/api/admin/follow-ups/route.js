import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES, normalizePhoneDigits, serializeFollowUp } from "@/lib/follow-up-utils";

export const dynamic = "force-dynamic";

function dateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clean(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function cleanEmail(value) {
  const email = clean(value);
  return email ? email.toLowerCase() : null;
}

function contactForFollowUp(followUp) {
  const phones = [
    normalizePhoneDigits(followUp.phone),
    normalizePhoneDigits(followUp.client?.phone),
  ].filter(Boolean);
  const emails = [
    cleanEmail(followUp.email),
    cleanEmail(followUp.client?.email),
  ].filter(Boolean);

  return {
    clientId: followUp.clientId || followUp.client?.id || null,
    phones: [...new Set(phones)],
    emails: [...new Set(emails)],
  };
}

function sameContact(contact, record = {}) {
  if (contact.clientId && Number(record.clientId) === Number(contact.clientId)) return true;
  const email = cleanEmail(record.email);
  if (email && contact.emails.includes(email)) return true;
  const phone = normalizePhoneDigits(record.phone);
  if (phone && contact.phones.some((p) => p === phone || p.endsWith(phone.slice(-7)) || phone.endsWith(p.slice(-7)))) return true;
  return false;
}

function iso(value) {
  return value?.toISOString?.() || null;
}

function serializeMoney(value) {
  return value === null || value === undefined ? null : Number(value);
}

function activityItem(item) {
  return {
    ...item,
    date: iso(item.date),
  };
}

async function attachCentralActivity(followUps) {
  if (followUps.length === 0) return followUps;

  const contacts = followUps.map(contactForFollowUp);
  const clientIds = [...new Set(contacts.map((c) => c.clientId).filter(Boolean))];
  const phoneSuffixes = [...new Set(contacts.flatMap((c) => c.phones.map((p) => p.slice(-7))).filter(Boolean))];
  const emails = [...new Set(contacts.flatMap((c) => c.emails).filter(Boolean))];

  const clientOr = [];
  if (clientIds.length) clientOr.push({ clientId: { in: clientIds } });
  for (const email of emails) clientOr.push({ client: { email: { equals: email, mode: "insensitive" } } });
  for (const suffix of phoneSuffixes) clientOr.push({ client: { phone: { contains: suffix } } });

  const clientMatchOr = [];
  if (clientIds.length) clientMatchOr.push({ id: { in: clientIds } });
  for (const email of emails) clientMatchOr.push({ email: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) clientMatchOr.push({ phone: { contains: suffix } });

  const contactOr = [];
  for (const email of emails) contactOr.push({ email: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) contactOr.push({ phone: { contains: suffix } });

  const chatOr = [];
  for (const email of emails) chatOr.push({ clientEmail: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) chatOr.push({ clientPhone: { contains: suffix } });

  const [workOrders, appointments, chats, openings] = await Promise.all([
    clientOr.length ? prisma.workOrder.findMany({
      where: { OR: clientOr },
      select: {
        id: true,
        number: true,
        clientId: true,
        statut: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        total: true,
        description: true,
        photos: true,
        client: { select: { id: true, name: true, phone: true, email: true, city: true } },
        technician: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }) : [],
    contactOr.length ? prisma.appointment.findMany({
      where: { OR: contactOr },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        serviceType: true,
        date: true,
        timeSlot: true,
        status: true,
        notes: true,
        createdAt: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 500,
    }) : [],
    chatOr.length ? prisma.chatConversation.findMany({
      where: { OR: chatOr },
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        unreadCount: true,
        isArchived: true,
        lastMessageAt: true,
        createdAt: true,
        messages: {
          take: 8,
          orderBy: { createdAt: "desc" },
          select: { content: true, senderType: true, imageUrl: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 500,
    }) : [],
    clientMatchOr.length ? prisma.unitOpening.findMany({
      where: {
        photoUrl: { not: null },
        unit: { client: { OR: clientMatchOr } },
      },
      select: {
        id: true,
        type: true,
        location: true,
        description: true,
        photoUrl: true,
        updatedAt: true,
        unit: {
          select: {
            code: true,
            clientId: true,
            client: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }) : [],
  ]);

  return followUps.map((followUp) => {
    const contact = contactForFollowUp(followUp);

    const relatedWorkOrders = workOrders
      .filter((wo) => sameContact(contact, { clientId: wo.clientId, phone: wo.client?.phone, email: wo.client?.email }))
      .slice(0, 20);
    const relatedAppointments = appointments
      .filter((appt) => sameContact(contact, { phone: appt.phone, email: appt.email }))
      .slice(0, 20);
    const relatedChats = chats
      .filter((chat) => sameContact(contact, { phone: chat.clientPhone, email: chat.clientEmail }))
      .slice(0, 20);
    const relatedOpenings = openings
      .filter((opening) => sameContact(contact, {
        clientId: opening.unit?.clientId,
        phone: opening.unit?.client?.phone,
        email: opening.unit?.client?.email,
      }))
      .slice(0, 50);

    const relatedPhotos = [
      ...relatedOpenings
        .filter((opening) => opening.photoUrl)
        .map((opening) => activityItem({
          id: `opening-${opening.id}`,
          type: "opening",
          source: "Ouverture",
          title: [opening.unit?.code && `Unite ${opening.unit.code}`, opening.location].filter(Boolean).join(" | ") || "Ouverture",
          subtitle: [opening.type, opening.description].filter(Boolean).join(" | "),
          url: opening.photoUrl,
          date: opening.updatedAt,
        })),
      ...relatedWorkOrders.flatMap((wo) => (wo.photos || []).filter(Boolean).map((url, index) => activityItem({
        id: `work-order-${wo.id}-${index}`,
        type: "work_order",
        source: `Bon ${wo.number}`,
        title: `Photo du bon ${wo.number}`,
        subtitle: wo.description || wo.statut,
        url,
        date: wo.updatedAt || wo.date || wo.createdAt,
        href: `/admin/bons/${wo.id}`,
      }))),
      ...relatedChats.flatMap((chat) => (chat.messages || [])
        .filter((message) => message.imageUrl)
        .map((message) => activityItem({
          id: `chat-${chat.id}-${message.createdAt?.getTime?.() || message.imageUrl}`,
          type: "chat",
          source: "Chat",
          title: chat.clientName || "Photo chat",
          subtitle: message.content || chat.clientPhone,
          url: message.imageUrl,
          date: message.createdAt,
          href: `/admin/chat/${chat.id}`,
        }))),
    ]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 80);

    const recentActivity = [
      ...relatedWorkOrders.map((wo) => activityItem({
        type: "work_order",
        id: wo.id,
        title: `Bon ${wo.number}`,
        subtitle: [wo.client?.name, wo.technician?.name].filter(Boolean).join(" | "),
        status: wo.statut,
        date: wo.updatedAt || wo.date || wo.createdAt,
        href: `/admin/bons/${wo.id}`,
        amount: serializeMoney(wo.total),
      })),
      ...relatedAppointments.map((appt) => activityItem({
        type: "appointment",
        id: appt.id,
        title: `RDV ${appt.timeSlot}`,
        subtitle: `${appt.name} | ${appt.serviceType}`,
        status: appt.status,
        date: appt.date || appt.createdAt,
        href: "/admin/rendez-vous",
      })),
      ...relatedChats.map((chat) => activityItem({
        type: "chat",
        id: chat.id,
        title: "Chat client",
        subtitle: chat.messages?.[0]?.content || chat.clientName,
        status: chat.unreadCount > 0 ? `${chat.unreadCount} non-lu` : (chat.isArchived ? "archive" : "actif"),
        date: chat.lastMessageAt || chat.createdAt,
        href: `/admin/chat/${chat.id}`,
      })),
    ]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 8);

    return {
      ...followUp,
      activity: {
        counts: {
          chats: relatedChats.length,
          workOrders: relatedWorkOrders.length,
          appointments: relatedAppointments.length,
          photos: relatedPhotos.length,
          total: relatedChats.length + relatedWorkOrders.length + relatedAppointments.length,
        },
        photos: relatedPhotos,
        recent: recentActivity,
        chats: relatedChats.map((chat) => ({
          id: chat.id,
          clientName: chat.clientName,
          clientPhone: chat.clientPhone,
          clientEmail: chat.clientEmail,
          unreadCount: chat.unreadCount,
          isArchived: chat.isArchived,
          lastMessageAt: iso(chat.lastMessageAt),
          lastMessage: chat.messages?.[0]?.content || "",
          href: `/admin/chat/${chat.id}`,
        })),
        workOrders: relatedWorkOrders.map((wo) => ({
          id: wo.id,
          number: wo.number,
          statut: wo.statut,
          date: iso(wo.date),
          updatedAt: iso(wo.updatedAt),
          total: serializeMoney(wo.total),
          description: wo.description,
          technicianName: wo.technician?.name || null,
          href: `/admin/bons/${wo.id}`,
        })),
        appointments: relatedAppointments.map((appt) => ({
          id: appt.id,
          name: appt.name,
          serviceType: appt.serviceType,
          date: iso(appt.date),
          timeSlot: appt.timeSlot,
          status: appt.status,
          notes: appt.notes,
          href: "/admin/rendez-vous",
        })),
      },
    };
  });
}

export async function GET(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";
  const q = clean(searchParams.get("q"));
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  const where = {};
  if (status === "active") {
    where.status = { notIn: FOLLOW_UP_TERMINAL_STATUSES };
  } else if (status && status !== "all") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { service: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q } } },
      { client: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const followUps = await prisma.clientFollowUp.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
    orderBy: [
      { nextActionDate: "asc" },
      { updatedAt: "desc" },
    ],
    take: limit,
  });

  const enriched = await attachCentralActivity(followUps);
  return NextResponse.json(enriched.map(serializeFollowUp));
}

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId ? Number(body.clientId) : null;
  const client = clientId
    ? await prisma.client.findUnique({ where: { id: clientId } })
    : null;

  const title = clean(body.title) || client?.name || clean(body.contactName);
  if (!title) {
    return NextResponse.json({ error: "Nom ou titre requis" }, { status: 400 });
  }

  const followUp = await prisma.clientFollowUp.create({
    data: {
      clientId: client?.id || null,
      title,
      source: clean(body.source),
      status: clean(body.status) || "to_call",
      priority: clean(body.priority) || "normal",
      contactName: clean(body.contactName) || client?.name || null,
      phone: clean(body.phone) || client?.phone || null,
      email: clean(body.email) || client?.email || null,
      service: clean(body.service),
      estimateAmount: numberOrNull(body.estimateAmount),
      estimateSentAt: dateOrNull(body.estimateSentAt),
      acceptedAt: dateOrNull(body.acceptedAt),
      jobCompletedAt: dateOrNull(body.jobCompletedAt),
      nextAction: clean(body.nextAction),
      nextActionDate: dateOrNull(body.nextActionDate),
      lostReason: clean(body.lostReason),
      notes: clean(body.notes),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
  });

  return NextResponse.json(serializeFollowUp(followUp));
}
