"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FILES = 10;

// Dépôt de photos par le client (lien reçu par texto). Pensé « gros doigts sur
// téléphone » : une grosse zone, la caméra ou la galerie, envoyer, merci.
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
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        <i className="fas fa-spinner fa-spin mr-2"></i>Chargement…
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
          <i className="fas fa-link-slash text-3xl text-[var(--color-red)]"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--color-teal)] mb-3">Lien invalide ou expiré</h1>
        <p className="text-gray-600 mb-8">
          Ce lien de dépôt de photos n&apos;est plus valide (il expire après 7 jours).
          Contactez-nous pour en recevoir un nouveau.
        </p>
        <a href="tel:5148258411" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-red)] text-white font-bold">
          <i className="fas fa-phone"></i>514-825-8411
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 pb-20">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-teal)] flex items-center justify-center mb-4">
          <i className="fas fa-camera text-2xl text-white"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--color-teal)]">Envoyez-nous vos photos</h1>
        <p className="text-gray-600 mt-2">
          Bonjour {clientName}! Prenez en photo votre fenêtre, porte ou thermos —
          vos photos arrivent directement dans votre dossier chez Vosthermos.
        </p>
      </div>

      {sentCount > 0 && (
        <div className="mb-6 px-4 py-4 rounded-2xl bg-green-50 border border-green-300 text-green-800 text-center font-semibold">
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
        className="w-full min-h-32 rounded-2xl border-2 border-dashed border-[var(--color-teal)]/40 bg-white hover:border-[var(--color-teal)] transition-colors flex flex-col items-center justify-center gap-2 py-6 text-[var(--color-teal)]"
      >
        <i className="fas fa-camera text-3xl"></i>
        <span className="font-bold text-lg">Prendre ou choisir des photos</span>
        <span className="text-sm text-gray-500">Jusqu&apos;à {MAX_FILES} photos (8 MB max chacune)</span>
      </button>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {previews.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Retirer cette photo"
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-300 text-red-700 font-semibold text-sm">{error}</p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={!files.length || sending}
        className="mt-6 w-full h-16 rounded-2xl bg-[var(--color-red)] text-white text-xl font-bold disabled:opacity-40 transition-opacity"
      >
        {sending ? (
          <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi en cours…</>
        ) : (
          <><i className="fas fa-paper-plane mr-2"></i>Envoyer {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""}` : "les photos"}</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Lien sécurisé valide 7 jours · Vosthermos · 514-825-8411
      </p>
    </div>
  );
}
