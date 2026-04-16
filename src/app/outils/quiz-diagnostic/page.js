"use client";

import { useState } from "react";
import Link from "next/link";

const WEBAPP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Quiz diagnostic portes et fenetres - Vosthermos",
  description: "Quiz gratuit pour diagnostiquer le probleme de votre fenetre ou porte et obtenir une recommandation de reparation.",
  url: "https://www.vosthermos.com/outils/quiz-diagnostic",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  provider: { "@type": "Organization", name: "Vosthermos", url: "https://www.vosthermos.com" },
};

const QUESTIONS = [
  {
    key: "type",
    q: "De quel type d'ouverture s'agit-il?",
    options: [
      { label: "Fenetre", value: "fenetre" },
      { label: "Porte-patio coulissante", value: "patio" },
      { label: "Porte-fenetre a battant", value: "porte-fenetre" },
      { label: "Porte d'entree en bois", value: "bois" },
      { label: "Moustiquaire", value: "moustiquaire" },
    ],
  },
  {
    key: "symptom",
    q: "Quel est le principal symptome?",
    options: [
      { label: "Buee ou condensation entre les vitres", value: "buee permanente condensation entre vitres" },
      { label: "Difficile a ouvrir/fermer ou glisse mal", value: "glisse difficilement bloque roulette usee" },
      { label: "Courant d'air, perte de chaleur", value: "air froid coupe-froid use fenetre siffle" },
      { label: "Infiltration d'eau autour du cadre", value: "eau autour fenetre moisissure joint fissure" },
      { label: "Poignee, serrure ou mecanisme brise", value: "poignee cassee serrure coincee manivelle" },
      { label: "Bois pourri ou peinture ecaillee", value: "bois pourri peinture ecaillee porte gonflee" },
      { label: "Moustiquaire dechiree ou cadre tordu", value: "moustiquaire dechiree cadre tordu toile brisee" },
    ],
  },
  {
    key: "age",
    q: "Quel age a l'ouverture approximativement?",
    options: [
      { label: "Moins de 10 ans", value: "5" },
      { label: "10-20 ans", value: "15" },
      { label: "20-30 ans", value: "25" },
      { label: "Plus de 30 ans", value: "35" },
    ],
  },
];

export default function QuizDiagnosticPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(finalAnswers) {
    setLoading(true);
    try {
      const description = `${finalAnswers.type || ""} ${finalAnswers.symptom || ""}`.trim();
      const res = await fetch(`/api/public/calculate?type=diagnose&description=${encodeURIComponent(description)}`);
      const data = await res.json();
      setResult(data);
    } catch {}
    setLoading(false);
  }

  function selectAnswer(value) {
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.key]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submit(newAnswers);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSON_LD) }} />

      <div className="bg-[var(--color-teal-dark)] text-white py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <Link href="/outils" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
            <i className="fas fa-arrow-left"></i> Retour aux outils
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Quiz de diagnostic</h1>
          <p className="text-white/70">Identifiez le probleme de votre fenetre ou porte en 3 questions. Resultat instantane avec recommandation de service.</p>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-6 py-12">
        {!result ? (
          <div className="bg-white rounded-xl p-8 border border-[var(--color-border)]">
            {/* Progress */}
            <div className="flex gap-2 mb-6">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= step ? "bg-[var(--color-red)]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase mb-2">
              Question {step + 1} / {QUESTIONS.length}
            </p>
            <h2 className="text-xl font-bold mb-6">{QUESTIONS[step].q}</h2>

            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(opt.value)}
                  className="w-full text-left px-5 py-4 border-2 border-[var(--color-border)] rounded-lg hover:border-[var(--color-red)] hover:bg-red-50 transition-colors"
                >
                  <span className="font-medium text-[var(--color-text)]">{opt.label}</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)]"
              >
                <i className="fas fa-arrow-left mr-1"></i>Question precedente
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-[var(--color-red)]"></i>
            <p className="mt-4 text-[var(--color-text-muted)]">Analyse en cours...</p>
          </div>
        ) : result.match ? (
          <div className="bg-white rounded-xl p-8 border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase mb-2">Diagnostic</p>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {result.primaryDiagnosis.name}
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-red-700 uppercase font-semibold">Service recommande</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  result.primaryDiagnosis.urgency === "haute" ? "bg-red-200 text-red-900" :
                  result.primaryDiagnosis.urgency === "moyenne" ? "bg-yellow-200 text-yellow-900" :
                  "bg-green-200 text-green-900"
                }`}>
                  Urgence {result.primaryDiagnosis.urgency}
                </span>
              </div>
              <p className="text-lg font-bold text-red-900">
                Prix estime: {result.primaryDiagnosis.estimatedPriceRange}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href={result.primaryDiagnosis.serviceUrl.replace("https://www.vosthermos.com", "")}
                className="flex-1 text-center py-3 bg-[var(--color-red)] text-white rounded-lg font-semibold hover:opacity-90"
              >
                Voir le service
              </Link>
              <Link
                href="/rendez-vous"
                className="flex-1 text-center py-3 border-2 border-[var(--color-red)] text-[var(--color-red)] rounded-lg font-semibold hover:bg-red-50"
              >
                Prendre RDV
              </Link>
            </div>

            {result.alternativeDiagnoses?.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase mb-2">
                  Autres diagnostics possibles
                </p>
                <div className="space-y-2">
                  {result.alternativeDiagnoses.map((alt) => (
                    <Link
                      key={alt.id}
                      href={alt.serviceUrl.replace("https://www.vosthermos.com", "")}
                      className="block p-3 border border-[var(--color-border)] rounded-lg text-sm hover:border-[var(--color-red)]"
                    >
                      {alt.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={restart}
              className="mt-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)]"
            >
              <i className="fas fa-redo mr-1"></i>Refaire le quiz
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-[var(--color-border)] text-center">
            <i className="fas fa-search text-4xl text-[var(--color-text-muted)] mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Diagnostic incertain</h2>
            <p className="text-[var(--color-text-muted)] mb-6">{result.message}</p>
            <Link href="/rendez-vous" className="inline-block px-6 py-3 bg-[var(--color-red)] text-white rounded-lg font-semibold">
              Reservez un diagnostic gratuit
            </Link>
            <div className="mt-4">
              <button onClick={restart} className="text-sm text-[var(--color-text-muted)]">
                <i className="fas fa-redo mr-1"></i>Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
