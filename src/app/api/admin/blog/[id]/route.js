import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { pingIndexNowAsync } from "@/lib/indexnow";

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post) {
      return NextResponse.json({ error: "Article non trouve" }, { status: 404 });
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.authorName !== undefined) updateData.authorName = data.authorName;

    // If publishing, set publishedAt
    if (data.status === "published") {
      const existing = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
      });
      if (!existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    if (post.status === "published") {
      pingIndexNowAsync([`/blogue/${post.slug}`, "/blogue"]);
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
    console.error("Blog PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
