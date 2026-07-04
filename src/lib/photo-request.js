import { signToken } from "@/lib/admin-auth";
import { sendSms } from "@/lib/twilio";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

// Clé site_settings : "1" = texter automatiquement la demande de photos au
// client après l'enregistrement d'un appel (/admin/appel).
export const APPEL_AUTO_PHOTO_SMS_KEY = "appel_auto_photo_sms";

// Lien public de dépôt de photos (token JWT à purpose dédié, 7 jours —
// getAdminSession refuse les tokens à purpose : aucun accès admin possible).
export function buildPhotoUploadLink(clientId) {
  const token = signToken({ purpose: "client_photo_upload", clientId });
  return `${SITE_URL}/envoyer-photos/${token}`;
}

// Formatte un numéro local en E.164 pour Twilio (514-825-8411 -> +15148258411).
export function toE164(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Texte le lien de dépôt de photos au client. Retourne true si le SMS est parti.
// `link` optionnel : permet de réutiliser un lien déjà généré (sinon on en crée un).
export async function sendPhotoRequestSms(client, { link } = {}) {
  const to = toE164(client?.phone || client?.secondaryPhone);
  if (!to || !client?.id) return false;
  const displayName = (client.contactName || client.name || "").trim();
  const url = link || buildPhotoUploadLink(client.id);
  const message = `${displayName ? `Bonjour ${displayName}! ` : ""}Vosthermos : envoyez-nous vos photos (fenêtre, porte, thermos…) en cliquant ici : ${url} — lien valide 7 jours. Merci!`;
  const sid = await sendSms(to, message);
  return !!sid;
}
