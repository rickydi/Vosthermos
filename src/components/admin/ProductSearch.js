"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductSearch({ categories }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId]);

  async function fetchProducts(searchQuery) {
    setLoading(true);
    const q = searchQuery !== undefined ? searchQuery : query;
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);

    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par SKU ou nom..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-red)]"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] [&>option]:text-gray-800"
        >
          <option value="">Toutes les categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-[var(--color-red)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all">
          Rechercher
        </button>
      </form>

      {/* Results */}
      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 text-white/50 text-sm">
          {total} resultat{total > 1 ? "s" : ""}
        </div>
        {loading ? (
          <p className="p-8 text-center text-white/40"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-white/40">Aucun produit trouve</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/5">
                  <th className="text-left p-4">Image</th>
                  <th className="text-left p-4">SKU</th>
                  <th className="text-left p-4">Nom</th>
                  <th className="text-left p-4">Prix</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 relative bg-white/10 rounded-lg overflow-hidden">
                        {p.images?.[0]?.url ? (
                          <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white font-mono text-sm">{p.sku}</td>
                    <td className="p-4 text-white/80 text-sm max-w-[300px] truncate">{p.name}</td>
                    <td className="p-4 text-white font-bold text-sm">{Number(p.price).toFixed(2)} $</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.availability === "InStock"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {p.availability === "InStock" ? "En stock" : "Rupture"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="text-[var(--color-red)] hover:underline text-sm font-medium"
                      >
                        <i className="fas fa-edit mr-1"></i> Editer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 text-sm"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="text-white/50 text-sm">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 text-sm"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
