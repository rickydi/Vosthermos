import Link from "next/link";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary-data";

export const metadata = {
  title: "Door and Window Glossary — Terms and Definitions | Vosthermos",
  description: "Complete glossary of door and window terms: sealed units, Low-E, argon, weatherstripping, caulking, hardware and more. Clear definitions by the Vosthermos experts.",
  alternates: { canonical: "https://www.vosthermos.com/en/glossaire" },
};

export default function GlossairePage() {
  const termSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Door and Window Glossary — Vosthermos",
    description: "Complete glossary of technical door and window terms in Quebec",
    url: "https://www.vosthermos.com/en/glossaire",
    hasDefinedTerm: GLOSSARY.map((g) => ({
      "@type": "DefinedTerm",
      name: g.term,
      url: `https://www.vosthermos.com/en/glossaire/${g.slug}`,
    })),
  };

  return (
    <div className="pt-[85px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(termSetJsonLd) }} />

      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Glossary</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Complete glossary of door and window terms. {GLOSSARY.length} clear definitions
            by our experts.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {GLOSSARY_CATEGORIES.map((cat) => {
          const terms = GLOSSARY.filter((g) => g.category === cat.slug);
          if (terms.length === 0) return null;
          return (
            <div key={cat.slug} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center">
                  <i className={`${cat.icon} text-sm`}></i>
                </div>
                {cat.label}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {terms.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/en/glossaire/${g.slug}`}
                    className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-teal)] transition-colors mb-2">
                      {g.term}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2">{g.definition.substring(0, 100)}...</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
