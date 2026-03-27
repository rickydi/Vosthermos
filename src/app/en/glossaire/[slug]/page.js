import { notFound } from "next/navigation";
import Link from "next/link";
import { GLOSSARY, getGlossaryTerm, GLOSSARY_CATEGORIES } from "@/lib/glossary-data";
import { getService } from "@/lib/services-data";
import { getProblem } from "@/lib/problems-data";
import { getPricing } from "@/lib/pricing-data";

export function generateStaticParams() {
  return GLOSSARY.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  return {
    title: `${term.term} — Definition and Explanation | Vosthermos Glossary`,
    description: `${term.definition.substring(0, 155)}...`,
    alternates: { canonical: `https://www.vosthermos.com/en/glossaire/${term.slug}` },
  };
}

export default async function GlossaryTermPage({ params }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const service = term.serviceSlug ? getService(term.serviceSlug) : null;
  const problem = term.problemSlug ? getProblem(term.problemSlug) : null;
  const pricing = term.pricingSlug ? getPricing(term.pricingSlug) : null;
  const catInfo = GLOSSARY_CATEGORIES.find((c) => c.slug === term.category);
  const related = GLOSSARY.filter((g) => g.category === term.category && g.slug !== term.slug).slice(0, 6);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    url: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Door and Window Glossary — Vosthermos",
      url: "https://www.vosthermos.com/en/glossaire",
    },
  };

  // Speakable schema for voice assistants
  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${term.term} — Definition`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#definition"],
    },
    url: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
  };

  return (
    <div className="pt-[85px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />

      <div className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-4">
            <Link href="/en/glossaire" className="hover:text-white transition-colors">Glossary</Link>
            <span>/</span>
            {catInfo && <span className="text-white/60">{catInfo.label}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            {term.term}
          </h1>
          {term.aka.length > 0 && (
            <p className="text-white/40 text-sm">
              Also known as: {term.aka.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Definition */}
            <div id="definition" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-book text-[var(--color-teal)]"></i>
                Definition
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">{term.definition}</p>
            </div>

            {/* Deep links grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              {service && (
                <Link href={`/en/services/${service.slug}`} className="bg-[var(--color-teal)]/5 rounded-xl p-5 hover:shadow-md transition-all group text-center">
                  <i className={`${service.icon} text-[var(--color-teal)] text-xl mb-2 block`}></i>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-[var(--color-teal)]">Related service</p>
                  <p className="text-xs text-gray-500 mt-1">{service.shortTitle}</p>
                </Link>
              )}
              {problem && (
                <Link href={`/en/problemes/${problem.slug}`} className="bg-red-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center">
                  <i className={`${problem.icon} text-[var(--color-red)] text-xl mb-2 block`}></i>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-[var(--color-red)]">Related problem</p>
                  <p className="text-xs text-gray-500 mt-1">{problem.shortTitle}</p>
                </Link>
              )}
              {pricing && (
                <Link href={`/en/prix/${pricing.slug}`} className="bg-green-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center">
                  <i className="fas fa-dollar-sign text-green-600 text-xl mb-2 block"></i>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-green-600">Pricing guide</p>
                  <p className="text-xs text-gray-500 mt-1">{pricing.priceRange.min}$ — {pricing.priceRange.max}$</p>
                </Link>
              )}
            </div>

            {/* Related terms */}
            {related.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Related terms</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {related.map((g) => (
                    <Link key={g.slug} href={`/en/glossaire/${g.slug}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <i className="fas fa-arrow-right text-xs text-gray-400 group-hover:text-[var(--color-teal)]"></i>
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[var(--color-teal)]">{g.term}</span>
                        <p className="text-xs text-gray-400 line-clamp-1">{g.definition.substring(0, 60)}...</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[120px] space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Need help?</h3>
                <p className="text-gray-500 text-xs mb-4">Our experts can explain and resolve your situation.</p>
                <a href="tel:15148258411" className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-5 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full text-sm mb-2">
                  <i className="fas fa-phone"></i> 514-825-8411
                </a>
                <Link href="/en/diagnostic" className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-purple-700 transition-colors w-full text-sm">
                  <i className="fas fa-stethoscope"></i> Free diagnostic
                </Link>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Link href="/en/glossaire" className="text-sm text-[var(--color-teal)] font-medium hover:underline">
                  &larr; View full glossary
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
