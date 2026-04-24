import Link from "next/link";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary-data";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Glossaire des portes et fenetres | Termes techniques | Vosthermos",
  description:
    "Lexique complet des termes techniques de portes et fenetres : vitre thermos, Low-E, gaz argon, coupe-froid, calfeutrage, quincaillerie et plus. Vocabulaire et definitions claires par les experts Vosthermos.",
  alternates: {
    canonical: "https://www.vosthermos.com/glossaire",
    languages: {
      "fr-CA": "https://www.vosthermos.com/glossaire",
      "en-CA": "https://www.vosthermos.com/en/glossaire",
    },
  },
  openGraph: {
    title: "Glossaire des portes et fenetres | Vosthermos",
    description:
      "Lexique complet des termes techniques de portes et fenetres. Definitions claires par nos experts : thermos, Low-E, argon, quincaillerie, calfeutrage et plus.",
    url: "https://www.vosthermos.com/glossaire",
    siteName: "Vosthermos",
    locale: "fr_CA",
    type: "website",
  },
};

export default function GlossairePage() {
  const termSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Glossaire des portes et fenetres — Vosthermos",
    description:
      "Lexique complet des termes techniques de portes et fenetres au Quebec. Vocabulaire, definitions et explications par les experts Vosthermos.",
    url: "https://www.vosthermos.com/glossaire",
    hasDefinedTerm: GLOSSARY.map((g) => ({
      "@type": "DefinedTerm",
      name: g.term,
      description: g.definition,
      url: `https://www.vosthermos.com/glossaire/${g.slug}`,
    })),
  };

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Glossaire des portes et fenetres",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".glossary-term-name"],
    },
    url: "https://www.vosthermos.com/glossaire",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termSetJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-white">Glossaire</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-book-open mr-1"></i> {GLOSSARY.length} definitions
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Glossaire des{" "}
            <span className="text-[var(--color-red)]">portes et fenetres</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Lexique complet des termes techniques de portes et fenetres.
            Comprenez le vocabulaire des experts : vitre thermos, Low-E, gaz
            argon, coupe-froid, quincaillerie et plus. Definitions claires et
            adaptees au marche quebecois.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                {GLOSSARY.length}+
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                termes
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                {GLOSSARY_CATEGORIES.length}
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                categories
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                15+
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                ans d&apos;exp.
              </span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-stethoscope"></i> Diagnostic gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="bg-white border-b border-[var(--color-border)] sticky top-[70px] z-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {GLOSSARY_CATEGORIES.map((cat) => {
              const count = GLOSSARY.filter(
                (g) => g.category === cat.slug
              ).length;
              if (count === 0) return null;
              return (
                <a
                  key={cat.slug}
                  href={`#cat-${cat.slug}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap bg-[var(--color-background)] hover:bg-[var(--color-teal)]/10 text-sm font-medium px-4 py-2.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-all"
                >
                  <i className={`${cat.icon} text-xs`}></i>
                  {cat.label}
                  <span className="text-xs text-[var(--color-muted)]">
                    ({count})
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* A-Z Term Grid by Category */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {GLOSSARY_CATEGORIES.map((cat) => {
            const terms = GLOSSARY.filter(
              (g) => g.category === cat.slug
            ).sort((a, b) => a.term.localeCompare(b.term, "fr"));
            if (terms.length === 0) return null;
            return (
              <div key={cat.slug} id={`cat-${cat.slug}`} className="mb-14 scroll-mt-[140px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                    <i
                      className={`${cat.icon} text-sm text-[var(--color-teal)]`}
                    ></i>
                  </div>
                  <h2 className="text-xl font-extrabold">{cat.label}</h2>
                  <span className="text-xs text-[var(--color-muted)] bg-white px-3 py-1 rounded-full border border-[var(--color-border)]">
                    {terms.length} terme{terms.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {terms.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/glossaire/${g.slug}`}
                      className="group bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="glossary-term-name font-bold text-lg group-hover:text-[var(--color-teal)] transition-colors">
                          {g.term}
                        </h3>
                        <i className="fas fa-arrow-right text-xs text-[var(--color-muted)] group-hover:text-[var(--color-teal)] mt-2 flex-shrink-0 transition-colors"></i>
                      </div>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 flex-grow">
                        {g.definition}
                      </p>
                      {g.aka.length > 0 && (
                        <p className="text-xs text-[var(--color-muted)]/60 mt-3 line-clamp-1">
                          <i className="fas fa-tags mr-1"></i>
                          {g.aka.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Un terme vous echappe?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Nos experts sont disponibles pour repondre a toutes vos questions
            sur vos portes et fenetres. Soumission gratuite et sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission
            </Link>
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Browse related pages */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Explorez</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Autres ressources{" "}
            <span className="text-[var(--color-red)]">utiles</span>
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Consultez nos outils gratuits pour diagnostiquer vos problemes et
            estimer vos economies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] px-6 py-3 rounded-full font-bold border border-[var(--color-border)] hover:shadow-md transition-all"
            >
              <i className="fas fa-stethoscope text-purple-600"></i> Diagnostic
              gratuit
            </Link>
            <Link
              href="/problemes"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] px-6 py-3 rounded-full font-bold border border-[var(--color-border)] hover:shadow-md transition-all"
            >
              <i className="fas fa-exclamation-triangle text-[var(--color-red)]"></i>{" "}
              Problemes courants
            </Link>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] px-6 py-3 rounded-full font-bold border border-[var(--color-border)] hover:shadow-md transition-all"
            >
              <i className="fas fa-shopping-cart text-[var(--color-teal)]"></i>{" "}
              Boutique en ligne
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
