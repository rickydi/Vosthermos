import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { upsertClientFromLead } from "@/lib/upsert-client";
import { APPEL_AUTO_PHOTO_SMS_KEY, sendPhotoRequestSms } from "@/lib/photo-request";

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

    // PAS d'unreadCount ici : c'est NOUS qui saisissons l'appel, pas une demande
    // entrante à traiter — le badge rouge du chat ne doit pas clignoter.
    let conversation;
    if (existing) {
      conversation = await prisma.chatConversation.update({
        where: { id: existing.id },
        data: {
          lastMessageAt: new Date(),
          isArchived: false,
          // On garde le nom existant s'il est plus complet que la saisie rapide.
          ...(existing.clientName === "Client (appel)" && clientName !== "Client (appel)"
            ? { clientName }
            : {}),
        },
      });
    } else {
      conversation = await prisma.chatConversation.create({
        data: { clientName, clientPhone, source: "appel", unreadCount: 0 },
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

    const client = await upsertClientFromLead({
      name: conversation.clientName,
      phone: clientPhone,
      address: address || undefined,
      city: city || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      notes: note || undefined,
      source: "appel",
    });

    // Demande de photos par texto. Le choix fait DANS la page d'appel prime sur
    // l'option globale (Paramètres > Appels) : sans ce garde-fou, tout appel
    // enregistré déclenchait un texto, y compris pour un vendeur ou un appel
    // personnel. `sendPhotoSms` absent = on retombe sur l'option globale, pour
    // ne rien changer aux appelants qui n'envoient pas ce champ.
    let photoSms = null;
    try {
      let wanted;
      if (body.sendPhotoSms === true || body.sendPhotoSms === false) {
        wanted = body.sendPhotoSms;
      } else {
        const setting = await prisma.siteSetting.findUnique({
          where: { key: APPEL_AUTO_PHOTO_SMS_KEY },
          select: { value: true },
        });
        wanted = setting?.value === "1";
      }
      if (wanted && client) {
        photoSms = (await sendPhotoRequestSms(client)) ? "sent" : "failed";
      } else if (wanted && !client) {
        photoSms = "failed";
      }
    } catch (err) {
      console.error("[appels] photo sms error:", err?.message || err);
      photoSms = "failed";
    }

    return NextResponse.json({ ok: true, id: conversation.id, existing: Boolean(existing), photoSms });
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
