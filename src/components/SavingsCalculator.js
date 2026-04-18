"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company";

const REPLACEMENT_PRICES = { window: 1100, patioDoor: 3500, entryDoor: 3000 };

const problems = [
  { id: "thermos", label: "Vitres thermos embuees", labelEn: "Foggy sealed glass units", icon: "fas fa-cloud", perWindow: 225, perPatio: 300, perEntry: 0, heatSaving: 40 },
  { id: "air", label: "Courants d'air / sifflements", labelEn: "Drafts / whistling", icon: "fas fa-wind", perWindow: 55, perPatio: 75, perEntry: 60, heatSaving: 35 },
  { id: "mecanique", label: "Mecanismes qui coincent", labelEn: "Stuck mechanisms", icon: "fas fa-cogs", perWindow: 80, perPatio: 150, perEntry: 100, heatSaving: 5 },
  { id: "calfeutrage", label: "Calfeutrage deteriore", labelEn: "Worn caulking", icon: "fas fa-fill-drip", perWindow: 25, perPatio: 35, perEntry: 30, heatSaving: 25 },
  { id: "moustiquaire", label: "Moustiquaires abimees", labelEn: "Damaged screens", icon: "fas fa-border-all", perWindow: 45, perPatio: 80, perEntry: 0, heatSaving: 0 },
  { id: "bois", label: "Bois pourri ou abime", labelEn: "Rotted or damaged wood", icon: "fas fa-tree", perWindow: 120, perPatio: 0, perEntry: 200, heatSaving: 15 },
];

const labels = {
  fr: {
    windows: "Fenetres", patioDoors: "Portes-patio", entryDoors: "Portes d'entree",
    step1: "Combien avez-vous d'ouvertures?", step2: "Quels problemes observez-vous?",
    calculate: "Calculer mes economies", results: "Vos resultats",
    replacement: "Remplacement complet", optiFenetre: "Remise a neuf OPTI-FENETRE",
    youSave: "Vous economisez", savings: "d'economie",
    heatingYear: "Economie chauffage/an", roi: "Retour sur investissement",
    saved: "Ouvertures sauvees", years: "ans",
    readyToSave: "Pret a economiser", freeQuote: "Soumission gratuite et sans engagement",
    callUs: COMPANY_INFO.phone, bookNow: "Prendre rendez-vous",
    recalculate: "Recalculer",
  },
  en: {
    windows: "Windows", patioDoors: "Patio doors", entryDoors: "Entry doors",
    step1: "How many openings do you have?", step2: "What problems do you see?",
    calculate: "Calculate my savings", results: "Your results",
    replacement: "Full replacement", optiFenetre: "OPTI-FENETRE refurbishment",
    youSave: "You save", savings: "savings",
    heatingYear: "Heating savings/year", roi: "Return on investment",
    saved: "Openings saved", years: "years",
    readyToSave: "Ready to save", freeQuote: "Free quote, no obligation",
    callUs: COMPANY_INFO.phone, bookNow: "Book an appointment",
    recalculate: "Recalculate",
  },
};

function formatMoney(n) {
  return n.toLocaleString("fr-CA") + " $";
}

export default function SavingsCalculator({ lang = "fr" }) {
  const t = labels[lang] || labels.fr;
  const prefix = lang === "en" ? "/en" : "";

  const [windows, setWindows] = useState(10);
  const [patioDoors, setPatioDoors] = useState(1);
  const [entryDoors, setEntryDoors] = useState(1);
  const [selected, setSelected] = useState(new Set(["thermos", "air"]));
  const [showResult, setShowResult] = useState(false);

  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  const calc = useMemo(() => {
    const replaceCost =
      windows * REPLACEMENT_PRICES.window +
      patioDoors * REPLACEMENT_PRICES.patioDoor +
      entryDoors * REPLACEMENT_PRICES.entryDoor;

    let optiCost = 0;
    let heatingYearly = 0;
    for (const p of problems) {
      if (!selected.has(p.id)) continue;
      optiCost += windows * p.perWindow + patioDoors * p.perPatio + entryDoors * p.perEntry;
      heatingYearly += (windows + patioDoors + entryDoors) * p.heatSaving;
    }

    const savings = replaceCost - optiCost;
    const savingsPercent = replaceCost > 0 ? Math.round((savings / replaceCost) * 100) : 0;
    const totalOpenings = windows + patioDoors + entryDoors;
    const roi = optiCost > 0 && heatingYearly > 0 ? Math.ceil(optiCost / heatingYearly) : 0;

    return { replaceCost, optiCost, savings, savingsPercent, heatingYearly, roi, totalOpenings };
  }, [windows, patioDoors, entryDoors, selected]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Step 1 */}
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">1</span>
          {t.step1}
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: t.windows, icon: "fas fa-th-large", val: windows, set: setWindows, max: 30 },
            { label: t.patioDoors, icon: "fas fa-door-open", val: patioDoors, set: setPatioDoors, max: 5 },
            { label: t.entryDoors, icon: "fas fa-door-closed", val: entryDoors, set: setEntryDoors, max: 3 },
          ].map((s) => (
            <div key={s.label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className={`${s.icon} text-[var(--color-teal)] mr-1`}></i> {s.label}
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max={s.max} value={s.val} onChange={(e) => s.set(parseInt(e.target.value))} className="flex-1 accent-[#0d9488]" />
                <span className="w-10 text-center font-bold text-gray-900 text-lg">{s.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">2</span>
          {t.step2}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {problems.map((p) => {
            const isOn = selected.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${isOn ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)]" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                <i className={`${p.icon} text-xs`}></i>
                <span className="font-medium">{lang === "en" ? p.labelEn : p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculate button */}
      <div className="p-10 border-b border-gray-100 text-center bg-gradient-to-b from-white to-gray-50">
        <button onClick={() => setShowResult(true)} disabled={calc.totalOpenings === 0}
          className="relative bg-[var(--color-red)] text-white font-extrabold px-14 py-5 rounded-2xl text-xl hover:bg-[var(--color-red-light)] hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-2xl shadow-[var(--color-red)]/30 animate-[pulse_2s_ease-in-out_infinite]">
          <span className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full animate-bounce">
            GRATUIT
          </span>
          <i className="fas fa-calculator mr-3"></i>{t.calculate}
        </button>
        <p className="text-gray-400 text-xs mt-4">Sans engagement — resultat instantane</p>
      </div>

      {/* Results */}
      {showResult && calc.totalOpenings > 0 && (
        <div className="p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">{t.results}</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">{t.replacement}</p>
              <p className="text-4xl font-black text-gray-400 line-through">{formatMoney(calc.replaceCost)}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-[var(--color-teal)] text-center relative shadow-lg shadow-[var(--color-teal)]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-teal)] text-white text-xs font-bold px-3 py-1 rounded-full">OPTI-FENETRE</div>
              <p className="text-sm text-gray-500 mb-2 mt-1">{t.optiFenetre}</p>
              <p className="text-4xl font-black text-[var(--color-teal)]">{formatMoney(calc.optiCost)}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {problems.filter((p) => selected.has(p.id)).map((p) => {
                  const cost = windows * p.perWindow + patioDoors * p.perPatio + entryDoors * p.perEntry;
                  return cost > 0 ? <p key={p.id}>{lang === "en" ? p.labelEn : p.label} : {formatMoney(cost)}</p> : null;
                })}
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
            <p className="text-sm text-green-600 font-semibold mb-2">{t.youSave}</p>
            <p className="text-5xl md:text-6xl font-black text-green-700 mb-2">{formatMoney(calc.savings)}</p>
            <p className="text-green-600 font-bold text-xl">{calc.savingsPercent}% {t.savings}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
              <i className="fas fa-fire text-orange-500 text-xl mb-2"></i>
              <p className="text-2xl font-black text-gray-900">{formatMoney(calc.heatingYearly)}</p>
              <p className="text-xs text-gray-500">{t.heatingYear}</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
              <i className="fas fa-clock text-blue-500 text-xl mb-2"></i>
              <p className="text-2xl font-black text-gray-900">{calc.roi} {t.years}</p>
              <p className="text-xs text-gray-500">{t.roi}</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
              <i className="fas fa-leaf text-green-500 text-xl mb-2"></i>
              <p className="text-2xl font-black text-gray-900">{calc.totalOpenings}</p>
              <p className="text-xs text-gray-500">{t.saved}</p>
            </div>
          </div>

          <div className="bg-[var(--color-teal-dark)] rounded-2xl p-8 text-center text-white">
            <h3 className="text-xl font-bold mb-2">{t.readyToSave} {formatMoney(calc.savings)}?</h3>
            <p className="text-white/60 text-sm mb-6">{t.freeQuote}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg">
                <i className="fas fa-phone"></i> {t.callUs}
              </a>
              <Link href={`${prefix}/rendez-vous`} className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors">
                <i className="fas fa-calendar-alt"></i> {t.bookNow}
              </Link>
            </div>
          </div>

          <button onClick={() => setShowResult(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-4 mt-4">
            <i className="fas fa-redo mr-1"></i> {t.recalculate}
          </button>
        </div>
      )}
    </div>
  );
}
