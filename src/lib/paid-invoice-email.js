import fs from "fs";
import path from "path";
import { getTransporter } from "@/lib/mail";
import { getWorkOrderSettings } from "@/lib/work-order-utils";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { getCompany } from "@/lib/company";
import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
import {
  documentFilename,
  documentPaymentSummary,
  formatLongDateFr,
  formatMoneyCad,
  getDocumentDate,
  resolveDocumentNumber,
} from "@/lib/vosthermos-document";
import { emailGreetingName, isFriendlyBusinessClient } from "@/lib/b2b-email-tone";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const LOGO_CID = "vosthermos-logo";
const LOGO_PATH = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo_Blanc.png");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeMoneyFields(wo) {
  const serItem = (item) => ({
    ...item,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    totalPrice: Number(item.totalPrice || 0),
  });

  return {
    ...wo,
    statut: "paid",
    totalPieces: Number(wo.totalPieces || 0),
    totalLabor: Number(wo.totalLabor || 0),
    laborRate: Number(wo.laborRate || 0),
    subtotal: Number(wo.subtotal || 0),
    tps: Number(wo.tps || 0),
    tvq: Number(wo.tvq || 0),
    total: Number(wo.total || 0),
    payments: (wo.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: (wo.items || []).map(serItem),
    sections: (wo.sections || []).map((section) => ({
      ...section,
      items: (section.items || []).map(serItem),
    })),
  };
}

function paymentRowsHtml(payments) {
  return payments.map((payment) => `
    <tr>
      <td style="padding:7px 0;color:#667085;font-size:13px;">${escapeHtml(formatLongDateFr(payment.paidAt) || "Paiement")}</td>
      <td style="padding:7px 0;color:#172033;font-size:13px;">${escapeHtml(payment.method || "Paiement")}</td>
      <td align="right" style="padding:7px 0;color:#172033;font-size:13px;font-weight:800;">${escapeHtml(formatMoneyCad(payment.amount))}</td>
    </tr>
  `).join("");
}

function paymentRowsText(payments) {
  return payments
    .map((payment) => `- ${formatLongDateFr(payment.paidAt) || "Paiement"} | ${payment.method || "Paiement"} | ${formatMoneyCad(payment.amount)}`)
    .join("\n");
}

function renderPaidEmailHtml(wo, documentNumber, filename) {
  const summary = documentPaymentSummary(wo);
  const invoiceDate = formatLongDateFr(getDocumentDate(wo, "invoice"));
  const paidDate = formatLongDateFr(wo.paidAt) || formatLongDateFr(summary.payments.at(-1)?.paidAt) || "";
  const contactName = emailGreetingName(wo.client);
  const logoExists = fs.existsSync(LOGO_PATH);
  const friendly = isFriendlyBusinessClient(wo.client);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Facture payee ${escapeHtml(documentNumber)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f5;padding:34px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 34px rgba(23,32,51,0.12);">
          <tr>
            <td style="background-color:#0f7a53;padding:34px 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    ${logoExists ? `<img src="cid:${LOGO_CID}" alt="Vosthermos" height="104" style="display:block;border:0;outline:none;text-decoration:none;height:104px;width:auto;" />` : ""}
                  </td>
                  <td align="right" valign="middle" style="color:#ffffff;">
                    <div style="font-size:11px;letter-spacing:2px;opacity:.82;font-weight:800;text-transform:uppercase;">Facture payee</div>
                    <div style="font-size:25px;font-weight:900;margin-top:7px;line-height:1.1;">${escapeHtml(documentNumber)}</div>
                    <div style="font-size:12px;opacity:.88;margin-top:8px;">Date de facture : ${escapeHtml(invoiceDate)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 18px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111;">Bonjour${contactName ? ` ${escapeHtml(contactName)}` : ""},</h1>
              ${friendly ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">J'espere que tu vas bien.</p>` : ""}
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                ${friendly
                  ? `Nous confirmons que le paiement de la facture a bien ete recu${paidDate ? ` le <strong>${escapeHtml(paidDate)}</strong>` : ""}. Le PDF paye est joint a ce courriel pour tes dossiers.`
                  : `Nous confirmons que le paiement de votre facture a bien ete recu${paidDate ? ` le <strong>${escapeHtml(paidDate)}</strong>` : ""}. Le PDF paye est joint a ce courriel pour vos dossiers.`}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:22px 0;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font-size:11px;color:#8793a3;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;">Resume du paiement</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                      <tr>
                        <td style="padding:6px 0;color:#667085;font-size:13px;">Total facture</td>
                        <td align="right" style="padding:6px 0;color:#172033;font-size:13px;font-weight:800;">${escapeHtml(formatMoneyCad(summary.total))}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#667085;font-size:13px;">Paiements recus</td>
                        <td align="right" style="padding:6px 0;color:#0f7a53;font-size:13px;font-weight:900;">${escapeHtml(formatMoneyCad(summary.paidTotal))}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;border-top:2px solid #172033;color:#172033;font-size:15px;font-weight:900;">Solde</td>
                        <td align="right" style="padding:12px 0 0;border-top:2px solid #172033;color:#0f7a53;font-size:19px;font-weight:900;">${escapeHtml(formatMoneyCad(summary.balanceDue))}</td>
                      </tr>
                    </table>
                    ${summary.payments.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e2e8f0;margin-top:14px;padding-top:8px;">${paymentRowsHtml(summary.payments)}</table>` : ""}
                  </td>
                </tr>
              </table>
              <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 18px;margin:0 0 24px;">
                <div style="font-size:13px;color:#0f7a53;font-weight:900;margin-bottom:5px;">Pour vos prochains besoins</div>
                <div style="font-size:14px;color:#4b5563;line-height:1.6;">${friendly
                  ? "Si tu as une autre unite, une fenetre difficile a ouvrir ou une piece a remplacer, tu peux simplement me repondre ici et on gardera le dossier au meme endroit."
                  : "Gardez ce courriel sous la main. Si une autre fenetre, une porte patio ou une piece de quincaillerie demande un ajustement, repondez simplement ici et on reprendra le dossier rapidement."}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#7b8794;line-height:1.6;">
                <strong style="color:#172033;">Vosthermos</strong> - Reparation et remplacement de fenetres<br>
                Pour une question, repondez simplement a ce courriel.<br>
                <a href="${SITE_URL}" style="color:#0f7a53;text-decoration:none;">vosthermos.com</a>
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

function renderPaidEmailText(wo, documentNumber, filename) {
  const summary = documentPaymentSummary(wo);
  const invoiceDate = formatLongDateFr(getDocumentDate(wo, "invoice"));
  const paidDate = formatLongDateFr(wo.paidAt) || formatLongDateFr(summary.payments.at(-1)?.paidAt) || "";
  const contactName = emailGreetingName(wo.client);
  const friendly = isFriendlyBusinessClient(wo.client);

  return `Bonjour${contactName ? ` ${contactName}` : ""},

${friendly ? "J'espere que tu vas bien.\n\n" : ""}Nous confirmons que le paiement ${friendly ? "de la facture" : "de votre facture"} a bien ete recu${paidDate ? ` le ${paidDate}` : ""}.

Facture: ${documentNumber}
Date de facture: ${invoiceDate}
Piece jointe: ${filename}
Total facture: ${formatMoneyCad(summary.total)}
Paiements recus: ${formatMoneyCad(summary.paidTotal)}
Solde: ${formatMoneyCad(summary.balanceDue)}

${summary.payments.length ? `Paiements:\n${paymentRowsText(summary.payments)}\n\n` : ""}${friendly ? "Si tu as une autre unite, une fenetre difficile a ouvrir ou une piece a remplacer, tu peux simplement me repondre ici et on gardera le dossier au meme endroit." : "Gardez ce courriel sous la main. Si une autre fenetre, une porte patio ou une piece de quincaillerie demande un ajustement, repondez simplement ici et on reprendra le dossier rapidement."}

Vosthermos
${SITE_URL}
`;
}

export async function sendPaidInvoiceEmail(workOrder, { to } = {}) {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP non configure (SMTP_HOST manquant)");
  }

  const recipient = String(to || workOrder.client?.email || "").trim();
  if (!recipient) throw new Error("Adresse email client manquante");

  const serializedWo = serializeMoneyFields(workOrder);
  const documentMeta = getWorkOrderDocumentMeta("paid", "invoice");
  const documentNumber = resolveDocumentNumber(serializedWo);
  const filename = documentFilename(serializedWo, documentMeta);
  const [settings, company] = await Promise.all([
    getWorkOrderSettings(),
    getCompany(),
  ]);

  const pdfBuffer = await generateInvoicePdf(serializedWo, { ...settings, company, documentType: "invoice" });
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_USER;
  const replyToEmail = process.env.SMTP_REPLY_TO || process.env.COMPANY_EMAIL || "info@vosthermos.com";
  const logoExists = fs.existsSync(LOGO_PATH);
  const attachments = [
    {
      filename,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ];

  if (logoExists) {
    attachments.unshift({
      filename: "vosthermos-logo.png",
      path: LOGO_PATH,
      cid: LOGO_CID,
      contentDisposition: "inline",
    });
  }

  await transporter.sendMail({
    from: `"Vosthermos - Facturation" <${fromEmail}>`,
    to: recipient,
    replyTo: replyToEmail,
    envelope: { from: fromEmail, to: recipient },
    subject: `Facture payee ${documentNumber} - Vosthermos`,
    text: renderPaidEmailText(serializedWo, documentNumber, filename),
    html: renderPaidEmailHtml(serializedWo, documentNumber, filename),
    headers: {
      "X-Entity-Ref-ID": serializedWo.number,
    },
    attachments,
  });

  return { to: recipient, filename };
}
