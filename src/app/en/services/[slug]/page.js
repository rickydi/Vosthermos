import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SERVICES_EN,
  getServiceEn,
  generateStaticParamsEn,
} from "@/lib/services-data-en";
import { COMPANY_INFO } from "@/lib/company-info";

export function generateStaticParams() {
  return generateStaticParamsEn();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getServiceEn(slug);
  if (!service) return {};
  const url = `https://www.vosthermos.com/en/services/${service.slug}`;
  const frUrl = `https://www.vosthermos.com/services/${service.frSlug}`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: url,
      languages: {
        "fr-CA": frUrl,
        "en-CA": url,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: service.metaTitle,
      description: service.metaDescription,
      images: [{ url: COMPANY_INFO.logo }],
      locale: "en_CA",
    },
  };
}

export default async function ServicePageEn({ params }) {
  const { slug } = await params;
  const service = getServiceEn(slug);
  if (!service) notFound();

  const related = service.relatedServices
    .map((s) => SERVICES_EN.find((sv) => sv.slug === s))
    .filter(Boolean);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.heroDescription,
    url: `https://www.vosthermos.com/en/services/${service.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: COMPANY_INFO.phoneTel,
      email: COMPANY_INFO.email,
      url: COMPANY_INFO.url,
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_INFO.address,
        addressLocality: COMPANY_INFO.city,
        addressRegion: COMPANY_INFO.province,
        postalCode: COMPANY_INFO.postalCode,
        addressCountry: "CA",
      },
    },
    areaServed: [
      { "@type": "City", name: "Montreal" },
      { "@type": "City", name: "Laval" },
      { "@type": "City", name: "Longueuil" },
      { "@type": "City", name: "Brossard" },
      { "@type": "City", name: "Saint-Hyacinthe" },
      { "@type": "City", name: "Granby" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/en/#services"
              className="hover:text-white transition-colors"
            >
              Services
            </Link>
            <span>/</span>
            <span className="text-white">{service.shortTitle}</span>
          </div>

          {/* Icon badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className={`${service.icon} mr-1`}></i> {service.shortTitle}
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            {service.title.split(" ").length > 4 ? (
              <>
                {service.title.split(" ").slice(0, -3).join(" ")}{" "}
                <span className="text-[var(--color-red)]">
                  {service.title.split(" ").slice(-3).join(" ")}
                </span>
              </>
            ) : (
              service.title
            )}
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            {service.heroDescription}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                15+
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                yrs exp.
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                10 yrs
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                warranty
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                5&#9733;
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                reviews
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
              href="/en/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Free quote
            </Link>
          </div>
        </div>
      </section>

      {/* Content sections */}
      {service.sections.map((section, i) => (
        <section
          key={i}
          className={`${i % 2 === 0 ? "bg-[var(--color-background)]" : "bg-white border-t border-b border-[var(--color-border)]"} py-16`}
        >
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, j) => (
              <p
                key={j}
                className="text-[var(--color-muted)] leading-relaxed mb-4 max-w-3xl"
              >
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}

      {/* What we repair */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">What we repair</span>
            <h2 className="text-3xl font-extrabold">
              Our expertise in{" "}
              <span className="text-[var(--color-red)]">
                {service.shortTitle.toLowerCase()}
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.whatWeRepair.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-[var(--color-border)]"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-check text-sm text-[var(--color-teal)]"></i>
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">How it works</span>
            <h2 className="text-3xl font-extrabold text-white">
              A{" "}
              <span className="text-[var(--color-red)]">simple and fast</span> process
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {service.process.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starting price */}
      <section className="bg-white py-16 border-t border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[var(--color-background)] rounded-2xl p-8 md:p-12 text-center border border-[var(--color-border)]">
            <span className="section-tag">Pricing</span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
              {service.shortTitle}
            </h2>
            <div className="inline-block bg-[var(--color-red)] text-white text-xl md:text-2xl font-extrabold px-8 py-4 rounded-full mb-6">
              {service.startingPrice}
            </div>
            <p className="text-[var(--color-muted)] max-w-lg mx-auto mb-8">
              Contact us for an accurate quote tailored to your needs. All our
              quotes are free and without obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
              >
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link
                href="/en/contact"
                className="inline-flex items-center justify-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-teal)] border border-[var(--color-border)] hover:border-[var(--color-teal)]/30 px-8 py-4 rounded-full font-bold transition-all"
              >
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Frequently asked questions</span>
            <h2 className="text-3xl font-extrabold">
              Everything about{" "}
              <span className="text-[var(--color-red)]">
                {service.shortTitle.toLowerCase()}
              </span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {service.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-left hover:bg-[var(--color-background)] transition-colors">
                  <span>{item.question}</span>
                  <i className="fas fa-chevron-down text-[var(--color-muted)] text-sm transition-transform group-open:rotate-180 flex-shrink-0"></i>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-[var(--color-muted)] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="bg-white py-16 border-t border-[var(--color-border)]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10">
              <span className="section-tag">Related services</span>
              <h2 className="text-2xl font-extrabold">
                Discover our{" "}
                <span className="text-[var(--color-red)]">other services</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/en/services/${rel.slug}`}
                  className="group bg-[var(--color-background)] rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)]"
                >
                  <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-red)] transition-colors">
                    <i
                      className={`${rel.icon} text-xl text-[var(--color-teal)] group-hover:text-white transition-colors`}
                    ></i>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{rel.shortTitle}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                    {rel.heroDescription.slice(0, 120)}...
                  </p>
                  <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold">
                    Learn more{" "}
                    <i className="fas fa-arrow-right text-xs"></i>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Need {service.shortTitle.toLowerCase()} service?
          </h2>
          <p className="text-white/80 mb-8">
            Free quote, fast and guaranteed service. Our team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Request a quote
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

      {/* Browse shop */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Online shop</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Need parts? Buy online!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Over 740 replacement parts for doors, windows and screen doors
            available in our online store.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Browse the shop <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </>
  );
}
