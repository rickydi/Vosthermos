import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sendSms } from "@/lib/twilio";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(req, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const senderName = session.email?.split("@")[0] || "Admin";
    const hasContent = body.content && body.content.trim();
    const hasImage = body.imageUrl && body.imageUrl.trim();

    if (!hasContent && !hasImage) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderType: "ADMIN",
        senderName,
        content: hasContent ? body.content.trim() : "",
        imageUrl: hasImage ? body.imageUrl.trim() : null,
      },
    });

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // SMS to client (throttled 2 min)
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    const shouldNotify = !conversation.lastNotifiedAt || conversation.lastNotifiedAt < twoMinAgo;

    if (shouldNotify) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
      const smsBody = `Vosthermos vous a repondu.\n${baseUrl}/c/${id}`;
      sendSms(conversation.clientPhone, smsBody);

      await prisma.chatConversation.update({
        where: { id },
        data: { lastNotifiedAt: new Date() },
      });
    }

    await logAdminActivity(req, session, {
      action: "send",
      entityType: "chat",
      entityId: id,
      label: `Reponse chat: ${conversation.clientName}`,
      metadata: {
        clientPhone: conversation.clientPhone,
        clientEmail: conversation.clientEmail,
        hasImage: !!message.imageUrl,
        preview: message.content?.slice(0, 120) || "",
      },
    });

    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
