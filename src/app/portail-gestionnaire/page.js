import Link from "next/link";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/company-info";
import PortalDemoVisual from "./PortalDemoVisual";
import "./portail.css";

const PAGE_URL = "https://www.vosthermos.com/portail-gestionnaire";

export const metadata = {
  title: "Portail Gestionnaire de Copropriétés pour Fenêtres | Vosthermos",
  description:
    "Portail gratuit pour clients gestionnaires : copropriétés, bâtiments, unités, demandes d'intervention, suivis, photos et factures au même endroit.",
  keywords:
    "portail gestionnaire fenêtres copropriété, logiciel suivi travaux fenêtres, app gestion condos entrepreneur fenêtres, bon de travail numérique fenêtres Québec, entrepreneur fenêtres plateforme suivi, gestion parc fenêtres copropriété, entrepreneur connecté fenêtres Québec, suivi fenêtres copropriété",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: PAGE_URL,
    title: "Portail Gestionnaire de Copropriétés pour Fenêtres | Vosthermos",
    description:
      "Portail gratuit pour clients gestionnaires : copropriétés, bâtiments, unités, demandes, suivis et factures au même endroit.",
    images: [
      {
        url: "https://www.vosthermos.com/portail-gestionnaire/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Aperçu du portail gestionnaire Vosthermos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portail Gestionnaire de Copropriétés pour Fenêtres | Vosthermos",
    description:
      "Copropriétés, bâtiments, unités, demandes, suivis et factures centralisés pour gestionnaires.",
    images: ["https://www.vosthermos.com/portail-gestionnaire/opengraph-image"],
  },
};

const FAQS = [
  {
    q: "Combien ça coûte d'utiliser le portail ?",
    a: "Le portail est inclus gratuitement pour tous nos clients avec contrat d'entretien. Pas de frais mensuels cachés.",
  },
  {
    q: "Est-ce que mes propriétaires ont accès au portail ?",
    a: "Pas pour le moment. Le portail est pensé pour les gestionnaires et syndicats; les demandes des propriétaires peuvent être centralisées par votre équipe.",
  },
  {
    q: "Combien de temps pour mettre en place ?",
    a: "Inventaire de votre parc de fenêtres et intégration : 2 à 5 jours selon la taille. Vous êtes opérationnel dès la première semaine.",
  },
  {
    q: "Est-ce sécuritaire ?",
    a: "Données hébergées au Canada, chiffrement SSL, conformité à la Loi 25 du Québec sur la protection des renseignements personnels.",
  },
  {
    q: "Peut-on exporter nos données ?",
    a: "Les dossiers restent centralisés dans le portail. Si un client a besoin d'un export précis pour ses archives ou son logiciel de gestion, Vosthermos peut l'accompagner selon le format requis.",
  },
  {
    q: "Quelles copropriétés sont éligibles ?",
    a: "Toute copropriété au Québec avec 5 unités et plus. Pas de taille maximum : on gère aussi bien un triplex qu'un parc de 500 fenêtres.",
  },
  {
    q: "Comment nos techniciens utilisent le portail sur le terrain ?",
    a: "Le portail est web et adapté au mobile. Il permet de consulter les dossiers, demandes, photos et suivis sans dépendre d'un poste fixe.",
  },
  {
    q: "Intégration avec nos logiciels existants (Condo Manager, etc.) ?",
    a: "Aucune API publique n'est annoncée pour le moment. Le portail sert surtout de source centrale pour vos copropriétés, unités, interventions et documents Vosthermos.",
  },
];

export default function PortailGestionnairePage() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vosthermos Portail Gestionnaire",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: "0",
      description: "Sur devis — inclus avec contrat d'entretien",
    },
    featureList: [
      "Création de copropriétés, bâtiments et unités",
      "Fiches unité avec photos et notes",
      "Demandes d'intervention structurées",
      "Suivi des bons actifs et terminés",
      "Factures et documents PDF au même endroit",
      "Affichage ordinateur et mobile",
    ],
    provider: {
      "@type": "Organization",
      name: "Vosthermos",
      address: `${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode}`,
      telephone: COMPANY_INFO.phoneTel,
      email: COMPANY_INFO.email,
      url: COMPANY_INFO.url,
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
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.vosthermos.com/" },
      { "@type": "ListItem", position: 2, name: "Portail Gestionnaire", item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="portail-page">
        {/* HERO */}
        <section className="pg-hero">
          <div className="pg-hero-bg" aria-hidden="true">
            <div className="pg-grid-lines"></div>
            <div className="pg-hero-glow pg-glow-a"></div>
            <div className="pg-hero-glow pg-glow-b"></div>
          </div>
          <div className="pg-container pg-hero-inner">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>PORTAIL B2B · COPROPRIÉTÉS &amp; GESTIONNAIRES
            </span>
            <h1 className="pg-h1">
              Le portail des gestionnaires de copropriétés{" "}
              <span className="pg-h1-accent pg-h1-break">pour vos travaux de fenêtres.</span>
            </h1>
            <p className="pg-hero-sub">
              Copropriétés, bâtiments, unités, demandes d&apos;intervention, suivis et factures
              dans un même portail. Le gestionnaire comprend l&apos;état des dossiers sans courir
              après les courriels.
            </p>
            <div className="pg-hero-ctas">
              <Link href="/contact?sujet=portail-demo" className="pg-btn pg-btn-primary pg-btn-lg">
                Demander une démo
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path
                    d="M4 10h10m-4-4 4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a href="/portail-gestionnaire/tutoriel.html" className="pg-btn pg-btn-secondary pg-btn-lg">
                Voir le tutoriel animé
              </a>
              <a href="#features" className="pg-btn pg-btn-secondary pg-btn-lg">
                Voir les fonctionnalités
              </a>
            </div>

            <div
              className="pg-real-preview"
              role="img"
              aria-label="Captures réelles du portail gestionnaire Vosthermos"
            >
              <div className="pg-real-main">
                <div className="pg-real-frame">
                  <div className="pg-real-label">Capture réelle du portail · tableau de bord</div>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-dashboard.png"
                    alt="Capture réelle du tableau de bord du portail gestionnaire Vosthermos"
                    width={1280}
                    height={900}
                    priority
                    sizes="(max-width: 980px) 100vw, 760px"
                  />
                </div>
              </div>
              <div className="pg-real-side">
                <div className="pg-real-card">
                  <span>Fiche unité</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-unit-detail.png"
                    alt="Capture réelle d'une fiche unité dans le portail"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
                <div className="pg-real-card">
                  <span>Interventions</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-interventions.png"
                    alt="Capture réelle du suivi des interventions dans le portail"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
                <div className="pg-real-card">
                  <span>Factures</span>
                  <Image
                    src="/portail-gestionnaire/tutoriel-assets/capture-factures.png"
                    alt="Capture réelle de la section factures dans le portail"
                    width={1280}
                    height={900}
                    sizes="(max-width: 980px) 100vw, 320px"
                  />
                </div>
              </div>
            </div>

            <div className="pg-trust-bar">
              <div>
                <b>Données hébergées au Canada</b>
              </div>
              <div className="pg-tb-sep"></div>
              <div>
                <b>Conforme Loi 25</b>
              </div>
              <div className="pg-tb-sep"></div>
              <div>
                <b>Portail web</b> ordinateur · tablette · mobile
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO */}
        <section className="pg-live-demo" id="demo-live">
          <div className="pg-container">
            <div className="pg-live-head">
              <span className="pg-eyebrow pg-eyebrow-dark">
                <span className="pg-eyebrow-dot"></span>PORTAIL EN IMAGES
              </span>
              <h2 className="pg-section-title">
                Les visuels montrent le vrai portail, pas un dashboard inventé.
              </h2>
              <p className="pg-section-lede">
                Les captures reprennent le parcours présenté dans le tutoriel animé : tableau de bord,
                fiche unité, interventions et factures, avec une navigation complète sur ordinateur et mobile.
              </p>
              <div className="pg-live-actions">
                <a href="/portail-gestionnaire/tutoriel.html" className="pg-btn pg-btn-primary pg-btn-lg">
                  Voir le tutoriel animé
                </a>
                <Link href="/contact?sujet=portail-demo" className="pg-btn pg-btn-light pg-btn-lg">
                  Demander une démo
                </Link>
              </div>
            </div>
            <PortalDemoVisual />
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section className="pg-ps">
          <div className="pg-container">
            <h2 className="pg-section-title">
              Gérer 50, 100, 500 fenêtres ne devrait pas prendre <em>50 appels</em>.
            </h2>
            <p className="pg-section-lede">
              Le portail gestionnaire copropriété fenêtres remplace la paperasse, les vocaux sans
              suite et les tableurs éparpillés par une vue structurée des copropriétés, unités,
              demandes, suivis et factures.
            </p>
            <div className="pg-ps-grid">
              {[
                [
                  "Appels perdus, dossiers papier, historique flou d'une année à l'autre.",
                  "Tableau de bord centralisé par copropriété, bâtiment et unité.",
                ],
                [
                  "Impossible de prévoir les coûts d'entretien annuels devant le CA.",
                  "Bons actifs, unités touchées et dossiers terminés visibles au même endroit.",
                ],
                [
                  "Facturation éparpillée, approbations manuelles par courriels croisés.",
                  "Factures et documents PDF rattachés au dossier client.",
                ],
              ].map(([problem, solution], i) => (
                <div className="pg-ps-row" key={i}>
                  <div className="pg-ps-card problem">
                    <span className="pg-ps-tag">Avant</span>
                    <p>{problem}</p>
                  </div>
                  <div className="pg-ps-arrow">
                    <svg viewBox="0 0 40 20" width="40" height="20">
                      <path
                        d="M2 10h34m-6-6 6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="pg-ps-card solution">
                    <span className="pg-ps-tag">Avec Vosthermos</span>
                    <p>{solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="pg-features">
          <div className="pg-container">
            <span className="pg-eyebrow pg-eyebrow-dark">
              <span className="pg-eyebrow-dot"></span>FONCTIONNALITÉS
            </span>
            <h2 className="pg-section-title">
              Tout ce qu&apos;un gestionnaire attend d&apos;un{" "}
              <em>logiciel de suivi des travaux de fenêtres</em>.
            </h2>
            <div className="pg-feat-grid">
              <article className="pg-feat">
                <div className="pg-feat-visual">
                  <div className="pg-wo-mini">
                    <div className="pg-wo-mini-head">
                      <span>BT-2187</span>
                      <span className="pg-pill ok sm">En suivi</span>
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-camera"></i> Photo rattachée
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-clipboard-list"></i> Note d&apos;intervention
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-circle-check"></i> Statut visible
                    </div>
                  </div>
                </div>
                <h3>Bon de travail numérique</h3>
                <p>
                  Les demandes et bons actifs restent structurés par copropriété, bâtiment,
                  unité et ouverture. Les photos et notes peuvent être rattachées au dossier.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-grid">
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell a"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell b"></span>
                    <span className="pg-fg-cell"></span>
                  </div>
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell a"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell c"></span>
                  </div>
                  <div className="pg-fg-row">
                    <span className="pg-fg-cell c"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell"></span>
                    <span className="pg-fg-cell a"></span>
                  </div>
                  <div className="pg-fg-legend">
                    <span>
                      <i className="pg-dt a"></i>OK
                    </span>
                    <span>
                      <i className="pg-dt b"></i>À surveiller
                    </span>
                    <span>
                      <i className="pg-dt c"></i>À remplacer
                    </span>
                  </div>
                </div>
                <h3>Dashboard multi-unités</h3>
                <p>
                  Vue globale de vos copropriétés : bâtiments, unités, dossiers actifs,
                  interventions terminées et factures à consulter.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-history">
                  <div className="pg-hist-node">
                    <b>U-301 · cuisine</b>
                    <span>Fenêtre PVC 120×90</span>
                  </div>
                  <div className="pg-hist-row">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2024 · Ajustement quincaillerie</b>
                      <span>M. Dubé</span>
                    </div>
                  </div>
                  <div className="pg-hist-row">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2025 · Changement joint</b>
                      <span>J. Pelletier</span>
                    </div>
                  </div>
                  <div className="pg-hist-row active">
                    <span className="pg-hist-dot"></span>
                    <div>
                      <b>2026 · Demande ouverte</b>
                      <span>Photo et notes rattachées</span>
                    </div>
                  </div>
                </div>
                <h3>Historique complet par unité</h3>
                <p>
                  Chaque unité garde ses informations utiles : ouvertures, notes, photos,
                  demandes et interventions liées au dossier.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-plan">
                  <svg viewBox="0 0 220 90" width="100%" height="90">
                    <defs>
                      <linearGradient id="pgPlanG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6fb7c7" stopOpacity=".65" />
                        <stop offset="100%" stopColor="#004d5e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 70 L40 58 L80 48 L120 30 L160 38 L200 22 L220 18 L220 90 L0 90 Z"
                      fill="url(#pgPlanG)"
                    />
                    <path
                      d="M0 70 L40 58 L80 48 L120 30 L160 38 L200 22 L220 18"
                      fill="none"
                      stroke="#6fb7c7"
                      strokeWidth="2"
                    />
                    <g fill="#e30718">
                      <circle cx="40" cy="58" r="3" />
                      <circle cx="120" cy="30" r="3" />
                      <circle cx="200" cy="22" r="3" />
                    </g>
                  </svg>
                  <div className="pg-plan-years">
                    <span>2026</span>
                    <span>2028</span>
                    <span>2030</span>
                    <span>2035</span>
                  </div>
                </div>
                <h3>Priorités d&apos;entretien</h3>
                <p>
                  Les bons actifs et demandes à traiter restent visibles, ce qui aide l&apos;équipe
                  à suivre les dossiers importants sans perdre le contexte.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-rt">
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon ok">
                      <i className="fas fa-check"></i>
                    </span>
                    <span>Technicien assigné</span>
                    <small>8 h 04</small>
                  </div>
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon ok">
                      <i className="fas fa-check"></i>
                    </span>
                    <span>En route</span>
                    <small>9 h 12</small>
                  </div>
                  <div className="pg-rt-row">
                    <span className="pg-rt-icon live">
                      <i className="fas fa-circle"></i>
                    </span>
                    <span>Intervention en cours</span>
                    <small>9 h 38</small>
                  </div>
                  <div className="pg-rt-row muted">
                    <span className="pg-rt-icon"></span>
                    <span>Rapport envoyé</span>
                    <small>—</small>
                  </div>
                </div>
                <h3>Suivi des interventions</h3>
                <p>
                  Suivez les interventions planifiées et complétées, avec date, statut,
                  technicien assigné lorsque disponible et notes rattachées au dossier.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-invoice">
                  <div className="pg-inv">
                    <div className="pg-inv-head">
                      <b>Facture PDF · avril</b>
                      <span className="pg-pill ok sm">Disponible</span>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unité 102 — 2 interventions</span>
                      <b>420 $</b>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unité 204 — inspection</span>
                      <b>185 $</b>
                    </div>
                    <div className="pg-inv-line">
                      <span>Unité 301 — remplacement scellé</span>
                      <b>640 $</b>
                    </div>
                    <div className="pg-inv-total">
                      <span>Total</span>
                      <b>1 245 $ CA</b>
                    </div>
                  </div>
                </div>
                <h3>Facturation centralisée</h3>
                <p>
                  Les factures et documents PDF sont retrouvables dans le portail pour éviter
                  de fouiller dans les courriels ou dossiers partagés.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="pg-workflow">
          <div className="pg-container">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>WORKFLOW
            </span>
            <h2 className="pg-section-title light">
              De la détection du problème à la facture,{" "}
              <em>tout se passe ici.</em>
            </h2>
            <p className="pg-section-lede light">
              Un parcours simple : créer la copropriété, ouvrir les unités, envoyer une demande,
              suivre le statut et retrouver les documents.
            </p>
            <ol className="pg-timeline">
              {[
                ["Copropriété", "Le client crée sa copropriété, ses bâtiments et ses unités sans devoir envoyer une demande à l'administration."],
                ["Fiche unité", "Il ouvre une unité, ajoute les informations utiles et garde les photos au bon endroit."],
                ["Demande", "Il crée une demande d'intervention structurée avec l'unité et le contexte du problème."],
                ["Suivi", "Vosthermos met le dossier à jour avec le statut, les dates, les notes et le technicien si assigné."],
                ["Facture", "Les factures et PDF restent accessibles dans le portail pour consultation et archivage."],
              ].map(([title, desc], i) => (
                <li className="pg-tl-step" key={i}>
                  <div className="pg-tl-dot">
                    <span>{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* COMPARE */}
        <section id="compare" className="pg-compare">
          <div className="pg-container">
            <span className="pg-eyebrow pg-eyebrow-dark">
              <span className="pg-eyebrow-dot"></span>DIFFÉRENCIATION
            </span>
            <h2 className="pg-section-title">Ce qui nous distingue.</h2>
            <p className="pg-section-lede">
              Face à un entrepreneur fenêtres Québec traditionnel ou à la gestion par téléphone, le
              portail change l&apos;équation.
            </p>
            <div className="pg-table-wrap">
              <div className="pg-cmp-shell">
                <table className="pg-cmp">
                  <thead>
                    <tr>
                      <th>
                        <span className="pg-cmp-col-sub">Fonctionnalité</span>
                        Ce qu&apos;il vous faut
                      </th>
                      <th className="us">
                        <span className="pg-cmp-reco-inline">
                          <i className="fas fa-star"></i> Recommandé
                        </span>
                        <span className="pg-cmp-col-sub">Solution numérique</span>
                        Vosthermos Portail
                      </th>
                      <th>
                        <span className="pg-cmp-col-sub">Traditionnel</span>
                        Entrepreneur classique
                      </th>
                      <th>
                        <span className="pg-cmp-col-sub">Basique</span>
                        Appels téléphoniques
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Portail web 24/7", "yes", "no", "no"],
                      ["Copropriétés et unités créables par client", "yes", "no", "no"],
                      ["Demandes d'intervention structurées", "yes", "maybe", "no"],
                      ["Fiches unité avec notes et photos", "yes", "maybe", "no"],
                      ["Suivi des bons actifs et terminés", "yes", "maybe", "no"],
                      ["Factures et PDF centralisés", "yes", "maybe", "no"],
                      ["Vue ordinateur et mobile", "yes", "maybe", "no"],
                    ].map(([feat, us, trad, phone], i) => {
                      const Icon = ({ state }) => {
                        if (state === "yes") {
                          return (
                            <span className="pg-check yes" aria-label="Oui">
                              <svg viewBox="0 0 24 24"><polyline points="5 12 10 17 19 7" /></svg>
                            </span>
                          );
                        }
                        if (state === "maybe") {
                          return (
                            <span className="pg-check maybe" aria-label="Partiel">
                              <svg viewBox="0 0 24 24"><line x1="6" y1="12" x2="18" y2="12" /></svg>
                            </span>
                          );
                        }
                        return (
                          <span className="pg-check no" aria-label="Non">
                            <svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                          </span>
                        );
                      };
                      return (
                        <tr key={i}>
                          <th>{feat}</th>
                          <td className="us"><Icon state={us} /></td>
                          <td><Icon state={trad} /></td>
                          <td><Icon state={phone} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="pg-cmp-footer">
                  Seul <strong>Vosthermos Portail</strong>
                  <span className="pg-cmp-arrow"> → </span>
                  centralise les dossiers de fenêtres avec les captures et documents au même endroit.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="pg-story">
          <div className="pg-container pg-story-inner">
            <span className="pg-eyebrow">
              <span className="pg-eyebrow-dot"></span>SCÉNARIO TYPE
            </span>
            <h2 className="pg-section-title light">
              Une semaine dans la vie d&apos;un gestionnaire de copropriété.
            </h2>
            <div className="pg-story-grid">
              <div className="pg-story-col before">
                <div className="pg-story-label">Avant</div>
                <p>
                  Mardi 14 h. Un locataire appelle : fenêtre embuée. Le gestionnaire cherche
                  l&apos;entrepreneur, laisse un message. Jeudi, rappel. Vendredi, courriel pour
                  approuver. Semaine suivante, autre appel pour savoir si c&apos;est fait. Un mois
                  plus tard, facture papier sans photo, aucune trace dans le dossier de
                  l&apos;unité.
                </p>
                <ul className="pg-story-metrics">
                  <li>
                    <b>+</b> relances et recherches
                  </li>
                  <li>
                    <b>?</b> statut difficile à confirmer
                  </li>
                  <li>
                    <b>0</b> dossier centralisé
                  </li>
                </ul>
              </div>
              <div className="pg-story-col after">
                <div className="pg-story-label">Avec le portail</div>
                <p>
                  Mardi 14 h. Le gestionnaire saisit la fenêtre problématique dans le portail, photo
                  jointe. Vosthermos confirme la suite dans le dossier. Le statut, les notes et les
                  documents restent liés à l&apos;unité. Quand la facture est disponible, elle se retrouve
                  dans le portail avec les autres documents.
                </p>
                <ul className="pg-story-metrics">
                  <li>
                    <b>-</b> moins de suivis éparpillés
                  </li>
                  <li>
                    <b>1</b> dossier clair par unité
                  </li>
                  <li>
                    <b>PDF</b> et photos centralisés
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* VOTRE ÉQUIPE DÉDIÉE — style Apple */}
        <section className="pg-team">
          <div className="pg-container">
            <div className="pg-team-intro">
              <h2 className="pg-section-title">Parlez à un humain. Pas à un bot.</h2>
              <p className="pg-section-lede">
                Deux spécialistes vous accompagnent, de la démo à la mise en route jusqu&apos;au
                suivi mensuel.
              </p>
            </div>
            <div className="pg-team-grid">
              <article className="pg-team-card">
                <div className="pg-team-info">
                  <h3 className="pg-team-name">Spécialiste copropriétés</h3>
                  <p className="pg-team-role">
                    Démos, mise en route du portail et formation de votre équipe.
                  </p>
                  <p className="pg-team-spec">
                    Grand Montréal · Laval · Laurentides
                  </p>
                  <div className="pg-team-cta">
                    <a
                      href={`tel:${COMPANY_INFO.phoneTel}`}
                      className="pg-team-btn pg-team-btn-primary"
                    >
                      Appeler
                    </a>
                    <Link
                      href="/contact?sujet=portail-demo&specialiste=coproprietes"
                      className="pg-team-btn pg-team-btn-outline"
                    >
                      Écrire
                    </Link>
                  </div>
                </div>
              </article>

              <article className="pg-team-card">
                <div className="pg-team-info">
                  <h3 className="pg-team-name">Conseiller technique</h3>
                  <p className="pg-team-role">
                    Priorités d&apos;entretien et parcs importants de 50 fenêtres et plus.
                  </p>
                  <p className="pg-team-spec">
                    Montérégie · Rive-Sud · Estrie
                  </p>
                  <div className="pg-team-cta">
                    <a
                      href={`tel:${COMPANY_INFO.phoneTel}`}
                      className="pg-team-btn pg-team-btn-primary"
                    >
                      Appeler
                    </a>
                    <Link
                      href="/contact?sujet=portail-demo&specialiste=technique"
                      className="pg-team-btn pg-team-btn-outline"
                    >
                      Écrire
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="pg-faq">
          <div className="pg-container">
            <div className="pg-faq-intro">
              <span className="pg-eyebrow pg-eyebrow-dark">
                <span className="pg-eyebrow-dot"></span>FAQ
              </span>
              <h2 className="pg-section-title">Questions fréquentes des gestionnaires.</h2>
              <p className="pg-section-lede">
                Tout ce que vous devez savoir sur le portail. Vous ne trouvez pas votre
                réponse&nbsp;? Contactez l&apos;équipe Vosthermos plus haut.
              </p>
            </div>
            <div className="pg-faq-list">
              {FAQS.map((f, i) => (
                <details className="pg-faq-item" key={i} open={i === 0}>
                  <summary>
                    <h3>{f.q}</h3>
                    <span className="pg-faq-chev"></span>
                  </summary>
                  <div className="pg-faq-body">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="demo" className="pg-cta-final">
          <div className="pg-hero-bg" aria-hidden="true">
            <div className="pg-grid-lines"></div>
            <div className="pg-hero-glow pg-glow-a"></div>
            <div className="pg-hero-glow pg-glow-b"></div>
          </div>
          <div className="pg-container pg-cta-inner">
            <h2 className="pg-h1 pg-cta-h1">Prêt à voir le portail en action ?</h2>
            <p className="pg-cta-sub">
              Démo personnalisée selon votre parc de fenêtres et votre copropriété. 30 minutes, en
              visio ou sur place.
            </p>
            <Link className="pg-btn pg-btn-primary pg-btn-xl" href="/contact?sujet=portail-demo">
              Demande de démo gratuite · 30 min
              <svg viewBox="0 0 20 20" width="16" height="16">
                <path
                  d="M4 10h10m-4-4 4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <p className="pg-cta-reassure">
              <span>
                <i className="fas fa-check"></i> Démo personnalisée selon votre parc
              </span>
              <span>
                <i className="fas fa-check"></i> Aucune carte de crédit
              </span>
              <span>
                <i className="fas fa-check"></i> Pas d&apos;engagement
              </span>
            </p>
            <div className="pg-cta-contact">
              <a href={`tel:${COMPANY_INFO.phoneTel}`}>
                <i className="fas fa-phone"></i> Préférez parler ? {COMPANY_INFO.phone}
              </a>
              <span className="pg-cta-dot">·</span>
              <a href={`mailto:${COMPANY_INFO.email}`}>
                <i className="fas fa-envelope"></i> {COMPANY_INFO.email}
              </a>
              <span className="pg-cta-dot">·</span>
              <span>
                <i className="fas fa-location-dot"></i> {COMPANY_INFO.address}
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
