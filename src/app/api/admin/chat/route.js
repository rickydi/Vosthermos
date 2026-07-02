import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    // Borne la liste aux 300 conversations les plus recentes pour que la
    // page chat reste rapide quand le volume grossit.
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 300,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, senderType: true, createdAt: true },
        },
      },
    });

    return NextResponse.json(conversations.map((conversation) => ({
      ...conversation,
      unreadCount: Number(conversation.unreadCount || 0) > 0 ? 1 : 0,
    })));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
