"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProductEditForm({ product, categories }) {
  const router = useRouter();
  const [form, setForm] = useState({
    sku: product.sku,
    name: product.name,
    description: product.description || "",
    detailedDescription: product.detailedDescription || "",
    nameEn: product.nameEn || "",
    descriptionEn: product.descriptionEn || "",
    detailedDescriptionEn: product.detailedDescriptionEn || "",
    price: product.price,
    compareAtPrice: product.compareAtPrice || "",
    availability: product.availability,
    categoryId: product.categoryId || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur de sauvegarde");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce produit? Cette action est irreversible.")) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/produits");
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/produits" className="text-white/40 hover:text-white transition-colors">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white">{product.sku}</h1>
            <p className="text-white/40 text-sm">Modifie le {new Date(product.updatedAt).toLocaleDateString("fr-CA")}</p>
          </div>
        </div>
        <Link
          href={`/produit/${product.slug}`}
          target="_blank"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          <i className="fas fa-external-link-alt mr-1"></i> Voir sur le site
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
              <h2 className="text-white font-bold mb-2">Informations</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Categorie</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] [&>option]:text-gray-800">
                    <option value="">Aucune</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Nom du produit</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Description courte</label>
                <input name="description" value={form.description} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Description detaillee</label>
                <textarea name="detailedDescription" value={form.detailedDescription} onChange={handleChange} rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] resize-none" />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
              <h2 className="text-white font-bold mb-2">
                <i className="fas fa-globe mr-2 text-blue-400"></i>English Translation
              </h2>
              <p className="text-white/40 text-xs mb-3">Optional — used for the English version of the website (/en/)</p>

              <div>
                <label className="block text-white/50 text-sm mb-1">Product name (EN)</label>
                <input name="nameEn" value={form.nameEn} onChange={handleChange}
                  placeholder={form.name}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400" />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Short description (EN)</label>
                <input name="descriptionEn" value={form.descriptionEn} onChange={handleChange}
                  placeholder={form.description}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400" />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Detailed description (EN)</label>
                <textarea name="detailedDescriptionEn" value={form.detailedDescriptionEn} onChange={handleChange} rows={4}
                  placeholder={form.detailedDescription}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
              <h2 className="text-white font-bold mb-2">Prix et disponibilite</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Prix ($)</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Ancien prix ($)</label>
                  <input name="compareAtPrice" type="number" step="0.01" value={form.compareAtPrice} onChange={handleChange}
                    placeholder="Optionnel"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-red)]" />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Disponibilite</label>
                  <select name="availability" value={form.availability} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] [&>option]:text-gray-800">
                    <option value="InStock">En stock</option>
                    <option value="OutOfStock">Rupture de stock</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button type="button" onClick={handleDelete}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                <i className="fas fa-trash-alt mr-1"></i> Supprimer ce produit
              </button>
              <button type="submit" disabled={saving}
                className="bg-[var(--color-red)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sauvegarde...</>
                ) : saved ? (
                  <><i className="fas fa-check"></i> Sauvegarde!</>
                ) : (
                  <><i className="fas fa-save"></i> Sauvegarder</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Images sidebar */}
        <div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="text-white font-bold mb-4">Images ({product.images.length})</h2>
            <div className="grid grid-cols-2 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="aspect-square relative bg-white/5 rounded-lg overflow-hidden">
                  <Image src={img.url} alt={product.name} fill sizes="150px" className="object-contain p-2" />
                </div>
              ))}
            </div>
            {product.images.length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">Aucune image</p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/5 mt-4">
            <h2 className="text-white font-bold mb-3">Infos</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">ID</span>
                <span className="text-white/70">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Slug</span>
                <span className="text-white/70 font-mono">{product.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Cree le</span>
                <span className="text-white/70">{new Date(product.createdAt).toLocaleDateString("fr-CA")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
