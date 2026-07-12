import fs from "fs";
import path from "path";
import {
  getMailConfigurationError,
  getMailEnvelopeFrom,
  getMailFromHeader,
  getReplyToEmail,
  getTransporter,
  isMailDeliveryConfigured,
} from "@/lib/mail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const LOGO_CID = "vosthermos-logo";
const LOGO_PATH = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo_Blanc.png");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeFilename(value) {
  return String(value || "commande-thermos")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function inlineLogoAttachment() {
  if (!fs.existsSync(LOGO_PATH)) return [];
  return [{
    filename: "vosthermos-logo.png",
    path: LOGO_PATH,
    cid: LOGO_CID,
    contentDisposition: "inline",
  }];
}

function assertMailConfigured() {
  if (!isMailDeliveryConfigured()) {
    throw new Error(getMailConfigurationError() || "Courriel non configuré");
  }
}

function emailShell({ eyebrow, title, subtitle, content, footer }) {
  const logo = fs.existsSync(LOGO_PATH)
    ? `<img src="cid:${LOGO_CID}" alt="Vosthermos" height="92" style="display:block;border:0;height:92px;width:auto;">`
    : `<div style="font-size:22px;font-weight:900;color:#fff;">VOSTHERMOS</div>`;
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:30px 14px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #dbe3ea;box-shadow:0 12px 34px rgba(23,32,51,.1);">
        <tr><td style="background:#002530;padding:28px 34px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>${logo}</td>
            <td align="right" style="color:#fff;">
              <div style="font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:#b9dfe6;font-weight:800;">${escapeHtml(eyebrow)}</div>
              <div style="font-size:24px;font-weight:900;margin-top:7px;">${escapeHtml(title)}</div>
              <div style="font-size:12px;color:#d8e4e7;margin-top:7px;">${escapeHtml(subtitle)}</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:34px 38px 22px;">${content}</td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 34px;text-align:center;color:#667085;font-size:12px;line-height:1.5;">
          ${footer || "Vosthermos · Pour toute question, répondez simplement à ce courriel."}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendThermosOrderEmail(order, pdfBuffer) {
  assertMailConfigured();
  const recipient = String(order.supplierEmailSnapshot || "").trim();
  if (!recipient) throw new Error("Adresse email du fournisseur manquante");
  if (!Buffer.isBuffer(pdfBuffer) || !pdfBuffer.length) throw new Error("PDF de commande manquant");

  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
  const contact = String(order.supplierContactSnapshot || "").trim();
  const greeting = contact ? `Bonjour ${escapeHtml(contact)},` : "Bonjour,";
  const html = emailShell({
    eyebrow: "Nouvelle commande",
    title: order.number,
    subtitle: `${itemCount} thermos · ${order.clientNameSnapshot}`,
    content: `
      <h1 style="font-size:20px;margin:0 0 14px;color:#172033;">${greeting}</h1>
      <p style="font-size:15px;line-height:1.65;color:#374151;margin:0 0 20px;">
        Voici notre commande de thermos pour le dossier <strong>${escapeHtml(order.clientNameSnapshot)}</strong>.
        Le document PDF joint contient les dimensions, épaisseurs, options et identifiants de chaque unité.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
        <tr><td style="padding:16px 18px;color:#667085;font-size:13px;">Numéro de commande</td><td align="right" style="padding:16px 18px;font-weight:900;color:#172033;">${escapeHtml(order.number)}</td></tr>
        <tr><td style="padding:0 18px 16px;color:#667085;font-size:13px;">Nombre de thermos</td><td align="right" style="padding:0 18px 16px;font-weight:900;color:#172033;">${itemCount}</td></tr>
        <tr><td style="padding:0 18px 16px;color:#667085;font-size:13px;">Délai prévu au dossier</td><td align="right" style="padding:0 18px 16px;font-weight:900;color:#172033;">${Number(order.leadTimeDaysSnapshot) || 0} jours</td></tr>
      </table>
      <p style="font-size:13px;line-height:1.55;color:#667085;margin:20px 0 0;">
        Merci de vérifier le PDF avant la fabrication et de nous aviser rapidement si une précision est nécessaire.
      </p>`,
  });
  const text = `${contact ? `Bonjour ${contact},` : "Bonjour,"}

Voici notre commande de thermos ${order.number} pour ${order.clientNameSnapshot}.
Nombre de thermos : ${itemCount}
Délai prévu au dossier : ${Number(order.leadTimeDaysSnapshot) || 0} jours

Le PDF joint contient toutes les dimensions, épaisseurs, options et identifiants.

Merci,
Vosthermos`;
  const filename = `${safeFilename(order.number)}.pdf`;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getMailFromHeader("Vosthermos - Commandes"),
    to: recipient,
    replyTo: getReplyToEmail(),
    envelope: { from: getMailEnvelopeFrom(), to: recipient },
    subject: `Commande de thermos ${order.number} - ${order.clientNameSnapshot}`,
    text,
    html,
    headers: { "X-Entity-Ref-ID": `thermos-order-${order.number}` },
    attachments: [
      ...inlineLogoAttachment(),
      { filename, content: pdfBuffer, contentType: "application/pdf" },
    ],
  });
  return { to: recipient, filename };
}

export async function sendThermosOrderReminderEmail(order, token) {
  assertMailConfigured();
  const recipient = String(order.supplierEmailSnapshot || "").trim();
  if (!recipient) throw new Error("Adresse email du fournisseur manquante");
  const safeToken = encodeURIComponent(String(token || ""));
  if (!safeToken) throw new Error("Jeton de confirmation manquant");
  const responseUrl = `${SITE_URL}/confirmation-thermos/${safeToken}`;
  const yesUrl = `${responseUrl}?answer=yes`;
  const noUrl = `${responseUrl}?answer=no`;
  const contact = String(order.supplierContactSnapshot || "").trim();
  const html = emailShell({
    eyebrow: "Suivi de commande",
    title: order.number,
    subtitle: order.clientNameSnapshot,
    content: `
      <h1 style="font-size:20px;margin:0 0 14px;color:#172033;">${contact ? `Bonjour ${escapeHtml(contact)},` : "Bonjour,"}</h1>
      <p style="font-size:15px;line-height:1.65;color:#374151;margin:0 0 24px;">
        Le délai prévu pour la commande <strong>${escapeHtml(order.number)}</strong> est arrivé.
        Pouvez-vous confirmer si les thermos sont maintenant prêts chez vous?
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td align="center" style="padding:4px 5px 18px;">
          <a href="${yesUrl}" style="display:inline-block;background:#0f7a53;color:#fff;text-decoration:none;font-size:16px;font-weight:900;padding:15px 26px;border-radius:10px;">Oui, ils sont prêts</a>
        </td>
        <td align="center" style="padding:4px 5px 18px;">
          <a href="${noUrl}" style="display:inline-block;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;text-decoration:none;font-size:16px;font-weight:900;padding:14px 26px;border-radius:10px;">Non, pas encore</a>
        </td>
      </tr></table>
      <p style="font-size:13px;line-height:1.55;color:#667085;margin:4px 0 0;">
        Le lien ouvre une page sécurisée. Aucune réponse n'est enregistrée avant votre confirmation finale sur cette page.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#8793a3;word-break:break-all;margin:16px 0 0;">${escapeHtml(responseUrl)}</p>`,
  });
  const text = `${contact ? `Bonjour ${contact},` : "Bonjour,"}

Le délai prévu pour la commande ${order.number} (${order.clientNameSnapshot}) est arrivé.

Confirmez ici si les thermos sont prêts ou indiquez une nouvelle date prévue :
${responseUrl}

Aucune réponse n'est enregistrée avant la confirmation finale sur la page sécurisée.

Merci,
Vosthermos`;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getMailFromHeader("Vosthermos - Suivi commandes"),
    to: recipient,
    replyTo: getReplyToEmail(),
    envelope: { from: getMailEnvelopeFrom(), to: recipient },
    subject: `Suivi requis - commande ${order.number}`,
    text,
    html,
    headers: { "X-Entity-Ref-ID": `thermos-order-reminder-${order.number}-${Date.now()}` },
    attachments: inlineLogoAttachment(),
  });
  return { to: recipient, responseUrl };
}
