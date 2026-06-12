"use client";

import { useEffect, useState } from "react";

const DEFAULT_SLA = { to_contact: 5, visit: 24, soumission: 48, approval: 48 };

const STAGES = [
  { key: "to_contact", label: "À contacter", hint: "depuis la création / la dernière tentative", icon: "fa-phone" },
  { key: "visit", label: "Visite à faire", hint: "depuis le contact du client", icon: "fa-location-dot" },
  { key: "soumission", label: "Soumission à envoyer", hint: "depuis la visite", icon: "fa-file-lines" },
  { key: "approval", label: "En attente d'approbation", hint: "depuis l'envoi de la soumission", icon: "fa-thumbs-up" },
];

export default function FollowUpSlaSettings() {
  const [vals, setVals] = useState(DEFAULT_SLA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=admin_follow_up_sla")
      .then((r) => r.json())
      .then((d) => { try { if (d?.value) setVals({ ...DEFAULT_SLA, ...JSON.parse(d.value) }); } catch { /* défauts */ } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const clean = {};
    for (const s of STAGES) {
      const n = Number(vals[s.key]);
      clean[s.key] = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "admin_follow_up_sla", value: JSON.stringify(clean) }),
      });
      if (res.ok) {
        setVals(clean);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="admin-card rounded-xl p-6 border admin-border">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <div>
          <h2 className="admin-text font-bold text-lg">Suivi clients — alertes de retard</h2>
          <p className="admin-text-muted text-sm mt-1">
            Nombre d&apos;heures avant qu&apos;une étape se mette à <strong className="text-rose-400">clignoter en rouge</strong> dans le suivi. Mets <strong>0</strong> pour désactiver l&apos;alerte d&apos;une étape.
          </p>
        </div>
        {saved && <span className="text-green-400 text-sm font-bold whitespace-nowrap">Sauvegardé</span>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        {STAGES.map((s) => (
          <div key={s.key} className="admin-bg border admin-border rounded-lg p-3">
            <label className="admin-text text-sm font-semibold flex items-center gap-2">
              <i className={`fas ${s.icon} admin-text-muted`}></i>{s.label}
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min="0"
                step="1"
                value={vals[s.key] ?? 0}
                onChange={(e) => setVals((v) => ({ ...v, [s.key]: e.target.value }))}
                disabled={loading}
                className="admin-input w-24 border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-red)]"
              />
              <span className="admin-text-muted text-sm">heures</span>
            </div>
            <p className="admin-text-muted text-xs mt-1.5">{s.hint}</p>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving || loading}
        className="mt-5 bg-[var(--color-red)] text-white px-5 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder les seuils"}
      </button>
    </form>
  );
}
