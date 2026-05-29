import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";

export async function POST(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: "Article non trouve" }, { status: 404 });

    const post = await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        content: sanitizeBlogHtml(existing.content),
        status: "published",
        publishedAt: new Date(),
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
