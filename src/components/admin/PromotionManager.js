"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyForm = {
  title: "",
  description: "",
  type: "percent",
  value: "10",
  categoryId: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  bgColor: "#e30718",
};

export default function PromotionManager({ promotions, categories }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(promo) {
    setEditId(promo.id);
    setForm({
      title: promo.title,
      description: promo.description || "",
      type: promo.type,
      value: String(promo.value),
      categoryId: promo.categoryId ? String(promo.categoryId) : "",
      startDate: promo.startDate,
      endDate: promo.endDate,
      bgColor: promo.bgColor || "#e30718",
    });
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const url = editId ? `/api/admin/promotions/${editId}` : "/api/admin/promotions";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      cancelForm();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
  }

  async function toggleActive(id, isActive) {
    await fetch(`/api/admin/promotions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette promotion?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const now = new Date();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="admin-text-muted text-sm">{promotions.length} promotion(s)</p>
        <button
          onClick={() => { cancelForm(); setShowForm(true); }}
          className="bg-[var(--color-red)] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all"
        >
          <i className="fas fa-plus mr-2"></i>Nouvelle promotion
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6 space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label className="block text-white/50 text-sm mb-1">Titre du bandeau *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: 10% de rabais ce vendredi!"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-red)]" />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-1">Description (optionnel)</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Ex: Sur tous les coupe-froids en magasin"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-red)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Type de rabais</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] [&>option]:text-gray-800">
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe ($)</option>
                <option value="message">Message seulement</option>
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Valeur</label>
              <input name="value" type="number" step="0.01" value={form.value} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Categorie</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)] [&>option]:text-gray-800">
                <option value="">Toutes les categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Date debut *</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Date fin *</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Couleur du bandeau</label>
              <div className="flex gap-2">
                <input name="bgColor" type="color" value={form.bgColor} onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                <input value={form.bgColor} onChange={(e) => setForm({...form, bgColor: e.target.value})}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[var(--color-red)]" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-all">
              <i className="fas fa-check mr-1"></i> {editId ? "Sauvegarder" : "Creer la promotion"}
            </button>
            <button type="button" onClick={cancelForm} className="admin-text-muted hover:admin-text text-sm transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {promotions.length === 0 && (
          <p className="text-white/30 text-center py-8">Aucune promotion. Cliquez sur "Nouvelle promotion" pour commencer.</p>
        )}
        {promotions.map((promo) => {
          const isExpired = new Date(promo.endDate) < now;
          const isUpcoming = new Date(promo.startDate) > now;
          const isLive = promo.isActive && !isExpired && !isUpcoming;

          return (
            <div key={promo.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: promo.bgColor }}>
                  <i className="fas fa-tag text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{promo.title}</h3>
                    {isLive && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">EN COURS</span>}
                    {isExpired && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">EXPIRE</span>}
                    {isUpcoming && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">A VENIR</span>}
                    {!promo.isActive && <span className="px-2 py-0.5 bg-white/10 text-white/40 text-xs font-bold rounded-full">DESACTIVE</span>}
                  </div>
                  <p className="text-white/40 text-sm">
                    {promo.type === "percent" && `${promo.value}% de rabais`}
                    {promo.type === "fixed" && `${promo.value}$ de rabais`}
                    {promo.type === "message" && "Message promotionnel"}
                    {promo.category ? ` sur ${promo.category.name}` : " sur tout"}
                    {" — "}
                    {promo.startDate} au {promo.endDate}
                  </p>
                  {promo.description && <p className="text-white/30 text-xs mt-1">{promo.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(promo)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                  >
                    <i className="fas fa-edit mr-1"></i> Editer
                  </button>
                  <button
                    onClick={() => toggleActive(promo.id, promo.isActive)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      promo.isActive
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}
                  >
                    {promo.isActive ? "Desactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              {/* Preview */}
              {isLive && (
                <div className="px-5 pb-4">
                  <p className="text-white/30 text-xs mb-2">Apercu du bandeau :</p>
                  <div className="rounded-lg py-2 px-4 text-white text-center text-sm font-semibold" style={{ backgroundColor: promo.bgColor }}>
                    <i className="fas fa-tag mr-2"></i>
                    {promo.title}
                    {promo.description && <span className="font-normal ml-2 opacity-80">— {promo.description}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
