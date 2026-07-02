import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { upsertClientFromLead } from "@/lib/upsert-client";

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  // Retire le 1 nord-americain en tete si present (11 chiffres).
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

function buildCallSummary({ service, address, city, note }) {
  const parts = ["📞 Appel reçu"];
  if (service) parts.push(service);
  if (address) parts.push(address);
  else if (city) parts.push(city);
  let summary = parts.join(" — ");
  if (note) summary += `\n${note}`;
  return summary;
}

export async function POST(req) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const clientPhone = normalizePhone(body.phone);
    if (clientPhone.length !== 10) {
      return NextResponse.json({ error: "Numéro de téléphone invalide (10 chiffres requis)." }, { status: 400 });
    }

    const clientName = String(body.name || "").trim() || "Client (appel)";
    const service = String(body.service || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const province = String(body.province || "").trim();
    const note = String(body.note || "").trim();
    const content = buildCallSummary({ service, address, city, note });

    const existing = await prisma.chatConversation.findUnique({ where: { clientPhone } });

    let conversation;
    if (existing) {
      conversation = await prisma.chatConversation.update({
        where: { id: existing.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
          isArchived: false,
          // On garde le nom existant s'il est plus complet que la saisie rapide.
          ...(existing.clientName === "Client (appel)" && clientName !== "Client (appel)"
            ? { clientName }
            : {}),
        },
      });
    } else {
      conversation = await prisma.chatConversation.create({
        data: { clientName, clientPhone, source: "appel", unreadCount: 1 },
      });
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "client",
        senderName: conversation.clientName,
        content,
      },
    });

    await upsertClientFromLead({
      name: conversation.clientName,
      phone: clientPhone,
      address: address || undefined,
      city: city || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      notes: note || undefined,
      source: "appel",
    });

    return NextResponse.json({ ok: true, id: conversation.id, existing: Boolean(existing) });
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
