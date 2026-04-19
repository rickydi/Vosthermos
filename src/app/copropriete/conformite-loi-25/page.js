import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/copropriete/conformite-loi-25`;

export const metadata = {
  title: "Conformité Loi 25 pour gestion de données de fenêtres en copropriété | Vosthermos",
  description:
    `Entrepreneur fenêtres conforme à la Loi 25 du Québec : hébergement au Canada, chiffrement SSL, politiques de conservation, droit d'accès et d'effacement. Pour gestionnaires de copropriétés ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "Loi 25 copropriété, conformité protection renseignements personnels fenêtres, gestion données résidents, hébergement Canada fenêtres syndicat",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Conformité Loi 25 pour données de fenêtres en copropriété | Vosthermos",
    description: "Hébergement au Canada, chiffrement, politiques de conservation conformes Loi 25.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const COMPLIANCE_POINTS = [
  { icon: "fa-server", title: "Hébergement au Canada", text: "Toutes les données (photos avant/après, diagnostics, factures, coordonnées résidents) sont stockées sur des serveurs situés au Canada, conformément aux exigences de localisation des données sensibles." },
  { icon: "fa-lock", title: "Chiffrement SSL/TLS", text: "Transmission des données protégée par certificats Let's Encrypt renouvelés automatiquement. Aucune donnée ne transite en clair sur internet." },
  { icon: "fa-user-shield", title: "Consentement explicite", text: "Chaque résident consent explicitement à la collecte de ses données lors de la prise de rendez-vous. Finalité, durée et droits clairement communiqués." },
  { icon: "fa-clock-rotate-left", title: "Politique de conservation", text: "Données conservées 7 ans (conformité fiscale) puis anonymisées. Photos avant/après conservées 10 ans pour garantie, puis supprimées ou anonymisées." },
  { icon: "fa-user-times", title: "Droit d'accès et d'effacement", text: "Tout résident peut demander ses données (portabilité) ou leur effacement (sauf obligations légales) via notre formulaire dédié. Réponse sous 30 jours." },
  { icon: "fa-bug", title: "Plan de réponse aux incidents", text: "Procédure documentée en cas de fuite de données : notification CAI dans les 72h, notification résidents concernés, mesures correctives." },
];

const RISKS = [
  { title: "Amendes Loi 25 : jusqu'à 25M$", text: "Les syndicats de copropriété sont concernés au même titre que les entreprises. En cas de non-conformité, les amendes vont de 15 000$ à 25 millions de dollars ou 4% du chiffre d'affaires annuel mondial." },
  { title: "Responsabilité du gestionnaire", text: "Le gestionnaire de copropriété est responsable de s'assurer que tous ses fournisseurs (dont les entrepreneurs en fenêtres) traitent les données conformément à la loi." },
  { title: "Plaintes à la CAI", text: "La Commission d'accès à l'information peut enquêter sur signalement d'un résident. Choisir des fournisseurs non conformes vous expose à des vérifications coûteuses." },
];

const FAQS = [
  {
    q: "La Loi 25 s'applique-t-elle vraiment aux copropriétés ?",
    a: "Oui. Tout organisme qui collecte des renseignements personnels (coordonnées, photos d'unités, etc.) est assujetti, incluant les syndicats de copropriété. Les gestionnaires immobiliers ont l'obligation d'encadrer leurs fournisseurs.",
  },
  {
    q: "Pouvez-vous fournir une attestation de conformité ?",
    a: "Oui. Sur demande, nous fournissons un document détaillant nos mesures techniques et organisationnelles conformes à la Loi 25. Utile pour votre dossier de vérification diligente.",
  },
  {
    q: "Où sont hébergées les photos avant/après ?",
    a: "Sur nos serveurs canadiens (actuellement : Montréal, Québec). Aucune donnée ne quitte le territoire canadien. Aucun transfert vers AWS US ou Google Cloud US.",
  },
  {
    q: "Combien de temps conservez-vous les données après un travail ?",
    a: "7 ans pour les factures (obligation fiscale). 10 ans pour les photos avant/après (durée de notre garantie). Après ces délais, les données sont anonymisées ou supprimées selon le choix du syndicat.",
  },
  {
    q: "Que se passe-t-il si un résident refuse qu'on prenne des photos ?",
    a: "Son refus est respecté. La prise de photos est optionnelle pour la garantie — sans photos, la garantie reste valide mais les litiges potentiels seront plus difficiles à régler. Le choix revient à chaque résident.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Entrepreneur en fenêtres conforme à la Loi 25 du Québec",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Services de fenêtres pour copropriétés avec conformité complète à la Loi 25 québécoise sur la protection des renseignements personnels.",
  url: PAGE_URL,
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
    { "@type": "ListItem", position: 3, name: "Conformité Loi 25", item: PAGE_URL },
  ],
};

export default function Loi25Page() {
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
            <span className="text-white">Conformité Loi 25</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <i className="fas fa-shield-alt"></i> Protection des renseignements personnels
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Conformité <span className="text-[var(--color-red)]">Loi 25</span> pour vos données de fenêtres
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
            Gestionnaires de copropriété : vos fournisseurs doivent respecter la Loi 25. Vosthermos est <strong className="text-white">nativement conforme</strong> — hébergement au Canada, chiffrement SSL, politiques de conservation documentées.
          </p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-6">Pourquoi c'est critique pour un gestionnaire</h2>
          <p className="text-[var(--color-muted)] text-lg leading-relaxed mb-10 max-w-3xl">
            La Loi 25 (en vigueur depuis septembre 2022, phases finales en septembre 2024) s'applique à tout organisme québécois qui collecte des renseignements personnels, <strong>y compris les syndicats de copropriété</strong>. En tant que gestionnaire, vous êtes responsable de vérifier que vos fournisseurs respectent la loi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RISKS.map((r) => (
              <div key={r.title} className="bg-red-50 border border-red-200 rounded-xl p-6">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl mb-3 block"></i>
                <h3 className="font-bold mb-2">{r.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our compliance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2 text-center">Nos mesures de conformité</h2>
          <p className="text-[var(--color-muted)] mb-10 text-center max-w-2xl mx-auto">6 piliers techniques et organisationnels pour une conformité complète.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPLIANCE_POINTS.map((p) => (
              <div key={p.title} className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <div className="w-12 h-12 bg-[var(--color-teal)]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${p.icon} text-xl text-[var(--color-teal)]`}></i>
                </div>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{p.text}</p>
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

      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Besoin d'une attestation de conformité ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Nous fournissons gratuitement un document détaillé de nos mesures de conformité Loi 25 pour votre dossier de vérification diligente.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=loi-25" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-file-contract"></i> Demander l'attestation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
