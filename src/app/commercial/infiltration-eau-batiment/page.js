import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const BASE = "https://www.vosthermos.com";
const PAGE_URL = `${BASE}/commercial/infiltration-eau-batiment`;

export const metadata = {
  title: "Infiltration d'eau autour des fenêtres : diagnostic et réparation | Vosthermos",
  description:
    `Spécialistes de l'infiltration d'eau autour des fenêtres pour bâtiments commerciaux et copropriétés : diagnostic avec caméra thermique, rapport expert, réparation ou étanchéité. Québec ☎ ${COMPANY_INFO.phone}`,
  keywords:
    "infiltration eau fenêtre commercial, dégât eau fenêtre immeuble, diagnostic étanchéité fenêtre, caméra thermique infiltration, calfeutrage professionnel bâtiment",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    locale: "fr_CA",
    title: "Diagnostic et réparation d'infiltrations d'eau | Vosthermos",
    description: "Caméra thermique, rapport expert, réparation ou étanchéité pour bâtiments commerciaux.",
    images: [{ url: `${BASE}/images/Vos-Thermos-Logo.png` }],
  },
  robots: "index, follow",
};

const SYMPTOMS = [
  { icon: "fa-droplet", title: "Taches d'humidité au mur", text: "Auréoles brunes ou cercles d'humidité sous la fenêtre — signe d'eau qui s'infiltre depuis l'extérieur." },
  { icon: "fa-cloud-rain", title: "Condensation intérieure excessive", text: "Eau qui ruisselle sur le verre même à basse humidité ambiante — isolation brisée ou joint défectueux." },
  { icon: "fa-bug", title: "Moisissure ou odeur", text: "Noircissement des joints, odeur de moisi — infiltration en cours depuis plusieurs mois probablement." },
  { icon: "fa-wind", title: "Courant d'air mesurable", text: "Air froid perceptible autour de la fenêtre — étanchéité extérieure compromise, risque d'infiltration." },
  { icon: "fa-paint-roller", title: "Peinture qui cloque", text: "Bulles dans la peinture autour du cadre — eau qui s'infiltre sous la surface." },
  { icon: "fa-ruler-combined", title: "Gauchissement du cadre", text: "Cadre déformé ou qui ne ferme plus bien — dégradation structurelle liée à l'eau." },
];

const PROCESS = [
  { icon: "fa-eye", title: "Inspection visuelle extérieure", text: "Évaluation du revêtement, du calfeutrage, des linteaux et de la maçonnerie entourant chaque fenêtre." },
  { icon: "fa-thermometer", title: "Caméra thermique", text: "Détection des zones froides (ponts thermiques) et des zones humides par imagerie infrarouge." },
  { icon: "fa-tint", title: "Test d'arrosage contrôlé", text: "Simulation de pluie battante avec jet d'eau calibré pour isoler précisément le point d'entrée de l'eau." },
  { icon: "fa-file-alt", title: "Rapport détaillé", text: "Document technique avec photos, thermographies, localisation du problème et recommandations de correction." },
  { icon: "fa-tools", title: "Réparation ciblée", text: "Intervention limitée à la zone problématique : recalfeutrage, remplacement du thermos, réparation du cadre ou du linteau." },
];

const CAUSES = [
  { title: "Calfeutrage vieillissant", text: "Le silicone et les scellants ont une durée de vie de 10-15 ans. Après, ils se fissurent et laissent passer l'eau." },
  { title: "Solin mal installé", text: "Le solin métallique qui protège le haut de la fenêtre doit être posé selon le code du bâtiment. Souvent mal installé lors de la construction." },
  { title: "Joint d'étanchéité brisé (thermos)", text: "Quand le joint du thermos cède, de la condensation apparaît dans la vitre et l'eau peut s'accumuler dans le cadre." },
  { title: "Accumulation de glace (barrage de glace)", text: "En hiver, la glace sur les corniches peut faire remonter l'eau dans le mur et créer des infiltrations." },
  { title: "Pente de l'appui insuffisante", text: "Un appui de fenêtre qui n'a pas de pente adéquate vers l'extérieur laisse l'eau stagner et s'infiltrer." },
  { title: "Cadre de bois pourri", text: "Le bois non traité ou mal entretenu pourrit, crée des fissures et permet à l'eau de pénétrer à l'intérieur." },
];

const FAQS = [
  {
    q: "Combien coûte un diagnostic d'infiltration ?",
    a: "Inspection visuelle simple : gratuite. Inspection avec caméra thermique : 350$-650$ selon la taille du bâtiment. Test d'arrosage contrôlé : 450$-850$. Rapport remis sous 5 jours ouvrables.",
  },
  {
    q: "Pouvez-vous déterminer si c'est le thermos ou le calfeutrage ?",
    a: "Oui. Nos techniciens distinguent infiltration par l'extérieur (calfeutrage, solin, cadre) vs condensation interne (thermos brisé). Le diagnostic précis évite des réparations inutiles.",
  },
  {
    q: "Est-ce que le problème peut revenir si on répare juste le calfeutrage ?",
    a: "Oui, si la cause racine est ailleurs (solin, cadre pourri, thermos brisé). Notre rapport identifie la cause pour éviter que le problème ne revienne dans 6 mois.",
  },
  {
    q: "Acceptez-vous les mandats d'expertise pour assurance ?",
    a: "Oui. Nous fournissons des rapports d'expertise recevables pour réclamations d'assurance, incluant nos certifications et numéros RBQ. Factures détaillées pour soumission.",
  },
  {
    q: "Délai d'intervention en cas d'infiltration active ?",
    a: "Sous 48h pour intervention d'urgence (colmatage temporaire). Réparation permanente planifiée sous 7-14 jours selon la complexité. Service 7j/7 disponible pour les clients sous contrat.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Diagnostic et réparation d'infiltrations d'eau autour des fenêtres",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "State", name: "Quebec" },
  description: "Services spécialisés de diagnostic d'infiltrations d'eau autour des fenêtres pour bâtiments commerciaux et copropriétés, avec caméra thermique et rapport d'expert.",
  url: PAGE_URL,
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
    { "@type": "ListItem", position: 3, name: "Infiltration eau", item: PAGE_URL },
  ],
};

export default function InfiltrationPage() {
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
            <span className="text-white">Infiltration d'eau</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Diagnostic et réparation <span className="text-[var(--color-red)]">d'infiltrations d'eau</span>
          </h1>
          <p className="text-white/80 text-lg max-w-3xl leading-relaxed mb-6">
            Vous avez une infiltration autour d'une fenêtre ? Nous identifions la vraie cause avec <strong className="text-white">caméra thermique et test d'arrosage contrôlé</strong>, puis nous réparons avec précision.
          </p>
          <Link href="/contact?sujet=infiltration" className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all">
            <i className="fas fa-search"></i> Demander un diagnostic
          </Link>
        </div>
      </section>

      {/* Symptoms */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2">Reconnaître les signes d'infiltration</h2>
          <p className="text-[var(--color-muted)] mb-10 max-w-2xl">Six symptômes typiques qui demandent une inspection professionnelle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SYMPTOMS.map((s) => (
              <div key={s.title} className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-6">
                <div className="w-12 h-12 bg-[var(--color-red)]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${s.icon} text-xl text-[var(--color-red)]`}></i>
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Notre méthode d'expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map((p, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                <div className="w-12 h-12 bg-[var(--color-teal)]/10 rounded-xl flex items-center justify-center mb-3">
                  <i className={`fas ${p.icon} text-[var(--color-teal)]`}></i>
                </div>
                <p className="text-xs font-bold text-[var(--color-red)] mb-1">ÉTAPE {i + 1}</p>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Causes */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-2">Les 6 causes les plus fréquentes</h2>
          <p className="text-[var(--color-muted)] mb-10 max-w-2xl">Identifier la vraie cause évite des réparations inutiles et des récidives coûteuses.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAUSES.map((c) => (
              <div key={c.title} className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">{c.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-[var(--color-teal-dark)] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Infiltration suspectée ?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">N'attendez pas que les dégâts s'aggravent. Inspection gratuite, diagnostic précis.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact?sujet=infiltration" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
              <i className="fas fa-envelope"></i> Formulaire en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
