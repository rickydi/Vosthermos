import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sendClientPhotoRequestEmail } from "@/lib/mail";
import { buildPhotoUploadLink, sendPhotoRequestSms, toE164 } from "@/lib/photo-request";
import { logAdminActivity } from "@/lib/admin-activity";

// « Demander des photos » par texto OU courriel ({ channel: "sms" | "email" }) :
// génère un lien public signé (token JWT à purpose dédié, 7 jours — getAdminSession
// refuse les tokens à purpose, donc ce lien ne donne AUCUN accès admin) et l'envoie
// au client. Si l'envoi échoue, on renvoie quand même le lien pour l'envoyer à la main.
export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, contactName: true, phone: true, secondaryPhone: true, email: true },
  });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const channel = ["email", "link"].includes(body.channel) ? body.channel : "sms";

  const link = buildPhotoUploadLink(clientId);
  const displayName = (client.contactName || client.name || "").trim();

  let sent = false;
  let error = null;

  if (channel === "link") {
    // Génération seule : l'admin copie le lien et l'envoie par le moyen qu'il veut.
  } else if (channel === "email") {
    if (!client.email) {
      return NextResponse.json({ sent: false, link, error: "Le client n'a pas de courriel au dossier" });
    }
    try {
      sent = await sendClientPhotoRequestEmail(client.email, {
        clientName: displayName,
        link,
      });
      if (!sent) error = "Courriel non configuré sur le serveur";
    } catch (err) {
      console.error("[photo-request] email error:", err?.message || err);
      error = "Le courriel n'est pas parti — réessayez ou copiez le lien";
    }
  } else {
    if (!toE164(client.phone || client.secondaryPhone)) {
      return NextResponse.json({ sent: false, link, error: "Le client n'a pas de numéro de téléphone valide" });
    }
    sent = await sendPhotoRequestSms(client, { link });
    if (!sent) error = "Le texto n'est pas parti (SMS non configuré)";
  }

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "client_photo_request",
    entityId: clientId,
    label: channel === "link"
      ? `Lien photos généré (copie manuelle) pour ${client.name}`
      : `Lien photos ${sent ? "envoyé" : "généré (envoi raté)"} par ${channel === "email" ? "courriel" : "texto"} pour ${client.name}`,
    metadata: { clientId, channel, sent },
  });

  return NextResponse.json({
    sent,
    link,
    channel,
    phone: client.phone || client.secondaryPhone,
    email: client.email,
    ...(error ? { error } : {}),
  });
}
