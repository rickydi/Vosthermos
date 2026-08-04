import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { recordCall } from "@/lib/record-call";

export async function POST(req) {
  try {
    await requireAdmin();
    const body = await req.json();

    // Logique partagee avec l app mobile (/api/app/call) : meme conversation,
    // meme resume, meme regle de texto, meme gestion de la date.
    const result = await recordCall(body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      ok: true,
      id: result.conversationId,
      existing: result.existing,
      photoSms: result.photoSms,
    });
  } catch (error) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[appels] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Liste des appels du jour (pour rassurer la personne qui saisit).
export async function GET() {
  try {
    await requireAdmin();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const messages = await prisma.chatMessage.findMany({
      where: {
        senderType: "client",
        createdAt: { gte: startOfDay },
        content: { startsWith: "📞 Appel reçu" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        content: true,
        conversation: { select: { id: true, clientName: true, clientPhone: true } },
      },
    });

    return NextResponse.json({
      count: messages.length,
      calls: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversation.id,
        name: m.conversation.clientName,
        phone: m.conversation.clientPhone,
        at: m.createdAt,
        summary: m.content,
      })),
    });
  } catch (error) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[appels] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
