"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const questions = [
  {
    id: "buee",
    question: "Voyez-vous de la buee entre les deux vitres?",
    icon: "fas fa-cloud",
    options: [
      { label: "Oui, buee permanente", score: 3 },
      { label: "Oui, parfois", score: 2 },
      { label: "Non", score: 0 },
    ],
  },
  {
    id: "age",
    question: "Quel age ont vos fenetres?",
    icon: "fas fa-calendar",
    options: [
      { label: "Moins de 10 ans", score: 0 },
      { label: "10-20 ans", score: 2 },
      { label: "20-30 ans", score: 3 },
      { label: "Plus de 30 ans", score: 4 },
    ],
  },
  {
    id: "courant",
    question: "Ressentez-vous un courant d'air froid pres de la fenetre?",
    icon: "fas fa-wind",
    options: [
      { label: "Oui, tres froid", score: 3 },
      { label: "Un peu", score: 1 },
      { label: "Non", score: 0 },
    ],
  },
  {
    id: "depots",
    question:
      "Voyez-vous des depots blanchatres ou des taches entre les vitres?",
    icon: "fas fa-smog",
    options: [
      { label: "Oui", score: 3 },
      { label: "Non", score: 0 },
    ],
  },
  {
    id: "mecanique",
    question: "La fenetre est-elle difficile a ouvrir ou fermer?",
    icon: "fas fa-lock",
    options: [
      { label: "Oui, tres difficile", score: 2 },
      { label: "Un peu grippee", score: 1 },
      { label: "Non, fonctionne bien", score: 0 },
    ],
  },
  {
    id: "quantite",
    question: "Combien de fenetres ont ces problemes?",
    icon: "fas fa-th-large",
    options: [
      { label: "1-2 fenetres", score: 0, info: "1-2" },
      { label: "3-5 fenetres", score: 0, info: "3-5" },
      { label: "6-10 fenetres", score: 0, info: "6-10" },
      { label: "Plus de 10", score: 0, info: "10+" },
    ],
  },
];

const priceRanges = {
  "1-2": "150$ - 450$ par unite",
  "3-5": "450$ - 1 800$ (rabais volume)",
  "6-10": "900$ - 3 200$ (rabais volume)",
  "10+": "Sur estimation — contactez-nous",
};

const energySavings = {
  "1-2": "5% - 10%",
  "3-5": "10% - 20%",
  "6-10": "20% - 35%",
  "10+": "30% - 50%",
};

function getResult(totalScore, windowCount) {
  if (totalScore <= 3) {
    return {
      level: "bon",
      title: "Vos fenetres sont en bon etat",
      color: "bg-green-500",
      colorLight: "bg-green-50",
      colorText: "text-green-700",
      colorBorder: "border-green-200",
      icon: "fas fa-check-circle",
      message:
        "Aucun signe de defaillance majeure detecte. Continuez l'entretien preventif pour maximiser la duree de vie de vos thermos.",
      cta: "blog",
    };
  }
  if (totalScore <= 7) {
    return {
      level: "usure",
      title: "Signes d'usure - surveillance recommandee",
      color: "bg-orange-500",
      colorLight: "bg-orange-50",
      colorText: "text-orange-700",
      colorBorder: "border-orange-200",
      icon: "fas fa-exclamation-triangle",
      message:
        "Quelques signes d'usure detectes. Un remplacement pourrait etre necessaire dans les 1-3 prochaines annees. Une inspection permettra de confirmer l'etat reel de vos thermos.",
      cta: "inspection",
    };
  }
  if (totalScore <= 12) {
    return {
      level: "remplacement",
      title: "Remplacement recommande",
      color: "bg-red-500",
      colorLight: "bg-red-50",
      colorText: "text-red-700",
      colorBorder: "border-red-200",
      icon: "fas fa-tools",
      message:
        "Vos thermos montrent des signes clairs de defaillance. Un remplacement ameliorera votre confort et reduira vos couts de chauffage de facon significative.",
      cta: "soumission",
    };
  }
  return {
    level: "urgent",
    title: "Remplacement urgent",
    color: "bg-red-800",
    colorLight: "bg-red-100",
    colorText: "text-red-900",
    colorBorder: "border-red-300",
    icon: "fas fa-exclamation-circle",
    message:
      "Vos fenetres sont en fin de vie. Le remplacement est urgent pour eviter les infiltrations d'eau et les pertes d'energie importantes. Chaque jour de delai augmente vos couts de chauffage.",
    cta: "appel",
  };
}

export default function DiagnosticTool() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [animating, setAnimating] = useState(false);

  const totalSteps = questions.length;
  const showResult = currentStep >= totalSteps;

  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const windowCount = answers[5]?.info || "1-2";
  const result = showResult ? getResult(totalScore, windowCount) : null;

  const selectOption = useCallback(
    (option) => {
      if (animating) return;
      setAnimating(true);

      const newAnswers = [...answers, option];
      setAnswers(newAnswers);

      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setCurrentStep(totalSteps);
        }
        setAnimating(false);
      }, 300);
    },
    [answers, currentStep, totalSteps, animating]
  );

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, answers]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setAnimating(false);
  }, []);

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Progress Bar */}
      {!showResult && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)] mb-3">
            <span className="font-semibold">
              Question {currentStep + 1} sur {totalSteps}
            </span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      {!showResult && (
        <div
          className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
        >
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-[var(--color-border)]">
            {/* Question Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                <i
                  className={`${questions[currentStep].icon} text-xl text-[var(--color-teal)]`}
                ></i>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[var(--color-foreground)]">
                {questions[currentStep].question}
              </h2>
            </div>

            {/* Answer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[currentStep].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(option)}
                  className="group relative text-left p-5 bg-[var(--color-background)] rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--color-teal)] hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border)] group-hover:bg-[var(--color-teal)] group-hover:border-[var(--color-teal)] flex items-center justify-center transition-all duration-200 flex-shrink-0">
                      <i className="fas fa-check text-sm text-transparent group-hover:text-white transition-colors duration-200"></i>
                    </div>
                    <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-teal)] transition-colors duration-200">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Back Button */}
            {currentStep > 0 && (
              <button
                onClick={goBack}
                className="mt-6 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i> Question precedente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {showResult && result && (
        <div className="space-y-6 transition-all duration-500 opacity-100">
          {/* Score Badge */}
          <div
            className={`${result.colorLight} rounded-2xl p-8 md:p-10 border ${result.colorBorder}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full ${result.color} flex items-center justify-center`}
              >
                <i className={`${result.icon} text-white text-lg`}></i>
              </div>
              <div>
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${result.colorText}`}
                >
                  Score: {totalScore}/16
                </span>
              </div>
            </div>

            <h2
              className={`text-2xl md:text-3xl font-extrabold mb-4 ${result.colorText}`}
            >
              {result.title}
            </h2>

            <p className="text-[var(--color-foreground)] leading-relaxed text-lg mb-6">
              {result.message}
            </p>

            {/* Price Estimate */}
            {(result.level === "remplacement" || result.level === "urgent") && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-foreground)] mb-4">
                  <i className="fas fa-calculator text-[var(--color-teal)] mr-2"></i>
                  Estimation pour {windowCount === "10+" ? "10+" : windowCount}{" "}
                  fenetre{windowCount !== "1-2" ? "s" : "(s)"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--color-background)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-muted)] mb-1">
                      Cout estime
                    </p>
                    <p className="text-xl font-extrabold text-[var(--color-foreground)]">
                      {priceRanges[windowCount]}
                    </p>
                  </div>
                  <div className="bg-[var(--color-background)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-muted)] mb-1">
                      Economie d&apos;energie estimee
                    </p>
                    <p className="text-xl font-extrabold text-green-600">
                      {energySavings[windowCount]}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      sur votre facture de chauffage
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Estimate for usure level */}
            {result.level === "usure" && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-foreground)] mb-3">
                  <i className="fas fa-info-circle text-orange-500 mr-2"></i>
                  Bon a savoir
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                  En faisant inspecter vos fenetres maintenant, vous pouvez
                  planifier les travaux au moment qui vous convient et profiter
                  de meilleurs prix. Une fenetre qui attend trop se deteriore
                  plus vite.
                </p>
              </div>
            )}

            {/* Energy Savings for bon level */}
            {result.level === "bon" && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-foreground)] mb-3">
                  <i className="fas fa-leaf text-green-500 mr-2"></i>
                  Conseils d&apos;entretien
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1 flex-shrink-0"></i>
                    Nettoyez les rails et les coupe-froid chaque printemps
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1 flex-shrink-0"></i>
                    Verifiez le calfeutrage exterieur annuellement
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1 flex-shrink-0"></i>
                    Lubrifiez les mecanismes d&apos;ouverture une fois par an
                  </li>
                </ul>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {result.cta === "appel" && (
                <>
                  <a
                    href="tel:15148258411"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg flex-1"
                  >
                    <i className="fas fa-phone"></i> Appelez maintenant
                  </a>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-teal-dark)] transition-all flex-1"
                  >
                    Soumission gratuite
                  </Link>
                </>
              )}
              {result.cta === "soumission" && (
                <>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg flex-1"
                  >
                    Obtenir une soumission gratuite
                  </Link>
                  <a
                    href="tel:15148258411"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-teal-dark)] transition-all flex-1"
                  >
                    <i className="fas fa-phone"></i> 514-825-8411
                  </a>
                </>
              )}
              {result.cta === "inspection" && (
                <>
                  <Link
                    href="/rendez-vous"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg flex-1"
                  >
                    <i className="fas fa-calendar-alt mr-1"></i> Planifier une
                    inspection gratuite
                  </Link>
                  <a
                    href="tel:15148258411"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-teal-dark)] transition-all flex-1"
                  >
                    <i className="fas fa-phone"></i> 514-825-8411
                  </a>
                </>
              )}
              {result.cta === "blog" && (
                <>
                  <Link
                    href="/services/remplacement-vitre-thermos"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-teal-dark)] transition-all flex-1"
                  >
                    <i className="fas fa-book mr-1"></i> Guide d&apos;entretien
                  </Link>
                  <Link
                    href="/prix"
                    className="inline-flex items-center justify-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-teal)] border border-[var(--color-border)] hover:border-[var(--color-teal)]/30 px-8 py-4 rounded-full font-bold transition-all flex-1"
                  >
                    Voir nos prix
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Recommencer */}
          <div className="text-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm font-semibold transition-colors"
            >
              <i className="fas fa-redo"></i> Recommencer le diagnostic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
