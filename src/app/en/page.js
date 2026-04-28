import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";
import "../preview-accueil/preview-accueil.css";

export const metadata = {
  title: "Door and Window Repair from $150 | Vosthermos Montreal",
  description:
    `Foggy sealed glass? Sticking patio door? Vosthermos repairs doors and windows from $150 with guaranteed service. Free quote, Montreal, South Shore, Laval. ${COMPANY_INFO.phone}`,
  keywords:
    "door repair, window repair, sealed glass replacement, patio door hardware, screen repair, wood door repair, caulking, weatherstripping, Montreal, South Shore, Laval, Delson",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/en/",
    languages: {
      "fr-CA": "https://www.vosthermos.com/",
      "en-CA": "https://www.vosthermos.com/en/",
      "x-default": "https://www.vosthermos.com/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Vosthermos",
    url: "https://www.vosthermos.com/en/",
    title: "Door and Window Repair from $150 | Vosthermos",
    description:
      `Vosthermos replaces foggy sealed glass units and repairs patio doors, hardware and screens. Free quote. ${COMPANY_INFO.phone}`,
    images: [{ url: COMPANY_INFO.logo }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Door and Window Repair from $150 | Vosthermos",
    description: `Door and window repair experts since 2010. Free quote. ${COMPANY_INFO.phone}`,
    images: [COMPANY_INFO.logo],
  },
};

const services = [
  {
    icon: "fas fa-temperature-half",
    title: "Sealed glass units",
    text: "Replacement of foggy, cracked or inefficient sealed glass units with high-performance glass.",
    image: "/images/vitre-thermos/detail-1.jpg",
    href: "/en/services/sealed-glass-replacement",
  },
  {
    icon: "fas fa-screwdriver-wrench",
    title: "Hardware",
    text: "Handles, rollers, locks, mechanisms and patio door adjustments.",
    image: "/images/quincaillerie/detail-roulette-porte-patio.jpg",
    href: "/en/services/hardware-replacement",
  },
  {
    icon: "fas fa-door-open",
    title: "Doors and windows",
    text: "Repairs, weatherstripping, caulking, screens and wood restoration.",
    image: "/images/portes-bois/detail-1.jpg",
    href: "/en/services/wooden-door-repair",
  },
];

const problems = [
  "Fog between the glass panes",
  "Patio door hard to slide",
  "Broken handle or lock",
  "Drafts around windows",
  "Torn screen",
  "Damaged wood frame",
];

const gallery = [
  {
    before: "/images/realisations/thermos-remplacement-before.jpg",
    after: "/images/realisations/thermos-remplacement-after.jpg",
    title: "Sealed unit replaced",
  },
  {
    before: "/images/realisations/fenetre-restauration-before.jpg",
    after: "/images/realisations/fenetre-restauration-after.jpg",
    title: "Window restored",
  },
  {
    before: "/images/realisations/quincaillerie-ajustement-before.jpg",
    after: "/images/realisations/quincaillerie-ajustement-after.jpg",
    title: "Hardware adjusted",
  },
];

const products = [
  { title: "Patio door rollers", count: "120+ models", icon: "fas fa-circle-dot" },
  { title: "Handles and locks", count: "180+ parts", icon: "fas fa-lock" },
  { title: "Weatherstripping", count: "Custom fit", icon: "fas fa-wind" },
  { title: "Screens", count: "Fast repair", icon: "fas fa-border-all" },
];

const process = [
  {
    title: "Send your request",
    text: "Describe the issue, add a few photos if possible and tell us your area.",
  },
  {
    title: "We confirm the solution",
    text: "We check whether a repair is enough or whether a sealed unit replacement is needed.",
  },
  {
    title: "Efficient service",
    text: "The technician arrives with the right parts and leaves a clean, finished repair.",
  },
];

const reviews = [
  {
    name: "Julie M.",
    text: "Fast service, clear explanations and the window was repaired without replacing everything.",
  },
  {
    name: "Condo association",
    text: "Very practical for unit follow-ups and recurring building interventions.",
  },
  {
    name: "Marc L.",
    text: "They found the right patio door part and fixed the issue on-site.",
  },
];

const sectors = [
  "Montreal",
  "Laval",
  "Longueuil",
  "Brossard",
  "Saint-Hyacinthe",
  "Granby",
  "Terrebonne",
  "Repentigny",
  "Chambly",
  "Boucherville",
];

const faqs = [
  {
    q: "Do I need to replace the entire window?",
    a: "Not always. In many cases, replacing the sealed glass unit, hardware or weatherstripping is enough.",
  },
  {
    q: "How much does sealed glass replacement cost?",
    a: "The price depends on the dimensions and glass type. Replacements start at $150 per installed unit.",
  },
  {
    q: "Can I attach photos?",
    a: "Yes. The quote form accepts photos and videos to help speed up the estimate.",
  },
];

function cityHref(city) {
  const slug = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `/en/services/sealed-glass-replacement/${slug}`;
}

function SectionHeader({ kicker, title, text }) {
  return (
    <div className="hp-section-head">
      <span>{kicker}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function QuoteCard() {
  return (
    <div className="hp-quote-card" id="quote">
      <div className="hp-quote-head">
        <span>Free quote</span>
        <strong>Fast response</strong>
      </div>
      <p className="hp-quote-intro">
        Email required. Photos and videos are accepted to speed up the estimate.
      </p>
      <QuoteForm compact theme="light" lang="en" />
    </div>
  );
}

export default async function HomeEn() {
  const totalProducts = await prisma.product.count();

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to get your doors and windows repaired with Vosthermos",
    description: "A simple 3-step process to repair your doors and windows with local experts.",
    step: [
      {
        "@type": "HowToStep",
        name: "Contact us",
        text: `Call ${COMPANY_INFO.phone} or fill out the online form. Describe the issue and we will respond quickly.`,
        url: "https://www.vosthermos.com/en/#quote",
      },
      {
        "@type": "HowToStep",
        name: "Free estimate",
        text: "We review the issue and provide a clear quote with no hidden fees.",
      },
      {
        "@type": "HowToStep",
        name: "Fast repair",
        text: "Our team arrives with the right material for a clean, professional repair.",
      },
    ],
    totalTime: "PT2H",
    estimatedCost: { "@type": "MonetaryAmount", currency: "CAD", value: "150" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the warranty on sealed glass units?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our sealed glass unit replacements are covered by professional guaranteed service.",
        },
      },
      {
        "@type": "Question",
        name: "What areas do you serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We serve Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny and the region within 100 km of Delson.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer free quotes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Quotes are free and without obligation. Call ${COMPANY_INFO.phone} or use the online form.`,
        },
      },
      {
        "@type": "Question",
        name: "Can I attach photos to my request?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The form accepts photos and videos to help our team evaluate the issue faster.",
        },
      },
    ],
  };

  const proofItems = [
    { value: "15+", label: "years of experience" },
    { value: `${totalProducts}+`, label: "parts in stock" },
    { value: "10 yr", label: "sealed unit warranty" },
    { value: "24 h", label: "business response" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <main className="home-preview">
        <section className="hp-hero">
          <div className="hp-shell hp-hero-grid">
            <div className="hp-copy">
              <span className="hp-kicker">
                <i className="fas fa-circle"></i> Door and window repair
              </span>
              <h1>Repair before replacing.</h1>
              <p className="hp-lede">
                Vosthermos replaces foggy sealed glass units, repairs hardware and
                extends the life of doors and windows across Greater Montreal.
              </p>
              <div className="hp-actions">
                <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
                <Link href="/en/boutique" className="hp-btn hp-btn-ghost">
                  View the shop
                </Link>
              </div>
              <div className="hp-proof-row">
                {proofItems.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-hero-conversion">
              <QuoteCard />
            </div>
          </div>
        </section>

        <section className="hp-manager-strip">
          <div className="hp-shell hp-manager-inner">
            <div>
              <span>New</span>
              <strong>Condo manager portal</strong>
              <p>Digital work orders, photos, invoices and building-level follow-up.</p>
            </div>
            <Link href="/en/contact?context=portal-demo">Ask for a demo</Link>
          </div>
        </section>

        <section className="hp-section hp-services" id="services">
          <div className="hp-shell">
            <SectionHeader
              kicker="Key services"
              title="The repairs clients ask for most, without replacing everything."
              text="The English homepage now follows the same premium hierarchy as the French homepage."
            />
            <div className="hp-service-grid">
              {services.map((service) => (
                <Link className="hp-service-card" href={service.href} key={service.title}>
                  <div className="hp-service-image">
                    <Image src={service.image} alt="" fill sizes="(max-width: 1050px) 100vw, 33vw" />
                  </div>
                  <div className="hp-service-body">
                    <i className={service.icon}></i>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                    <span>Learn more</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-problems">
          <div className="hp-shell hp-problem-grid">
            <div>
              <span className="hp-red-tag">Fast diagnostic</span>
              <h2>Clients recognize their problem right away.</h2>
              <p>
                The homepage guides people toward concrete issues first, then moves
                them to a quote or the correct repair service.
              </p>
            </div>
            <div className="hp-problem-list">
              {problems.map((problem) => (
                <div key={problem}>
                  <i className="fas fa-check"></i>
                  {problem}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-gallery" id="gallery">
          <div className="hp-shell">
            <SectionHeader
              kicker="Recent work"
              title="Before and after examples higher on the page."
              text="Visual proof builds trust faster than a catalog-first layout."
            />
            <div className="hp-gallery-grid">
              {gallery.map((item) => (
                <article className="hp-gallery-card" key={item.title}>
                  <div className="hp-before-after">
                    <div>
                      <Image src={item.before} alt={`${item.title} before`} fill sizes="(max-width: 1050px) 50vw, 16vw" />
                      <span>Before</span>
                    </div>
                    <div>
                      <Image src={item.after} alt={`${item.title} after`} fill sizes="(max-width: 1050px) 50vw, 16vw" />
                      <span>After</span>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-shop" id="shop">
          <div className="hp-shell hp-shop-grid">
            <div>
              <span className="hp-red-tag">Integrated shop</span>
              <h2>The parts shop stays visible, but it no longer owns the first impression.</h2>
              <p>
                The priority is repair conversion first, then the parts catalog supports
                the company expertise.
              </p>
              <Link href="/en/boutique" className="hp-btn hp-btn-dark">Browse the shop</Link>
            </div>
            <div className="hp-product-grid">
              {products.map((product) => (
                <Link href="/en/boutique" key={product.title}>
                  <i className={product.icon}></i>
                  <strong>{product.title}</strong>
                  <span>{product.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-process" id="how-it-works">
          <div className="hp-shell">
            <SectionHeader
              kicker="How it works"
              title="A clear 3-step process."
            />
            <div className="hp-step-grid">
              {process.map((step, index) => (
                <article key={step.title}>
                  <span>{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-reviews">
          <div className="hp-shell">
            <SectionHeader
              kicker="Trust"
              title="Shorter reviews that are easier to scan."
            />
            <div className="hp-review-grid">
              {reviews.map((review) => (
                <article key={review.name}>
                  <div className="hp-stars">*****</div>
                  <p>&quot;{review.text}&quot;</p>
                  <strong>{review.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-sectors" id="areas">
          <div className="hp-shell">
            <SectionHeader
              kicker="Service areas"
              title="Clear local coverage for SEO and conversion."
            />
            <div className="hp-sector-grid">
              {sectors.map((city) => (
                <Link href={cityHref(city)} key={city}>
                  <i className="fas fa-location-dot"></i> {city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-faq" id="faq">
          <div className="hp-shell hp-faq-grid">
            <div>
              <span className="hp-red-tag">FAQ</span>
              <h2>Answer objections without weighing down the hero.</h2>
            </div>
            <div className="hp-faq-list">
              {faqs.map((faq) => (
                <article key={faq.q}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-final-cta" id="contact">
          <div className="hp-shell">
            <h2>Need a repair? Contact Vosthermos.</h2>
            <p>
              Free quote, fast service and guaranteed work. Add photos directly
              to the form to speed up the estimate.
            </p>
            <div className="hp-actions hp-actions-center">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link href="#quote" className="hp-btn hp-btn-ghost-light">
                Fill out the form
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
