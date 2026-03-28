import Link from "next/link";

export const metadata = {
  title: "Garantie 10 ans | Vosthermos",
  description:
    "Vosthermos offre une garantie de 10 ans sur le remplacement de vitres thermos, 5 ans sur la main-d'oeuvre et une garantie transferable au prochain proprietaire. Service de reclamation simple et rapide.",
  alternates: { canonical: "https://www.vosthermos.com/garantie" },
  openGraph: {
    title: "Garantie 10 ans | Vosthermos",
    description:
      "Garantie 10 ans sur les vitres thermos, 5 ans main-d'oeuvre, transferable. Tranquillite d'esprit assuree.",
    url: "https://www.vosthermos.com/garantie",
    type: "website",
    locale: "fr_CA",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferWarranty",
  name: "Garantie Vosthermos",
  description:
    "Garantie de 10 ans sur le remplacement de vitres thermos, 5 ans sur la main-d'oeuvre, transferable au prochain proprietaire.",
  url: "https://www.vosthermos.com/garantie",
  warrantyScope: {
    "@type": "WarrantyScope",
    name: "Remplacement de vitres thermos, quincaillerie, moustiquaires, reparation de portes en bois",
  },
  seller: {
    "@type": "LocalBusiness",
    name: "Vosthermos",
    url: "https://www.vosthermos.com",
    telephone: "+15148258411",
  },
};

const guaranteeCards = [
  {
    duration: "10 ans",
    label: "Garantie sur les vitres thermos",
    description:
      "Nos vitres thermos sont garanties contre les bris de scellant, la buee entre les vitres et la perte d'efficacite energetique.",
    icon: "fa-snowflake",
  },
  {
    duration: "5 ans",
    label: "Garantie sur la main-d'oeuvre",
    description:
      "Tous nos travaux d'installation et de reparation sont couverts par une garantie complete sur la main-d'oeuvre.",
    icon: "fa-tools",
  },
  {
    duration: "Transferable",
    label: "Garantie transferable au prochain proprietaire",
    description:
      "Lors de la vente de votre propriete, notre garantie est automatiquement transferee au nouveau proprietaire sans frais.",
    icon: "fa-exchange-alt",
  },
];

const coveredItems = [
  {
    title: "Remplacement de vitres thermos",
    items: [
      "Bris du scellant entre les vitres",
      "Buee ou condensation entre les panneaux",
      "Perte d'efficacite thermique",
    ],
    icon: "fa-snowflake",
  },
  {
    title: "Quincaillerie installee par nos soins",
    items: [
      "Poignees et mecanismes de verrouillage",
      "Charniere et pentures",
      "Systemes de roulement et rails",
    ],
    icon: "fa-cogs",
  },
  {
    title: "Moustiquaires sur mesure",
    items: [
      "Cadre et structure en aluminium",
      "Toile et maillage",
      "Systemes de fixation",
    ],
    icon: "fa-border-all",
  },
  {
    title: "Reparations de portes en bois",
    items: [
      "Travaux de restauration effectues",
      "Pieces remplacees lors de la reparation",
      "Finition et etancheite",
    ],
    icon: "fa-door-open",
  },
];

const claimSteps = [
  {
    num: "1",
    title: "Contactez-nous",
    description:
      "Appelez-nous au 514-825-8411 ou remplissez notre formulaire de contact en ligne. Decrivez le probleme rencontre et ayez votre numero de facture a portee de main.",
    icon: "fa-phone-alt",
  },
  {
    num: "2",
    title: "Evaluation",
    description:
      "Notre equipe evalue la situation, que ce soit par photo ou en se deplacant a votre domicile. Nous determinons si le probleme est couvert par la garantie.",
    icon: "fa-search",
  },
  {
    num: "3",
    title: "Remplacement / Reparation",
    description:
      "Si le probleme est couvert, nous procedons au remplacement ou a la reparation sans frais supplementaires. Rapide, simple et sans tracas.",
    icon: "fa-check-circle",
  },
];

const faqItems = [
  {
    question: "Que couvre la garantie exactement?",
    answer:
      "Notre garantie couvre les defauts de fabrication et d'installation sur les vitres thermos (10 ans), la main-d'oeuvre (5 ans), la quincaillerie installee par nos soins, les moustiquaires sur mesure et les reparations de portes en bois. Elle ne couvre pas les dommages causes par une mauvaise utilisation, un accident ou une catastrophe naturelle.",
  },
  {
    question: "Comment faire une reclamation?",
    answer:
      "Contactez-nous par telephone au 514-825-8411 ou via notre formulaire en ligne. Fournissez votre numero de facture et une description du probleme. Notre equipe vous repondra dans les 24 a 48 heures ouvrables pour planifier une evaluation.",
  },
  {
    question: "La garantie est-elle transferable?",
    answer:
      "Oui, notre garantie est entierement transferable au prochain proprietaire de votre residence. Lors de la vente, il suffit de transmettre votre facture originale au nouveau proprietaire. Aucune demarche supplementaire n'est requise.",
  },
  {
    question: "Quels sont les delais de traitement?",
    answer:
      "Nous nous engageons a evaluer votre reclamation dans les 48 heures ouvrables suivant votre demande. Une fois la reclamation approuvee, les travaux de remplacement ou de reparation sont generalement effectues dans un delai de 5 a 10 jours ouvrables, selon la disponibilite des pieces.",
  },
];

export default function GarantiePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-white">Garantie</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-tag">Notre engagement</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mt-2">
              Notre <span className="text-[var(--color-red)]">garantie</span>
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Votre tranquillite d&apos;esprit est notre priorite. Nous offrons
              l&apos;une des meilleures garanties de l&apos;industrie sur tous nos
              travaux de reparation et remplacement de portes et fenetres.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee Cards */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-28">
            {guaranteeCards.map((card) => (
              <div
                key={card.duration}
                className="bg-white rounded-xl p-8 shadow-lg border border-[var(--color-border)] text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-5">
                  <i
                    className={`fas ${card.icon} text-2xl text-[var(--color-teal)]`}
                  ></i>
                </div>
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  {card.duration}
                </div>
                <h2 className="font-bold text-lg mb-3">{card.label}</h2>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Couverture</span>
            <h2 className="text-3xl font-extrabold">
              Ce que notre garantie{" "}
              <span className="text-[var(--color-red)]">couvre</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Notre garantie est complete et couvre l&apos;ensemble des travaux
              effectues par notre equipe.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coveredItems.map((item) => (
              <div
                key={item.title}
                className="bg-[var(--color-background)] rounded-xl p-8 border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i
                      className={`fas ${item.icon} text-lg text-[var(--color-red)]`}
                    ></i>
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                </div>
                <ul className="space-y-3">
                  {item.items.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 text-[var(--color-muted)] text-sm"
                    >
                      <i className="fas fa-check text-green-500 mt-0.5 flex-shrink-0"></i>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Processus</span>
            <h2 className="text-3xl font-extrabold text-white">
              Comment faire une{" "}
              <span className="text-[var(--color-red)]">reclamation</span>
            </h2>
            <p className="text-white/60 mt-3 max-w-2xl mx-auto">
              Un processus simple en trois etapes pour faire valoir votre
              garantie.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {claimSteps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {step.num}
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

      {/* Comparison Table */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comparaison</span>
            <h2 className="text-3xl font-extrabold">
              Vosthermos vs{" "}
              <span className="text-[var(--color-red)]">l&apos;industrie</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Notre garantie depasse largement la moyenne de l&apos;industrie
              pour vous offrir une protection maximale.
            </p>
          </div>
          <div className="max-w-[800px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--color-teal-dark)]">
                    <th className="text-left text-white font-bold px-6 py-4 text-sm">
                      Critere
                    </th>
                    <th className="text-center text-white font-bold px-6 py-4 text-sm">
                      <span className="text-[var(--color-red-light)]">
                        Vosthermos
                      </span>
                    </th>
                    <th className="text-center text-white/70 font-bold px-6 py-4 text-sm">
                      Moyenne industrie
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--color-border)]">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-snowflake text-[var(--color-teal)] mr-2 text-xs"></i>
                      Vitres thermos
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">
                        10 ans
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">
                      5-10 ans
                    </td>
                  </tr>
                  <tr className="border-t border-[var(--color-border)] bg-[var(--color-background)]/50">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-tools text-[var(--color-teal)] mr-2 text-xs"></i>
                      Main-d&apos;oeuvre
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">
                        5 ans
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">
                      1-2 ans
                    </td>
                  </tr>
                  <tr className="border-t border-[var(--color-border)]">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-exchange-alt text-[var(--color-teal)] mr-2 text-xs"></i>
                      Transferable
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">
                        Oui
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">
                      Rarement
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">FAQ</span>
            <h2 className="text-3xl font-extrabold">
              Questions{" "}
              <span className="text-[var(--color-red)]">frequentes</span>
            </h2>
          </div>
          <div className="max-w-[800px] mx-auto space-y-6">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)]"
              >
                <h3 className="font-bold text-lg flex items-start gap-3">
                  <i className="fas fa-question-circle text-[var(--color-red)] mt-1 flex-shrink-0"></i>
                  {item.question}
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed mt-3 ml-8">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Protegez votre investissement avec notre garantie
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Obtenez une soumission gratuite et decouvrez comment notre garantie
            de 10 ans vous protege. Service rapide et professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
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
    </>
  );
}
