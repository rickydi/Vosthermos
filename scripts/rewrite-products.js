#!/usr/bin/env node

/**
 * Rewrite all product descriptions to be unique Vosthermos content.
 * Keeps technical specs but reformulates text.
 */

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { Pool } = pg;

// Category-specific intro templates
const categoryIntros = {
  "Balances à cordes": [
    "Balance a cordes de qualite professionnelle pour fenetre a guillotine.",
    "Piece de remplacement essentielle pour le bon fonctionnement de votre fenetre a guillotine.",
    "Balance a cordes compatible avec la majorite des fenetres a guillotine sur le marche quebecois.",
  ],
  "Roulettes": [
    "Roulette de remplacement pour porte-patio coulissante.",
    "Redonnez a votre porte-patio un glissement fluide avec cette roulette de remplacement.",
    "Roulette robuste concue pour supporter le poids de votre porte-patio.",
  ],
  "Opérateurs": [
    "Operateur de remplacement pour fenetre a battant ou a auvent.",
    "Mecanisme d'ouverture de qualite pour fenetre a battant.",
    "Piece de remplacement pour le mecanisme d'ouverture de votre fenetre.",
  ],
  "Poignées": [
    "Poignee de remplacement pour porte ou fenetre.",
    "Piece de quincaillerie de qualite pour remplacer votre poignee usee.",
    "Poignee compatible avec plusieurs modeles de portes et fenetres.",
  ],
  "Barrures": [
    "Mecanisme de verrouillage de remplacement pour porte ou fenetre.",
    "Serrure de qualite pour assurer la securite de votre domicile.",
    "Piece de remplacement pour le systeme de verrouillage de votre porte ou fenetre.",
  ],
  "Charnières": [
    "Charniere de remplacement pour fenetre a battant.",
    "Piece de quincaillerie robuste pour la rotation de votre fenetre.",
    "Charniere compatible avec les fenetres a battant et a auvent.",
  ],
  "Spirales": [
    "Balance a spirale de remplacement pour fenetre a guillotine.",
    "Spirale de qualite pour maintenir votre fenetre a guillotine ouverte.",
    "Piece essentielle pour le mecanisme de balancement de votre fenetre.",
  ],
  "Accessoires": [
    "Accessoire de quincaillerie pour portes et fenetres.",
    "Piece complementaire pour l'entretien de vos portes et fenetres.",
    "Accessoire de remplacement compatible avec plusieurs modeles.",
  ],
  "Garde-robes": [
    "Piece de quincaillerie pour porte de garde-robe coulissante.",
    "Composant de remplacement pour systeme de porte coulissante.",
    "Quincaillerie de qualite pour porte de placard coulissante.",
  ],
  "Portes résidentielles": [
    "Piece de quincaillerie pour porte d'entree residentielle.",
    "Composant de remplacement pour porte residentielle.",
    "Quincaillerie adaptee aux portes d'entree residentielles du Quebec.",
  ],
  "Douches": [
    "Piece de quincaillerie pour porte de douche.",
    "Composant de remplacement pour cabine de douche en verre.",
    "Quincaillerie specialisee pour portes et parois de douche.",
  ],
  "Sabots et pivots": [
    "Sabot ou pivot de remplacement pour porte.",
    "Piece de quincaillerie pour le mecanisme de pivot de votre porte.",
    "Composant essentiel pour le bon fonctionnement de votre porte pivotante.",
  ],
  "Autres": [
    "Piece de quincaillerie pour portes et fenetres.",
    "Composant de remplacement pour vos portes et fenetres.",
    "Piece de rechange compatible avec plusieurs modeles.",
  ],
};

// Rewrite patterns
function rewriteName(name) {
  return name
    .replace(/^Charnière/i, "Charniere")
    .replace(/^Opérateur/i, "Operateur")
    .replace(/^Poignée/i, "Poignee")
    .replace(/"/g, "")
    .replace(/Truth/g, "type Truth")
    .replace(/Encore/g, "serie Encore");
}

function extractSpecs(text) {
  if (!text) return "";
  // Extract measurements and technical specs
  const specs = [];
  const measurements = text.match(/\d+[\s]*[\/\d]*[\s]*["']|[\d]+\s*(?:po|mm|cm|"|')/g);
  if (measurements) specs.push(...new Set(measurements));

  const dimensions = text.match(/(?:Longueur|Largeur|Hauteur|Base|Bras)[\s:=-]+[^.]+/gi);
  if (dimensions) specs.push(...dimensions.map(d => d.trim()));

  return specs.join(". ");
}

function rewriteDescription(product, categoryName) {
  const intros = categoryIntros[categoryName] || categoryIntros["Autres"];
  const intro = intros[product.id % intros.length];

  let desc = intro;

  // Add SKU reference
  desc += ` Reference Vosthermos: ${product.sku}.`;

  return desc;
}

function rewriteDetailedDescription(product, categoryName) {
  if (!product.detailedDescription) return null;

  const original = product.detailedDescription;
  const intros = categoryIntros[categoryName] || categoryIntros["Autres"];
  const intro = intros[(product.id + 1) % intros.length];

  let parts = [];

  // Intro
  parts.push(`<p>${intro}</p>`);

  // Extract and keep technical specs
  const specs = extractSpecs(original);
  if (specs) {
    parts.push(`<p><strong>Specifications techniques:</strong> ${specs}</p>`);
  }

  // Compatibility note based on category
  if (categoryName === "Balances à cordes" || categoryName === "Spirales") {
    parts.push("<p><strong>Important:</strong> Les balances sont toujours vendues en paire. Pour assurer le bon fonctionnement, remplacez toujours les deux balances simultanement.</p>");
  } else if (categoryName === "Roulettes") {
    parts.push("<p><strong>Conseil Vosthermos:</strong> Lors du remplacement des roulettes, profitez-en pour nettoyer le rail de votre porte-patio pour un resultat optimal.</p>");
  } else if (categoryName === "Opérateurs") {
    parts.push("<p><strong>Note:</strong> Assurez-vous de verifier le cote d'installation (gauche ou droite) avant de commander.</p>");
  }

  // Vosthermos service note
  parts.push(`<p><strong>Service professionnel disponible:</strong> Vosthermos offre un service d'installation sur place dans un rayon de 100km autour de Montreal. Appelez-nous au 514-825-8411 pour une soumission gratuite.</p>`);

  // Keep any dimension/measurement data from original
  const dimMatch = original.match(/(?:Longueur|Largeur|Hauteur|Diametre|Epaisseur|Base|Bras|Cote)[^.]*\./gi);
  if (dimMatch) {
    parts.push(`<p><strong>Dimensions:</strong> ${dimMatch.join(" ")}</p>`);
  }

  return parts.join("\n");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });

  console.log(`Rewriting ${products.length} products...\n`);

  let count = 0;
  for (const product of products) {
    const catName = product.category?.name || "Autres";

    const newName = rewriteName(product.name);
    const newDesc = rewriteDescription(product, catName);
    const newDetailed = rewriteDetailedDescription(product, catName);

    const data = {
      name: newName,
      description: newDesc,
    };
    if (newDetailed) data.detailedDescription = newDetailed;

    await prisma.product.update({
      where: { id: product.id },
      data,
    });

    count++;
    if (count % 50 === 0) console.log(`  ${count}/${products.length} done...`);
  }

  console.log(`\nDone! ${count} products rewritten.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
