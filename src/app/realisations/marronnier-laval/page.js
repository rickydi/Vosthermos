import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/realisations/marronnier-laval`;

export const metadata = {
  title: "Étude de cas : Copropriété de 18 unités à Laval — 14 thermos remplacés en 3 semaines | Vosthermos",
  description:
    "Étude de cas B2B : comment nous avons coordonné le remplacement de 14 thermos embués dans une copropriété de 18 unités à Laval, avec une seule facture et zéro plainte résident.",
  keywords:
    "étude de cas fenêtres copropriété Laval, remplacement thermos condo Laval, projet B2B fenêtres Québec, cas gestionnaire condo",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Étude de cas : 14 thermos remplacés dans une copropriété de 18 unités à Laval | Vosthermos",
    description: "Coordination de 14 thermos en 3 semaines avec une seule facture et zéro plainte résident.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const STATS = [
  { num: "18", label: "Unités au total" },
  { num: "14", label: "Thermos embués" },
  { num: "3 sem", label: "Durée totale" },
  { num: "0", label: "Plainte résident" },
];

const TIMELINE = [
  { week: "Semaine 1", title: "Inspection complète + soumission groupée", text: "Nos techniciens ont inspecté les 18 unités en 2 jours. Rapport avec photos et ventilation par unité remis au gestionnaire 24h après. Soumission groupée avec rabais volume acceptée lors de la réunion hebdomadaire du syndicat." },
  { week: "Semaine 2", title: "Commande des thermos + planification", text: "14 thermos sur mesure commandés chez notre fournisseur (délai fabrication 7 jours ouvrables). En parallèle, nous avons coordonné les plages horaires avec chaque résident via SMS (fenêtre 2h par unité, week-end possible sur demande)." },
  { week: "Semaine 3", title: "Installation en 4 jours ouvrables", text: "Équipe de 3 techniciens a installé les 14 thermos en 4 jours, selon l'horaire préétabli. Aspirateur HEPA passé après chaque intervention, bâches protectrices pour le mobilier des résidents. Rapport photo avant/après archivé par unité." },
];

const CHALLENGES = [
  { title: "Plusieurs occupants absents en journée", solution: "Offre de plages horaires en soirée (18h-20h) et samedi matin. 8 unités sur 14 ont opté pour ces créneaux." },
  { title: "2 unités avec cadres de bois défectueux", solution: "Réparation du cadre incluse sans supplément (détectée lors de l'inspection initiale, incluse dans la soumission de base)." },
  { title: "Syndicat voulait approbation de chaque résident", solution: "Notre portail gestionnaire permet à chaque résident de voir ses travaux planifiés et de commenter en ligne. 100% d'approbation obtenue en 5 jours." },
];

const RESULTS = [
  { title: "14 thermos installés, garantie 10 ans", text: "Tous les thermos sont Energy Star avec gaz argon et verre Low-E. Garantie transférable aux futurs acheteurs." },
  { title: "Facture unique au syndicat", text: "Une seule facture avec ventilation par unité pour la comptabilité du gestionnaire. Simplification significative." },
  { title: "Économie de chauffage mesurable", text: "Les premiers résidents rapportent déjà une réduction de condensation hivernale et un confort amélioré près des fenêtres." },
  { title: "0 plainte, 5 étoiles", text: "Les 14 résidents ont noté le service. Moyenne : 5/5 étoiles. Plusieurs ont demandé des cartes de visite pour leurs proches." },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Étude de cas : 14 thermos remplacés dans une copropriété de 18 unités à Laval",
  description: "Comment Vosthermos a coordonné le remplacement de 14 thermos embués dans une copropriété à Laval avec une seule facture centralisée et zéro plainte résident.",
  author: { "@type": "Organization", name: "Vosthermos", url: BASE },
  publisher: { "@id": `${BASE}/#business` },
  datePublished: "2026-04-19",
  dateModified: "2026-04-19",
  mainEntityOfPage: PAGE_URL,
  image: `${BASE}/images/Vos-Thermos-Logo.png`,
  about: {
    "@type": "Thing",
    name: "Remplacement massif de vitres thermos en copropriété",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
    { "@type": "ListItem", position: 2, name: "Réalisations", item: `${BASE}/realisations` },
    { "@type": "ListItem", position: 3, name: "Copropriété Laval 18 unités", item: PAGE_URL },
  ],
};

export default function MarronnierCaseStudyPage() {
  return (
    <div className="pt-[80px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] py-16">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <Link href="/realisations" className="hover:text-white">Réalisations</Link>
            <span>/</span>
            <span className="text-white">Copropriété Laval</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <i className="fas fa-building"></i> Étude de cas · B2B
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Copropriété de 18 unités à Laval :<br />
            <span className="text-[var(--color-red)]">14 thermos en 3 semaines, zéro plainte</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Comment nous avons coordonné un remplacement massif de thermos dans un immeuble résidentiel à Laval, avec facturation centralisée et satisfaction totale des résidents.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-[var(--color-red)] mb-1">{s.num}</p>
                <p className="text-sm text-[var(--color-muted)] font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="py-16 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-6">Le contexte</h2>
          <div className="prose prose-lg max-w-none text-[var(--color-muted)] leading-relaxed space-y-4">
            <p>
              Un gestionnaire de copropriété nous a contactés pour un problème récurrent : plusieurs résidents signalaient de la condensation persistante sur leurs vitres, avec des plaintes qui s'accumulaient au conseil d'administration.
            </p>
            <p>
              Le syndicat avait déjà fait remplacer quelques thermos au cas par cas par différents entrepreneurs au fil des années, avec des résultats inégaux : prix variables, qualité différente, pas de traçabilité.
            </p>
            <p>
              La demande : <strong className="text-gray-900">évaluer tout le parc, identifier les unités à risque, et planifier un remplacement groupé avec une seule facture au syndicat.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">L'exécution en 3 semaines</h2>
          <div className="space-y-6">
            {TIMELINE.map((t, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block bg-[var(--color-red)] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{t.week}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-white">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10">Défis rencontrés et solutions</h2>
          <div className="space-y-6">
            {CHALLENGES.map((c, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Défi</p>
                  <p className="font-bold text-lg">{c.title}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Solution</p>
                  <p className="text-[var(--color-muted)]">{c.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Résultats obtenus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESULTS.map((r) => (
              <div key={r.title} className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <i className="fas fa-check-circle text-2xl text-green-500"></i>
                  <h3 className="font-bold text-lg">{r.title}</h3>
                </div>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <i className="fas fa-quote-left text-5xl text-white/20 mb-6"></i>
          <blockquote className="text-2xl md:text-3xl font-bold leading-relaxed italic mb-6">
            &ldquo;Vosthermos a pris en charge la communication avec nos 14 résidents. Zéro téléphone pour moi. Leur portail nous a fait gagner des heures.&rdquo;
          </blockquote>
          <p className="text-white/60 text-sm">— Gestionnaire de copropriété, Laval</p>
        </div>
      </section>

      <section className="py-16 bg-white text-center">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Votre copropriété mérite le même service</h2>
          <p className="text-[var(--color-muted)] text-lg mb-8 max-w-2xl mx-auto">
            Inspection gratuite + plan pluriannuel inclus. Zéro engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/copropriete" className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Voir nos services B2B
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
