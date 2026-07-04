"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FILES = 10;

// Coquille plein écran de la page : bandeau Vosthermos + contenu. Le header,
// le footer et la bulle de chat du site sont masqués sur /envoyer-photos —
// le client arrive par texto/courriel, il ne doit voir que l'envoi de photos.
function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <header className="bg-[var(--color-teal-dark)] px-4 py-3 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Vos-Thermos-Logo_Blanc.png" alt="Vosthermos" className="h-14 w-auto" />
        <a href="tel:5148258411" className="inline-flex items-center gap-2 text-white text-sm font-bold">
          <span className="w-10 h-10 rounded-full bg-[var(--color-red)] flex items-center justify-center">
            <i className="fas fa-phone text-sm"></i>
          </span>
          <span className="hidden sm:inline">514-825-8411</span>
        </a>
      </header>
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 pb-14">{children}</main>
    </div>
  );
}

// Dépôt de photos par le client (lien reçu par texto ou courriel). Pensé « gros
// doigts sur téléphone » : une grosse zone, la caméra ou la galerie, envoyer, merci.
export default function UploadPhotos({ token }) {
  const [status, setStatus] = useState("loading"); // loading | ready | invalid
  const [clientName, setClientName] = useState("");
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs (même index que files)
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/public/photo-upload/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (d?.clientName) { setClientName(d.clientName); setStatus("ready"); }
        else setStatus("invalid");
      })
      .catch(() => { if (alive) setStatus("invalid"); });
    return () => { alive = false; };
  }, [token]);

  // Libère les object URLs quand ils ne sont plus affichés.
  useEffect(() => () => { previews.forEach((u) => URL.revokeObjectURL(u)); }, [previews]);

  function addFiles(list) {
    setError("");
    const incoming = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) return;
    const next = [...files, ...incoming].slice(0, MAX_FILES);
    setFiles(next);
    setPreviews((old) => {
      old.forEach((u) => URL.revokeObjectURL(u));
      return next.map((f) => URL.createObjectURL(f));
    });
  }

  function removeAt(i) {
    const nextFiles = files.filter((_, idx) => idx !== i);
    setFiles(nextFiles);
    setPreviews((old) => {
      old.forEach((u) => URL.revokeObjectURL(u));
      return nextFiles.map((f) => URL.createObjectURL(f));
    });
  }

  async function send() {
    if (!files.length || sending) return;
    setSending(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("photos", f));
      const res = await fetch(`/api/public/photo-upload/${token}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi — réessayez");
      setSentCount((n) => n + (data.saved || files.length));
      setFiles([]);
      setPreviews((old) => { old.forEach((u) => URL.revokeObjectURL(u)); return []; });
      if (inputRef.current) inputRef.current.value = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (status === "loading") {
    return (
      <Shell>
        <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement…
        </div>
      </Shell>
    );
  }

  if (status === "invalid") {
    return (
      <Shell>
        <div className="text-center pt-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
            <i className="fas fa-link-slash text-3xl text-[var(--color-red)]"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-teal)] mb-3">Lien invalide ou expiré</h1>
          <p className="text-gray-600 mb-8">
            Ce lien de dépôt de photos n&apos;est plus valide (il expire après 7 jours).
            Contactez-nous pour en recevoir un nouveau.
          </p>
          <a href="tel:5148258411" className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-red)] text-white text-lg font-bold">
            <i className="fas fa-phone"></i>514-825-8411
          </a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-teal)] flex items-center justify-center mb-4 shadow-lg">
          <i className="fas fa-camera text-2xl text-white"></i>
        </div>
        {clientName && (
          <p className="text-xl font-extrabold text-[var(--color-red)] mb-1.5">Bonjour {clientName} 👋</p>
        )}
        <h1 className="text-[26px] leading-tight font-extrabold text-[var(--color-teal)]">Envoyez-nous vos photos</h1>
        <p className="text-gray-600 mt-2 text-[15px] leading-relaxed">
          Prenez en photo votre fenêtre, porte ou thermos —
          vos photos arrivent directement dans votre dossier.
        </p>
      </div>

      {sentCount > 0 && (
        <div className="mb-5 px-4 py-4 rounded-2xl bg-green-50 border-2 border-green-300 text-green-800 text-center font-semibold shadow-sm">
          <i className="fas fa-circle-check mr-2"></i>
          {sentCount} photo{sentCount > 1 ? "s" : ""} envoyée{sentCount > 1 ? "s" : ""} — merci!
          <div className="text-sm font-normal mt-1">Vous pouvez en envoyer d&apos;autres ci-dessous.</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-3xl border-2 border-dashed border-[var(--color-teal)]/35 bg-white active:scale-[0.99] transition-transform flex flex-col items-center justify-center gap-2.5 py-10 px-4 text-[var(--color-teal)] shadow-sm"
      >
        <span className="w-14 h-14 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center">
          <i className="fas fa-camera text-2xl"></i>
        </span>
        <span className="font-extrabold text-lg">Prendre ou choisir des photos</span>
        <span className="text-[13px] text-gray-500">Jusqu&apos;à {MAX_FILES} photos · 25 MB max chacune</span>
      </button>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {previews.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Retirer cette photo"
                className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-black/65 text-white text-sm flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-300 text-red-700 font-semibold text-sm">{error}</p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={!files.length || sending}
        className="mt-5 w-full h-16 rounded-2xl bg-[var(--color-red)] text-white text-xl font-extrabold disabled:opacity-35 shadow-lg shadow-red-500/20 active:scale-[0.99] transition-transform"
      >
        {sending ? (
          <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi en cours…</>
        ) : (
          <><i className="fas fa-paper-plane mr-2"></i>Envoyer {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""}` : "les photos"}</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-5">
        Lien sécurisé valide 7 jours · Vosthermos · <a href="tel:5148258411" className="underline">514-825-8411</a>
      </p>
    </Shell>
  );
}
