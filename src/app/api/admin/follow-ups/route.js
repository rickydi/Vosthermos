import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES, normalizePhoneDigits, serializeFollowUp } from "@/lib/follow-up-utils";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";

export const dynamic = "force-dynamic";

function dateOrNull(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }
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
    normalizePhoneDigits(followUp.client?.secondaryPhone),
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
  const secondaryPhone = normalizePhoneDigits(record.secondaryPhone);
  if (secondaryPhone && contact.phones.some((p) => p === secondaryPhone || p.endsWith(secondaryPhone.slice(-7)) || secondaryPhone.endsWith(p.slice(-7)))) return true;
  return false;
}

function iso(value) {
  return value?.toISOString?.() || null;
}

function serializeMoney(value) {
  return value === null || value === undefined ? null : Number(value);
}

function unreadConversationCount(value) {
  return Number(value || 0) > 0 ? 1 : 0;
}

function serializeFollowUpOperations(followUp) {
  const latestMeasurement = followUp?.thermosMeasurements?.[0] || null;
  const latestThermosOrder = followUp?.thermosOrders?.[0] || null;
  const base = serializeFollowUp(followUp);
  delete base.thermosMeasurements;
  delete base.thermosOrders;
  return {
    ...base,
    latestMeasurement: latestMeasurement ? {
      ...latestMeasurement,
      requestedAt: iso(latestMeasurement.requestedAt),
      receivedAt: iso(latestMeasurement.receivedAt),
      validatedAt: iso(latestMeasurement.validatedAt),
      createdAt: iso(latestMeasurement.createdAt),
      updatedAt: iso(latestMeasurement.updatedAt),
    } : null,
    latestThermosOrder: latestThermosOrder ? {
      ...latestThermosOrder,
      sentAt: iso(latestThermosOrder.sentAt),
      expectedReadyAt: iso(latestThermosOrder.expectedReadyAt),
      lastReminderAt: iso(latestThermosOrder.lastReminderAt),
      readyAt: iso(latestThermosOrder.readyAt),
      receivedAt: iso(latestThermosOrder.receivedAt),
      createdAt: iso(latestThermosOrder.createdAt),
      updatedAt: iso(latestThermosOrder.updatedAt),
    } : null,
  };
}

function activityItem(item) {
  return {
    ...item,
    date: iso(item.date),
  };
}

async function attachCentralActivity(followUps) {
  if (followUps.length === 0) return followUps;

  const followUpIds = followUps.map((followUp) => followUp.id).filter(Boolean);
  const contacts = followUps.map(contactForFollowUp);
  const clientIds = [...new Set(contacts.map((c) => c.clientId).filter(Boolean))];
  const phoneSuffixes = [...new Set(contacts.flatMap((c) => c.phones.map((p) => p.slice(-7))).filter(Boolean))];
  const emails = [...new Set(contacts.flatMap((c) => c.emails).filter(Boolean))];

  // FIX explosion memoire (hard-reset du conteneur): AVANT, clientOr contenait une condition
  // { client: {...} } par email et par telephone. Prisma emet alors un LEFT JOIN clients PAR
  // condition -> sur work_orders, des CENTAINES de jointures identiques -> le planificateur
  // PostgreSQL explosait (plusieurs Go, etat BIND) et faisait tomber toute la VM (swap=0).
  // Solution: resoudre les IDs clients correspondants en UNE requete sur la table clients
  // (predicats OR sur une seule table = aucune jointure), puis filtrer work_orders par
  // clientId IN (...) = une seule condition, zero jointure superflue.
  const matchedClientIds = new Set(clientIds);
  if (emails.length || phoneSuffixes.length) {
    const matchedClients = await prisma.client.findMany({
      where: {
        OR: [
          ...emails.map((email) => ({ email: { equals: email, mode: "insensitive" } })),
          ...phoneSuffixes.map((suffix) => ({ phone: { contains: suffix } })),
          ...phoneSuffixes.map((suffix) => ({ secondaryPhone: { contains: suffix } })),
        ],
      },
      select: { id: true },
    });
    for (const c of matchedClients) matchedClientIds.add(c.id);
  }
  const allClientIds = [...matchedClientIds];

  const clientOr = allClientIds.length ? [{ clientId: { in: allClientIds } }] : [];

  const clientMatchOr = [];
  if (clientIds.length) clientMatchOr.push({ id: { in: clientIds } });
  for (const email of emails) clientMatchOr.push({ email: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) clientMatchOr.push({ phone: { contains: suffix } });
  for (const suffix of phoneSuffixes) clientMatchOr.push({ secondaryPhone: { contains: suffix } });

  const contactOr = [];
  for (const email of emails) contactOr.push({ email: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) contactOr.push({ phone: { contains: suffix } });

  const chatOr = [];
  for (const email of emails) chatOr.push({ clientEmail: { equals: email, mode: "insensitive" } });
  for (const suffix of phoneSuffixes) chatOr.push({ clientPhone: { contains: suffix } });

  const [workOrders, appointments, chats, openings, clientPhotos] = await Promise.all([
    clientOr.length ? prisma.workOrder.findMany({
      where: { OR: clientOr },
      select: {
        id: true,
        number: true,
        clientId: true,
        followUpId: true,
        statut: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        total: true,
        description: true,
        photos: true,
        client: { select: { id: true, name: true, phone: true, secondaryPhone: true, email: true, city: true } },
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
            client: { select: { id: true, name: true, phone: true, secondaryPhone: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }) : [],
    (followUpIds.length || clientIds.length) ? prisma.clientPhoto.findMany({
      where: {
        OR: [
          followUpIds.length ? { followUpId: { in: followUpIds } } : null,
          clientIds.length ? { clientId: { in: clientIds } } : null,
        ].filter(Boolean),
      },
      select: {
        id: true,
        clientId: true,
        followUpId: true,
        title: true,
        notes: true,
        url: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, name: true, phone: true, secondaryPhone: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }) : [],
  ]);

  return followUps.map((followUp) => {
    const contact = contactForFollowUp(followUp);

    const relatedWorkOrders = workOrders
      .filter((wo) => wo.followUpId === followUp.id || sameContact(contact, { clientId: wo.clientId, phone: wo.client?.phone, secondaryPhone: wo.client?.secondaryPhone, email: wo.client?.email }))
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
        secondaryPhone: opening.unit?.client?.secondaryPhone,
        email: opening.unit?.client?.email,
      }))
      .slice(0, 50);
    const relatedClientPhotos = clientPhotos
      .filter((photo) => photo.followUpId === followUp.id || sameContact(contact, {
        clientId: photo.clientId,
        phone: photo.client?.phone,
        secondaryPhone: photo.client?.secondaryPhone,
        email: photo.client?.email,
      }))
      .slice(0, 80);

    const relatedPhotos = [
      ...relatedClientPhotos.map((photo) => activityItem({
        id: `client-photo-${photo.id}`,
        photoId: photo.id,
        type: "client_photo",
        source: photo.source === "admin" ? "Ajout admin" : photo.source,
        title: photo.title || "Photo client",
        subtitle: photo.notes || photo.client?.name || "",
        url: photo.url,
        date: photo.createdAt || photo.updatedAt,
        canDelete: true,
      })),
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
        href: `/admin/bons/nouveau?edit=${wo.id}`,
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
        href: `/admin/bons/nouveau?edit=${wo.id}`,
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
        status: unreadConversationCount(chat.unreadCount) > 0 ? "1 non-lu" : (chat.isArchived ? "archive" : "actif"),
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
          unreadCount: unreadConversationCount(chat.unreadCount),
          isArchived: chat.isArchived,
          lastMessageAt: iso(chat.lastMessageAt),
          lastMessage: chat.messages?.[0]?.content || "",
          href: `/admin/chat/${chat.id}`,
        })),
        workOrders: relatedWorkOrders.map((wo) => ({
          id: wo.id,
          number: wo.number,
          followUpId: wo.followUpId,
          statut: wo.statut,
          date: iso(wo.date),
          updatedAt: iso(wo.updatedAt),
          total: serializeMoney(wo.total),
          description: wo.description,
          technicianName: wo.technician?.name || null,
          href: `/admin/bons/nouveau?edit=${wo.id}`,
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
  const clientId = Number(searchParams.get("clientId"));
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
  const includeActivity = searchParams.get("activity") !== "0";

  const where = {};
  if (Number.isFinite(clientId) && clientId > 0) where.clientId = clientId;
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
      { client: { secondaryPhone: { contains: q } } },
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
          secondaryPhone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
      thermosMeasurements: {
        where: { status: { not: "cancelled" } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          source: true,
          status: true,
          accuracy: true,
          windowCount: true,
          paneCount: true,
          requestedAt: true,
          receivedAt: true,
          validatedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      thermosOrders: {
        where: { status: { not: "cancelled" } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          number: true,
          status: true,
          supplierNameSnapshot: true,
          sentAt: true,
          expectedReadyAt: true,
          lastReminderAt: true,
          reminderCount: true,
          readyAt: true,
          receivedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" }, // plus récents en haut, anciens en bas
    take: limit,
  });

  if (!includeActivity) {
    // Notifications de carte (coin supérieur droit du suivi) : photos envoyées
    // par le client (source "client") + messages de chat non lus. Deux requêtes
    // légères, matchées par clientId puis par numéro (10 chiffres vérifiés).
    const clientIds = [...new Set(followUps.map((f) => f.clientId).filter(Boolean))];
    const [photoGroups, unreadConvs, allClientFollowUps] = await Promise.all([
      clientIds.length
        ? prisma.clientPhoto.groupBy({
            by: ["clientId"],
            where: { clientId: { in: clientIds }, source: "client" },
            _count: { _all: true },
            _max: { createdAt: true },
          })
        : [],
      prisma.chatConversation.findMany({
        where: { unreadCount: { gt: 0 } },
        select: { id: true, clientId: true, clientPhone: true, unreadCount: true },
      }),
      // Rang chronologique du dossier par client (« Alex #3 » = 3e dossier).
      clientIds.length
        ? prisma.clientFollowUp.findMany({
            where: { clientId: { in: clientIds } },
            select: { id: true, clientId: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          })
        : [],
    ]);
    const rankById = new Map();
    const rankCounters = new Map();
    for (const f of allClientFollowUps) {
      const n = (rankCounters.get(f.clientId) || 0) + 1;
      rankCounters.set(f.clientId, n);
      rankById.set(f.id, n);
    }
    const photosByClient = new Map(photoGroups.map((g) => [g.clientId, { count: g._count._all, lastAt: g._max.createdAt?.toISOString() || null }]));
    const tenDigits = (p) => {
      const d = String(p || "").replace(/\D/g, "").slice(-10);
      return d.length === 10 ? d : null;
    };
    const convByClient = new Map();
    const convByPhone = new Map();
    for (const c of unreadConvs) {
      if (c.clientId) convByClient.set(c.clientId, c);
      const d = tenDigits(c.clientPhone);
      if (d) convByPhone.set(d, c);
    }
    return NextResponse.json(followUps.map((fu) => {
      const conv =
        (fu.clientId && convByClient.get(fu.clientId)) ||
        convByPhone.get(tenDigits(fu.phone)) ||
        convByPhone.get(tenDigits(fu.client?.phone)) ||
        convByPhone.get(tenDigits(fu.client?.secondaryPhone)) ||
        null;
      return {
        ...serializeFollowUpOperations(fu),
        clientPhotos: (fu.clientId && photosByClient.get(fu.clientId)) || null,
        unreadChat: conv ? { conversationId: conv.id, count: conv.unreadCount } : null,
        followUpRank: rankById.get(fu.id) || null,
      };
    }));
  }

  const enriched = await attachCentralActivity(followUps);
  return NextResponse.json(enriched.map(serializeFollowUpOperations));
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  let clientId = body.clientId ? Number(body.clientId) : null;
  let client = clientId
    ? await prisma.client.findUnique({ where: { id: clientId } })
    : null;

  // "Tout pend d'une fiche client" : si aucun client fourni, on rattache à un client
  // existant (match unique tél/email) ou on crée une fiche légère.
  if (!client) {
    const phone = clean(body.phone);
    const email = cleanEmail(body.email);
    const suffix = normalizePhoneDigits(phone);
    if (suffix || email) {
      const matches = await prisma.client.findMany({
        where: {
          OR: [
            ...(email ? [{ email: { equals: email, mode: "insensitive" } }] : []),
            ...(suffix ? [{ phone: { contains: suffix.slice(-7) } }, { secondaryPhone: { contains: suffix.slice(-7) } }] : []),
          ],
        },
        select: { id: true, name: true, phone: true, secondaryPhone: true, email: true },
        take: 2,
      });
      if (matches.length === 1) client = matches[0];
    }
    if (!client) {
      const newName = clean(body.contactName) || clean(body.title) || "Client";
      try {
        client = await prisma.client.create({ data: { name: newName, phone, email } });
      } catch (e) {
        if (e?.code === "P2002" && email) client = await prisma.client.findUnique({ where: { email } });
        else throw e;
      }
    }
    clientId = client?.id || null;
  }

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
      phone: clean(body.phone) || client?.phone || client?.secondaryPhone || null,
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
          secondaryPhone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
  });

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "follow_up",
    entityId: followUp.id,
    label: `Suivi cree: ${followUp.title}`,
    metadata: {
      status: followUp.status,
      clientId: followUp.clientId,
      phone: followUp.phone,
      email: followUp.email,
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

  return NextResponse.json(serializeFollowUp(followUp));
}
