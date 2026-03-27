import prisma from "@/lib/prisma";
import { verifyApprovalToken } from "@/lib/mail";
import { redirect } from "next/navigation";

export async function GET(request, { params }) {
  const { id } = await params;
  const postId = parseInt(id);
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || !verifyApprovalToken(postId, token)) {
    return new Response(
      html("Lien invalide", "Ce lien d'approbation est invalide ou expire.", "error"),
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });

  if (!post) {
    return new Response(
      html("Article introuvable", "Cet article n'existe pas.", "error"),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (post.status === "published") {
    return new Response(
      html("Deja publie", `L'article "${post.title}" est deja publie.`, "info"),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      status: "published",
      publishedAt: post.publishedAt || new Date(),
    },
  });

  return new Response(
    html(
      "Article publie!",
      `"${post.title}" est maintenant en ligne sur le blogue.`,
      "success",
      post.slug
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function html(title, message, type, slug) {
  const colors = {
    success: { bg: "#f0fdfa", border: "#0d9488", text: "#0d9488" },
    error: { bg: "#fef2f2", border: "#ef4444", text: "#ef4444" },
    info: { bg: "#eff6ff", border: "#3b82f6", text: "#3b82f6" },
  };
  const c = colors[type] || colors.info;
  const icon = type === "success" ? "&#10003;" : type === "error" ? "&#10007;" : "&#8505;";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f9fafb;margin:0;">
  <div style="background:#fff;border-radius:16px;padding:48px;text-align:center;max-width:480px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;border-radius:50%;background:${c.bg};color:${c.text};font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">${icon}</div>
    <h1 style="color:#111;font-size:24px;margin:0 0 8px;">${title}</h1>
    <p style="color:#666;font-size:16px;line-height:1.6;">${message}</p>
    ${slug ? `<a href="/blogue/${slug}" style="display:inline-block;margin-top:24px;background:#0d9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Voir l'article</a>` : ""}
    <a href="/admin/blogue" style="display:inline-block;margin-top:12px;color:#0d9488;text-decoration:none;font-size:14px;">Retour a l'admin</a>
  </div>
</body>
</html>`;
}
