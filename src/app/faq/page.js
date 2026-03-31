import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata = {
  title: "Foire aux questions - Vosthermos | Reparation portes et fenetres",
  description:
    "Trouvez les reponses a vos questions sur nos services de reparation de portes et fenetres, nos tarifs, garanties, delais et notre boutique en ligne. Soumission gratuite 514-825-8411.",
  alternates: { canonical: "https://www.vosthermos.com/faq" },
  openGraph: {
    title: "FAQ - Vosthermos | Reparation portes et fenetres",
    description:
      "Reponses a toutes vos questions sur la reparation de portes et fenetres, les tarifs, garanties et notre boutique en ligne.",
    url: "https://www.vosthermos.com/faq",
    type: "website",
  },
};

const faqCategories = [
  {
    id: "services",
    title: "Services",
    icon: "fa-wrench",
    items: [
      {
        question: "Quels services offrez-vous?",
        answer:
          "Vosthermos offre une gamme complete de services pour vos portes et fenetres : remplacement de vitres thermos, reparation et restauration de portes en bois, fabrication de moustiquaires sur mesure, remplacement de quincaillerie (poignees, serrures, rouleaux, etc.) et desembuage. Nous desservons la grande region de Montreal dans un rayon de 100km autour de Saint-Francois-Xavier. Toutes nos interventions sont realisees par des techniciens experimentes avec plus de 15 ans d'expertise.",
      },
      {
        question:
          "Quelle est la difference entre desembuage et remplacement de thermos?",
        answer:
          "Le desembuage consiste a retirer l'humidite piegee entre les deux vitres d'un thermos sans remplacer l'unite scellee. C'est une solution temporaire et moins couteuse, mais qui ne restaure pas completement les proprietes isolantes du verre. Le remplacement de thermos, en revanche, implique l'installation d'une unite scellee neuve qui offre une isolation thermique optimale et est couvert par notre service professionnel garanti. Nous recommandons generalement le remplacement pour un resultat durable et une meilleure efficacite energetique.",
      },
      {
        question: "Reparez-vous tous les types de fenetres?",
        answer:
          "Oui, notre equipe intervient sur tous les types de fenetres : coulissantes, a battant, a auvent, fixes, a guillotine et fenetres de sous-sol. Nous travaillons avec tous les materiaux courants, incluant le PVC, l'aluminium, le bois et les fenetres hybrides. Que ce soit pour un remplacement de vitre thermos, un changement de quincaillerie ou une reparation de cadre, nous avons l'expertise et les pieces necessaires pour redonner vie a vos fenetres.",
      },
      {
        question: "Offrez-vous un service pour les portes commerciales?",
        answer:
          "Oui, nous offrons des services de reparation et de remplacement de pieces pour les portes et fenetres commerciales. Cela inclut les portes d'entree commerciales, les systemes de fermeture (ferme-portes), la quincaillerie specialisee et le remplacement de vitres thermos de grande dimension. Nous comprenons l'importance de minimiser les interruptions pour votre entreprise et nous planifions nos interventions en consequence. Contactez-nous au 514-825-8411 pour discuter de vos besoins specifiques.",
      },
      {
        question:
          "Fabriquez-vous des moustiquaires sur mesure pour toutes les dimensions?",
        answer:
          "Absolument! Nous fabriquons des moustiquaires sur mesure pour toutes les dimensions, qu'il s'agisse de fenetres standard ou de formats non conventionnels. Nous offrons plusieurs types de moustiquaires : fixes, coulissantes, a enroulement et pour portes-patio. Le materiau (fibre de verre, aluminium, pet screen resistant aux animaux) est adapte a vos besoins. Vous pouvez aussi acheter le materiel necessaire dans notre boutique en ligne pour les installer vous-meme.",
      },
      {
        question:
          "Pouvez-vous remplacer la quincaillerie de n'importe quel fabricant?",
        answer:
          "Nous travaillons avec une vaste banque de pieces compatibles couvrant la plupart des fabricants de portes et fenetres presents au Quebec. Notre boutique en ligne compte plus de 740 pieces de remplacement, incluant poignees, serrures, rouleaux, mecanismes de fermeture, pentures et plus. Si une piece specifique n'est pas en stock, nous pouvons generalement la commander. Envoyez-nous une photo de votre piece actuelle et nous identifierons rapidement la bonne piece de remplacement.",
      },
    ],
  },
  {
    id: "tarifs",
    title: "Tarifs et soumissions",
    icon: "fa-dollar-sign",
    items: [
      {
        question: "Combien coute un remplacement de vitre thermos?",
        answer:
          "Le prix d'un remplacement de vitre thermos commence a partir de 150$ et varie selon plusieurs facteurs : les dimensions de la vitre, le type de verre (double, triple, Low-E, argon), l'accessibilite de la fenetre et la complexite de l'installation. Nous offrons toujours une soumission detaillee et gratuite avant de proceder aux travaux, pour que vous sachiez exactement a quoi vous attendre. Appelez-nous au 514-825-8411 pour obtenir votre estimation personnalisee.",
      },
      {
        question: "Les soumissions sont-elles gratuites?",
        answer:
          "Oui, toutes nos soumissions sont entierement gratuites et sans aucun engagement de votre part. Nous pouvons evaluer vos besoins par telephone, par courriel (avec photos) ou lors d'une visite a domicile selon la complexite du projet. Notre objectif est de vous fournir une estimation claire et transparente, sans frais caches ni surprises. Contactez-nous au 514-825-8411 ou via notre formulaire en ligne pour obtenir votre soumission rapidement.",
      },
      {
        question: "Offrez-vous du financement?",
        answer:
          "Pour le moment, nous n'offrons pas de programme de financement formel. Cependant, nous acceptons les paiements par carte de credit, carte de debit, virement Interac et comptant. Pour les projets de plus grande envergure, nous pouvons discuter d'arrangements de paiement flexibles au cas par cas. N'hesitez pas a en parler avec nous lors de votre soumission pour trouver une solution adaptee a votre budget.",
      },
      {
        question: "Y a-t-il des frais de deplacement?",
        answer:
          "Nous desservons la grande region de Montreal et un rayon de 100km autour de Saint-Francois-Xavier sans frais de deplacement supplementaires pour la plupart des interventions. Pour les deplacements au-dela de cette zone, des frais peuvent s'appliquer et seront communiques a l'avance lors de la soumission. Nos services couvrent Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny et les municipalites environnantes.",
      },
    ],
  },
  {
    id: "garantie",
    title: "Garantie",
    icon: "fa-shield-alt",
    items: [
      {
        question: "Quelle est la duree de votre garantie?",
        answer:
          "Nous offrons une service professionnel garanti sur tous nos remplacements de vitres thermos, couvrant les defauts de fabrication et la perte d'etancheite de l'unite scellee. Pour les autres services comme le remplacement de quincaillerie et la fabrication de moustiquaires, la garantie varie selon le type de piece et de travail effectue. Les details specifiques de la garantie sont toujours inclus dans votre soumission ecrite avant le debut des travaux.",
      },
      {
        question: "La garantie est-elle transferable?",
        answer:
          "Oui, notre garantie sur les vitres thermos est transferable au nouveau proprietaire en cas de vente de votre propriete. C'est un avantage qui ajoute de la valeur a votre maison. Le nouveau proprietaire n'a qu'a nous contacter avec le numero de facture original pour beneficier de la couverture restante. Cette politique demontre notre confiance dans la qualite de nos produits et de notre travail.",
      },
      {
        question: "Que couvre exactement la garantie?",
        answer:
          "Notre service professionnel garanti sur les thermos couvre specifiquement : la condensation entre les vitres (perte du scellant), les defauts de fabrication du verre et les bris du a un vice de materiau. Elle ne couvre pas les bris accidentels, les dommages causes par des tiers, l'usure normale des composantes mecaniques ou les dommages lies a une mauvaise utilisation. Pour la quincaillerie, la garantie couvre les defauts de fabrication selon les termes du fabricant de la piece.",
      },
      {
        question: "Comment faire une reclamation de garantie?",
        answer:
          "Pour faire une reclamation de garantie, appelez-nous au 514-825-8411 ou envoyez un courriel a info@vosthermos.com en incluant votre numero de facture, des photos du probleme et une description de la situation. Notre equipe evaluera votre demande rapidement, generalement dans les 48 heures ouvrables. Si la reclamation est approuvee, nous planifions l'intervention de remplacement sans frais additionnel. Conservez toujours votre facture originale comme preuve d'achat.",
      },
    ],
  },
  {
    id: "processus",
    title: "Processus et delais",
    icon: "fa-clock",
    items: [
      {
        question: "Quel est le delai d'intervention?",
        answer:
          "Pour les reparations urgentes (vitre cassee, porte qui ne ferme plus), nous faisons notre possible pour intervenir dans les 24 a 48 heures. Pour les remplacements de vitres thermos, le delai typique est de 1 a 3 semaines, car l'unite scellee doit etre fabriquee sur mesure. Le remplacement de quincaillerie et la reparation de moustiquaires peuvent souvent etre realises dans la semaine suivant votre demande. Contactez-nous au 514-825-8411 pour connaitre nos disponibilites actuelles.",
      },
      {
        question: "Combien de temps dure une intervention typique?",
        answer:
          "La duree depend du type d'intervention. Un remplacement de vitre thermos prend generalement entre 30 et 60 minutes par fenetre. Le remplacement de quincaillerie (poignee, serrure, rouleau) est habituellement complete en 15 a 45 minutes. La fabrication et l'installation d'une moustiquaire sur mesure prend environ 30 minutes. Pour les projets plus complexes comme la reparation d'une porte en bois, prevoyez quelques heures. Nous vous donnerons toujours une estimation de la duree au moment de la prise de rendez-vous.",
      },
      {
        question: "Dois-je etre present lors de l'intervention?",
        answer:
          "Oui, nous demandons qu'un adulte soit present au moment de l'intervention pour nous donner acces aux fenetres ou portes a reparer, confirmer les travaux a effectuer et inspecter le resultat final avant de signer. Si vous ne pouvez pas etre present, vous pouvez autoriser une autre personne de confiance a nous recevoir. Nous communiquerons avec vous avant notre arrivee pour confirmer l'heure exacte de notre passage.",
      },
    ],
  },
  {
    id: "boutique",
    title: "Boutique en ligne",
    icon: "fa-shopping-cart",
    items: [
      {
        question: "Peut-on acheter des pieces en ligne?",
        answer:
          "Oui! Notre boutique en ligne offre plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires. Vous y trouverez de la quincaillerie (poignees, serrures, rouleaux, mecanismes), des materiaux pour moustiquaires, des accessoires et plus encore. Le paiement est securise et la livraison est disponible partout au Quebec. Vous pouvez aussi choisir la cueillette sur place a notre atelier de Saint-Francois-Xavier.",
      },
      {
        question: "Comment savoir quelle piece j'ai besoin?",
        answer:
          "Nous savons que trouver la bonne piece peut etre difficile! Prenez quelques photos de votre piece actuelle (de face, de cote et avec une mesure pour l'echelle) et envoyez-les nous par courriel a info@vosthermos.com ou via notre formulaire de contact. Nos conseillers experts identifieront la piece compatible et vous orienteront vers le bon produit dans notre boutique. Vous pouvez aussi nous appeler au 514-825-8411 pour une assistance immediate.",
      },
      {
        question: "Quels sont les delais de livraison?",
        answer:
          "Les commandes en stock sont generalement expediees dans les 1 a 3 jours ouvrables. La livraison standard au Quebec prend de 3 a 7 jours ouvrables selon votre region. Pour les pieces sur commande speciale, le delai peut etre de 1 a 3 semaines. La cueillette sur place a Saint-Francois-Xavier est disponible et gratuite, generalement le jour meme ou le lendemain de la commande. Vous recevrez un numero de suivi par courriel des l'expedition de votre colis.",
      },
      {
        question: "Acceptez-vous les retours?",
        answer:
          "Oui, nous acceptons les retours dans les 30 jours suivant la reception, a condition que la piece soit dans son emballage d'origine, non installee et en parfait etat. Les pieces coupees ou fabriquees sur mesure (moustiquaires, vitres thermos) ne sont pas retournables. Pour initier un retour, contactez-nous par courriel ou par telephone avec votre numero de commande. Le remboursement sera effectue dans les 5 a 10 jours ouvrables suivant la reception de la piece retournee.",
      },
    ],
  },
];

/* Flatten all Q&A for JSON-LD schema */
const allFaqItems = faqCategories.flatMap((cat) => cat.items);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const speakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Foire aux questions — Vosthermos",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".faq-question", ".faq-answer"],
  },
  url: "https://www.vosthermos.com/faq",
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-white">FAQ</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Foire aux <span className="text-[var(--color-red)]">questions</span>
          </h1>
          <p className="text-white/60 text-lg mt-4 max-w-2xl">
            Trouvez rapidement les reponses a vos questions les plus frequentes
            sur nos services, tarifs, garanties et notre boutique en ligne.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      {faqCategories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="bg-[var(--color-background)] border-b border-[var(--color-border)]"
        >
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center">
                <i
                  className={`fas ${category.icon} text-[var(--color-red)] text-sm`}
                ></i>
              </div>
              <h2 className="text-2xl font-extrabold">{category.title}</h2>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border)] px-6 md:px-8">
              <FaqAccordion items={category.items} />
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Vous n&apos;avez pas trouve votre reponse?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Notre equipe est disponible pour repondre a toutes vos questions.
            Contactez-nous par telephone ou via notre formulaire en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-envelope"></i> Nous ecrire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
