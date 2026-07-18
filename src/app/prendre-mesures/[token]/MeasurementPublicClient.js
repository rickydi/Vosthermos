"use client";

import { useEffect, useState } from "react";
import MeasurementEditor from "@/components/measurements/MeasurementEditor";
import { normalizeMeasurementLocale } from "@/components/measurements/measurement-copy";

export default function MeasurementPublicClient({ token, language }) {
  const requestedLanguage = language ? normalizeMeasurementLocale(language) : null;
  const [currentLanguage, setCurrentLanguage] = useState(() => requestedLanguage || "fr");
  const isEnglish = currentLanguage === "en";
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const englishRequest = requestedLanguage === "en";
    const fallback = englishRequest ? "This link is invalid or expired." : "Ce lien est invalide ou expiré.";
    fetch(`/api/public/measurements/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(englishRequest ? fallback : body.error || fallback);
        const nextMeasurement = body.measurement || body;
        setMeasurement(nextMeasurement);
        setCurrentLanguage(requestedLanguage || normalizeMeasurementLocale(nextMeasurement?.data?.locale));
      })
      .catch((err) => setError(englishRequest ? fallback : err.message || fallback));
  }, [token, requestedLanguage]);

  return (
    <main className="min-h-dvh bg-[#f5efe6] text-[#132127]">
      <div className="max-w-[1200px] mx-auto">
        {error ? (
          <div className="m-4 rounded-2xl border border-red-400/30 bg-red-50 text-red-900 p-6"><h1 className="font-bold text-xl mb-2">{isEnglish ? "Link unavailable" : "Lien non disponible"}</h1><p>{error}</p><p className="text-sm opacity-70 mt-3">{isEnglish ? "Contact Vosthermos to receive a new link." : "Communiquez avec Vosthermos pour recevoir un nouveau lien."}</p></div>
        ) : !measurement ? (
          <div className="py-20 text-center text-[#65737b]"><i className="fas fa-spinner fa-spin text-2xl mb-3" /><p>{isEnglish ? "Opening your file…" : "Ouverture de votre dossier…"}</p></div>
        ) : measurement.status === "received" || measurement.status === "validated" ? (
          <div className="m-4 rounded-2xl border border-emerald-500/30 bg-emerald-50 text-emerald-900 p-8 text-center"><i className="fas fa-circle-check text-4xl mb-4" /><h1 className="font-bold text-2xl">{isEnglish ? "Measurements received" : "Mesures reçues"}</h1><p className="opacity-75 mt-2">{isEnglish ? "Our team can now prepare your quote." : "Notre équipe peut maintenant préparer votre soumission."}</p></div>
        ) : (
          <MeasurementEditor
            initialMeasurement={measurement}
            apiBase={`/api/public/measurements/${encodeURIComponent(token)}`}
            publicMode
            language={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onSaved={(next) => setMeasurement((old) => ({ ...old, ...next }))}
            onFinalized={(next) => setMeasurement((old) => ({ ...old, ...next }))}
          />
        )}
      </div>
    </main>
  );
}
