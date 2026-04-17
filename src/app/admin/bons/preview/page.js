"use client";

import Link from "next/link";

const OPTIONS = [
  {
    key: "a",
    name: "Option A — Moderne Épuré",
    desc: "Minimaliste, inspiré Stripe/Linear. Beaucoup d'espaces, noir/blanc + accent rouge, typo épurée. Sections B2B en cartes individuelles avec bordure colorée.",
    vibe: "Tech moderne · Startup · Légère",
    color: "from-neutral-100 to-white",
  },
  {
    key: "b",
    name: "Option B — Corporate Premium",
    desc: "Classique pro, inspiré cabinets comptables. Bande rouge verticale gauche avec numéro, encadrements, zone signature physique, footer conditions.",
    vibe: "Corporate · Traditionnel · Sérieux",
    color: "from-red-50 to-white",
  },
  {
    key: "c",
    name: "Option C — Branded Thermos",
    desc: "Audacieux. Dégradés rouge, icônes par catégorie, sections B2B en cards colorées, total avec accent visuel. Plus moderne et punchy.",
    vibe: "Branded · Punchy · Mémorable",
    color: "from-orange-50 via-red-50 to-pink-50",
  },
];

export default function PreviewHub() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
        <i className="fas fa-arrow-left mr-2"></i>Retour aux bons
      </Link>
      <h1 className="admin-text text-3xl font-extrabold mt-3 mb-2">Aperçu factures — 3 options</h1>
      <p className="admin-text-muted text-sm mb-8 max-w-2xl">
        Les 3 maquettes utilisent des données factices d&apos;un bon Marronnier (3 unités, 6 items, 2 736,43 $). Clique pour voir chaque design plein écran. Choisis celui que tu aimes, je l&apos;implémente ensuite pour les vrais bons.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {OPTIONS.map((opt) => (
          <Link key={opt.key} href={`/admin/bons/preview/${opt.key}`}
            className="group block rounded-2xl overflow-hidden border admin-border admin-card hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={`h-40 bg-gradient-to-br ${opt.color} flex items-center justify-center relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg w-32 h-40 p-2 transform rotate-[-3deg] group-hover:rotate-0 transition-transform">
                  <div className="h-6 bg-[var(--color-red)] rounded-t-sm mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <div className="h-1 bg-gray-100 rounded"></div>
                    <div className="h-1 bg-gray-100 rounded"></div>
                    <div className="h-1 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="admin-text font-extrabold text-lg mb-2">{opt.name}</h2>
              <p className="admin-text-muted text-xs mb-3">{opt.vibe}</p>
              <p className="admin-text text-sm leading-relaxed mb-4">{opt.desc}</p>
              <span className="text-[var(--color-red)] font-bold text-sm group-hover:underline">
                Voir la maquette <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
