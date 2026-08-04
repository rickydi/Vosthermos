import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// « Qui appelle ? » — repond des l'ouverture de /admin/appel?tel=...
// Avant, la page ne disait qui etait au bout du fil qu'APRES l'enregistrement
// de l'appel. On veut l'inverse : savoir tout de suite si c'est un client
// connu, pour ne poser la question « client Vosthermos ? » que sur un vrai
// inconnu.
//
// Le rapprochement se fait sur les CHIFFRES du numero (vt_digits) : neuf
// formats de telephone coexistent en base, un LIKE brut en raterait la plupart.
export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const digits = String(searchParams.get("tel") || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) {
    return NextResponse.json({ digits, known: false, client: null });
  }

  const rows = await prisma.$queryRaw`
    SELECT id
    FROM clients
    WHERE vt_digits(coalesce(phone, '')) LIKE ${`%${digits}%`}
       OR vt_digits(coalesce(secondary_phone, '')) LIKE ${`%${digits}%`}
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `;
  const clientId = rows[0] ? Number(rows[0].id) : null;

  if (!clientId) {
    // Numero absent des fiches clients : reste-t-il une trace d'un ancien appel
    // ou d'une conversation ? Utile pour ne pas traiter en inconnu quelqu'un
    // qui a deja ecrit dans le chat.
    const conversation = await prisma.chatConversation.findFirst({
      where: { clientPhone: { contains: digits.slice(-7) } },
      select: { id: true, clientName: true, lastMessageAt: true },
      orderBy: { lastMessageAt: "desc" },
    });
    return NextResponse.json({
      digits,
      known: false,
      client: null,
      conversation: conversation
        ? { id: conversation.id, name: conversation.clientName, lastAt: conversation.lastMessageAt?.toISOString() || null }
        : null,
    });
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
        select: { number: true, date: true, statut: true, description: true },
      },
      followUps: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, title: true, service: true, outcome: true, createdAt: true },
      },
    },
  });

  const lastOrder = client?.workOrders?.[0] || null;
  const lastFollowUp = client?.followUps?.[0] || null;

  return NextResponse.json({
    digits,
    known: true,
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
        ? { number: lastOrder.number, date: lastOrder.date?.toISOString() || null, statut: lastOrder.statut, description: lastOrder.description }
        : null,
      lastFollowUp: lastFollowUp
        ? { id: lastFollowUp.id, title: lastFollowUp.title, service: lastFollowUp.service, outcome: lastFollowUp.outcome, createdAt: lastFollowUp.createdAt?.toISOString() || null }
        : null,
    },
  });
}
