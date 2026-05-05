import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";
import "./preview-accueil/preview-accueil.css";

export const metadata = {
  title: "Vosthermos Montreal | Reparation portes et fenetres des 150$",
  description:
    `Thermos embue? Porte qui bloque? Vosthermos remplace vos vitres thermos des 150$ avec garantie 10 ans. 15 ans d'experience, soumission gratuite 24h, Rive-Sud, Montreal, Laval. ${COMPANY_INFO.phone}`,
  keywords:
    "reparation portes fenetres, vitre thermos, remplacement thermos, remplacement quincaillerie, moustiquaire sur mesure, porte-patio, porte en bois, calfeutrage fenetres, desembuage, coupe-froid, insertion porte, boutique pieces portes fenetres, quincaillerie porte fenetre en ligne, Delson, Montreal, Rive-Sud, Laval, Longueuil, Brossard, Granby, Saint-Hyacinthe, Terrebonne, Repentigny",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/",
    languages: {
      "fr-CA": "https://www.vosthermos.com/",
      "en-CA": "https://www.vosthermos.com/en/",
      "x-default": "https://www.vosthermos.com/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Vosthermos",
    url: "https://www.vosthermos.com/",
    title: "Vosthermos Montreal | Reparation portes et fenetres",
    description:
      `Thermos embue? Vosthermos remplace vos vitres thermos des 150$. Garantie 10 ans, soumission gratuite 24h. Montreal, Rive-Sud, Laval. ${COMPANY_INFO.phone}`,
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vosthermos Montreal - Reparation portes et fenetres",
    description: `Experts en remplacement de thermos depuis 2010. Soumission gratuite 24h. ${COMPANY_INFO.phone}`,
    images: [COMPANY_INFO.logo],
  },
};

const services = [
  {
    icon: "fas fa-temperature-half",
    title: "Remplacement vitre thermos a Montreal",
    text: "Page locale pour les vitres thermos embuees, cassees ou inefficaces avec verre performant.",
    image: "/images/vitre-thermos/detail-1.jpg",
    href: "/services/remplacement-vitre-thermos/montreal",
  },
  {
    icon: "fas fa-screwdriver-wrench",
    title: "Quincaillerie",
    text: "Poignées, roulettes, serrures, mécanismes et ajustements de portes-patio.",
    image: "/images/quincaillerie/detail-roulette-porte-patio.jpg",
    href: "/services/remplacement-quincaillerie",
  },
  {
    icon: "fas fa-door-open",
    title: "Portes et fenêtres",
    text: "Réparation, coupe-froid, calfeutrage, moustiquaires et restauration bois.",
    image: "/images/portes-bois/detail-1.jpg",
    href: "/services/reparation-portes-bois",
  },
];

const problems = [
  "Buée entre les vitres",
  "Porte-patio difficile à glisser",
  "Poignée ou serrure brisée",
  "Courants d'air autour des fenêtres",
  "Moustiquaire déchirée",
  "Cadre de bois abîmé",
];

const gallery = [
  {
    before: "/images/realisations/thermos-remplacement-before.jpg",
    after: "/images/realisations/thermos-remplacement-after.jpg",
    title: "Thermos remplacé",
  },
  {
    before: "/images/realisations/fenetre-restauration-before.jpg",
    after: "/images/realisations/fenetre-restauration-after.jpg",
    title: "Fenêtre restaurée",
  },
  {
    before: "/images/realisations/quincaillerie-ajustement-before.jpg",
    after: "/images/realisations/quincaillerie-ajustement-after.jpg",
    title: "Quincaillerie ajustée",
  },
];

const products = [
  { title: "Roulettes porte-patio", count: "120+ modèles", icon: "fas fa-circle-dot" },
  { title: "Poignées et serrures", count: "180+ pièces", icon: "fas fa-lock" },
  { title: "Coupe-froid", count: "Sur mesure", icon: "fas fa-wind" },
  { title: "Moustiquaires", count: "Réparation rapide", icon: "fas fa-border-all" },
];

const process = [
  {
    title: "Envoyez votre demande",
    text: "Décrivez le problème, ajoutez quelques photos si possible et indiquez votre secteur.",
  },
  {
    title: "On confirme la solution",
    text: "On valide si une réparation suffit ou si un remplacement de thermos est nécessaire.",
  },
  {
    title: "Intervention efficace",
    text: "Le technicien arrive avec les pièces adaptées et laisse un travail propre.",
  },
];

const reviews = [
  {
    name: "Julie M.",
    text: "Service rapide, explications claires et fenêtre réparée sans devoir tout remplacer.",
  },
  {
    name: "Syndicat de copropriété",
    text: "Très pratique pour les suivis d'unités et les interventions récurrentes.",
  },
  {
    name: "Marc L.",
    text: "Ils ont trouvé la bonne pièce de porte-patio et réglé le problème sur place.",
  },
];

const sectors = [
  "Montréal",
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
    q: "Est-ce qu'on doit remplacer toute la fenêtre?",
    a: "Pas toujours. Souvent, remplacer le thermos, la quincaillerie ou le coupe-froid suffit.",
  },
  {
    q: "Combien coûte un remplacement de thermos?",
    a: "Le prix varie selon les dimensions et le type de verre. Les remplacements commencent à partir de 150$ par unité installée.",
  },
  {
    q: "Peut-on joindre des photos?",
    a: "Oui. Le formulaire de soumission accepte les photos et vidéos pour accélérer l'estimation.",
  },
];

function cityHref(city) {
  const slug = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `/reparation-portes-et-fenetres/${slug}`;
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
    <div className="hp-quote-card" id="soumission">
      <div className="hp-quote-head">
        <span>Soumission gratuite</span>
        <strong>Réponse rapide</strong>
      </div>
      <p className="hp-quote-intro">
        Email requis, photos et vidéos acceptées pour accélérer l&apos;estimation.
      </p>
      <QuoteForm compact theme="light" />
    </div>
  );
}

export default async function Home() {
  const totalProducts = await prisma.product.count();

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Comment faire reparer vos portes et fenetres avec Vosthermos",
    description: "Un processus simple en 3 etapes pour faire reparer vos portes et fenetres par des experts.",
    step: [
      { "@type": "HowToStep", name: "Contactez-nous", text: `Appelez-nous au ${COMPANY_INFO.phone} ou remplissez notre formulaire en ligne. Decrivez votre besoin et nous vous repondrons rapidement.`, url: "https://www.vosthermos.com/#soumission" },
      { "@type": "HowToStep", name: "Estimation gratuite", text: "Nous evaluons vos besoins et vous fournissons une soumission claire et detaillee, sans surprise ni frais caches." },
      { "@type": "HowToStep", name: "Intervention rapide", text: "Notre equipe intervient a votre domicile ou entreprise avec tout le materiel necessaire pour un travail de qualite." },
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
        name: "Quelle est la garantie sur les vitres thermos?",
        acceptedAnswer: { "@type": "Answer", text: "Tous nos remplacements de vitres thermos sont couverts par une service professionnel garanti." },
      },
      {
        "@type": "Question",
        name: "Quels secteurs desservez-vous?",
        acceptedAnswer: { "@type": "Answer", text: "Nous desservons Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny et toute la region dans un rayon de 100km autour de Delson." },
      },
      {
        "@type": "Question",
        name: "Offrez-vous des soumissions gratuites?",
        acceptedAnswer: { "@type": "Answer", text: `Oui, toutes nos soumissions sont gratuites et sans engagement. Appelez-nous au ${COMPANY_INFO.phone} ou remplissez notre formulaire en ligne.` },
      },
      {
        "@type": "Question",
        name: "Peut-on joindre des photos a la demande?",
        acceptedAnswer: { "@type": "Answer", text: "Oui, le formulaire accepte les photos et videos pour aider notre equipe a evaluer le probleme plus rapidement." },
      },
    ],
  };

  const proofItems = [
    { value: "15+", label: "ans d'expérience" },
    { value: `${totalProducts}+`, label: "pièces en stock" },
    { value: "10 ans", label: "garantie thermos" },
    { value: "24 h", label: "réponse ouvrable" },
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
                <i className="fas fa-circle"></i> Réparation portes et fenêtres
              </span>
              <h1>Réparez avant de remplacer.</h1>
              <p className="hp-lede">
                Vosthermos remplace les vitres thermos embuées, répare la quincaillerie
                et prolonge la vie de vos portes et fenêtres partout dans le Grand Montréal.
              </p>
              <div className="hp-actions">
                <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
                <Link href="/boutique" className="hp-btn hp-btn-ghost">
                  Voir la boutique
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
              {/* TEMP: bulle RBQ désactivée
              <div className="hp-form-proof">
                <i className="fas fa-shield-halved"></i>
                <span>RBQ 5820-0684-01 · Soumission gratuite</span>
              </div>
              */}
              <QuoteCard />
            </div>
          </div>
        </section>

        <section className="hp-manager-strip">
          <div className="hp-shell hp-manager-inner">
            <div>
              <span>Nouveau</span>
              <strong>Portail gestionnaires de copropriétés</strong>
              <p>Bons de travail numériques, photos, factures et suivi par immeuble.</p>
            </div>
            <Link href="/portail-gestionnaire">Voir le portail</Link>
          </div>
        </section>

        <section className="hp-section hp-services" id="services">
          <div className="hp-shell">
            <SectionHeader
              kicker="Services clés"
              title="Les réparations les plus demandées, sans refaire tout le projet."
              text="La page garde le contenu commercial important, mais avec une hiérarchie plus simple et plus premium."
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
                    <span>En savoir plus</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-problems">
          <div className="hp-shell hp-problem-grid">
            <div>
              <span className="hp-red-tag">Diagnostic rapide</span>
              <h2>Vos clients se reconnaissent tout de suite dans le problème.</h2>
              <p>
                Au lieu d&apos;empiler trop d&apos;informations en haut de page, l&apos;accueil
                guide vers les problèmes concrets qui créent la demande.
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

        <section className="hp-section hp-gallery" id="galerie">
          <div className="hp-shell">
            <SectionHeader
              kicker="Réalisations"
              title="Un aperçu visuel avant/après plus haut dans la page."
              text="Ça rassure vite et ça rend l'accueil moins catalogue."
            />
            <div className="hp-gallery-grid">
              {gallery.map((item) => (
                <article className="hp-gallery-card" key={item.title}>
                  <div className="hp-before-after">
                    <div>
                      <Image src={item.before} alt={`${item.title} avant`} fill sizes="(max-width: 1050px) 50vw, 16vw" />
                      <span>Avant</span>
                    </div>
                    <div>
                      <Image src={item.after} alt={`${item.title} après`} fill sizes="(max-width: 1050px) 50vw, 16vw" />
                      <span>Après</span>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-shop" id="boutique">
          <div className="hp-shell hp-shop-grid">
            <div>
              <span className="hp-red-tag">Boutique intégrée</span>
              <h2>La boutique reste visible, mais elle ne prend pas toute la première impression.</h2>
              <p>
                L&apos;objectif est de convertir d&apos;abord en soumission, puis de montrer les pièces
                disponibles pour renforcer l&apos;expertise.
              </p>
              <Link href="/boutique" className="hp-btn hp-btn-dark">Parcourir la boutique</Link>
            </div>
            <div className="hp-product-grid">
              {products.map((product) => (
                <Link href="/boutique" key={product.title}>
                  <i className={product.icon}></i>
                  <strong>{product.title}</strong>
                  <span>{product.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-process" id="comment-ca-marche">
          <div className="hp-shell">
            <SectionHeader
              kicker="Comment ça marche"
              title="Un processus clair en 3 étapes."
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
              kicker="Confiance"
              title="Des avis plus courts, plus visibles, plus faciles à scanner."
            />
            <div className="hp-review-grid">
              {reviews.map((review) => (
                <article key={review.name}>
                  <div className="hp-stars">★★★★★</div>
                  <p>“{review.text}”</p>
                  <strong>{review.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-sectors" id="secteurs">
          <div className="hp-shell">
            <SectionHeader
              kicker="Secteurs desservis"
              title="Couverture locale claire pour le SEO et la conversion."
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
              <h2>Répondre aux objections sans alourdir le haut de page.</h2>
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
            <h2>Besoin d&apos;une réparation? Contactez Vosthermos.</h2>
            <p>
              Soumission gratuite, service rapide et garanti. Ajoutez vos photos directement
              au formulaire pour accélérer l&apos;estimation.
            </p>
            <div className="hp-actions hp-actions-center">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link href="#soumission" className="hp-btn hp-btn-ghost-light">
                Remplir le formulaire
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
