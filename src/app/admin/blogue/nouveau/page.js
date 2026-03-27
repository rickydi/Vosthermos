"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genCategory, setGenCategory] = useState("conseils");
  const [generating, setGenerating] = useState(false);
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
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

  async function handleSave(status) {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      alert("Titre, slug, extrait et contenu sont requis");
      return;
    }

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
        status: status || "draft",
        authorName: form.authorName,
      };

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  async function handleGenerate() {
    if (!genTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: genTopic, category: genCategory }),
      });
      if (res.ok) {
        const post = await res.json();
        setShowGenModal(false);
        setGenTopic("");
        // Redirect to edit the generated post
        router.push(`/admin/blogue/${post.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur de generation");
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Erreur de generation");
    }
    setGenerating(false);
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
                {form.title || "Titre de l'article"}
              </h1>
              <p className="text-gray-500 italic mb-8">
                {form.excerpt || "Extrait..."}
              </p>
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:text-gray-900
                  prose-ul:text-gray-700"
                dangerouslySetInnerHTML={{ __html: form.content || "<p>Aucun contenu...</p>" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold admin-text flex items-center gap-2">
                <i className="fas fa-robot text-purple-500"></i>
                Generer un article avec IA
              </h2>
              <button
                onClick={() => setShowGenModal(false)}
                className="admin-text-muted hover:admin-text transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium admin-text mb-1.5">
                  Sujet de l&apos;article
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Ex: Comment choisir ses vitres thermos"
                  className="w-full px-4 py-3 rounded-xl admin-input text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium admin-text mb-1.5">
                  Categorie
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl admin-input text-sm"
                >
                  <option value="conseils">Conseils</option>
                  <option value="entretien">Entretien</option>
                  <option value="guides">Guides</option>
                  <option value="nouvelles">Nouvelles</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !genTopic.trim()}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generation en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Generer l&apos;article
                  </>
                )}
              </button>

              {generating && (
                <p className="text-xs admin-text-muted text-center">
                  Cela peut prendre 30 a 60 secondes...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
