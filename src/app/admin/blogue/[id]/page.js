"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlogPostFormFields, { makeBlogFormChangeHandler, blogFormToBody } from "../BlogPostFormFields";
import BlogPreviewModal from "../BlogPreviewModal";

export default function AdminBlogEditPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "conseils",
    tags: "",
    status: "draft",
    authorName: "Vosthermos",
  });

  const handleChange = makeBlogFormChangeHandler(setForm);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          coverImage: data.coverImage || "",
          category: data.category || "conseils",
          tags: (data.tags || []).join(", "),
          status: data.status || "draft",
          authorName: data.authorName || "Vosthermos",
        });
      } else {
        router.push("/admin/blogue");
      }
    } catch (err) {
      console.error("Fetch post error:", err);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    // Existing client page loads the article after mount; keep the fetch flow scoped here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPost();
  }, [fetchPost]);

  async function handleSave(statusOverride) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogFormToBody(form, statusOverride || form.status)),
      });

      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
        setForm((prev) => ({
          ...prev,
          status: updated.status,
        }));
        if (statusOverride === "published") {
          alert("Article publie!");
        }
      } else {
        const err = await res.json();
        alert(err.error || "Erreur de sauvegarde");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Erreur de sauvegarde");
    }
    setSaving(false);
  }

  async function handlePublish() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
        setForm((prev) => ({ ...prev, status: "published" }));
        alert("Article publie!");
      } else {
        const err = await res.json();
        alert(err.error || "Erreur de publication");
      }
    } catch (err) {
      console.error("Publish error:", err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-12 text-center admin-text-muted">
        <i className="fas fa-spinner fa-spin text-2xl"></i>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-12 text-center">
        <p className="admin-text-muted">Article non trouve</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blogue"
            className="p-2 rounded-xl admin-hover admin-text-muted transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-xl font-bold admin-text">Modifier l&apos;article</h1>
            {post.aiGenerated && (
              <p className="text-xs text-purple-400 mt-0.5">
                <i className="fas fa-robot mr-1"></i>Genere par IA
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 rounded-xl admin-card admin-text-muted text-sm font-medium admin-hover transition-all"
          >
            <i className="fas fa-eye mr-2"></i>Apercu
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <BlogPostFormFields form={form} onChange={handleChange} showStatus />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-save"></i>
            )}
            Sauvegarder
          </button>

          {form.status === "pending_review" && (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              Approuver et publier
            </button>
          )}

          {form.status !== "published" && form.status !== "pending_review" && (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="px-6 py-3 bg-[var(--color-red)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-paper-plane"></i>
              Publier
            </button>
          )}

          {form.status === "published" && (
            <Link
              href={`/blogue/${form.slug}`}
              target="_blank"
              className="px-6 py-3 bg-[var(--color-teal)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <i className="fas fa-external-link-alt"></i>
              Voir l&apos;article
            </Link>
          )}
        </div>
      </div>

      {showPreview && <BlogPreviewModal form={form} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
