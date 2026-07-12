import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import { getMailEnvelopeFrom, getMailFromHeader, getReplyToEmail, getTransporter, isMailDeliveryConfigured } from "@/lib/mail";
import { toE164 } from "@/lib/photo-request";
import { sendSmsDetailed } from "@/lib/twilio";
import {
  getMeasurementById,
  hashPublicMeasurementToken,
  issuePublicMeasurementLink,
  measurementErrorResponse,
  PUBLIC_MEASUREMENT_LINK_DAYS,
  publicMeasurementUrl,
  resolveMeasurementClientName,
  serializeMeasurementBundle,
} from "@/lib/thermos-measurements";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[character]);
}

function normalizePhoneKey(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

function chooseAllowedValue(requested, candidates, normalize, label) {
  const available = candidates.filter(Boolean);
  if (!requested) return available[0] || "";
  const requestedKey = normalize(requested);
  const match = available.find((candidate) => normalize(candidate) === requestedKey);
  if (!match) throw Object.assign(new Error(`${label} ne correspond pas aux coordonnées de ce dossier`), { status: 400 });
  return match;
}

function reusableMeasurementLink(existing, value) {
  if (!value || !existing?.publicTokenHash || !existing?.publicTokenExpiresAt) return null;
  try {
    const parsed = new URL(String(value), process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com");
    const match = parsed.pathname.match(/^\/prendre-mesures\/([^/]+)\/?$/);
    const token = match?.[1] ? decodeURIComponent(match[1]) : "";
    if (!token || hashPublicMeasurementToken(token) !== existing.publicTokenHash) return null;
    const expiresAt = new Date(existing.publicTokenExpiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) return null;
    return { measurement: existing, token, url: publicMeasurementUrl(token), expiresAt };
  } catch {
    return null;
  }
}

function smsFailureMessage(result) {
  if (Number(result?.errorCode) === 21408) {
    return "Destination bloquée par les permissions géographiques Twilio. Vérifiez le numéro ou activez cette région dans Twilio.";
  }
  if (result?.errorCode === "not_configured") return "Le service texto Twilio n’est pas configuré.";
  return result?.errorCode
    ? `Le texto a été refusé par Twilio (code ${result.errorCode}).`
    : "Le texto n’a pas pu être envoyé.";
}

async function sendMeasurementEmail(client, url) {
  if (!client.email || !isMailDeliveryConfigured()) return false;
  const displayName = String(client.contactName || client.name || "").trim();
  const greeting = displayName ? `Bonjour ${displayName},` : "Bonjour,";
  const subject = "Prendre les mesures de vos thermos - Vosthermos";
  const text = `${greeting}\n\nPour préparer votre présoumission, prenez une photo de face de chaque fenêtre et indiquez les mesures demandées dans notre formulaire sécurisé :\n${url}\n\nLe dessin automatique peut être corrigé. Ces mesures servent à la présoumission; Vosthermos validera les mesures finales avant la commande.\n\nLien valide ${PUBLIC_MEASUREMENT_LINK_DAYS} jours.\n\nVosthermos - 514-825-8411`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#eef1f5;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px"><tr><td align="center"><table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="background:#002530;color:#fff;padding:28px 34px"><div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:.8">Vosthermos</div><div style="font-size:25px;font-weight:800;margin-top:6px">Mesures de vos fenêtres</div></td></tr><tr><td style="padding:34px"><p style="font-size:18px;font-weight:700">${escapeHtml(greeting)}</p><p style="line-height:1.6">Pour préparer votre présoumission, prenez une photo de face de chaque fenêtre et indiquez les mesures demandées.</p><p style="text-align:center;margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#e30718;color:#fff;text-decoration:none;font-weight:800;padding:15px 24px;border-radius:10px">Prendre mes mesures</a></p><p style="font-size:14px;line-height:1.6;color:#5b6470">Le dessin automatique peut être corrigé. Ces mesures servent à la présoumission; Vosthermos validera les mesures finales avant toute commande.</p><p style="font-size:13px;color:#6b7280">Lien valide ${PUBLIC_MEASUREMENT_LINK_DAYS} jours.<br><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p></td></tr></table></td></tr></table></body></html>`;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getMailFromHeader("Vosthermos"),
    to: client.email,
    replyTo: getReplyToEmail(),
    envelope: { from: getMailEnvelopeFrom(), to: client.email },
    subject,
    text,
    html,
    headers: { "X-Entity-Ref-ID": `vosthermos-mesures-${Date.now()}` },
  });
  return true;
}

export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const existing = await getMeasurementById(id);
  if (!existing) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
  if (existing.source !== "client") {
    return NextResponse.json({ error: "Le lien public est réservé aux mesures client" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedChannels = Array.isArray(body.channels) ? body.channels : ["sms", "email"];
    const channels = Array.from(new Set(requestedChannels.filter((channel) => ["sms", "email"].includes(channel))));
    if (!channels.length) throw Object.assign(new Error("Choisissez au moins un canal d’envoi"), { status: 400 });
    const client = existing.client;
    const followUp = existing.followUp;
    const selectedPhone = chooseAllowedValue(
      body.phone,
      [client?.phone, client?.secondaryPhone, followUp?.phone],
      normalizePhoneKey,
      "Le numéro choisi",
    );
    const selectedEmail = chooseAllowedValue(
      body.email,
      [client?.email, followUp?.email],
      (value) => String(value || "").trim().toLowerCase(),
      "Le courriel choisi",
    );
    const displayName = resolveMeasurementClientName(client, followUp);
    let issued;
    if (body.reuseUrl) {
      issued = reusableMeasurementLink(existing, body.reuseUrl);
      if (!issued) throw Object.assign(new Error("Le lien précédent est expiré ou n’est plus valide. Fermez cette fenêtre puis recommencez la demande."), { status: 409 });
    } else {
      issued = await issuePublicMeasurementLink(existing.id);
    }
    const deliveryClient = {
      ...client,
      contactName: displayName,
      phone: selectedPhone,
      email: selectedEmail,
    };
    const delivery = {
      sms: { status: "not_requested", errorCode: null, message: "" },
      email: { status: "not_requested", message: "" },
    };

    if (channels.includes("sms")) {
      const phone = toE164(deliveryClient.phone);
      if (!phone) {
        delivery.sms = { status: "unavailable", errorCode: "invalid_phone", message: "Le numéro choisi n’est pas un numéro Canada/États-Unis valide." };
      } else {
        const message = `${displayName ? `Bonjour ${displayName}! ` : ""}Vosthermos : prenez une photo de face de chaque fenêtre et entrez vos mesures ici : ${issued.url} — lien valide ${PUBLIC_MEASUREMENT_LINK_DAYS} jours. Ces mesures servent à la présoumission.`;
        const result = await sendSmsDetailed(phone, message);
        delivery.sms = result.status === "accepted"
          ? { status: "accepted", errorCode: null, providerStatus: result.providerStatus, message: "Texto accepté par Twilio; la livraison finale dépend du réseau du destinataire." }
          : { status: result.status, errorCode: result.errorCode, providerStatus: result.providerStatus, message: smsFailureMessage(result) };
      }
    }

    if (channels.includes("email")) {
      if (!deliveryClient.email) {
        delivery.email = { status: "unavailable", message: "Aucun courriel valide n’est disponible." };
      } else {
        try {
          const emailSent = await sendMeasurementEmail(deliveryClient, issued.url);
          delivery.email = emailSent
            ? { status: "sent", message: "Courriel envoyé." }
            : { status: "unavailable", message: "Le service de courriel n’est pas configuré." };
        } catch (error) {
          console.error("[measurements request] email error:", error?.message || error);
          delivery.email = { status: "failed", message: "Le courriel n’a pas pu être envoyé." };
        }
      }
    }

    const actor = `admin:${session.id}`;
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: issued.measurement.id, clientId: issued.measurement.clientId, actor });
    if (issued.measurement.followUpId) {
      publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: issued.measurement.followUpId, clientId: issued.measurement.clientId, actor });
    }
    await logAdminActivity(req, session, {
      action: "send",
      entityType: "thermos_measurement",
      entityId: issued.measurement.id,
      label: "Demande de mesures client préparée",
      metadata: { channels, delivery, expiresAt: issued.expiresAt },
    });

    return NextResponse.json({
      ...serializeMeasurementBundle(issued.measurement),
      url: issued.url,
      expiresAt: issued.expiresAt,
      delivery,
    });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
