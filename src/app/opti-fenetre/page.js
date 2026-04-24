import Image from "next/image";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";
import "./opti-fenetre.css";

const pageUrl = "https://www.vosthermos.com/opti-fenetre";

export const metadata = {
  title: "OPTI-FENÊTRE | Réparer sans remplacer | Vosthermos",
  description:
    `Remise à neuf de portes et fenêtres: thermos, quincaillerie, coupe-froid et calfeutrage. Économisez jusqu'à 70% vs remplacement. ${COMPANY_INFO.phone}.`,
  keywords: [
    "programme opti-fenetre",
    "réparer fenêtres sans remplacer",
    "remise à neuf fenêtres",
    "remplacement thermos",
    "réparation portes et fenêtres",
    "économie remplacement fenêtres",
    "fenêtres embuées Montréal",
  ],
  alternates: {
    canonical: pageUrl,
    languages: {
      "fr-CA": pageUrl,
      "en-CA": "https://www.vosthermos.com/en/opti-fenetre",
    },
  },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "Vosthermos",
    title: "Programme OPTI-FENÊTRE | Réparer avant de remplacer",
    description:
      "Remise à neuf complète de vos portes et fenêtres pour une fraction du coût d'un remplacement complet.",
    images: [{ url: "https://www.vosthermos.com/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg" }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programme OPTI-FENÊTRE | Vosthermos",
    description:
      "Thermos, quincaillerie, coupe-froid, calfeutrage et moustiquaires en un plan de remise à neuf.",
    images: ["https://www.vosthermos.com/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg"],
  },
  robots: "index, follow",
};

const inclusions = [
  { icon: "fas fa-temperature-half", title: "Thermos embués", text: "Remplacement des unités scellées avec verre performant." },
  { icon: "fas fa-screwdriver-wrench", title: "Quincaillerie", text: "Poignées, roulettes, serrures, mécanismes et ajustements." },
  { icon: "fas fa-wind", title: "Coupe-froid", text: "Joints compatibles pour réduire les courants d'air." },
  { icon: "fas fa-fill-drip", title: "Calfeutrage", text: "Scellant intérieur et extérieur pour limiter les infiltrations." },
  { icon: "fas fa-border-all", title: "Moustiquaires", text: "Réparation ou remplacement selon l'état de chaque ouverture." },
  { icon: "fas fa-door-open", title: "Portes en bois", text: "Restauration, ajustement et remise en état des cadres." },
];

const steps = [
  {
    title: "Diagnostic des ouvertures",
    text: "On inspecte vos portes et fenêtres pour séparer ce qui doit être réparé de ce qui peut rester en place.",
  },
  {
    title: "Plan de remise à neuf",
    text: "Vous recevez une proposition claire: thermos, quincaillerie, coupe-froid, calfeutrage et priorités.",
  },
  {
    title: "Travaux coordonnés",
    text: "Les interventions sont regroupées pour réduire les visites, les délais et les dérangements.",
  },
  {
    title: "Garantie et suivi",
    text: "Les travaux sont documentés et couverts par la garantie Vosthermos.",
  },
];

const signs = [
  "Buée permanente entre les vitres",
  "Fenêtres qui ferment mal ou laissent passer l'air",
  "Portes-patio difficiles à glisser",
  "Coupe-froid écrasés ou manquants",
  "Calfeutrage fissuré ou décollé",
  "Plusieurs réparations à faire en même temps",
];

const faqs = [
  {
    q: "Qu'est-ce que le programme OPTI-FENÊTRE?",
    a: "C'est une remise à neuf complète de vos portes et fenêtres existantes. Au lieu de tout remplacer, Vosthermos traite les composantes défaillantes: thermos, quincaillerie, coupe-froid, calfeutrage, moustiquaires et ajustements.",
  },
  {
    q: "Est-ce moins cher qu'un remplacement complet?",
    a: "Dans la majorité des cas, oui. Le programme vise à conserver les cadres encore en bon état et à remplacer seulement les composantes problématiques. L'économie peut atteindre 60 à 70% selon le projet.",
  },
  {
    q: "Est-ce que la performance énergétique s'améliore?",
    a: "Oui, si les pertes viennent de thermos défaillants, de coupe-froid usés ou de calfeutrage détérioré. Le diagnostic sert à identifier les corrections qui auront le plus d'impact.",
  },
  {
    q: "Est-ce que vous remplacez aussi les moustiquaires et la quincaillerie?",
    a: "Oui. Le programme peut inclure moustiquaires, poignées, roulettes, serrures, manivelles, mécanismes et ajustements selon l'état de vos ouvertures.",
  },
  {
    q: "Dans quelles villes le programme est-il offert?",
    a: "Le service est offert à Montréal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby et dans plusieurs villes de la Rive-Sud et des environs.",
  },
];

function JsonLd() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: "Programme OPTI-FENÊTRE",
    alternateName: ["OPTI-FENETRE", "Remise à neuf de portes et fenêtres"],
    serviceType: "Réparation et remise à neuf de portes et fenêtres",
    url: pageUrl,
    description:
      "Programme clé en main de remise à neuf de portes et fenêtres: thermos, quincaillerie, coupe-froid, calfeutrage, moustiquaires et ajustements.",
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
    areaServed: ["Montréal", "Laval", "Longueuil", "Brossard", "Saint-Hyacinthe", "Granby"].map((name) => ({
      "@type": "City",
      name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services inclus dans OPTI-FENÊTRE",
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
    name: "Comment fonctionne le programme OPTI-FENÊTRE",
    description: "Processus de remise à neuf de portes et fenêtres existantes avec Vosthermos.",
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
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.vosthermos.com/" },
      { "@type": "ListItem", position: 2, name: "OPTI-FENÊTRE", item: pageUrl },
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

export default function OptiFenetrePage() {
  return (
    <main className="opti-page">
      <JsonLd />

      <section className="opti-hero">
        <div className="opti-shell opti-hero-grid">
          <div className="opti-copy">
            <span className="opti-kicker">
              <i className="fas fa-star"></i> Programme exclusif Vosthermos
            </span>
            <h1>
              OPTI-FENÊTRE: réparez avant de remplacer.
            </h1>
            <p>
              Une remise à neuf complète de vos portes et fenêtres: thermos, quincaillerie,
              coupe-froid, calfeutrage et moustiquaires dans un plan clair.
            </p>
            <div className="opti-actions">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="opti-btn opti-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link href="#calculateur" className="opti-btn opti-btn-ghost">
                Calculer mes économies
              </Link>
            </div>
            <div className="opti-hero-stats">
              <div><strong>60-70%</strong><span>d'économie possible</span></div>
              <div><strong>1 plan</strong><span>pour toutes les ouvertures</span></div>
              <div><strong>24 h</strong><span>réponse ouvrable</span></div>
            </div>
          </div>

          <div className="opti-form-card">
            <div className="opti-form-head">
              <span>Évaluation gratuite</span>
              <strong>Photos acceptées</strong>
            </div>
            <p>Envoyez votre demande avec photos ou vidéos pour accélérer le diagnostic.</p>
            <QuoteForm compact theme="light" />
          </div>
        </div>
      </section>

      <section className="opti-strip">
        <div className="opti-shell">
          <strong>Le principe:</strong>
          <span>garder ce qui est encore bon, remplacer ce qui cause les pertes, regrouper les travaux.</span>
        </div>
      </section>

      <section className="opti-section opti-signs">
        <div className="opti-shell opti-split">
          <div>
            <span className="opti-red-tag">Diagnostic</span>
            <h2>Si plusieurs signes apparaissent, OPTI-FENÊTRE devient souvent plus rentable.</h2>
            <p>
              Le programme est pensé pour les maisons où plusieurs ouvertures ont des problèmes
              en même temps, sans que les cadres soient nécessairement à remplacer.
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
            <span>Comparaison</span>
            <h2>Le remplacement complet n'est pas toujours la meilleure première option.</h2>
          </div>
          <div className="opti-compare-grid">
            <article className="opti-compare-card is-muted">
              <span>Remplacement complet</span>
              <strong>18 000$</strong>
              <p>Exemple indicatif pour une maison avec 12 fenêtres et 2 portes-patio.</p>
              <ul>
                <li>Délais de fabrication plus longs</li>
                <li>Travaux plus invasifs</li>
                <li>Coût plus élevé</li>
              </ul>
            </article>
            <article className="opti-compare-card is-featured">
              <span>Programme OPTI-FENÊTRE</span>
              <strong>5 500$</strong>
              <p>Remise à neuf ciblée: thermos, joints, quincaillerie et calfeutrage.</p>
              <ul>
                <li>Économie potentielle jusqu'à 70%</li>
                <li>Moins de démolition</li>
                <li>Approche plus écologique</li>
              </ul>
            </article>
          </div>
          <p className="opti-note">
            Prix à titre indicatif. Chaque projet est évalué selon les dimensions, l'état des cadres et les composantes à remplacer.
          </p>
        </div>
      </section>

      <section className="opti-section opti-calculator" id="calculateur">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Calculateur</span>
            <h2>Estimez rapidement vos économies.</h2>
            <p>
              Entrez le nombre de fenêtres et portes pour comparer une remise à neuf avec un remplacement complet.
            </p>
          </div>
          <SavingsCalculator lang="fr" />
        </div>
      </section>

      <section className="opti-section opti-included">
        <div className="opti-shell">
          <div className="opti-section-head">
            <span>Services inclus</span>
            <h2>Une remise à neuf complète, pas une réparation isolée.</h2>
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
            <span>Processus</span>
            <h2>Quatre étapes pour transformer vos fenêtres sans chantier inutile.</h2>
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
              alt="Fenêtre réparée par Vosthermos"
              fill
              sizes="(max-width: 900px) 100vw, 520px"
            />
          </div>
          <div>
            <span className="opti-red-tag">Économie et environnement</span>
            <h2>Moins de déchets, plus de valeur pour vos ouvertures existantes.</h2>
            <p>
              Remettre à neuf une fenêtre encore saine permet de réduire les coûts,
              les déchets et les travaux inutiles. C'est particulièrement pertinent
              quand le cadre est bon, mais que les composantes ont vieilli.
            </p>
            <Link href="/contact?sujet=opti-fenetre" className="opti-btn opti-btn-dark">
              Demander une évaluation
            </Link>
          </div>
        </div>
      </section>

      <section className="opti-section opti-faq">
        <div className="opti-shell opti-faq-grid">
          <div>
            <span className="opti-red-tag">FAQ</span>
            <h2>Questions fréquentes sur OPTI-FENÊTRE.</h2>
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
          <h2>Prêt à savoir si vos fenêtres peuvent être remises à neuf?</h2>
          <p>Envoyez vos photos ou appelez-nous. On vous dira si OPTI-FENÊTRE est pertinent pour votre situation.</p>
          <div className="opti-actions opti-actions-center">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="opti-btn opti-btn-primary">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=opti-fenetre" className="opti-btn opti-btn-ghost-light">
              Écrire à Vosthermos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
