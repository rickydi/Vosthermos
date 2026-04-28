"use client";

import { useEffect, useState } from "react";

const FIELDS = [
  { key: "company_legal_name", label: "Nom legal (raison sociale)", placeholder: "9999-9999 Quebec inc." },
  { key: "company_neq", label: "NEQ (numero d'entreprise Quebec)", placeholder: "1234567890" },
  { key: "company_address", label: "Adresse", placeholder: "330 Chem. Saint-François-Xavier, local 104" },
  { key: "company_city", label: "Ville", placeholder: "Delson" },
  { key: "company_province", label: "Province", placeholder: "QC" },
  { key: "company_postal_code", label: "Code postal", placeholder: "J5B 1Y1" },
  { key: "company_phone", label: "Telephone", placeholder: "514-825-8411" },
  { key: "company_email", label: "Email", placeholder: "info@vosthermos.com" },
  { key: "company_web", label: "Site web", placeholder: "vosthermos.com" },
  { key: "tps_number", label: "Numero TPS", placeholder: "123456789 RT0001" },
  { key: "tvq_number", label: "Numero TVQ", placeholder: "1234567890 TQ0001" },
  { key: "rbq_number", label: "Licence RBQ", placeholder: "5820-0684-01" },
];

export default function CompanyInfoSection() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function propagateToSite() {
    if (!confirm("Propager ces valeurs sur TOUT le site (incluant les pages statiques)?\n\nCela va:\n1. Sauvegarder le fichier company-info.js\n2. Committer + pousser sur GitHub\n3. Relancer le site (2 minutes)\n\nLe site sera offline ~2 min pendant le rebuild.")) return;
    setSyncing(true);
    setSyncMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/company/sync", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur");
      setSyncMsg(d.message);
      // Keep syncing state for a bit so user sees feedback
      setTimeout(() => setSyncing(false), 8000);
    } catch (e) {
      setErr(e.message);
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/settings?section=company")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d === "object" && !d.error) setForm(d);
      })
      .finally(() => setLoading(false));
  }, []);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setErr("");
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "company", ...form }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e2) {
      setErr(e2.message);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="admin-card border rounded-xl p-6">
        <p className="admin-text-muted text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</p>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="admin-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="admin-text font-bold text-lg">
            <i className="fas fa-file-invoice-dollar mr-2 text-[var(--color-red)]"></i>
            Infos de facturation
          </h2>
          <p className="admin-text-muted text-xs mt-1">
            Ces informations apparaissent sur toutes les factures generees (header + footer).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={propagateToSite} disabled={syncing || saving}
            className="px-4 py-2.5 admin-card border admin-border admin-text rounded-lg text-sm font-medium hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
            title="Synchronise les valeurs sur toutes les pages statiques du site + redeploie">
            {syncing ? <><i className="fas fa-spinner fa-spin"></i> Propagation...</> :
              <><i className="fas fa-globe"></i> Propager sur le site</>}
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
            {saving ? <><i className="fas fa-spinner fa-spin"></i> Sauvegarde...</> :
              saved ? <><i className="fas fa-check"></i> Sauvegarde</> :
                <><i className="fas fa-save"></i> Enregistrer</>}
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
      {syncMsg && (
        <div className="mb-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm">
          <i className="fas fa-info-circle mr-2"></i>{syncMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "company_address" ? "md:col-span-2" : ""}>
            <label className="admin-text-muted text-xs mb-1 block font-medium">{f.label}</label>
            <input
              name={f.key}
              value={form[f.key] ?? ""}
              onChange={onChange}
              placeholder={f.placeholder}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
            />
          </div>
        ))}
      </div>
    </form>
  );
}
