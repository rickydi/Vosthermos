"use client";

import { useState, useEffect } from "react";

export default function ApiKeysSection() {
  const [keys, setKeys] = useState({ anthropic: "", serper: "" });
  const [masked, setMasked] = useState({ anthropic: "", serper: "" });
  const [editing, setEditing] = useState({ anthropic: false, serper: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const res = await fetch("/api/admin/settings?section=api-keys");
      if (res.ok) {
        const data = await res.json();
        setMasked({
          anthropic: data.anthropic || "",
          serper: data.serper || "",
        });
      }
    } catch {}
    setLoading(false);
  }

  function toggleEdit(field) {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    if (editing[field]) {
      setKeys((prev) => ({ ...prev, [field]: "" }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { section: "api-keys" };
      if (keys.anthropic) payload.anthropic = keys.anthropic;
      if (keys.serper) payload.serper = keys.serper;

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        setEditing({ anthropic: false, serper: false });
        setKeys({ anthropic: "", serper: "" });
        await loadKeys();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  }

  const fields = [
    { key: "anthropic", label: "Cle API Anthropic (Claude)" },
    { key: "serper", label: "Cle API Serper (SEO)" },
  ];

  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-4">
        <i className="fas fa-key mr-2"></i>Cles API
      </h2>

      {loading ? (
        <p className="text-white/50 text-sm">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {fields.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-white/50 text-sm mb-1">{label}</label>
              <div className="flex items-center gap-2">
                {editing[key] ? (
                  <input
                    type="text"
                    value={keys[key]}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Coller la nouvelle cle..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-red)]"
                  />
                ) : (
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50 font-mono text-sm">
                    {masked[key] || "Non configuree"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleEdit(key)}
                  className="px-4 py-3 rounded-lg text-xs font-semibold transition-colors bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  {editing[key] ? "Annuler" : "Modifier"}
                </button>
              </div>
            </div>
          ))}

          {(editing.anthropic || editing.serper) && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!keys.anthropic && !keys.serper)}
              className="bg-[var(--color-red)] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saved ? (
                <><i className="fas fa-check"></i> Sauvegarde!</>
              ) : saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Sauvegarde...</>
              ) : (
                <><i className="fas fa-save"></i> Sauvegarder les cles</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
