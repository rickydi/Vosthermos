import Link from "next/link";
import { HOWTOS } from "@/lib/howto-data";

export const metadata = {
  title: "Guides Pratiques • Reparation Portes et Fenetres | Vosthermos",
  description:
    "Guides etape par etape pour diagnostiquer et reparer vos portes et fenetres. Videos, outils, couts et astuces de nos techniciens experts avec 15 ans d'experience.",
  alternates: { canonical: "https://www.vosthermos.com/guides" },
};

export default function GuidesIndex() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Guides pratiques Vosthermos",
    description: "Collection de guides etape par etape pour la reparation de portes et fenetres",
    numberOfItems: HOWTOS.length,
    itemListElement: HOWTOS.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.vosthermos.com/guides/${h.slug}`,
      name: h.title,
    })),
  };

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="bg-[var(--color-teal-dark)] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Guides pratiques</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Tutoriels etape par etape pour diagnostiquer et reparer vos portes et fenetres. Redige par nos
            techniciens avec 15 ans d&apos;experience sur le terrain.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOWTOS.map((h) => (
            <Link
              key={h.slug}
              href={`/guides/${h.slug}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)]"
            >
              <div className="text-xs text-[var(--color-teal)] font-semibold uppercase tracking-wider mb-2">
                {h.difficulty} · {h.totalTime.replace("PT", "").replace("M", " min").replace("H", " h ")}
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{h.title}</h2>
              <p className="text-[var(--color-text-muted)] text-sm line-clamp-3">{h.description}</p>
              <div className="mt-4 text-[var(--color-red)] text-sm font-semibold">
                Lire le guide <i className="fas fa-arrow-right ml-1"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
