import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Window Glass Replacement Pricing 2026 | Price Guide | Vosthermos",
  description:
    "Discover our pricing for sealed glass unit replacement, custom thermos glass and window glass. Price per square foot, 2026 rate card and free quote. Professional service with professional guaranteed service.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/prix",
    languages: {
      fr: "https://www.vosthermos.com/prix",
      en: "https://www.vosthermos.com/en/prix",
    },
  },
  openGraph: {
    title: "Window Glass Replacement Pricing 2026 | Price Guide | Vosthermos",
    description:
      "2026 rate card for sealed glass replacement, custom thermos glass, hardware, caulking and more. Free quote.",
    url: "https://www.vosthermos.com/en/prix",
    siteName: "Vosthermos",
    locale: "en_CA",
    type: "website",
  },
};

const pricingCards = [
  {
    icon: "fas fa-snowflake",
    title: "Sealed glass replacement",
    price: "Starting at $150/unit installed",
    description:
      "Professional custom sealed glass unit replacement with a professional guaranteed service. Price varies by size and glass type.",
    slug: "sealed-glass-replacement",
  },
  {
    icon: "fas fa-cogs",
    title: "Hardware replacement",
    price: "Starting at $4.99/part",
    description:
      "Handles, locks, rollers and replacement parts for patio doors and windows. Installation included.",
    slug: "hardware-replacement",
  },
  {
    icon: "fas fa-door-open",
    title: "Wooden door repair",
    price: "On estimate",
    description:
      "Repair and restoration of wooden doors. Each project is unique, free detailed quote provided.",
    slug: "wooden-door-repair",
  },
  {
    icon: "fas fa-border-all",
    title: "Custom screen doors",
    price: "On estimate",
    description:
      "Manufacturing and repair of custom screen doors for all types of windows and patio doors.",
    slug: "custom-screen-doors",
  },
  {
    icon: "fas fa-fill-drip",
    title: "Caulking",
    price: "Starting at $8/linear foot",
    description:
      "Professional door and window caulking. Improve the airtightness and energy efficiency of your home.",
    slug: "caulking",
  },
  {
    icon: "fas fa-eye",
    title: "Defogging",
    price: "Starting at $120/unit",
    description:
      "Defogging treatment for foggy sealed glass units. Cost-effective solution without full replacement.",
    slug: "defogging",
  },
];

const priceFactors = [
  {
    icon: "fas fa-ruler-combined",
    title: "Glass dimensions",
    description:
      "The price per square foot varies by size. Larger surfaces cost proportionally less per square foot than smaller ones.",
  },
  {
    icon: "fas fa-layer-group",
    title: "Glass type",
    description:
      "Double or triple glazing, Low-E, argon, tempered or laminated -- each option influences the final price of the custom unit.",
  },
  {
    icon: "fas fa-hard-hat",
    title: "Accessibility",
    description:
      "Windows at height or difficult to access may require additional equipment, which affects the cost.",
  },
  {
    icon: "fas fa-boxes-stacked",
    title: "Quantity",
    description:
      "We offer volume discounts. The more units you replace in a single visit, the better the unit price.",
  },
];

const faqItems = [
  {
    question: "How much does sealed glass replacement cost?",
    answer:
      "Sealed glass replacement starts at $150 per installed unit. The final cost depends on the size, glass type (double, triple, Low-E, argon) and window accessibility. Contact us for a free and accurate quote.",
  },
  {
    question: "What is the price per square foot?",
    answer:
      "The price of a sealed unit per square foot generally ranges between $8 and $25 depending on the glass type chosen. A standard double unit costs less than a triple with argon gas and Low-E coating. We calculate the exact price during the home measurement visit.",
  },
  {
    question: "Is it more cost-effective to repair or replace a window?",
    answer:
      "In the vast majority of cases, replacing just the sealed glass unit ($150 to $450) is much more cost-effective than a full window replacement ($650 to $1,400). If your window frame is in good condition, sealed unit replacement is the ideal solution.",
  },
  {
    question: "Do prices include installation?",
    answer:
      "Yes, all our prices include measurements, custom sealed unit manufacturing, travel and professional installation. There are no hidden fees. The quote you receive is the final price.",
  },
  {
    question: "Do you offer volume discounts?",
    answer:
      "Absolutely! We offer tiered pricing for multi-unit projects. Whether it's for a condo, rental building or multiple windows in your home, the unit price decreases with quantity. Request your quote to find out your discount.",
  },
  {
    question: "Is the warranty included in the price?",
    answer:
      "Yes, each sealed glass replacement includes a professional guaranteed service at no additional cost. This warranty covers manufacturing defects, loss of airtightness and fog formation between the panes.",
  },
];

export default function PricingPageEn() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Sealed Glass Unit Replacement",
    description:
      "Professional custom sealed glass unit replacement service in Quebec. Competitive pricing, professional guaranteed service, free quote.",
    url: "https://www.vosthermos.com/en/prix",
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
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      lowPrice: "4.99",
      highPrice: "450",
      offerCount: "6",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Door and Window Repair Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Sealed Glass Replacement",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Sealed Glass Replacement",
              },
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "150",
                priceCurrency: "CAD",
                unitText: "unit",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Defogging",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Sealed Glass Defogging",
              },
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "120",
                priceCurrency: "CAD",
                unitText: "unit",
              },
            },
          ],
        },
      ],
    },
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
            <span className="text-white">Pricing</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-tag mr-1"></i> 2026 Rate Card
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Sealed glass{" "}
            <span className="text-[var(--color-red)]">replacement pricing</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Check our 2026 rate card for sealed glass replacement, custom
            thermos glass and all our repair services. Transparent pricing,
            free quote and professional guaranteed service included.
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
              href="/en/#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Free quote
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Our rates</span>
            <h2 className="text-3xl font-extrabold">
              Our{" "}
              <span className="text-[var(--color-red)]">service</span> pricing
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              All prices include travel, measurements and professional
              installation. Free quote, no obligation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingCards.map((card) => (
              <div
                key={card.slug}
                className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] flex flex-col"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5">
                  <i
                    className={`${card.icon} text-xl text-[var(--color-teal)]`}
                  ></i>
                </div>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <div className="inline-block bg-[var(--color-red)] text-white text-sm font-extrabold px-4 py-2 rounded-full mb-4 self-start">
                  {card.price}
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>
                <Link
                  href={`/en/services/${card.slug}`}
                  className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold hover:underline"
                >
                  Learn more{" "}
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Factors */}
      <section className="bg-white py-16 border-t border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Price factors</span>
            <h2 className="text-3xl font-extrabold">
              What influences the{" "}
              <span className="text-[var(--color-red)]">
                price of a sealed unit
              </span>
              ?
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              The price of a custom sealed glass unit depends on several
              factors. Here are the main elements that influence your quote.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {priceFactors.map((factor) => (
              <div
                key={factor.title}
                className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-5">
                  <i
                    className={`${factor.icon} text-xl text-[var(--color-teal)]`}
                  ></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{factor.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table: Repair vs Replace */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comparison</span>
            <h2 className="text-3xl font-extrabold text-white">
              Repair vs{" "}
              <span className="text-[var(--color-red)]">
                full window replacement
              </span>
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Replacing just the sealed glass unit is much more cost-effective
              than replacing the entire window. See for yourself.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Repair option */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[var(--color-teal)] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[var(--color-teal)] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  Recommended
                </span>
              </div>
              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-tools text-2xl text-[var(--color-teal)]"></i>
                </div>
                <h3 className="text-xl font-extrabold mb-1">
                  Sealed unit replacement
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Glass only
                </p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-[var(--color-teal)]">
                  $150 — $450
                </span>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  per unit installed
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Keeps existing frame",
                  "30-minute installation",
                  "professional guaranteed service",
                  "60%+ savings",
                  "No wall damage",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-xs text-[var(--color-teal)]"></i>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Replace option */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-muted)]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-window-frame text-2xl text-[var(--color-muted)]"></i>
                </div>
                <h3 className="text-xl font-extrabold mb-1">
                  Full replacement
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Entire window
                </p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-[var(--color-muted)]">
                  $650 — $1,400
                </span>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  per window
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Full frame replacement",
                  "Multi-hour installation",
                  "Finishing work required",
                  "2 to 3 times more expensive",
                  "Risk of wall damage",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-muted)]/10 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-minus text-xs text-[var(--color-muted)]"></i>
                    </div>
                    <span className="text-[var(--color-muted)]">{item}</span>
                  </li>
                ))}
              </ul>
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
              Everything about our{" "}
              <span className="text-[var(--color-red)]">pricing</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
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

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Get your free quote
          </h2>
          <p className="text-white/80 mb-8">
            Competitive pricing, fast service and professional guaranteed service. Contact us
            to find out the exact price for your sealed glass units.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/#contact"
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
          <span className="section-tag">Online store</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Need parts? Shop online!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Over 740 replacement parts for doors, windows and screen doors
            available in our online store.
          </p>
          <Link
            href="/en/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Browse the store <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </>
  );
}
