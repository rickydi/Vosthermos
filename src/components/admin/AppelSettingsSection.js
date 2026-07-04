"use client";

import { useEffect, useState } from "react";

const KEY = "appel_auto_photo_sms";

// Paramètres > Appels : envoi automatique du texto « envoyez vos photos » au
// client dès qu'un appel est enregistré dans /admin/appel.
export default function AppelSettingsSection() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/settings?key=${KEY}`)
      .then((r) => r.json())
      .then((data) => setEnabled(data?.value === "1"))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    if (saving || loading) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: KEY, value: next ? "1" : "0" }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setEnabled(!next); // revert
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card rounded-xl p-6 border admin-border">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="admin-text font-bold text-lg">
            <i className="fas fa-phone mr-2"></i>Appels
          </h2>
          <p className="admin-text-muted text-sm mt-1 max-w-xl">
            Quand un appel est enregistré (page « Enregistrer un appel »), texter automatiquement
            au client le lien sécurisé pour qu&apos;il envoie ses photos. Le texto part seulement
            si le numéro est valide.
          </p>
        </div>
        {saved && <span className="text-green-400 text-sm font-bold">Sauvegardé</span>}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || saving}
        className="mt-4 inline-flex items-center gap-3 disabled:opacity-50"
        aria-pressed={enabled}
      >
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-500/40"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${enabled ? "left-[22px]" : "left-0.5"}`}
          />
        </span>
        <span className="admin-text text-sm font-semibold">
          {loading ? "Chargement…" : enabled ? "Texto photos automatique : activé" : "Texto photos automatique : désactivé"}
        </span>
      </button>
    </div>
  );
}
