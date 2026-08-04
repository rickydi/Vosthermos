import prisma from "@/lib/prisma";

// « Qui appelle ? » — partage entre la page admin (/api/admin/appels/lookup) et
// l'app mobile (/api/app/lookup), pour que les deux disent exactement la meme
// chose.
//
// Le rapprochement se fait sur les CHIFFRES du numero (vt_digits) : neuf formats
// de telephone coexistent en base, un LIKE brut en raterait la plupart.
export async function lookupCaller(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return { digits, known: false, client: null, conversation: null };

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
    // Pas de fiche, mais peut-etre une conversation de chat : ce n'est alors pas
    // tout a fait un inconnu, et l'app doit pouvoir le dire.
    const conversation = await prisma.chatConversation.findFirst({
      where: { clientPhone: { contains: digits.slice(-7) } },
      select: { id: true, clientName: true, lastMessageAt: true },
      orderBy: { lastMessageAt: "desc" },
    });
    return {
      digits,
      known: false,
      client: null,
      conversation: conversation
        ? {
            id: conversation.id,
            name: conversation.clientName,
            lastAt: conversation.lastMessageAt?.toISOString() || null,
          }
        : null,
    };
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

  return {
    digits,
    known: true,
    conversation: null,
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
            description: lastOrder.description,
          }
        : null,
      lastFollowUp: lastFollowUp
        ? {
            id: lastFollowUp.id,
            title: lastFollowUp.title,
            service: lastFollowUp.service,
            outcome: lastFollowUp.outcome,
            createdAt: lastFollowUp.createdAt?.toISOString() || null,
          }
        : null,
    },
  };
}

/**
 * Resume court pour l'affichage sur le telephone : une ligne, lisible d'un coup
 * d'oeil pendant que l'appel est en cours.
 */
export function callerSummary(result) {
  if (!result?.known || !result.client) return null;
  const c = result.client;
  const parts = [];
  if (c.workOrderCount > 0) parts.push(`${c.workOrderCount} bon${c.workOrderCount > 1 ? "s" : ""}`);
  if (c.city) parts.push(c.city);
  if (c.clientSince) parts.push(`client depuis ${new Date(c.clientSince).getFullYear()}`);
  return parts.join(" · ");
}
