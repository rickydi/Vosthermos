"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    question: "What type of opening has a problem?",
    options: [
      { label: "Window", icon: "fas fa-th-large", value: "fenetre" },
      { label: "Patio door", icon: "fas fa-door-open", value: "porte-patio" },
      { label: "Entry door", icon: "fas fa-door-closed", value: "porte-entree" },
      { label: "Screen", icon: "fas fa-border-all", value: "moustiquaire" },
    ],
  },
  {
    question: "What is the main symptom?",
    optionsMap: {
      fenetre: [
        { label: "Fog or condensation between the panes", icon: "fas fa-cloud", value: "buee" },
        { label: "Draft or whistling", icon: "fas fa-wind", value: "courant-air" },
        { label: "Hard to open or close", icon: "fas fa-lock", value: "mecanique" },
        { label: "Cracked or broken glass", icon: "fas fa-exclamation-triangle", value: "brise" },
        { label: "Frost or ice in winter", icon: "fas fa-snowflake", value: "givre" },
        { label: "Outside noise coming through", icon: "fas fa-volume-up", value: "bruit" },
        { label: "Damaged wood frame", icon: "fas fa-tree", value: "bois" },
        { label: "Water infiltration", icon: "fas fa-water", value: "eau" },
      ],
      "porte-patio": [
        { label: "Stuck or slides poorly", icon: "fas fa-arrows-alt-h", value: "coince" },
        { label: "Lock or handle broken", icon: "fas fa-key", value: "serrure" },
        { label: "Lets cold air through", icon: "fas fa-wind", value: "air-froid" },
        { label: "Foggy glass", icon: "fas fa-cloud", value: "buee-patio" },
      ],
      "porte-entree": [
        { label: "Door sticks or rubs", icon: "fas fa-compress-alt", value: "colle" },
        { label: "Rotted wood at the bottom", icon: "fas fa-bug", value: "pourri" },
        { label: "Foggy or broken glass insert", icon: "fas fa-th-large", value: "vitrage" },
        { label: "Hard to close in winter", icon: "fas fa-snowflake", value: "hiver" },
      ],
      moustiquaire: [
        { label: "Torn or ripped mesh", icon: "fas fa-cut", value: "dechiree" },
        { label: "Won't stay in place", icon: "fas fa-arrow-down", value: "tombe" },
        { label: "Bent or twisted frame", icon: "fas fa-compress-alt", value: "tordu" },
      ],
    },
  },
];

const results = {
  "fenetre-buee": { title: "Defective sealed unit", desc: "The seal on your thermal unit is broken. The fog will not go away on its own.", problem: "fenetre-embuee", service: "remplacement-vitre-thermos", pricing: "remplacement-thermos", cost: "$150 - $350", urgency: "modere" },
  "fenetre-courant-air": { title: "Worn weatherstripping", desc: "The sealing gaskets on your window are worn and letting air through.", problem: "courant-air-fenetre", service: "coupe-froid", pricing: "coupe-froid", cost: "$30 - $80", urgency: "eleve" },
  "fenetre-mecanique": { title: "Defective hardware", desc: "The opening or closing mechanism is worn or broken.", problem: "fenetre-difficile-ouvrir", service: "remplacement-quincaillerie", pricing: "reparation-porte-patio", cost: "$50 - $200", urgency: "modere" },
  "fenetre-brise": { title: "Broken glass — emergency", desc: "Your glass is cracked or broken. Quick action is needed for safety and insulation.", problem: "double-vitrage-brise", service: "remplacement-vitre-thermos", pricing: "remplacement-thermos", cost: "$150 - $400", urgency: "urgent" },
  "fenetre-givre": { title: "Insulation problem", desc: "Frost indicates severe cold air infiltration. Weatherstripping and/or sealed unit needs inspection.", problem: "fenetre-givre-interieur", service: "coupe-froid", pricing: "coupe-froid", cost: "$50 - $350", urgency: "urgent" },
  "fenetre-bruit": { title: "Insufficient sound insulation", desc: "Your sealed unit no longer blocks noise. A Low-E sealed unit with argon will fix the problem.", problem: "fenetre-bruyante", service: "remplacement-vitre-thermos", pricing: "remplacement-thermos", cost: "$200 - $500", urgency: "faible" },
  "fenetre-bois": { title: "Wood repair", desc: "The wood frame of your window needs repair or restoration.", problem: "cadre-fenetre-pourri", service: "reparation-portes-bois", pricing: "reparation-portes-bois", cost: "$150 - $600", urgency: "eleve" },
  "fenetre-eau": { title: "Water infiltration — emergency", desc: "Water is leaking around your window. The caulking is likely deteriorated.", problem: "infiltration-eau-fenetre", service: "calfeutrage", pricing: "calfeutrage-fenetres", cost: "$100 - $500", urgency: "urgent" },
  "porte-patio-coince": { title: "Worn rollers", desc: "In 80% of cases, a stuck patio door has worn rollers. Simple and effective repair.", problem: "porte-patio-coince", service: "remplacement-quincaillerie", pricing: "reparation-porte-patio", cost: "$75 - $200", urgency: "modere" },
  "porte-patio-serrure": { title: "Lock or handle to replace", desc: "The hardware on your patio door is defective. We have the compatible part.", problem: "serrure-porte-patio-bloquee", service: "remplacement-quincaillerie", pricing: "reparation-porte-patio", cost: "$30 - $250", urgency: "eleve" },
  "porte-patio-air-froid": { title: "Patio door weatherstripping", desc: "The seals on your patio door are no longer doing their job. Simple replacement.", problem: "porte-patio-laisse-passer-air", service: "coupe-froid", pricing: "coupe-froid", cost: "$50 - $200", urgency: "eleve" },
  "porte-patio-buee-patio": { title: "Patio door sealed unit", desc: "The sealed unit on your patio door is foggy. Sealed unit replacement is necessary.", problem: "vitre-thermos-embuee", service: "remplacement-vitre-thermos", pricing: "remplacement-thermos", cost: "$200 - $400", urgency: "modere" },
  "porte-entree-colle": { title: "Swollen wood door", desc: "Your door swells with humidity. Planing and wood treatment will fix the problem.", problem: "porte-bois-qui-colle", service: "reparation-portes-bois", pricing: "reparation-portes-bois", cost: "$75 - $250", urgency: "faible" },
  "porte-entree-pourri": { title: "Rotted wood — urgent repair", desc: "The bottom of your door is rotted. The longer you wait, the more the damage spreads.", problem: "porte-bois-pourri-bas", service: "reparation-portes-bois", pricing: "reparation-portes-bois", cost: "$150 - $450", urgency: "urgent" },
  "porte-entree-vitrage": { title: "Door insert to replace", desc: "The glass insert in your door is foggy or broken. No need to change the entire door!", problem: "insertion-porte-embuee", service: "insertion-porte", pricing: "insertion-porte", cost: "$200 - $700", urgency: "modere" },
  "porte-entree-hiver": { title: "Winter adjustment", desc: "Freezing and humidity cause wood to shift. Hinge and weatherstripping adjustment needed.", problem: "porte-entree-difficile-fermer", service: "reparation-portes-bois", pricing: "reparation-portes-bois", cost: "$75 - $250", urgency: "eleve" },
  "moustiquaire-dechiree": { title: "Mesh replacement", desc: "Your screen mesh is torn. Quick replacement in the existing frame.", problem: "moustiquaire-dechiree", service: "moustiquaires-sur-mesure", pricing: "moustiquaires", cost: "$25 - $100", urgency: "faible" },
  "moustiquaire-tombe": { title: "Defective clips", desc: "The clips or springs on your screen are worn. Simple repair.", problem: "moustiquaire-qui-tombe", service: "moustiquaires-sur-mesure", pricing: "moustiquaires", cost: "$15 - $75", urgency: "faible" },
  "moustiquaire-tordu": { title: "Frame to straighten or replace", desc: "Your screen frame is deformed. We can straighten it or build a new one.", problem: "moustiquaire-cadre-tordu", service: "moustiquaires-sur-mesure", pricing: "moustiquaires", cost: "$30 - $100", urgency: "faible" },
};

function getResultKey(answers) {
  const type = answers[0];
  const symptom = answers[1];
  return `${type}-${symptom}`;
}

const urgencyStyles = {
  urgent: { bg: "bg-red-100", text: "text-red-700", label: "High urgency" },
  eleve: { bg: "bg-orange-100", text: "text-orange-700", label: "High priority" },
  modere: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Moderate priority" },
  faible: { bg: "bg-green-100", text: "text-green-700", label: "Low urgency" },
};

export default function DiagnosticPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  function selectOption(value) {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(steps.length); // show result
    }
  }

  function reset() {
    setCurrentStep(0);
    setAnswers([]);
  }

  const resultKey = answers.length === 2 ? getResultKey(answers) : null;
  const result = resultKey ? results[resultKey] : null;
  const urg = result ? urgencyStyles[result.urgency] || urgencyStyles.modere : null;

  const currentOptions =
    currentStep === 1 && steps[1].optionsMap
      ? steps[1].optionsMap[answers[0]] || []
      : currentStep === 0
        ? steps[0].options
        : [];

  return (
    <div className="pt-[75px] min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
            <i className="fas fa-stethoscope text-white/70 text-sm"></i>
            <span className="text-white/80 text-sm">Free tool</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Door and window diagnostic
          </h1>
          <p className="text-white/60">
            Answer 2 questions and discover the solution to your problem, the estimated cost and the service you need.
          </p>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
              <div
                className="h-full bg-[var(--color-teal)] transition-all duration-500"
                style={{ width: currentStep > i ? "100%" : currentStep === i ? "50%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Question */}
        {currentStep < steps.length && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <span className="text-[var(--color-teal)] mr-2">Question {currentStep + 1}/2</span>
              {currentStep === 1 ? steps[1].question : steps[currentStep].question}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {currentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[var(--color-teal)] hover:shadow-lg transition-all group text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 group-hover:bg-[var(--color-teal)]/10 flex items-center justify-center transition-colors">
                    <i className={`${opt.icon} text-xl text-gray-400 group-hover:text-[var(--color-teal)] transition-colors`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[var(--color-teal)] transition-colors">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {currentStep > 0 && (
              <button onClick={reset} className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fas fa-arrow-left mr-1"></i> Start over
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {currentStep >= steps.length && result && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${urg.bg} ${urg.text}`}>
                  {urg.label}
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                {result.title}
              </h2>
              <p className="text-gray-600 mb-6">{result.desc}</p>

              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">Estimated cost:</p>
                <p className="text-2xl font-black text-green-700">{result.cost}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Link
                  href={`/en/problemes/${result.problem}`}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                >
                  <i className="fas fa-search text-[var(--color-red)]"></i>
                  <span className="text-xs font-medium text-gray-700">Learn more</span>
                </Link>
                <Link
                  href={`/en/prix/${result.pricing}`}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                >
                  <i className="fas fa-dollar-sign text-green-600"></i>
                  <span className="text-xs font-medium text-gray-700">View pricing</span>
                </Link>
                <Link
                  href={`/en/services/${result.service}`}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                >
                  <i className="fas fa-wrench text-[var(--color-teal)]"></i>
                  <span className="text-xs font-medium text-gray-700">View service</span>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[var(--color-teal-dark)] rounded-2xl p-8 text-center text-white">
              <h3 className="text-xl font-bold mb-2">Ready to fix the problem?</h3>
              <p className="text-white/60 text-sm mb-6">Free quote with no obligation</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:15148258411"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
                >
                  <i className="fas fa-phone"></i> 514-825-8411
                </a>
                <Link
                  href="/en/rendez-vous"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <i className="fas fa-calendar-alt"></i> Book an appointment
                </Link>
              </div>
            </div>

            {/* OPTI-FENETRE */}
            <Link
              href="/en/opti-fenetre"
              className="block bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-6 text-white hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-star text-yellow-400 text-xl"></i>
                <div>
                  <h3 className="font-bold">Multiple problems? OPTI-FENETRE Program</h3>
                  <p className="text-white/60 text-sm">Turnkey package — up to 70% savings</p>
                </div>
                <i className="fas fa-arrow-right ml-auto"></i>
              </div>
            </Link>

            <button onClick={reset} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
              <i className="fas fa-redo mr-1"></i> Redo the diagnostic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
