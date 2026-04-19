import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/copropriete/plan-pluriannuel-fenetres`;

export const metadata = {
  title: "Plan pluriannuel d'entretien de fenêtres pour copropriétés | Vosthermos",
  description:
    `Inventaire complet + calendrier 5-10 ans + budget prévisionnel. Fini les cotisations spéciales surprises. Pour syndicats de copropriété au Québec. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "plan pluriannuel fenêtres copropriété, budget fenêtres syndicat, calendrier remplacement thermos condo, inventaire fenêtres immeuble",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Plan pluriannuel d'entretien de fenêtres | Vosthermos",
    description: "Inventaire complet + calendrier 5-10 ans + budget prévisionnel pour syndicats de copropriété.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const STEPS = [
  { num: 1, title: "Inventaire complet du parc", text: "Nos techniciens documentent chaque fenêtre : type, fabricant, année d'installation, état de la quincaillerie, de la vitre thermos, du coupe-froid. Rapport photo inclus." },
  { num: 2, title: "Diagnostic et priorisation", text: "Classement par urgence : interventions critiques (6 mois), importantes (1-2 ans), préventives (3-10 ans). Chaque unité reçoit un code couleur selon l'état." },
  { num: 3, title: "Calendrier pluriannuel", text: "Nous bâtissons un calendrier 5 à 10 ans avec répartition par phase. Travaux planifiés hors saison (printemps/automne) pour minimiser l'impact." },
  { num: 4, title: "Budget prévisionnel chiffré", text: "Coût total réparti par année et par unité, avec marges d'inflation. Document prêt à présenter à l'AGE des copropriétaires, au comptable ou à votre banque." },
  { num: 5, title: "Révision annuelle", text: "Le plan est vivant : nous le mettons à jour chaque année avec les interventions réelles, les nouveaux besoins, les économies réalisées." },
];

const BENEFITS = [
  { icon: "fa-eye-slash", title: "Zéro surprise budgétaire", text: "Le conseil sait exactement quoi budgéter chaque année. Fin des cotisations spéciales paniques." },
  { icon: "fa-file-contract", title: "Conforme exigences AGE", text: "Document professionnel à présenter lors de l'assemblée générale annuelle. Copropriétaires rassurés." },
  { icon: "fa-coins", title: "Économies planifiées", text: "Grouper les travaux par lots permet de négocier les rabais volume et réduire les coûts de mobilisation." },
  { icon: "fa-balance-scale", title: "Conformité Loi 16 (2019)", text: "Respecte les exigences d'études sur l'état du bâtiment et les fonds de prévoyance imposés par la loi." },
  { icon: "fa-refresh", title: "Transférable à vos successeurs", text: "Si vous changez de gestionnaire, le plan reste la propriété du syndicat. Aucun vendor lock-in." },
  { icon: "fa-clock", title: "Horizon 5 à 10 ans", text: "Vue d'ensemble sur une décennie. Aligne les travaux avec le fonds de prévoyance obligatoire." },
];

const FAQS = [
  {
    q: "Combien coûte un plan pluriannuel ?",
    a: "Inclus gratuitement pour nos clients sous contrat d'entretien. Pour les syndicats qui veulent seulement le plan sans engagement, nous facturons entre 500$ et 2500$ selon la taille (de 5 à 500 unités). Coût amorti sur les économies de la première année.",
  },
  {
    q: "Combien de temps prend l'inventaire initial ?",
    a: "Pour 10-20 unités : 1 à 2 jours. Pour 50-100 unités : 3 à 5 jours. Pour 200+ unités : 1 à 2 semaines. Nos techniciens travaillent en parallèle pour accélérer.",
  },
  {
    q: "Est-ce obligatoire par la loi ?",
    a: "La Loi 16 (adoptée en 2019) impose aux syndicats de copropriété d'avoir une étude du fonds de prévoyance couvrant 25 ans de travaux majeurs. Notre plan pluriannuel fenêtres est le volet « fenêtres » de cette étude globale.",
  },
  {
    q: "Puis-je faire exécuter les travaux par un autre entrepreneur ?",
    a: "Oui. Le plan est votre propriété. Nous espérons gagner vos travaux par la qualité de notre service, pas en vous liant contractuellement. Vous pouvez même donner le plan à d'autres entrepreneurs pour obtenir des soumissions comparatives.",
  },
  {
    q: "À quelle fréquence faut-il mettre à jour le plan ?",
    a: "Annuellement après chaque vague d'interventions. Et tous les 3-5 ans, un réinventaire complet est recommandé (nouvelles pannes, vieillissement, nouveaux matériaux disponibles).",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Plan pluriannuel d'entretien de fenêtres pour copropriétés",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Inventaire complet, calendrier 5-10 ans et budget prévisionnel des travaux de fenêtres pour syndicats de copropriété au Québec.",
  url: PAGE_URL,
  offers: {
    "@type": "Offer",
    priceCurrency: "CAD",
    price: "500",
    description: "À partir de 500$ — inclus gratuitement avec contrat d'entretien",
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
    { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
    { "@type": "ListItem", position: 2, name: "Copropriétés", item: `${BASE}/copropriete` },
    { "@type": "ListItem", position: 3, name: "Plan pluriannuel", item: PAGE_URL },
  ],
};

export default function PlanPluriannuelPage() {
  return (
    <div className="pt-[80px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <Link href="/copropriete" className="hover:text-white">Copropriétés</Link>
            <span>/</span>
            <span className="text-white">Plan pluriannuel</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <i className="fas fa-calendar-check"></i> Offre phare B2B
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Plan pluriannuel d'entretien <span className="text-[var(--color-red)]">de fenêtres</span>
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Inventaire complet + calendrier 5 à 10 ans + budget prévisionnel chiffré. <strong className="text-white">Fini les cotisations spéciales paniques.</strong> Le conseil d'administration a enfin une vision claire.
          </p>
          <Link href="/contact?sujet=plan-pluriannuel" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-handshake"></i> Demander votre plan
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2 text-center">Comment ça fonctionne</h2>
          <p className="text-[var(--color-muted)] mb-12 text-center max-w-2xl mx-auto">5 étapes pour passer du chaos budgétaire à un calendrier clair et maîtrisé.</p>
          <div className="space-y-6">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 items-start bg-gray-50 rounded-2xl p-6 border border-[var(--color-border)]">
                <div className="w-14 h-14 bg-[var(--color-red)] text-white rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-xl">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Pourquoi c'est un game-changer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <div className="w-12 h-12 bg-[var(--color-teal)]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${b.icon} text-xl text-[var(--color-teal)]`}></i>
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details key={i} className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-5 group">
                <summary className="cursor-pointer font-bold text-lg flex items-center justify-between list-none">
                  <span>{f.q}</span>
                  <i className="fas fa-plus text-[var(--color-red)] group-open:rotate-45 transition-transform"></i>
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Prêt à voir clair sur 10 ans ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Nous nous déplaçons gratuitement pour évaluer votre parc et discuter du plan. Zéro engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=plan-pluriannuel" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
