import { NextResponse } from "next/server";
import Stripe from "stripe";
import { COMPANY_INFO } from "@/lib/company-info";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { items, customer } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: "Informations de contact manquantes." }, { status: 400 });
    }

    // Build Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: `${item.sku} - ${item.name}`,
          images: item.image?.startsWith("http")
            ? [item.image]
            : [`${process.env.NEXT_PUBLIC_SITE_URL}${item.image}`],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.qty,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: "fr",
      customer_email: customer.email,
      line_items: lineItems,
      automatic_tax: { enabled: false },
      // Quebec taxes
      // Address already collected on our checkout form
      metadata: {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: `${customer.address}, ${customer.city}, ${customer.province} ${customer.postalCode}`,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      // Stripe generates and sends invoice/receipt to customer
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Commande Vosthermos — Pieces de portes et fenetres",
          footer: `Vosthermos — ${COMPANY_INFO.address} — RBQ: 5790-9498-01 — ${COMPANY_INFO.phone}`,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de la creation du paiement." },
      { status: 500 }
    );
  }
}
