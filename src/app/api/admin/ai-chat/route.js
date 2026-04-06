import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquant" }, { status: 500 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "generate") {
    const { messages, clientName } = body;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `Tu es un assistant pour Vosthermos, une entreprise de reparation de portes et fenetres au Quebec. Tu rediges des reponses professionnelles, courtes et chaleureuses en francais quebecois (pas de France) aux messages des clients. Tutoie le client. Signe jamais le message. Ne mets pas de guillemets autour de la reponse. Le numero de telephone est 514-825-8411.`,
        messages: [
          {
            role: "user",
            content: `Voici la conversation avec ${clientName || "le client"}:\n\n${messages}\n\nRedige une reponse courte et professionnelle au dernier message du client.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", err);
      return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || "";
    return NextResponse.json({ reply });
  }

  if (action === "correct") {
    const { text } = body;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `Tu corriges le texte fourni: orthographe, grammaire, ponctuation. Garde le meme ton et style. Retourne SEULEMENT le texte corrige, rien d'autre. Pas de guillemets, pas d'explication.`,
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", err);
      return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
    }

    const data = await res.json();
    const corrected = data.content?.[0]?.text || text;
    return NextResponse.json({ corrected });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
