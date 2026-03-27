"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
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
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title
      if (name === "title") {
        updated.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  }

  async function handleSave(statusOverride) {
    setSaving(true);
    try {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage || null,
        category: form.category,
        tags: tagsArray,
        status: statusOverride || form.status,
        authorName: form.authorName,
      };

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        {/* Title */}
        <div className="admin-card rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Titre
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm"
              placeholder="Titre de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Slug (URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="admin-text-muted text-sm">/blogue/</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl admin-input text-sm"
                placeholder="slug-de-larticle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Extrait
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm resize-none"
              placeholder="Court resume de l'article (2 phrases max)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Contenu (HTML)
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={20}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm font-mono resize-y"
              placeholder="<h2>Section</h2><p>Contenu...</p>"
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="admin-card rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold admin-text uppercase tracking-wider">
            Parametres
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Categorie
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
              >
                <option value="conseils">Conseils</option>
                <option value="entretien">Entretien</option>
                <option value="guides">Guides</option>
                <option value="nouvelles">Nouvelles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Statut
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="pending_review">En revision</option>
                <option value="published">Publie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Tags (separes par des virgules)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
                placeholder="thermos, fenetres, reparation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Image de couverture (URL)
              </label>
              <input
                type="text"
                name="coverImage"
                value={form.coverImage}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Auteur
              </label>
              <input
                type="text"
                name="authorName"
                value={form.authorName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
              />
            </div>
          </div>
        </div>

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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-gray-900">Apercu de l&apos;article</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                {form.title}
              </h1>
              <p className="text-gray-500 italic mb-8">{form.excerpt}</p>
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:text-gray-900
                  prose-ul:text-gray-700"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
