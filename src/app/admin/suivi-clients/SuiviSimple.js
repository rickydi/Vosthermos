"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminStream } from "@/components/admin/adminStream";
import { FOLLOW_UP_MILESTONES } from "@/lib/follow-up-columns";

const fmtMoney = (n) => (n === null || n === undefined ? null : new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n));
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" }) : "");

const FILTERS = [
  { key: "open", label: "En cours" },
  { key: "won", label: "Gagnés" },
  { key: "lost", label: "Perdus" },
  { key: "all", label: "Tous" },
];

export default function SuiviSimple() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const searchRef = useRef("");
  searchRef.current = search;
  const seq = useRef(0);

  const load = useCallback(async (q = searchRef.current) => {
    const my = ++seq.current;
    try {
      const res = await fetch(`/api/admin/follow-ups?status=all&activity=0&limit=200${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`);
      const data = res.ok ? await res.json() : [];
      if (my === seq.current) { setItems(Array.isArray(data) ? data : []); setLoading(false); }
    } catch { if (my === seq.current) setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // recherche debouncée
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search, load]);

  // temps réel : un collègue (ou le terrain) coche un jalon -> on rafraîchit
  useAdminStream((e) => {
    if (["connected", "follow_up.changed", "work_order.changed", "appointment.changed"].includes(e?.type)) load();
  });

  // mise à jour optimiste locale
  const patchLocal = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  async function toggleMilestone(fu, key) {
    const on = !fu[key];
    patchLocal(fu.id, { [key]: on ? new Date().toISOString() : null });
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleMilestone: key, on }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      patchLocal(fu.id, updated);
    } catch {
      load(); // revert via reload
    }
  }

  async function setOutcome(fu, outcome) {
    const next = fu.outcome === outcome ? "open" : outcome;
    patchLocal(fu.id, { outcome: next });
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: next }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      patchLocal(fu.id, updated);
    } catch {
      load();
    }
  }

  const visible = items.filter((fu) => {
    if (filter === "all") return true;
    if (filter === "won") return fu.outcome === "won";
    if (filter === "lost") return fu.outcome === "lost";
    return fu.outcome !== "won" && fu.outcome !== "lost"; // open
  });

  const counts = {
    open: items.filter((f) => f.outcome !== "won" && f.outcome !== "lost").length,
    won: items.filter((f) => f.outcome === "won").length,
    lost: items.filter((f) => f.outcome === "lost").length,
    all: items.length,
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Suivi clients</h1>
          <p className="admin-text-muted text-sm mt-1">Coche les étapes au fur et à mesure · clique un nom pour la fiche complète</p>
        </div>
        <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">
          <i className="fas fa-plus mr-2"></i>Nouveau suivi
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f.key ? "bg-[var(--color-red)] text-white" : "admin-card border admin-border admin-text-muted hover:admin-text"}`}>
            {f.label} <span className="opacity-70">{counts[f.key]}</span>
          </button>
        ))}
        <div className="relative ml-auto">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 admin-text-muted text-xs"></i>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, tél, service…"
            className="admin-input border rounded-lg pl-8 pr-3 py-2 text-sm w-64 max-w-full" />
        </div>
      </div>

      {loading ? (
        <div className="admin-text-muted text-sm py-16 text-center"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="admin-card border rounded-xl p-12 text-center admin-text-muted">
          <i className="fas fa-list-check text-3xl opacity-30 mb-3 block"></i>
          {search ? "Aucun résultat." : "Aucun suivi dans cette vue."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((fu) => {
            const name = fu.client?.name || fu.contactName || fu.title || "Sans nom";
            const isLost = fu.outcome === "lost";
            const isWon = fu.outcome === "won";
            return (
              <div key={fu.id} className={`admin-card border rounded-xl p-3.5 transition-opacity ${isLost ? "opacity-55" : ""}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {fu.clientId ? (
                        <Link href={`/admin/clients/${fu.clientId}`} className="admin-text font-bold hover:text-[var(--color-red)] transition-colors">{name}</Link>
                      ) : (
                        <span className="admin-text font-bold">{name}</span>
                      )}
                      {fu.clientId && (
                        <Link href={`/admin/clients/${fu.clientId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--color-red)]/10 text-[var(--color-red)] hover:bg-[var(--color-red)] hover:text-white transition-colors">
                          <i className="fas fa-folder-open"></i>Ouvrir client
                        </Link>
                      )}
                    </div>
                    <div className="admin-text-muted text-xs mt-0.5 flex flex-wrap gap-x-3">
                      {fu.service && <span>{fu.service}</span>}
                      {fu.phone && <span><i className="fas fa-phone mr-1 opacity-60"></i>{fu.phone}</span>}
                      {fmtMoney(fu.estimateAmount) && <span className="admin-text font-semibold">{fmtMoney(fu.estimateAmount)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setOutcome(fu, "won")} title="Gagné"
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${isWon ? "bg-emerald-500 text-white border-emerald-500" : "admin-border admin-text-muted hover:text-emerald-400"}`}>
                      <i className="fas fa-trophy mr-1"></i>Gagné
                    </button>
                    <button onClick={() => setOutcome(fu, "lost")} title="Perdu"
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${isLost ? "bg-slate-500 text-white border-slate-500" : "admin-border admin-text-muted hover:text-slate-300"}`}>
                      <i className="fas fa-ban mr-1"></i>Perdu
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {FOLLOW_UP_MILESTONES.map((m) => {
                    const on = !!fu[m.key];
                    return (
                      <button key={m.key} onClick={() => toggleMilestone(fu, m.key)} title={on ? `${m.label} · ${fmtDate(fu[m.key])}` : m.label}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${on ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "admin-bg admin-border admin-text-muted hover:admin-text"}`}>
                        <i className={`fas ${on ? "fa-circle-check" : "fa-circle"} ${on ? "" : "opacity-40"}`}></i>
                        {m.label}
                        {on && <span className="opacity-60 hidden sm:inline">{fmtDate(fu[m.key])}</span>}
                      </button>
                    );
                  })}
                </div>

                {fu.nextAction && (
                  <div className="mt-2 text-xs admin-text">
                    <i className="fas fa-arrow-right mr-1 text-[var(--color-red)]"></i>{fu.nextAction}
                    {fu.nextActionDate && <span className="admin-text-muted"> · {fmtDate(fu.nextActionDate)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ contactName: "", phone: "", email: "", service: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!form.contactName.trim()) { setErr("Le nom est requis"); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.contactName, contactName: form.contactName, phone: form.phone, email: form.email, service: form.service }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Erreur"); }
      onCreated();
    } catch (e2) { setErr(e2.message); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-bg border admin-border rounded-xl w-full max-w-md shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">Nouveau suivi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center"><i className="fas fa-times admin-text-muted"></i></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Nom du client *</label>
            <input autoFocus value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Service / besoin</label>
            <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Ex: Remplacement thermos" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">{saving ? "Création…" : "Créer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
