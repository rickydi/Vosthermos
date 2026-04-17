"use client";

import { useState, useEffect } from "react";

const CATEGORIES = [
  { value: "thermo", label: "Thermo" },
  { value: "installation", label: "Installation" },
  { value: "ajustement", label: "Ajustement" },
  { value: "quincaillerie", label: "Quincaillerie" },
  { value: "vitre", label: "Vitre" },
  { value: "autre", label: "Autre" },
];

const empty = { code: "", name: "", category: "thermo", price: "", isPreset: false, position: 0 };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or "new"
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing("new");
    setForm(empty);
    setMsg("");
  }

  function startEdit(s) {
    setEditing(s.id);
    setForm({
      code: s.code,
      name: s.name,
      category: s.category,
      price: String(s.price),
      isPreset: s.isPreset,
      position: s.position,
    });
    setMsg("");
  }

  async function save() {
    setMsg("");
    if (!form.code || !form.name || !form.price) {
      setMsg("Code, nom et prix requis");
      return;
    }
    const body = {
      ...form,
      price: parseFloat(form.price),
      position: parseInt(form.position) || 0,
    };
    try {
      const url = editing === "new" ? "/api/admin/services" : `/api/admin/services/${editing}`;
      const method = editing === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      setEditing(null);
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Desactiver ce service ?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    await load();
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: services.filter((s) => s.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-text text-2xl font-bold">Catalogue de services</h1>
        <button onClick={startNew}
          className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
          <i className="fas fa-plus mr-2"></i>Nouveau service
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{msg}</div>}

      {editing !== null && (
        <div className="admin-card border rounded-xl p-6 mb-6 space-y-3">
          <h2 className="admin-text font-bold">{editing === "new" ? "Nouveau service" : "Modifier"}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Code (unique)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" placeholder="ex: thermo-petit" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Categorie</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Prix ($)</label>
              <input type="number" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Position (tri)</label>
              <input type="number" value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <label className="flex items-center gap-2 text-sm admin-text">
              <input type="checkbox" checked={form.isPreset}
                onChange={(e) => setForm({ ...form, isPreset: e.target.checked })} />
              Afficher comme raccourci sur le terrain
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
              Enregistrer
            </button>
            <button onClick={() => setEditing(null)}
              className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-text-muted"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.value} className="admin-card border rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b admin-border">
                <h2 className="admin-text font-bold text-sm uppercase tracking-wider">{g.label}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-text-muted text-xs uppercase">
                    <th className="text-left px-6 py-2">Nom</th>
                    <th className="text-left px-4 py-2">Code</th>
                    <th className="text-right px-4 py-2">Prix</th>
                    <th className="text-center px-4 py-2">Raccourci</th>
                    <th className="px-4 py-2 w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((s) => (
                    <tr key={s.id} className="border-t admin-border">
                      <td className="px-6 py-2 admin-text">{s.name}</td>
                      <td className="px-4 py-2 admin-text-muted font-mono text-xs">{s.code}</td>
                      <td className="px-4 py-2 admin-text text-right">{Number(s.price).toFixed(2)} $</td>
                      <td className="px-4 py-2 text-center">
                        {s.isPreset ? <i className="fas fa-star text-yellow-500"></i> : <span className="admin-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => startEdit(s)}
                          className="text-xs text-[var(--color-red)] mr-3">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => remove(s.id)}
                          className="text-xs admin-text-muted">
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
