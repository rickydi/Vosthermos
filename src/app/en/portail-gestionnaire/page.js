import Link from "next/link";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/company-info";
import "../../portail-gestionnaire/portail.css";

const PAGE_URL = "https://www.vosthermos.com/en/portail-gestionnaire";

export const metadata = {
  title: "Manager Portal for Condo Window Work | Vosthermos",
  description:
    "Free manager portal for Vosthermos clients: condo corporations, buildings, units, service requests, photos, work follow-up and invoices in one place.",
  keywords:
    "condo manager portal windows, property manager window repairs Quebec, condo window maintenance portal, window service requests condo association, Vosthermos manager portal",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      fr: "https://www.vosthermos.com/portail-gestionnaire",
      en: PAGE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: PAGE_URL,
    title: "Manager Portal for Condo Window Work | Vosthermos",
    description:
      "Condo corporations, buildings, units, requests, follow-up and invoices centralized for property managers.",
    images: [
      {
        url: "https://www.vosthermos.com/portail-gestionnaire/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vosthermos manager portal preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manager Portal for Condo Window Work | Vosthermos",
    description:
      "Condo corporations, buildings, units, requests, follow-up and invoices centralized for property managers.",
    images: ["https://www.vosthermos.com/portail-gestionnaire/opengraph-image"],
  },
};

const FAQS = [
  {
    q: "How much does the portal cost?",
    a: "The portal is included at no extra cost for eligible Vosthermos clients. There are no hidden monthly software fees.",
  },
  {
    q: "Can property owners access the portal?",
    a: "For now, the portal is designed for managers and condo boards. Owner requests can be centralized by your team before being sent to Vosthermos.",
  },
  {
    q: "How long does setup take?",
    a: "Most portfolios can be structured in 2 to 5 days depending on size. Your team can start using the portal during the first week.",
  },
  {
    q: "Is it secure?",
    a: "The portal uses SSL encryption and is designed for Canadian-hosted business data workflows, with Quebec Law 25 privacy expectations in mind.",
  },
  {
    q: "Can we export data?",
    a: "Records stay centralized in the portal. If a client needs a specific export for archives or another management system, Vosthermos can help with the required format.",
  },
  {
    q: "Which condo corporations are eligible?",
    a: "Any Quebec condo corporation with 5 units or more can be considered. The portal can support small buildings and larger window portfolios.",
  },
  {
    q: "How do technicians use it in the field?",
    a: "The portal is web-based and mobile-friendly, so records, photos, requests and follow-up can be viewed without relying on a fixed workstation.",
  },
  {
    q: "Does it integrate with other condo management software?",
    a: "No public API is announced for now. The portal is mainly used as the central Vosthermos record for condo corporations, units, interventions and documents.",
  },
];

function CheckIcon({ state }) {
  if (state === "yes") {
    return (
      <span className="pg-check yes" aria-label="Yes">
        <svg viewBox="0 0 24 24">
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </span>
    );
  }
  if (state === "maybe") {
    return (
      <span className="pg-check maybe" aria-label="Partial">
        <svg viewBox="0 0 24 24">
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="pg-check no" aria-label="No">
      <svg viewBox="0 0 24 24">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </span>
  );
}

export default function ManagerPortalPageEn() {
  const contactHref = "/en/contact?subject=portal-demo";
  const fullAddress = `${COMPANY_INFO.address}, ${COMPANY_INFO.city}, ${COMPANY_INFO.province} ${COMPANY_INFO.postalCode}`;

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vosthermos Manager Portal",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: "0",
      description: "Included with eligible Vosthermos service clients",
    },
    featureList: [
      "Create condo corporations, buildings and units",
      "Unit records with photos and notes",
      "Structured service requests",
      "Active and completed work follow-up",
      "Invoices and PDF documents in one place",
      "Desktop and mobile display",
    ],
    provider: {
      "@type": "Organization",
      name: "Vosthermos",
      address: fullAddress,
      telephone: COMPANY_INFO.phoneTel,
      email: COMPANY_INFO.email,
      url: COMPANY_INFO.url,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.vosthermos.com/en" },
      { "@type": "ListItem", position: 2, name: "Manager Portal", item: PAGE_URL },
    ],
  };

  const beforeAfterRows = [
    [
      "Missed calls, paper records and unclear history from one year to the next.",
      "Centralized dashboard by condo corporation, building and unit.",
    ],
    [
      "Annual maintenance costs are harder to explain to the board.",
      "Active work orders, affected units and completed records are visible in one place.",
    ],
    [
      "Invoices, approvals and site context are scattered across emails.",
      "Invoices and PDF documents stay attached to the client record.",
    ],
  ];

  const workflow = [
    ["Condo corporation", "The client creates condo corporations, buildings and units without waiting for an admin request."],
    ["Unit record", "The manager opens a unit, adds useful details and keeps photos in the right place."],
    ["Request", "A structured service request is created with the unit and the problem context."],
    ["Follow-up", "Vosthermos updates the file with status, dates, notes and the assigned technician when available."],
    ["Invoice", "Invoices and PDF documents stay available in the portal for consultation and archiving."],
  ];

  const compareRows = [
    ["24/7 web portal", "yes", "no", "no"],
    ["Client-created condo corporations and units", "yes", "no", "no"],
    ["Structured service requests", "yes", "maybe", "no"],
    ["Unit records with notes and photos", "yes", "maybe", "no"],
    ["Active and completed work follow-up", "yes", "maybe", "no"],
    ["Centralized invoices and PDFs", "yes", "maybe", "no"],
    ["Desktop and mobile view", "yes", "maybe", "no"],
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="portail-page">
        <section className="pg-hero">
          <div className="pg-hero-bg" aria-hidden="true">
            <div className="pg-grid-lines"></div>
            <div className="pg-hero-glow pg-glow-a"></div>
            <div className="pg-hero-glow pg-glow-b"></div>
          </div>
          <div className="pg-container pg-hero-inner">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>B2B PORTAL - CONDOS &amp; PROPERTY MANAGERS
            </span>
            <h1 className="pg-h1">
              The manager portal for your condo{" "}
              <span className="pg-h1-accent pg-h1-break">door and window work.</span>
            </h1>
            <p className="pg-hero-sub">
              Condo corporations, buildings, units, service requests, follow-up and invoices in one
              portal. Managers can understand file status without chasing emails.
            </p>
            <div className="pg-hero-ctas">
              <Link href={contactHref} className="pg-btn pg-btn-primary pg-btn-lg">
                Request a demo
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path
                    d="M4 10h10m-4-4 4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a href="#features" className="pg-btn pg-btn-secondary pg-btn-lg">
                View features
              </a>
            </div>

            <div
              className="pg-real-preview"
              role="img"
              aria-label="Real screenshots of the Vosthermos manager portal"
            >
              <div className="pg-real-main">
                <div className="pg-real-frame">
                  <div className="pg-real-label">Real portal screenshot - dashboard</div>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-dashboard.png"
                    alt="Real screenshot of the Vosthermos manager portal dashboard"
                    width={1280}
                    height={900}
                    priority
                    sizes="(max-width: 980px) 100vw, 760px"
                  />
                </div>
              </div>
              <div className="pg-real-side">
                <div className="pg-real-card">
                  <span>Unit record</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-unit-detail.png"
                    alt="Real screenshot of a unit record in the portal"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
                <div className="pg-real-card">
                  <span>Interventions</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-interventions.png"
                    alt="Real screenshot of intervention follow-up in the portal"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
                <div className="pg-real-card">
                  <span>Invoices</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-factures.png"
                    alt="Real screenshot of the invoice section in the portal"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
              </div>
            </div>

            <div className="pg-trust-bar">
              <div>
                <b>Data hosted in Canada</b>
              </div>
              <div className="pg-tb-sep"></div>
              <div>
                <b>Law 25 aware</b>
              </div>
              <div className="pg-tb-sep"></div>
              <div>
                <b>Web portal</b> desktop - tablet - mobile
              </div>
            </div>
          </div>
        </section>

        <section className="pg-live-demo" id="demo-live">
          <div className="pg-container">
            <div className="pg-live-head">
              <span className="pg-eyebrow pg-eyebrow-dark">
                <span className="pg-eyebrow-dot"></span>PORTAL IN ACTION
              </span>
              <h2 className="pg-section-title">The animated tutorial is embedded directly on the page.</h2>
              <p className="pg-section-lede">
                Clients see the full flow without opening another page: creating a condo
                corporation, units, service requests, follow-up, invoices and the mobile view.
              </p>
            </div>
            <div className="pg-tutorial-embed" aria-label="Animated tutorial of the Vosthermos manager portal">
              <iframe
                src="/portail-gestionnaire/tutoriel.html"
                title="Animated tutorial of the Vosthermos manager portal"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="pg-ps">
          <div className="pg-container">
            <h2 className="pg-section-title">
              Managing 50, 100 or 500 windows should not require <em>50 calls</em>.
            </h2>
            <p className="pg-section-lede">
              The condo manager window portal replaces scattered paperwork, voicemail and
              spreadsheets with a structured view of condo corporations, units, requests,
              follow-up and invoices.
            </p>
            <div className="pg-ps-grid">
              {beforeAfterRows.map(([problem, solution]) => (
                <div className="pg-ps-row" key={problem}>
                  <div className="pg-ps-card problem">
                    <span className="pg-ps-tag">Before</span>
                    <p>{problem}</p>
                  </div>
                  <div className="pg-ps-arrow">
                    <svg viewBox="0 0 40 20" width="40" height="20">
                      <path
                        d="M2 10h34m-6-6 6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="pg-ps-card solution">
                    <span className="pg-ps-tag">With Vosthermos</span>
                    <p>{solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="pg-features">
          <div className="pg-container">
            <span className="pg-eyebrow pg-eyebrow-dark">
              <span className="pg-eyebrow-dot"></span>FEATURES
            </span>
            <h2 className="pg-section-title">
              Everything a manager expects from a <em>window work follow-up portal</em>.
            </h2>
            <div className="pg-feat-grid">
              <article className="pg-feat">
                <div className="pg-feat-visual">
                  <div className="pg-wo-mini">
                    <div className="pg-wo-mini-head">
                      <span>WO-2187</span>
                      <span className="pg-pill ok sm">In follow-up</span>
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-camera"></i> Attached photo
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-clipboard-list"></i> Service note
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-circle-check"></i> Visible status
                    </div>
                  </div>
                </div>
                <h3>Digital work order</h3>
                <p>
                  Requests and active work orders stay structured by condo corporation, building,
                  unit and opening. Photos and notes can be attached to the right file.
                </p>
              </article>

              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-grid">
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell a"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell b"></span>
                    <span className="pg-fg-cell"></span>
                  </div>
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell a"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell c"></span>
                  </div>
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell c"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell a"></span>
                  </div>
                  <div className="pg-fg-legend">
                    <span><i className="pg-dt a"></i>OK</span>
                    <span><i className="pg-dt b"></i>Watch</span>
                    <span><i className="pg-dt c"></i>Replace</span>
                  </div>
                </div>
                <h3>Multi-unit dashboard</h3>
                <p>
                  A global view of your properties: buildings, units, active files, completed
                  interventions and invoices to review.
                </p>
              </article>

              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-history">
                  <div className="pg-hist-node">
                    <b>U-301 - kitchen</b>
                    <span>PVC window 120x90</span>
                  </div>
                  <div className="pg-hist-row">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2024 - Hardware adjustment</b>
                      <span>M. Dube</span>
                    </div>
                  </div>
                  <div className="pg-hist-row">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2025 - Seal replacement</b>
                      <span>J. Pelletier</span>
                    </div>
                  </div>
                  <div className="pg-hist-row active">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2026 - Open request</b>
                      <span>Photo and notes attached</span>
                    </div>
                  </div>
                </div>
                <h3>Complete unit history</h3>
                <p>
                  Each unit keeps useful information: openings, notes, photos, requests and
                  interventions linked to the file.
                </p>
              </article>

              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-plan">
                  <svg viewBox="0 0 220 90" width="100%" height="90">
                    <defs>
                      <linearGradient id="pgPlanGEn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6fb7c7" stopOpacity=".65" />
                        <stop offset="100%" stopColor="#004d5e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 70 L40 58 L80 48 L120 30 L160 38 L200 22 L220 18 L220 90 L0 90 Z"
                      fill="url(#pgPlanGEn)"
                    />
                    <path
                      d="M0 70 L40 58 L80 48 L120 30 L160 38 L200 22 L220 18"
                      fill="none"
                      stroke="#6fb7c7"
                      strokeWidth="2"
                    />
                    <g fill="#e30718">
                      <circle cx="40" cy="58" r="3" />
                      <circle cx="120" cy="30" r="3" />
                      <circle cx="200" cy="22" r="3" />
                    </g>
                  </svg>
                  <div className="pg-plan-years">
                    <span>2026</span>
                    <span>2028</span>
                    <span>2030</span>
                    <span>2035</span>
                  </div>
                </div>
                <h3>Maintenance priorities</h3>
                <p>
                  Active work orders and requests remain visible so your team can follow important
                  files without losing context.
                </p>
              </article>

              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-rt">
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon ok"><i className="fas fa-check"></i></span>
                    <span>Technician assigned</span>
                    <small>8:04</small>
                  </div>
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon ok"><i className="fas fa-check"></i></span>
                    <span>On the way</span>
                    <small>9:12</small>
                  </div>
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon live"><i className="fas fa-circle"></i></span>
                    <span>Intervention in progress</span>
                    <small>9:38</small>
                  </div>
                  <div className="pg-rt-row muted">
                    <span className="pg-rt-icon"></span>
                    <span>Report sent</span>
                    <small>-</small>
                  </div>
                </div>
                <h3>Intervention follow-up</h3>
                <p>
                  Track scheduled and completed interventions with date, status, assigned
                  technician when available and notes attached to the file.
                </p>
              </article>

              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-invoice">
                  <div className="pg-inv">
                    <div className="pg-inv-head">
                      <b>Invoice PDF - April</b>
                      <span className="pg-pill ok sm">Available</span>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unit 102 - 2 interventions</span>
                      <b>$420</b>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unit 204 - inspection</span>
                      <b>$185</b>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unit 301 - sealed unit replacement</span>
                      <b>$640</b>
                    </div>
                    <div className="pg-inv-total">
                      <span>Total</span>
                      <b>$1,245 CAD</b>
                    </div>
                  </div>
                </div>
                <h3>Centralized invoicing</h3>
                <p>
                  Invoices and PDF documents are searchable in the portal so managers do not have
                  to dig through emails or shared folders.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="workflow" className="pg-workflow">
          <div className="pg-container">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>WORKFLOW
            </span>
            <h2 className="pg-section-title light">
              From problem detection to invoice, <em>everything happens here.</em>
            </h2>
            <p className="pg-section-lede light">
              A simple flow: create the condo corporation, open units, send a request, track the
              status and find the documents.
            </p>
            <ol className="pg-timeline">
              {workflow.map(([title, desc], i) => (
                <li className="pg-tl-step" key={title}>
                  <div className="pg-tl-dot">
                    <span>{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="compare" className="pg-compare">
          <div className="pg-container">
            <span className="pg-eyebrow pg-eyebrow-dark">
              <span className="pg-eyebrow-dot"></span>DIFFERENTIATION
            </span>
            <h2 className="pg-section-title">What makes us different.</h2>
            <p className="pg-section-lede">
              Compared with a traditional window contractor or phone-based follow-up, the portal
              changes the way managers keep track of work.
            </p>
            <div className="pg-table-wrap">
              <div className="pg-cmp-shell">
                <table className="pg-cmp">
                  <thead>
                    <tr>
                      <th>
                        <span className="pg-cmp-col-sub">Feature</span>
                        What you need
                      </th>
                      <th className="us">
                        <span className="pg-cmp-reco-inline">
                          <i className="fas fa-star"></i> Recommended
                        </span>
                        <span className="pg-cmp-col-sub">Digital solution</span>
                        Vosthermos Portal
                      </th>
                      <th>
                        <span className="pg-cmp-col-sub">Traditional</span>
                        Classic contractor
                      </th>
                      <th>
                        <span className="pg-cmp-col-sub">Basic</span>
                        Phone calls
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map(([feat, us, trad, phone]) => (
                      <tr key={feat}>
                        <th>{feat}</th>
                        <td className="us"><CheckIcon state={us} /></td>
                        <td><CheckIcon state={trad} /></td>
                        <td><CheckIcon state={phone} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pg-cmp-footer">
                  Only <strong>Vosthermos Portal</strong>
                  <span className="pg-cmp-arrow"> - </span>
                  centralizes window records with screenshots and documents in the same place.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pg-story">
          <div className="pg-container pg-story-inner">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>TYPICAL SCENARIO
            </span>
            <h2 className="pg-section-title light">A week in the life of a condo manager.</h2>
            <div className="pg-story-grid">
              <div className="pg-story-col before">
                <div className="pg-story-label">Before</div>
                <p>
                  Tuesday 2 p.m. A resident calls about a foggy window. The manager searches for
                  the contractor, leaves a message, then waits for a reply. Later, approval and
                  invoice details arrive in separate emails with no clear unit history.
                </p>
                <ul className="pg-story-metrics">
                  <li><b>+</b> follow-ups and searches</li>
                  <li><b>?</b> status hard to confirm</li>
                  <li><b>0</b> central record</li>
                </ul>
              </div>
              <div className="pg-story-col after">
                <div className="pg-story-label">With the portal</div>
                <p>
                  The manager enters the affected unit, attaches a photo and sends a structured
                  request. Vosthermos keeps status, notes and documents linked to the unit. When
                  the invoice is available, it appears with the other records.
                </p>
                <ul className="pg-story-metrics">
                  <li><b>-</b> fewer scattered follow-ups</li>
                  <li><b>1</b> clear file per unit</li>
                  <li><b>PDF</b> and photos centralized</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="pg-team">
          <div className="pg-container">
            <div className="pg-team-intro">
              <h2 className="pg-section-title">Talk to a human. Not a bot.</h2>
              <p className="pg-section-lede">
                Specialists support you from the demo to setup and monthly follow-up.
              </p>
            </div>
            <div className="pg-team-grid">
              <article className="pg-team-card">
                <div className="pg-team-info">
                  <h3 className="pg-team-name">Condo specialist</h3>
                  <p className="pg-team-role">
                    Demos, portal setup and training for your management team.
                  </p>
                  <p className="pg-team-spec">Greater Montreal - Laval - Laurentians</p>
                  <div className="pg-team-cta">
                    <a href={`tel:${COMPANY_INFO.phoneTel}`} className="pg-team-btn pg-team-btn-primary">
                      Call
                    </a>
                    <Link href={`${contactHref}&specialist=condos`} className="pg-team-btn pg-team-btn-outline">
                      Write
                    </Link>
                  </div>
                </div>
              </article>

              <article className="pg-team-card">
                <div className="pg-team-info">
                  <h3 className="pg-team-name">Technical advisor</h3>
                  <p className="pg-team-role">
                    Maintenance priorities and larger portfolios of 50 windows or more.
                  </p>
                  <p className="pg-team-spec">Monteregie - South Shore - Eastern Townships</p>
                  <div className="pg-team-cta">
                    <a href={`tel:${COMPANY_INFO.phoneTel}`} className="pg-team-btn pg-team-btn-primary">
                      Call
                    </a>
                    <Link href={`${contactHref}&specialist=technical`} className="pg-team-btn pg-team-btn-outline">
                      Write
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="pg-faq">
          <div className="pg-container">
            <div className="pg-faq-intro">
              <span className="pg-eyebrow pg-eyebrow-dark">
                <span className="pg-eyebrow-dot"></span>FAQ
              </span>
              <h2 className="pg-section-title">Frequent manager questions.</h2>
              <p className="pg-section-lede">
                What you need to know about the portal. If your answer is not here, contact the
                Vosthermos team.
              </p>
            </div>
            <div className="pg-faq-list">
              {FAQS.map((f, i) => (
                <details className="pg-faq-item" key={f.q} open={i === 0}>
                  <summary>
                    <h3>{f.q}</h3>
                    <span className="pg-faq-chev"></span>
                  </summary>
                  <div className="pg-faq-body">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="pg-cta-final">
          <div className="pg-hero-bg" aria-hidden="true">
            <div className="pg-grid-lines"></div>
            <div className="pg-hero-glow pg-glow-a"></div>
            <div className="pg-hero-glow pg-glow-b"></div>
          </div>
          <div className="pg-container pg-cta-inner">
            <h2 className="pg-h1 pg-cta-h1">Ready to see the portal in action?</h2>
            <p className="pg-cta-sub">
              Personalized demo based on your window portfolio and condo corporation. 30 minutes,
              by video call or on site.
            </p>
            <Link className="pg-btn pg-btn-primary pg-btn-xl" href={contactHref}>
              Request a free 30-minute demo
              <svg viewBox="0 0 20 20" width="16" height="16">
                <path
                  d="M4 10h10m-4-4 4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <p className="pg-cta-reassure">
              <span><i className="fas fa-check"></i> Personalized demo for your portfolio</span>
              <span><i className="fas fa-check"></i> No credit card</span>
              <span><i className="fas fa-check"></i> No commitment</span>
            </p>
            <div className="pg-cta-contact">
              <a href={`tel:${COMPANY_INFO.phoneTel}`}>
                <i className="fas fa-phone"></i> Prefer to talk? {COMPANY_INFO.phone}
              </a>
              <span className="pg-cta-dot">-</span>
              <a href={`mailto:${COMPANY_INFO.email}`}>
                <i className="fas fa-envelope"></i> {COMPANY_INFO.email}
              </a>
              <span className="pg-cta-dot">-</span>
              <span>
                <i className="fas fa-location-dot"></i> {fullAddress}
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
