import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, signToken } from "@/lib/admin-auth";
import { sendSms } from "@/lib/twilio";
import { logAdminActivity } from "@/lib/admin-activity";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

// Formatte un numéro local en E.164 pour Twilio (514-825-8411 -> +15148258411).
function toE164(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// « Demander des photos par texto » : génère un lien public signé (token JWT à
// purpose dédié, 7 jours — getAdminSession refuse les tokens à purpose, donc ce
// lien ne donne AUCUN accès admin) et l'envoie par SMS au client. Si Twilio
// n'est pas configuré, on renvoie quand même le lien pour l'envoyer à la main.
export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, phone: true, secondaryPhone: true },
  });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const token = signToken({ purpose: "client_photo_upload", clientId });
  const link = `${SITE_URL}/envoyer-photos/${token}`;

  const to = toE164(client.phone || client.secondaryPhone);
  if (!to) {
    return NextResponse.json({ sent: false, link, error: "Le client n'a pas de numéro de téléphone valide" });
  }

  const message = `Vosthermos : envoyez-nous vos photos (fenêtre, porte, thermos…) en cliquant ici : ${link} — lien valide 7 jours. Merci!`;
  const sid = await sendSms(to, message);

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "client_photo_request",
    entityId: clientId,
    label: `Lien photos ${sid ? "texté" : "généré (SMS non parti)"} pour ${client.name}`,
    metadata: { clientId, sent: !!sid },
  });

  return NextResponse.json({ sent: !!sid, link, phone: client.phone || client.secondaryPhone });
}
