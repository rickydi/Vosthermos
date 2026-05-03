import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    await prisma.chatConversation.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });

    return NextResponse.json({
      id: conversation.id,
      clientName: conversation.clientName,
      messages: conversation.messages,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
