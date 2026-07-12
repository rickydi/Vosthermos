import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import { getMailEnvelopeFrom, getMailFromHeader, getReplyToEmail, getTransporter, isMailDeliveryConfigured } from "@/lib/mail";
import { toE164 } from "@/lib/photo-request";
import { sendSms } from "@/lib/twilio";
import {
  getMeasurementById,
  issuePublicMeasurementLink,
  measurementErrorResponse,
  PUBLIC_MEASUREMENT_LINK_DAYS,
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
    const issued = await issuePublicMeasurementLink(existing.id);
    const client = issued.measurement.client;
    const followUp = issued.measurement.followUp;
    const deliveryClient = {
      ...client,
      contactName: followUp?.contactName || client.contactName,
      phone: followUp?.phone || client.phone,
      email: followUp?.email || client.email,
    };
    const displayName = String(deliveryClient.contactName || deliveryClient.name || "").trim();
    const delivery = { sms: "not_requested", email: "not_requested" };

    if (channels.includes("sms")) {
      const phone = toE164(deliveryClient.phone || deliveryClient.secondaryPhone);
      if (!phone) {
        delivery.sms = "unavailable";
      } else if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        // N'appelle pas le fallback de développement de sendSms: il journalise
        // le corps complet, qui contient ici un lien d'accès confidentiel.
        delivery.sms = "unavailable";
      } else {
        const message = `${displayName ? `Bonjour ${displayName}! ` : ""}Vosthermos : prenez une photo de face de chaque fenêtre et entrez vos mesures ici : ${issued.url} — lien valide ${PUBLIC_MEASUREMENT_LINK_DAYS} jours. Ces mesures servent à la présoumission.`;
        delivery.sms = await sendSms(phone, message) ? "sent" : "failed";
      }
    }

    if (channels.includes("email")) {
      if (!deliveryClient.email) {
        delivery.email = "unavailable";
      } else {
        try {
          delivery.email = await sendMeasurementEmail(deliveryClient, issued.url) ? "sent" : "failed";
        } catch (error) {
          console.error("[measurements request] email error:", error?.message || error);
          delivery.email = "failed";
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
