import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getTransporter } from "@/lib/mail";
import { getWorkOrderSettings } from "@/lib/work-order-utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

function renderInvoiceHtml(wo, settings) {
  const fmt = (n) => `${Number(n || 0).toFixed(2)} $`;
  const date = new Date(wo.date).toLocaleDateString("fr-CA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const itemsRows = (wo.items || []).map((it) => {
    const isDiscount = it.itemType === "discount" || Number(it.unitPrice) < 0;
    const color = isDiscount ? "#059669" : "#111";
    return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;color:${color};">
          ${it.description || ""}
          ${it.product?.sku ? `<span style="color:#999;font-size:11px;"> (${it.product.sku})</span>` : ""}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:#555;">${Number(it.quantity).toFixed(0)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:${color};">${fmt(it.unitPrice)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:${color};font-weight:600;">${fmt(it.totalPrice)}</td>
      </tr>
    `;
  }).join("");

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:0 auto;background:#fff;color:#111;">
    <div style="background:#b91c1c;color:#fff;padding:24px;text-align:left;">
      <h1 style="margin:0;font-size:24px;letter-spacing:.5px;">VOSTHERMOS</h1>
      <p style="margin:4px 0 0;opacity:.85;font-size:13px;">Portes et fenetres — Reparation et remplacement</p>
    </div>

    <div style="padding:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
        <div style="flex:1;">
          <p style="margin:0;font-size:11px;color:#999;font-weight:600;text-transform:uppercase;">Facturer a</p>
          <p style="margin:4px 0 0;font-weight:700;font-size:15px;">${wo.client?.name || ""}</p>
          ${wo.client?.company ? `<p style="margin:2px 0;color:#555;font-size:13px;">${wo.client.company}</p>` : ""}
          ${wo.client?.address ? `<p style="margin:2px 0;color:#555;font-size:13px;">${wo.client.address}${wo.client?.city ? `, ${wo.client.city}` : ""}</p>` : ""}
          ${wo.client?.phone ? `<p style="margin:2px 0;color:#555;font-size:13px;">${wo.client.phone}</p>` : ""}
          ${wo.client?.email ? `<p style="margin:2px 0;color:#555;font-size:13px;">${wo.client.email}</p>` : ""}
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:11px;color:#999;font-weight:600;text-transform:uppercase;">Facture</p>
          <p style="margin:4px 0 0;font-weight:700;font-size:18px;color:#b91c1c;">${wo.number}</p>
          <p style="margin:2px 0;color:#555;font-size:13px;">${date}</p>
          ${wo.technician?.name ? `<p style="margin:2px 0;color:#555;font-size:12px;">Tech: ${wo.technician.name}</p>` : ""}
        </div>
      </div>

      ${wo.description ? `
        <div style="background:#f9fafb;border-left:3px solid #b91c1c;padding:12px 16px;margin-bottom:20px;border-radius:0 6px 6px 0;">
          <p style="margin:0;font-size:11px;color:#999;font-weight:600;text-transform:uppercase;">Description du travail</p>
          <p style="margin:6px 0 0;color:#333;font-size:13px;white-space:pre-wrap;">${wo.description}</p>
        </div>
      ` : ""}

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #111;color:#999;font-size:11px;text-transform:uppercase;">Description</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #111;color:#999;font-size:11px;text-transform:uppercase;width:60px;">Qte</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #111;color:#999;font-size:11px;text-transform:uppercase;width:90px;">Prix</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #111;color:#999;font-size:11px;text-transform:uppercase;width:100px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div style="margin-left:auto;width:300px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#666;">Pieces</span><span>${fmt(wo.totalPieces)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#666;">Main d'oeuvre</span><span>${fmt(wo.totalLabor)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #e5e7eb;"><span style="color:#666;">Sous-total</span><span>${fmt(wo.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#999;">TPS${settings.tps_number ? ` (${settings.tps_number})` : ""}</span><span style="color:#666;">${fmt(wo.tps)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#999;">TVQ${settings.tvq_number ? ` (${settings.tvq_number})` : ""}</span><span style="color:#666;">${fmt(wo.tvq)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 4px;border-top:2px solid #111;font-size:16px;font-weight:700;"><span>Total</span><span style="color:#b91c1c;">${fmt(wo.total)}</span></div>
      </div>

      ${wo.signatureUrl ? `
        <div style="margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
          <p style="margin:0;font-size:11px;color:#999;font-weight:600;text-transform:uppercase;">Signature du client</p>
          <img src="${wo.signatureUrl}" alt="Signature" style="max-height:80px;margin-top:8px;" />
        </div>
      ` : ""}

      ${settings.work_order_conditions ? `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#999;font-weight:600;text-transform:uppercase;">Conditions</p>
          <p style="margin:6px 0 0;color:#555;font-size:11px;white-space:pre-wrap;">${settings.work_order_conditions}</p>
        </div>
      ` : ""}
    </div>

    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#999;font-size:11px;">Merci de faire affaire avec Vosthermos — ${SITE_URL}</p>
    </div>
  </div>
  `;
}

export async function POST(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

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
    },
  });

  if (!wo) return NextResponse.json({ error: "Bon introuvable" }, { status: 404 });

  const to = body.to?.trim() || wo.client?.email;
  if (!to) return NextResponse.json({ error: "Adresse email manquante" }, { status: 400 });

  const settings = await getWorkOrderSettings();
  const html = renderInvoiceHtml({
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items.map((i) => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
  }, settings);

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Vosthermos" <${process.env.SMTP_USER}>`,
      to,
      subject: `Facture ${wo.number} — Vosthermos`,
      html,
    });

    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { statut: "sent" },
    });

    return NextResponse.json({ ok: true, to });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur d'envoi" }, { status: 500 });
  }
}
