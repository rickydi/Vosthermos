import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { COMPANY_INFO } from "@/lib/company-info";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

export async function POST(request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID manquant" }, { status: 400 });
    }

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Paiement non complete" }, { status: 400 });
    }

    // Check if already processed
    const existing = await prisma.order.findFirst({
      where: { stripeId: sessionId },
    });
    if (existing) {
      return NextResponse.json({ orderId: existing.id, alreadyProcessed: true });
    }

    // Save order to database
    const order = await prisma.order.create({
      data: {
        stripeId: sessionId,
        name: session.metadata?.customerName || "",
        email: session.customer_email || "",
        phone: session.metadata?.customerPhone || "",
        address: session.metadata?.customerAddress?.split(",")[0]?.trim() || "",
        city: session.metadata?.customerAddress?.split(",")[1]?.trim() || "",
        province: "QC",
        postalCode: "",
        total: session.amount_total / 100,
        status: "paid",
        items: session.line_items?.data.map((item) => ({
          name: item.description,
          qty: item.quantity,
          price: item.amount_total / 100,
        })) || [],
      },
    });

    const items = session.line_items?.data || [];
    const total = (session.amount_total / 100).toFixed(2);

    // Build items HTML table
    const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${item.description}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">${(item.amount_total / 100).toFixed(2)} $</td>
      </tr>
    `).join("");

    const emailHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: #0d9488; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Confirmation de commande</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Commande #${order.id}</p>
        </div>
        <div style="padding: 24px;">
          <p style="color: #333; font-size: 16px;">Bonjour ${session.metadata?.customerName || ""},</p>
          <p style="color: #666; font-size: 14px;">Merci pour votre commande! Voici votre recapitulatif :</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888;">Article</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #888;">Qte</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #888;">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">Total :</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #0d9488;">${total} $</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #888; font-weight: 600;">PROCHAINES ETAPES :</p>
            <p style="margin: 0; font-size: 14px; color: #555;">Notre equipe vous contactera pour organiser la livraison ou le ramassage de vos pieces.</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://www.vosthermos.com/boutique" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continuer les achats</a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Des questions? Appelez-nous au ${COMPANY_INFO.phone} ou ecrivez a ${COMPANY_INFO.email}
          </p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 11px; margin: 0;">Vosthermos — ${COMPANY_INFO.address}</p>
        </div>
      </div>
    `;

    const transporter = getTransporter();

    // Email to customer
    if (session.customer_email) {
      await transporter.sendMail({
        from: '"Vosthermos" <noreply@vosthermos.com>',
        to: session.customer_email,
        subject: `Confirmation de commande #${order.id} — Vosthermos`,
        html: emailHtml,
      });
    }

    // Email to admin
    await transporter.sendMail({
      from: '"Vosthermos Boutique" <noreply@vosthermos.com>',
      to: COMPANY_INFO.email,
      subject: `Nouvelle commande #${order.id} — ${total} $ — ${session.metadata?.customerName || "Client"}`,
      html: emailHtml.replace("Confirmation de commande", "NOUVELLE COMMANDE").replace("Bonjour " + (session.metadata?.customerName || ""), `<strong>Client:</strong> ${session.metadata?.customerName || ""}<br><strong>Tel:</strong> ${session.metadata?.customerPhone || ""}<br><strong>Email:</strong> ${session.customer_email || ""}<br><strong>Adresse:</strong> ${session.metadata?.customerAddress || ""}`),
    });

    return NextResponse.json({ orderId: order.id, email: session.customer_email, success: true });
  } catch (err) {
    console.error("Order confirm error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
