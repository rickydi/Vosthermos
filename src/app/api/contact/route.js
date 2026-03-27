import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, email, service, message } = data;

    if (!name || !phone || !email || !service) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // For now, log the submission. Later: send email via nodemailer or API.
    console.log("=== NOUVELLE SOUMISSION ===");
    console.log(`Nom: ${name}`);
    console.log(`Tel: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Service: ${service}`);
    console.log(`Message: ${message || "(aucun)"}`);
    console.log("===========================");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
