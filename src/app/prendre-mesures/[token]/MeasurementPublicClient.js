"use client";

import { useEffect, useState } from "react";
import MeasurementEditor from "@/components/measurements/MeasurementEditor";

export default function MeasurementPublicClient({ token }) {
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/measurements/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Ce lien est invalide ou expiré.");
        setMeasurement(body.measurement || body);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <main className="min-h-dvh bg-[#08111f] text-white px-3 py-5 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-red)] flex items-center justify-center font-black">VT</div>
          <div><p className="font-bold text-lg leading-tight">VosThermos</p><p className="text-white/45 text-xs">Mesures sécurisées de vos fenêtres</p></div>
        </header>
        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 text-red-100 p-6"><h1 className="font-bold text-xl mb-2">Lien non disponible</h1><p>{error}</p><p className="text-sm opacity-70 mt-3">Communiquez avec VosThermos pour recevoir un nouveau lien.</p></div>
        ) : !measurement ? (
          <div className="py-20 text-center text-white/50"><i className="fas fa-spinner fa-spin text-2xl mb-3" /><p>Ouverture de votre dossier…</p></div>
        ) : measurement.status === "received" || measurement.status === "validated" ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-100 p-8 text-center"><i className="fas fa-circle-check text-4xl mb-4" /><h1 className="font-bold text-2xl">Mesures reçues</h1><p className="opacity-75 mt-2">Notre équipe peut maintenant préparer votre soumission.</p></div>
        ) : (
          <MeasurementEditor
            initialMeasurement={measurement}
            apiBase={`/api/public/measurements/${encodeURIComponent(token)}`}
            publicMode
            onSaved={(next) => setMeasurement((old) => ({ ...old, ...next }))}
            onFinalized={(next) => setMeasurement((old) => ({ ...old, ...next }))}
          />
        )}
      </div>
    </main>
  );
}
