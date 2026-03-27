import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request) {
  try {
    await requireAdmin();
    const { topic, category } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Le sujet est requis" }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Cle API Anthropic non configuree (ANTHROPIC_API_KEY)" },
        { status: 500 }
      );
    }

    const prompt = `Tu es un expert en reparation de portes et fenetres au Quebec. Ecris un article de blogue pour Vosthermos (vosthermos.com).

Sujet: ${topic}
Categorie: ${category || "conseils"}

Consignes:
- 1000-1500 mots en francais
- Titre accrocheur optimise SEO
- Format HTML avec balises h2, h3, p, ul, li, strong
- Conseils pratiques et actionables
- Mention naturelle de nos services
- Ton professionnel mais accessible
- Zone: Montreal, Rive-Sud, Laval

Retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks) avec ces champs:
{
  "title": "...",
  "excerpt": "2 phrases max",
  "content": "HTML complet de l'article",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Erreur API Anthropic" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: "Reponse vide de l'IA" },
        { status: 500 }
      );
    }

    // Parse the JSON from the AI response
    let generated;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
      } else {
        generated = JSON.parse(textContent);
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", textContent);
      return NextResponse.json(
        { error: "Impossible de parser la reponse de l'IA" },
        { status: 500 }
      );
    }

    // Generate slug from title
    const slug = generated.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Save as pending_review
    const post = await prisma.blogPost.create({
      data: {
        title: generated.title,
        slug: finalSlug,
        excerpt: generated.excerpt,
        content: generated.content,
        category: category || "conseils",
        tags: generated.tags || [],
        status: "pending_review",
        authorName: "Vosthermos",
        aiGenerated: true,
      },
    });

    return NextResponse.json({
      ...post,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    console.error("Blog generate error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
