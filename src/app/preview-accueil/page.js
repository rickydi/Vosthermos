import Image from "next/image";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";
import "./preview-accueil.css";

export const metadata = {
  title: "Preview accueil Vosthermos",
  robots: "noindex, nofollow",
};

const proofItems = [
  { value: "15+", label: "ans d'expérience" },
  { value: "740+", label: "pièces en stock" },
  { value: "10 ans", label: "garantie thermos" },
  { value: "24 h", label: "réponse ouvrable" },
];

const services = [
  {
    icon: "fas fa-temperature-half",
    title: "Vitres thermos",
    text: "Remplacement de thermos embués, cassés ou inefficaces avec verre performant.",
    image: "/images/vitre-thermos/detail-1.jpg",
  },
  {
    icon: "fas fa-screwdriver-wrench",
    title: "Quincaillerie",
    text: "Poignées, roulettes, serrures, mécanismes et ajustements de portes-patio.",
    image: "/images/quincaillerie/detail-roulette-porte-patio.jpg",
  },
  {
    icon: "fas fa-door-open",
    title: "Portes et fenêtres",
    text: "Réparation, coupe-froid, calfeutrage, moustiquaires et restauration bois.",
    image: "/images/portes-bois/detail-1.jpg",
  },
];

const problems = [
  "Buée entre les vitres",
  "Porte-patio difficile à glisser",
  "Poignée ou serrure brisée",
  "Courants d'air autour des fenêtres",
  "Moustiquaire déchirée",
  "Cadre de bois abîmé",
];

const gallery = [
  {
    before: "/images/realisations/thermos-remplacement-before.jpg",
    after: "/images/realisations/thermos-remplacement-after.jpg",
    title: "Thermos remplacé",
  },
  {
    before: "/images/realisations/fenetre-restauration-before.jpg",
    after: "/images/realisations/fenetre-restauration-after.jpg",
    title: "Fenêtre restaurée",
  },
  {
    before: "/images/realisations/quincaillerie-ajustement-before.jpg",
    after: "/images/realisations/quincaillerie-ajustement-after.jpg",
    title: "Quincaillerie ajustée",
  },
];

const products = [
  { title: "Roulettes porte-patio", count: "120+ modèles", icon: "fas fa-circle-dot" },
  { title: "Poignées et serrures", count: "180+ pièces", icon: "fas fa-lock" },
  { title: "Coupe-froid", count: "Sur mesure", icon: "fas fa-wind" },
  { title: "Moustiquaires", count: "Réparation rapide", icon: "fas fa-border-all" },
];

const process = [
  {
    title: "Envoyez votre demande",
    text: "Décrivez le problème, ajoutez quelques photos si possible et indiquez votre secteur.",
  },
  {
    title: "On confirme la solution",
    text: "On valide si une réparation suffit ou si un remplacement de thermos est nécessaire.",
  },
  {
    title: "Intervention efficace",
    text: "Le technicien arrive avec les pièces adaptées et laisse un travail propre.",
  },
];

const reviews = [
  {
    name: "Julie M.",
    text: "Service rapide, explications claires et fenêtre réparée sans devoir tout remplacer.",
  },
  {
    name: "Syndicat de copropriété",
    text: "Très pratique pour les suivis d'unités et les interventions récurrentes.",
  },
  {
    name: "Marc L.",
    text: "Ils ont trouvé la bonne pièce de porte-patio et réglé le problème sur place.",
  },
];

const sectors = [
  "Montréal",
  "Laval",
  "Longueuil",
  "Brossard",
  "Saint-Hyacinthe",
  "Granby",
  "Terrebonne",
  "Repentigny",
  "Chambly",
  "Boucherville",
];

const faqs = [
  {
    q: "Est-ce qu'on doit remplacer toute la fenêtre?",
    a: "Pas toujours. Souvent, remplacer le thermos, la quincaillerie ou le coupe-froid suffit.",
  },
  {
    q: "Le formulaire est-il actif sur cette preview?",
    a: "Non. Cette route sert seulement à valider le design avant d'intégrer la vraie logique.",
  },
  {
    q: "Peut-on mettre les techniciens détourés dans le hero?",
    a: "Oui. Il suffit d'ajouter les PNG transparents dans public/images et de remplacer le visuel temporaire.",
  },
];

function StaticQuoteForm() {
  return (
    <div className="hp-quote-card" aria-label="Aperçu du formulaire de soumission">
      <div className="hp-quote-head">
        <span>Soumission gratuite</span>
        <strong>Réponse rapide</strong>
      </div>
      <div className="hp-form">
        <label>
          Nom complet
          <input readOnly placeholder="Votre nom" />
        </label>
        <label>
          Téléphone
          <input readOnly placeholder="514-555-1234" />
        </label>
        <label>
          Email
          <input readOnly placeholder="votre@email.com" />
        </label>
        <label>
          Service recherché
          <select disabled defaultValue="">
            <option value="">Thermos, quincaillerie, porte-patio...</option>
          </select>
        </label>
        <label>
          Message
          <textarea readOnly placeholder="Décrivez le problème en quelques mots" rows={4} />
        </label>
        <div className="hp-file-preview">
          <i className="fas fa-paperclip"></i>
          Joindre photos ou vidéos
        </div>
        <button type="button">Obtenir ma soumission</button>
        <p>Preview seulement: ce formulaire n&apos;envoie aucune donnée.</p>
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title, text }) {
  return (
    <div className="hp-section-head">
      <span>{kicker}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default function PreviewAccueil() {
  return (
    <main className="home-preview">
      <div className="hp-preview-bar">
        Preview design non interactive. L&apos;accueil réel n&apos;est pas remplacé.
      </div>

      <section className="hp-hero">
        <div className="hp-shell hp-hero-grid">
          <div className="hp-copy">
            <span className="hp-kicker">
              <i className="fas fa-circle"></i> Réparation portes et fenêtres
            </span>
            <h1>
              Réparez avant de remplacer.
            </h1>
            <p className="hp-lede">
              Vosthermos remplace les vitres thermos embuées, répare la quincaillerie
              et prolonge la vie de vos portes et fenêtres partout dans le Grand Montréal.
            </p>
            <div className="hp-actions">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <Link href="/boutique" className="hp-btn hp-btn-ghost">
                Voir la boutique
              </Link>
            </div>
            <div className="hp-proof-row">
              {proofItems.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hp-hero-conversion">
            {/* TEMP: bulle RBQ désactivée
            <div className="hp-form-proof">
              <i className="fas fa-shield-halved"></i>
              <span>RBQ 5820-0684-01 · Soumission gratuite</span>
            </div>
            */}
            <StaticQuoteForm />
          </div>
        </div>
      </section>

      <section className="hp-manager-strip">
        <div className="hp-shell hp-manager-inner">
          <div>
            <span>Nouveau</span>
            <strong>Portail gestionnaires de copropriétés</strong>
            <p>Bons de travail numériques, photos, factures et suivi par immeuble.</p>
          </div>
          <Link href="/portail-gestionnaire">Voir le portail</Link>
        </div>
      </section>

      <section className="hp-section hp-services">
        <div className="hp-shell">
          <SectionHeader
            kicker="Services clés"
            title="Les réparations les plus demandées, sans refaire tout le projet."
            text="La page garde le côté SEO/commercial actuel, mais avec une hiérarchie plus simple et plus premium."
          />
          <div className="hp-service-grid">
            {services.map((service) => (
              <article className="hp-service-card" key={service.title}>
                <div className="hp-service-image">
                  <Image src={service.image} alt="" fill sizes="33vw" />
                </div>
                <div className="hp-service-body">
                  <i className={service.icon}></i>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <span>En savoir plus</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-problems">
        <div className="hp-shell hp-problem-grid">
          <div>
            <span className="hp-red-tag">Diagnostic rapide</span>
            <h2>Vos clients se reconnaissent tout de suite dans le problème.</h2>
            <p>
              Au lieu d&apos;empiler trop d&apos;informations, la page guide vers les problèmes
              concrets qui créent la demande.
            </p>
          </div>
          <div className="hp-problem-list">
            {problems.map((problem) => (
              <div key={problem}>
                <i className="fas fa-check"></i>
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-gallery">
        <div className="hp-shell">
          <SectionHeader
            kicker="Réalisations"
            title="Un aperçu visuel avant/après plus haut dans la page."
            text="Ça rassure vite et ça rend l'accueil moins catalogue."
          />
          <div className="hp-gallery-grid">
            {gallery.map((item) => (
              <article className="hp-gallery-card" key={item.title}>
                <div className="hp-before-after">
                  <div>
                    <Image src={item.before} alt={`${item.title} avant`} fill sizes="30vw" />
                    <span>Avant</span>
                  </div>
                  <div>
                    <Image src={item.after} alt={`${item.title} après`} fill sizes="30vw" />
                    <span>Après</span>
                  </div>
                </div>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-shop">
        <div className="hp-shell hp-shop-grid">
          <div>
            <span className="hp-red-tag">Boutique intégrée</span>
            <h2>La boutique reste visible, mais elle ne prend pas toute la première impression.</h2>
            <p>
              L&apos;idée: convertir d&apos;abord en soumission, puis montrer les pièces disponibles
              pour renforcer l&apos;expertise.
            </p>
            <Link href="/boutique" className="hp-btn hp-btn-dark">Parcourir la boutique</Link>
          </div>
          <div className="hp-product-grid">
            {products.map((product) => (
              <article key={product.title}>
                <i className={product.icon}></i>
                <strong>{product.title}</strong>
                <span>{product.count}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-process">
        <div className="hp-shell">
          <SectionHeader
            kicker="Comment ça marche"
            title="Un processus clair en 3 étapes."
          />
          <div className="hp-step-grid">
            {process.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-reviews">
        <div className="hp-shell">
          <SectionHeader
            kicker="Confiance"
            title="Des avis plus courts, plus visibles, plus faciles à scanner."
          />
          <div className="hp-review-grid">
            {reviews.map((review) => (
              <article key={review.name}>
                <div className="hp-stars">★★★★★</div>
                <p>“{review.text}”</p>
                <strong>{review.name}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-sectors">
        <div className="hp-shell">
          <SectionHeader
            kicker="Secteurs desservis"
            title="Couverture locale claire pour le SEO et la conversion."
          />
          <div className="hp-sector-grid">
            {sectors.map((city) => (
              <span key={city}>
                <i className="fas fa-location-dot"></i> {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-faq">
        <div className="hp-shell hp-faq-grid">
          <div>
            <span className="hp-red-tag">FAQ</span>
            <h2>Répondre aux objections sans alourdir le haut de page.</h2>
          </div>
          <div className="hp-faq-list">
            {faqs.map((faq) => (
              <article key={faq.q}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-final-cta">
        <div className="hp-shell">
          <h2>Une version finale garderait ton formulaire en haut.</h2>
          <p>
            Cette preview montre une direction complète: plus premium, plus claire,
            mais toujours pensée pour générer des appels et des soumissions.
          </p>
          <div className="hp-actions hp-actions-center">
            <a href={`tel:${COMPANY_INFO.phoneTel}`} className="hp-btn hp-btn-primary">
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link href="/contact" className="hp-btn hp-btn-ghost-light">
              Page contact actuelle
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
