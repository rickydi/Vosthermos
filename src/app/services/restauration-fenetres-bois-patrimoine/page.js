import Link from "next/link";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/company-info";

const PAGE_URL = "https://www.vosthermos.com/services/restauration-fenetres-bois-patrimoine";

export const metadata = {
  title: "Restauration de Fenetres en Bois Patrimoniales au Quebec | Vosthermos",
  description:
    `Specialistes de la restauration de fenetres en bois patrimoniales et historiques au Quebec. Greffe de bois, re-vitrage thermos dans cadre ancien, mastic a l'huile de lin, quincaillerie d'epoque. Tout le Quebec. Sur devis ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "restauration fenetres bois patrimoniales, restauration fenetre bois ancienne, fenetre patrimoniale Quebec, re-vitrage fenetre bois, greffe de bois fenetre, mastic huile de lin, fenetre historique Vieux-Montreal, fenetre bois Vieux-Quebec, restauration patrimoine",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Restauration de Fenetres en Bois Patrimoniales au Quebec",
    description:
      "Specialistes de la restauration de fenetres en bois patrimoniales. Greffe de bois, re-vitrage, techniques traditionnelles et modernes. Tout le Quebec.",
    images: [
      {
        url: "https://www.vosthermos.com/images/portes-bois/portes-bg.jpg",
        width: 1200,
        height: 800,
        alt: "Fenetre en bois patrimoniale restauree",
      },
    ],
    locale: "fr_CA",
  },
};

export default function PatrimoinePage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Restauration de fenetres en bois patrimoniales",
    serviceType: "Restauration patrimoniale",
    description:
      "Service specialise de restauration de fenetres en bois patrimoniales et historiques au Quebec. Greffe de bois, re-vitrage thermos dans cadre ancien, mastic a l'huile de lin, restauration de quincaillerie d'epoque.",
    url: PAGE_URL,
    provider: {
      "@type": "LocalBusiness",
      "@id": "https://www.vosthermos.com/#business",
      name: "Vosthermos",
      telephone: "+15148258411",
      email: COMPANY_INFO.email,
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_INFO.address,
        addressLocality: "Saint-Francois-Xavier",
        addressRegion: "QC",
        postalCode: "J0H 1S0",
        addressCountry: "CA",
      },
    },
    areaServed: {
      "@type": "State",
      name: "Quebec",
      containedInPlace: {
        "@type": "Country",
        name: "Canada",
      },
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "CAD",
        description: "Sur devis apres evaluation - chaque projet patrimonial est unique",
      },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qu'est-ce qu'une fenetre patrimoniale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Une fenetre patrimoniale est une fenetre en bois d'origine ou d'epoque, generalement installee dans un batiment historique de plus de 50 ans. Elle possede une valeur architecturale, culturelle ou historique. Au Quebec, on les retrouve dans le Vieux-Montreal, le Vieux-Quebec, le Vieux-Terrebonne, le Vieux-Saint-Bruno et dans les maisons ancestrales. Leur restauration demande un savoir-faire specialise pour preserver leur caractere unique.",
        },
      },
      {
        "@type": "Question",
        name: "Peut-on installer un thermos moderne dans une fenetre en bois ancienne?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, c'est meme une de nos specialites. Nous installons une vitre thermos moderne (double ou triple vitrage, gaz argon, verre low-e) dans un cadre de fenetre en bois restaure. Le cadre d'origine est conserve avec son caractere historique, mais vous beneficiez de la performance energetique d'une fenetre neuve. C'est la solution ideale pour les batiments historiques qui veulent reduire leurs couts de chauffage sans perdre leur cachet.",
        },
      },
      {
        "@type": "Question",
        name: "Qu'est-ce que la greffe de bois?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La greffe de bois est une technique de restauration qui consiste a remplacer une section pourrie ou endommagee d'un cadre de fenetre en bois par du bois neuf de meme essence. Nous decoupons precisement la zone abimee, faconnons une piece de bois sur mesure, l'encastrons et la colle avec des adhesifs structuraux, puis nous sablons et finissons pour obtenir une jonction invisible. Cette technique preserve l'integralite du cadre d'origine.",
        },
      },
      {
        "@type": "Question",
        name: "Pourquoi utiliser du mastic a l'huile de lin plutot que du silicone moderne?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Le mastic a l'huile de lin est le scellant traditionnel utilise pour les fenetres en bois depuis plus de 200 ans. Il respire avec le bois (absorbe et libere l'humidite), se repare facilement et dure plusieurs decennies. Le silicone moderne est etanche mais rigide et peut emprisonner l'humidite dans le bois, causant le pourrissement. Pour les fenetres patrimoniales, le mastic a l'huile de lin est la solution authentique et plus durable.",
        },
      },
      {
        "@type": "Question",
        name: "Combien coute la restauration d'une fenetre patrimoniale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chaque projet patrimonial est unique. Le cout depend de l'etat du cadre, du type de travaux requis (greffe de bois, re-vitrage, mastic traditionnel, restauration de quincaillerie), du nombre de fenetres et de la region. Nous offrons une evaluation gratuite sur place avec devis detaille. La restauration est presque toujours plus economique qu'un remplacement par du neuf conforme aux normes patrimoniales, et preserve la valeur historique du batiment.",
        },
      },
      {
        "@type": "Question",
        name: "Desservez-vous tout le Quebec pour la restauration patrimoniale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous desservons tout le Quebec pour les projets de restauration patrimoniale. Nous travaillons regulierement dans le Grand Montreal, la Monteregie, les Laurentides, Lanaudiere, Quebec, Trois-Rivieres, Sherbrooke et les zones historiques environnantes. Pour les projets dans les regions plus eloignees, contactez-nous pour confirmer notre disponibilite et evaluer la logistique.",
        },
      },
      {
        "@type": "Question",
        name: "Travaillez-vous avec les gestionnaires de batiments historiques et les municipalites?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous collaborons avec des gestionnaires de copropriete, des proprietaires de batiments patrimoniaux, des organismes de protection du patrimoine et des municipalites. Nous pouvons fournir les documents techniques requis pour les demandes de subvention ou les approbations des comites de patrimoine. N'hesitez pas a nous contacter pour discuter des exigences specifiques de votre projet.",
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://www.vosthermos.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "https://www.vosthermos.com/services",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Restauration fenetres bois patrimoniales",
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* HERO avec photo patrimoine */}
      <section className="relative pt-[80px] bg-[#2a1e15]">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/images/portes-bois/portes-bg.jpg"
            alt="Fenetre en bois patrimoniale d'un batiment historique du Vieux-Quebec"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1e15]/60 via-[#2a1e15]/50 to-[#2a1e15]/90"></div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-20 lg:py-28">
          <div className="flex items-center gap-2 text-sm text-[#d4b896] mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/#services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white">Restauration patrimoniale</span>
          </div>

          <span className="inline-block bg-[#d4b896]/20 text-[#f5d9a8] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 border border-[#d4b896]/30">
            Savoir-faire patrimonial · Tout le Quebec
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] mb-6 max-w-4xl">
            Restauration de fenetres en bois{" "}
            <span className="text-[#f5d9a8] italic">patrimoniales</span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-3xl leading-relaxed mb-8 font-light">
            Preserver le caractere unique de votre batiment historique tout en
            ameliorant son efficacite energetique. Greffe de bois, re-vitrage
            thermos dans cadre ancien, mastic a l&apos;huile de lin et
            quincaillerie d&apos;epoque. Chaque projet est unique, chaque devis sur mesure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[#d4b896] text-[#2a1e15] px-8 py-4 rounded-full font-bold hover:bg-[#f5d9a8] transition-all shadow-2xl"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-[#d4b896]/40 px-8 py-4 rounded-full font-bold hover:border-[#d4b896] hover:bg-[#d4b896]/10 transition-all"
            >
              Demander une evaluation gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO magazine */}
      <section className="bg-[#faf6f0] py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <p className="text-[#8b6f47] text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Notre approche
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a1e15] mb-8 leading-tight">
            Le bois d&apos;origine raconte une histoire qui merite d&apos;etre preservee.
          </h2>
          <div className="prose prose-lg text-[#3d2f22] max-w-none space-y-5">
            <p>
              Les fenetres en bois des batiments historiques du Quebec ont
              traverse un siecle, parfois deux. Elles portent le grain du bois
              d&apos;origine, les moulures travaillees a la main, la quincaillerie
              forgee d&apos;epoque. Les remplacer par du PVC ou de l&apos;aluminium, c&apos;est
              effacer le caractere qui fait la valeur de votre maison.
            </p>
            <p>
              Notre approche combine les techniques traditionnelles (greffe de
              bois, mastic a l&apos;huile de lin, finition a la gomme-laque) avec les
              technologies modernes d&apos;efficacite energetique (thermos double ou
              triple vitrage, gaz argon, verre low-e). Le cadre d&apos;origine est
              preserve. La performance est celle du 21e siecle.
            </p>
            <p>
              Nous travaillons partout au Quebec, avec une concentration dans le
              Grand Montreal, la Monteregie, les Laurentides, Lanaudiere, Quebec,
              Trois-Rivieres et Sherbrooke. Pour les projets patrimoniaux, nous
              collaborons regulierement avec des gestionnaires de copropriete,
              des proprietaires de batiments historiques et des comites de
              patrimoine municipaux.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNIQUES avec photos */}
      <section className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#8b6f47] text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Techniques de restauration
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a1e15] mb-4">
              Un savoir-faire, quatre etapes cles
            </h2>
            <p className="text-[#6b5a47] text-lg max-w-2xl mx-auto">
              De la greffe de bois neuf sur un cadre centenaire au re-vitrage
              thermos moderne dans un cadre restaure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Greffe de bois */}
            <article className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 shadow-xl">
                <Image
                  src="/images/portes-bois/detail-1.jpg"
                  alt="Greffe de bois neuf sur cadre de fenetre patrimoniale avec quincaillerie d'epoque restauree"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2a1e15] mb-3">
                1. Greffe de bois
              </h3>
              <p className="text-[#3d2f22] leading-relaxed">
                Les sections pourries ou endommagees du cadre d&apos;origine sont
                decoupees precisement, remplacees par du bois neuf de meme
                essence (pin blanc, chene rouge, cedre blanc), colle avec des
                adhesifs structuraux. La jonction est invisible apres
                finition. Le cadre d&apos;origine est integralement preserve.
              </p>
            </article>

            {/* Re-vitrage */}
            <article className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 shadow-xl">
                <Image
                  src="/images/portes-bois/reparation-2.jpg"
                  alt="Installation d'une vitre thermos moderne dans un cadre de fenetre en bois restaure"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2a1e15] mb-3">
                2. Re-vitrage moderne
              </h3>
              <p className="text-[#3d2f22] leading-relaxed">
                Installation d&apos;une vitre thermos moderne (double ou triple
                vitrage, gaz argon, verre low-e) dans le cadre en bois
                restaure. Le caractere historique est preserve, la
                performance energetique est celle d&apos;une fenetre neuve. Ideal
                pour reduire les couts de chauffage sans perdre le cachet.
              </p>
            </article>

            {/* Finition */}
            <article className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 shadow-xl">
                <Image
                  src="/images/portes-bois/reparation-1.jpg"
                  alt="Finition peinture professionnelle sur fenetre en bois restauree patrimoine"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2a1e15] mb-3">
                3. Finition traditionnelle ou moderne
              </h3>
              <p className="text-[#3d2f22] leading-relaxed">
                Selon l&apos;authenticite visee: huile de lin et gomme-laque pour
                respecter la tradition, ou peintures alkyde haute performance
                pour une durabilite maximale. Chaque finition est appliquee
                en plusieurs couches avec sablage intermediaire, pour une
                surface impeccable et resistante aux cycles climatiques du
                Quebec.
              </p>
            </article>

            {/* Contexte patrimonial */}
            <article className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 shadow-xl">
                <Image
                  src="/images/portes-bois/portes-bg.jpg"
                  alt="Fenetre en bois restauree dans un batiment historique en pierre du Quebec"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2a1e15] mb-3">
                4. Respect du batiment d&apos;origine
              </h3>
              <p className="text-[#3d2f22] leading-relaxed">
                Nous intervenons dans les quartiers patrimoniaux du Quebec:
                Vieux-Montreal, Vieux-Quebec, Vieux-Terrebonne,
                Vieux-Saint-Bruno, Vieux-Longueuil. Nos techniques respectent
                les normes des comites de patrimoine et les exigences des
                demandes de subvention municipales ou provinciales.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* BATIMENTS TYPIQUES */}
      <section className="bg-[#2a1e15] py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-white">
          <div className="text-center mb-16">
            <p className="text-[#d4b896] text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Ou nous intervenons
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Batiments patrimoniaux typiques
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-[#d4b896]/20 rounded-lg p-6 backdrop-blur-sm">
              <i className="fas fa-church text-[#f5d9a8] text-3xl mb-4"></i>
              <h3 className="text-xl font-serif font-bold mb-3">Maisons ancestrales</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Maisons canadiennes, victoriennes, neo-classiques (1850-1930).
                Fenetres a guillotine, a battant avec mantelures, cadres en pin
                ou en cedre blanc.
              </p>
            </div>
            <div className="bg-white/5 border border-[#d4b896]/20 rounded-lg p-6 backdrop-blur-sm">
              <i className="fas fa-landmark text-[#f5d9a8] text-3xl mb-4"></i>
              <h3 className="text-xl font-serif font-bold mb-3">Edifices institutionnels</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Eglises, presbyteres, ecoles de rang, edifices publics anciens.
                Fenetres de grande taille avec meneaux, verres antiques, cadres
                en bois massif.
              </p>
            </div>
            <div className="bg-white/5 border border-[#d4b896]/20 rounded-lg p-6 backdrop-blur-sm">
              <i className="fas fa-building text-[#f5d9a8] text-3xl mb-4"></i>
              <h3 className="text-xl font-serif font-bold mb-3">Copropriete patrimoniale</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Conversions de batiments historiques en condos
                (Vieux-Montreal, Griffintown, Vieux-Quebec). Gestion de parc
                de fenetres, plans pluriannuels, conformite aux reglements
                municipaux.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm italic">
              Couverture: Grand Montreal · Monteregie · Laurentides · Lanaudiere ·
              Quebec · Mauricie · Estrie · Outaouais · tout le Quebec sur demande.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#faf6f0] py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#8b6f47] text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Questions frequentes
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a1e15]">
              Tout ce que vous voulez savoir
            </h2>
          </div>

          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white border border-[#e8dcc7] rounded-lg overflow-hidden"
              >
                <summary className="flex justify-between items-center cursor-pointer p-6 list-none">
                  <h3 className="font-serif font-bold text-[#2a1e15] text-lg pr-4">
                    {item.name}
                  </h3>
                  <i className="fas fa-chevron-down text-[#8b6f47] group-open:rotate-180 transition-transform duration-500"></i>
                </summary>
                <div className="px-6 pb-6 text-[#3d2f22] leading-relaxed">
                  {item.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-br from-[#3d2f22] via-[#2a1e15] to-[#1a120b] py-20">
        <div className="max-w-[900px] mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Votre projet patrimonial merite une evaluation sur place.
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Chaque batiment historique est unique. Un technicien specialise se
            deplace partout au Quebec pour evaluer l&apos;etat de vos fenetres et
            vous remettre un devis detaille, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[#d4b896] text-[#2a1e15] px-10 py-4 rounded-full font-bold hover:bg-[#f5d9a8] transition-all shadow-2xl"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-[#d4b896]/40 px-10 py-4 rounded-full font-bold hover:border-[#d4b896] hover:bg-[#d4b896]/10 transition-all"
            >
              Formulaire de contact
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-white/50">
            <Link
              href="/services/reparation-portes-bois"
              className="hover:text-[#f5d9a8] transition-colors"
            >
              ← Restauration standard portes et fenetres en bois
            </Link>
            <Link href="/services" className="hover:text-[#f5d9a8] transition-colors">
              Tous nos services →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
