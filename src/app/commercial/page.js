import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/commercial`;

export const metadata = {
  title: "Réparation de fenêtres pour bâtiments commerciaux | Vosthermos Québec",
  description:
    `Entrepreneur fenêtres pour immeubles commerciaux, bureaux, édifices à logements et ICI : remplacement thermos, diagnostic d'infiltration, interventions rapides. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "entrepreneur fenêtres commercial Québec, remplacement thermos bureau, infiltration eau bâtiment commercial, réparation fenêtres édifice Montréal",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Fenêtres pour bâtiments commerciaux | Vosthermos",
    description: "Remplacement thermos, diagnostic infiltration, interventions rapides pour ICI et commercial.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const SERVICES = [
  { slug: "remplacement-thermos-bureau", title: "Remplacement de thermos en bureau", icon: "fa-building", description: "Interventions hors heures d'affaires pour ne pas perturber votre équipe. Garantie 10 ans." },
  { slug: "infiltration-eau-batiment", title: "Diagnostic et réparation d'infiltrations", icon: "fa-droplet", description: "Expertise en hydrostatique de bâtiment. Rapport détaillé avec photos thermiques disponible." },
];

const SECTORS = [
  { icon: "fa-building-user", name: "Immeubles à bureaux", description: "3 à 20 étages typiquement. Interventions coordonnées avec gestion immobilière." },
  { icon: "fa-store", name: "Commerces de détail", description: "Vitrines, portes d'accès, fenêtres arrière. Minimisation des temps d'arrêt." },
  { icon: "fa-hotel", name: "Hôtels et auberges", description: "Thermos dans les chambres, fenêtres de façade, interventions rapides avant arrivée clients." },
  { icon: "fa-industry", name: "Bâtiments industriels", description: "Fenêtres techniques, vitres de sécurité, calfeutrage industriel." },
  { icon: "fa-school", name: "Écoles et institutions", description: "Travaux pendant les vacances scolaires. Respect strict des normes d'école." },
  { icon: "fa-hospital", name: "Cliniques et bureaux médicaux", description: "Propreté clinique, horaires adaptés, protocoles sanitaires respectés." },
];

const WHY = [
  { title: "Assurance responsabilité civile 2M$", text: "Couverture adaptée aux bâtiments commerciaux incluant dommages aux biens et aux tiers." },
  { title: "RBQ active + CCQ conforme", text: "Licence RBQ valide, cotisations CCQ à jour, CNESST en règle. Dossier accessible sur demande." },
  { title: "Hors heures d'affaires possible", text: "Soirées, weekends, nuits sur demande. Supplément raisonnable pour protéger votre opération." },
  { title: "Fournisseur approuvé Propriétés", text: "Référencé par plusieurs gestionnaires immobiliers majeurs au Québec (sur demande)." },
  { title: "Factures conformes TPS/TVQ", text: "Facturation rigoureuse avec tous les numéros fiscaux. Comptabilité simplifiée." },
  { title: "Garantie 10 ans", text: "Même garantie pour le commercial que pour le résidentiel. Aucune distinction." },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
    { "@type": "ListItem", position: 2, name: "Commercial", item: PAGE_URL },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Réparation de fenêtres pour bâtiments commerciaux",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Services de réparation et remplacement de fenêtres pour immeubles à bureaux, commerces, hôtels, bâtiments industriels, écoles et cliniques au Québec.",
  url: PAGE_URL,
};

export default function CommercialPage() {
  return (
    <div className="pt-[80px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <span className="text-white">Commercial</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <i className="fas fa-briefcase"></i> B2B · Bâtiments commerciaux
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Réparation de fenêtres pour <span className="text-[var(--color-red)]">bâtiments commerciaux</span>
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Immeubles à bureaux, commerces, hôtels, édifices ICI : remplacement de thermos, diagnostic d'infiltration, interventions rapides et hors heures d'affaires. Assurance responsabilité civile 2M$.
          </p>
          <Link href="/contact?sujet=commercial" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-handshake"></i> Demander une soumission
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2">Nos services pour le commercial</h2>
          <p className="text-[var(--color-muted)] mb-10 max-w-2xl">Deux spécialités adaptées aux exigences des bâtiments commerciaux.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/commercial/${s.slug}`} className="bg-white border border-[var(--color-border)] rounded-2xl p-8 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-[var(--color-teal)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-red)] transition-colors">
                  <i className={`fas ${s.icon} text-3xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[var(--color-red)] transition-colors">{s.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed mb-4">{s.description}</p>
                <span className="inline-flex items-center gap-1 text-[var(--color-red)] font-bold">
                  En savoir plus <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2 text-center">Secteurs desservis</h2>
          <p className="text-[var(--color-muted)] mb-10 text-center max-w-2xl mx-auto">Une expertise adaptée à chaque type de bâtiment commercial.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map((s) => (
              <div key={s.name} className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[var(--color-red)]/10 rounded-xl flex items-center justify-center">
                    <i className={`fas ${s.icon} text-xl text-[var(--color-red)]`}></i>
                  </div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                </div>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Pourquoi nous confier votre bâtiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map((w) => (
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

      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Votre bâtiment a des problèmes de fenêtres ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Inspection gratuite, soumission en 48h, garantie 10 ans.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=commercial" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
