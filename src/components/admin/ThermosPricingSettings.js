"use client";

import { useEffect, useState } from "react";
import { THERMOS_PRICING_DEFAULTS, normalizeThermosPricingSettings } from "@/lib/thermos-pricing";

const FIELDS = [
  { key: "thermos_price_per_sqft", label: "Prix par pi2", suffix: "$/pi2" },
  { key: "thermos_minimum_unit_price", label: "Minimum par thermos", suffix: "$" },
  { key: "thermos_install_per_unit", label: "Installation par thermos", suffix: "$" },
  { key: "thermos_low_e_per_sqft", label: "Option Low-E", suffix: "$/pi2" },
  { key: "thermos_argon_per_sqft", label: "Option argon", suffix: "$/pi2" },
  { key: "thermos_tempered_percent", label: "Verre trempe", suffix: "%" },
  { key: "thermos_grill_per_unit", label: "Carrelage/intercalaire", suffix: "$" },
  { key: "thermos_access_medium_per_unit", label: "Acces moyen", suffix: "$" },
  { key: "thermos_access_hard_per_unit", label: "Acces difficile", suffix: "$" },
  { key: "thermos_trip_fee", label: "Frais fixes", suffix: "$" },
  { key: "thermos_margin_percent", label: "Marge/admin", suffix: "%" },
  { key: "thermos_quote_buffer_percent", label: "Fourchette +/-", suffix: "%" },
];

function PricingField({ field, value, onChange }) {
  return (
    <label className="block">
      <span className="admin-text-muted mb-1 block text-xs font-medium">{field.label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
        />
        <span className="admin-text-muted w-14 text-xs">{field.suffix}</span>
      </div>
    </label>
  );
}

export default function ThermosPricingSettings() {
  const [settings, setSettings] = useState(THERMOS_PRICING_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/thermos-pricing", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled) setSettings(normalizeThermosPricingSettings(body.settings));
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les prix thermos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/thermos-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.error) throw new Error(body.error || "Erreur sauvegarde");
      setSettings(normalizeThermosPricingSettings(body.settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="thermos-pricing" onSubmit={saveSettings} className="admin-card rounded-xl border admin-border p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="admin-text text-lg font-bold">Calculateur thermos</h2>
          <p className="admin-text-muted mt-1 text-sm">
            Ces prix sont utilises pour les prochains calculs de la secretaire. Les anciens bons ne changent pas.
          </p>
        </div>
        {saved && <span className="text-sm font-bold text-green-400">Sauvegarde</span>}
      </div>

      {loading ? (
        <p className="admin-text-muted text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {FIELDS.map((field) => (
              <PricingField key={field.key} field={field} value={settings[field.key] || ""} onChange={updateSetting} />
            ))}
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder les prix thermos"}
          </button>
        </>
      )}
    </form>
  );
}
