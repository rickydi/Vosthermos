"use client";

import { useState, useEffect, useRef } from "react";

export default function CatalogPicker({ open, onClose, onPick }) {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef(null);
  const LIMIT = 24;

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    if (search) params.set("q", search);
    if (selectedCatId) params.set("categoryId", String(selectedCatId));
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [open, search, selectedCatId, page]);

  useEffect(() => { setPage(1); }, [search, selectedCatId]);

  function handleSearchChange(v) {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 250);
  }

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function pick(product) {
    onPick(product);
  }

  if (!open) return null;

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="admin-card admin-border border rounded-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">Parcourir le catalogue</h2>
          <button onClick={onClose} className="admin-text-muted hover:admin-text text-xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar — categories */}
          <aside className="w-60 border-r admin-border overflow-y-auto p-3">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${selectedCatId === null ? "bg-[var(--color-red)]/10 text-[var(--color-red)] font-medium" : "admin-text-muted admin-hover"}`}
            >
              Tous les produits
            </button>
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center">
                  {cat.children?.length > 0 && (
                    <button onClick={() => toggleExpand(cat.id)} className="admin-text-muted p-1 w-6">
                      <i className={`fas fa-chevron-${expanded[cat.id] ? "down" : "right"} text-xs`}></i>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`flex-1 text-left px-2 py-2 rounded-lg text-sm ${selectedCatId === cat.id ? "bg-[var(--color-red)]/10 text-[var(--color-red)] font-medium" : "admin-text admin-hover"} ${cat.children?.length > 0 ? "" : "ml-6"}`}
                  >
                    {cat.name}
                    <span className="admin-text-muted text-xs ml-1">({cat._count?.products || 0})</span>
                  </button>
                </div>
                {expanded[cat.id] && cat.children?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedCatId(child.id)}
                    className={`w-full text-left pl-10 pr-2 py-2 rounded-lg text-sm ${selectedCatId === child.id ? "bg-[var(--color-red)]/10 text-[var(--color-red)] font-medium" : "admin-text-muted admin-hover"}`}
                  >
                    {child.name}
                    <span className="text-xs ml-1 opacity-60">({child._count?.products || 0})</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Main — search + grid */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b admin-border">
              <input
                type="text"
                placeholder="Rechercher par SKU ou nom..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center admin-text-muted py-12">
                  <i className="fas fa-spinner fa-spin text-2xl"></i>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center admin-text-muted py-12">
                  <i className="fas fa-box-open text-3xl mb-2"></i>
                  <p>Aucun produit</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => pick(p)}
                      className="admin-card admin-border border rounded-lg p-3 text-left admin-hover transition-colors"
                    >
                      <div className="aspect-square bg-white/5 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <i className="fas fa-image admin-text-muted text-2xl"></i>
                        )}
                      </div>
                      <p className="admin-text-muted text-[10px] font-mono truncate">{p.sku}</p>
                      <p className="admin-text text-xs font-medium line-clamp-2 min-h-[2rem]">{p.name}</p>
                      <p className="text-[var(--color-red)] font-bold text-sm mt-1">{Number(p.price).toFixed(2)}$</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t admin-border">
                <span className="admin-text-muted text-xs">{total} produit{total !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="admin-text-muted admin-hover px-3 py-1 rounded text-xs disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="admin-text text-xs">{page}/{pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="admin-text-muted admin-hover px-3 py-1 rounded text-xs disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
