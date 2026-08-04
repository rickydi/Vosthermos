"use client";

import { useCallback, useEffect, useState } from "react";

// Console de l'app mobile « Appels » : ajouter un telephone, regler le
// comportement a distance, revoquer un appareil perdu.
//
// Tout ce qui est ici s'applique aux telephones SANS redistribuer d'APK : le
// delai, les numeros ignores et l'interrupteur general sont relus par l'app.

function timeAgo(value) {
  if (!value) return "jamais";
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return `il y a ${d} jour${d > 1 ? "s" : ""}`;
}

export default function AppDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [release, setRelease] = useState(null);
  const [settings, setSettings] = useState({ enabled: true, delaySeconds: 10, ignoredNumbers: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [devicesRes, releaseRes] = await Promise.all([
        fetch("/api/admin/app-devices", { cache: "no-store" }),
        fetch("/api/admin/app-release", { cache: "no-store" }),
      ]);
      if (!devicesRes.ok) throw new Error();
      const data = await devicesRes.json();
      setDevices(data.devices || []);
      setSettings(data.settings || settings);
      setRelease(releaseRes.ok ? await releaseRes.json() : null);
    } catch {
      setError("Chargement impossible.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addDevice(e) {
    e.preventDefault();
    if (!newName.trim() || saving) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/app-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCreated(data);
      setNewName("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(patch) {
    setSaving(true); setError("");
    const next = { ...settings, ...patch };
    setSettings(next); // optimiste : l'interrupteur ne doit pas « sauter »
    try {
      const res = await fetch("/api/admin/app-devices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
    } catch (err) {
      setError(err.message);
      load(); // on revient a la verite du serveur
    } finally {
      setSaving(false);
    }
  }

  async function revoke(device) {
    if (!confirm(`Révoquer « ${device.name} »? L'app cessera immédiatement de fonctionner sur ce téléphone.`)) return;
    const res = await fetch(`/api/admin/app-devices/${device.id}`, { method: "DELETE" });
    if (!res.ok) { setError("Révocation impossible."); return; }
    load();
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="admin-text text-2xl font-bold">App Appels</h1>
        <p className="admin-text-muted text-sm mt-1">
          Téléphones des associés et comportement de l&apos;app. Ces réglages s&apos;appliquent sans
          réinstaller quoi que ce soit.
        </p>
      </div>

      {error && (
        <p className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-semibold">
          {error}
        </p>
      )}

      {/* Telechargement de l'app — premier geste sur un nouveau telephone, donc
          en haut. L'APK est servi par le serveur et non par GitHub : les
          artefacts d'un depot prive exigeraient un compte GitHub. */}
      <div className="admin-card border rounded-xl p-5 mb-6">
        <h2 className="admin-text font-bold mb-1">Installer l&apos;app</h2>
        {release?.available ? (
          <>
            <p className="admin-text-muted text-sm mb-4">
              Version {release.version} · {(release.sizeBytes / 1048576).toFixed(1)} Mo · déposée le{" "}
              {new Date(release.uploadedAt).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <a
              href="/api/admin/app-release?download=1"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold hover:opacity-90"
            >
              <i className="fas fa-download"></i>Télécharger l&apos;APK
            </a>
            <p className="admin-text-muted text-xs mt-3 leading-relaxed">
              À ouvrir <strong>depuis le téléphone</strong> (cette page, connecté à l&apos;admin).
              Android demandera d&apos;autoriser l&apos;installation depuis cette source, puis
              l&apos;app guidera les 4 étapes.
            </p>
          </>
        ) : (
          <p className="admin-text-muted text-sm">
            Aucune version déposée pour l&apos;instant. L&apos;APK arrive ici automatiquement
            à chaque compilation du dépôt <span className="font-mono">vosthermos-app</span>.
          </p>
        )}
      </div>

      {/* Code d'activation fraichement cree : affiche UNE fois, en gros. */}
      {created && (
        <div className="mb-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-5">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            Code d&apos;activation — {created.name}
          </p>
          <p className="admin-text text-4xl font-extrabold tracking-widest my-3 font-mono">
            {created.activationCode}
          </p>
          <p className="admin-text-muted text-sm">
            À saisir dans l&apos;app sur le téléphone. Valide 30 minutes, une seule fois.
          </p>
          <button onClick={() => setCreated(null)} className="mt-3 text-xs admin-text-muted hover:admin-text">
            J&apos;ai noté le code
          </button>
        </div>
      )}

      {/* Reglages appliques a distance */}
      <div className="admin-card border rounded-xl p-5 mb-6">
        <h2 className="admin-text font-bold mb-4">Comportement</h2>

        <label className="flex items-center justify-between gap-4 py-3 border-b admin-border cursor-pointer">
          <span>
            <span className="admin-text font-medium block">Ouverture automatique</span>
            <span className="admin-text-muted text-xs">
              Décoché, les téléphones n&apos;affichent plus rien pendant les appels.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => saveSettings({ enabled: e.target.checked })}
            className="h-6 w-6 accent-[var(--color-red)] shrink-0"
          />
        </label>

        <label className="flex items-center justify-between gap-4 py-3 border-b admin-border">
          <span>
            <span className="admin-text font-medium block">Délai avant affichage</span>
            <span className="admin-text-muted text-xs">
              Secondes après le décrochage. 0 = tout de suite.
            </span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            defaultValue={settings.delaySeconds}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => {
              const n = Number(String(e.target.value).replace(/\D/g, ""));
              if (Number.isFinite(n) && n !== settings.delaySeconds) saveSettings({ delaySeconds: n });
            }}
            className="admin-input border rounded-lg px-3 py-2 text-sm w-20 text-center shrink-0"
          />
        </label>

        <div className="py-3">
          <span className="admin-text font-medium block">Numéros à ignorer</span>
          <span className="admin-text-muted text-xs block mb-2">
            Un par ligne ou séparés par des virgules — vos numéros entre associés, par exemple.
          </span>
          <textarea
            rows={3}
            defaultValue={settings.ignoredNumbers}
            onBlur={(e) => {
              if (e.target.value !== settings.ignoredNumbers) saveSettings({ ignoredNumbers: e.target.value });
            }}
            placeholder="514-555-1234, 438-555-9876"
            className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Telephones */}
      <div className="admin-card border rounded-xl p-5">
        <h2 className="admin-text font-bold mb-4">Téléphones</h2>

        {loading ? (
          <p className="admin-text-muted text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</p>
        ) : devices.length === 0 ? (
          <p className="admin-text-muted text-sm mb-4">Aucun téléphone enregistré.</p>
        ) : (
          <div className="space-y-2 mb-5">
            {devices.map((d) => {
              const pending = !d.activatedAt && !d.revokedAt;
              return (
                <div key={d.id} className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${d.revokedAt ? "opacity-50 admin-border" : pending ? "border-amber-400/40 bg-amber-500/5" : "admin-border"}`}>
                  <div className="min-w-0">
                    <p className="admin-text font-semibold">{d.name}</p>
                    <p className="admin-text-muted text-xs mt-0.5">
                      {d.revokedAt
                        ? `Révoqué ${timeAgo(d.revokedAt)}`
                        : pending
                          ? `En attente d'activation — code ${d.activationCode || "expiré"}`
                          : `${d.model || d.platform}${d.appVersion ? ` · v${d.appVersion}` : ""} · vu ${timeAgo(d.lastSeenAt)}`}
                    </p>
                  </div>
                  {!d.revokedAt && (
                    <button
                      onClick={() => revoke(d)}
                      className="shrink-0 text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={addDevice} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex. Cellulaire d'Erik (Pixel 10)"
            className="admin-input border rounded-lg px-3 py-2.5 text-sm flex-1"
          />
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="px-4 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-40"
          >
            <i className="fas fa-plus mr-2"></i>Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
