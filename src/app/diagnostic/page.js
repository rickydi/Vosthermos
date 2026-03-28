import Link from "next/link";
import DiagnosticTool from "@/components/DiagnosticTool";

export const metadata = {
  title:
    "Diagnostic gratuit - Est-ce que votre thermos est fini? | Vosthermos",
  description:
    "Outil de diagnostic gratuit pour evaluer l'etat de vos vitres thermos. Repondez a 6 questions et obtenez un diagnostic instantane avec estimation de prix. Service Montreal et Rive-Sud.",
  keywords:
    "diagnostic thermos, fenetre embuee que faire, comment savoir si thermos est fini, thermos fenetre brise, test thermos fenetre",
  alternates: {
    canonical: "https://www.vosthermos.com/diagnostic",
  },
  openGraph: {
    title:
      "Diagnostic gratuit - Est-ce que votre thermos est fini? | Vosthermos",
    description:
      "Repondez a 6 questions et obtenez un diagnostic instantane avec estimation de prix pour vos vitres thermos.",
    url: "https://www.vosthermos.com/diagnostic",
    siteName: "Vosthermos",
    locale: "fr_CA",
    type: "website",
  },
};

const howToSteps = [
  {
    icon: "fas fa-mouse-pointer",
    title: "Repondez aux 6 questions",
    description:
      "Des questions simples sur l'etat de vos fenetres : buee, age, courants d'air, depots et fonctionnement.",
  },
  {
    icon: "fas fa-chart-bar",
    title: "Obtenez votre diagnostic",
    description:
      "Notre algorithme analyse vos reponses et determine le niveau d'usure de vos thermos avec un score precis.",
  },
  {
    icon: "fas fa-file-invoice-dollar",
    title: "Recevez une estimation",
    description:
      "Estimation de prix, economies d'energie potentielles et recommandations personnalisees pour vos fenetres.",
  },
];

const faqItems = [
  {
    question: "Comment savoir si mon thermos de fenetre est fini?",
    answer:
      "Les signes principaux sont : buee permanente entre les deux vitres, depots blanchatres, courants d'air malgre la fenetre fermee, et une augmentation notable de votre facture de chauffage. Notre outil de diagnostic gratuit vous aide a evaluer l'etat de vos thermos en 2 minutes.",
  },
  {
    question: "Le diagnostic en ligne est-il fiable?",
    answer:
      "Notre diagnostic en ligne est base sur les memes criteres que ceux utilises par nos techniciens lors d'une inspection a domicile. Il donne une excellente indication de l'etat de vos thermos. Pour une evaluation definitive, nous recommandons une inspection gratuite a domicile.",
  },
  {
    question:
      "Combien coute le remplacement d'un thermos apres le diagnostic?",
    answer:
      "Le prix du remplacement d'une vitre thermos commence a 150$ par unite installee, incluant la prise de mesures, la fabrication sur mesure et l'installation professionnelle. Le cout varie selon la dimension et le type de verre. Notre diagnostic vous donne une estimation personnalisee.",
  },
  {
    question: "Puis-je reparer un thermos embue au lieu de le remplacer?",
    answer:
      "Le desembuage est une option temporaire a partir de 120$ par unite, mais il ne restaure pas l'efficacite energetique du thermos. Dans la plupart des cas, le remplacement est la solution la plus economique a long terme, surtout si vos fenetres ont plus de 15 ans.",
  },
];

export default function DiagnosticPage() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Comment diagnostiquer une vitre thermos defaillante",
    description:
      "Outil de diagnostic en 6 etapes pour evaluer l'etat de vos vitres thermos et determiner si un remplacement est necessaire.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        name: "Verifier la buee",
        text: "Observez si de la buee est visible entre les deux vitres de votre fenetre thermos.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Evaluer l'age des fenetres",
        text: "Determinez l'age approximatif de vos fenetres pour evaluer leur esperance de vie restante.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Tester les courants d'air",
        text: "Verifiez si vous ressentez un courant d'air froid pres de la fenetre fermee.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Chercher les depots",
        text: "Observez si des depots blanchatres ou des taches sont visibles entre les vitres.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Tester le mecanisme",
        text: "Verifiez si la fenetre s'ouvre et se ferme facilement sans forcer.",
        position: 5,
      },
      {
        "@type": "HowToStep",
        name: "Compter les fenetres affectees",
        text: "Comptez le nombre de fenetres qui presentent ces symptomes pour obtenir une estimation globale.",
        position: 6,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const interactionJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Diagnostic thermos gratuit - Vosthermos",
    description:
      "Outil interactif de diagnostic pour evaluer l'etat de vos vitres thermos en 6 questions.",
    url: "https://www.vosthermos.com/diagnostic",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(interactionJsonLd),
        }}
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
            <span className="text-white">Diagnostic</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-stethoscope mr-1"></i> Outil gratuit
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Est-ce que votre thermos est{" "}
            <span className="text-[var(--color-red)]">fini</span>?
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Repondez a 6 questions simples et obtenez un diagnostic instantane
            de l&apos;etat de vos vitres thermos. Estimation de prix et
            recommandations personnalisees incluses.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                2 min
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                a completer
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                100%
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                gratuit
              </span>
            </div>
            <div className="text-center">
              <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">
                Instantane
              </strong>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">
                resultats
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#diagnostic-tool"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-play-circle"></i> Commencer le diagnostic
            </a>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Diagnostic Tool */}
      <section
        id="diagnostic-tool"
        className="bg-[var(--color-background)] py-20"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Diagnostic en ligne</span>
            <h2 className="text-3xl font-extrabold">
              Evaluez l&apos;etat de vos{" "}
              <span className="text-[var(--color-red)]">thermos</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Cliquez sur la reponse qui correspond le mieux a votre situation.
              Le diagnostic est instantane et gratuit.
            </p>
          </div>

          <DiagnosticTool />
        </div>
      </section>

      {/* Comment fonctionne le diagnostic */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comment ca marche</span>
            <h2 className="text-3xl font-extrabold text-white">
              Un diagnostic{" "}
              <span className="text-[var(--color-red)]">
                simple et rapide
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howToSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {i + 1}
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

      {/* FAQ */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Questions frequentes</span>
            <h2 className="text-3xl font-extrabold">
              Tout savoir sur le{" "}
              <span className="text-[var(--color-red)]">
                diagnostic thermos
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
            Besoin d&apos;une inspection a domicile?
          </h2>
          <p className="text-white/80 mb-8">
            Notre diagnostic en ligne est un excellent point de depart. Pour une
            evaluation complete et une soumission precise, nos techniciens se
            deplacent gratuitement.
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

      {/* Links */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">En savoir plus</span>
          <h2 className="text-2xl font-extrabold mb-8">
            Explorez nos{" "}
            <span className="text-[var(--color-red)]">ressources</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Link
              href="/prix"
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 mx-auto group-hover:bg-[var(--color-red)] transition-colors">
                <i className="fas fa-tag text-xl text-[var(--color-teal)] group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Nos prix</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                Consultez notre grille tarifaire 2026 complete.
              </p>
              <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold">
                Voir les prix{" "}
                <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>

            <Link
              href="/services/remplacement-vitre-thermos"
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 mx-auto group-hover:bg-[var(--color-red)] transition-colors">
                <i className="fas fa-snowflake text-xl text-[var(--color-teal)] group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Remplacement thermos</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                Tout savoir sur le remplacement de vitre thermos.
              </p>
              <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold">
                En savoir plus{" "}
                <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>

            <Link
              href="/boutique"
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 mx-auto group-hover:bg-[var(--color-red)] transition-colors">
                <i className="fas fa-shopping-cart text-xl text-[var(--color-teal)] group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Boutique en ligne</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                Plus de 740 pieces de remplacement disponibles.
              </p>
              <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold">
                Voir la boutique{" "}
                <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
