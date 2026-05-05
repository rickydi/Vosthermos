import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "@/lib/services-data";
import { SERVICES_EN } from "@/lib/services-data-en";
import { CITIES, getCity } from "@/lib/cities";
import { getServiceSeo } from "@/lib/seo-templates";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";

const LOCAL_SERVICE_CITY_PAGES = {
  "reparation-porte-patio:beloeil": {
    seoTitle: "Reparation porte patio Beloeil | Roulettes et rail",
    seoDescription:
      `Porte patio difficile a ouvrir a Beloeil? Reparation de roulettes, rail, serrure, poignee et coupe-froid. Service a domicile a Beloeil. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de porte patio a Beloeil",
    lead:
      "Service specialise de reparation de porte patio a Beloeil: roulettes usees, rail encrasse, serrure bloquee, poignee brisee, coupe-froid fatigue ou thermos embue.",
    schemaName: "Reparation de porte patio a Beloeil",
    schemaDescription:
      "Reparation de portes patio coulissantes a Beloeil: remplacement de roulettes, ajustement de rail, serrure, poignee, coupe-froid et thermos.",
    serviceType: "Reparation de porte patio",
    alternateName: ["reparation porte patio Beloeil", "reparation porte-patio Beloeil"],
    sections: [
      {
        heading: "Reparation porte patio Beloeil: roulettes, rail et serrure",
        paragraphs: [
          "A Beloeil, beaucoup de portes patio installees dans les maisons des annees 1970 a 2000 commencent a forcer sur le rail. Les roulettes s'aplatissent, le rail accumule de la salete et la porte devient lourde a ouvrir.",
          "Nos techniciens interviennent dans le Vieux-Beloeil, le secteur de la Montagne, le Domaine Beloeil, la rue Richelieu et le boulevard Sir-Wilfrid-Laurier pour remettre les portes patio en fonction sans remplacer la porte complete.",
          "La proximite de la riviere Richelieu peut aussi accelerer la corrosion de la quincaillerie et fatiguer les coupe-froids. On verifie les roulettes, le rail, la poignee, la serrure et l'etancheite avant de recommander la reparation la plus economique.",
        ],
      },
    ],
    issues: [
      "Porte patio lourde ou difficile a glisser dans les maisons du Domaine Beloeil et du secteur de la Montagne",
      "Roulettes usees, rail sale ou seuil abime sur les portes patio des constructions 1970-2000",
      "Poignee, serrure ou coupe-froid fatigues dans les secteurs plus humides pres de la rue Richelieu",
    ],
    faq: [
      {
        q: "Reparez-vous les portes patio a Beloeil?",
        a: "Oui. Nous reparons les portes patio a Beloeil: roulettes, rail, serrure, poignee, coupe-froid et thermos. Le technicien se deplace sur place et verifie si la porte peut etre reparee avant de proposer un remplacement complet.",
      },
      {
        q: "Combien coute une reparation de porte patio a Beloeil?",
        a: "La plupart des reparations de porte patio coutent entre 150$ et 600$ selon le probleme. Le remplacement de roulettes ou l'ajustement du rail coute beaucoup moins cher qu'une porte neuve. La soumission est gratuite.",
      },
    ],
  },
  "reparation-porte-patio:beauharnois": {
    seoTitle: "Reparation porte patio Beauharnois | Roulettes et rail",
    seoDescription:
      `Porte patio difficile a ouvrir a Beauharnois? Reparation de roulettes, rail, serrure, poignee et coupe-froid. Service a domicile a Beauharnois. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de porte patio a Beauharnois",
    lead:
      "Service specialise de reparation de porte patio a Beauharnois: roulettes usees, rail encrasse, serrure bloquee, poignee brisee, coupe-froid fatigue ou thermos embue.",
    schemaName: "Reparation de porte patio a Beauharnois",
    schemaDescription:
      "Reparation de portes patio coulissantes a Beauharnois: remplacement de roulettes, ajustement de rail, serrure, poignee, coupe-froid et thermos.",
    serviceType: "Reparation de porte patio",
    alternateName: ["reparation porte patio Beauharnois", "reparation porte-patio Beauharnois"],
    sections: [
      {
        heading: "Reparation porte patio Beauharnois: roulettes, rail et serrure",
        paragraphs: [
          "A Beauharnois, l'humidite du canal de Beauharnois et du lac Saint-Louis peut accelerer la corrosion des roulettes, serrures et rails de portes patio. Une porte qui devient lourde a ouvrir n'a pas toujours besoin d'etre remplacee.",
          "Nos techniciens interviennent dans le centre-ville, Maple Grove, le secteur du Canal, Melocheville et Saint-Etienne-de-Beauharnois pour reparer les portes patio sur place: roulettes, rail, poignee, serrure, coupe-froid et thermos.",
          "Les maisons ouvrieres plus anciennes et les constructions des annees 1980-2000 ont souvent des portes patio reparables. On verifie l'alignement, l'etat du rail et la quincaillerie avant de recommander la solution la plus economique.",
        ],
      },
    ],
    issues: [
      "Roulettes et rails de porte patio corrodes par l'humidite du canal de Beauharnois",
      "Portes patio lourdes ou difficiles a glisser dans les maisons de Maple Grove et du centre-ville",
      "Poignee, serrure ou coupe-froid fatigues dans les secteurs riverains pres du lac Saint-Louis",
    ],
    faq: [
      {
        q: "Reparez-vous les portes patio a Beauharnois?",
        a: "Oui. Nous reparons les portes patio a Beauharnois: roulettes, rail, serrure, poignee, coupe-froid et thermos. Le technicien se deplace sur place et verifie si la porte peut etre reparee avant de proposer un remplacement complet.",
      },
      {
        q: "Combien coute une reparation de porte patio a Beauharnois?",
        a: "La plupart des reparations de porte patio coutent entre 150$ et 600$ selon le probleme. Le remplacement de roulettes, l'ajustement du rail ou le changement de serrure coute beaucoup moins cher qu'une porte neuve. La soumission est gratuite.",
      },
    ],
  },
};

function getLocalServiceCityPage(serviceSlug, citySlug) {
  return LOCAL_SERVICE_CITY_PAGES[`${serviceSlug}:${citySlug}`] || null;
}

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

  const localPage = getLocalServiceCityPage(slug, ville);
  const { title, description } = localPage
    ? { title: localPage.seoTitle, description: localPage.seoDescription }
    : getServiceSeo(slug, city, service.shortTitle);
  const englishService = SERVICES_EN.find((item) => item.frSlug === service.slug);
  const url = `https://www.vosthermos.com/services/${service.slug}/${city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: englishService
        ? {
            "fr-CA": url,
            "en-CA": `https://www.vosthermos.com/en/services/${englishService.slug}/${city.slug}`,
          }
        : undefined,
    },
    openGraph: {
      type: "website",
      url,
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

  const localPage = getLocalServiceCityPage(slug, ville);
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localPage?.schemaName || `${service.shortTitle} a ${city.name}`,
    description: localPage?.schemaDescription || `Service professionnel de ${service.shortTitle.toLowerCase()} a ${city.name}. Vosthermos offre un service rapide et garanti.`,
    serviceType: localPage?.serviceType || service.shortTitle,
    ...(localPage?.alternateName ? { alternateName: localPage.alternateName } : {}),
    url: `https://www.vosthermos.com/services/${service.slug}/${city.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      email: COMPANY_INFO.email,
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_INFO.address,
        addressLocality: COMPANY_INFO.city,
        addressRegion: "QC",
        addressCountry: "CA",
      },
    },
    areaServed: { "@type": "City", name: city.name },
  };

  const faqItems = [
    ...(localPage?.faq || []),
    {
      q: `Combien coute le service de ${service.shortTitle.toLowerCase()} a ${city.name}?`,
      a: `Le prix varie selon l'ampleur des travaux. Contactez-nous au ${COMPANY_INFO.phone} pour une soumission gratuite a ${city.name}. Nous nous deplacons dans tous les quartiers${city.neighborhoods ? ` incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}.`,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                {localPage?.h1 || `${service.shortTitle} a ${city.name}`}
              </h1>
              <p className="text-white/60 text-lg mb-6">
                {localPage?.lead || (
                  <>
                    Service professionnel de {service.shortTitle.toLowerCase()} a {city.name} et dans la region de {city.region}.
                    Nos experts se deplacent a {city.name} ({city.distance} de notre atelier) pour des travaux rapides et garantis.
                  </>
                )}
              </p>
              {/* Trust badge: hours */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
                <i className="fas fa-clock text-[var(--color-red-light)]"></i>
                <span>Lun-Ven 8h-17h &bull; Sam 9h-13h</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
                >
                  <i className="fas fa-phone"></i>
                  {COMPANY_INFO.phone}
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

            {/* Right: QuoteForm inline */}
            <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-8 border border-white/[0.08] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider">Service disponible</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-1">Soumission gratuite</h2>
              <p className="text-white/50 text-sm mb-5">
                {service.shortTitle} a {city.name} — reponse rapide.
              </p>
              <QuoteForm compact />
            </div>
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
                {localPage?.h1 || `${service.shortTitle} a ${city.name}`}
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

            {localPage?.sections?.map((section) => (
              <div key={section.heading}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            ))}

            {localPage?.issues && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Problemes de porte patio frequents a {city.name}
                </h2>
                <div className="space-y-3">
                  {localPage.issues.map((issue) => (
                    <div key={issue} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-exclamation-triangle text-xs"></i>
                      </div>
                      <p className="text-gray-700 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            {/* CTA card (sticky) */}
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px]">
              <h3 className="font-bold text-gray-900 mb-2">Besoin d&apos;aide immediate?</h3>
              <p className="text-gray-500 text-sm mb-4">
                Appelez-nous pour {service.shortTitle.toLowerCase()} a {city.name}.
              </p>
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3"
              >
                <i className="fas fa-phone"></i>
                {COMPANY_INFO.phone}
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
