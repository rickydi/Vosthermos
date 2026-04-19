import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/commercial/remplacement-thermos-bureau`;

export const metadata = {
  title: "Remplacement de thermos dans bâtiments à bureaux | Vosthermos",
  description:
    `Remplacement de vitres thermos pour immeubles de bureaux : interventions hors heures d'affaires, assurance 2M$, garantie 10 ans. Montréal, Laval, Rive-Sud. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "remplacement thermos bureau Montréal, vitre thermos immeuble, thermos édifice bureaux, remplacement vitre commercial",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Remplacement de thermos dans bâtiments à bureaux | Vosthermos",
    description: "Interventions hors heures d'affaires, assurance 2M$, garantie 10 ans.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const FEATURES = [
  { icon: "fa-clock", title: "Horaires flexibles", text: "Soirées, weekends, nuits. Pas d'interruption de vos activités. Supplément clair dès la soumission." },
  { icon: "fa-shield-halved", title: "Assurance 2M$ responsabilité", text: "Couverture adaptée aux bâtiments commerciaux. Dommages aux biens et aux tiers inclus." },
  { icon: "fa-certificate", title: "Thermos certifiés", text: "Energy Star, gaz argon, verre Low-E. Certifications utiles pour bâtiments LEED ou BOMA BEST." },
  { icon: "fa-ban", title: "Protection du mobilier", text: "Bâches antipoussière, aspirateur HEPA, isolation de la zone de travail. Zéro saleté sur les bureaux." },
  { icon: "fa-file-signature", title: "Facturation corporative", text: "Bons de commande acceptés, numéros TPS/TVQ, termes de paiement NET-30 disponibles." },
  { icon: "fa-clipboard-list", title: "Rapport photo complet", text: "Avant/après chaque fenêtre pour votre dossier de gestion. Archive accessible pendant 10 ans." },
];

const STEPS = [
  { num: 1, title: "Inspection sur place", text: "Nos techniciens évaluent chaque thermos. Rapport photo avec recommandations prioritaires remis sous 48h." },
  { num: 2, title: "Soumission détaillée", text: "Prix par fenêtre, options (hors heures, urgence), échéancier, termes de paiement. Transparent, pas de frais cachés." },
  { num: 3, title: "Planification", text: "Choix des dates avec votre gestionnaire immobilier. Communication aux occupants si nécessaire." },
  { num: 4, title: "Installation coordonnée", text: "Équipe dimensionnée selon projet. Livraison des thermos planifiée. Nettoyage complet après chaque zone." },
  { num: 5, title: "Livraison et garantie", text: "Test d'étanchéité final, remise du rapport photo, activation de la garantie 10 ans. Aucun suivi nécessaire de votre part." },
];

const FAQS = [
  {
    q: "Combien coûte un remplacement de thermos dans un bureau ?",
    a: "Fenêtre standard : 350$-550$. Fenêtre de grande dimension (vitrine, coin bureau) : 550$-1200$. Supplément hors heures : 25-40%. Volume : rabais 10-20% dès 15 fenêtres.",
  },
  {
    q: "Pouvez-vous travailler la nuit ou les weekends ?",
    a: "Oui, sur demande. Supplément typique : 25% pour soirées (après 18h), 40% pour nuits (22h-6h) et weekends complets. Notre équipe nocturne est certifiée et couverte par la même assurance.",
  },
  {
    q: "Combien de temps pour un bureau de 10 000 pi² ?",
    a: "Selon le nombre de thermos à remplacer. Exemple : 15-25 thermos = 3-4 jours ouvrables. Nous travaillons en parallèle si l'accès le permet (2-3 équipes simultanées).",
  },
  {
    q: "Acceptez-vous les bons de commande et la facturation NET-30 ?",
    a: "Oui pour entreprises établies. Première collaboration : 50% d'acompte, solde NET-30 après livraison. Clients récurrents : NET-30 complet sur demande.",
  },
  {
    q: "Avez-vous des références commerciales ?",
    a: "Oui, références de gestionnaires immobiliers et syndicats de copropriété fournies sur demande. Nous respectons la confidentialité de nos clients.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Remplacement de thermos dans bâtiments à bureaux",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Remplacement de vitres thermos (unités scellées) pour immeubles à bureaux avec intervention hors heures d'affaires et assurance 2M$.",
  url: PAGE_URL,
  offers: { "@type": "Offer", priceCurrency: "CAD", price: "350", description: "À partir de 350$ par thermos" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
    { "@type": "ListItem", position: 2, name: "Commercial", item: `${BASE}/commercial` },
    { "@type": "ListItem", position: 3, name: "Thermos en bureau", item: PAGE_URL },
  ],
};

export default function ThermosBureauPage() {
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
            <Link href="/commercial" className="hover:text-white">Commercial</Link>
            <span>/</span>
            <span className="text-white">Thermos en bureau</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Remplacement de <span className="text-[var(--color-red)]">thermos</span> en bâtiment de bureaux
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Thermos embué ou cassé dans votre immeuble ? Nous intervenons <strong className="text-white">hors heures d'affaires</strong> pour ne pas perturber votre équipe. Assurance 2M$, garantie 10 ans.
          </p>
          <Link href="/contact?sujet=thermos-bureau" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-calculator"></i> Obtenir une soumission
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Adapté au monde corporatif</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-6">
                <div className="w-12 h-12 bg-[var(--color-red)]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${f.icon} text-xl text-[var(--color-red)]`}></i>
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Notre processus</h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-[var(--color-border)]">
                <div className="w-12 h-12 bg-[var(--color-red)] text-white rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-lg">{s.num}</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Votre immeuble a besoin de thermos ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Inspection gratuite + soumission sous 48h.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=thermos-bureau" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
