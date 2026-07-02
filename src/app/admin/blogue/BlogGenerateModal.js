"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BLOG_CATEGORY_OPTIONS } from "./BlogPostFormFields";

// Modal « Generer un article avec IA » — partage entre la liste et la page
// Nouvel article (avant: copie-colle dans les deux). Autonome: gere son etat,
// appelle /api/admin/blog/generate puis redirige vers l'article cree.
export default function BlogGenerateModal({ onClose }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("conseils");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category }),
      });
      if (res.ok) {
        const post = await res.json();
        onClose();
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="admin-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold admin-text flex items-center gap-2">
            <i className="fas fa-robot text-purple-500"></i>
            Generer un article avec IA
          </h2>
          <button
            onClick={onClose}
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Comment choisir ses vitres thermos"
              className="w-full px-4 py-3 rounded-xl admin-input text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium admin-text mb-1.5">
              Categorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl admin-input text-sm"
            >
              {BLOG_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
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
  );
}
