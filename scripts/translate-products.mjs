#!/usr/bin/env node
// Standalone script to translate all untranslated products using Claude API.
// Run on VPS: node scripts/translate-products.mjs
// Reads ANTHROPIC_API_KEY from .env
// Processes in batches of 10, auto-retries on error.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (m) {
      const [, key, rawVal] = m;
      let val = rawVal.trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const MODEL = "claude-sonnet-4-20250514";
const BATCH_SIZE = 10;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Fetch API key from DB (stored in site_settings.api_key_anthropic)
const keyRow = await prisma.$queryRawUnsafe(
  `SELECT value FROM site_settings WHERE key = 'api_key_anthropic' LIMIT 1`
);
const ANTHROPIC_API_KEY = keyRow?.[0]?.value || process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("No Anthropic API key found in DB (api_key_anthropic) or env");
  process.exit(1);
}
console.log(`Using Anthropic key: ${ANTHROPIC_API_KEY.slice(0, 15)}... (${ANTHROPIC_API_KEY.length} chars)`);

function buildPrompt(products) {
  const list = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description || "",
    detailedDescription: p.detailedDescription || "",
  }));

  return `Tu es un traducteur professionnel specialise dans le vocabulaire technique des pieces de portes et fenetres (quincaillerie, vitrerie, menuiserie).

Tache: Traduire chaque produit du francais vers l'anglais canadien. Respecte la terminologie industrielle.

Regles:
- "Porte-patio" -> "Patio door"
- "Vitre thermos" -> "Sealed glass unit"
- "Quincaillerie" -> "Hardware"
- "Coupe-froid" -> "Weatherstripping"
- "Moustiquaire" -> "Screen door"
- "Charniere" -> "Hinge"
- "Poignee" -> "Handle"
- "Roulette" -> "Roller"
- "Serrure" -> "Lock"
- "Manivelle" -> "Crank handle"
- Noms de fabricants (Novatech, Lepage, Fenplast, Novatech, Jeld-Wen, Kohltech) restent identiques
- Sois concis

Retourne UNIQUEMENT un JSON valide, rien d'autre (pas de markdown, pas de texte autour):
{"translations":[{"id":<id>,"nameEn":"...","descriptionEn":"...","detailedDescriptionEn":"..."}]}

Si description vide, retourne "".

Produits:
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
    throw new Error(`API ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error("Empty response");

  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonText);
}

// A product needs re-translation if descriptionEn is missing OR is just a copy of nameEn
// (the existing bad data pattern where descriptions got nameEn copied into them)
const NEEDS_TRANSLATION_SQL = `
  ("descriptionEn" IS NULL OR "descriptionEn" = '' OR "descriptionEn" = "nameEn")
  OR ("detailedDescription" IS NOT NULL AND "detailedDescription" != '' AND ("detailedDescriptionEn" IS NULL OR "detailedDescriptionEn" = '' OR "detailedDescriptionEn" = "nameEn"))
`;

async function main() {
  const total = await prisma.product.count();
  const missingRows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as n FROM products WHERE ${NEEDS_TRANSLATION_SQL}`
  );
  const missing = missingRows[0]?.n || 0;

  console.log(`\n===== Translation Script =====`);
  console.log(`Total products: ${total}`);
  console.log(`With proper EN descriptions: ${total - missing}`);
  console.log(`To translate: ${missing}`);
  console.log(`Estimated cost: ~$${(missing * 0.003).toFixed(2)} USD`);
  console.log(`Estimated batches: ${Math.ceil(missing / BATCH_SIZE)}`);
  console.log(`Estimated duration: ~${Math.ceil(missing / BATCH_SIZE * 15 / 60)} min\n`);

  if (missing === 0) {
    console.log("Nothing to translate. Exiting.");
    await prisma.$disconnect();
    return;
  }

  let processed = 0;
  let batchNum = 0;
  const startTime = Date.now();

  while (true) {
    batchNum++;
    const products = await prisma.$queryRawUnsafe(
      `SELECT id, sku, name, description, "detailedDescription" AS "detailedDescription"
       FROM products
       WHERE ${NEEDS_TRANSLATION_SQL}
       ORDER BY id ASC
       LIMIT ${BATCH_SIZE}`
    );

    if (products.length === 0) {
      console.log(`\nAll done! ${processed} products translated.`);
      break;
    }

    const remaining = missing - processed;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(`[Batch ${batchNum}] ${products.length} products (${processed}/${missing} done, ${elapsed}s elapsed)... `);

    let result;
    let retries = 0;
    while (retries < 3) {
      try {
        const prompt = buildPrompt(products);
        result = await callClaude(prompt);
        break;
      } catch (e) {
        retries++;
        console.log(`ERROR (retry ${retries}/3): ${e.message}`);
        if (retries >= 3) {
          console.error("Max retries reached, skipping batch");
          result = null;
          break;
        }
        await new Promise((r) => setTimeout(r, 3000 * retries));
      }
    }

    if (!result || !Array.isArray(result.translations)) {
      console.log("FAILED - skipping");
      continue;
    }

    let savedInBatch = 0;
    for (const t of result.translations) {
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
        savedInBatch++;
      } catch (e) {
        console.log(`\n  Error saving #${t.id}: ${e.message}`);
      }
    }
    processed += savedInBatch;
    console.log(`OK (${savedInBatch} saved)`);

    // Rate limit: wait 1.5s between batches
    await new Promise((r) => setTimeout(r, 1500));
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n===== Done in ${totalElapsed}s =====`);
  console.log(`Final: ${processed} products translated`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Fatal error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
