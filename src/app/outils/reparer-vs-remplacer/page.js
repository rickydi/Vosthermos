"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company";

const WEBAPP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Comparateur Reparer vs Remplacer - Vosthermos",
  description: "Outil gratuit pour comparer reparer ou remplacer votre fenetre/porte selon l'age, l'etat et le probleme.",
  url: "https://www.vosthermos.com/outils/reparer-vs-remplacer",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  provider: { "@type": "Organization", name: "Vosthermos", url: "https://www.vosthermos.com" },
};

export default function CompareToolPage() {
  const [problem, setProblem] = useState("");
  const [age, setAge] = useState(15);
  const [frame, setFrame] = useState("good");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function calculate() {
    if (!problem.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/public/calculate?type=compare&problem=${encodeURIComponent(problem)}&age=${age}&frame=${frame}`
      );
      const data = await res.json();
      setResult(data);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSON_LD) }} />

      <div className="bg-[var(--color-teal-dark)] text-white py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <Link href="/outils" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
            <i className="fas fa-arrow-left"></i> Retour aux outils
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Reparer ou remplacer?</h1>
          <p className="text-white/70">Decouvrez si la reparation ou le remplacement est la meilleure option selon votre situation specifique.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">
        {!result ? (
          <div className="bg-white rounded-xl p-8 border border-[var(--color-border)]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Quel est le probleme?</label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Ex: vitre embuee, porte-patio qui glisse mal, fenetre qui ferme pas..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Age approximatif de la fenetre/porte: <span className="font-bold">{age} ans</span>
                </label>
                <input
                  type="range" min="1" max="50" value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Etat du cadre</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: "good", l: "Bon etat" },
                    { v: "warped", l: "Deforme" },
                    { v: "rotten", l: "Pourri" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setFrame(opt.v)}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        frame === opt.v
                          ? "border-[var(--color-red)] bg-red-50 text-[var(--color-red)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-red)]"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={calculate}
                disabled={!problem.trim() || loading}
                className="w-full py-4 bg-[var(--color-red)] text-white rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? "Analyse..." : "Comparer les options"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recommendation banner */}
            <div className={`rounded-xl p-6 border-2 ${
              result.recommendation === "REPAIR"
                ? "bg-green-50 border-green-300"
                : "bg-orange-50 border-orange-300"
            }`}>
              <p className="text-xs uppercase font-semibold mb-1">Recommandation</p>
              <h2 className="text-2xl font-bold mb-2">
                {result.recommendation === "REPAIR" ? "Reparer" : "Remplacer"}
              </h2>
              <p className="text-sm">{result.reasoning}</p>
              {result.savings && <p className="text-sm font-semibold mt-2">{result.savings}</p>}
            </div>

            {/* Comparison table */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`bg-white rounded-xl p-6 border-2 ${
                result.recommendation === "REPAIR" ? "border-green-300" : "border-[var(--color-border)]"
              }`}>
                <h3 className="font-bold text-lg mb-4">
                  <i className="fas fa-wrench mr-2"></i>Reparation
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Cout</dt>
                    <dd className="font-bold text-[var(--color-text)]">{result.options.repair.cost}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Duree</dt>
                    <dd className="font-medium">{result.options.repair.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Garantie</dt>
                    <dd className="font-medium">{result.options.repair.warranty}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Impact environ.</dt>
                    <dd className="font-medium">{result.options.repair.environmentalImpact}</dd>
                  </div>
                </dl>
              </div>

              <div className={`bg-white rounded-xl p-6 border-2 ${
                result.recommendation === "REPLACE" ? "border-orange-300" : "border-[var(--color-border)]"
              }`}>
                <h3 className="font-bold text-lg mb-4">
                  <i className="fas fa-recycle mr-2"></i>Remplacement
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Cout</dt>
                    <dd className="font-bold text-[var(--color-text)]">{result.options.replace.cost}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Duree</dt>
                    <dd className="font-medium">{result.options.replace.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Garantie</dt>
                    <dd className="font-medium">{result.options.replace.warranty}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)] text-xs uppercase">Impact environ.</dt>
                    <dd className="font-medium">{result.options.replace.environmentalImpact}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] text-center">
              <p className="text-[var(--color-text-muted)] mb-4">
                Notre technicien se deplace gratuitement pour une evaluation precise.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/rendez-vous"
                  className="px-6 py-3 bg-[var(--color-red)] text-white rounded-lg font-semibold hover:opacity-90"
                >
                  <i className="fas fa-calendar-check mr-2"></i>Prendre RDV gratuit
                </Link>
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="px-6 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  <i className="fas fa-phone mr-2"></i>{COMPANY_INFO.phone}
                </a>
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)]"
            >
              <i className="fas fa-redo mr-1"></i>Faire un autre calcul
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
