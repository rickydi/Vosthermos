import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, senderType: true, createdAt: true },
        },
      },
    });

    // Fetch lastSeenAt via raw query (column not in Prisma schema)
    let lastSeenMap = {};
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT id, "lastSeenAt" FROM chat_conversations WHERE "lastSeenAt" IS NOT NULL`
      );
      for (const r of rows) lastSeenMap[r.id] = r.lastSeenAt;
    } catch {}

    const enriched = conversations.map((c) => ({
      ...c,
      lastSeenAt: lastSeenMap[c.id] || null,
    }));

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
