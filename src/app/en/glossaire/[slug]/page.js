import { notFound } from "next/navigation";
import Link from "next/link";
import { GLOSSARY, getGlossaryTerm, GLOSSARY_CATEGORIES } from "@/lib/glossary-data";
import { getService } from "@/lib/services-data";
import { SERVICES_EN } from "@/lib/services-data-en";
import { getProblem } from "@/lib/problems-data";
import { getPricing } from "@/lib/pricing-data";
import { COMPANY_INFO } from "@/lib/company-info";

export function generateStaticParams() {
  return GLOSSARY.map((g) => ({ slug: g.slug }));
}

const categoryLabels = {
  verre: "Glass and sealed units",
  quincaillerie: "Hardware",
  etancheite: "Sealing",
  fenetres: "Window types",
  insertion: "Door inserts",
  moustiquaire: "Screens",
  energie: "Energy efficiency",
  bois: "Wood repair",
  programme: "Programs",
  reglementation: "Regulations",
  mesures: "Measurements and calculations",
};

function catLabel(cat) {
  return categoryLabels[cat.slug] || cat.label;
}

function serviceHref(service) {
  const englishService = SERVICES_EN.find((item) => item.frSlug === service.slug);
  return englishService ? `/en/services/${englishService.slug}` : "/en/services";
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  return {
    title: `${term.term} - Definition and Explanation | Vosthermos Glossary`,
    description: `${term.definition.substring(0, 155)}...`,
    alternates: {
      canonical: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
      languages: {
        "fr-CA": `https://www.vosthermos.com/glossaire/${term.slug}`,
        "en-CA": `https://www.vosthermos.com/en/glossaire/${term.slug}`,
      },
    },
    openGraph: {
      title: `${term.term} - Definition | Vosthermos Glossary`,
      description: term.definition.substring(0, 155),
      url: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
      siteName: "Vosthermos",
      locale: "en_CA",
      type: "article",
    },
  };
}

export default async function GlossaryTermPageEn({ params }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const service = term.serviceSlug ? getService(term.serviceSlug) : null;
  const problem = term.problemSlug ? getProblem(term.problemSlug) : null;
  const pricing = term.pricingSlug ? getPricing(term.pricingSlug) : null;
  const catInfo = GLOSSARY_CATEGORIES.find((c) => c.slug === term.category);
  const related = GLOSSARY.filter(
    (g) => g.category === term.category && g.slug !== term.slug
  ).slice(0, 6);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    url: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Door and Window Glossary - Vosthermos",
      url: "https://www.vosthermos.com/en/glossaire",
    },
  };

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${term.term} - Definition`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#definition", ".term-aka"],
    },
    url: `https://www.vosthermos.com/en/glossaire/${term.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
      />

      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/en/glossaire" className="hover:text-white transition-colors">
              Glossary
            </Link>
            <span>/</span>
            <span className="text-white">{term.term}</span>
          </div>

          {catInfo && (
            <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <i className={`${catInfo.icon} mr-1`}></i> {catLabel(catInfo)}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {term.term}
          </h1>

          {term.aka.length > 0 && (
            <p className="term-aka text-white/40 text-sm mb-6">
              Also known as: {term.aka.join(", ")}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/en/glossaire"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-arrow-left"></i> View full glossary
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div
                id="definition"
                className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="fas fa-book text-[var(--color-teal)]"></i>
                  Definition
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {term.definition}
                </p>
              </div>

              {(service || problem || pricing) && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {service && (
                    <Link
                      href={serviceHref(service)}
                      className="bg-[var(--color-teal)]/5 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i className={`${service.icon} text-[var(--color-teal)] text-xl mb-2 block`}></i>
                      <p className="text-xs font-semibold group-hover:text-[var(--color-teal)]">
                        Related service
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {SERVICES_EN.find((item) => item.frSlug === service.slug)?.shortTitle || service.shortTitle}
                      </p>
                    </Link>
                  )}
                  {problem && (
                    <Link
                      href={`/en/problemes/${problem.slug}`}
                      className="bg-red-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i className={`${problem.icon} text-[var(--color-red)] text-xl mb-2 block`}></i>
                      <p className="text-xs font-semibold group-hover:text-[var(--color-red)]">
                        Related problem
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {problem.shortTitle}
                      </p>
                    </Link>
                  )}
                  {pricing && (
                    <Link
                      href={`/en/prix/${pricing.slug}`}
                      className="bg-green-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i className="fas fa-dollar-sign text-green-600 text-xl mb-2 block"></i>
                      <p className="text-xs font-semibold group-hover:text-green-600">
                        Pricing guide
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {pricing.priceRange.min}$ - {pricing.priceRange.max}$
                      </p>
                    </Link>
                  )}
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-link text-[var(--color-teal)]"></i>
                    Related terms
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {related.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/en/glossaire/${g.slug}`}
                        className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] hover:shadow-sm transition-all"
                      >
                        <i className="fas fa-arrow-right text-xs text-[var(--color-muted)]"></i>
                        {g.term}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl p-6 sticky top-[100px] space-y-6 shadow-sm border border-[var(--color-border)]">
                <div>
                  <h3 className="font-bold mb-2">Need help?</h3>
                  <p className="text-[var(--color-muted)] text-xs mb-4">
                    Our experts can explain the term and recommend the right repair.
                  </p>
                  <a
                    href={`tel:${COMPANY_INFO.phoneTel}`}
                    className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-5 py-3 rounded-xl hover:bg-[var(--color-red-dark)] transition-colors w-full text-sm mb-2"
                  >
                    <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                  </a>
                  <Link
                    href="/en/diagnostic"
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-purple-700 transition-colors w-full text-sm"
                  >
                    <i className="fas fa-stethoscope"></i> Free diagnostic
                  </Link>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href="/en/glossaire"
                    className="text-sm text-[var(--color-teal)] font-medium hover:underline"
                  >
                    &larr; View full glossary
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
