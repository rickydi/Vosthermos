"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const TOTAL_ESTIMATED_WINDOWS = 12;
const AVG_REPLACEMENT_COST = 250;

const heatingTypes = [
  { id: "electric", label: "Electrique", co2Factor: 0.5 },
  { id: "gas", label: "Gaz naturel", co2Factor: 2.0 },
  { id: "oil", label: "Mazout", co2Factor: 2.7 },
];

const thermosTypes = [
  { id: "double-standard", label: "Double standard", lossRate: 0.15 },
  { id: "double-lowe", label: "Double Low-E argon", lossRate: 0.10 },
  { id: "triple-lowe", label: "Triple Low-E argon", lossRate: 0.05 },
];

function getOldLossRate(age) {
  if (age >= 20) return 0.25;
  if (age >= 15) return 0.22;
  if (age >= 10) return 0.18;
  return 0.15;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    startedRef.current = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const from = 0;
          const to = value;

          function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(from + (to - from) * eased);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString("fr-CA");

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function EnergySavingsCalculator() {
  const [windowCount, setWindowCount] = useState(5);
  const [windowAge, setWindowAge] = useState(20);
  const [annualBill, setAnnualBill] = useState(2000);
  const [heatingType, setHeatingType] = useState("electric");
  const [thermosType, setThermosType] = useState("double-lowe");
  const [showResults, setShowResults] = useState(false);

  const calc = useMemo(() => {
    const heating = heatingTypes.find((h) => h.id === heatingType);
    const thermos = thermosTypes.find((t) => t.id === thermosType);

    const oldLossRate = getOldLossRate(windowAge);
    const newLossRate = thermos.lossRate;
    const windowRatio = windowCount / TOTAL_ESTIMATED_WINDOWS;

    const annualSavings = annualBill * windowRatio * (oldLossRate - newLossRate);
    const savings10Years = annualSavings * 10 * 1.03; // slight compound factor
    const replacementCost = windowCount * AVG_REPLACEMENT_COST;
    const roi = annualSavings > 0 ? replacementCost / annualSavings : 0;

    // CO2: savings in $ -> approximate kWh (avg 0.08$/kWh QC electricity)
    const kWhSaved = heatingType === "electric"
      ? annualSavings / 0.08
      : annualSavings / 0.12; // gas/oil cost per equivalent kWh
    const co2Reduction = kWhSaved * heating.co2Factor;

    return {
      annualSavings: Math.max(0, Math.round(annualSavings)),
      savings10Years: Math.max(0, Math.round(savings10Years)),
      co2Reduction: Math.max(0, Math.round(co2Reduction)),
      roi: Math.max(0, parseFloat(roi.toFixed(1))),
      replacementCost: Math.max(0, replacementCost),
    };
  }, [windowCount, windowAge, annualBill, heatingType, thermosType]);

  function handleCalculate() {
    setShowResults(false);
    // Brief delay for re-trigger animation
    setTimeout(() => setShowResults(true), 50);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Step 1: Sliders */}
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">
            1
          </span>
          Vos fenetres actuelles
        </h3>
        <div className="space-y-6">
          {/* Window count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                <i className="fas fa-th-large text-[var(--color-teal)] mr-1"></i>{" "}
                Nombre de fenetres a remplacer
              </label>
              <span className="text-lg font-bold text-[var(--color-teal)]">{windowCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={windowCount}
              onChange={(e) => setWindowCount(parseInt(e.target.value))}
              className="w-full accent-[var(--color-teal)]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          {/* Window age */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                <i className="fas fa-clock text-[var(--color-teal)] mr-1"></i>{" "}
                Age des fenetres actuelles
              </label>
              <span className="text-lg font-bold text-[var(--color-teal)]">{windowAge} ans</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={windowAge}
              onChange={(e) => setWindowAge(parseInt(e.target.value))}
              className="w-full accent-[var(--color-teal)]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 ans</span>
              <span>40 ans</span>
            </div>
          </div>

          {/* Annual bill */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                <i className="fas fa-file-invoice-dollar text-[var(--color-teal)] mr-1"></i>{" "}
                Facture de chauffage annuelle
              </label>
              <span className="text-lg font-bold text-[var(--color-teal)]">
                {annualBill.toLocaleString("fr-CA")} $
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={annualBill}
              onChange={(e) => setAnnualBill(parseInt(e.target.value))}
              className="w-full accent-[var(--color-teal)]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500 $</span>
              <span>5 000 $</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Heating type */}
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">
            2
          </span>
          Type de chauffage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {heatingTypes.map((h) => (
            <button
              key={h.id}
              onClick={() => setHeatingType(h.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                heatingType === h.id
                  ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  heatingType === h.id
                    ? "border-[var(--color-teal)]"
                    : "border-gray-300"
                }`}
              >
                {heatingType === h.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]"></div>
                )}
              </div>
              <span
                className={`font-medium text-sm ${
                  heatingType === h.id ? "text-[var(--color-teal)]" : "text-gray-600"
                }`}
              >
                {h.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Thermos type */}
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">
            3
          </span>
          Type de thermos souhaite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {thermosTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setThermosType(t.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                thermosType === t.id
                  ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  thermosType === t.id
                    ? "border-[var(--color-teal)]"
                    : "border-gray-300"
                }`}
              >
                {thermosType === t.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]"></div>
                )}
              </div>
              <span
                className={`font-medium text-sm ${
                  thermosType === t.id ? "text-[var(--color-teal)]" : "text-gray-600"
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calculate button */}
      <div className="p-10 border-b border-gray-100 text-center bg-gradient-to-b from-white to-gray-50">
        <button
          onClick={handleCalculate}
          className="relative bg-[var(--color-red)] text-white font-extrabold px-14 py-5 rounded-2xl text-xl hover:bg-[var(--color-red-light)] hover:scale-105 transition-all duration-300 shadow-2xl shadow-[var(--color-red)]/30"
        >
          <span className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full animate-bounce">
            GRATUIT
          </span>
          <i className="fas fa-bolt mr-3"></i>Calculer mes economies
        </button>
        <p className="text-gray-400 text-xs mt-4">
          Estimation instantanee — aucun engagement
        </p>
      </div>

      {/* Results */}
      {showResults && (
        <div className="p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">
            Vos economies estimees
          </h3>

          {/* 5 result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Annual savings */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[var(--color-red)] text-center shadow-lg shadow-[var(--color-red)]/10 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-piggy-bank text-xl text-[var(--color-red)]"></i>
              </div>
              <p className="text-3xl font-black text-[var(--color-red)]">
                <AnimatedNumber value={calc.annualSavings} suffix=" $" />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Economies annuelles
              </p>
            </div>

            {/* 10 year savings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-chart-line text-xl text-green-600"></i>
              </div>
              <p className="text-2xl font-black text-gray-900">
                <AnimatedNumber value={calc.savings10Years} suffix=" $" />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Economies sur 10 ans
              </p>
            </div>

            {/* CO2 reduction */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-leaf text-xl text-emerald-600"></i>
              </div>
              <p className="text-2xl font-black text-gray-900">
                <AnimatedNumber value={calc.co2Reduction} suffix=" kg" />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Reduction CO2/an
              </p>
            </div>

            {/* ROI */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clock text-xl text-blue-600"></i>
              </div>
              <p className="text-2xl font-black text-gray-900">
                <AnimatedNumber value={calc.roi} decimals={1} suffix=" ans" />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Retour sur investissement
              </p>
            </div>

            {/* Replacement cost */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-tools text-xl text-[var(--color-teal)]"></i>
              </div>
              <p className="text-2xl font-black text-gray-900">
                <AnimatedNumber value={calc.replacementCost} suffix=" $" />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Cout estime du remplacement
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-info-circle mr-1"></i>
              Ce calcul est une estimation basee sur des moyennes. Contactez-nous pour une evaluation precise adaptee a votre situation.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-[var(--color-teal-dark)] rounded-2xl p-8 text-center text-white mb-8">
            <h3 className="text-xl font-bold mb-2">
              Economisez {calc.annualSavings.toLocaleString("fr-CA")} $ par annee
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Obtenez une soumission gratuite et sans engagement
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg"
              >
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
              >
                <i className="fas fa-envelope"></i> Soumission gratuite
              </Link>
            </div>
          </div>

          {/* Useful links */}
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/blogue/subventions-remplacement-fenetres-quebec-2026"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
            >
              <i className="fas fa-hand-holding-usd text-green-600"></i>
              <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">
                Subventions Renoclimat 2026
              </span>
            </Link>
            <Link
              href="/prix"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
            >
              <i className="fas fa-dollar-sign text-[var(--color-red)]"></i>
              <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">
                Grille tarifaire complete
              </span>
            </Link>
            <Link
              href="/services/remplacement-vitre-thermos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
            >
              <i className="fas fa-snowflake text-[var(--color-teal)]"></i>
              <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">
                Remplacement de thermos
              </span>
            </Link>
          </div>

          <button
            onClick={() => setShowResults(false)}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-4 mt-4"
          >
            <i className="fas fa-redo mr-1"></i> Recalculer
          </button>
        </div>
      )}
    </div>
  );
}
