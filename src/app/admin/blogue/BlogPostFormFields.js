"use client";

// Champs du formulaire d'article - partages entre Nouvel article et Modifier
// (avant: copie-colle integral dans les deux pages). L'etat reste au parent.

export const BLOG_CATEGORY_OPTIONS = [
  { value: "conseils", label: "Conseils" },
  { value: "entretien", label: "Entretien" },
  { value: "guides", label: "Guides" },
  { value: "nouvelles", label: "Nouvelles" },
];

// Fabrique le onChange commun: met a jour le champ et derive le slug du titre.
export function makeBlogFormChangeHandler(setForm) {
  return function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title") {
        updated.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };
}

// Corps commun envoye a l'API (POST comme PUT).
export function blogFormToBody(form, status) {
  return {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: form.content,
    coverImage: form.coverImage || null,
    category: form.category,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    status,
    authorName: form.authorName,
  };
}

export default function BlogPostFormFields({ form, onChange, showStatus = false }) {
  return (
    <>
      <div className="admin-card rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium admin-text mb-1.5">
            Titre
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
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
              onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            rows={20}
            className="w-full px-4 py-3 rounded-xl admin-input text-sm font-mono resize-y"
            placeholder="<h2>Section</h2><p>Contenu...</p>"
          />
        </div>
      </div>

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
              onChange={onChange}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm"
            >
              {BLOG_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {showStatus && (
            <div>
              <label className="block text-sm font-medium admin-text mb-1.5">
                Statut
              </label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl admin-input text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="pending_review">En revision</option>
                <option value="published">Publie</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Tags (separes par des virgules)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm"
            />
          </div>
        </div>
      </div>
    </>
  );
}
