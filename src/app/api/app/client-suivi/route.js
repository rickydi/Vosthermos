import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDevice } from "@/lib/app-device";
import { serializeFollowUp } from "@/lib/follow-up-utils";

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
  }, { headers: { "Cache-Control": "no-store" } });
}
