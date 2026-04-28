import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/copropriete`;

export const metadata = {
  title: "Entretien de fenêtres pour copropriétés & condos au Québec | Vosthermos",
  description:
    `Partenaire des gestionnaires de copropriétés : plans pluriannuels, remplacement massif de thermos, portail en ligne, facturation centralisée. De 5 à 500 unités. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "fenêtres copropriété, gestionnaire condo fenêtres, remplacement thermos condo, plan pluriannuel fenêtres syndicat, entrepreneur fenêtres copropriété Montréal Laval",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Entretien de fenêtres pour copropriétés & condos | Vosthermos",
    description:
      "Plans pluriannuels, remplacement massif de thermos, portail en ligne pour gestionnaires. De 5 à 500 unités.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const SERVICES = [
  {
    title: "Plan pluriannuel d'entretien",
    slug: "plan-pluriannuel-fenetres",
    description: "Inventaire complet de votre parc de fenêtres + calendrier 5-10 ans + budget prévisionnel. Fin des surprises budgétaires pour le conseil d'administration.",
    icon: "fa-calendar-check",
  },
  {
    title: "Remplacement massif de thermos",
    slug: "remplacement-massif-thermos-condos",
    description: "Rabais volume, logistique coordonnée, installation sans déranger les occupants. Garantie 10 ans transférable aux futurs acheteurs.",
    icon: "fa-layer-group",
  },
  {
    title: "Conformité Loi 25 (données)",
    slug: "conformite-loi-25",
    description: "Gestion sécurisée des données d'inspection et d'intervention. Vos résidents protégés par une infrastructure conforme aux exigences québécoises.",
    icon: "fa-shield-alt",
  },
];

const BENEFITS = [
  { icon: "fa-file-invoice-dollar", title: "Facturation centralisée", text: "Une seule facture pour tout le syndicat, avec ventilation par unité pour votre comptabilité." },
  { icon: "fa-chart-line", title: "Dashboard multi-unités", text: "Tableau de bord unique : historique, interventions en cours, budget consommé, prochaines étapes." },
  { icon: "fa-tablet-alt", title: "Bons de travail numériques", text: "Vos techniciens ont une tablette, les photos avant/après sont archivées automatiquement par unité." },
  { icon: "fa-bell", title: "Signalement propriétaire", text: "Un résident peut signaler un problème via lien unique — vous êtes notifié en temps réel." },
  { icon: "fa-handshake", title: "Garantie transférable", text: "La garantie de 10 ans suit l'unité, un atout pour les futurs acheteurs lors de la revente." },
  { icon: "fa-bolt", title: "Intervention prioritaire", text: "Rappel dans les 4 heures en cas d'urgence (vitre cassée, infiltration). Service 7j/7 disponible." },
];

const FAQS = [
  {
    q: "À partir de combien d'unités intervenez-vous sur une copropriété ?",
    a: "Nous gérons des copropriétés de 5 à 500 unités. Pour les très grands parcs (plus de 100 unités), nous assignons un chef de projet dédié.",
  },
  {
    q: "Comment fonctionne un plan pluriannuel de remplacement ?",
    a: "Nous faisons d'abord un inventaire complet (type, âge, état de chaque fenêtre). Ensuite nous établissons un calendrier 5 à 10 ans avec budget prévisionnel, que le conseil d'administration peut présenter aux copropriétaires lors de l'AGE. Cela évite les cotisations spéciales surprise.",
  },
  {
    q: "Le portail gestionnaire coûte combien ?",
    a: "Il est inclus gratuitement pour tous nos clients sous contrat d'entretien. Pas de frais mensuels cachés, pas de vendor lock-in : vos données restent exportables en tout temps.",
  },
  {
    q: "Qui s'occupe de coordonner avec les occupants ?",
    a: "Nous gérons toute la communication : prise de rendez-vous, rappels, suivis. Vous recevez un rapport hebdomadaire si vous le souhaitez. Zéro appel téléphonique pour vous.",
  },
  {
    q: "Quelles villes couvrez-vous pour les copropriétés ?",
    a: `Montréal, Laval, Longueuil, Brossard, Boucherville, Saint-Hyacinthe, Granby, Terrebonne, Repentigny, Chambly, Saint-Jean-sur-Richelieu, Blainville et environs. Rayon de 100 km autour de Delson. Contactez-nous au ${COMPANY_INFO.phone} pour confirmer votre secteur.`,
  },
  {
    q: "Travaillez-vous avec des logiciels de gestion comme Condo Manager ou Hopem ?",
    a: "Oui. Nous avons une API ouverte et des exports automatiques vers les principales plateformes de gestion immobilière du Québec. Intégrations sur demande.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Entretien et remplacement de fenêtres pour copropriétés",
  provider: {
    "@type": "LocalBusiness",
    "@id": `${BASE}/#business`,
    name: COMPANY_INFO.legalName || "Vosthermos",
    telephone: COMPANY_INFO.phoneTel,
    email: COMPANY_INFO.email,
    url: COMPANY_INFO.url,
  },
  areaServed: { "@type": "State", name: "Quebec" },
  serviceType: "Entretien de fenêtres pour copropriétés",
  description:
    "Partenaire des gestionnaires de copropriétés au Québec pour l'entretien, le remplacement et la planification pluriannuelle de leurs fenêtres.",
  url: PAGE_URL,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services pour copropriétés",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: { "@type": "Service", name: s.title, url: `${BASE}/copropriete/${s.slug}` },
    })),
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
    { "@type": "ListItem", position: 2, name: "Copropriétés", item: PAGE_URL },
  ],
};

export default function CoproprietePage() {
  return (
    <div className="pt-[80px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <span className="text-white">Copropriétés</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <i className="fas fa-building"></i> B2B · Syndicats de copropriété
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Entretien de fenêtres pour <span className="text-[var(--color-red)]">copropriétés et condos</span>
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Partenaire des gestionnaires : plans pluriannuels, remplacement massif de thermos, portail en ligne, facturation centralisée. De <strong className="text-white">5 à 500 unités</strong> — avec un seul interlocuteur.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact?sujet=copropriete" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
              <i className="fas fa-handshake"></i> Demander une soumission
            </Link>
            <Link href="/portail-gestionnaire" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all">
              <i className="fas fa-desktop"></i> Voir le portail gestionnaire
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2">Nos offres pour copropriétés</h2>
          <p className="text-[var(--color-muted)] mb-10 max-w-2xl">Trois offres qui répondent aux défis réels des gestionnaires : budgétiser, agir, rester conforme.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/copropriete/${s.slug}`}
                className="bg-white border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-[var(--color-teal)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-red)] transition-colors">
                  <i className={`fas ${s.icon} text-2xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-red)] transition-colors">{s.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-4">{s.description}</p>
                <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-bold">
                  En savoir plus <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2">Pourquoi les gestionnaires nous choisissent</h2>
          <p className="text-[var(--color-muted)] mb-10 max-w-2xl">Un écosystème pensé pour les copropriétés — pas un bricolage de service résidentiel sur du B2B.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--color-red)]/10 rounded-lg flex items-center justify-center">
                    <i className={`fas ${b.icon} text-[var(--color-red)]`}></i>
                  </div>
                  <h3 className="font-bold text-lg">{b.title}</h3>
                </div>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case study CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-3xl p-10 md:p-14 text-white">
            <span className="inline-block bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">Étude de cas</span>
            <h2 className="text-3xl font-extrabold mb-4">Copropriété de 18 unités à Laval</h2>
            <p className="text-white/80 text-lg max-w-2xl mb-6 leading-relaxed">
              Un gestionnaire de condos à Laval avait 14 thermos embués répartis dans 9 unités différentes. Nous avons coordonné tout le remplacement en 3 semaines, avec une seule facture centralisée et zéro plainte de résident.
            </p>
            <Link href="/realisations/marronnier-laval" className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
              Lire l&apos;étude de cas complète <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2 text-center">Questions fréquentes</h2>
          <p className="text-[var(--color-muted)] mb-10 text-center">Les interrogations les plus courantes des gestionnaires de copropriété.</p>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-5 group">
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

      {/* Final CTA */}
      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Votre syndicat mérite mieux qu&apos;un appel à la fois</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Parlons de votre parc de fenêtres. Soumission gratuite, sans engagement, avec plan pluriannuel inclus.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=copropriete" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
