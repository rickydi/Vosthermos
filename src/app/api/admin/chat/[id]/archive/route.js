import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(req, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { isArchived: !!body.isArchived },
    });
    await logAdminActivity(req, session, {
      action: conversation.isArchived ? "archive" : "unarchive",
      entityType: "chat",
      entityId: id,
      label: `${conversation.isArchived ? "Chat archive" : "Chat desarchive"}: ${conversation.clientName}`,
      metadata: { clientPhone: conversation.clientPhone, clientEmail: conversation.clientEmail },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
