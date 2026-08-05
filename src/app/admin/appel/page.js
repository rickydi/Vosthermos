"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPhone } from "@/lib/phone";
import { APPEL_AUTO_PHOTO_SMS_KEY } from "@/lib/settings-keys";
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

// MEME liste que l'app mobile (ClientActivity/CallerActivity) : les deux se
// mettent a jour ensemble. Selection MULTIPLE : un client appelle souvent pour
// plusieurs choses a la fois (ex. thermos + calfeutrage).
const SERVICES = [
  { key: "Vitre thermos", icon: "fa-snowflake" },
  { key: "Porte-patio", icon: "fa-door-open" },
  { key: "Porte française", icon: "fa-door-closed" },
  { key: "Moustiquaire", icon: "fa-border-all" },
  { key: "Fenêtre", icon: "fa-window-maximize" },
  { key: "Calfeutrage", icon: "fa-fill-drip" },
  { key: "Bois", icon: "fa-tree" },
  { key: "Autre", icon: "fa-question" },
];

function AppelContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("appel");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  // Selection MULTIPLE de services (le corps de requete reste une chaine :
  // les choix sont joints par «, » a l enregistrement).
  const [selectedServices, setSelectedServices] = useState([]);
  const [address, setAddress] = useState("");
  const [addressParts, setAddressParts] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);
  const [today, setToday] = useState({ count: 0, calls: [] });
  // Reconnaissance de l'appelant (page ouverte par la macro du cellulaire).
  const [lookup, setLookup] = useState(null);   // null tant qu'on ne sait pas
  const [looking, setLooking] = useState(false);
  const [isClient, setIsClient] = useState(null); // null | true | false (numero inconnu)
  const [wantPhotoSms, setWantPhotoSms] = useState(false);
  // Date de l'appel : « maintenant » dans l'immense majorité des cas, mais
  // modifiable pour noter après coup un appel de la veille.
  const [calledDate, setCalledDate] = useState("");
  const [calledTime, setCalledTime] = useState("");
  const [editingDate, setEditingDate] = useState(false);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length === 10 || (phoneDigits.length === 11 && phoneDigits.startsWith("1"));

  const loadToday = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/appels");
      if (res.ok) setToday(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadToday(); }, [loadToday]);

  // Horodatage local posé au montage (jamais au SSR : évite tout écart
  // d'hydratation et respecte le fuseau du téléphone).
  useEffect(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    setCalledDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setCalledTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }, []);

  // Valeur par defaut de la demande de photos (Parametres > Appels).
  useEffect(() => {
    fetch(`/api/admin/settings?key=${APPEL_AUTO_PHOTO_SMS_KEY}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setWantPhotoSms(d?.value === "1"))
      .catch(() => {});
  }, []);

  // La macro du cellulaire ouvre /admin/appel?tel=5145551234 apres 10 s d'appel.
  // On identifie tout de suite l'appelant : un client connu n'a pas a etre
  // confirme, la question ne se pose que sur un vrai inconnu.
  useEffect(() => {
    const tel = searchParams.get("tel");
    if (!tel) return;
    const digits = tel.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) return;
    setPhone(formatPhone(digits) || digits);
    setLooking(true);
    fetch(`/api/admin/appels/lookup?tel=${digits}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setLookup(data);
        if (data?.known && data.client) {
          setIsClient(true);
          setName(data.client.contactName || data.client.name || "");
          if (data.client.address) setAddress(data.client.address);
          if (data.client.city) {
            setAddressParts({
              city: data.client.city,
              province: data.client.province || "",
              postalCode: data.client.postalCode || "",
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLooking(false));
  }, [searchParams]);

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
          service: selectedServices.join(", "),
          address,
          city: addressParts?.city || "",
          province: addressParts?.province || "",
          postalCode: addressParts?.postalCode || "",
          note,
          // Choix fait sur cette page : prime sur l'option globale.
          sendPhotoSms: wantPhotoSms,
          // Construit dans le fuseau du téléphone, envoyé en ISO.
          calledAt: calledDate && calledTime
            ? new Date(`${calledDate}T${calledTime}`).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      const todayStr = new Date().toISOString().slice(0, 10);
      setSaved({
        name: name.trim() || "Client (appel)",
        phone,
        existing: data.existing,
        photoSms: data.photoSms,
        // Sert a prevenir que l'appel n'apparaitra pas dans la liste du jour.
        backdated: calledDate && calledDate !== todayStr ? calledDate : null,
      });
      loadToday();
    } catch (e) {
      setError(e.message || "Erreur — réessayez");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setPhone(""); setName(""); setSelectedServices([]); setAddress(""); setAddressParts(null); setNote("");
    setError(""); setSaved(null);
    setLookup(null); setIsClient(null);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    setCalledDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setCalledTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    setEditingDate(false);
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
          tab === "notes" ? "bg-emerald-500/25 border-emerald-400 text-emerald-200" : "admin-card admin-text-muted"
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
        {saved.photoSms === "sent" && (
          <p className="text-sky-300 text-sm mb-2"><i className="fas fa-comment-sms mr-1"></i>Texto « envoyez-nous vos photos » parti au client.</p>
        )}
        {saved.photoSms === "failed" && (
          <p className="text-amber-300 text-sm mb-2"><i className="fas fa-triangle-exclamation mr-1"></i>Le texto photos n&apos;est pas parti.</p>
        )}
        {saved.backdated && (
          <p className="text-amber-300 text-sm mb-2">
            <i className="fas fa-clock mr-1"></i>
            Daté du {new Date(`${saved.backdated}T12:00`).toLocaleDateString("fr-CA", { day: "numeric", month: "long" })} —
            il n&apos;apparaîtra donc pas dans la liste « Aujourd&apos;hui ».
          </p>
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

  // Numéro inconnu apporté par la macro du cellulaire : on demande AVANT de
  // créer quoi que ce soit. Un « non » ne laisse aucune trace en base.
  if (lookup && !lookup.known && isClient === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        {tabBar}
        <div className="w-24 h-24 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center mb-6">
          <i className="fas fa-phone-volume text-4xl text-sky-300"></i>
        </div>
        <p className="admin-text-muted text-sm uppercase tracking-wider font-bold mb-1">Numéro inconnu</p>
        <p className="text-sky-300 text-3xl font-extrabold mb-2">{phone}</p>
        {lookup.conversation ? (
          <p className="admin-text-muted text-sm mb-6">
            Déjà vu dans le chat sous « {lookup.conversation.name || "sans nom"} », mais aucune fiche client.
          </p>
        ) : (
          <p className="admin-text-muted text-sm mb-6">Aucune fiche à ce numéro.</p>
        )}
        <h1 className="admin-text text-xl font-extrabold mb-6">Est-ce un client Vosthermos?</h1>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsClient(true)}
            className="h-20 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-xl font-bold transition-colors"
          >
            <i className="fas fa-check mr-2"></i>Oui
          </button>
          <button
            onClick={() => setIsClient(false)}
            className="h-20 rounded-2xl admin-card border admin-text text-xl font-bold transition-colors hover:bg-white/5"
          >
            <i className="fas fa-xmark mr-2"></i>Non
          </button>
        </div>
        <p className="admin-text-muted text-xs mt-4">« Non » ne crée aucune fiche et n&apos;envoie aucun texto.</p>
      </div>
    );
  }

  // « Non » : rien n'a été enregistré, on le dit et on s'arrête là.
  if (isClient === false) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        {tabBar}
        <div className="w-20 h-20 mx-auto rounded-full admin-card border flex items-center justify-center mb-5">
          <i className="fas fa-xmark text-3xl admin-text-muted"></i>
        </div>
        <h1 className="admin-text text-2xl font-extrabold mb-2">Appel ignoré</h1>
        <p className="admin-text-muted text-sm mb-8">{phone} — aucune fiche créée, aucun texto envoyé.</p>
        <button
          onClick={() => setIsClient(true)}
          className="w-full h-14 rounded-2xl admin-card border admin-text font-bold hover:bg-white/5 transition-colors mb-3"
        >
          <i className="fas fa-rotate-left mr-2"></i>Finalement, l&apos;enregistrer
        </button>
        <button
          onClick={resetForm}
          className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Nouvel appel
        </button>
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

      {looking && (
        <div className="mb-5 rounded-2xl admin-card border p-4 admin-text-muted text-sm">
          <i className="fas fa-spinner fa-spin mr-2"></i>Identification de l&apos;appelant…
        </div>
      )}

      {/* Client reconnu : on affiche qui appelle avant même de remplir quoi que
          ce soit. Avant, l'information n'arrivait qu'après l'enregistrement. */}
      {lookup?.known && lookup.client && (
        <div className="mb-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-emerald-300 text-[11px] font-bold uppercase tracking-wider">Client connu</p>
              <p className="admin-text text-lg font-extrabold truncate">{lookup.client.name}</p>
              {lookup.client.company && <p className="admin-text-muted text-xs">{lookup.client.company}</p>}
              <p className="admin-text-muted text-xs mt-1">
                {lookup.client.workOrderCount > 0
                  ? `${lookup.client.workOrderCount} bon${lookup.client.workOrderCount > 1 ? "s" : ""}`
                  : "aucun bon"}
                {lookup.client.city ? ` · ${lookup.client.city}` : ""}
                {lookup.client.clientSince ? ` · depuis ${new Date(lookup.client.clientSince).getFullYear()}` : ""}
              </p>
              {lookup.client.lastWorkOrder && (
                <p className="admin-text-muted text-xs mt-1 truncate">
                  Dernier : {lookup.client.lastWorkOrder.number}
                  {lookup.client.lastWorkOrder.date ? ` · ${new Date(lookup.client.lastWorkOrder.date).toLocaleDateString("fr-CA", { month: "short", year: "numeric" })}` : ""}
                </p>
              )}
            </div>
            <a
              href={`/admin/clients/${lookup.client.id}`}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <i className="fas fa-folder-open mr-1"></i>Fiche
            </a>
          </div>
        </div>
      )}

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
              onClick={() => setSelectedServices((prev) => (prev.includes(s.key) ? prev.filter((k) => k !== s.key) : [...prev, s.key]))}
              className={`h-14 rounded-2xl border text-base font-semibold transition-colors flex items-center justify-center gap-2 ${
                selectedServices.includes(s.key)
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

      {/* Date de l'appel : repliee par defaut (c'est « maintenant » 99 fois sur
          100), depliable pour noter apres coup l'appel de la veille. */}
      <div className="mb-5">
        {!editingDate ? (
          <button
            type="button"
            onClick={() => setEditingDate(true)}
            className="w-full flex items-center justify-between rounded-2xl admin-card border px-4 py-3 text-left hover:bg-white/5 transition-colors"
          >
            <span className="admin-text-muted text-sm">
              <i className="fas fa-clock mr-2 text-sky-300"></i>
              {calledDate
                ? new Date(`${calledDate}T${calledTime || "00:00"}`).toLocaleString("fr-CA", {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })
                : "Maintenant"}
            </span>
            <span className="text-sky-300 text-xs font-bold">Modifier</span>
          </button>
        ) : (
          <div className="rounded-2xl admin-card border p-4">
            <p className="admin-text font-bold text-sm mb-3">
              <i className="fas fa-clock mr-2 text-sky-300"></i>Date et heure de l&apos;appel
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={calledDate}
                onChange={(e) => setCalledDate(e.target.value)}
                className="h-14 px-3 rounded-xl admin-card border admin-text focus:outline-none focus:border-sky-400"
              />
              <input
                type="time"
                value={calledTime}
                onChange={(e) => setCalledTime(e.target.value)}
                className="h-14 px-3 rounded-xl admin-card border admin-text focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                setCalledDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
                setCalledTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                setEditingDate(false);
              }}
              className="mt-3 w-full h-11 rounded-xl admin-card border admin-text-muted text-sm font-bold hover:bg-white/5 transition-colors"
            >
              <i className="fas fa-rotate-left mr-2"></i>Remettre à maintenant
            </button>
          </div>
        )}
      </div>

      {/* Demande de photos : decide appel par appel. L'option globale
          (Parametres > Appels) ne sert plus que de valeur par defaut — elle
          envoyait un texto a TOUS les appelants, vendeurs compris. */}
      <div className="mb-5 rounded-2xl admin-card border p-4">
        <p className="admin-text font-bold text-sm mb-1">
          <i className="fas fa-camera mr-2 text-sky-300"></i>Demander ses photos par texto?
        </p>
        <p className="admin-text-muted text-xs mb-3">
          Lien valide 7 jours pour qu&apos;il photographie sa fenêtre ou sa porte.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWantPhotoSms(true)}
            className={`h-14 rounded-xl border font-bold transition-colors ${
              wantPhotoSms ? "bg-sky-600 border-sky-400 text-white" : "admin-card admin-border admin-text-muted hover:bg-white/5"
            }`}
          >
            <i className="fas fa-check mr-2"></i>Oui
          </button>
          <button
            type="button"
            onClick={() => setWantPhotoSms(false)}
            className={`h-14 rounded-xl border font-bold transition-colors ${
              !wantPhotoSms ? "bg-slate-600 border-slate-400 text-white" : "admin-card admin-border admin-text-muted hover:bg-white/5"
            }`}
          >
            <i className="fas fa-xmark mr-2"></i>Non
          </button>
        </div>
      </div>

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

// useSearchParams impose une frontiere Suspense (la page lit ?tel=... envoye
// par la macro du cellulaire).
export default function AppelPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center admin-text-muted"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</div>}>
      <AppelContent />
    </Suspense>
  );
}
