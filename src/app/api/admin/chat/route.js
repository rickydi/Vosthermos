import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { orderByIds, searchChatConversationIds } from "@/lib/search";

// Onglets comptes en base. Avant, la liste chargeait 300 conversations et les
// onglets les refiltraient cote client : avec 447 conversations, les 147 plus
// anciennes n'apparaissaient dans aucun onglet, et rien ne permettait de les
// retrouver puisqu'il n'y avait pas de recherche.
async function chatCounts(where) {
  const [all, unread, archived] = await Promise.all([
    prisma.chatConversation.count({ where: { ...where, isArchived: false } }),
    prisma.chatConversation.count({ where: { ...where, unreadCount: { gt: 0 } } }),
    prisma.chatConversation.count({ where: { ...where, isArchived: true } }),
  ]);
  return { all, unread, archived };
}

export async function GET(req) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const limit = Math.min(500, Math.max(25, Number(searchParams.get("limit") || 300)));
    const wantCounts = searchParams.get("counts") === "1";

    // La recherche fouille le nom, le courriel, le telephone (chiffres seuls) et
    // le CONTENU des messages : d'une vieille conversation, c'est souvent la
    // seule chose dont on se souvienne.
    const matchedIds = await searchChatConversationIds(q, { limit });
    const base = matchedIds ? { id: { in: matchedIds } } : {};

    // Compteurs lus AVANT d'ajouter l'onglet, et sur une copie : Prisma ne
    // serialise ses arguments qu'au moment du await.
    const countsPromise = wantCounts ? chatCounts({ ...base }) : null;

    const where = { ...base };
    if (filter === "unread") where.unreadCount = { gt: 0 };
    else if (filter === "archived") where.isArchived = true;
    else where.isArchived = false;

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, senderType: true, createdAt: true },
        },
      },
    });

    const ordered = matchedIds ? orderByIds(conversations, matchedIds) : conversations;
    const items = ordered.map((conversation) => ({
      ...conversation,
      unreadCount: Number(conversation.unreadCount || 0) > 0 ? 1 : 0,
    }));

    // Reponse enveloppee seulement si l'appelant demande les compteurs, pour ne
    // pas casser un consommateur qui attendrait un tableau.
    if (!countsPromise) return NextResponse.json(items);
    const counts = await countsPromise;
    const total = counts[filter] ?? counts.all;
    return NextResponse.json({ items, counts, total, truncated: items.length < total });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
