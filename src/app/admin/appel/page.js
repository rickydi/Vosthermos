"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPhone } from "@/lib/phone";
import AddressAutocomplete from "@/components/AddressAutocomplete";

// Formate le numéro pendant la frappe : 5145551234 -> 514-555-1234.
function formatPhoneInput(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length > 6) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}

// Bloc-notes partagé : une grande zone de texte qui s'enregistre toute seule,
// comme un calepin papier à côté du téléphone.
function BlocNotes() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("chargement"); // chargement | pret | modif | sauvegarde | erreur
  const [meta, setMeta] = useState(null);
  const timerRef = useRef(null);
  const textRef = useRef("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/notes");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setText(data.text || "");
        textRef.current = data.text || "";
        setMeta(data.updatedAt ? { at: data.updatedAt, by: data.updatedBy } : null);
        setStatus("pret");
      } catch {
        setStatus("erreur");
      }
    })();
    return () => clearTimeout(timerRef.current);
  }, []);

  async function persist(value) {
    setStatus("sauvegarde");
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMeta({ at: data.updatedAt, by: data.updatedBy });
      // Si l'utilisateur a retapé pendant la sauvegarde, on garde l'état "modif".
      setStatus(textRef.current === value ? "pret" : "modif");
    } catch {
      setStatus("erreur");
    }
  }

  function onChange(e) {
    const value = e.target.value;
    setText(value);
    textRef.current = value;
    setStatus("modif");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(value), 900);
  }

  const statusLabel = {
    chargement: "Chargement…",
    pret: meta ? `Enregistré ✓ (${new Date(meta.at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })})` : "Prêt",
    modif: "Écriture…",
    sauvegarde: "Enregistrement…",
    erreur: "⚠ Erreur — retapez ou rechargez la page",
  }[status];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Bloc-notes partagé</span>
        <span className={`text-xs font-semibold ${status === "erreur" ? "text-red-400" : status === "pret" ? "text-green-400" : "admin-text-muted"}`}>
          {statusLabel}
        </span>
      </div>
      <textarea
        value={text}
        onChange={onChange}
        disabled={status === "chargement"}
        placeholder={"Écris ici comme sur un calepin…\n\nEx. : M. Tremblay rappelle jeudi — 2 thermos 24x36 — Longueuil"}
        className="w-full min-h-[60vh] px-4 py-4 rounded-2xl admin-card border text-lg leading-relaxed admin-text focus:outline-none focus:border-sky-400 resize-none"
      />
      <p className="admin-text-muted text-xs mt-2">
        S&apos;enregistre tout seul pendant que tu écris. Visible par toute l&apos;équipe.
      </p>
    </div>
  );
}

const SERVICES = [
  { key: "Vitre thermos", icon: "fa-snowflake" },
  { key: "Porte-patio", icon: "fa-door-open" },
  { key: "Moustiquaire", icon: "fa-border-all" },
  { key: "Fenêtre", icon: "fa-window-maximize" },
  { key: "Calfeutrage", icon: "fa-fill-drip" },
  { key: "Autre", icon: "fa-question" },
];

export default function AppelPage() {
  const [tab, setTab] = useState("appel");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [address, setAddress] = useState("");
  const [addressParts, setAddressParts] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);
  const [today, setToday] = useState({ count: 0, calls: [] });

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length === 10 || (phoneDigits.length === 11 && phoneDigits.startsWith("1"));

  const loadToday = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/appels");
      if (res.ok) setToday(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadToday(); }, [loadToday]);

  async function save() {
    if (!phoneOk || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/appels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          service,
          address,
          city: addressParts?.city || "",
          province: addressParts?.province || "",
          postalCode: addressParts?.postalCode || "",
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSaved({ name: name.trim() || "Client (appel)", phone, existing: data.existing });
      loadToday();
    } catch (e) {
      setError(e.message || "Erreur — réessayez");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setPhone(""); setName(""); setService(""); setAddress(""); setAddressParts(null); setNote("");
    setError(""); setSaved(null);
  }

  const tabBar = (
    <div className="grid grid-cols-2 gap-2 mb-6">
      <button
        type="button"
        onClick={() => setTab("appel")}
        className={`h-14 rounded-2xl border text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
          tab === "appel" ? "bg-sky-500/25 border-sky-400 text-sky-200" : "admin-card admin-text-muted"
        }`}
      >
        <i className="fas fa-phone text-sm"></i>Appel
      </button>
      <button
        type="button"
        onClick={() => setTab("notes")}
        className={`h-14 rounded-2xl border text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
          tab === "notes" ? "bg-amber-500/25 border-amber-400 text-amber-200" : "admin-card admin-text-muted"
        }`}
      >
        <i className="fas fa-sticky-note text-sm"></i>Bloc-notes
      </button>
    </div>
  );

  // Onglet bloc-notes : son calepin à côté du téléphone.
  if (tab === "notes") {
    return (
      <div className="max-w-md mx-auto px-4 pb-16">
        {tabBar}
        <BlocNotes />
      </div>
    );
  }

  // Écran de confirmation plein format — impossible à manquer.
  if (saved) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        {tabBar}
        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <i className="fas fa-check text-5xl text-green-400"></i>
        </div>
        <h1 className="admin-text text-3xl font-extrabold mb-2">Appel enregistré!</h1>
        <p className="admin-text-muted text-lg mb-1">{saved.name}</p>
        <p className="text-blue-400 text-xl font-semibold mb-2">{formatPhone(saved.phone)}</p>
        {saved.existing && (
          <p className="text-amber-300 text-sm mb-2">Ce client existait déjà — l&apos;appel a été ajouté à son dossier.</p>
        )}
        <p className="admin-text-muted text-sm mb-8">Il apparaît maintenant dans le chat et le suivi.</p>
        <button
          onClick={resetForm}
          className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-xl font-bold transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Nouvel appel
        </button>
        <p className="admin-text-muted text-sm mt-6">{today.count} appel{today.count > 1 ? "s" : ""} enregistré{today.count > 1 ? "s" : ""} aujourd&apos;hui</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-16">
      {tabBar}
      <div className="mb-6">
        <h1 className="admin-text text-2xl font-extrabold flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
            <i className="fas fa-phone"></i>
          </span>
          Enregistrer un appel
        </h1>
        <p className="admin-text-muted text-sm mt-1">Le numéro suffit — le reste est optionnel.</p>
      </div>

      {/* Téléphone — le seul champ obligatoire */}
      <label className="block mb-5">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Téléphone *</span>
        <input
          type="tel"
          inputMode="tel"
          autoFocus
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          placeholder="514-555-1234"
          className={`mt-1.5 w-full h-16 px-4 rounded-2xl admin-card border text-2xl font-semibold tracking-wide admin-text focus:outline-none ${phone && !phoneOk ? "border-red-500" : "focus:border-sky-400"}`}
        />
        {phone && !phoneOk && <span className="text-red-400 text-sm">10 chiffres requis</span>}
      </label>

      <label className="block mb-5">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Nom</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du client"
          className="mt-1.5 w-full h-14 px-4 rounded-2xl admin-card border text-xl admin-text focus:outline-none focus:border-sky-400"
        />
      </label>

      <div className="mb-5">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Il appelle pour…</span>
        <div className="grid grid-cols-2 gap-2.5 mt-1.5">
          {SERVICES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setService(service === s.key ? "" : s.key)}
              className={`h-14 rounded-2xl border text-base font-semibold transition-colors flex items-center justify-center gap-2 ${
                service === s.key
                  ? "bg-sky-500/25 border-sky-400 text-sky-200"
                  : "admin-card admin-text-muted"
              }`}
            >
              <i className={`fas ${s.icon} text-sm`}></i>
              {s.key}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Adresse</span>
        <AddressAutocomplete
          value={address}
          onChange={(v) => { setAddress(v); setAddressParts(null); }}
          onSelect={(a) => {
            setAddress(a.formattedAddress || a.address || "");
            setAddressParts(a);
          }}
          placeholder="Commencez à taper l'adresse…"
          className="mt-1.5"
          inputClassName="w-full h-12 px-4 rounded-2xl admin-card border text-lg admin-text focus:outline-none focus:border-sky-400"
        />
      </div>

      <label className="block mb-6">
        <span className="admin-text-muted text-xs font-bold uppercase tracking-wider">Note</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Ce qu'il demande… (optionnel)"
          className="mt-1.5 w-full px-4 py-3 rounded-2xl admin-card border text-lg admin-text focus:outline-none focus:border-sky-400 resize-none"
        />
      </label>

      {error && (
        <p className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-semibold">
          {error}
        </p>
      )}

      <button
        onClick={save}
        disabled={!phoneOk || saving}
        className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xl font-bold transition-colors"
      >
        {saving ? (
          <><i className="fas fa-spinner fa-spin mr-2"></i>Enregistrement…</>
        ) : (
          <><i className="fas fa-check mr-2"></i>Enregistrer l&apos;appel</>
        )}
      </button>

      {/* Appels du jour */}
      <div className="mt-10">
        <h2 className="admin-text font-bold mb-3">
          Aujourd&apos;hui
          <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-sm">{today.count}</span>
        </h2>
        {today.calls.length === 0 ? (
          <p className="admin-text-muted text-sm">Aucun appel enregistré aujourd&apos;hui.</p>
        ) : (
          <div className="space-y-2">
            {today.calls.map((c) => (
              <div key={c.id} className="admin-card border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="admin-text font-semibold truncate">{c.name}</p>
                  <p className="text-blue-400 text-sm">{formatPhone(c.phone)}</p>
                </div>
                <span className="admin-text-muted text-sm shrink-0">
                  {new Date(c.at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
