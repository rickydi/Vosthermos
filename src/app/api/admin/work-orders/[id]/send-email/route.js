import { NextResponse } from "next/server";
import path from "path";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getMailConfigurationError, getMailEnvelopeFrom, getMailFromHeader, getReplyToEmail, getTransporter, isMailDeliveryConfigured } from "@/lib/mail";
import { getWorkOrderSettings } from "@/lib/work-order-utils";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { formatDateOnly } from "@/lib/date-only";
import { logAdminActivity } from "@/lib/admin-activity";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { getCompany } from "@/lib/company";
import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
import { documentFilename, formatMoneyCad, getDocumentDate, getDocumentTargetDate, resolveDocumentNumber } from "@/lib/vosthermos-document";
import { buildPaymentTrackingData } from "@/lib/payment-tracking";
import {
  buildFriendlyDocumentEmailBody,
  emailGreetingName,
  isFriendlyBusinessClient,
  personalizeDocumentEmailText,
} from "@/lib/b2b-email-tone";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const LOGO_CID = "vosthermos-logo";
const LOGO_PATH = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo_Blanc.png");
const EMAIL_LOGO_HEIGHT = 128;

function fmt(n) { return formatMoneyCad(n); }

function formatEmailDate(dateLike) {
  return formatDateOnly(dateLike, { day: "numeric", month: "long", year: "numeric" });
}

function documentDateLabel(documentMeta) {
  if (documentMeta.type === "invoice") return "Date de facture";
  if (documentMeta.type === "quote") return "Date de soumission";
  return "Date";
}

function renderDocumentSummaryRows(wo, documentMeta, documentNumber, filename) {
  const documentDate = formatEmailDate(getDocumentDate(wo, documentMeta.type));
  const targetDate = getDocumentTargetDate(wo, documentMeta.type);
  const targetValue = targetDate ? formatEmailDate(targetDate) : "";
  const targetLabel = documentMeta.dateTargetLabel || "Echeance";
  return `
    <div style="font-size:11px;color:#8793a3;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;">Document joint</div>
    <div style="font-size:15px;color:#172033;font-weight:800;margin-top:3px;margin-bottom:12px;">${escapeHtml(filename)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e2e8f0;padding-top:12px;">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#667085;">No</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:#172033;font-weight:700;">${escapeHtml(documentNumber)}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#667085;">${documentDateLabel(documentMeta)}</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:#172033;font-weight:700;">${escapeHtml(documentDate)}</td>
      </tr>
      ${targetValue ? `<tr>
        <td style="padding:5px 0;font-size:13px;color:#667085;">${escapeHtml(targetLabel)}</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:#172033;font-weight:700;">${escapeHtml(targetValue)}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#667085;">Sous-total</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:#172033;">${fmt(wo.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#667085;">TPS + TVQ</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:#172033;">${fmt(Number(wo.tps) + Number(wo.tvq))}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:2px solid #172033;font-size:15px;color:#172033;font-weight:800;">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:2px solid #172033;font-size:19px;color:#b91c1c;font-weight:900;">${fmt(wo.total)}</td>
      </tr>
    </table>`;
}

function renderDocumentSummaryBox(wo, documentMeta, documentNumber, filename) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:22px 0 22px;">
      <tr>
        <td style="padding:18px 20px;">
          ${renderDocumentSummaryRows(wo, documentMeta, documentNumber, filename)}
        </td>
      </tr>
    </table>`;
}

function renderReturnNote(documentMeta) {
  const nextNeed = documentMeta.type === "quote"
    ? "Si vous voulez aller de l'avant, repondez simplement a ce courriel et on garde le dossier au meme endroit."
    : "Si vous avez une autre fenetre, une porte patio a ajuster ou une piece a remplacer plus tard, vous pouvez repondre a ce courriel et on reprendra le dossier rapidement.";
  return `
    <div style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 18px;margin:0 0 24px;">
      <div style="font-size:13px;color:#9a3412;font-weight:800;margin-bottom:5px;">Pour la suite</div>
      <div style="font-size:14px;color:#4b5563;line-height:1.6;">${nextNeed}</div>
    </div>`;
}

function renderDocumentSummaryText(wo, documentMeta, documentNumber, filename) {
  const targetDate = getDocumentTargetDate(wo, documentMeta.type);
  const targetLabel = documentMeta.dateTargetLabel || "Echeance";
  return [
    `${documentMeta.labelUpper} ${documentNumber}`,
    `${documentDateLabel(documentMeta)}: ${formatEmailDate(getDocumentDate(wo, documentMeta.type))}`,
    targetDate ? `${targetLabel}: ${formatEmailDate(targetDate)}` : null,
    `Piece jointe: ${filename}`,
    `Sous-total: ${fmt(wo.subtotal)}`,
    `TPS + TVQ: ${fmt(Number(wo.tps) + Number(wo.tvq))}`,
    `Total: ${fmt(wo.total)}`,
  ].filter(Boolean).join("\n");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function personalizePlainMessage(message, client) {
  return personalizeDocumentEmailText(message, client);
}

function renderMessageHtml(message) {
  return escapeHtml(message)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "<br>"))
    .map((paragraph) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${paragraph}</p>`)
    .join("");
}

function renderCustomEmailHtml(wo, documentMeta, documentNumber, filename, message) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(documentMeta.label)} ${escapeHtml(documentNumber)}</title>
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
                    <img src="cid:${LOGO_CID}" alt="Vosthermos" height="${EMAIL_LOGO_HEIGHT}" style="display:block;border:0;outline:none;text-decoration:none;height:${EMAIL_LOGO_HEIGHT}px;width:auto;" />
                  </td>
                  <td align="right" valign="middle" style="color:#ffffff;">
                    <div style="font-size:11px;letter-spacing:2px;opacity:.78;font-weight:700;text-transform:uppercase;">${escapeHtml(documentMeta.labelUpper)}</div>
                    <div style="font-size:25px;font-weight:800;margin-top:7px;line-height:1.1;">${escapeHtml(documentNumber)}</div>
                    <div style="font-size:12px;opacity:.82;margin-top:8px;">Vosthermos - Facturation</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 40px 18px;">
              ${renderMessageHtml(message)}
              ${renderDocumentSummaryBox(wo, documentMeta, documentNumber, filename)}
              ${renderReturnNote(documentMeta)}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#7b8794;line-height:1.6;">
                <strong style="color:#172033;">Vosthermos</strong> - Reparation et remplacement de fenetres<br>
                Pour une question, repondez simplement a ce courriel.<br>
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
}

function renderCustomEmailText(wo, documentMeta, documentNumber, filename, message) {
  const hasReplyLine = /repond(re|s|ez)?\s+(simplement\s+)?(ici|a ce courriel)|reply (here|to this email)/i.test(message || "");
  return `${message}

---
${renderDocumentSummaryText(wo, documentMeta, documentNumber, filename)}
${hasReplyLine ? "" : "\nPour la suite, repondez simplement a ce courriel. On garde votre dossier au meme endroit pour vos prochaines reparations ou ajustements.\n"}

Vosthermos - Portes et fenetres
${SITE_URL}
`;
}

function renderEmailHtml(wo, documentMeta, documentNumber, filename) {
  if (isFriendlyBusinessClient(wo.client)) {
    return renderCustomEmailHtml(wo, documentMeta, documentNumber, filename, buildFriendlyDocumentEmailBody(wo, documentMeta));
  }

  const date = formatEmailDate(getDocumentDate(wo, documentMeta.type));
  const name = emailGreetingName(wo.client);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${documentMeta.label} ${documentNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f5;padding:34px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 34px rgba(23,32,51,0.12);">
          <!-- Header -->
          <tr>
            <td style="background-color:#b91c1c;padding:34px 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="cid:${LOGO_CID}" alt="Vosthermos" height="${EMAIL_LOGO_HEIGHT}" style="display:block;border:0;outline:none;text-decoration:none;height:${EMAIL_LOGO_HEIGHT}px;width:auto;" />
                  </td>
                  <td align="right" valign="middle" style="color:#ffffff;">
                    <div style="font-size:11px;letter-spacing:2px;opacity:.78;font-weight:700;text-transform:uppercase;">${documentMeta.labelUpper}</div>
                    <div style="font-size:25px;font-weight:800;margin-top:7px;line-height:1.1;">${documentNumber}</div>
                    <div style="font-size:12px;opacity:.82;margin-top:8px;">Vosthermos - Facturation</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111;">Bonjour${name ? ` ${escapeHtml(name)}` : ""},</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                Merci d'avoir choisi <strong>Vosthermos</strong> pour vos travaux. ${documentMeta.emailIntro}
              </p>
            </td>
          </tr>

          <!-- Summary card -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border-radius:10px;padding:20px;">
                <tr>
                  <td>
                    <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:1px;">${documentMeta.labelUpper}</div>
                    <div style="font-size:16px;color:#111;font-weight:600;margin-top:2px;">${documentNumber}</div>
                  </td>
                  <td align="right">
                    <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:1px;">${documentDateLabel(documentMeta)}</div>
                    <div style="font-size:14px;color:#374151;margin-top:2px;">${date}</div>
                  </td>
                </tr>
                <tr><td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:14px;"></td></tr>
                <tr>
                  <td style="padding-top:14px;color:#6b7280;font-size:14px;">Sous-total</td>
                  <td align="right" style="padding-top:14px;color:#111;font-size:14px;">${fmt(wo.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding-top:4px;color:#9ca3af;font-size:12px;">TPS + TVQ</td>
                  <td align="right" style="padding-top:4px;color:#6b7280;font-size:12px;">${fmt(Number(wo.tps) + Number(wo.tvq))}</td>
                </tr>
                <tr><td colspan="2" style="border-top:2px solid #111;padding-top:10px;"></td></tr>
                <tr>
                  <td style="padding-top:10px;color:#111;font-size:16px;font-weight:700;">Total</td>
                  <td align="right" style="padding-top:10px;color:#b91c1c;font-size:20px;font-weight:700;">${fmt(wo.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PDF note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background-color:#fef2f2;border-left:3px solid #b91c1c;padding:14px 18px;border-radius:0 8px 8px 0;">
                <div style="font-size:13px;color:#991b1b;font-weight:600;margin-bottom:4px;">Piece jointe</div>
                <div style="font-size:13px;color:#555;">${filename} (${documentMeta.emailAttachmentDetail})</div>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#6b7280;">
                ${documentMeta.emailQuestion}
              </p>
              ${renderReturnNote(documentMeta)}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#7b8794;line-height:1.6;">
                <strong style="color:#172033;">Vosthermos</strong> - Portes et fenetres<br>
                Pour une question, repondez simplement a ce courriel.<br>
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
}

function renderEmailText(wo, documentMeta, documentNumber, filename) {
  if (isFriendlyBusinessClient(wo.client)) {
    return renderCustomEmailText(wo, documentMeta, documentNumber, filename, buildFriendlyDocumentEmailBody(wo, documentMeta));
  }

  const name = emailGreetingName(wo.client);
  return `Bonjour${name ? ` ${name}` : ""},

Merci d'avoir choisi Vosthermos pour vos travaux.
${documentMeta.emailIntro}

${renderDocumentSummaryText(wo, documentMeta, documentNumber, filename)}

${documentMeta.emailQuestion}

Pour la suite, repondez simplement a ce courriel. On garde votre dossier au meme endroit pour vos prochaines reparations ou ajustements.

---
Vosthermos - Portes et fenetres
Reparation et remplacement
${SITE_URL}
`;
}

export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  if (!isMailDeliveryConfigured()) {
    return NextResponse.json({ error: getMailConfigurationError() || "Courriel non configure" }, { status: 500 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const wo = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: true,
      technician: { select: { name: true } },
      items: {
        orderBy: { position: "asc" },
        include: { product: { select: { sku: true, name: true } } },
      },
      sections: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
            include: { product: { select: { sku: true, name: true } } },
          },
        },
      },
      payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
    },
  });

  if (!wo) return NextResponse.json({ error: "Bon introuvable" }, { status: 404 });

  const to = body.to?.trim() || wo.client?.email;
  if (!to) return NextResponse.json({ error: "Adresse email manquante" }, { status: 400 });
  const documentMeta = getWorkOrderDocumentMeta(wo.statut, body.documentType);
  const documentNumber = resolveDocumentNumber(wo);
  const filename = documentFilename(wo, documentMeta);
  const customSubject = String(body.subject || "").trim();
  const customMessage = personalizePlainMessage(body.message, wo.client);
  const nextStatut = documentMeta.sentStatus || wo.statut;
  const paymentTracking = buildPaymentTrackingData({
    statut: nextStatut,
    existing: wo,
    client: wo.client,
    invoiceDate: documentMeta.type === "invoice" ? new Date() : wo.date,
  });

  const [settings, company] = await Promise.all([
    getWorkOrderSettings(),
    getCompany(),
  ]);

  const serItem = (i) => ({
    ...i,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  });
  const serializedWo = {
    ...wo,
    ...paymentTracking,
    statut: nextStatut,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    quoteDepositPercent: wo.quoteDepositPercent === null ? null : Number(wo.quoteDepositPercent),
    quotePaymentSchedule: wo.quotePaymentSchedule || null,
    payments: (wo.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: wo.items.filter((item) => !item.sectionId).map(serItem),
    sections: (wo.sections || []).map((s) => ({
      ...s,
      items: (s.items || []).map(serItem),
    })),
  };

  let pdfBuffer;
  try {
    pdfBuffer = await generateInvoicePdf(serializedWo, { ...settings, company, documentType: documentMeta.type });
  } catch (err) {
    return NextResponse.json({ error: `Erreur generation PDF: ${err.message}` }, { status: 500 });
  }

  try {
    const transporter = getTransporter();
    const replyToEmail = getReplyToEmail();
    await transporter.sendMail({
      from: getMailFromHeader("Vosthermos - Facturation"),
      to,
      replyTo: replyToEmail,
      envelope: { from: getMailEnvelopeFrom(), to },
      subject: customSubject || `${documentMeta.subjectPrefix} ${documentNumber} - Vosthermos`,
      text: customMessage
        ? renderCustomEmailText(serializedWo, documentMeta, documentNumber, filename, customMessage)
        : renderEmailText(serializedWo, documentMeta, documentNumber, filename),
      html: customMessage
        ? renderCustomEmailHtml(serializedWo, documentMeta, documentNumber, filename, customMessage)
        : renderEmailHtml(serializedWo, documentMeta, documentNumber, filename),
      headers: {
        "X-Entity-Ref-ID": wo.number,
      },
      attachments: [
        {
          filename: "vosthermos-logo.png",
          path: LOGO_PATH,
          cid: LOGO_CID,
          contentDisposition: "inline",
        },
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    const sentWorkOrder = documentMeta.sentStatus
      ? await prisma.workOrder.update({
          where: { id: wo.id },
          data: { statut: documentMeta.sentStatus, ...paymentTracking },
        })
      : wo;

    try {
      await createOrTouchFollowUpFromWorkOrder({
        workOrder: sentWorkOrder,
        client: wo.client,
        followUpStatus: documentMeta.sentFollowUpStatus,
      });
    } catch (err) {
      console.error("[work-order-email] follow-up sync error:", err?.message || err);
    }

    await logAdminActivity(req, session, {
      action: "send",
      entityType: "work_order",
      entityId: wo.id,
      label: `${documentMeta.sentLabel}: ${wo.number}`,
      metadata: { number: wo.number, to, clientId: wo.clientId, documentType: documentMeta.type },
    });

    return NextResponse.json({ ok: true, to });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur d'envoi" }, { status: 500 });
  }
}
