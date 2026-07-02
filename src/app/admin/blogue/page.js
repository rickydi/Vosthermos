"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlogGenerateModal from "./BlogGenerateModal";

const statusTabs = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillons" },
  { value: "pending_review", label: "En revision" },
  { value: "published", label: "Publies" },
];

const statusBadge = {
  draft: { label: "Brouillon", cls: "bg-gray-200 text-gray-700" },
  pending_review: { label: "En revision", cls: "bg-yellow-100 text-yellow-800" },
  published: { label: "Publie", cls: "bg-green-100 text-green-800" },
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showGenModal, setShowGenModal] = useState(false);

  useEffect(() => {
    // La liste se recharge au montage et au changement d'onglet; meme derogation
    // que la page Modifier pour ce pattern existant.
    // eslint-disable-next-line react-hooks/immutability
    fetchPosts(activeTab);
  }, [activeTab]);

  async function fetchPosts(status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet article? Cette action est irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold admin-text">Blogue</h1>
          <p className="admin-text-muted text-sm mt-1">
            Gerez vos articles de blogue
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGenModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-robot"></i>
            Generer avec IA
          </button>
          <Link
            href="/admin/blogue/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-red)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <i className="fas fa-plus"></i>
            Nouveau
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 admin-card rounded-xl p-1 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-[var(--color-red)] text-white"
                : "admin-text-muted hover:admin-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center admin-text-muted">
            <i className="fas fa-spinner fa-spin text-2xl"></i>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-newspaper text-4xl admin-text-muted mb-4 block"></i>
            <p className="admin-text-muted">Aucun article trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="admin-border border-b">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider admin-text-muted">
                    Article
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider admin-text-muted">
                    Statut
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider admin-text-muted">
                    Categorie
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider admin-text-muted">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider admin-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const badge = statusBadge[post.status] || {
                    label: post.status,
                    cls: "bg-gray-200 text-gray-700",
                  };
                  const date = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("fr-CA")
                    : new Date(post.createdAt).toLocaleDateString("fr-CA");
                  return (
                    <tr
                      key={post.id}
                      className="admin-border border-b last:border-0 admin-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="admin-text font-medium text-sm">
                              {post.title}
                              {post.aiGenerated && (
                                <i className="fas fa-robot text-purple-400 ml-2 text-xs" title="Genere par IA"></i>
                              )}
                            </p>
                            <p className="admin-text-muted text-xs mt-0.5">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 admin-text-muted text-sm capitalize">
                        {post.category}
                      </td>
                      <td className="px-6 py-4 admin-text-muted text-sm">
                        {date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/blogue/${post.id}`}
                            className="p-2 rounded-lg admin-hover admin-text-muted hover:text-blue-500 transition-colors"
                            title="Modifier"
                          >
                            <i className="fas fa-pen text-sm"></i>
                          </Link>
                          {post.status === "published" && (
                            <Link
                              href={`/blogue/${post.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg admin-hover admin-text-muted hover:text-green-500 transition-colors"
                              title="Voir"
                            >
                              <i className="fas fa-external-link-alt text-sm"></i>
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 rounded-lg admin-hover admin-text-muted hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenModal && <BlogGenerateModal onClose={() => setShowGenModal(false)} />}
    </div>
  );
}
