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
    title: `${term.term} — Definition et explication | Glossaire Vosthermos`,
    description: `${term.definition.substring(0, 155)}...`,
    alternates: {
      canonical: `https://www.vosthermos.com/glossaire/${term.slug}`,
    },
    openGraph: {
      title: `${term.term} — Definition | Glossaire Vosthermos`,
      description: term.definition.substring(0, 155),
      url: `https://www.vosthermos.com/glossaire/${term.slug}`,
      siteName: "Vosthermos",
      locale: "fr_CA",
      type: "article",
    },
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
  const related = GLOSSARY.filter(
    (g) => g.category === term.category && g.slug !== term.slug
  ).slice(0, 6);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    url: `https://www.vosthermos.com/glossaire/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Glossaire portes et fenetres — Vosthermos",
      url: "https://www.vosthermos.com/glossaire",
    },
  };

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${term.term} — Definition`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#definition", ".term-aka"],
    },
    url: `https://www.vosthermos.com/glossaire/${term.slug}`,
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

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[85px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link
              href="/glossaire"
              className="hover:text-white transition-colors"
            >
              Glossaire
            </Link>
            <span>/</span>
            <span className="text-white">{term.term}</span>
          </div>

          {/* Badge */}
          {catInfo && (
            <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <i className={`${catInfo.icon} mr-1`}></i> {catInfo.label}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {term.term}
          </h1>

          {term.aka.length > 0 && (
            <p className="term-aka text-white/40 text-sm mb-6">
              Aussi appele : {term.aka.join(", ")}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
            <Link
              href="/glossaire"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-arrow-left"></i> Voir tout le glossaire
            </Link>
          </div>
        </div>
      </section>

      {/* Definition + Sidebar */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Definition */}
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

              {/* Deep links grid */}
              {(service || problem || pricing) && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {service && (
                    <Link
                      href={`/services/${service.slug}`}
                      className="bg-[var(--color-teal)]/5 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i
                        className={`${service.icon} text-[var(--color-teal)] text-xl mb-2 block`}
                      ></i>
                      <p className="text-xs font-semibold group-hover:text-[var(--color-teal)]">
                        Service associe
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {service.shortTitle}
                      </p>
                    </Link>
                  )}
                  {problem && (
                    <Link
                      href={`/problemes/${problem.slug}`}
                      className="bg-red-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i
                        className={`${problem.icon} text-[var(--color-red)] text-xl mb-2 block`}
                      ></i>
                      <p className="text-xs font-semibold group-hover:text-[var(--color-red)]">
                        Probleme lie
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {problem.shortTitle}
                      </p>
                    </Link>
                  )}
                  {pricing && (
                    <Link
                      href={`/prix/${pricing.slug}`}
                      className="bg-green-50/50 rounded-xl p-5 hover:shadow-md transition-all group text-center"
                    >
                      <i className="fas fa-dollar-sign text-green-600 text-xl mb-2 block"></i>
                      <p className="text-xs font-semibold group-hover:text-green-600">
                        Grille de prix
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {pricing.priceRange.min}$ — {pricing.priceRange.max}$
                      </p>
                    </Link>
                  )}
                </div>
              )}

              {/* Related terms */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-link text-[var(--color-teal)]"></i>
                    Termes relies
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {related.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/glossaire/${g.slug}`}
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

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white rounded-2xl p-6 sticky top-[120px] space-y-6 shadow-sm border border-[var(--color-border)]">
                <div>
                  <h3 className="font-bold mb-2">Besoin d&apos;aide?</h3>
                  <p className="text-[var(--color-muted)] text-xs mb-4">
                    Nos experts peuvent vous expliquer et regler votre
                    situation.
                  </p>
                  <a
                    href="tel:15148258411"
                    className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-5 py-3 rounded-xl hover:bg-[var(--color-red-dark)] transition-colors w-full text-sm mb-2"
                  >
                    <i className="fas fa-phone"></i> 514-825-8411
                  </a>
                  <Link
                    href="/diagnostic"
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-purple-700 transition-colors w-full text-sm"
                  >
                    <i className="fas fa-stethoscope"></i> Diagnostic gratuit
                  </Link>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href="/glossaire"
                    className="text-sm text-[var(--color-teal)] font-medium hover:underline"
                  >
                    &larr; Voir tout le glossaire
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Obtenez votre soumission gratuite
          </h2>
          <p className="text-white/80 mb-8">
            Prix competitifs, service rapide et garantie 10 ans. Contactez-nous
            pour tous vos besoins en portes et fenetres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission
            </Link>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Browse shop */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Boutique en ligne</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Besoin de pieces? Achetez en ligne!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Plus de 740 pieces de remplacement pour portes, fenetres et
            moustiquaires disponibles dans notre boutique en ligne.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </>
  );
}
