"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "2-digit" });
}

export default function GestionnairesList({ initialManagers, clients }) {
  const router = useRouter();
  const [managers, setManagers] = useState(initialManagers);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", phone: "", clientIds: [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/managers");
    const data = await res.json();
    setManagers(data);
  }

  async function createManager(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      await refresh();
      setShowNew(false);
      setForm({ email: "", firstName: "", lastName: "", phone: "", clientIds: [] });
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  }

  async function sendLink(id) {
    if (!confirm("Envoyer un nouveau lien d'acces par email?")) return;
    try {
      const res = await fetch(`/api/admin/managers/${id}?action=send-link`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.devLink || "Lien envoye par email.");
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  }

  async function toggleActive(m) {
    await fetch(`/api/admin/managers/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    refresh();
  }

  async function removeManager(id) {
    if (!confirm("Supprimer ce gestionnaire? Toutes ses sessions seront invalidees.")) return;
    await fetch(`/api/admin/managers/${id}`, { method: "DELETE" });
    refresh();
  }

  function toggleClient(clientId) {
    setForm((f) => ({
      ...f,
      clientIds: f.clientIds.includes(clientId)
        ? f.clientIds.filter((id) => id !== clientId)
        : [...f.clientIds, clientId],
    }));
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">
            <i className="fas fa-user-tie mr-2 text-[var(--color-red)]"></i>
            Gestionnaires
          </h1>
          <p className="admin-text-muted text-sm mt-1">
            Comptes pour le portail `/gestionnaire`. Auth par magic link email.
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-5 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold"
        >
          <i className="fas fa-plus mr-2"></i>Nouveau gestionnaire
        </button>
      </div>

      {showNew && (
        <div className="admin-card border rounded-xl p-6 mb-6">
          <h2 className="admin-text font-bold mb-4">Inviter un gestionnaire</h2>
          {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
          <form onSubmit={createManager} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="admin-text-muted text-xs mb-1 block font-medium">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="gestionnaire@example.com"
                  className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                />
              </div>
              <div>
                <label className="admin-text-muted text-xs mb-1 block font-medium">Telephone (optionnel)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="514-555-0100"
                  className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                />
              </div>
              <div>
                <label className="admin-text-muted text-xs mb-1 block font-medium">Prenom</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                />
              </div>
              <div>
                <label className="admin-text-muted text-xs mb-1 block font-medium">Nom</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="admin-text-muted text-xs mb-2 block font-medium">
                Copropriétés a lier ({form.clientIds.length} selectionnee{form.clientIds.length > 1 ? "s" : ""})
              </label>
              <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 admin-bg border admin-border rounded-lg">
                {clients.length === 0 && (
                  <p className="admin-text-muted text-sm italic p-3">
                    Aucun client de type "gestionnaire" dans la base. Creez d'abord un client gestionnaire dans `/admin/clients`.
                  </p>
                )}
                {clients.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.clientIds.includes(c.id)}
                      onChange={() => toggleClient(c.id)}
                    />
                    <div>
                      <div className="admin-text text-sm font-medium">{c.name}</div>
                      <div className="admin-text-muted text-xs">{c.city || "—"}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
                {saving ? "Creation..." : "Creer + envoyer lien"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="admin-bg border-b admin-border">
            <tr>
              <th className="text-left px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Gestionnaire</th>
              <th className="text-left px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Copros</th>
              <th className="text-left px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Derniere connexion</th>
              <th className="text-left px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 admin-text-muted text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-12 admin-text-muted">
                  Aucun gestionnaire enregistre. Clique "Nouveau gestionnaire" pour commencer.
                </td>
              </tr>
            )}
            {managers.map((m) => (
              <tr key={m.id} className="border-b admin-border last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/gestionnaires/${m.id}`} className="admin-text font-bold hover:text-[var(--color-red)]">
                    {m.firstName} {m.lastName}
                  </Link>
                  {m.phone && <div className="admin-text-muted text-xs">{m.phone}</div>}
                </td>
                <td className="px-4 py-3 admin-text-muted text-sm">{m.email}</td>
                <td className="px-4 py-3">
                  {m.clients.length === 0 ? (
                    <span className="admin-text-muted text-xs italic">Aucune</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.clients.map((c) => (
                        <span key={c.clientId} className="inline-block px-2 py-0.5 bg-[var(--color-red)]/10 text-[var(--color-red)] text-xs font-bold rounded">
                          {c.clientName}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 admin-text-muted text-xs">{formatDate(m.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  {m.isActive ? (
                    <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">Actif</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs font-bold rounded">Désactivé</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => sendLink(m.id)} title="Renvoyer lien magique" className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/10 inline-flex items-center justify-center">
                      <i className="fas fa-envelope text-xs admin-text-muted"></i>
                    </button>
                    <button onClick={() => toggleActive(m)} title={m.isActive ? "Desactiver" : "Activer"} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/10 inline-flex items-center justify-center">
                      <i className={`fas ${m.isActive ? "fa-pause" : "fa-play"} text-xs admin-text-muted`}></i>
                    </button>
                    <Link href={`/admin/gestionnaires/${m.id}`} title="Modifier" className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/10 inline-flex items-center justify-center">
                      <i className="fas fa-edit text-xs admin-text-muted"></i>
                    </Link>
                    <button onClick={() => removeManager(m.id)} title="Supprimer" className="w-8 h-8 rounded admin-card border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                      <i className="fas fa-trash text-xs text-red-400"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 admin-card border rounded-xl p-4 text-sm admin-text-muted">
        <i className="fas fa-info-circle mr-2 text-blue-400"></i>
        <strong className="admin-text">Magic link :</strong> Le gestionnaire reçoit un email avec un lien valide 15 minutes. Une fois cliqué, sa session dure 30 jours. Aucun mot de passe à gérer.
      </div>
    </div>
  );
}
