import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-20250514";

function buildPrompt(products) {
  const list = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description || "",
    detailedDescription: p.detailedDescription || "",
  }));

  return `Tu es un traducteur professionnel specialise dans le vocabulaire technique des pieces de portes et fenetres (quincaillerie, vitrerie, menuiserie).

Tache: Traduire chaque produit du francais vers l'anglais canadien. Respecte la terminologie industrielle (patio door, sealed glass unit, weatherstripping, roller, striker plate, etc.).

Regles:
- "Porte-patio" -> "Patio door"
- "Vitre thermos" -> "Sealed glass unit" (ou "thermal glass")
- "Quincaillerie" -> "Hardware"
- "Coupe-froid" -> "Weatherstripping"
- "Moustiquaire" -> "Screen door" (ou "insect screen")
- "Charniere" -> "Hinge"
- "Poignee" -> "Handle"
- "Roulette" -> "Roller"
- "Serrure" -> "Lock"
- "Manivelle" -> "Crank handle"
- "Boulon" -> "Bolt"
- Noms de fabricants (Novatech, Lepage, Fenplast, etc.) restent en anglais tels quels
- Pas de traduction litterale maladroite
- Sois concis, pas de fluff

Retourne UNIQUEMENT un JSON valide avec cette structure exacte, rien d'autre (pas de texte avant ou apres, pas de markdown):
{
  "translations": [
    {
      "id": <product_id>,
      "nameEn": "<translated name>",
      "descriptionEn": "<translated short description>",
      "detailedDescriptionEn": "<translated detailed description>"
    }
  ]
}

Si la description ou description detaillee est vide, retourne une chaine vide "" dans le JSON.

Voici les produits a traduire:
${JSON.stringify(list, null, 2)}`;
}

async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Claude");

  // Parse JSON - strip markdown fences if present
  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${jsonText.slice(0, 300)}`);
  }
}

// GET — returns stats: how many products total, how many already translated, how many missing
export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const total = await prisma.product.count();
  const translated = await prisma.product.count({
    where: {
      AND: [
        { nameEn: { not: null } },
        { nameEn: { not: "" } },
      ],
    },
  });
  const missing = total - translated;

  return NextResponse.json({ total, translated, missing });
}

// POST — translates a batch of products
// Body: { ids?: number[], limit?: number }
// If ids provided, translates those. Otherwise, fetches next `limit` untranslated products.
export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY non configuree" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(body.limit || 10, 15); // max 15 per batch to stay within token limits

  let products;
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    products = await prisma.product.findMany({
      where: { id: { in: body.ids.slice(0, limit) } },
      select: { id: true, sku: true, name: true, description: true, detailedDescription: true },
    });
  } else {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { nameEn: null },
          { nameEn: "" },
        ],
      },
      select: { id: true, sku: true, name: true, description: true, detailedDescription: true },
      take: limit,
      orderBy: { id: "asc" },
    });
  }

  if (products.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0, translations: [], done: true });
  }

  const prompt = buildPrompt(products);

  let parsed;
  try {
    parsed = await callClaude(prompt);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  if (!Array.isArray(parsed?.translations)) {
    return NextResponse.json({ error: "Invalid AI response structure", raw: parsed }, { status: 500 });
  }

  // Save translations to DB
  const saved = [];
  const errors = [];
  for (const t of parsed.translations) {
    if (!t.id) continue;
    try {
      await prisma.product.update({
        where: { id: Number(t.id) },
        data: {
          nameEn: t.nameEn || null,
          descriptionEn: t.descriptionEn || null,
          detailedDescriptionEn: t.detailedDescriptionEn || null,
        },
      });
      saved.push({ id: t.id, nameEn: t.nameEn });
    } catch (e) {
      errors.push({ id: t.id, error: e.message });
    }
  }

  // Get remaining count
  const remaining = await prisma.product.count({
    where: {
      OR: [
        { nameEn: null },
        { nameEn: "" },
      ],
    },
  });

  return NextResponse.json({
    processed: saved.length,
    remaining,
    done: remaining === 0,
    translations: saved,
    errors: errors.length ? errors : undefined,
  });
}
