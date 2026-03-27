import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(_req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (conversation.unreadCount > 0) {
      await prisma.chatConversation.update({
        where: { id },
        data: { unreadCount: 0 },
      });
      conversation.unreadCount = 0;
    }

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { isArchived: body.isArchived },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
