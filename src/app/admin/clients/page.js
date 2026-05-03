"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const EMPTY_FORM = {
  name: "",
  type: "particulier",
  company: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  address: "",
  city: "",
  province: "QC",
  postalCode: "",
  notes: "",
};

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recemment modifie" },
  { value: "created_desc", label: "Date d'ajout (recent)" },
  { value: "created_asc", label: "Date d'ajout (ancien)" },
  { value: "name_asc", label: "Nom (A-Z)" },
  { value: "name_desc", label: "Nom (Z-A)" },
  { value: "city_asc", label: "Ville (A-Z)" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated_desc");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);

  // Units (only relevant when editing a gestionnaire)
  const [units, setUnits] = useState([]);
  const [unitCode, setUnitCode] = useState("");
  const [unitDesc, setUnitDesc] = useState("");
  const [unitError, setUnitError] = useState("");
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editUnitCode, setEditUnitCode] = useState("");
  const [editUnitDesc, setEditUnitDesc] = useState("");

  const load = useCallback((q = "", sortValue = "updated_desc") => {
    setLoading(true);
    fetch(`/api/admin/clients?q=${encodeURIComponent(q)}&sort=${sortValue}`)
      .then((r) => r.json())
      .then((data) => { setClients(data.clients || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search, sort), 300);
    return () => clearTimeout(timer.current);
  }, [load, search, sort]);

  async function handleDelete(client) {
    if (!confirm(`Supprimer le client "${client.name}"? Cette action est irreversible.`)) return;
    const res = await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erreur lors de la suppression (peut-etre des bons de travail lies?)");
      return;
    }
    load(search, sort);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(client) {
    setForm({
      name: client.name || "",
      type: client.type || "particulier",
      company: client.company || "",
      phone: client.phone || "",
      secondaryPhone: client.secondaryPhone || "",
      email: client.email || "",
      address: client.address || "",
      city: client.city || "",
      province: client.province || "QC",
      postalCode: client.postalCode || "",
      notes: client.notes || "",
    });
    setEditId(client.id);
    setError("");
    setShowForm(true);
    // Load units if gestionnaire
    if (client.type === "gestionnaire") loadUnits(client.id);
    else setUnits([]);
  }

  async function loadUnits(clientId) {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/units`);
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch { setUnits([]); }
  }

  async function addUnit() {
    if (!editId || !unitCode.trim()) return;
    setUnitError("");
    try {
      const res = await fetch(`/api/admin/clients/${editId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: unitCode.trim(), description: unitDesc.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setUnitError(d.error || "Erreur");
        return;
      }
      setUnitCode("");
      setUnitDesc("");
      loadUnits(editId);
    } catch (err) { setUnitError(err.message); }
  }

  function startEditUnit(u) {
    setEditingUnitId(u.id);
    setEditUnitCode(u.code);
    setEditUnitDesc(u.description || "");
  }

  async function saveUnit(id) {
    try {
      await fetch(`/api/admin/clients/${editId}/units/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editUnitCode.trim(), description: editUnitDesc.trim() || null }),
      });
      setEditingUnitId(null);
      loadUnits(editId);
    } catch {}
  }

  async function toggleUnitActive(u) {
    await fetch(`/api/admin/clients/${editId}/units/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    loadUnits(editId);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom est requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/clients/${editId}` : "/api/admin/clients";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }
      resetForm();
      setShowForm(false);
      load(search, sort);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-text text-2xl font-bold">Clients</h1>
        <div className="flex items-center gap-3">
          <p className="admin-text-muted text-sm">{clients.length} clients</p>
          <button
            onClick={() => (showForm ? (setShowForm(false), resetForm()) : openCreate())}
            className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-plus mr-2"></i>Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="admin-text font-bold">{editId ? "Modifier client" : "Nouveau client"}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, type: "particulier" })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                form.type === "particulier" ? "bg-[var(--color-red)] text-white" : "admin-card border admin-border admin-text"
              }`}>
              <i className="fas fa-user mr-2"></i>Particulier
            </button>
            <button type="button" onClick={() => setForm({ ...form, type: "gestionnaire" })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                form.type === "gestionnaire" ? "bg-[var(--color-red)] text-white" : "admin-card border admin-border admin-text"
              }`}>
              <i className="fas fa-building mr-2"></i>Gestionnaire / B2B
            </button>
          </div>
          {form.type === "gestionnaire" && (
            <p className="text-xs admin-text-muted -mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Les bons de travail pour ce client pourront etre organises par unite (ex: F-0411, E-0510).
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Nom complet *" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Entreprise" value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Telephone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Autre telephone" value={form.secondaryPhone}
              onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm md:col-span-2" />
            <AddressAutocomplete
              value={form.address}
              onChange={(address) => setForm((prev) => ({ ...prev, address }))}
              onSelect={(address) => setForm((prev) => ({ ...prev, ...address }))}
              placeholder="Adresse"
              className="md:col-span-2"
              inputClassName="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
            />
            <input placeholder="Ville" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Province" value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
              <input placeholder="Code postal" value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            </div>
          </div>
          <textarea placeholder="Notes" value={form.notes} rows={3}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full" />

          {editId && form.type === "gestionnaire" && (
            <div className="border-t admin-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="admin-text font-bold text-sm">
                  <i className="fas fa-building mr-2"></i>Unites ({units.filter(u => u.isActive).length} actives)
                </h3>
                <p className="admin-text-muted text-[10px]">Nouvelles unites ajoutees automatiquement quand le tech saisit un code.</p>
              </div>

              {units.length === 0 ? (
                <p className="admin-text-muted text-xs italic">Aucune unite pour ce client. Ajoute-en ci-dessous ou attends que le tech en saisisse sur le terrain.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {units.map((u) => (
                    <div key={u.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${u.isActive ? "bg-white/5" : "bg-white/5 opacity-50"}`}>
                      {editingUnitId === u.id ? (
                        <>
                          <input value={editUnitCode} onChange={(e) => setEditUnitCode(e.target.value)}
                            className="admin-input border rounded px-2 py-1 text-xs w-24 font-mono" />
                          <input value={editUnitDesc} onChange={(e) => setEditUnitDesc(e.target.value)}
                            placeholder="Description"
                            className="admin-input border rounded px-2 py-1 text-xs flex-1" />
                          <button type="button" onClick={() => saveUnit(u.id)}
                            className="text-green-400 text-xs px-2"><i className="fas fa-check"></i></button>
                          <button type="button" onClick={() => setEditingUnitId(null)}
                            className="admin-text-muted text-xs px-2"><i className="fas fa-times"></i></button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono font-bold admin-text w-24">{u.code}</span>
                          <span className="admin-text-muted flex-1 truncate">{u.description || <em className="opacity-50">—</em>}</span>
                          {!u.isActive && <span className="text-[10px] admin-text-muted italic">desactivee</span>}
                          <button type="button" onClick={() => startEditUnit(u)}
                            className="admin-text-muted text-xs px-2 hover:admin-text"><i className="fas fa-pen"></i></button>
                          <button type="button" onClick={() => toggleUnitActive(u)}
                            className={`text-xs px-2 ${u.isActive ? "text-orange-400" : "text-green-400"}`}
                            title={u.isActive ? "Desactiver" : "Reactiver"}>
                            <i className={`fas ${u.isActive ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input value={unitCode} onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                  placeholder="Code (ex: F-0411)" className="admin-input border rounded-lg px-3 py-2 text-sm w-32 font-mono"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUnit())} />
                <input value={unitDesc} onChange={(e) => setUnitDesc(e.target.value)}
                  placeholder="Description (optionnel)" className="admin-input border rounded-lg px-3 py-2 text-sm flex-1"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUnit())} />
                <button type="button" onClick={addUnit} disabled={!unitCode.trim()}
                  className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-30">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {unitError && <p className="text-xs text-red-500">{unitError}</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "..." : editId ? "Modifier" : "Creer"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="px-6 py-2.5 admin-text-muted admin-hover rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, telephone principal ou autre, email, ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input border rounded-xl px-4 py-3 text-sm flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="admin-input border rounded-xl px-4 py-3 text-sm md:w-64"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 admin-text-muted">
          <i className="fas fa-address-book text-4xl mb-3"></i>
          <p>Aucun client trouve</p>
        </div>
      ) : (
        <div className="admin-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b admin-border admin-text-muted text-xs text-left">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Bons</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b admin-border admin-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/clients/${c.id}`} className="admin-text font-medium hover:text-[var(--color-red)]">
                        {c.name}
                      </Link>
                      {c.type === "gestionnaire" && (
                        <span className="text-[10px] uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                          B2B
                        </span>
                      )}
                    </div>
                    {c.email && <p className="admin-text-muted text-xs">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 admin-text-muted">{c.company || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">
                    <div>{c.phone || "—"}</div>
                    {c.secondaryPhone && <div className="text-xs opacity-70">{c.secondaryPhone}</div>}
                  </td>
                  <td className="px-4 py-3 admin-text-muted">{c.city || "—"}</td>
                  <td className="px-4 py-3 admin-text">{c._count?.workOrders || 0}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/clients/${c.id}`}
                      className="admin-text-muted hover:admin-text text-xs mr-4" title="Ouvrir la fiche">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <button onClick={() => startEdit(c)}
                      className="admin-text-muted hover:admin-text text-xs mr-4" title="Modifier">
                      <i className="fas fa-pen"></i>
                    </button>
                    <button onClick={() => handleDelete(c)}
                      className="text-red-500 hover:text-red-600 text-xs" title="Supprimer">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
