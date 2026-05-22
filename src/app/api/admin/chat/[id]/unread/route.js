import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(req, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          select: { id: true, senderType: true, content: true, createdAt: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const unreadCount = 1;

    const updated = await prisma.chatConversation.update({
      where: { id },
      data: { unreadCount },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    await logAdminActivity(req, session, {
      action: "mark_unread",
      entityType: "chat",
      entityId: id,
      label: `Chat remis non vu: ${conversation.clientName}`,
      metadata: {
        clientPhone: conversation.clientPhone,
        clientEmail: conversation.clientEmail,
        unreadCount,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
