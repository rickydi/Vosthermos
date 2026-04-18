"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const REPLACEMENT_PRICES = { window: 1100, patioDoor: 3500, entryDoor: 3000 };

// Cost per problem per type of opening (OPTI-FENETRE pricing)
const problems = [
  { id: "thermos", label: "Vitres thermos embuees", icon: "fas fa-cloud", perWindow: 225, perPatio: 300, perEntry: 0, heatSaving: 40 },
  { id: "air", label: "Courants d'air / sifflements", icon: "fas fa-wind", perWindow: 55, perPatio: 75, perEntry: 60, heatSaving: 35 },
  { id: "mecanique", label: "Mecanismes qui coincent", icon: "fas fa-cogs", perWindow: 80, perPatio: 150, perEntry: 100, heatSaving: 5 },
  { id: "calfeutrage", label: "Calfeutrage deteriore", icon: "fas fa-fill-drip", perWindow: 25, perPatio: 35, perEntry: 30, heatSaving: 25 },
  { id: "moustiquaire", label: "Moustiquaires abimees", icon: "fas fa-border-all", perWindow: 45, perPatio: 80, perEntry: 0, heatSaving: 0 },
  { id: "bois", label: "Bois pourri ou abime", icon: "fas fa-tree", perWindow: 120, perPatio: 0, perEntry: 200, heatSaving: 15 },
];

function formatMoney(n) {
  return n.toLocaleString("fr-CA") + " $";
}

export default function CalculateurPage() {
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

    // OPTI-FENETRE cost = sum of selected problems only
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
    <div className="pt-[80px] min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] py-12">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
            <i className="fas fa-calculator text-white/70 text-sm"></i>
            <span className="text-white/80 text-sm">Outil gratuit</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Calculateur d&apos;economies
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Decouvrez combien vous pourriez economiser avec le programme OPTI-FENETRE
            vs le remplacement complet de vos portes et fenetres.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Step 1: Quantities */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">1</span>
              Combien avez-vous d&apos;ouvertures?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-th-large text-[var(--color-teal)] mr-1"></i> Fenetres
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="30" value={windows}
                    onChange={(e) => setWindows(parseInt(e.target.value))}
                    className="flex-1 accent-[#0d9488]"
                  />
                  <span className="w-10 text-center font-bold text-gray-900 text-lg">{windows}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-door-open text-[var(--color-teal)] mr-1"></i> Portes-patio
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="5" value={patioDoors}
                    onChange={(e) => setPatioDoors(parseInt(e.target.value))}
                    className="flex-1 accent-[#0d9488]"
                  />
                  <span className="w-10 text-center font-bold text-gray-900 text-lg">{patioDoors}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-door-closed text-[var(--color-teal)] mr-1"></i> Portes d&apos;entree
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="3" value={entryDoors}
                    onChange={(e) => setEntryDoors(parseInt(e.target.value))}
                    className="flex-1 accent-[#0d9488]"
                  />
                  <span className="w-10 text-center font-bold text-gray-900 text-lg">{entryDoors}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Problems */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">2</span>
              Quels problemes observez-vous?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {problems.map((p) => {
                const isOn = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      isOn
                        ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)]"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <i className={`${p.icon} text-xs`}></i>
                    <span className="font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Calculate */}
          <div className="p-8 border-b border-gray-100 text-center">
            <button
              onClick={() => setShowResult(true)}
              disabled={calc.totalOpenings === 0}
              className="bg-[var(--color-red)] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[var(--color-red-light)] transition-colors disabled:opacity-50 shadow-lg shadow-[var(--color-red)]/20"
            >
              <i className="fas fa-calculator mr-2"></i>
              Calculer mes economies
            </button>
          </div>

          {/* Results */}
          {showResult && calc.totalOpenings > 0 && (
            <div className="p-8 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-8 text-center">Vos resultats</h2>

              {/* Comparison cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Remplacement */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-2">Remplacement complet</p>
                  <p className="text-4xl font-black text-gray-400 line-through">
                    {formatMoney(calc.replaceCost)}
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-gray-400">
                    <p>{windows} fenetres x {formatMoney(REPLACEMENT_PRICES.window)}</p>
                    {patioDoors > 0 && <p>{patioDoors} porte(s)-patio x {formatMoney(REPLACEMENT_PRICES.patioDoor)}</p>}
                    {entryDoors > 0 && <p>{entryDoors} porte(s) entree x {formatMoney(REPLACEMENT_PRICES.entryDoor)}</p>}
                  </div>
                </div>

                {/* OPTI-FENETRE */}
                <div className="bg-white rounded-2xl p-6 border-2 border-[var(--color-teal)] text-center relative shadow-lg shadow-[var(--color-teal)]/10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-teal)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    OPTI-FENETRE
                  </div>
                  <p className="text-sm text-gray-500 mb-2 mt-1">Remise a neuf complete</p>
                  <p className="text-4xl font-black text-[var(--color-teal)]">
                    {formatMoney(calc.optiCost)}
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-gray-500">
                    {problems.filter((p) => selected.has(p.id)).map((p) => {
                      const cost = windows * p.perWindow + patioDoors * p.perPatio + entryDoors * p.perEntry;
                      return cost > 0 ? <p key={p.id}>{p.label} : {formatMoney(cost)}</p> : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Savings highlight */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
                <p className="text-sm text-green-600 font-semibold mb-2">Vous economisez</p>
                <p className="text-5xl md:text-6xl font-black text-green-700 mb-2">
                  {formatMoney(calc.savings)}
                </p>
                <p className="text-green-600 font-bold text-xl">
                  Soit {calc.savingsPercent}% d&apos;economie
                </p>
              </div>

              {/* Extra stats */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                  <i className="fas fa-fire text-orange-500 text-xl mb-2"></i>
                  <p className="text-2xl font-black text-gray-900">{formatMoney(calc.heatingYearly)}</p>
                  <p className="text-xs text-gray-500">Economie chauffage/an</p>
                </div>
                <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                  <i className="fas fa-clock text-blue-500 text-xl mb-2"></i>
                  <p className="text-2xl font-black text-gray-900">{calc.roi} ans</p>
                  <p className="text-xs text-gray-500">Retour sur investissement</p>
                </div>
                <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                  <i className="fas fa-leaf text-green-500 text-xl mb-2"></i>
                  <p className="text-2xl font-black text-gray-900">{calc.totalOpenings}</p>
                  <p className="text-xs text-gray-500">Ouvertures sauvees du remplacement</p>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[var(--color-teal-dark)] rounded-2xl p-8 text-center text-white">
                <h3 className="text-xl font-bold mb-2">Pret a economiser {formatMoney(calc.savings)}?</h3>
                <p className="text-white/60 text-sm mb-6">Soumission gratuite et sans engagement pour votre projet</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`tel:${COMPANY_INFO.phoneTel}`}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg"
                  >
                    <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                  </a>
                  <Link
                    href="/rendez-vous"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <i className="fas fa-calendar-alt"></i> Prendre rendez-vous
                  </Link>
                </div>
              </div>

              {/* Deep links */}
              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                <Link href="/opti-fenetre" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                  <i className="fas fa-star text-yellow-500"></i>
                  <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">Programme OPTI-FENETRE</span>
                </Link>
                <Link href="/prix" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                  <i className="fas fa-dollar-sign text-green-600"></i>
                  <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">Grille tarifaire complete</span>
                </Link>
                <Link href="/diagnostic" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                  <i className="fas fa-stethoscope text-purple-600"></i>
                  <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)]">Diagnostic de fenetres</span>
                </Link>
              </div>

              <button onClick={() => setShowResult(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-4 mt-4">
                <i className="fas fa-redo mr-1"></i> Recalculer
              </button>
            </div>
          )}
        </div>

        {/* SEO content below calculator */}
        <div className="mt-12 max-w-[700px] mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pourquoi remettre a neuf plutot que remplacer?</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Le programme OPTI-FENETRE de Vosthermos vous permet de remettre vos portes et fenetres a neuf —
            thermos, quincaillerie, coupe-froid, calfeutrage et moustiquaires — en un seul forfait.
            Vous obtenez le meme resultat qu'un remplacement complet pour une fraction du prix.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            <Link href="/problemes" className="hover:text-[var(--color-teal)]">50 problemes documentes</Link>
            <span>·</span>
            <Link href="/glossaire" className="hover:text-[var(--color-teal)]">Glossaire technique</Link>
            <span>·</span>
            <Link href="/blogue" className="hover:text-[var(--color-teal)]">Articles de blogue</Link>
            <span>·</span>
            <Link href="/services/remplacement-vitre-thermos" className="hover:text-[var(--color-teal)]">Remplacement de thermos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
