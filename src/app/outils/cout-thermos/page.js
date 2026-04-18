"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company";

const WEBAPP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculateur cout remplacement thermos - Vosthermos",
  description: "Calculateur gratuit pour estimer le cout de remplacement d'une vitre thermos (unite scellee) selon les dimensions.",
  url: "https://www.vosthermos.com/outils/cout-thermos",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  provider: { "@type": "Organization", name: "Vosthermos", url: "https://www.vosthermos.com" },
};

export default function CoutThermosPage() {
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(36);
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/calculate?type=thermos&width=${width}&height=${height}&qty=${qty}`);
        const data = await res.json();
        setResult(data);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [width, height, qty]);

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSON_LD) }} />

      <div className="bg-[var(--color-teal-dark)] text-white py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <Link href="/outils" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
            <i className="fas fa-arrow-left"></i> Retour aux outils
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Calculateur cout de remplacement thermos</h1>
          <p className="text-white/70">Estimez le cout de remplacement d&apos;une vitre thermos selon les dimensions. Prix base sur nos tarifs 2026.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] space-y-5">
            <h2 className="font-bold text-lg">Dimensions de votre vitre</h2>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                Largeur: <span className="font-bold text-[var(--color-text)]">{width}&quot;</span>
              </label>
              <input
                type="range" min="10" max="96" value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full"
              />
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)}
                className="mt-2 w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm"
                min="1" max="200" />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                Hauteur: <span className="font-bold text-[var(--color-text)]">{height}&quot;</span>
              </label>
              <input
                type="range" min="10" max="96" value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full"
              />
              <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)}
                className="mt-2 w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm"
                min="1" max="200" />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                Quantite de vitres: <span className="font-bold text-[var(--color-text)]">{qty}</span>
              </label>
              <input
                type="range" min="1" max="20" value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {result && (
              <div className="text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                Surface: {result.dimensions?.sqftPerUnit} pi² par vitre
                {qty > 1 && ` × ${qty} = ${result.dimensions?.totalSqft} pi² total`}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
            <h2 className="font-bold text-lg mb-4">Estimation</h2>
            {loading && !result ? (
              <p className="text-[var(--color-text-muted)] text-sm">
                <i className="fas fa-spinner fa-spin mr-2"></i>Calcul en cours...
              </p>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs text-red-700 uppercase font-semibold mb-1">Remplacement thermos</p>
                  <p className="text-2xl font-bold text-red-900">
                    {result.replacement?.totalMin}$ - {result.replacement?.totalMax}$
                  </p>
                  <p className="text-xs text-red-700 mt-1">Garantie {result.replacement?.warranty}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-700 uppercase font-semibold mb-1">
                    Alternative: desembuage ({result.defoggingAlternative?.savings} economie)
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {result.defoggingAlternative?.totalMin}$ - {result.defoggingAlternative?.totalMax}$
                  </p>
                  <p className="text-xs text-green-700 mt-1">{result.defoggingAlternative?.note}</p>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] italic">
                  {result.recommendation}
                </p>

                <Link
                  href="/rendez-vous"
                  className="block w-full text-center py-3 bg-[var(--color-red)] text-white rounded-lg font-semibold hover:opacity-90"
                >
                  <i className="fas fa-calendar-check mr-2"></i>Prendre RDV gratuit
                </Link>
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="block w-full text-center py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  <i className="fas fa-phone mr-2"></i>{COMPANY_INFO.phone}
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {/* SEO text */}
        <div className="mt-12 prose max-w-none">
          <h2 className="text-2xl font-bold">Comment on calcule le cout d&apos;un remplacement de thermos</h2>
          <p className="text-[var(--color-text-muted)]">
            Le cout de remplacement d&apos;une vitre thermos (aussi appelee unite scellee) depend principalement
            de la surface en pieds carres. Chez Vosthermos, nos prix commencent a 150$ pour une petite vitre
            et augmentent proportionnellement selon les dimensions. Le calcul tient aussi compte du type de
            verre (clair, teinte, Low-E) et de la complexite d&apos;installation.
          </p>
          <p className="text-[var(--color-text-muted)]">
            Pour les vitres recentes (moins de 10 ans), le <Link href="/services/desembuage">desembuage</Link> est
            souvent une alternative economique au remplacement complet, avec des economies de 40-60%.
          </p>
        </div>
      </div>
    </div>
  );
}
