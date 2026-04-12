import { NextResponse } from "next/server";
import { upsertClientFromLead } from "@/lib/upsert-client";

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, email, service, message } = data;

    if (!name || !phone || !email || !service) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    await upsertClientFromLead({
      name,
      phone,
      email,
      notes: [service ? `Service: ${service}` : null, message || null].filter(Boolean).join("\n") || null,
      source: "formulaire contact",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
