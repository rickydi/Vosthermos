import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getTransporter } from "@/lib/mail";
import { getWorkOrderSettings } from "@/lib/work-order-utils";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { formatDateOnly } from "@/lib/date-only";
import { logAdminActivity } from "@/lib/admin-activity";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { getCompany } from "@/lib/company";
import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
import { documentFilename, formatMoneyCad, getDocumentDate, resolveDocumentNumber } from "@/lib/vosthermos-document";
import { buildPaymentTrackingData } from "@/lib/payment-tracking";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";
const LOGO_URL = `${SITE_URL}/images/Vos-Thermos-Logo_Blanc.png`;

function fmt(n) { return formatMoneyCad(n); }

function renderEmailHtml(wo, documentMeta, documentNumber, filename) {
  const date = formatDateOnly(getDocumentDate(wo, documentMeta.type), {
    day: "numeric", month: "long", year: "numeric",
  });
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${documentMeta.label} ${documentNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b91c1c 0%,#991b1b 100%);background-color:#b91c1c;padding:40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="${LOGO_URL}" alt="Vosthermos" height="80" style="display:block;border:0;outline:none;text-decoration:none;height:80px;" />
                  </td>
                  <td align="right" valign="middle" style="color:#ffffff;">
                    <div style="font-size:11px;letter-spacing:3px;opacity:.75;font-weight:600;">${documentMeta.labelUpper}</div>
                    <div style="font-size:26px;font-weight:800;margin-top:6px;">${documentNumber}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111;">Bonjour ${wo.client?.name?.split(" ")[0] || ""},</h1>
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
                    <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:1px;">DATE</div>
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
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#9ca3af;line-height:1.6;">
                <strong style="color:#111;">Vosthermos</strong> — Portes et fenetres<br>
                Reparation et remplacement<br>
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

function renderEmailText(wo, documentMeta, documentNumber) {
  const date = formatDateOnly(getDocumentDate(wo, documentMeta.type));
  const name = wo.client?.name?.split(" ")[0] || "";
  return `Bonjour ${name},

Merci d'avoir choisi Vosthermos pour vos travaux.
${documentMeta.emailIntro}

${documentMeta.labelUpper} ${documentNumber}
Date: ${date}

Sous-total: ${fmt(wo.subtotal)}
TPS + TVQ:  ${fmt(Number(wo.tps) + Number(wo.tvq))}
TOTAL:      ${fmt(wo.total)}

${documentMeta.emailQuestion}

---
Vosthermos — Portes et fenetres
Reparation et remplacement
${SITE_URL}
`;
}

export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  if (!process.env.SMTP_HOST) {
    return NextResponse.json({ error: "SMTP non configure (SMTP_HOST manquant)" }, { status: 500 });
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
    },
  });

  if (!wo) return NextResponse.json({ error: "Bon introuvable" }, { status: 404 });

  const to = body.to?.trim() || wo.client?.email;
  if (!to) return NextResponse.json({ error: "Adresse email manquante" }, { status: 400 });
  const documentMeta = getWorkOrderDocumentMeta(wo.statut, body.documentType);
  const documentNumber = resolveDocumentNumber(wo);
  const filename = documentFilename(wo, documentMeta);
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
    items: wo.items.map(serItem),
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
    const fromEmail = process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"Vosthermos" <${fromEmail}>`,
      to,
      replyTo: fromEmail,
      subject: `${documentMeta.subjectPrefix} ${documentNumber} - Vosthermos`,
      text: renderEmailText(serializedWo, documentMeta, documentNumber),
      html: renderEmailHtml(serializedWo, documentMeta, documentNumber, filename),
      headers: {
        "X-Entity-Ref-ID": wo.number,
        "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
      },
      attachments: [
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
