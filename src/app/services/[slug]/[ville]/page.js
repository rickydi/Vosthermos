import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "@/lib/services-data";
import { CITIES, getCity } from "@/lib/cities";
import { getServiceSeo } from "@/lib/seo-templates";

export function generateStaticParams() {
  const params = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      params.push({ slug: service.slug, ville: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) return {};

  const { title, description } = getServiceSeo(slug, city, service.shortTitle);

  return {
    title,
    description,
    alternates: { canonical: `https://www.vosthermos.com/services/${service.slug}/${city.slug}` },
    openGraph: {
      type: "website",
      url: `https://www.vosthermos.com/services/${service.slug}/${city.slug}`,
      title,
      description,
      images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "fr_CA",
    },
  };
}

export default async function ServiceCityPage({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) notFound();

  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.shortTitle} a ${city.name}`,
    description: `Service professionnel de ${service.shortTitle.toLowerCase()} a ${city.name}. Vosthermos offre un service rapide et garanti.`,
    url: `https://www.vosthermos.com/services/${service.slug}/${city.slug}`,
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
    areaServed: { "@type": "City", name: city.name },
  };

  const faqItems = [
    {
      q: `Combien coute le service de ${service.shortTitle.toLowerCase()} a ${city.name}?`,
      a: `Le prix varie selon l'ampleur des travaux. Contactez-nous au 514-825-8411 pour une soumission gratuite a ${city.name}. Nous nous deplacons dans tous les quartiers${city.neighborhoods ? ` incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}.`,
    },
    {
      q: `Desservez-vous ${city.name} pour ce service?`,
      a: `Oui, ${city.name} fait partie de notre zone de service. Nous sommes a seulement ${city.distance} de notre atelier. Nous couvrons ${city.name} et toute la region de ${city.region}.`,
    },
    {
      q: `Quel est le delai pour ${service.shortTitle.toLowerCase()} a ${city.name}?`,
      a: `En general, nous pouvons effectuer la soumission dans les 48 heures et proceder aux travaux dans un delai de 1 a 2 semaines. Pour les cas urgents a ${city.name}, contactez-nous directement.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-6">
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">{service.shortTitle}</Link>
            <span>/</span>
            <span className="text-white/70">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {service.shortTitle} a {city.name}
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mb-8">
            Service professionnel de {service.shortTitle.toLowerCase()} a {city.name} et dans la region de {city.region}.
            Nos experts se deplacent a {city.name} ({city.distance} de notre atelier) pour des travaux rapides et garantis.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:15148258411"
              className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
            >
              <i className="fas fa-phone"></i>
              514-825-8411
            </a>
            <Link
              href="/rendez-vous"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-file-alt"></i>
              Soumission gratuite
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* City context */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {service.shortTitle} a {city.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {city.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Vosthermos offre un service complet de {service.shortTitle.toLowerCase()} aux residents de {city.name}.
                {city.neighborhoods && city.neighborhoods.length > 0 && (
                  <> Nous desservons tous les quartiers incluant {city.neighborhoods.join(", ")}.</>
                )}
              </p>
            </div>

            {/* Common issues */}
            {city.commonIssues && city.commonIssues.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Problemes courants a {city.name}
                </h2>
                <div className="space-y-3">
                  {city.commonIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-exclamation-triangle text-xs"></i>
                      </div>
                      <p className="text-gray-700 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service details */}
            {service.sections && service.sections[0] && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.sections[0].heading}
                </h2>
                {service.sections[0].paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            )}

            {/* OPTI-FENETRE upsell */}
            <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                Programme OPTI-FENETRE a {city.name}
              </h3>
              <p className="text-white/70 mb-4 text-sm">
                Besoin de plusieurs reparations? Le programme OPTI-FENETRE regroupe tous nos
                services en un forfait cle en main — remise a neuf complete a une fraction du
                prix du remplacement.
              </p>
              <Link
                href="/opti-fenetre"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                Decouvrir OPTI-FENETRE
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions frequentes — {city.name}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900 pr-4 text-sm">{item.q}</span>
                      <i className="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* CTA card */}
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px]">
              <h3 className="font-bold text-gray-900 mb-2">Soumission gratuite</h3>
              <p className="text-gray-500 text-sm mb-4">
                Obtenez une evaluation gratuite pour {service.shortTitle.toLowerCase()} a {city.name}.
              </p>
              <a
                href="tel:15148258411"
                className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3"
              >
                <i className="fas fa-phone"></i>
                514-825-8411
              </a>
              <Link
                href="/rendez-vous"
                className="flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors w-full"
              >
                <i className="fas fa-calendar-alt"></i>
                Prendre rendez-vous
              </Link>
            </div>

            {/* Other services in this city */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Autres services a {city.name}</h3>
              <div className="space-y-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${city.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
                      <i className={`${s.icon} text-xs`}></i>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)] transition-colors">
                      {s.shortTitle}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/reparation-portes-et-fenetres/${city.slug}`}
                  className="block text-center text-[var(--color-teal)] text-sm font-medium mt-3 hover:underline"
                >
                  Tous nos services a {city.name} &rarr;
                </Link>
              </div>
            </div>

            {/* Other cities for this service */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">{service.shortTitle} — Autres villes</h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/services/${service.slug}/${c.slug}`}
                    className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-600 hover:text-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-colors border border-gray-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
