"use client";

import { useState, useEffect, useRef } from "react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [dragType, setDragType] = useState(null); // "parent" or "child"
  const [dragParentId, setDragParentId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function reorder(items) {
    setSaving(true);
    await fetch("/api/admin/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    setSaving(false);
  }

  // --- Parent drag ---
  function onParentDragStart(e, index) {
    dragItem.current = index;
    setDragType("parent");
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  }

  function onParentDragEnd(e) {
    e.currentTarget.style.opacity = "1";
    setDragOverIndex(null);
    setDragType(null);
  }

  function onParentDragOver(e, index) {
    e.preventDefault();
    if (dragType !== "parent") return;
    dragOverItem.current = index;
    setDragOverIndex(index);
  }

  function onParentDrop(e) {
    e.preventDefault();
    if (dragType !== "parent") return;
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) {
      setDragOverIndex(null);
      return;
    }

    const updated = [...categories];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    setCategories(updated);
    setDragOverIndex(null);

    reorder(updated.map((c, i) => ({ id: c.id, order: i })));
  }

  // --- Child drag ---
  function onChildDragStart(e, parentId, index) {
    dragItem.current = index;
    setDragType("child");
    setDragParentId(parentId);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  }

  function onChildDragEnd(e) {
    e.currentTarget.style.opacity = "1";
    setDragOverIndex(null);
    setDragType(null);
    setDragParentId(null);
  }

  function onChildDragOver(e, parentId, index) {
    e.preventDefault();
    if (dragType !== "child" || dragParentId !== parentId) return;
    dragOverItem.current = index;
    setDragOverIndex(index);
  }

  function onChildDrop(e, parentId) {
    e.preventDefault();
    if (dragType !== "child" || dragParentId !== parentId) return;
    const from = dragItem.current;
    const to = dragOverItem.current;

    const catIndex = categories.findIndex((c) => c.id === parentId);
    if (catIndex === -1 || from === null || to === null || from === to) {
      setDragOverIndex(null);
      return;
    }

    const updated = [...categories];
    const children = [...updated[catIndex].children];
    const [moved] = children.splice(from, 1);
    children.splice(to, 0, moved);
    updated[catIndex] = { ...updated[catIndex], children };

    setCategories(updated);
    setDragOverIndex(null);

    reorder(children.map((c, i) => ({ id: c.id, order: i })));
  }

  // --- Edit name ---
  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditNameEn(cat.nameEn || "");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    setError("");
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), nameEn: editNameEn.trim() || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    setEditingId(null);
    fetchCategories();
  }

  // --- Add ---
  async function addParent() {
    if (!newCatName.trim()) return;
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    setNewCatName("");
    fetchCategories();
  }

  async function addSubCategory(parentId) {
    if (!newSubName.trim()) return;
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubName.trim(), parentId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    setNewSubName("");
    setAddingSubTo(null);
    fetchCategories();
  }

  // --- Delete ---
  async function deleteCat(id) {
    if (!confirm("Supprimer cette categorie?")) return;
    setError("");
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    fetchCategories();
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold admin-text mb-8">Categories</h1>
        <p className="admin-text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold admin-text">Categories</h1>
        {saving && <span className="text-xs admin-text-muted animate-pulse">Sauvegarde...</span>}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm text-red-400">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-300 hover:text-white">&times;</button>
        </div>
      )}

      <p className="admin-text-muted text-xs mb-6">
        Glisse les categories pour les reordonner. Clique sur le nom pour le modifier.
      </p>

      {/* Parent categories */}
      <div className="space-y-3">
        {categories.map((cat, index) => {
          const subTotal = cat.children?.reduce((s, c) => s + (c._count?.products || 0), 0) || 0;
          const total = (cat._count?.products || 0) + subTotal;

          return (
            <div
              key={cat.id}
              draggable
              onDragStart={(e) => onParentDragStart(e, index)}
              onDragEnd={onParentDragEnd}
              onDragOver={(e) => onParentDragOver(e, index)}
              onDrop={onParentDrop}
              className={`admin-card rounded-xl border transition-all ${
                dragType === "parent" && dragOverIndex === index
                  ? "border-[var(--color-red)] bg-[var(--color-red)]/5"
                  : "border-white/5"
              }`}
            >
              {/* Parent header */}
              <div className="flex items-center gap-3 p-4">
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing admin-text-muted hover:text-white transition-colors select-none text-lg" title="Glisser pour reordonner">
                  ⠿
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditingId(null); }}
                        className="admin-input border rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-[var(--color-red)] flex-1"
                        autoFocus
                        placeholder="Nom (FR)"
                      />
                      <input
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditingId(null); }}
                        className="admin-input border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 flex-1"
                        placeholder="Name (EN)"
                      />
                      <button onClick={() => saveEdit(cat.id)} className="text-green-400 hover:text-green-300 text-xs px-2 py-1">✓</button>
                      <button onClick={() => setEditingId(null)} className="admin-text-muted hover:text-white text-xs px-2 py-1">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(cat)} className="admin-text font-semibold text-left hover:text-[var(--color-red)] transition-colors">
                      {cat.name}
                      {cat.nameEn && <span className="text-xs admin-text-muted font-normal ml-2">EN: {cat.nameEn}</span>}
                    </button>
                  )}
                </div>

                {/* Stats */}
                <span className="admin-text-muted text-xs font-mono shrink-0">{cat.slug}</span>
                <span className="admin-text text-sm font-bold shrink-0" title="Total produits">{total}</span>

                {/* Actions */}
                <button
                  onClick={() => { setAddingSubTo(addingSubTo === cat.id ? null : cat.id); setNewSubName(""); }}
                  className="admin-text-muted hover:text-[var(--color-red)] text-xs px-2 py-1 transition-colors shrink-0"
                  title="Ajouter sous-categorie"
                >
                  + Sous-cat
                </button>
                <button
                  onClick={() => deleteCat(cat.id)}
                  className="text-red-400/50 hover:text-red-400 text-xs px-2 py-1 transition-colors shrink-0"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>

              {/* Children */}
              {cat.children?.length > 0 && (
                <div className="px-4 pb-3 ml-8 space-y-1">
                  {cat.children.map((sub, subIndex) => (
                    <div
                      key={sub.id}
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); onChildDragStart(e, cat.id, subIndex); }}
                      onDragEnd={onChildDragEnd}
                      onDragOver={(e) => onChildDragOver(e, cat.id, subIndex)}
                      onDrop={(e) => { e.stopPropagation(); onChildDrop(e, cat.id); }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                        dragType === "child" && dragParentId === cat.id && dragOverIndex === subIndex
                          ? "bg-[var(--color-red)]/10 border border-[var(--color-red)]/30"
                          : "bg-white/[0.02] border border-transparent hover:border-white/5"
                      }`}
                    >
                      <span className="cursor-grab active:cursor-grabbing admin-text-muted hover:text-white transition-colors select-none text-sm">⠿</span>

                      {editingId === sub.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(sub.id); if (e.key === "Escape") setEditingId(null); }}
                            className="admin-input border rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-red)] flex-1"
                            autoFocus
                            placeholder="Nom (FR)"
                          />
                          <input
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(sub.id); if (e.key === "Escape") setEditingId(null); }}
                            className="admin-input border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 flex-1"
                            placeholder="Name (EN)"
                          />
                          <button onClick={() => saveEdit(sub.id)} className="text-green-400 hover:text-green-300 text-xs">✓</button>
                          <button onClick={() => setEditingId(null)} className="admin-text-muted hover:text-white text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(sub)} className="admin-text-muted text-sm text-left hover:text-white transition-colors flex-1">
                          {sub.name}
                          {sub.nameEn && <span className="text-xs admin-text-muted font-normal ml-2">EN: {sub.nameEn}</span>}
                        </button>
                      )}

                      <span className="admin-text-muted text-xs">({sub._count?.products || 0})</span>
                      <button onClick={() => deleteCat(sub.id)} className="text-red-400/30 hover:text-red-400 text-xs transition-colors">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add sub-category form */}
              {addingSubTo === cat.id && (
                <div className="px-4 pb-4 ml-8">
                  <div className="flex items-center gap-2">
                    <input
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addSubCategory(cat.id); if (e.key === "Escape") setAddingSubTo(null); }}
                      placeholder="Nom de la sous-categorie"
                      className="admin-input border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-red)] flex-1"
                      autoFocus
                    />
                    <button onClick={() => addSubCategory(cat.id)}
                      className="px-3 py-1.5 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] text-white rounded-lg text-xs font-medium transition-colors">
                      Ajouter
                    </button>
                    <button onClick={() => setAddingSubTo(null)} className="admin-text-muted hover:text-white text-xs px-2">Annuler</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add parent category */}
      <div className="mt-6 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block admin-text-muted text-xs mb-1">Nouvelle categorie</label>
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addParent(); }}
            placeholder="Nom de la categorie"
            className="w-full admin-input border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-red)]"
          />
        </div>
        <button
          onClick={addParent}
          disabled={!newCatName.trim()}
          className="px-4 py-2 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
