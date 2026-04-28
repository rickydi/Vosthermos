import Link from "next/link";
import { SERVICES_EN } from "@/lib/services-data-en";
import { CITIES } from "@/lib/cities";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";

export const metadata = {
  title: "Door and Window Repair Services | Sealed Glass, Hardware, Screens - Vosthermos",
  description:
    `Door and window repair services: sealed glass replacement from $150, hardware, patio doors, wood doors, screens, caulking and more. Guaranteed service, 15 years of experience. Montreal, Laval, South Shore. ${COMPANY_INFO.phone}`,
  alternates: {
    canonical: `${BASE}/en/services`,
    languages: {
      "fr-CA": `${BASE}/services`,
      "en-CA": `${BASE}/en/services`,
    },
  },
  openGraph: {
    type: "website",
    url: `${BASE}/en/services`,
    siteName: "Vosthermos",
    title: "Door and Window Repair Services | Vosthermos Montreal",
    description:
      "Specialized services: sealed glass, hardware, patio doors, wood doors, screens, caulking and more. Guaranteed service. Montreal, Laval, South Shore.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vosthermos Services | Door and Window Repair",
    description: `Sealed glass, hardware, patio doors and more. Free quote ${COMPANY_INFO.phone}`,
    images: [`${BASE}/images/Vos-Thermos-Logo.png`],
  },
  robots: "index, follow",
  other: { "geo.region": "CA-QC" },
};

const servicesHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${BASE}/en/services#collection`,
  url: `${BASE}/en/services`,
  name: "Door and window repair services - Vosthermos",
  description:
    "Complete catalog of door and window repair services offered by Vosthermos in Greater Montreal.",
  about: { "@id": `${BASE}/#business` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: SERVICES_EN.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        "@id": `${BASE}/en/services/${s.slug}`,
        name: s.title,
        description: s.heroDescription,
        url: `${BASE}/en/services/${s.slug}`,
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
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/en/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${BASE}/en/services` },
  ],
};

export default function ServicesPageEn() {
  const topCities = CITIES.slice(0, 12);
  const cityServiceSlug = SERVICES_EN.find((service) => service.frSlug === "remplacement-vitre-thermos")?.slug || SERVICES_EN[0]?.slug;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesHubJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <nav className="text-sm text-[var(--color-muted)] mb-6" aria-label="Breadcrumb">
          <Link href="/en" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Services</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Door and window repair: sealed glass, hardware and screens
          </h1>
          <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-3xl">
            Vosthermos provides specialized services to repair doors and windows
            without replacing everything: sealed glass replacement from $150,
            hardware, patio doors, wood doors, screens, caulking and more.
            Professional service, guaranteed work and 15 years of experience.
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
              href="/en/contact"
              className="bg-white border border-[var(--color-border)] text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Free quote within 24h
            </Link>
          </div>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Our services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_EN.map((service) => (
              <Link
                key={service.slug}
                href={`/en/services/${service.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-lg hover:border-[var(--color-primary)] transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  {service.icon && (
                    <span className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition">
                      <i className={service.icon} aria-hidden="true"></i>
                    </span>
                  )}
                  <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--color-primary)] transition">
                    {service.shortTitle}
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
                  {service.heroDescription.slice(0, 130)}...
                </p>
                {service.startingPrice && (
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    {service.startingPrice}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-14">
          <h2 className="text-2xl font-bold mb-4">Why repair instead of replacing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[var(--color-muted)]">
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-dollar-sign mr-2" aria-hidden="true"></i>
                Save up to 70%
              </h3>
              <p>
                Replacing only the sealed glass unit or hardware costs a fraction
                of a new door or window.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-leaf mr-2" aria-hidden="true"></i>
                Eco-friendly
              </h3>
              <p>
                Less material sent to landfill and fewer emissions from producing
                complete new frames.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-primary)] mb-2">
                <i className="fas fa-shield-alt mr-2" aria-hidden="true"></i>
                Guaranteed service
              </h3>
              <p>
                Our sealed glass replacements and repairs are covered by professional
                Vosthermos workmanship.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Service areas</h2>
          <p className="text-[var(--color-muted)] mb-6">
            Our services are available in more than 25 cities across Greater Montreal,
            within a 100 km radius of Delson.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/en/services/${cityServiceSlug}/${city.slug}`}
                className="bg-white rounded-lg px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition text-sm font-medium"
              >
                <i className="fas fa-map-marker-alt mr-2 text-[var(--color-primary)]" aria-hidden="true"></i>
                {city.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-4">
            + {CITIES.length - topCities.length} other cities. Contact us to confirm
            your service area.
          </p>
        </section>

        <section className="bg-[var(--color-primary)] text-white rounded-xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Need a quote?</h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Free quote within 24h. Our team evaluates your needs and provides a clear,
            precise estimate with no obligation.
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
              href="/en/contact"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[var(--color-primary)] transition"
            >
              Contact form
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
