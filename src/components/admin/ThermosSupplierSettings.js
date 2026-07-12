"use client";

import { useCallback, useEffect, useState } from "react";

const EMPTY = { name: "", contactName: "", email: "", phone: "", leadTimeDays: 21, autoFollowUpEnabled: true, isActive: true, isDefault: true };

export default function ThermosSupplierSettings() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/thermos-suppliers", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Chargement impossible.");
      const list = Array.isArray(body) ? body : body.suppliers || [];
      setSuppliers(list);
      if (list.length) setForm((current) => ({ ...current, isDefault: false }));
    } catch (err) { setMessage(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function edit(supplier) {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name || "", contactName: supplier.contactName || "", email: supplier.email || "", phone: supplier.phone || "",
      leadTimeDays: supplier.leadTimeDays || 21, autoFollowUpEnabled: supplier.autoFollowUpEnabled !== false,
      isActive: supplier.isActive !== false, isDefault: !!supplier.isDefault,
    });
    setMessage("");
  }

  async function submit(e) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      const res = await fetch(editingId ? `/api/admin/thermos-suppliers/${editingId}` : "/api/admin/thermos-suppliers", {
        method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Impossible d’enregistrer le fournisseur.");
      setMessage("Fournisseur enregistré."); setEditingId(null); setForm({ ...EMPTY, isDefault: suppliers.length === 0 }); await load();
    } catch (err) { setMessage(err.message); }
    finally { setSaving(false); }
  }

  async function makeDefault(id) {
    const res = await fetch(`/api/admin/thermos-suppliers/${id}/default`, { method: "POST" });
    if (res.ok) await load();
    else setMessage((await res.json().catch(() => ({}))).error || "Changement impossible.");
  }

  async function deactivate(id) {
    if (!confirm("Désactiver ce fournisseur? Les anciennes commandes seront conservées.")) return;
    const res = await fetch(`/api/admin/thermos-suppliers/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else setMessage((await res.json().catch(() => ({}))).error || "Désactivation impossible.");
  }

  return (
    <section id="fournisseurs-thermos" className="admin-card rounded-xl p-6 border admin-border">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h2 className="admin-text font-bold text-lg"><i className="fas fa-industry mr-2 text-cyan-400" />Fournisseur de thermos</h2>
          <p className="admin-text-muted text-sm mt-1">Le contact, le délai et les relances sont configurables. Les commandes déjà envoyées gardent leur copie historique.</p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 px-3 py-1 text-xs font-bold">Délai actuel conseillé · 3 semaines</span>
      </div>

      {loading ? <p className="admin-text-muted text-sm mb-4"><i className="fas fa-spinner fa-spin mr-2" />Chargement…</p> : suppliers.length > 0 && (
        <div className="grid gap-3 mb-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className={`rounded-xl border p-4 flex flex-wrap items-center gap-4 ${supplier.isDefault ? "border-cyan-400/40 bg-cyan-400/5" : "admin-border"}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 items-center"><p className="admin-text font-bold">{supplier.name}</p>{supplier.isDefault && <span className="text-[10px] uppercase font-bold rounded-full bg-cyan-400/15 text-cyan-300 px-2 py-1">Par défaut</span>}{!supplier.isActive && <span className="text-[10px] uppercase font-bold rounded-full bg-red-400/15 text-red-300 px-2 py-1">Inactif</span>}</div>
                <p className="admin-text-muted text-sm mt-1">{supplier.contactName || "Aucun contact"} · {supplier.email} · {supplier.leadTimeDays} jours</p>
                <p className={`text-xs mt-1 ${supplier.autoFollowUpEnabled ? "text-emerald-400" : "admin-text-muted"}`}><i className={`fas ${supplier.autoFollowUpEnabled ? "fa-envelope-circle-check" : "fa-bell-slash"} mr-1.5`} />Relance automatique {supplier.autoFollowUpEnabled ? "activée" : "désactivée"}</p>
              </div>
              <div className="flex gap-2">
                {!supplier.isDefault && supplier.isActive && <button onClick={() => makeDefault(supplier.id)} className="rounded-lg border admin-border px-3 py-2 admin-text-muted text-xs font-bold">Définir par défaut</button>}
                <button onClick={() => edit(supplier)} className="rounded-lg border admin-border px-3 py-2 admin-text text-xs font-bold"><i className="fas fa-pen mr-1.5" />Modifier</button>
                {supplier.isActive && <button onClick={() => deactivate(supplier.id)} className="rounded-lg border border-red-400/25 px-3 py-2 text-red-300 text-xs" title="Désactiver"><i className="fas fa-power-off" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="rounded-xl border admin-border p-4 bg-black/5">
        <div className="flex items-center justify-between gap-3 mb-4"><h3 className="admin-text font-bold">{editingId ? "Modifier le fournisseur" : suppliers.length ? "Ajouter un fournisseur" : "Configurer votre fournisseur"}</h3>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ ...EMPTY, isDefault: false }); }} className="admin-text-muted text-xs">Annuler</button>}</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label><span className="block admin-text-muted text-xs font-bold mb-1">Entreprise *</span><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5" placeholder="Nom du fournisseur" /></label>
          <label><span className="block admin-text-muted text-xs font-bold mb-1">Personne-contact</span><input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5" placeholder="Martin" /></label>
          <label><span className="block admin-text-muted text-xs font-bold mb-1">Courriel de commande *</span><input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5" placeholder="commandes@fournisseur.ca" /></label>
          <label><span className="block admin-text-muted text-xs font-bold mb-1">Téléphone</span><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5" /></label>
          <label><span className="block admin-text-muted text-xs font-bold mb-1">Délai avant disponibilité *</span><span className="flex items-center gap-2"><input type="number" min="1" max="365" required value={form.leadTimeDays} onChange={(e) => setForm((f) => ({ ...f, leadTimeDays: Number(e.target.value) }))} className="w-28 admin-input border admin-border rounded-lg px-3 py-2.5" /><span className="admin-text-muted text-sm">jours</span></span></label>
          <div className="space-y-2 pt-1">
            <label className="flex gap-3 items-center cursor-pointer"><input type="checkbox" checked={form.autoFollowUpEnabled} onChange={(e) => setForm((f) => ({ ...f, autoFollowUpEnabled: e.target.checked }))} /><span><span className="admin-text text-sm font-semibold block">Relance automatique après le délai</span><span className="admin-text-muted text-xs">Demande au fournisseur si la commande est arrivée.</span></span></label>
            <label className="flex gap-3 items-center cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked, isDefault: e.target.checked ? f.isDefault : false }))} /><span className="admin-text text-sm">Fournisseur actif</span></label>
            <label className="flex gap-3 items-center cursor-pointer"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} /><span className="admin-text text-sm">Fournisseur par défaut</span></label>
          </div>
        </div>
        {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
        <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-[var(--color-red)] text-white px-5 py-3 font-bold disabled:opacity-50"><i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-floppy-disk"} mr-2`} />{saving ? "Enregistrement…" : "Enregistrer le fournisseur"}</button>
      </form>
    </section>
  );
}
