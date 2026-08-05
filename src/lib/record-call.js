import prisma from "@/lib/prisma";
import { upsertClientFromLead } from "@/lib/upsert-client";
import { APPEL_AUTO_PHOTO_SMS_KEY, sendPhotoRequestSms } from "@/lib/photo-request";

// Enregistrement d'un appel — partage entre la page admin (/api/admin/appels)
// et l'app mobile (/api/app/call), pour que les deux produisent exactement le
// meme resultat : meme conversation, meme resume, meme regle de texto.

export function normalizeCallPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  // Retire le 1 nord-americain en tete si present (11 chiffres).
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function buildCallSummary({ service, address, city, note }) {
  const parts = ["📞 Appel reçu"];
  if (service) parts.push(service);
  if (address) parts.push(address);
  else if (city) parts.push(city);
  let summary = parts.join(" — ");
  if (note) summary += `\n${note}`;
  return summary;
}

/**
 * Date de l'appel : « maintenant » par defaut, saisissable pour noter apres coup
 * un appel de la veille. Rejette le futur (faute de frappe sur l'annee) et
 * au-dela d'un an en arriere.
 */
export function parseCalledAt(value) {
  if (!value) return { at: new Date() };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { error: "Date d'appel invalide." };
  if (parsed.getTime() > Date.now() + 5 * 60 * 1000) return { error: "La date de l'appel est dans le futur." };
  if (parsed.getTime() < Date.now() - 366 * 24 * 3600 * 1000) return { error: "La date de l'appel remonte a plus d'un an." };
  return { at: parsed };
}

/**
 * Cree/complete la conversation, y ajoute le resume d'appel, met a jour la fiche
 * client et applique la regle de texto photos.
 *
 * @returns {{ok:true, conversationId:number, existing:boolean, photoSms:string|null, clientId:number|null}}
 *          ou {error:string, status:number}
 */
export async function recordCall(body = {}) {
  const clientPhone = normalizeCallPhone(body.phone);
  if (clientPhone.length !== 10) {
    return { error: "Numéro de téléphone invalide (10 chiffres requis).", status: 400 };
  }

  const clientName = String(body.name || "").trim() || "Client (appel)";
  const service = String(body.service || "").trim();
  const address = String(body.address || "").trim();
  const city = String(body.city || "").trim();
  const postalCode = String(body.postalCode || "").trim();
  const province = String(body.province || "").trim();
  const note = String(body.note || "").trim();
  const content = buildCallSummary({ service, address, city, note });

  const called = parseCalledAt(body.calledAt);
  if (called.error) return { error: called.error, status: 400 };
  const calledAt = called.at;

  const existing = await prisma.chatConversation.findUnique({ where: { clientPhone } });

  // PAS d'unreadCount ici : c'est NOUS qui saisissons l'appel, pas une demande
  // entrante a traiter — le badge rouge du chat ne doit pas clignoter.
  let conversation;
  if (existing) {
    conversation = await prisma.chatConversation.update({
      where: { id: existing.id },
      data: {
        // Un appel note apres coup ne doit pas faire RECULER la conversation
        // dans la liste du chat si un echange plus recent existe deja.
        lastMessageAt: existing.lastMessageAt && existing.lastMessageAt > calledAt
          ? existing.lastMessageAt
          : calledAt,
        isArchived: false,
        // On garde le nom existant s'il est plus complet que la saisie rapide.
        ...(existing.clientName === "Client (appel)" && clientName !== "Client (appel)"
          ? { clientName }
          : {}),
      },
    });
  } else {
    conversation = await prisma.chatConversation.create({
      data: { clientName, clientPhone, source: "appel", unreadCount: 0, lastMessageAt: calledAt },
    });
  }

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      senderType: "client",
      senderName: conversation.clientName,
      content,
      createdAt: calledAt,
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
    // Le client vient de NOUS appeler et on lui a repondu : le contact est
    // fait, le suivi ne doit pas naitre « À contacter ».
    alreadyContacted: true,
  });

  // Lier la conversation a la fiche : elle naissait sans clientId et le
  // restait pour toujours — badges non lus, onglet chat de la fiche et
  // historique d'appels devaient alors se rabattre sur le numero.
  if (client?.id && conversation.clientId !== client.id) {
    try {
      conversation = await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { clientId: client.id },
      });
    } catch (err) {
      console.error("[appels] liaison conversation-client:", err?.message || err);
    }
  }

  // Demande de photos par texto. Le choix fait dans l'interface prime sur
  // l'option globale (Parametres > Appels) : sans ce garde-fou, tout appel
  // enregistre declenchait un texto, y compris pour un vendeur.
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

  return {
    ok: true,
    conversationId: conversation.id,
    existing: Boolean(existing),
    photoSms,
    clientId: client?.id || null,
    clientName: conversation.clientName,
  };
}
