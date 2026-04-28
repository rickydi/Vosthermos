import Image from "next/image";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";
import "../../opti-fenetre/opti-fenetre.css";

const pageUrl = "https://www.vosthermos.com/en/opti-fenetre";

export const metadata = {
  title: "OPTI-FENETRE | Repair Before Replacing | Vosthermos",
  description:
    `Complete door and window restoration: sealed glass, hardware, weatherstripping, caulking and screens. Save up to 70% compared with full replacement. ${COMPANY_INFO.phone}.`,
  keywords: [
    "opti-fenetre program",
    "repair windows before replacing",
    "window restoration",
    "sealed glass replacement",
    "door and window repair",
    "window replacement savings",
    "foggy windows Montreal",
  ],
  alternates: {
    canonical: pageUrl,
    languages: {
      "fr-CA": "https://www.vosthermos.com/opti-fenetre",
      "en-CA": pageUrl,
    },
  },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "Vosthermos",
    title: "OPTI-FENETRE Program | Repair Before Replacing",
    description:
      "A complete restoration plan for doors and windows at a fraction of the cost of full replacement.",
    images: [{ url: "https://www.vosthermos.com/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg" }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "OPTI-FENETRE Program | Vosthermos",
    description:
      "Sealed glass, hardware, weatherstripping, caulking and screens in one restoration plan.",
    images: ["https://www.vosthermos.com/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg"],
  },
  robots: "index, follow",
};

const inclusions = [
  { icon: "fas fa-temperature-half", title: "Foggy sealed units", text: "Replacement of failed sealed glass units with high-performance glass." },
  { icon: "fas fa-screwdriver-wrench", title: "Hardware", text: "Handles, rollers, locks, mechanisms and adjustments." },
  { icon: "fas fa-wind", title: "Weatherstripping", text: "Compatible seals that reduce drafts and air leaks." },
  { icon: "fas fa-fill-drip", title: "Caulking", text: "Interior and exterior sealant to limit water and air infiltration." },
  { icon: "fas fa-border-all", title: "Screens", text: "Repair or replacement based on the condition of each opening." },
  { icon: "fas fa-door-open", title: "Wood doors", text: "Restoration, adjustment and repair of wood frames and doors." },
];

const steps = [
  {
    title: "Opening diagnostic",
    text: "We inspect your doors and windows to separate what should be repaired from what can stay in place.",
  },
  {
    title: "Restoration plan",
    text: "You receive a clear plan covering sealed glass, hardware, weatherstripping, caulking and priorities.",
  },
  {
    title: "Coordinated work",
    text: "Repairs are grouped to reduce visits, delays and disruption.",
  },
  {
    title: "Warranty and follow-up",
    text: "The work is documented and covered by the Vosthermos warranty.",
  },
];

const signs = [
  "Permanent fog between panes",
  "Windows that close poorly or let air through",
  "Patio doors that are hard to slide",
  "Crushed or missing weatherstripping",
  "Cracked or loose caulking",
  "Several repairs needed at the same time",
];

const faqs = [
  {
    q: "What is the OPTI-FENETRE program?",
    a: "It is a complete restoration plan for your existing doors and windows. Instead of replacing everything, Vosthermos fixes the failing components: sealed glass, hardware, weatherstripping, caulking, screens and adjustments.",
  },
  {
    q: "Is it cheaper than a full replacement?",
    a: "In most cases, yes. The program keeps frames that are still in good condition and replaces only the components causing problems. Savings can reach 60 to 70% depending on the project.",
  },
  {
    q: "Does it improve energy performance?",
    a: "Yes when the losses come from failed sealed units, worn weatherstripping or deteriorated caulking. The diagnostic identifies the repairs with the highest impact.",
  },
  {
    q: "Can you also replace screens and hardware?",
    a: "Yes. The program can include screens, handles, rollers, locks, cranks, mechanisms and adjustments based on the condition of each opening.",
  },
  {
    q: "Where is the program available?",
    a: "The service is available in Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby and many South Shore cities.",
  },
];

function JsonLd() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: "OPTI-FENETRE Program",
    alternateName: ["OPTI-FENETRE", "Door and window restoration"],
    serviceType: "Door and window repair and restoration",
    url: pageUrl,
    description:
      "Turnkey door and window restoration program: sealed glass, hardware, weatherstripping, caulking, screens and adjustments.",
    provider: {
      "@type": "LocalBusiness",
      "@id": "https://www.vosthermos.com/#business",
      name: "Vosthermos",
      telephone: COMPANY_INFO.phoneTel,
      email: COMPANY_INFO.email,
      url: "https://www.vosthermos.com",
      image: COMPANY_INFO.logo,
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_INFO.address,
        addressLocality: COMPANY_INFO.city,
        addressRegion: COMPANY_INFO.province,
        postalCode: COMPANY_INFO.postalCode,
        addressCountry: "CA",
      },
    },
    areaServed: ["Montreal", "Laval", "Longueuil", "Brossard", "Saint-Hyacinthe", "Granby"].map((name) => ({
      "@type": "City",
      name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services included in OPTI-FENETRE",
      itemListElement: inclusions.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.text,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How the OPTI-FENETRE program works",
    description: "Door and window restoration process with Vosthermos.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.text,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.vosthermos.com/en/" },
      { "@type": "ListItem", position: 2, name: "OPTI-FENETRE", item: pageUrl },
    ],
  };

  return (
    <>
      {[serviceJsonLd, faqJsonLd, howToJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default function OptiFenetrePageEn() {
  return (
    <main className="opti-page">
      <JsonLd />

      <section className="opti-hero">
        <div className="opti-shell opti-hero-grid">
          <div className="opti-copy">
            <span className="opti-kicker">
              <i className="fas fa-star"></i> Exclusive Vosthermos program
            </span>
            <h1>
              OPTI-FENETRE: repair before replacing.
            </h1>
            <p>
              A complete restoration plan for your doors and windows: sealed glass,
              hardware, weatherstripping, caulking and screens in one clear plan.
            </p>
            <div className="opti-actions">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="opti-btn opti-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link href="#calculator" className="opti-btn opti-btn-ghost">
                Calculate my savings
              </Link>
            </div>
            <div className="opti-hero-stats">
              <div><strong>60-70%</strong><span>potential savings</span></div>
              <div><strong>1 plan</strong><span>for all openings</span></div>
              <div><strong>24 h</strong><span>business response</span></div>
            </div>
          </div>

          <div className="opti-form-card">
            <div className="opti-form-head">
              <span>Free evaluation</span>
              <strong>Photos accepted</strong>
            </div>
            <p>Send your request with photos or videos to speed up the diagnostic.</p>
            <QuoteForm compact theme="light" lang="en" />
          </div>
        </div>
      </section>

      <section className="opti-strip">
        <div className="opti-shell">
          <strong>The principle:</strong>
          <span>keep what is still good, replace what causes losses, group the work.</span>
        </div>
      </section>

      <section className="opti-section opti-signs">
        <div className="opti-shell opti-split">
          <div>
            <span className="opti-red-tag">Diagnostic</span>
            <h2>When several signs appear, OPTI-FENETRE is often more cost-effective.</h2>
            <p>
              The program is built for homes where several openings have issues at the
              same time, while the frames do not necessarily need replacement.
            </p>
          </div>
          <div className="opti-check-grid">
            {signs.map((sign) => (
              <div key={sign}>
                <i className="fas fa-check"></i>
                {sign}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="opti-section opti-comparison">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Comparison</span>
            <h2>Full replacement is not always the best first option.</h2>
          </div>
          <div className="opti-compare-grid">
            <article className="opti-compare-card is-muted">
              <span>Full replacement</span>
              <strong>$18,000</strong>
              <p>Indicative example for a home with 12 windows and 2 patio doors.</p>
              <ul>
                <li>Longer manufacturing delays</li>
                <li>More invasive work</li>
                <li>Higher cost</li>
              </ul>
            </article>
            <article className="opti-compare-card is-featured">
              <span>OPTI-FENETRE Program</span>
              <strong>$5,500</strong>
              <p>Targeted restoration: sealed glass, seals, hardware and caulking.</p>
              <ul>
                <li>Potential savings up to 70%</li>
                <li>Less demolition</li>
                <li>More eco-friendly approach</li>
              </ul>
            </article>
          </div>
          <p className="opti-note">
            Prices are indicative. Each project is evaluated based on dimensions, frame condition and components to replace.
          </p>
        </div>
      </section>

      <section className="opti-section opti-calculator" id="calculator">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Calculator</span>
            <h2>Estimate your savings quickly.</h2>
            <p>
              Enter the number of windows and doors to compare restoration with full replacement.
            </p>
          </div>
          <SavingsCalculator lang="en" />
        </div>
      </section>

      <section className="opti-section opti-included">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Included services</span>
            <h2>A complete restoration, not an isolated repair.</h2>
          </div>
          <div className="opti-inclusion-grid">
            {inclusions.map((item) => (
              <article key={item.title}>
                <i className={item.icon}></i>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="opti-section opti-process">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Process</span>
            <h2>Four steps to transform your windows without unnecessary construction.</h2>
          </div>
          <div className="opti-step-grid">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="opti-section opti-eco">
        <div className="opti-shell opti-eco-grid">
          <div className="opti-eco-card">
            <Image
              src="/images/vitre-thermos/vitre-thermos-bg.jpg"
              alt="Window repaired by Vosthermos"
              fill
              sizes="(max-width: 900px) 100vw, 520px"
            />
          </div>
          <div>
            <span className="opti-red-tag">Savings and environment</span>
            <h2>Less waste, more value from your existing openings.</h2>
            <p>
              Restoring a window that is still structurally sound reduces cost,
              waste and unnecessary work. It is especially relevant when the frame is
              good but the components have aged.
            </p>
            <Link href="/en/contact?subject=opti-fenetre" className="opti-btn opti-btn-dark">
              Request an evaluation
            </Link>
          </div>
        </div>
      </section>

      <section className="opti-section opti-faq">
        <div className="opti-shell opti-faq-grid">
          <div>
            <span className="opti-red-tag">FAQ</span>
            <h2>Frequently asked questions about OPTI-FENETRE.</h2>
          </div>
          <div className="opti-faq-list">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="opti-final">
        <div className="opti-shell">
          <h2>Ready to find out whether your windows can be restored?</h2>
          <p>Send photos or call us. We will tell you whether OPTI-FENETRE fits your situation.</p>
          <div className="opti-actions opti-actions-center">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="opti-btn opti-btn-primary">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/en/contact?subject=opti-fenetre" className="opti-btn opti-btn-ghost-light">
              Write to Vosthermos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
