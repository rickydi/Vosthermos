import Link from "next/link";
import EnergySavingsCalculator from "@/components/EnergySavingsCalculator";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title:
    "Calculateur d'economies d'energie | Remplacement thermos | Vosthermos",
  description:
    "Calculez combien vous pouvez economiser en remplacant vos vitres thermos. Outil gratuit: entrez vos informations et obtenez une estimation des economies annuelles sur votre facture de chauffage.",
  keywords:
    "economie energie fenetre, calculer economies thermos, reduire facture chauffage fenetre, thermos efficacite energetique, subvention Renoclimat",
  alternates: {
    canonical: "https://www.vosthermos.com/calculateur-economies",
  },
  openGraph: {
    title:
      "Calculateur d'economies d'energie | Remplacement thermos | Vosthermos",
    description:
      "Calculez combien vous pouvez economiser en remplacant vos vitres thermos. Estimation gratuite des economies annuelles sur votre facture de chauffage.",
    url: "https://www.vosthermos.com/calculateur-economies",
    siteName: "Vosthermos",
    locale: "fr_CA",
    type: "website",
  },
};

const faqItems = [
  {
    question:
      "Combien puis-je economiser en remplacant mes vitres thermos?",
    answer:
      "Les economies varient selon l'age de vos fenetres, le type de thermos choisi et votre facture de chauffage. En moyenne, le remplacement de thermos embuees ou agees de 20 ans ou plus peut reduire votre facture de chauffage de 10 a 25%. Pour une maison typique au Quebec, cela represente entre 200$ et 800$ d'economies par annee.",
  },
  {
    question:
      "Est-ce que le programme Renoclimat offre des subventions pour le remplacement de thermos?",
    answer:
      "Oui, le programme Renoclimat du gouvernement du Quebec offre des subventions pour l'amelioration de l'efficacite energetique de votre maison, incluant le remplacement de fenetres. Les montants varient selon le type de travaux et l'amelioration obtenue. Nous pouvons vous guider dans le processus de demande de subvention.",
  },
  {
    question: "Quelle est la difference entre un thermos double et triple?",
    answer:
      "Un thermos double est compose de deux vitres separees par une lame d'air ou de gaz argon. Un thermos triple ajoute une troisieme vitre, offrant une isolation superieure. Le triple vitrage avec Low-E et argon peut reduire les pertes de chaleur par les fenetres jusqu'a 50% par rapport a un double vitrage standard, mais coute environ 30% de plus.",
  },
  {
    question:
      "Combien de temps faut-il pour rentabiliser le remplacement de thermos?",
    answer:
      "Le retour sur investissement depend de plusieurs facteurs: le nombre de fenetres, le type de thermos choisi, votre source de chauffage et votre facture actuelle. En general, le remplacement de thermos se rentabilise en 3 a 7 ans grace aux economies d'energie. De plus, il augmente la valeur de revente de votre propriete.",
  },
];

const howItWorksSteps = [
  {
    icon: "fas fa-sliders-h",
    title: "Entrez vos informations",
    description:
      "Indiquez le nombre de fenetres, leur age, votre facture de chauffage et le type de thermos souhaite.",
  },
  {
    icon: "fas fa-calculator",
    title: "Calcul instantane",
    description:
      "Notre algorithme calcule vos economies annuelles, la reduction de CO2 et le retour sur investissement.",
  },
  {
    icon: "fas fa-phone-alt",
    title: "Obtenez une soumission",
    description:
      "Contactez-nous pour une evaluation precise et un prix exact adapte a vos fenetres.",
  },
];

export default function CalculateurEconomiesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Calculateur d'economies d'energie Vosthermos",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description:
      "Calculez combien vous pouvez economiser en remplacant vos vitres thermos. Estimation gratuite des economies annuelles sur votre facture de chauffage.",
    url: "https://www.vosthermos.com/calculateur-economies",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      url: "https://www.vosthermos.com",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-white">Calculateur d&apos;economies</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-bolt mr-1"></i> Outil gratuit
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Calculateur d&apos;economies{" "}
            <span className="text-[var(--color-red)]">d&apos;energie</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Decouvrez combien vous pouvez economiser en remplacant vos vitres
            thermos. Entrez vos informations et obtenez une estimation
            instantanee de vos economies annuelles sur votre facture de
            chauffage.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                25%
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                pertes par les fenetres
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                Incluse
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                garantie
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                Low-E
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                argon disponible
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
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Soumission gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Calculateur</span>
            <h2 className="text-3xl font-extrabold">
              Estimez vos{" "}
              <span className="text-[var(--color-red)]">
                economies d&apos;energie
              </span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Ajustez les parametres ci-dessous pour obtenir une estimation
              personnalisee de vos economies annuelles en remplacant vos vitres
              thermos.
            </p>
          </div>
          <EnergySavingsCalculator />
        </div>
      </section>

      {/* Comment ca fonctionne */}
      <section className="bg-white py-16 border-t border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Methodologie</span>
            <h2 className="text-3xl font-extrabold">
              Comment ca{" "}
              <span className="text-[var(--color-red)]">fonctionne</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Notre calculateur utilise des donnees reconnues sur les pertes de
              chaleur par les fenetres pour estimer vos economies potentielles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-teal)] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-5 mt-2">
                  <i
                    className={`${step.icon} text-xl text-[var(--color-teal)]`}
                  ></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Energy facts */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Le saviez-vous?</span>
            <h2 className="text-3xl font-extrabold text-white">
              L&apos;impact energetique de vos{" "}
              <span className="text-[var(--color-red)]">fenetres</span>
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Les fenetres sont responsables d&apos;une part importante des
              pertes de chaleur dans une maison quebecoise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "fas fa-temperature-low",
                stat: "25-35%",
                label: "des pertes de chaleur passent par les fenetres",
              },
              {
                icon: "fas fa-snowflake",
                stat: "-40 C",
                label:
                  "temperature hivernale au Quebec — l'isolation compte",
              },
              {
                icon: "fas fa-leaf",
                stat: "50%",
                label:
                  "moins de pertes avec un triple Low-E argon vs double standard",
              },
              {
                icon: "fas fa-hand-holding-usd",
                stat: "3-7 ans",
                label:
                  "retour sur investissement moyen pour un remplacement de thermos",
              },
            ].map((item) => (
              <div
                key={item.stat}
                className="bg-white/5 rounded-xl p-6 text-center border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/20 flex items-center justify-center mx-auto mb-4">
                  <i
                    className={`${item.icon} text-lg text-[var(--color-red-light)]`}
                  ></i>
                </div>
                <p className="text-3xl font-black text-white mb-2">
                  {item.stat}
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Questions frequentes</span>
            <h2 className="text-3xl font-extrabold">
              Tout savoir sur les{" "}
              <span className="text-[var(--color-red)]">
                economies d&apos;energie
              </span>
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
            Pret a reduire votre facture de chauffage?
          </h2>
          <p className="text-white/80 mb-8">
            Contactez-nous pour une evaluation gratuite et un prix exact pour le
            remplacement de vos vitres thermos. service garanti incluse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission
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

      {/* Links */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">En savoir plus</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Ressources utiles
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Consultez nos autres outils et articles pour prendre une decision
            eclairee sur le remplacement de vos vitres thermos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/prix"
              className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-foreground)] px-6 py-3 rounded-full font-semibold hover:shadow-md transition-all text-sm"
            >
              <i className="fas fa-tag text-[var(--color-red)]"></i> Grille
              tarifaire
            </Link>
            <Link
              href="/services/remplacement-vitre-thermos"
              className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-foreground)] px-6 py-3 rounded-full font-semibold hover:shadow-md transition-all text-sm"
            >
              <i className="fas fa-snowflake text-[var(--color-teal)]"></i>{" "}
              Remplacement de thermos
            </Link>
            <Link
              href="/blogue"
              className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-foreground)] px-6 py-3 rounded-full font-semibold hover:shadow-md transition-all text-sm"
            >
              <i className="fas fa-newspaper text-[var(--color-muted)]"></i>{" "}
              Articles de blogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
