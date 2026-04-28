import Link from "next/link";
import { SERVICES } from "@/lib/services-data";
import { CITIES } from "@/lib/cities";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";

export const metadata = {
  title: "Services de réparation portes & fenêtres | Thermos, quincaillerie, moustiquaires — Vosthermos",
  description:
    `10 services de réparation de portes et fenêtres : remplacement de vitres thermos dès 150$, quincaillerie, portes-patio, portes en bois, moustiquaires, calfeutrage et plus. Garantie 10 ans, 15 ans d'expérience. Montréal, Laval, Rive-Sud ☎ ${COMPANY_INFO.phone}`,
  alternates: {
    canonical: `${BASE}/services`,
    languages: {
      "fr-CA": `${BASE}/services`,
      "en-CA": `${BASE}/en/services`,
    },
  },
  openGraph: {
    type: "website",
    url: `${BASE}/services`,
    siteName: "Vosthermos",
    title: "Services de réparation portes & fenêtres | Vosthermos Montréal",
    description:
      "10 services spécialisés : vitres thermos, quincaillerie, portes-patio, portes en bois, moustiquaires, calfeutrage. Garantie 10 ans. Montréal, Laval, Rive-Sud.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services Vosthermos | 10 spécialités portes & fenêtres",
    description: `Vitres thermos, quincaillerie, portes-patio et plus. Garantie 10 ans ☎ ${COMPANY_INFO.phone}`,
    images: [`${BASE}/images/Vos-Thermos-Logo.png`],
  },
  robots: "index, follow",
  other: { "geo.region": "CA-QC" },
};

const servicesHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${BASE}/services#collection`,
  url: `${BASE}/services`,
  name: "Services de réparation de portes et fenêtres — Vosthermos",
  description:
    "Catalogue complet des services de réparation de portes et fenêtres offerts par Vosthermos dans la grande région de Montréal.",
  about: { "@id": `${BASE}/#business` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        "@id": `${BASE}/services/${s.slug}`,
        name: s.title,
        description: s.heroDescription,
        url: `${BASE}/services/${s.slug}`,
        provider: { "@id": `${BASE}/#business` },
        areaServed: { "@type": "State", name: "Quebec" },
        ...(s.startingPrice && {
          offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            description: s.startingPrice,
          },
        }),
      },
    })),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
    { "@type": "ListItem", position: 2, name: "Services", item: `${BASE}/services` },
  ],
};

export default function ServicesPage() {
  const topCities = CITIES.slice(0, 12);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesHubJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <nav className="text-sm text-[var(--color-muted)] mb-6" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Services</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Réparation de portes et fenêtres : thermos, quincaillerie, moustiquaires
          </h1>
          <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-3xl">
            Vosthermos offre 10 services spécialisés pour réparer vos portes et fenêtres
            sans avoir à les remplacer. Remplacement de vitres thermos dès 150$,
            quincaillerie, portes-patio, portes en bois, moustiquaires, calfeutrage et plus.
            Service professionnel avec garantie 10 ans, 15 ans d&apos;expérience.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-light)] transition"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {COMPANY_INFO.phone}
            </a>
            <Link
              href="/contact"
              className="bg-white border border-[var(--color-border)] text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Soumission gratuite en 24h
            </Link>
          </div>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Nos 10 services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-lg hover:border-[var(--color-primary)] transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  {s.icon && (
                    <span className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition">
                      <i className={s.icon} aria-hidden="true"></i>
                    </span>
                  )}
                  <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--color-primary)] transition">
                    {s.shortTitle}
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
                  {s.heroDescription.slice(0, 130)}…
                </p>
                {s.startingPrice && (
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    {s.startingPrice}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-14">
          <h2 className="text-2xl font-bold mb-4">Pourquoi réparer plutôt que remplacer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[var(--color-muted)]">
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-dollar-sign mr-2" aria-hidden="true"></i>
                Économies jusqu&apos;à 70%
              </h3>
              <p>
                Remplacer seulement la vitre thermos ou la quincaillerie coûte une fraction
                du prix d&apos;une porte ou fenêtre neuve.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-leaf mr-2" aria-hidden="true"></i>
                Geste écologique
              </h3>
              <p>
                Moins de matériel envoyé aux déchets, moins d&apos;émissions liées à la
                fabrication de nouveaux cadres.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-shield-alt mr-2" aria-hidden="true"></i>
                Garantie 10 ans
              </h3>
              <p>
                Tous nos remplacements de thermos sont couverts par notre garantie
                professionnelle de 10 ans, transférable au prochain propriétaire.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Secteurs desservis</h2>
          <p className="text-[var(--color-muted)] mb-6">
            Nos services sont disponibles dans plus de 25 villes de la grande région de
            Montréal, dans un rayon de 100 km autour de Delson.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topCities.map((c) => (
              <Link
                key={c.slug}
                href={`/reparation-portes-et-fenetres/${c.slug}`}
                className="bg-white rounded-lg px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition text-sm font-medium"
              >
                <i className="fas fa-map-marker-alt mr-2 text-[var(--color-primary)]" aria-hidden="true"></i>
                {c.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-4">
            + {CITIES.length - topCities.length} autres villes. Contactez-nous pour vérifier
            notre zone de service.
          </p>
        </section>

        <section className="bg-[var(--color-primary)] text-white rounded-xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Besoin d&apos;une soumission?</h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Soumission gratuite en 24h. Notre équipe se déplace gratuitement pour évaluer
            vos besoins et vous fournir un devis clair et précis, sans engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {COMPANY_INFO.phone}
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
