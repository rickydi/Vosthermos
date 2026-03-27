import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { formatPhone } from "@/lib/phone";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const hasContent = body.content && body.content.trim();
    const hasImage = body.imageUrl && body.imageUrl.trim();

    if (!hasContent && !hasImage) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.findUnique({ where: { id } });
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderType: "CLIENT",
        senderName: conversation.clientName,
        content: hasContent ? body.content.trim() : "",
        imageUrl: hasImage ? body.imageUrl.trim() : null,
      },
    });

    await prisma.chatConversation.update({
      where: { id },
      data: { lastMessageAt: new Date(), unreadCount: { increment: 1 } },
    });

    // SMS notification throttle (2 min)
    const shouldNotify =
      !conversation.lastNotifiedAt ||
      Date.now() - conversation.lastNotifiedAt.getTime() > 2 * 60 * 1000;

    if (shouldNotify) {
      await prisma.chatConversation.update({
        where: { id },
        data: { lastNotifiedAt: new Date() },
      });

      const members = await prisma.chatNotifyMember.findMany({ where: { isActive: true } });

      const dayKeys = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }));
      const todayKey = dayKeys[now.getDay()];

      const availableMembers = members.filter((m) => {
        const schedule = m.schedule;
        if (!schedule) return true;
        return schedule[todayKey] !== false;
      });

      if (availableMembers.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
        const preview = hasContent ? body.content.trim().substring(0, 100) : "[Image]";
        const phoneDisplay = formatPhone(conversation.clientPhone);
        const availableNames = availableMembers.map((m) => m.name).join(", ");

        for (const member of availableMembers) {
          const smsBody = `\u{1F4AC} ${conversation.clientName} ${phoneDisplay}\n\n"${preview}"\n\nEnvoye a: ${availableNames}\n${baseUrl}/admin/chat/${id}`;
          sendSms(member.phone, smsBody);
        }
      }
    }

    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
