import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/copropriete/remplacement-massif-thermos-condos`;

export const metadata = {
  title: "Remplacement massif de thermos en copropriété | Vosthermos",
  description:
    `Remplacement groupé de vitres thermos pour condos : rabais volume dès 10 unités, logistique coordonnée, zéro plainte résident. Montréal, Laval, Rive-Sud. Garantie 10 ans transférable ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "remplacement thermos condo, vitres thermos copropriété, rabais volume thermos, remplacement massif fenêtres immeuble, thermos embué condo Montréal Laval",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Remplacement massif de thermos en copropriété | Vosthermos",
    description: "Rabais volume dès 10 unités, logistique coordonnée, garantie 10 ans transférable.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const VOLUME_TIERS = [
  { units: "10-20 unités", discount: "10%", badge: "Volume base" },
  { units: "21-50 unités", discount: "15%", badge: "Volume moyen" },
  { units: "51-100 unités", discount: "20%", badge: "Volume large" },
  { units: "100+ unités", discount: "Sur mesure", badge: "Grand projet" },
];

const PROCESS = [
  { icon: "fa-search", title: "Inspection sans frais", text: "Nos techniciens identifient chaque thermos défectueux (embués, fissurés, joints brisés). Rapport avec photos par unité." },
  { icon: "fa-file-alt", title: "Soumission groupée", text: "Un seul devis pour tout le projet, avec ventilation par unité pour votre comptabilité. Prix ferme, pas de frais cachés." },
  { icon: "fa-calendar", title: "Planification avec résidents", text: "Nous gérons la prise de rendez-vous individuelle. Chaque résident reçoit sa fenêtre d'intervention (2h max par unité, généralement)." },
  { icon: "fa-hammer", title: "Installation coordonnée", text: "Équipe de 2-4 techniciens selon la taille. Livraison des thermos au site la veille. Installation en lot pour minimiser les allers-retours." },
  { icon: "fa-clipboard-check", title: "Contrôle qualité", text: "Vérification de chaque installation : étanchéité, test d'ouverture, photo avant/après. Rapport final remis au gestionnaire." },
];

const WHY_US = [
  { title: "Rabais volume jusqu'à 20%", text: "Plus vous regroupez, plus le prix unitaire baisse. Un vrai avantage financier vs faire remplacer au cas par cas." },
  { title: "Zéro plainte résident", text: "Notre expérience B2B nous a appris à communiquer proactivement. Rappels SMS, créneaux respectés, équipement protégé (bâches, aspirateur passé après)." },
  { title: "Garantie transférable 10 ans", text: "La garantie suit l'unité, pas le propriétaire actuel. Atout pour la revente des condos." },
  { title: "Thermos de qualité Energy Star", text: "Gaz argon + verre Low-E certifié. Économies de chauffage mesurables dès la première année." },
  { title: "Facturation centralisée", text: "Une seule facture au syndicat avec détail par unité. Simplifie votre comptabilité et fiscalité." },
  { title: "Travaux hors saison possible", text: "Préférence pour printemps/automne. Peut être fait l'hiver avec protection (tente chauffante) si urgent." },
];

const FAQS = [
  {
    q: "Combien coûte un remplacement massif ?",
    a: "Prix de base : 350$ à 550$ par thermos selon taille. Avec rabais volume à partir de 10 unités : réduction de 10-20% sur le total. Exemple concret : 30 thermos à remplacer = environ 10 000$ à 13 000$ avec rabais volume appliqué.",
  },
  {
    q: "Peut-on faire financer le projet ?",
    a: "Oui. Nous acceptons les paiements échelonnés (30/30/40 par exemple). Nous travaillons aussi avec des programmes de financement verts pour bâtiments Energy Star (ex: Chauffage au Québec).",
  },
  {
    q: "Combien de temps pour 20-30 thermos ?",
    a: "Environ 3 semaines en total, incluant inspection, commande des thermos (délai fabriquant 5-10 jours ouvrables), et installation (2-4 jours selon nombre d'unités).",
  },
  {
    q: "Que se passe-t-il si un thermos casse après installation ?",
    a: "Garantie 10 ans complète incluant main-d'œuvre. On se déplace gratuitement et on remplace. Aucuns frais pour le syndicat ou le résident.",
  },
  {
    q: "Est-ce possible de phaser sur 2 ans ?",
    a: "Absolument. Nous pouvons diviser le projet en 2 ou 3 phases alignées avec votre budget annuel. Le rabais volume est maintenu si le total du projet est confirmé dès le départ.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Remplacement massif de vitres thermos en copropriété",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Remplacement groupé de vitres thermos pour syndicats de copropriété avec rabais volume dès 10 unités.",
  url: PAGE_URL,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "CAD",
    lowPrice: "280",
    highPrice: "550",
    offerCount: "4",
    description: "Prix par thermos avec rabais volume",
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
    { "@type": "ListItem", position: 3, name: "Remplacement massif", item: PAGE_URL },
  ],
};

export default function RemplacementMassifPage() {
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
            <span className="text-white">Remplacement massif</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Remplacement massif de <span className="text-[var(--color-red)]">thermos en copropriété</span>
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Dès 10 unités : <strong className="text-white">rabais volume jusqu'à 20%</strong>, logistique coordonnée, zéro plainte résident. Garantie 10 ans transférable aux futurs acheteurs.
          </p>
          <Link href="/contact?sujet=remplacement-massif" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-calculator"></i> Obtenir un devis groupé
          </Link>
        </div>
      </section>

      {/* Volume pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2 text-center">Barème rabais volume</h2>
          <p className="text-[var(--color-muted)] mb-10 text-center max-w-2xl mx-auto">Plus vous regroupez, plus le prix baisse. Transparent, sans négociation sans fin.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {VOLUME_TIERS.map((t) => (
              <div key={t.units} className="bg-gradient-to-br from-gray-50 to-white border-2 border-[var(--color-border)] rounded-2xl p-6 text-center hover:border-[var(--color-red)] transition-colors">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--color-teal)] mb-2">{t.badge}</span>
                <p className="text-lg font-bold mb-3">{t.units}</p>
                <p className="text-5xl font-extrabold text-[var(--color-red)] mb-1">{t.discount}</p>
                <p className="text-sm text-[var(--color-muted)]">de rabais</p>
              </div>
            ))}
          </div>
          <p className="text-[var(--color-muted)] text-sm mt-6 text-center italic">Prix de base : 350$-550$ par thermos selon taille. Le rabais s'applique sur le total.</p>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Notre processus en 5 étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map((p, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                <div className="w-12 h-12 bg-[var(--color-red)]/10 rounded-xl flex items-center justify-center mb-3">
                  <i className={`fas ${p.icon} text-[var(--color-red)]`}></i>
                </div>
                <p className="text-xs font-bold text-[var(--color-teal)] mb-1">ÉTAPE {i + 1}</p>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Pourquoi choisir Vosthermos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((w) => (
              <div key={w.title} className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <i className="fas fa-check-circle text-[var(--color-red)]"></i>
                  {w.title}
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Questions fréquentes</h2>
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

      {/* CTA */}
      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Votre copropriété a besoin de thermos ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Inspection gratuite + devis groupé en 48h. Rabais volume à partir de 10 unités.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=remplacement-massif" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
