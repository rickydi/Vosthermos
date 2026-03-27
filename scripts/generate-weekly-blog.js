#!/usr/bin/env node

/**
 * Weekly Blog Post Generator
 * Generates a blog post draft using Claude Sonnet API.
 * Post is saved as "pending_review" for admin approval.
 *
 * Usage: node scripts/generate-weekly-blog.js
 * Cron:  0 9 * * 1,4 (Monday & Thursday 9 AM)
 *
 * Requires: ANTHROPIC_API_KEY and DATABASE_URL in .env
 */

import Anthropic from "@anthropic-ai/sdk";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { fetchBlogCoverImage } from "../src/lib/unsplash.js";
import { sendBlogApprovalEmail } from "../src/lib/mail.js";

const { Pool } = pg;

async function main() {
  // Database setup
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Anthropic setup
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Topic rotation - seasonal + evergreen
  const month = new Date().getMonth(); // 0-11
  const topics = getTopicsForMonth(month);

  // Check existing posts to avoid duplicates
  const existingPosts = await prisma.blogPost.findMany({
    select: { title: true, slug: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const existingTitles = existingPosts.map((p) => p.title.toLowerCase());

  // Pick a topic that hasn't been covered
  let selectedTopic = topics.find(
    (t) => !existingTitles.some((title) => title.includes(t.keyword.toLowerCase()))
  );
  if (!selectedTopic) selectedTopic = topics[0]; // fallback

  console.log(`Generating blog post about: ${selectedTopic.topic}`);
  console.log(`Category: ${selectedTopic.category}`);

  // Generate with Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Tu es un expert en reparation de portes et fenetres au Quebec. Ecris un article de blogue pour Vosthermos (vosthermos.com), une entreprise specialisee dans le remplacement de vitres thermos, la quincaillerie de portes/fenetres, la reparation de portes en bois et les moustiquaires sur mesure.

Sujet: ${selectedTopic.topic}
Categorie: ${selectedTopic.category}

Consignes:
- 1000-1500 mots en francais quebecois professionnel (pas de francais de France)
- Titre accrocheur optimise SEO (60-70 caracteres)
- Format HTML avec balises h2, h3, p, ul, li, strong, em
- NE PAS inclure de balise h1 (le titre est gere separement)
- Conseils pratiques et actionables
- Mentionner naturellement que Vosthermos offre ces services (sans etre trop promotionnel)
- Ton professionnel mais accessible, comme un ami expert
- Zone de service: Montreal, Rive-Sud, Laval et rayon de 100km
- Inclure au moins une liste a puces
- Conclure avec un appel a l'action subtil

Retourne UNIQUEMENT un objet JSON valide (pas de markdown, pas de backticks) avec ces champs:
{
  "title": "Le titre SEO de l'article",
  "excerpt": "Resume en 2 phrases maximum pour la page de listing",
  "content": "Le contenu HTML complet de l'article",
  "tags": ["tag1", "tag2", "tag3"]
}`,
      },
    ],
  });

  const text = response.content[0].text.trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try extracting JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      console.error("Failed to parse AI response:", text.substring(0, 200));
      process.exit(1);
    }
  }

  // Generate slug from title
  const slug = parsed.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);

  // Check slug uniqueness
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  // Fetch cover image from Unsplash
  console.log("Fetching cover image from Unsplash...");
  const coverImage = await fetchBlogCoverImage(finalSlug, selectedTopic.category, parsed.title);
  if (coverImage) {
    console.log(`Cover image saved: ${coverImage}`);
  }

  // Save to database
  const post = await prisma.blogPost.create({
    data: {
      title: parsed.title,
      slug: finalSlug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImage,
      category: selectedTopic.category,
      tags: parsed.tags || [],
      status: "pending_review",
      authorName: "Vosthermos",
      aiGenerated: true,
    },
  });

  console.log(`Blog post created: "${post.title}" (ID: ${post.id})`);
  console.log(`Status: pending_review`);
  console.log(`Slug: ${post.slug}`);
  console.log(`\nAdmin can review at: /admin/blogue/${post.id}`);

  // Send approval email
  try {
    await sendBlogApprovalEmail(post, prisma);
  } catch (e) {
    console.log("Approval email skipped:", e.message);
  }

  // Optional: send SMS notification via Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      // Notify first admin member
      const members = await prisma.chatNotifyMember.findMany({
        where: { isActive: true },
        take: 1,
      });

      if (members.length > 0) {
        await client.messages.create({
          body: `[Vosthermos Blog] Nouvel article genere par IA: "${post.title}". Connectez-vous a l'admin pour le reviser et publier.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: members[0].phone,
        });
        console.log(`SMS notification sent to ${members[0].name}`);
      }
    } catch (e) {
      console.log("SMS notification skipped:", e.message);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

function getTopicsForMonth(month) {
  const seasonal = {
    // Winter (Dec-Feb)
    0: [
      { topic: "Comment savoir si vos vitres thermos doivent etre remplacees cet hiver", category: "conseils", keyword: "thermos hiver" },
      { topic: "Economiser sur le chauffage en remplacant vos thermos embues", category: "conseils", keyword: "chauffage thermos" },
    ],
    1: [
      { topic: "Les signes que votre quincaillerie de fenetre doit etre remplacee", category: "entretien", keyword: "quincaillerie signes" },
      { topic: "Pourquoi il y a de la condensation sur vos fenetres et comment y remedier", category: "guides", keyword: "condensation fenetres" },
    ],
    2: [
      { topic: "Preparer vos portes et fenetres pour le printemps au Quebec", category: "entretien", keyword: "printemps preparation" },
      { topic: "Guide complet du remplacement de coupe-froid", category: "guides", keyword: "coupe-froid guide" },
    ],
    // Spring (Mar-May)
    3: [
      { topic: "Inspection printaniere de vos portes et fenetres : liste de verification", category: "guides", keyword: "inspection printaniere" },
      { topic: "Reparation vs remplacement de fenetres : comment prendre la bonne decision", category: "conseils", keyword: "reparation vs remplacement" },
    ],
    4: [
      { topic: "Comment choisir la bonne moustiquaire pour votre maison", category: "guides", keyword: "choisir moustiquaire" },
      { topic: "Tout savoir sur le verre Low-E et l'argon dans vos thermos", category: "guides", keyword: "low-e argon" },
    ],
    5: [
      { topic: "Entretien estival de vos portes et fenetres en bois", category: "entretien", keyword: "entretien bois ete" },
      { topic: "Les avantages de reparer sa porte-patio plutot que de la remplacer", category: "conseils", keyword: "porte-patio reparation" },
    ],
    // Summer (Jun-Aug)
    6: [
      { topic: "Guide d'achat de pieces de remplacement pour portes et fenetres en ligne", category: "guides", keyword: "achat pieces ligne" },
      { topic: "Moustiquaires dechirees : reparer ou remplacer?", category: "conseils", keyword: "moustiquaire dechire" },
    ],
    7: [
      { topic: "Comment mesurer correctement un thermos de fenetre pour le remplacement", category: "guides", keyword: "mesurer thermos" },
      { topic: "5 problemes courants de porte-patio et leurs solutions", category: "conseils", keyword: "problemes porte-patio" },
    ],
    8: [
      { topic: "Preparer vos fenetres pour l'automne et l'hiver quebecois", category: "entretien", keyword: "preparer hiver" },
      { topic: "Comment prolonger la duree de vie de vos fenetres", category: "entretien", keyword: "prolonger duree vie" },
    ],
    // Fall (Sep-Nov)
    9: [
      { topic: "Calfeutrage de fenetres : pourquoi c'est important avant l'hiver", category: "conseils", keyword: "calfeutrage hiver" },
      { topic: "Pourquoi vos fenetres sont embuees et quand agir", category: "conseils", keyword: "fenetres embuees" },
    ],
    10: [
      { topic: "Remplacement de thermos : a quoi s'attendre et combien ca coute", category: "guides", keyword: "cout thermos" },
      { topic: "Les meilleurs types de verre pour le climat quebecois", category: "guides", keyword: "verre climat quebec" },
    ],
    11: [
      { topic: "Verifier l'etancheite de vos portes et fenetres avant les grands froids", category: "entretien", keyword: "etancheite grands froids" },
      { topic: "Subventions et credits d'impot pour la renovation de fenetres au Quebec", category: "nouvelles", keyword: "subventions fenetres" },
    ],
  };

  return seasonal[month] || seasonal[0];
}

main().catch((e) => {
  console.error("Error generating blog post:", e);
  process.exit(1);
});
