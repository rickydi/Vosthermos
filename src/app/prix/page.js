import Link from "next/link";

export const metadata = {
  title: "Prix remplacement de vitre thermos 2026 | Grille tarifaire | Vosthermos",
  description:
    "Decouvrez nos prix pour le remplacement de vitre thermos, fenetre thermos et vitre thermos sur mesure. Prix au pied carre, grille tarifaire 2026 et soumission gratuite. Service professionnel avec garantie 10 ans.",
  alternates: {
    canonical: "https://www.vosthermos.com/prix",
  },
  openGraph: {
    title: "Prix remplacement de vitre thermos 2026 | Grille tarifaire | Vosthermos",
    description:
      "Grille tarifaire 2026 pour le remplacement de vitre thermos, fenetre thermos sur mesure, quincaillerie, calfeutrage et plus. Soumission gratuite.",
    url: "https://www.vosthermos.com/prix",
    siteName: "Vosthermos",
    locale: "fr_CA",
    type: "website",
  },
};

const pricingCards = [
  {
    icon: "fas fa-snowflake",
    title: "Remplacement vitre thermos",
    price: "A partir de 150$/unite installee",
    description:
      "Remplacement professionnel de vitre thermos sur mesure avec garantie 10 ans. Prix variable selon la dimension et le type de verre.",
    slug: "remplacement-vitre-thermos",
  },
  {
    icon: "fas fa-cogs",
    title: "Remplacement quincaillerie",
    price: "A partir de 4.99$/piece",
    description:
      "Poignees, serrures, rouleaux et pieces de remplacement pour portes-patio et fenetres. Installation incluse.",
    slug: "remplacement-quincaillerie",
  },
  {
    icon: "fas fa-door-open",
    title: "Reparation porte en bois",
    price: "Sur estimation",
    description:
      "Reparation et restauration de portes en bois. Chaque projet est unique, soumission gratuite et detaillee.",
    slug: "reparation-portes-bois",
  },
  {
    icon: "fas fa-border-all",
    title: "Moustiquaires sur mesure",
    price: "Sur estimation",
    description:
      "Fabrication et reparation de moustiquaires sur mesure pour tous types de fenetres et portes-patio.",
    slug: "moustiquaires-sur-mesure",
  },
  {
    icon: "fas fa-fill-drip",
    title: "Calfeutrage",
    price: "A partir de 8$/pied lineaire",
    description:
      "Calfeutrage professionnel de portes et fenetres. Ameliorez l'etancheite et l'efficacite energetique de votre maison.",
    slug: "calfeutrage",
  },
  {
    icon: "fas fa-eye",
    title: "Desembuage",
    price: "A partir de 120$/unite",
    description:
      "Traitement de desembuage pour vitres thermos embuees. Solution economique sans remplacement complet.",
    slug: "desembuage",
  },
];

const priceFactors = [
  {
    icon: "fas fa-ruler-combined",
    title: "Dimension de la vitre",
    description:
      "Le prix au pied carre varie selon la taille du thermos. Les grandes surfaces coutent proportionnellement moins cher par pied carre que les petites.",
  },
  {
    icon: "fas fa-layer-group",
    title: "Type de verre",
    description:
      "Verre double ou triple, Low-E, argon, trempe ou lamine — chaque option influence le prix final du thermos sur mesure.",
  },
  {
    icon: "fas fa-hard-hat",
    title: "Accessibilite",
    description:
      "Les fenetres en hauteur ou difficiles d'acces peuvent necessiter de l'equipement supplementaire, ce qui affecte le cout.",
  },
  {
    icon: "fas fa-boxes-stacked",
    title: "Quantite",
    description:
      "Nous offrons des rabais de volume. Plus vous remplacez de vitres thermos en une seule visite, meilleur est le prix unitaire.",
  },
];

const faqItems = [
  {
    question: "Combien coute le remplacement d'une vitre thermos?",
    answer:
      "Le prix du remplacement d'une vitre thermos commence a 150$ par unite installee. Le cout final depend de la dimension, du type de verre (double, triple, Low-E, argon) et de l'accessibilite de la fenetre. Contactez-nous pour une soumission gratuite et precise.",
  },
  {
    question: "Quel est le prix au pied carre pour un thermos?",
    answer:
      "Le prix d'une vitre thermos au pied carre varie generalement entre 8$ et 25$ selon le type de verre choisi. Un thermos double standard coute moins cher qu'un triple avec gaz argon et enduit Low-E. Nous calculons le prix exact lors de la prise de mesures a domicile.",
  },
  {
    question: "Est-ce plus economique de reparer ou remplacer une fenetre?",
    answer:
      "Dans la grande majorite des cas, le remplacement de la vitre thermos seule (150$ a 450$) est beaucoup plus economique que le remplacement complet de la fenetre (650$ a 1 400$). Si le cadre de votre fenetre est en bon etat, le remplacement du thermos est la solution ideale.",
  },
  {
    question: "Les prix incluent-ils l'installation?",
    answer:
      "Oui, tous nos prix incluent la prise de mesures, la fabrication du thermos sur mesure, le deplacement et l'installation professionnelle. Il n'y a aucun frais cache. La soumission que vous recevez est le prix final.",
  },
  {
    question: "Offrez-vous des rabais de volume?",
    answer:
      "Absolument! Nous offrons des tarifs degressifs pour les projets de plusieurs unites. Que ce soit pour un condo, un immeuble locatif ou plusieurs fenetres de votre maison, le prix unitaire diminue avec la quantite. Demandez votre soumission pour connaitre votre rabais.",
  },
  {
    question: "La garantie est-elle incluse dans le prix?",
    answer:
      "Oui, chaque remplacement de vitre thermos inclut une garantie de 10 ans sans frais supplementaires. Cette garantie couvre les defauts de fabrication, la perte d'etancheite et la formation de buee entre les vitres.",
  },
];

export default function PrixPage() {
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
    name: "Remplacement de vitre thermos",
    description:
      "Service professionnel de remplacement de vitre thermos sur mesure au Quebec. Prix competitifs, garantie 10 ans, soumission gratuite.",
    url: "https://www.vosthermos.com/prix",
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      email: "info@vosthermos.com",
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "330 Ch. St-Francois-Xavier, Local 101",
        addressLocality: "Saint-Francois-Xavier",
        addressRegion: "QC",
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
      name: "Services de reparation de portes et fenetres",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Remplacement vitre thermos",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Remplacement vitre thermos",
              },
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "150",
                priceCurrency: "CAD",
                unitText: "unite",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Desembuage",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Desembuage de vitre thermos",
              },
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "120",
                priceCurrency: "CAD",
                unitText: "unite",
              },
            },
          ],
        },
      ],
    },
  };

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Prix remplacement de vitre thermos 2026",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".faq-question", ".faq-answer", ".pricing-price"],
    },
    url: "https://www.vosthermos.com/prix",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[75px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-white">Prix</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-tag mr-1"></i> Grille tarifaire 2026
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Prix remplacement de{" "}
            <span className="text-[var(--color-red)]">vitre thermos</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Consultez notre grille tarifaire 2026 pour le remplacement de
            fenetre thermos, vitre thermos sur mesure et tous nos services de
            reparation. Prix transparents, soumission gratuite et garantie 10
            ans incluse.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                15+
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                ans d&apos;exp.
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                10 ans
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                garantie
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                5&#9733;
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                avis
              </span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Soumission gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos tarifs</span>
            <h2 className="text-3xl font-extrabold">
              Prix de nos{" "}
              <span className="text-[var(--color-red)]">services</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Tous les prix incluent le deplacement, la prise de mesures et
              l&apos;installation professionnelle. Soumission gratuite et sans
              engagement.
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
                <div className="pricing-price inline-block bg-[var(--color-red)] text-white text-sm font-extrabold px-4 py-2 rounded-full mb-4 self-start">
                  {card.price}
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>
                <Link
                  href={`/services/${card.slug}`}
                  className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold hover:underline"
                >
                  En savoir plus{" "}
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
            <span className="section-tag">Facteurs de prix</span>
            <h2 className="text-3xl font-extrabold">
              Qu&apos;est-ce qui influence le{" "}
              <span className="text-[var(--color-red)]">
                prix d&apos;un thermos
              </span>
              ?
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Le prix d&apos;une vitre thermos sur mesure depend de plusieurs
              facteurs. Voici les principaux elements qui influencent votre
              soumission.
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

      {/* Comparison Table: Reparer vs Remplacer */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comparaison</span>
            <h2 className="text-3xl font-extrabold text-white">
              Reparer vs{" "}
              <span className="text-[var(--color-red)]">
                remplacer une fenetre
              </span>
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Le remplacement de la vitre thermos seule est beaucoup plus
              economique que le remplacement complet de la fenetre. Comparez
              par vous-meme.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Repair option */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[var(--color-teal)] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[var(--color-teal)] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  Recommande
                </span>
              </div>
              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-screwdriver-wrench text-2xl text-[var(--color-teal)]"></i>
                </div>
                <h3 className="text-xl font-extrabold mb-1">
                  Remplacement du thermos
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Vitre seulement
                </p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-[var(--color-teal)]">
                  150$ — 450$
                </span>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  par unite installee
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Conserve le cadre existant",
                  "Installation en 30 minutes",
                  "Garantie 10 ans",
                  "Economie de 60% et plus",
                  "Aucun dommage au mur",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-xs text-[var(--color-teal)]"></i>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Replace option */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-muted)]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-house-chimney-window text-2xl text-[var(--color-muted)]"></i>
                </div>
                <h3 className="text-xl font-extrabold mb-1">
                  Remplacement complet
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Fenetre entiere
                </p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-[var(--color-muted)]">
                  650$ — 1 400$
                </span>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  par fenetre
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Remplacement du cadre complet",
                  "Installation de plusieurs heures",
                  "Travaux de finition necessaires",
                  "Cout 2 a 3 fois plus eleve",
                  "Risque de dommages au mur",
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
            <span className="section-tag">Questions frequentes</span>
            <h2 className="text-3xl font-extrabold">
              Tout savoir sur nos{" "}
              <span className="text-[var(--color-red)]">prix</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-left hover:bg-[var(--color-background)] transition-colors">
                  <span className="faq-question">{item.question}</span>
                  <i className="fas fa-chevron-down text-[var(--color-muted)] text-sm transition-transform group-open:rotate-180 flex-shrink-0"></i>
                </summary>
                <div className="faq-answer px-6 pb-5">
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
            Obtenez votre soumission gratuite
          </h2>
          <p className="text-white/80 mb-8">
            Prix competitifs, service rapide et garantie 10 ans. Contactez-nous
            pour connaitre le prix exact pour vos fenetres thermos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission
            </Link>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Browse shop */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Boutique en ligne</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Besoin de pieces? Achetez en ligne!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Plus de 740 pieces de remplacement pour portes, fenetres et
            moustiquaires disponibles dans notre boutique en ligne.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </>
  );
}
