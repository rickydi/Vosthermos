import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";
import "./portail.css";

const PAGE_URL = "https://www.vosthermos.com/portail-gestionnaire";

export const metadata = {
  title: "Portail Gestionnaire de Copropriétés pour Fenêtres | Vosthermos",
  description:
    "Plateforme numérique pour gestionnaires de condos : bons de travail numériques, suivi temps réel, historique par unité, photos et facturation centralisée. Démo gratuite.",
  keywords:
    "portail gestionnaire fenêtres copropriété, logiciel suivi travaux fenêtres, app gestion condos entrepreneur fenêtres, bon de travail numérique fenêtres Québec, entrepreneur fenêtres plateforme suivi, gestion parc fenêtres copropriété, entrepreneur connecté fenêtres Québec, suivi fenêtres copropriété",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: PAGE_URL,
    title: "Portail Gestionnaire de Copropriétés pour Fenêtres | Vosthermos",
    description:
      "Plateforme numérique pour gestionnaires de condos : bons de travail numériques, suivi temps réel, photos et facturation centralisée.",
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
      "Bons de travail numériques, suivi temps réel, photos et facturation centralisée pour copropriétés.",
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
    a: "Oui, exports CSV et Excel disponibles en tout temps. Aucun vendor lock-in : vos données restent les vôtres.",
  },
  {
    q: "Quelles copropriétés sont éligibles ?",
    a: "Toute copropriété au Québec avec 5 unités et plus. Pas de taille maximum : on gère aussi bien un triplex qu'un parc de 500 fenêtres.",
  },
  {
    q: "Comment nos techniciens utilisent le portail sur le terrain ?",
    a: "Tablette fournie ou BYOD. Le portail web est adapté au mobile pour centraliser les photos, notes et rapports directement sur le terrain.",
  },
  {
    q: "Intégration avec nos logiciels existants (Condo Manager, etc.) ?",
    a: "Exports CSV et Excel disponibles pour conserver vos données et les remettre dans vos dossiers ou logiciels de gestion. Aucune API publique n'est annoncée pour le moment.",
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
      "Bons de travail numériques",
      "Dashboard multi-unités",
      "Historique complet par fenêtre",
      "Suivi des priorités d'entretien",
      "Suivi temps réel",
      "Facturation centralisée",
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
              Bons de travail numériques, suivi en temps réel et historique par unité. Tout votre parc
              de fenêtres centralisé. <strong>Une plateforme, zéro appel téléphonique.</strong>
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
              <a href="#features" className="pg-btn pg-btn-secondary pg-btn-lg">
                Voir les fonctionnalités
              </a>
            </div>

            {/* Dashboard mockup */}
            <div
              className="pg-mockup-frame"
              role="img"
              aria-label="Tableau de bord du portail gestionnaire"
            >
              <div className="pg-mockup-chrome">
                <span className="pg-dot r"></span>
                <span className="pg-dot y"></span>
                <span className="pg-dot g"></span>
                <div className="pg-mockup-url">
                  <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                    <path
                      d="M3 5V4a3 3 0 0 1 6 0v1m-7 0h8v6H2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                  portail.vosthermos.com / <b>demo</b>
                </div>
              </div>
              <div className="pg-dash">
                <aside className="pg-dash-side">
                  <div className="pg-dash-account">
                    <img
                      className="pg-avatar-photo"
                      src="/images/personas/gestionnaire-marie.jpg"
                      alt="Avatar gestionnaire"
                    />
                    <div>
                      <div className="pg-dash-owner">Marie L.</div>
                      <div className="pg-dash-org">Les Jardins Fleuris · 24 u.</div>
                    </div>
                  </div>
                  <nav className="pg-dash-nav">
                    <a className="active">
                      <i className="fas fa-chart-pie"></i> Tableau de bord
                    </a>
                    <a>
                      <i className="fas fa-building"></i> Parc de fenêtres{" "}
                      <span className="pg-badge">247</span>
                    </a>
                    <a>
                      <i className="fas fa-clipboard-list"></i> Bons de travail{" "}
                      <span className="pg-badge accent">3</span>
                    </a>
                    <a>
                      <i className="fas fa-calendar-check"></i> Priorités
                    </a>
                    <a>
                      <i className="fas fa-file-invoice-dollar"></i> Facturation
                    </a>
                    <a>
                      <i className="fas fa-user-friends"></i> Propriétaires
                    </a>
                  </nav>
                  <div className="pg-dash-footer-tag">
                    <span className="pg-status-dot"></span> Synchronisé · il y a 2 min
                  </div>
                </aside>
                <section className="pg-dash-main">
                  <header className="pg-dash-header">
                    <div>
                      <div className="pg-dash-crumb">
                        Copropriété · <b>Les Jardins Fleuris</b>
                      </div>
                      <h3 className="pg-dash-title">Tableau de bord</h3>
                    </div>
                    <div className="pg-dash-head-right">
                      <div className="pg-search">
                        <i className="fas fa-magnifying-glass"></i>
                        <span>Rechercher une fenêtre, unité, facture…</span>
                      </div>
                      <button className="pg-btn-icon" aria-label="Notifications">
                        <i className="fas fa-bell"></i>
                        <span className="pg-dot-badge"></span>
                      </button>
                    </div>
                  </header>
                  <div className="pg-kpis">
                    <div className="pg-kpi">
                      <div className="pg-kpi-label">Parc total</div>
                      <div className="pg-kpi-value">
                        247 <small>fenêtres</small>
                      </div>
                      <div className="pg-kpi-trend">
                        <i className="fas fa-arrow-trend-up"></i> 18 unités · 4 bâtiments
                      </div>
                    </div>
                    <div className="pg-kpi">
                      <div className="pg-kpi-label">Interventions — 30 j.</div>
                      <div className="pg-kpi-value">12</div>
                      <div className="pg-kpi-trend up">
                        <i className="fas fa-arrow-up"></i> 3 vs. période préc.
                      </div>
                    </div>
                    <div className="pg-kpi">
                      <div className="pg-kpi-label">Priorités entretien 2026</div>
                      <div className="pg-kpi-value">
                        18 400 <small>$</small>
                      </div>
                      <div className="pg-kpi-trend">
                        <i className="fas fa-chart-line"></i> 62 % utilisé
                      </div>
                      <div className="pg-kpi-bar">
                        <span style={{ width: "62%" }}></span>
                      </div>
                    </div>
                    <div className="pg-kpi">
                      <div className="pg-kpi-label">À confirmer</div>
                      <div className="pg-kpi-value accent">3</div>
                      <div className="pg-kpi-trend">
                        <i className="fas fa-circle-exclamation"></i> bons de travail
                      </div>
                    </div>
                  </div>
                  <div className="pg-dash-grid">
                    <div className="pg-panel">
                      <div className="pg-panel-head">
                        <h4>Bons de travail récents</h4>
                        <a className="pg-panel-link">Tout voir →</a>
                      </div>
                      <table className="pg-wo-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Unité</th>
                            <th>Intervention</th>
                            <th>Technicien</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>BT-2187</td>
                            <td>301 · cuisine</td>
                            <td>Remplacement scellé · fenêtre embuée</td>
                            <td>
                              <span className="pg-tech">MD</span> M. Dubé
                            </td>
                            <td>
                              <span className="pg-pill ok">Terminé</span>
                            </td>
                          </tr>
                          <tr>
                            <td>BT-2186</td>
                            <td>204 · chambre</td>
                            <td>Inspection annuelle (2 fenêtres)</td>
                            <td>
                              <span className="pg-tech">JP</span> J. Pelletier
                            </td>
                            <td>
                              <span className="pg-pill prog">En cours</span>
                            </td>
                          </tr>
                          <tr>
                            <td>BT-2185</td>
                            <td>102 · salon</td>
                            <td>Ajustement quincaillerie + joint</td>
                            <td>
                              <span className="pg-tech">MD</span> M. Dubé
                            </td>
                            <td>
                              <span className="pg-pill wait">À confirmer</span>
                            </td>
                          </tr>
                          <tr>
                            <td>BT-2184</td>
                            <td>415 · balcon</td>
                            <td>Remplacement cadre complet</td>
                            <td>
                              <span className="pg-tech">AL</span> A. Lavoie
                            </td>
                            <td>
                              <span className="pg-pill plan">Planifié 14 mai</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="pg-panel">
                      <div className="pg-panel-head">
                        <h4>Priorités d&apos;entretien · 2026</h4>
                        <span className="pg-panel-tag">Projection</span>
                      </div>
                      <div className="pg-plan-chart" aria-hidden="true">
                        <svg viewBox="0 0 300 140" preserveAspectRatio="none" width="100%" height="140">
                          <defs>
                            <linearGradient id="pgBarG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6fb7c7" />
                              <stop offset="100%" stopColor="#004d5e" />
                            </linearGradient>
                          </defs>
                          <g>
                            <line x1="0" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,.1)" />
                            <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,.06)" />
                            <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,.06)" />
                          </g>
                          <g fill="url(#pgBarG)">
                            <rect x="22" y="70" width="32" height="50" rx="3" />
                            <rect x="78" y="52" width="32" height="68" rx="3" />
                            <rect x="134" y="28" width="32" height="92" rx="3" />
                            <rect x="190" y="46" width="32" height="74" rx="3" />
                            <rect x="246" y="62" width="32" height="58" rx="3" />
                          </g>
                          <g fill="rgba(255,255,255,.55)" fontFamily="Montserrat" fontSize="8" textAnchor="middle">
                            <text x="38" y="134">2026</text>
                            <text x="94" y="134">2027</text>
                            <text x="150" y="134">2028</text>
                            <text x="206" y="134">2029</text>
                            <text x="262" y="134">2030</text>
                          </g>
                        </svg>
                      </div>
                      <div className="pg-plan-legend">
                        <div>
                          <b>18 400 $</b>
                          <span>2026 — courant</span>
                        </div>
                        <div>
                          <b>24 800 $</b>
                          <span>2028 — pic remplacements</span>
                        </div>
                        <div>
                          <b>89 400 $</b>
                          <span>Total 5 ans projeté</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Phone mockup (mobile only, replaces desktop mockup < 980px) */}
            <div className="pg-phone-mockup" aria-hidden="true">
              <div className="pg-phone">
                <div className="pg-phone-screen">
                  <div className="pg-phone-status">
                    <span>9 h 41</span>
                    <span className="pg-sig">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                  <div className="pg-phone-app-header">
                    <img
                      className="pg-avatar-photo"
                      src="/images/personas/gestionnaire-marie.jpg"
                      alt="Avatar gestionnaire"
                      style={{ width: 30, height: 30, borderRadius: 8 }}
                    />
                    <div>
                      <h4>Marie L.</h4>
                      <p>Les Jardins Fleuris</p>
                    </div>
                    <span className="pg-phone-burger">
                      <i className="fas fa-bars"></i>
                    </span>
                  </div>
                  <div className="pg-phone-kpi-main">
                    <div className="pg-phone-kpi-label">À confirmer</div>
                    <div className="pg-phone-kpi-value">3</div>
                    <div className="pg-phone-kpi-sub">bons de travail en attente</div>
                  </div>
                  <div className="pg-phone-list-head">
                    <span>Récents</span>
                    <span>Voir tout</span>
                  </div>
                  <div className="pg-phone-list">
                    <div className="pg-phone-item">
                      <b>Unité 301 · cuisine</b>
                      <div className="pg-phone-item-sub">
                        <span>Remplacement scellé</span>
                        <span>14 h 22</span>
                      </div>
                    </div>
                    <div className="pg-phone-item">
                      <b>Unité 204 · chambre</b>
                      <div className="pg-phone-item-sub">
                        <span>Inspection (2 fenêtres)</span>
                        <span>En cours</span>
                      </div>
                    </div>
                    <div className="pg-phone-item">
                      <b>Unité 102 · salon</b>
                      <div className="pg-phone-item-sub">
                        <span>Ajustement quincaillerie</span>
                        <span>À confirmer</span>
                      </div>
                    </div>
                  </div>
                  <button className="pg-phone-approve">
                    <i className="fas fa-check"></i> Confirmer 3 bons de travail
                  </button>
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

        {/* PROBLEM / SOLUTION */}
        <section className="pg-ps">
          <div className="pg-container">
            <h2 className="pg-section-title">
              Gérer 50, 100, 500 fenêtres ne devrait pas prendre <em>50 appels</em>.
            </h2>
            <p className="pg-section-lede">
              Le portail gestionnaire copropriété fenêtres remplace la paperasse, les vocaux sans
              suite et les tableurs éparpillés par une seule source de vérité.
            </p>
            <div className="pg-ps-grid">
              {[
                [
                  "Appels perdus, dossiers papier, historique flou d'une année à l'autre.",
                  "Dashboard centralisé avec historique complet par unité et par fenêtre.",
                ],
                [
                  "Impossible de prévoir les coûts d'entretien annuels devant le CA.",
                  "Priorités d'entretien, historique par unité et budget indicatif pour mieux planifier.",
                ],
                [
                  "Facturation éparpillée, approbations manuelles par courriels croisés.",
                  "Factures regroupées, export CSV, archivage automatique.",
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
                      <span className="pg-pill ok sm">Signé</span>
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-camera"></i> 4 photos avant / après
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-signature"></i> Signature technicien
                    </div>
                    <div className="pg-wo-mini-row">
                      <i className="fas fa-cloud-arrow-up"></i> Sync · 14 h 22
                    </div>
                  </div>
                </div>
                <h3>Bon de travail numérique</h3>
                <p>
                  Vos techniciens créent des bons de travail sur tablette Samsung Tab Active5.
                  Photos avant / après, signatures électroniques, synchronisation immédiate dans
                  votre portail.
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
                  Vue globale de votre parc : 10, 50 ou 500 fenêtres. Filtres par immeuble, étage,
                  type de fenêtre, âge, dernière intervention.
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
                      <b>2026 · Remplacement scellé</b>
                      <span>Garantie 10 ans</span>
                    </div>
                  </div>
                </div>
                <h3>Historique complet par unité</h3>
                <p>
                  Chaque fenêtre a son dossier : interventions passées, photos, pièces remplacées,
                  garanties, date de prochaine inspection.
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
                  Repérez les remplacements à prévoir, classez les priorités et gardez un budget
                  indicatif par immeuble selon l&apos;âge et l&apos;état de chaque fenêtre.
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
                <h3>Suivi temps réel</h3>
                <p>
                  Sachez quand le technicien arrive, progresse et termine. Le dossier reste clair
                  pour votre équipe et votre conseil d&apos;administration.
                </p>
              </article>
              <article className="pg-feat">
                <div className="pg-feat-visual pg-feat-visual-invoice">
                  <div className="pg-inv">
                    <div className="pg-inv-head">
                      <b>Facture consolidée · avril</b>
                      <span className="pg-pill ok sm">Approuvée</span>
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
                  Une seule facture mensuelle consolidée. Export CSV pour votre comptabilité et
                  archivage dans le dossier de la copropriété.
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
              App de gestion condos entrepreneur : un flux continu, traçable, sans courriel perdu.
            </p>
            <ol className="pg-timeline">
              {[
                ["Signalement", "Le gestionnaire saisit la demande avec photo et unité concernée."],
                ["Confirmation", "Vosthermos reçoit la demande et confirme la suite directement dans le dossier."],
                ["Intervention", "Le technicien reçoit le bon de travail sur sa tablette et intervient sur place."],
                ["Rapport", "Rapport signé et photos avant / après téléversés automatiquement."],
                ["Facture", "Facture générée, archivée et liée au bon de travail. Historique mis à jour."],
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
                      ["Bon de travail numérique", "yes", "no", "no"],
                      ["Historique par unité", "yes", "maybe", "no"],
                      ["Priorités d'entretien", "yes", "no", "no"],
                      ["Notifications automatiques", "yes", "no", "no"],
                      ["Factures consolidées", "yes", "maybe", "no"],
                      ["Photos avant / après archivées", "yes", "no", "no"],
                      ["Garanties trackées numériquement", "yes", "no", "no"],
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
                  coche toutes les cases pour les gestionnaires de copropriétés modernes.
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
                    <b>≥ 6</b> échanges téléphoniques
                  </li>
                  <li>
                    <b>21 j.</b> entre signalement et facture
                  </li>
                  <li>
                    <b>0</b> photo archivée
                  </li>
                </ul>
              </div>
              <div className="pg-story-col after">
                <div className="pg-story-label">Avec le portail</div>
                <p>
                  Mardi 14 h. Le gestionnaire saisit la fenêtre problématique dans le portail, photo
                  jointe. Vosthermos confirme la suite dans le dossier. Jeudi matin, le technicien
                  intervient et ajoute rapport et photos. Vendredi, la facture consolidée apparaît.
                  Le dossier de l&apos;unité 301 reste à jour.
                </p>
                <ul className="pg-story-metrics">
                  <li>
                    <b>0</b> appel téléphonique
                  </li>
                  <li>
                    <b>3 j.</b> du signalement à la facture
                  </li>
                  <li>
                    <b>4</b> photos archivées, garantie enregistrée
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
                réponse&nbsp;? Contactez Marie ou Jean-Pierre plus haut.
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
