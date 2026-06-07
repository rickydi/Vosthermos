import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import path from "path";
import { textFromHtml } from "./blog-sanitize";
import { getGmailApiConfigStatus, sendMailWithGmailApi } from "./gmail-api-mail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const INSECURE_DEFAULT = "change-this-to-a-random-secret";
const LOGO_CID = "vosthermos-logo";
const LOGO_PATH = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png");
const DEFAULT_COMPANY_EMAIL = "info@vosthermos.com";

let warnedGmailFallback = false;

function getSmtpTransporter() {
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpHost = process.env.SMTP_HOST;
  const connectHost = process.env.SMTP_CONNECT_HOST || smtpHost;
  return nodemailer.createTransport({
    host: connectHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      servername: smtpHost && smtpHost !== connectHost ? smtpHost : undefined,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

export function isMailDeliveryConfigured() {
  const gmailStatus = getGmailApiConfigStatus();
  if (gmailStatus.requested && gmailStatus.configured) return true;
  return Boolean(process.env.SMTP_HOST);
}

export function getMailConfigurationError() {
  const gmailStatus = getGmailApiConfigStatus();
  if (gmailStatus.requested && !gmailStatus.configured && !process.env.SMTP_HOST) {
    return `Gmail API incomplet (${gmailStatus.missing.join(", ")}) et SMTP_HOST manquant`;
  }
  if (!process.env.SMTP_HOST) {
    return "Aucun transport courriel configure (Gmail API ou SMTP_HOST)";
  }
  return null;
}

export function getMailTransportName() {
  const gmailStatus = getGmailApiConfigStatus();
  if (gmailStatus.requested && gmailStatus.configured) return `gmail-api:${gmailStatus.mode}`;
  return "smtp";
}

export function getTransporter() {
  const gmailStatus = getGmailApiConfigStatus();
  if (gmailStatus.requested && gmailStatus.configured) {
    return {
      sendMail: sendMailWithGmailApi,
    };
  }

  if (gmailStatus.requested && !gmailStatus.configured && process.env.SMTP_HOST && !warnedGmailFallback) {
    warnedGmailFallback = true;
    console.warn(`[mail] Gmail API incomplet (${gmailStatus.missing.join(", ")}). Fallback SMTP actif.`);
  }

  return getSmtpTransporter();
}

export function getMailFromEmail() {
  return (
    process.env.GMAIL_API_FROM ||
    process.env.GMAIL_API_USER ||
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    process.env.COMPANY_EMAIL ||
    process.env.SMTP_USER ||
    DEFAULT_COMPANY_EMAIL
  ).trim();
}

export function getMailEnvelopeFrom() {
  return (process.env.SMTP_ENVELOPE_FROM || getMailFromEmail()).trim();
}

export function getReplyToEmail() {
  return (process.env.GMAIL_API_REPLY_TO || process.env.SMTP_REPLY_TO || process.env.COMPANY_EMAIL || getMailFromEmail() || DEFAULT_COMPANY_EMAIL).trim();
}

export function getMailFromHeader(label = "Vosthermos") {
  return `"${label}" <${getMailFromEmail()}>`;
}

function getApprovalSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== INSECURE_DEFAULT) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET requis pour generer un lien d'approbation blogue.");
  }
  return INSECURE_DEFAULT;
}

function approvalVersion(post) {
  const date = post?.updatedAt || post?.createdAt || new Date(0);
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : 0;
}

export function generateApprovalToken(post) {
  return jwt.sign(
    {
      purpose: "blog_approval",
      postId: Number(post.id),
      version: approvalVersion(post),
    },
    getApprovalSecret(),
    { expiresIn: "48h" },
  );
}

export function verifyApprovalToken(post, token) {
  try {
    const decoded = jwt.verify(String(token || ""), getApprovalSecret());
    return (
      decoded?.purpose === "blog_approval" &&
      Number(decoded.postId) === Number(post.id) &&
      Number(decoded.version) === approvalVersion(post)
    );
  } catch {
    return false;
  }
}

// Envoie le code de connexion 2FA a l'admin. Reproduit EXACTEMENT la recette des
// emails de facture (envelope/Return-Path aligne, replyTo, header transactionnel
// X-Entity-Ref-ID, logo inline cid, HTML riche) car ces emails-la arrivent vite
// chez Gmail. Un mini-email "OTP" nu est traite avec mefiance (livraison lente).
// Lance une erreur si l'envoi echoue (le flux de login doit alors refuser la
// connexion plutot que de laisser l'utilisateur sans code).
export async function sendAdminLoginCodeEmail(toEmail, code) {
  if (!isMailDeliveryConfigured()) {
    console.log("Mail not configured, skipping admin login code email");
    return false;
  }

  const replyToEmail = getReplyToEmail();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Code de connexion Vosthermos</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f5;padding:34px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 34px rgba(23,32,51,0.12);">
          <tr>
            <td style="background-color:#b91c1c;padding:34px 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="cid:${LOGO_CID}" alt="Vosthermos" height="104" style="display:block;border:0;outline:none;text-decoration:none;height:104px;width:auto;" />
                  </td>
                  <td align="right" valign="middle" style="color:#ffffff;">
                    <div style="font-size:11px;letter-spacing:2px;opacity:.78;font-weight:700;text-transform:uppercase;">Securite</div>
                    <div style="font-size:25px;font-weight:800;margin-top:7px;line-height:1.1;">Connexion</div>
                    <div style="font-size:12px;opacity:.82;margin-top:8px;">Panneau d'administration</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 16px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111;">Votre code de connexion</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
                Saisissez ce code pour finaliser votre connexion a l'administration <strong>Vosthermos</strong>. Il expire dans 30 minutes.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 34px;font-size:38px;font-weight:900;letter-spacing:12px;color:#172033;">${code}</div>
                  </td>
                </tr>
              </table>
              <div style="background-color:#fef2f2;border-left:3px solid #b91c1c;padding:14px 18px;border-radius:0 8px 8px 0;">
                <div style="font-size:13px;color:#991b1b;font-weight:600;margin-bottom:4px;">Vous n'avez pas tente de vous connecter ?</div>
                <div style="font-size:13px;color:#555;">Ignorez ce courriel et changez votre mot de passe par precaution.</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#7b8794;line-height:1.6;">
                <strong style="color:#172033;">Vosthermos</strong> - Portes et fenetres<br>
                <a href="${SITE_URL}" style="color:#b91c1c;text-decoration:none;">vosthermos.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Votre code de connexion Vosthermos : ${code}
Il expire dans 30 minutes.
Si vous n'avez pas tente de vous connecter, ignorez ce courriel et changez votre mot de passe.

---
Vosthermos - Portes et fenetres
${SITE_URL}`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getMailFromHeader("Vosthermos - Securite"),
    to: toEmail,
    replyTo: replyToEmail,
    envelope: { from: getMailEnvelopeFrom(), to: toEmail },
    subject: "Votre code de connexion Vosthermos",
    text,
    html,
    headers: { "X-Entity-Ref-ID": `vosthermos-2fa-${Date.now()}` },
    attachments: [
      {
        filename: "vosthermos-logo.png",
        path: LOGO_PATH,
        cid: LOGO_CID,
        contentDisposition: "inline",
      },
    ],
  });
  return true;
}

export async function sendBlogApprovalEmail(post, prisma) {
  if (!isMailDeliveryConfigured()) {
    console.log("Mail not configured, skipping approval email");
    return false;
  }

  // Fetch active recipients from DB
  const recipients = await prisma.blogNotifyMember.findMany({
    where: { isActive: true },
  });

  if (recipients.length === 0) {
    console.log("No active blog notify members, skipping approval email");
    return false;
  }

  const emails = recipients.map((r) => r.email);
  const token = generateApprovalToken(post);
  const approveUrl = `${SITE_URL}/api/admin/blog/${post.id}/approve?token=${token}`;
  const editUrl = `${SITE_URL}/admin/blogue/${post.id}`;
  const previewContent = textFromHtml(post.content, 500);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #0d9488; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Nouvel article de blogue</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">En attente d'approbation</p>
      </div>

      <div style="padding: 24px;">
        ${post.coverImage ? `<img src="${SITE_URL}${post.coverImage}" alt="" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;" />` : ""}

        <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
          <span style="font-size: 12px; color: #0d9488; font-weight: 600; text-transform: uppercase;">${post.category}</span>
        </div>

        <h2 style="color: #111; font-size: 22px; margin: 0 0 8px;">${post.title}</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">${post.excerpt}</p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #888; font-size: 12px; font-weight: 600; margin: 0 0 8px;">APERCU DU CONTENU :</p>
          <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0;">${previewContent}...</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${approveUrl}" style="display: inline-block; background: #0d9488; color: #fff; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin-right: 12px;">
            Approuver et publier
          </a>
          <a href="${editUrl}" style="display: inline-block; background: #f3f4f6; color: #374151; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
            Modifier dans l'admin
          </a>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center;">
          Repondez a cet email avec vos commentaires si des changements sont necessaires.
        </p>
      </div>

      <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #999; font-size: 11px; margin: 0;">Vosthermos — Systeme de blogue automatise</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getMailFromHeader("Vosthermos Blog"),
    to: emails.join(", "),
    replyTo: getReplyToEmail(),
    envelope: { from: getMailEnvelopeFrom(), to: emails },
    subject: `[Blog] Nouvel article : ${post.title}`,
    html,
  });

  console.log(`Approval email sent to: ${emails.join(", ")}`);
  return true;
}
