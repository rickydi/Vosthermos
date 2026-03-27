"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserList({ users: initialUsers }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ email: "", password: "" });
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet administrateur?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/50 text-sm">{initialUsers.length} administrateur(s)</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--color-red)] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all"
        >
          <i className="fas fa-plus mr-2"></i>Ajouter un admin
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6 space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Courriel</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Mot de passe</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-all">
              Creer
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
        {initialUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-5 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-white/30 text-xs">Administrateur</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(user.id)}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
