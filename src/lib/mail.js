import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { textFromHtml } from "./blog-sanitize";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const INSECURE_DEFAULT = "change-this-to-a-random-secret";

export function getTransporter() {
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

// Envoie le code de connexion 2FA a l'admin. Lance une erreur si l'envoi
// echoue (le flux de login doit alors refuser la connexion plutot que de
// laisser l'utilisateur sans code).
export async function sendAdminLoginCodeEmail(toEmail, code) {
  if (!process.env.SMTP_HOST) {
    console.log("SMTP not configured, skipping admin login code email");
    return false;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #fff;">
      <div style="background: #0a1628; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Code de connexion</h1>
        <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">Panneau d'administration Vosthermos</p>
      </div>
      <div style="padding: 28px 24px; text-align: center;">
        <p style="color: #555; font-size: 14px; margin: 0 0 16px;">Voici votre code de connexion. Il expire dans 10 minutes.</p>
        <div style="display: inline-block; background: #f3f4f6; border-radius: 12px; padding: 16px 28px; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #111;">
          ${code}
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
          Si vous n'avez pas tente de vous connecter, ignorez ce courriel et changez votre mot de passe.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #999; font-size: 11px; margin: 0;">Vosthermos — securite du compte</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Vosthermos" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Votre code de connexion Vosthermos",
    html,
    text: `Votre code de connexion Vosthermos : ${code}\nIl expire dans 10 minutes.\nSi vous n'avez pas tente de vous connecter, ignorez ce courriel.`,
  });
  return true;
}

export async function sendBlogApprovalEmail(post, prisma) {
  if (!process.env.SMTP_HOST) {
    console.log("SMTP not configured, skipping approval email");
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
    from: `"Vosthermos Blog" <${process.env.SMTP_USER}>`,
    to: emails.join(", "),
    subject: `[Blog] Nouvel article : ${post.title}`,
    html,
  });

  console.log(`Approval email sent to: ${emails.join(", ")}`);
  return true;
}
