import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { COMPANY_INFO } from "@/lib/company-info";

function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function cleanMoney(value) {
  const number = Number(String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100) / 100) : 0;
}

function cleanWarning(value) {
  return cleanText(value, 240)
    .replace(/\s+(additionnelles?|supplementaires?)\s+(a|à)\s+commander\b/gi, "")
    .replace(/\s+(a|à)\s+commander\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inferBillingName(client = {}, fallbackEmail = "") {
  const name = cleanText(client.name, 120);
  const email = cleanText(client.email || fallbackEmail, 160).toLowerCase();
  const localPart = email.split("@")[0] || "";
  const syndicateMatch = localPart.match(/^syndicat[-_.\s]*(\d+)/i);
  if (syndicateMatch && !/\bsyndicat\b/i.test(name)) {
    return `Syndicat ${syndicateMatch[1]}`;
  }
  return name;
}

function inferClientType(client = {}) {
  const name = cleanText(client.name, 120).toLowerCase();
  if (/(syndicat|condo|copropriete|copropriété)/i.test(name)) return "particulier";
  return client.type === "gestionnaire" ? "gestionnaire" : "particulier";
}

function cleanDescriptionAndWarnings(description, warnings) {
  const nextWarnings = [...warnings];
  let cleaned = cleanText(description, 1200);
  cleaned = cleaned.replace(/\s*(?:[aàAÀ] confirmer|[aàAÀ] verifier)\s*:\s*([^.\n]+)(?:\.|$)/g, (match, detail) => {
    const warning = cleanWarning(`A confirmer: ${detail}`);
    if (warning) nextWarnings.push(warning);
    return match.endsWith(".") ? "." : "";
  });
  cleaned = cleaned
    .replace(/\.{2,}/g, ".")
    .replace(/\s+\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { description: cleaned, warnings: nextWarnings };
}

function parseJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return JSON.parse(raw.slice(first, last + 1));
  }
  throw new Error("Reponse IA invalide");
}

function sanitizeDraft(input, fallbackDocumentType) {
  const draft = input && typeof input === "object" ? input : {};
  const documentType = ["invoice", "quote"].includes(draft.documentType) ? draft.documentType : fallbackDocumentType;
  const client = draft.client && typeof draft.client === "object" ? draft.client : {};
  const intervention = draft.intervention && typeof draft.intervention === "object" ? draft.intervention : {};
  const email = draft.email && typeof draft.email === "object" ? draft.email : {};
  const items = Array.isArray(draft.items) ? draft.items : [];
  const initialWarnings = Array.isArray(draft.warnings) ? draft.warnings : [];
  const moved = cleanDescriptionAndWarnings(draft.description, initialWarnings);

  const billingName = inferBillingName(client, email.to);

  return {
    documentType,
    client: {
      name: billingName,
      email: cleanText(client.email || email.to, 160),
      phone: cleanText(client.phone, 80),
      secondaryPhone: cleanText(client.secondaryPhone, 80),
      address: cleanText(client.address, 180),
      city: cleanText(client.city, 80),
      postalCode: cleanText(client.postalCode, 20),
      type: inferClientType({ ...client, name: billingName }),
    },
    intervention: {
      address: cleanText(intervention.address || client.address, 180),
      city: cleanText(intervention.city || client.city, 80),
      postalCode: cleanText(intervention.postalCode || client.postalCode, 20),
    },
    description: moved.description,
    items: items.slice(0, 30)
      .map((item) => ({
        description: cleanText(item?.description, 300),
        quantity: Math.max(0, Number(item?.quantity) || 1),
        unitPrice: cleanMoney(item?.unitPrice),
      }))
      .filter((item) => item.description && item.unitPrice > 0),
    email: {
      to: cleanText(email.to || client.email, 160),
      subject: cleanText(email.subject, 180),
      body: cleanText(email.body, 2000),
    },
    warnings: moved.warnings.map(cleanWarning).filter(Boolean).slice(0, 8),
  };
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  let apiKey = process.env.ANTHROPIC_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe("SELECT value FROM site_settings WHERE key = 'api_key_anthropic'");
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY manquant" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const rawText = cleanText(body.text, 6000);
  const documentType = body.documentType === "quote" ? "quote" : "invoice";
  if (!rawText) return NextResponse.json({ error: "Texte requis" }, { status: 400 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1800,
      system: `Tu extrais un brouillon de document Vosthermos a partir d'un message brut.

Retourne STRICTEMENT un objet JSON valide, sans markdown.

Schema:
{
  "documentType": "invoice" | "quote",
  "client": {
    "name": "nom a facturer",
    "email": "email de facturation",
    "phone": "telephone principal, avec nom du contact si present",
    "secondaryPhone": "autre telephone, avec nom du contact si present",
    "address": "adresse civique complete sans ville si possible",
    "city": "ville",
    "postalCode": "code postal si present",
    "type": "particulier" | "gestionnaire"
  },
  "intervention": { "address": "adresse des travaux", "city": "ville", "postalCode": "code postal" },
  "description": "court resume professionnel des travaux confirmes seulement",
  "items": [{ "description": "ligne facture/soumission", "quantity": 1, "unitPrice": 0 }],
  "email": { "to": "email destinataire", "subject": "sujet email", "body": "message email court et professionnel" },
  "warnings": ["points ambigus ou prix manquants"]
}

Regles:
- Type demande: ${documentType}.
- Utilise le design PDF existant: tu ne generes pas de PDF, seulement les donnees.
- Les lignes avec prix clair vont dans items.
- Les mentions sans prix clair ne vont pas dans items ni dans description; mets-les seulement dans warnings.
- Pour les warnings, conserve les mots du client autant que possible: "A confirmer: [texte original] (prix non fourni)".
- N'ajoute jamais "a commander", "a remplacer", "additionnel" ou une intention similaire si le message original ne le dit pas clairement.
- Si le message dit "Envoyer la facture a [email]" et que l'email identifie une entite de facturation, utilise cette entite comme client.name. Exemple: syndicat315@... => "Syndicat 315".
- Les personnes dans "coordonnees" sont des contacts; ne remplace pas le client facture par un contact si une entite de facturation est donnee.
- Ne mets pas type "gestionnaire" seulement parce qu'il y a un syndicat ou un condo; utilise "particulier" sauf si le message dit clairement gestionnaire, compagnie ou compte commercial.
- Pour items.description, redige des lignes professionnelles et completes. Si le prix semble global pour la reparation, precise que main-d'oeuvre et pieces sont incluses.
- Ne calcule pas les taxes. Les prix unitaires sont avant taxes.
- Si le message donne un email ou dit "envoyer la facture a", mets cet email dans client.email et email.to.
- Si la demande est en anglais, genere email.body en anglais. Sinon en francais quebecois professionnel.
- Pour une facture, sujet: "Facture Vosthermos - [client ou adresse]". Pour une soumission: "Soumission Vosthermos - [client ou adresse]".
- Le numero de telephone Vosthermos est ${COMPANY_INFO.phone}.`,
      messages: [
        {
          role: "user",
          content: rawText,
        },
      ],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Anthropic draft error:", error);
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }

  try {
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const draft = sanitizeDraft(parseJson(text), documentType);
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[work-orders ai-draft] parse error:", err?.message || err);
    return NextResponse.json({ error: "Impossible de lire le brouillon IA" }, { status: 500 });
  }
}
