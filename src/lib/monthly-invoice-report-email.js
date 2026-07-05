import prisma from "@/lib/prisma";
import {
  getMailConfigurationError,
  getMailEnvelopeFrom,
  getMailFromHeader,
  getReplyToEmail,
  getTransporter,
  isMailDeliveryConfigured,
} from "@/lib/mail";
import {
  buildMonthlyInvoiceCsv,
  computeMonthlyInvoiceTotals,
  getMonthlyInvoiceWorkOrders,
  getMonthlyReportExtras,
  monthLabelFr,
  renderMonthlyInvoiceReportPdf,
} from "@/lib/monthly-invoice-report";
import { getCompany } from "@/lib/company";
import { formatMoneyCad } from "@/lib/vosthermos-document";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function getAccountantEmail() {
  const row = await prisma.siteSetting.findUnique({ where: { key: "accountant_email" } });
  const value = String(row?.value || "").trim();
  return value || null;
}

function renderReportEmailHtml({ company, monthLabel, totals }) {
  const row = (label, value, strong = false) => `
    <tr>
      <td style="padding:7px 0;color:#667085;font-size:14px;">${escapeHtml(label)}</td>
      <td align="right" style="padding:7px 0;color:#172033;font-size:14px;font-weight:${strong ? "900" : "700"};">${escapeHtml(value)}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe3ea;">
          <tr>
            <td style="background:#172033;color:#fff;padding:28px 34px;">
              <div style="font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#b7f4ea;font-weight:800;">Rapport mensuel comptable</div>
              <div style="font-size:24px;font-weight:900;margin-top:8px;">${escapeHtml(monthLabel)}</div>
              <div style="font-size:13px;color:#d8dee8;margin-top:6px;">${escapeHtml(company.legalName || "Vosthermos")}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 34px;">
              <p style="font-size:15px;line-height:1.6;margin:0 0 18px;color:#374151;">
                Bonjour, le rapport mensuel des factures Vosthermos est joint a ce courriel en PDF et CSV.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr><td style="padding:16px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    ${row(`Factures (${totals.count})`, formatMoneyCad(totals.total), true)}
                    ${row("Sous-total", formatMoneyCad(totals.subtotal))}
                    ${row("TPS", formatMoneyCad(totals.tps))}
                    ${row("TVQ", formatMoneyCad(totals.tvq))}
                    ${totals.creditCount ? row(`Notes de credit (${totals.creditCount})`, `- ${formatMoneyCad(totals.creditTotal)}`) : ""}
                    ${totals.refundCount ? row(`Remboursements (${totals.refundCount})`, `- ${formatMoneyCad(totals.refundTotal)}`) : ""}
                    ${totals.creditCount || totals.refundCount ? row("NET du mois", formatMoneyCad(totals.netTotal), true) : ""}
                    ${row("Encaisse", formatMoneyCad(totals.paidTotal))}
                    ${row("Solde a recevoir", formatMoneyCad(totals.balanceDue), true)}
                  </table>
                </td></tr>
              </table>
              <p style="font-size:13px;line-height:1.5;margin:18px 0 0;color:#667085;">
                Le CSV contient une ligne par facture avec le client, les taxes, les paiements et le solde.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderReportEmailText({ company, monthLabel, totals }) {
  return `Rapport mensuel comptable - ${monthLabel}
${company.legalName || "Vosthermos"}

Factures: ${totals.count}
Total facture: ${formatMoneyCad(totals.total)}
Sous-total: ${formatMoneyCad(totals.subtotal)}
TPS: ${formatMoneyCad(totals.tps)}
TVQ: ${formatMoneyCad(totals.tvq)}${totals.creditCount ? `
Notes de credit (${totals.creditCount}): - ${formatMoneyCad(totals.creditTotal)}` : ""}${totals.refundCount ? `
Remboursements (${totals.refundCount}): - ${formatMoneyCad(totals.refundTotal)}` : ""}${totals.creditCount || totals.refundCount ? `
NET du mois: ${formatMoneyCad(totals.netTotal)}` : ""}
Encaisse: ${formatMoneyCad(totals.paidTotal)}
Solde a recevoir: ${formatMoneyCad(totals.balanceDue)}

Le PDF et le CSV sont joints a ce courriel.
`;
}

export async function sendMonthlyInvoiceReportEmail(yearMonth, opts = {}) {
  if (!isMailDeliveryConfigured()) {
    throw new Error(getMailConfigurationError() || "Courriel non configure");
  }

  const to = await getAccountantEmail();
  if (!to) return { sent: false, skipped: "no_accountant_email" };

  const markerKey = `monthly_invoice_report_sent:${yearMonth}`;
  if (!opts.force) {
    const marker = await prisma.siteSetting.findUnique({ where: { key: markerKey } });
    if (marker?.value) return { sent: false, skipped: "already_sent" };
  }

  const [workOrders, extras] = await Promise.all([
    getMonthlyInvoiceWorkOrders(yearMonth),
    getMonthlyReportExtras(yearMonth),
  ]);
  // Un mois sans facture mais avec une note de credit doit quand meme sortir.
  if (workOrders.length === 0 && extras.creditNotes.length === 0) return { sent: false, skipped: "empty" };

  const [company, pdfBuffer] = await Promise.all([
    getCompany(),
    renderMonthlyInvoiceReportPdf(yearMonth, workOrders, extras),
  ]);
  const totals = computeMonthlyInvoiceTotals(workOrders, extras.creditNotes);
  const csv = buildMonthlyInvoiceCsv(workOrders, extras.creditNotes);
  const monthLabel = monthLabelFr(yearMonth);
  const transporter = getTransporter();
  const stamp = new Date().toISOString();
  let drive = { uploaded: false, skipped: "not_attempted" };

  await prisma.siteSetting.upsert({
    where: { key: markerKey },
    create: { key: markerKey, value: stamp },
    update: { value: stamp },
  });

  try {
    await transporter.sendMail({
      from: getMailFromHeader("Vosthermos - Comptabilite"),
      to,
      replyTo: getReplyToEmail(),
      envelope: { from: getMailEnvelopeFrom(), to },
      subject: `Rapport mensuel factures ${monthLabel} - Vosthermos`,
      text: renderReportEmailText({ company, monthLabel, totals }),
      html: renderReportEmailHtml({ company, monthLabel, totals }),
      headers: {
        "X-Entity-Ref-ID": `monthly-invoice-report-${yearMonth}`,
      },
      attachments: [
        {
          filename: `rapport-factures-vosthermos-${yearMonth}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
        {
          filename: `rapport-factures-vosthermos-${yearMonth}.csv`,
          content: csv,
          contentType: "text/csv; charset=utf-8",
        },
      ],
    });
  } catch (error) {
    await prisma.siteSetting.deleteMany({ where: { key: markerKey } });
    throw error;
  }

  try {
    const { uploadMonthlyInvoiceReportToDrive } = await import("@/lib/google-drive");
    drive = await uploadMonthlyInvoiceReportToDrive(yearMonth, { pdfBuffer, csv });
  } catch (error) {
    drive = { uploaded: false, error: error?.message || "Erreur Google Drive" };
    console.error("[monthly invoice report] drive upload failed:", error?.message || error);
  }

  return { sent: true, to, count: workOrders.length, month: yearMonth, drive };
}
