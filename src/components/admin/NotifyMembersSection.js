"use client";

import { useState, useEffect } from "react";
import { formatPhoneInput, formatPhone } from "@/lib/phone";

const DAYS = [
  { key: "lun", label: "L" },
  { key: "mar", label: "M" },
  { key: "mer", label: "M" },
  { key: "jeu", label: "J" },
  { key: "ven", label: "V" },
  { key: "sam", label: "S" },
  { key: "dim", label: "D" },
];

const DEFAULT_SCHEDULE = {
  lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false,
};

export default function NotifyMembersSection() {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/admin/chat/notify-members");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch {}
  }

  async function toggleActive(member) {
    setError("");
    const res = await fetch(`/api/admin/chat/notify-members/${member.id}`, {
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

  async function toggleDay(member, dayKey) {
    const schedule = member.schedule || DEFAULT_SCHEDULE;
    const updated = { ...schedule, [dayKey]: !schedule[dayKey] };
    await fetch(`/api/admin/chat/notify-members/${member.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule: updated }),
    });
    fetchMembers();
  }

  async function deleteMember(id) {
    if (!confirm("Supprimer ce membre des notifications?")) return;
    setError("");
    const res = await fetch(`/api/admin/chat/notify-members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }
    fetchMembers();
  }

  async function addMember() {
    if (!newName.trim() || !newPhone.trim()) return;
    setAdding(true);
    await fetch("/api/admin/chat/notify-members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone }),
    });
    setNewName("");
    setNewPhone("");
    setAdding(false);
    fetchMembers();
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text font-bold text-lg mb-1">Notifications Chat (SMS)</h2>
      <p className="admin-text-muted text-xs mb-4">
        Les membres actifs recoivent un SMS quand un client ecrit dans le chat, selon leur horaire.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm text-red-400">{error}</div>
      )}

      {/* Members list */}
      <div className="space-y-3 mb-4">
        {members.map((m) => {
          const schedule = m.schedule || DEFAULT_SCHEDULE;
          return (
            <div key={m.id} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              {/* Row 1: name, phone, toggle, delete */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="admin-text text-sm font-medium">{m.name}</span>
                  <span className="admin-text-muted text-xs">{formatPhone(m.phone)}</span>
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

              {/* Row 2: day checkboxes */}
              <div className="flex items-center gap-1.5">
                {DAYS.map((day) => (
                  <button key={day.key} onClick={() => toggleDay(m, day.key)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      schedule[day.key] ? "bg-[var(--color-red)] text-white" : "bg-white/5 admin-text-muted"
                    }`}
                    title={day.key.charAt(0).toUpperCase() + day.key.slice(1)}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <p className="admin-text-muted text-sm text-center py-4">Aucun membre configure</p>
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
          <label className="block admin-text-muted text-xs mb-1">Telephone</label>
          <input value={newPhone} onChange={(e) => setNewPhone(formatPhoneInput(e.target.value))} placeholder="555-555-5555"
            className="w-full admin-input border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-red)]" />
        </div>
        <button onClick={addMember} disabled={adding || !newName.trim() || !newPhone.trim()}
          className="px-4 py-2 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shrink-0">
          {adding ? "..." : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
