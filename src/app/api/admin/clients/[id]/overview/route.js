import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeFollowUp, normalizePhoneDigits } from "@/lib/follow-up-utils";
import { workOrderStatusLabel } from "@/lib/work-order-status";

export const dynamic = "force-dynamic";

const iso = (v) => v?.toISOString?.() || null;
const num = (v) => (v === null || v === undefined ? null : Number(v));
const IMG_RE = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i; // exclut les vidéos du chat

// Vue 360 d'UN client : suivis, dossiers (bons/soumissions/factures = WorkOrder),
// photos, RDV et chats. RDV/chats n'ont pas encore de clientId -> rattachés par
// matching téléphone/email (sera remplacé par une FK propre en Phase 0).
export async function GET(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isFinite(clientId) || clientId <= 0) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, phone: true, secondaryPhone: true, notes: true },
  });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const phoneSuffixes = [normalizePhoneDigits(client.phone), normalizePhoneDigits(client.secondaryPhone)]
    .filter(Boolean)
    .map((p) => p.slice(-7));
  const emails = [client.email].filter(Boolean).map((e) => e.toLowerCase());

  const [followUps, workOrders, clientPhotos] = await Promise.all([
    prisma.clientFollowUp.findMany({
      where: { clientId },
      orderBy: [{ nextActionDate: "asc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    prisma.workOrder.findMany({
      where: { clientId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true, number: true, statut: true, date: true, createdAt: true, updatedAt: true,
        total: true, subtotal: true, description: true, photos: true, signatureUrl: true,
        invoiceSentAt: true, paidAt: true, paymentDueAt: true, paymentMethod: true, followUpId: true,
        technician: { select: { name: true } },
        _count: { select: { items: true, payments: true } },
      },
    }),
    prisma.clientPhoto.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, url: true, title: true, notes: true, source: true, createdAt: true, followUpId: true },
    }),
  ]);

  const apptOr = [
    ...emails.map((e) => ({ email: { equals: e, mode: "insensitive" } })),
    ...phoneSuffixes.map((s) => ({ phone: { contains: s } })),
  ];
  const chatOr = [
    { clientId },
    ...emails.map((e) => ({ clientEmail: { equals: e, mode: "insensitive" } })),
    ...phoneSuffixes.map((s) => ({ clientPhone: { contains: s } })),
  ];

  const [appointments, chats] = await Promise.all([
    apptOr.length
      ? prisma.appointment.findMany({
          where: { OR: apptOr },
          orderBy: { date: "desc" },
          take: 100,
          select: { id: true, serviceType: true, date: true, timeSlot: true, status: true, notes: true, address: true, city: true, createdAt: true },
        })
      : [],
    chatOr.length
      ? prisma.chatConversation.findMany({
          where: { OR: chatOr },
          orderBy: { lastMessageAt: "desc" },
          take: 50,
          select: {
            id: true, clientName: true, lastMessageAt: true, unreadCount: true, isArchived: true, createdAt: true,
            messages: { take: 6, orderBy: { createdAt: "desc" }, select: { content: true, senderType: true, imageUrl: true, createdAt: true } },
          },
        })
      : [],
  ]);

  // Photos envoyées dans le clavardage du site (surtout par le client via le widget).
  const convIds = chats.map((c) => c.id);
  const chatImages = convIds.length
    ? await prisma.chatMessage.findMany({
        where: { conversationId: { in: convIds }, imageUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, imageUrl: true, senderType: true, createdAt: true },
      })
    : [];

  const photos = [
    ...chatImages
      .filter((m) => IMG_RE.test(m.imageUrl))
      .map((m) => ({
        id: `chat-${m.id}`,
        url: m.imageUrl,
        title: null,
        source: "chat",
        date: iso(m.createdAt),
        from: m.senderType === "CLIENT" ? "Chat (client)" : "Chat (nous)",
      })),
    ...clientPhotos.map((p) => ({
      id: `cp-${p.id}`,
      url: p.url,
      title: p.title,
      source: p.source,
      date: iso(p.createdAt),
      from: p.source === "terrain" ? "Terrain" : p.source === "chat" ? "Chat" : p.source === "client" ? "Client (texto)" : "Admin",
    })),
    ...workOrders.flatMap((wo) =>
      (Array.isArray(wo.photos) ? wo.photos : []).map((url, i) => ({
        id: `wo-${wo.id}-${i}`,
        url,
        title: null,
        source: "work_order",
        date: iso(wo.date || wo.createdAt),
        from: `Bon #${wo.number}`,
      })),
    ),
  ];

  const serializedWO = workOrders.map((wo) => ({
    id: wo.id,
    number: wo.number,
    statut: wo.statut,
    statutLabel: workOrderStatusLabel(wo.statut),
    date: iso(wo.date),
    updatedAt: iso(wo.updatedAt),
    total: num(wo.total),
    subtotal: num(wo.subtotal),
    description: wo.description,
    technicianName: wo.technician?.name || null,
    itemsCount: wo._count?.items || 0,
    paymentsCount: wo._count?.payments || 0,
    photosCount: Array.isArray(wo.photos) ? wo.photos.length : 0,
    hasSignature: !!wo.signatureUrl,
    invoiceSentAt: iso(wo.invoiceSentAt),
    paidAt: iso(wo.paidAt),
    paymentDueAt: iso(wo.paymentDueAt),
    paymentMethod: wo.paymentMethod,
    followUpId: wo.followUpId,
  }));

  return NextResponse.json({
    client: { id: client.id, name: client.name, notes: client.notes },
    followUps: followUps.map(serializeFollowUp),
    workOrders: serializedWO,
    photos,
    appointments: appointments.map((a) => ({ ...a, date: iso(a.date), createdAt: iso(a.createdAt) })),
    chats: chats.map((c) => ({
      ...c,
      lastMessageAt: iso(c.lastMessageAt),
      createdAt: iso(c.createdAt),
      messages: c.messages.map((m) => ({ ...m, createdAt: iso(m.createdAt) })),
    })),
    counts: {
      followUps: followUps.length,
      workOrders: serializedWO.length,
      photos: photos.length,
      appointments: appointments.length,
      chats: chats.length,
    },
  });
}
