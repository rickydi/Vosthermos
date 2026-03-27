"use client";

import { useState, useEffect } from "react";

export default function BlogNotifyMembersSection() {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/admin/blog/notify-members");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch {}
  }

  async function toggleActive(member) {
    setError("");
    const res = await fetch(`/api/admin/blog/notify-members/${member.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    fetchMembers();
  }

  async function deleteMember(id) {
    if (!confirm("Supprimer ce membre des notifications blog?")) return;
    setError("");
    const res = await fetch(`/api/admin/blog/notify-members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    fetchMembers();
  }

  async function addMember() {
    if (!newName.trim() || !newEmail.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/admin/blog/notify-members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, email: newEmail }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
    setNewName("");
    setNewEmail("");
    setAdding(false);
    fetchMembers();
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text font-bold text-lg mb-1">
        <i className="fas fa-newspaper mr-2"></i>
        Notifications Blogue (Email)
      </h2>
      <p className="admin-text-muted text-xs mb-4">
        Les membres actifs recoivent un email de preview quand un article est genere par IA, avec un bouton pour approuver ou modifier.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm text-red-400">{error}</div>
      )}

      {/* Members list */}
      <div className="space-y-3 mb-4">
        {members.map((m) => (
          <div key={m.id} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <i className="fas fa-envelope text-white/40 text-xs"></i>
                </div>
                <div>
                  <span className="admin-text text-sm font-medium">{m.name}</span>
                  <span className="admin-text-muted text-xs ml-2">{m.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(m)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${m.isActive ? "bg-green-500" : "bg-white/10"}`}
                  title={m.isActive ? "Actif" : "Inactif"}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${m.isActive ? "left-5" : "left-0.5"}`} />
                </button>
                <button onClick={() => deleteMember(m.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="admin-text-muted text-sm text-center py-4">Aucun destinataire configure</p>
        )}
      </div>

      {/* Add form */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block admin-text-muted text-xs mb-1">Nom</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Erik"
            className="w-full admin-input border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-red)]" />
        </div>
        <div className="flex-1">
          <label className="block admin-text-muted text-xs mb-1">Email</label>
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="erik@vosthermos.com" type="email"
            className="w-full admin-input border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-red)]" />
        </div>
        <button onClick={addMember} disabled={adding || !newName.trim() || !newEmail.trim()}
          className="px-4 py-2 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shrink-0">
          {adding ? "..." : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
