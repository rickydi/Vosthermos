import Link from "next/link";
import { SERVICES_EN } from "@/lib/services-data-en";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";

export const metadata = {
  title: "Door and Window Repair Services | Vosthermos",
  description:
    `Door and window repair services in Greater Montreal: sealed glass replacement, hardware, wooden doors, screens, caulking, defogging and weatherstripping. Free quote ${COMPANY_INFO.phone}.`,
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
    title: "Door and Window Repair Services | Vosthermos",
    description:
      "Professional door and window repair services for sealed glass, hardware, wooden doors, screens, caulking, defogging and weatherstripping.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vosthermos Services | Door and Window Repair",
    description: `Sealed glass, hardware, screens, caulking and more. Free quote ${COMPANY_INFO.phone}.`,
    images: [`${BASE}/images/Vos-Thermos-Logo.png`],
  },
  robots: "index, follow",
};

export default function ServicesPageEn() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE}/en/services#collection`,
    url: `${BASE}/en/services`,
    name: "Door and window repair services - Vosthermos",
    description:
      "Complete catalog of Vosthermos door and window repair services in Greater Montreal.",
    about: { "@id": `${BASE}/#business` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: SERVICES_EN.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE}/en/services/${service.slug}`,
        name: service.shortTitle,
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-teal-dark)] via-[#123f46] to-[var(--color-red)] text-white py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_28%),radial-gradient(circle_at_80%_0%,white,transparent_24%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70 mb-4">
            Services
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl">
            Door and window repair services
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-3xl mb-8">
            Repair instead of replacing: sealed glass units, hardware, wooden doors, screens, caulking,
            defogging, door inserts and weatherstripping across Greater Montreal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/contact" className="bg-white text-[var(--color-teal-dark)] px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors">
              Free quote
            </Link>
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="border border-white/40 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
              {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_EN.map((service) => (
              <Link
                key={service.slug}
                href={`/en/services/${service.slug}`}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center mb-5 group-hover:bg-[var(--color-teal)] group-hover:text-white transition-colors">
                  <i className={service.icon}></i>
                </div>
                <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-3">
                  {service.shortTitle}
                </h2>
                <p className="text-[var(--color-muted)] mb-5 line-clamp-4">
                  {service.description}
                </p>
                <span className="text-[var(--color-red)] font-bold inline-flex items-center gap-2">
                  Learn more <i className="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-surface)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-4">
              Not sure which service you need?
            </h2>
            <p className="text-[var(--color-muted)] mb-8">
              Use our diagnostic tool or send a photo. Our team can identify the issue and recommend
              the most cost-effective repair.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/en/diagnostic" className="bg-[var(--color-red)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Free diagnostic
              </Link>
              <Link href="/en/prix" className="border border-[var(--color-border)] px-6 py-3 rounded-xl font-bold text-[var(--color-text)] hover:bg-white transition-colors">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
