import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDevice } from "@/lib/app-device";
import { serializeFollowUp } from "@/lib/follow-up-utils";
import { conversationIdsByPhoneDigits } from "@/lib/search";

export const dynamic = "force-dynamic";

// Le dossier d'un client pour l'ecran « client connu » de l'app : coordonnees
// completes + son suivi (le plus recent encore ouvert, sinon le dernier en
// date) serialise comme sur la page admin — l'app affiche et manipule les
// memes etats que Suivi clients.
export async function GET(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = Number(searchParams.get("clientId"));
  if (!Number.isFinite(clientId) || clientId <= 0) {
    return NextResponse.json({ error: "clientId requis" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true, name: true, type: true, company: true, contactName: true,
      phone: true, secondaryPhone: true, email: true,
      address: true, city: true, province: true, postalCode: true,
      createdAt: true,
      _count: { select: { workOrders: true } },
      workOrders: {
        orderBy: { date: "desc" },
        take: 1,
        select: { number: true, date: true, statut: true, total: true },
      },
    },
  });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  // Le dossier « courant » : ouvert de preference, sinon le plus recent.
  const followUp =
    (await prisma.clientFollowUp.findFirst({
      where: { clientId, outcome: { notIn: ["won", "lost"] } },
      orderBy: { createdAt: "desc" },
    })) ||
    (await prisma.clientFollowUp.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    }));

  // Photos du client (envoyees par lui via le lien texto, ou ajoutees a la
  // fiche) : miniatures affichees au bas de l'ecran mobile.
  const photos = await prisma.clientPhoto.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { id: true, url: true, title: true, source: true, createdAt: true },
  });

  // Historique des appels = union de DEUX sources :
  //   1. les appels NOTES (entrees « 📞 Appel reçu » de ses conversations) ;
  //   2. les appels RECUS consignes par l'app (call_events), meme jamais notes
  //      — c'est ce qui repond a « ce numero a appele 3 fois, dates ? ».
  const phoneDigitsList = [client.phone, client.secondaryPhone]
    .map((p) => String(p || "").replace(/\D/g, "").slice(-10))
    .filter((p) => p.length === 10);
  const conversationIds = await conversationIdsByPhoneDigits(phoneDigitsList);
  const [callMessages, callEvents] = await Promise.all([
    prisma.chatMessage.findMany({
      where: {
        content: { startsWith: "📞 Appel reçu" },
        conversation: {
          OR: [
            { clientId },
            ...(conversationIds.length ? [{ id: { in: conversationIds } }] : []),
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, content: true, createdAt: true },
    }),
    prisma.callEvent.findMany({
      where: {
        OR: [
          { clientId },
          ...(phoneDigitsList.length ? [{ phoneDigits: { in: phoneDigitsList } }] : []),
        ],
      },
      orderBy: { at: "desc" },
      take: 12,
      select: { id: true, at: true },
    }),
  ]);

  // Fusion : un evenement « recu » a moins de 3 minutes d'un appel note est le
  // MEME appel (l'evenement part a l'affichage, la note quelques instants plus
  // tard) — on garde la version notee, plus parlante.
  const noted = callMessages.map((message) => ({
    id: `note-${message.id}`,
    at: message.createdAt,
    noted: true,
    summary: String(message.content || "").replace(/^📞 Appel reçu\s*(—\s*)?/, "").trim() || "Appel",
  }));
  const rawEvents = callEvents
    .filter((event) => !noted.some((n) => Math.abs(n.at.getTime() - event.at.getTime()) < 3 * 60 * 1000))
    .map((event) => ({ id: `event-${event.id}`, at: event.at, noted: false, summary: "" }));
  const mergedCalls = [...noted, ...rawEvents]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);

  const lastOrder = client.workOrders?.[0] || null;
  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      type: client.type,
      company: client.company,
      contactName: client.contactName,
      phone: client.phone,
      secondaryPhone: client.secondaryPhone,
      email: client.email,
      address: client.address,
      city: client.city,
      province: client.province,
      postalCode: client.postalCode,
      clientSince: client.createdAt?.toISOString() || null,
      workOrderCount: client._count?.workOrders || 0,
      lastWorkOrder: lastOrder
        ? {
            number: lastOrder.number,
            date: lastOrder.date?.toISOString() || null,
            statut: lastOrder.statut,
            total: lastOrder.total === null || lastOrder.total === undefined ? null : Number(lastOrder.total),
          }
        : null,
    },
    followUp: followUp ? serializeFollowUp(followUp) : null,
    photos: photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      source: photo.source,
      createdAt: photo.createdAt?.toISOString() || null,
    })),
    calls: mergedCalls.map((call) => ({
      id: call.id,
      at: call.at?.toISOString() || null,
      noted: call.noted,
      summary: call.summary,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
