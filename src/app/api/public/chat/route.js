import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { upsertClientFromLead } from "@/lib/upsert-client";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.clientName || !body.clientPhone || !body.clientEmail) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const clientPhone = body.clientPhone.replace(/[\s\-().]/g, "");
    const clientEmail = body.clientEmail.trim().toLowerCase();
    const clientName = body.clientName.trim();

    const existing = await prisma.chatConversation.findUnique({
      where: { clientPhone },
    });

    if (existing) {
      const nameMatch = existing.clientName.trim().toLowerCase() === clientName.toLowerCase();
      const emailMatch = existing.clientEmail?.trim().toLowerCase() === clientEmail;

      if (!nameMatch || !emailMatch) {
        return NextResponse.json(
          { error: "Les informations ne correspondent pas a ce numero." },
          { status: 403 }
        );
      }

      await upsertClientFromLead({ name: clientName, phone: clientPhone, email: clientEmail, source: "chat" });
      return NextResponse.json({ id: existing.id });
    }

    const conversation = await prisma.chatConversation.create({
      data: { clientName, clientPhone, clientEmail },
    });

    await upsertClientFromLead({ name: clientName, phone: clientPhone, email: clientEmail, source: "chat" });

    return NextResponse.json({ id: conversation.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
