import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { COMPANY_INFO } from "@/lib/company-info";
import { callAnthropicAdmin } from "@/lib/anthropic-admin";

function latestClientMessage(messages = "") {
  const lines = String(messages || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (/^vosthermos\s*:/i.test(line)) continue;
    const [, content = line] = line.split(/:(.*)/s);
    const text = String(content || "").trim();
    if (text && !/^https?:\/\//i.test(text) && !/^photo\s*:/i.test(text)) return text;
  }
  return "";
}

function detectReplyLanguage(text = "") {
  const value = String(text || "").toLowerCase();
  const englishMatches = value.match(/\b(the|and|for|with|window|windows|door|doors|glass|quote|estimate|repair|replace|replacement|please|thanks|thank|hello|hi|how|can|you|your|need|would|like|appointment|available)\b/g) || [];
  const frenchMatches = value.match(/\b(le|la|les|des|pour|avec|fenetre|fenetres|porte|portes|vitre|thermos|soumission|reparation|remplacement|bonjour|salut|merci|pouvez|peux|besoin|rendez-vous|disponible)\b/g) || [];
  const hasFrenchSignal = /[àâçéèêëîïôùûüÿœ]/i.test(value);
  if (englishMatches.length > frenchMatches.length && !hasFrenchSignal) return "English";
  return "French";
}

export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "generate") {
    const { messages, clientName } = body;
    const clientLanguage = detectReplyLanguage(latestClientMessage(messages));

    let ai;
    try {
      ai = await callAnthropicAdmin({
        maxTokens: 300,
        system: `Tu es un assistant pour Vosthermos, une entreprise de reparation de portes et fenetres au Quebec.

Regles de langue:
- Reponds dans la meme langue que le dernier message du client.
- Langue detectee pour cette reponse: ${clientLanguage}.
- Si la langue detectee est English, reponds en anglais canadien naturel.
- Si la langue detectee est French, reponds en francais quebecois naturel, pas en francais de France.

Style:
- Redige une reponse courte, professionnelle, chaleureuse et plus polie.
- Ne sois pas trop familier. En francais, tutoie le client seulement si la conversation est deja tres familiere; sinon utilise "vous".
- Sois concret: accuse reception, mentionne la prochaine etape, et invite a envoyer photo/adresse/disponibilites seulement si pertinent.
- Ne promets pas un prix fixe sans mesure ou verification.
- Signe jamais le message.
- Ne mets pas de guillemets autour de la reponse.
- Le numero de telephone est ${COMPANY_INFO.phone}.`,
        messages: [
          {
            role: "user",
            content: `Voici la conversation avec ${clientName || "le client"}:\n\n${messages}\n\nRedige une reponse polie, naturelle et professionnelle au dernier message du client, dans la langue detectee.`,
          },
        ],
      });
    } catch (err) {
      console.error("Anthropic error:", err.detail || err.message);
      return NextResponse.json({ error: err.message || "Erreur IA" }, { status: err.status || 500 });
    }

    const data = ai.data;
    const reply = data.content?.[0]?.text || "";
    return NextResponse.json({ reply, analysisCost: ai.analysisCost });
  }

  if (action === "correct") {
    const { text } = body;

    let ai;
    try {
      ai = await callAnthropicAdmin({
        maxTokens: 300,
        system: `Tu corriges et polis le texte fourni dans la meme langue que le texte original: orthographe, grammaire, ponctuation et formulation. Garde le sens et un ton professionnel, naturel et chaleureux. Retourne SEULEMENT le texte corrige, rien d'autre. Pas de guillemets, pas d'explication.`,
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });
    } catch (err) {
      console.error("Anthropic error:", err.detail || err.message);
      return NextResponse.json({ error: err.message || "Erreur IA" }, { status: err.status || 500 });
    }

    const data = ai.data;
    const corrected = data.content?.[0]?.text || text;
    return NextResponse.json({ corrected, analysisCost: ai.analysisCost });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
