"use client";

import Link from "next/link";

const OPTIONS = [
  {
    key: "a",
    name: "A — Classic Rouge",
    desc: "Accent rouge sur le côté, code d'unité en badge rouge plein, bloc total sur fond rouge pâle. La version originale d'Option A.",
    vibe: "Warm · Reconnaissable · Marque",
    color: "from-red-50 to-white",
  },
  {
    key: "a2",
    name: "A2 — Mono Noir",
    desc: "Minimaliste pur. Aucun fond rouge, code d'unité en texte mono-espace sur barre noire, total en noir avec ligne noire double au-dessus.",
    vibe: "Minimal · Sobre · Éditorial",
    color: "from-neutral-100 to-white",
  },
  {
    key: "a3",
    name: "A3 — Receipt Premium (1 page)",
    desc: "Code d'unité en badge rouge outlined (bordure, pas rempli). Total dans une boîte façon reçu (bordure pointillée) avec label 'Montant à payer'.",
    vibe: "Comptable · Détaillé · Pro",
    color: "from-neutral-50 via-red-50 to-white",
  },
  {
    key: "a3-2p",
    name: "A3 — 2 pages (9 unités)",
    desc: "Même design A3 mais avec un bon plus chargé : 9 unités, ~20 items. Teste le comportement sur ~2 pages imprimées.",
    vibe: "Multi-page · Test mise en page",
    color: "from-amber-50 via-red-50 to-white",
  },
  {
    key: "a3-3p",
    name: "A3 — 3 pages (18 unités)",
    desc: "Même design A3 avec bon très chargé : 18 unités (toutes celles de Marronnier), ~35 items. Teste le pire cas d'impression.",
    vibe: "Multi-page max · Cas Marronnier complet",
    color: "from-red-100 via-orange-50 to-white",
  },
  {
    key: "b",
    name: "B — Corporate (archive)",
    desc: "Option précédente — bande rouge verticale, serif classique.",
    vibe: "Archive",
    color: "from-red-50 to-white",
    archived: true,
  },
  {
    key: "c",
    name: "C — Branded (archive)",
    desc: "Option précédente — hero gradient, icônes, cards colorées.",
    vibe: "Archive",
    color: "from-orange-50 via-red-50 to-pink-50",
    archived: true,
  },
];

export default function PreviewHub() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
        <i className="fas fa-arrow-left mr-2"></i>Retour aux bons
      </Link>
      <h1 className="admin-text text-3xl font-extrabold mt-3 mb-2">Aperçu factures — style Moderne Épuré</h1>
      <p className="admin-text-muted text-sm mb-8 max-w-2xl">
        3 variantes du style que tu as choisi. Total à payer en format compact. Même données factices (Marronnier · 3 unités · 2 736,43 $). Clique pour voir plein écran.
      </p>

      <h2 className="admin-text font-bold text-lg mb-3">Variantes actives</h2>
      <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-5 mb-10">
        {OPTIONS.filter((o) => !o.archived).map((opt) => (
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
              <h3 className="admin-text font-extrabold text-lg mb-2">{opt.name}</h3>
              <p className="admin-text-muted text-xs mb-3">{opt.vibe}</p>
              <p className="admin-text text-sm leading-relaxed mb-4">{opt.desc}</p>
              <span className="text-[var(--color-red)] font-bold text-sm group-hover:underline">
                Voir la maquette <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="admin-text font-bold text-lg mb-3 opacity-50">Archives (B / C)</h2>
      <div className="grid md:grid-cols-2 gap-4 opacity-60">
        {OPTIONS.filter((o) => o.archived).map((opt) => (
          <Link key={opt.key} href={`/admin/bons/preview/${opt.key}`}
            className="block rounded-xl border admin-border admin-card p-4 hover:opacity-100 transition-opacity">
            <h3 className="admin-text font-bold text-sm">{opt.name}</h3>
            <p className="admin-text-muted text-xs mt-1">{opt.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
