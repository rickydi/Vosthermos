import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { pingIndexNowAsync } from "@/lib/indexnow";

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serialized = posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const data = await request.json();

    if (!data.title || !data.slug || !data.excerpt || !data.content) {
      return NextResponse.json(
        { error: "Titre, slug, extrait et contenu sont requis" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ce slug existe deja" },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        category: data.category || "conseils",
        tags: data.tags || [],
        status: data.status || "draft",
        authorName: data.authorName || "Vosthermos",
        aiGenerated: data.aiGenerated || false,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });

    if (post.status === "published") {
      pingIndexNowAsync([`/blogue/${post.slug}`, "/blogue", "/sitemap.xml"]);
    }

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
    console.error("Blog POST error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
