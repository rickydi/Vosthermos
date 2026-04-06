import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// NOTE: Requires SQL migration:
// ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMPTZ;

export async function GET(_req, { params }) {
  try {
    const { id } = await params;

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, senderType: true, content: true, imageUrl: true, createdAt: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update lastSeenAt when client fetches messages (online presence)
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE chat_conversations SET "lastSeenAt" = NOW() WHERE id = $1`,
        id
      );
    } catch {}

    return NextResponse.json({
      id: conversation.id,
      clientName: conversation.clientName,
      messages: conversation.messages,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
