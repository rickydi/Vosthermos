import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, getCity } from "@/lib/cities";

// Pre-generate all city pages at build time for SEO
export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) return {};
  return {
    title: `Reparation de portes et fenetres a ${city.name} | Vosthermos`,
    description: `Service de reparation de portes et fenetres a ${city.name}, ${city.region}. Remplacement de vitres thermos, quincaillerie, moustiquaires. Garantie 10 ans. Soumission gratuite 514-825-8411.`,
    alternates: { canonical: `https://www.vosthermos.com/secteurs/${city.slug}` },
  };
}

const services = [
  {
    icon: "fa-cogs",
    title: "Remplacement de quincaillerie",
    desc: "Remplacement professionnel de la quincaillerie de vos portes-patio et fenetres. Pieces adaptees et installation rapide.",
  },
  {
    icon: "fa-snowflake",
    title: "Remplacement de vitre thermos",
    desc: "Buee ou perte d'efficacite thermique? Remplacement professionnel avec garantie de 10 ans sur tous nos travaux.",
  },
  {
    icon: "fa-door-open",
    title: "Reparation de portes en bois",
    desc: "Reparation et restauration de portes et fenetres en bois. Estimation gratuite et execution parfaite.",
  },
  {
    icon: "fa-border-all",
    title: "Moustiquaires sur mesure",
    desc: "Fabrication sur mesure et reparation de tous types de moustiquaires. Service rapide et etancheite garantie.",
  },
];

export default async function CityPage({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Reparation de portes et fenetres a ${city.name}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      email: "info@vosthermos.com",
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "330 Ch. St-Francois-Xavier, Local 101",
        addressLocality: "Saint-Francois-Xavier",
        addressRegion: "QC",
        addressCountry: "CA",
      },
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "AdministrativeArea", name: city.region },
    },
    description: `Service professionnel de reparation de portes et fenetres a ${city.name}. Remplacement de vitres thermos avec garantie 10 ans, quincaillerie, portes en bois, moustiquaires sur mesure.`,
  };

  const faqJsonLd = city.faq && city.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : null;

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Reparation de portes et fenetres a ${city.name}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".faq-question", ".faq-answer"],
    },
    url: `https://www.vosthermos.com/secteurs/${city.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[65px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/#secteurs" className="hover:text-white transition-colors">Secteurs</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <i className="fas fa-map-marker-alt mr-1"></i> {city.region} &bull; a {city.distance} de nos bureaux
            </span>
            {city.population && (
              <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <i className="fas fa-users mr-1"></i> {city.population}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Reparation de portes et fenetres a{" "}
            <span className="text-[var(--color-red)]">{city.name}</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            {city.description || `Vosthermos offre un service professionnel de reparation de portes et fenetres a ${city.name} et dans toute la region de ${city.region}. Remplacement de vitres thermos avec garantie 10 ans, quincaillerie, moustiquaires sur mesure et plus.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Soumission gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* Quartiers desservis */}
      {city.neighborhoods && city.neighborhoods.length > 0 && (
        <section className="bg-white py-16 border-b border-[var(--color-border)]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10">
              <span className="section-tag">Quartiers desservis</span>
              <h2 className="text-3xl font-extrabold">
                Nous nous deplacons dans <span className="text-[var(--color-red)]">tous les quartiers</span> de {city.name}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {city.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-2 bg-[var(--color-background)] rounded-full px-5 py-3 text-sm font-medium border border-[var(--color-border)]"
                >
                  <i className="fas fa-map-pin text-[var(--color-teal)] text-xs"></i>
                  {n}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Problemes frequents */}
      {city.commonIssues && city.commonIssues.length > 0 && (
        <section className="bg-[var(--color-background)] py-16 border-b border-[var(--color-border)]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10">
              <span className="section-tag">Problemes frequents</span>
              <h2 className="text-3xl font-extrabold">
                Enjeux courants a <span className="text-[var(--color-red)]">{city.name}</span>
              </h2>
              <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
                Voici les problemes que nous rencontrons le plus souvent chez nos clients de {city.name} et des environs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {city.commonIssues.map((issue, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center shrink-0 mt-1">
                    <i className="fas fa-exclamation-triangle text-[var(--color-red)] text-sm"></i>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos services a {city.name}</span>
            <h2 className="text-3xl font-extrabold">
              Des solutions pour <span className="text-[var(--color-red)]">tous vos besoins</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5">
                  <i className={`fas ${s.icon} text-xl text-[var(--color-teal)]`}></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Vosthermos */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Pourquoi Vosthermos</span>
            <h2 className="text-3xl font-extrabold text-white">
              Votre partenaire de confiance a <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "fa-award", title: "15+ ans d'experience", desc: `Notre equipe dessert ${city.name} et la region de ${city.region} avec professionnalisme depuis plus de 15 ans.` },
              { icon: "fa-shield-alt", title: "Garantie 10 ans", desc: "Tous nos remplacements de vitres thermos sont couverts par une garantie de 10 ans pour votre tranquillite d'esprit." },
              { icon: "fa-truck", title: `Service a ${city.name}`, desc: `Nous nous deplacons a ${city.name} (a seulement ${city.distance} de nos bureaux) pour tous vos besoins en reparation.` },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {city.faq && city.faq.length > 0 && (
        <section className="bg-[var(--color-background)] py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <span className="section-tag">Questions frequentes</span>
              <h2 className="text-3xl font-extrabold">
                Vos questions sur nos services a{" "}
                <span className="text-[var(--color-red)]">{city.name}</span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {city.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-left hover:bg-[var(--color-background)] transition-colors">
                    <span className="faq-question">{item.question}</span>
                    <i className="fas fa-chevron-down text-[var(--color-muted)] text-sm transition-transform group-open:rotate-180 flex-shrink-0"></i>
                  </summary>
                  <div className="faq-answer px-6 pb-5">
                    <p className="text-[var(--color-muted)] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Boutique CTA */}
      <section className="bg-white py-16 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Boutique en ligne</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Besoin de pieces? Achetez en ligne!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires disponibles dans notre boutique en ligne.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Besoin d&apos;une reparation a {city.name}?
          </h2>
          <p className="text-white/80 mb-8">
            Soumission gratuite, service rapide et garanti. Notre equipe se deplace a {city.name} et partout dans la region de {city.region}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact" className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all">
              Demander une soumission
            </Link>
            <a href="tel:15148258411" className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all">
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-center mb-8">
            Autres <span className="text-[var(--color-red)]">secteurs desservis</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/secteurs/${c.slug}`}
                className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 text-sm font-medium hover:shadow-md hover:bg-[var(--color-teal)] hover:text-white transition-all border border-[var(--color-border)]"
              >
                <i className="fas fa-map-marker-alt text-[var(--color-red)] text-xs"></i>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
