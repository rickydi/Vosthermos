"use client";

import { useState, useEffect, useRef } from "react";

const EMPTY_FORM = {
  name: "",
  company: "",
  phone: "",
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

  function load(q = "", sortValue = sort) {
    setLoading(true);
    fetch(`/api/admin/clients?q=${encodeURIComponent(q)}&sort=${sortValue}`)
      .then((r) => r.json())
      .then((data) => { setClients(data.clients || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(search, sort); }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search, sort), 300);
  }, [search, sort]);

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
      company: client.company || "",
      phone: client.phone || "",
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
      load(search);
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
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Adresse" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm md:col-span-2" />
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
          placeholder="Rechercher par nom, telephone, email, ville..."
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
                    <p className="admin-text font-medium">{c.name}</p>
                    {c.email && <p className="admin-text-muted text-xs">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 admin-text-muted">{c.company || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">{c.phone || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">{c.city || "—"}</td>
                  <td className="px-4 py-3 admin-text">{c._count?.workOrders || 0}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
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
