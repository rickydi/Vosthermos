"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlogPostFormFields, { makeBlogFormChangeHandler, blogFormToBody } from "../BlogPostFormFields";
import BlogPreviewModal from "../BlogPreviewModal";
import BlogGenerateModal from "../BlogGenerateModal";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "conseils",
    tags: "",
    authorName: "Vosthermos",
  });

  const handleChange = makeBlogFormChangeHandler(setForm);

  async function handleSave(status) {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      alert("Titre, slug, extrait et contenu sont requis");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogFormToBody(form, status || "draft")),
      });

      if (res.ok) {
        const post = await res.json();
        router.push(`/admin/blogue/${post.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur de creation");
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Erreur de creation");
    }
    setSaving(false);
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
          <h1 className="text-xl font-bold admin-text">Nouvel article</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-robot"></i>
            Generer avec IA
          </button>
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
        <BlogPostFormFields form={form} onChange={handleChange} />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-save"></i>
            )}
            Sauvegarder brouillon
          </button>

          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-6 py-3 bg-[var(--color-red)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <i className="fas fa-paper-plane"></i>
            Publier
          </button>
        </div>
      </div>

      {showPreview && <BlogPreviewModal form={form} onClose={() => setShowPreview(false)} />}
      {showGenModal && <BlogGenerateModal onClose={() => setShowGenModal(false)} />}
    </div>
  );
}
