import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES } from "@/lib/cities";
import { CITY_COORDS } from "@/lib/city-coords";
import { CITY_PAGE_SEO } from "@/lib/seo-templates";

const BASE = "https://www.vosthermos.com";

const SERVICES_LIST = [
  { slug: "remplacement-vitre-thermos", name: "Remplacement de vitre thermos", price: "Dès 150$" },
  { slug: "remplacement-quincaillerie", name: "Remplacement de quincaillerie", price: "Dès 4,99$" },
  { slug: "reparation-porte-patio", name: "Réparation de porte-patio", price: "Dès 150$" },
  { slug: "reparation-porte-fenetre", name: "Réparation de porte-fenêtre", price: "Dès 180$" },
  { slug: "reparation-portes-bois", name: "Restauration de portes en bois", price: "Sur mesure" },
  { slug: "moustiquaires-sur-mesure", name: "Moustiquaires sur mesure", price: "Dès 25$" },
  { slug: "calfeutrage", name: "Calfeutrage de portes et fenêtres", price: "Dès 8$/LNF" },
  { slug: "desembuage", name: "Désembuage de vitres thermos", price: "Dès 80$" },
  { slug: "insertion-porte", name: "Insertion de porte", price: "Sur mesure" },
  { slug: "coupe-froid", name: "Coupe-froid", price: "Dès 5$/LNF" },
];

function getCity(slug) {
  return CITIES.find((c) => c.slug === slug) || null;
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "Ville non trouvée | Vosthermos" };

  const tpl = CITY_PAGE_SEO["reparation-portes-et-fenetres"];
  const title = tpl.title(city);
  const description = tpl.description(city);
  const url = `${BASE}/reparation-portes-et-fenetres/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: url,
        en: `${BASE}/en/reparation-portes-et-fenetres/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: "Vosthermos",
      title,
      description,
      images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
      locale: "fr_CA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE}/images/Vos-Thermos-Logo.png`],
    },
    robots: "index, follow",
    other: {
      "geo.region": "CA-QC",
      "geo.placename": city.name,
    },
  };
}

export default async function CityRepairPage({ params }) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const coords = CITY_COORDS[slug] || { lat: 45.5019, lng: -73.5674 };
  const url = `${BASE}/reparation-portes-et-fenetres/${slug}`;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#business`,
    name: `Vosthermos — Réparation portes et fenêtres ${city.name}`,
    description: `Réparation de portes, fenêtres et vitres thermos à ${city.name}, ${city.region}. Service professionnel avec garantie 10 ans, 15 ans d'expérience.`,
    url,
    telephone: "+15148258411",
    email: "info@vosthermos.com",
    image: `${BASE}/images/Vos-Thermos-Logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "330 Ch. St-François-Xavier, Local 101",
      addressLocality: "Saint-François-Xavier",
      addressRegion: "QC",
      postalCode: "J0H 1S0",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng },
    areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "AdministrativeArea", name: city.region } },
    priceRange: "$$",
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
      { "@type": "ListItem", position: 2, name: "Secteurs desservis", item: `${BASE}/reparation-portes-et-fenetres` },
      { "@type": "ListItem", position: 3, name: city.name, item: url },
    ],
  };

  const faqJsonLd = city.faq && city.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: city.faq.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer },
        })),
      }
    : null;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: "Réparation de portes et fenêtres",
    provider: { "@id": "https://www.vosthermos.com/#business" },
    areaServed: { "@type": "City", name: city.name },
    name: `Réparation portes et fenêtres ${city.name}`,
    description: `Service complet de réparation de portes, fenêtres et vitres thermos à ${city.name}.`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      lowPrice: "80",
      highPrice: "700",
      offerCount: "10",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        <nav className="text-sm text-[var(--color-muted)] mb-6" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-2">/</span>
          <span>Réparation portes et fenêtres</span>
          <span className="mx-2">/</span>
          <span className="font-medium">{city.name}</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Réparation de portes et fenêtres à {city.name}
          </h1>
          <p className="text-lg text-[var(--color-muted)] leading-relaxed">
            Vosthermos dessert {city.name} ({city.region}) depuis plus de 15 ans. Remplacement de vitres thermos dès 150$,
            quincaillerie, portes-patio, moustiquaires sur mesure et bien plus. Soumission gratuite en 24h,
            garantie 10 ans sur tous nos remplacements de thermos.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="tel:+15148258411"
              className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-light)] transition"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              514-825-8411
            </a>
            <Link
              href="/contact"
              className="bg-white border border-[var(--color-border)] text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Soumission gratuite
            </Link>
          </div>
        </header>

        <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
          <h2 className="text-2xl font-bold mb-4">Le parc immobilier de {city.name}</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">{city.description}</p>
          {city.neighborhoods && city.neighborhoods.length > 0 && (
            <>
              <h3 className="font-bold mt-6 mb-2">Quartiers desservis</h3>
              <ul className="flex flex-wrap gap-2">
                {city.neighborhoods.map((n) => (
                  <li
                    key={n}
                    className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </>
          )}
          {city.distance && (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              <i className="fas fa-map-marker-alt mr-2 text-[var(--color-primary)]" aria-hidden="true"></i>
              À {city.distance} de notre atelier — service régulier à {city.name}
            </p>
          )}
        </section>

        {city.commonIssues && city.commonIssues.length > 0 && (
          <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
            <h2 className="text-2xl font-bold mb-4">Problèmes fréquents à {city.name}</h2>
            <ul className="space-y-3">
              {city.commonIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-[var(--color-red)] mt-1" aria-hidden="true"></i>
                  <span className="text-[var(--color-muted)]">{issue}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
          <h2 className="text-2xl font-bold mb-6">Services offerts à {city.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES_LIST.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/${city.slug}`}
                className="block border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary)] hover:shadow-md transition"
              >
                <h3 className="font-semibold text-[var(--color-primary)]">{s.name}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-1">{s.price} à {city.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {city.faq && city.faq.length > 0 && (
          <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
            <h2 className="text-2xl font-bold mb-6">Questions fréquentes — {city.name}</h2>
            <div className="space-y-6">
              {city.faq.map((q, i) => (
                <div key={i}>
                  <h3 className="font-semibold mb-2">{q.question}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">{q.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[var(--color-primary)] text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Besoin d'une soumission à {city.name}?</h2>
          <p className="mb-6 opacity-90">
            Soumission gratuite en 24h, garantie 10 ans sur tous nos remplacements de thermos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:+15148258411"
              className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              514-825-8411
            </a>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[var(--color-primary)] transition"
            >
              Formulaire de contact
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
