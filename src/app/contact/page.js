"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPhoneInput } from "@/lib/phone";
import useFormTracking from "@/lib/useFormTracking";
import { useCompany } from "@/lib/useCompany";
import "./contact.css";

const hours = [
  { day: "Lundi", time: "FERMÉ", closed: true },
  { day: "Mardi", time: "10h - 17h" },
  { day: "Mercredi", time: "10h - 17h" },
  { day: "Jeudi", time: "10h - 17h" },
  { day: "Vendredi", time: "10h - 17h" },
  { day: "Samedi", time: "10h - 13h" },
  { day: "Dimanche", time: "FERMÉ", closed: true },
];

// Contexte basé sur query string ?sujet=xxx
const SUBJECT_CONTEXT = {
  "portail-demo": {
    eyebrow: "Démo portail gestionnaire",
    title: "Voyez le portail gestionnaire en action",
    lede:
      "Une démo guidée pour voir comment centraliser les demandes, interventions, photos et factures de vos copropriétés dans un seul espace.",
    defaultMessage:
      "Bonjour, je souhaite une démo du Portail Gestionnaire pour ma copropriété.",
    formTitle: "Réserver ma démo",
    formSub:
      "Laissez vos coordonnées et on vous propose un créneau de 30 minutes.",
    submitLabel: "Demander ma démo",
    stats: [
      { value: "30 min", label: "démo guidée" },
      { value: "24 h", label: "retour ouvrable" },
      { value: "B2B", label: "pensé copropriété" },
    ],
    benefits: [
      {
        icon: "fas fa-building",
        title: "Vue par copropriété",
        text: "Suivi clair des immeubles, unités, demandes et historiques de service.",
      },
      {
        icon: "fas fa-camera",
        title: "Photos et preuves",
        text: "Les interventions, photos technicien et bons de travail restent faciles à retrouver.",
      },
      {
        icon: "fas fa-file-invoice-dollar",
        title: "Factures centralisées",
        text: "Consultation, impression et suivi des factures avec termes de paiement.",
      },
    ],
    demoSteps: [
      "Créer une demande pour une unité ou un immeuble.",
      "Suivre le statut, les notes et les photos d'intervention.",
      "Retrouver les bons de travail et les factures au même endroit.",
    ],
  },
  "restauration-patrimoine": {
    title: "Restauration patrimoniale",
    lede: "Demandez une évaluation sur place pour vos fenêtres en bois patrimoniales.",
    defaultMessage: "Bonjour, j'aimerais une évaluation pour un projet de restauration patrimoniale.",
  },
  "opti-fenetre": {
    title: "Évaluation OPTI-FENÊTRE",
    lede:
      "Demandez une analyse de vos fenêtres pour savoir si une remise à neuf est plus rentable qu'un remplacement complet.",
    defaultMessage:
      "Bonjour, j'aimerais une évaluation pour le programme OPTI-FENÊTRE. Je peux joindre des photos de mes fenêtres.",
    formTitle: "Demander mon évaluation",
    formSub: "Ajoutez des photos ou vidéos pour accélérer le diagnostic.",
    submitLabel: "Envoyer ma demande",
  },
  copropriete: {
    title: "Copropriétés et gestionnaires",
    lede: "Parlons de votre parc de fenêtres : plan pluriannuel, portail B2B, contrat d'entretien.",
    defaultMessage: "Bonjour, je suis gestionnaire de copropriété et j'aimerais discuter d'un projet.",
  },
};

const DEFAULT_CONTEXT = {
  title: "Parlons de votre projet",
  lede: "Soumission gratuite sous 24h. Techniciens certifiés RBQ partout au Grand Montréal et environs.",
  defaultMessage: "",
  formTitle: "Écrivez-nous",
  formSub: "Réponse sous 24 h ouvrables.",
  submitLabel: "Envoyer le message",
};

function PortalPreview() {
  return (
    <div className="contact-demo-panel" aria-label="Aperçu du portail gestionnaire">
      <div className="contact-demo-glow" aria-hidden="true"></div>
      <div className="contact-demo-window">
        <div className="contact-demo-topbar">
          <span></span>
          <span></span>
          <span></span>
          <strong>Portail gestionnaire</strong>
        </div>
        <div className="contact-demo-body">
          <div className="contact-demo-sidebar" aria-hidden="true">
            <span className="is-active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="contact-demo-content">
            <div className="contact-demo-heading">
              <p>Syndicat Les Cèdres</p>
              <span>12 demandes actives</span>
            </div>
            <div className="contact-demo-kpis">
              <div>
                <strong>8</strong>
                <span>à planifier</span>
              </div>
              <div>
                <strong>4</strong>
                <span>en cours</span>
              </div>
            </div>
            <div className="contact-demo-ticket">
              <i className="fas fa-temperature-half"></i>
              <div>
                <strong>Thermos embué</strong>
                <span>Unité 304 · photos reçues</span>
              </div>
              <em>Priorité</em>
            </div>
            <div className="contact-demo-timeline">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      <div className="contact-demo-note">
        <i className="fas fa-shield-halved"></i>
        <span>Suivi clair pour conseils d&apos;administration, gestionnaires et fournisseurs.</span>
      </div>
    </div>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();
  const sujet = searchParams.get("sujet");
  const context = { ...DEFAULT_CONTEXT, ...((sujet && SUBJECT_CONTEXT[sujet]) || {}) };
  const isPortalDemo = sujet === "portail-demo";
  const COMPANY_INFO = useCompany();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(context.defaultMessage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("contact");

  useEffect(() => {
    if (context.defaultMessage && !message) setMessage(context.defaultMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.defaultMessage]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Veuillez entrer un numéro de téléphone valide (10 chiffres).");
      return;
    }

    setSending(true);
    setError("");

    try {
      const chatRes = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name.trim(),
          clientPhone: cleanPhone,
          clientEmail: email.trim().toLowerCase(),
        }),
      });

      if (!chatRes.ok) {
        const err = await chatRes.json();
        throw new Error(err.error || "Erreur lors de la création de la conversation");
      }

      const { id } = await chatRes.json();
      const subjectTag = sujet ? `[${sujet}] ` : "";

      const msgRes = await fetch(`/api/public/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${subjectTag}[Formulaire contact]\n\n${message.trim()}`,
        }),
      });

      if (!msgRes.ok) throw new Error("Erreur lors de l'envoi du message");

      trackSubmit();
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`contact-page${isPortalDemo ? " contact-page-demo" : ""}`}>
      <section className="contact-hero">
        <div className="contact-container contact-hero-grid">
          <div className="contact-hero-copy">
            <span className="contact-eyebrow">
              {context.eyebrow || `Contact · ${sujet ? "Demande ciblée" : "Soumission gratuite"}`}
            </span>
            <h1 className="contact-h1">{context.title}</h1>
            <p className="contact-lede">{context.lede}</p>

            {context.stats?.length > 0 && (
              <div className="contact-metrics">
                {context.stats.map((stat) => (
                  <div className="contact-metric" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="contact-hero-ctas">
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="contact-btn contact-btn-primary">
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
              <a href={`mailto:${COMPANY_INFO.email}`} className="contact-btn contact-btn-outline">
                <i className="fas fa-envelope"></i> {COMPANY_INFO.email}
              </a>
            </div>
          </div>

          {isPortalDemo && <PortalPreview />}
        </div>
      </section>

      {context.benefits?.length > 0 && (
        <section className="contact-benefits" aria-label="Avantages du portail">
          <div className="contact-container contact-benefit-grid">
            {context.benefits.map((benefit) => (
              <article className="contact-benefit-card" key={benefit.title}>
                <i className={benefit.icon}></i>
                <h2>{benefit.title}</h2>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="contact-main">
        <div className="contact-container contact-grid">
          <div className="contact-left">
            {isPortalDemo && (
              <div className="contact-card contact-agenda-card">
                <span className="contact-card-kicker">Démo personnalisée</span>
                <h2 className="contact-card-title">Ce que vous verrez</h2>
                <ol className="contact-agenda">
                  {context.demoSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="contact-card">
              <h2 className="contact-card-title">Nos coordonnées</h2>
              <ul className="contact-list">
                <li>
                  <i className="fas fa-phone contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Téléphone</span>
                    <a href={`tel:${COMPANY_INFO.phoneTel}`} className="contact-list-value">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-envelope contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Courriel</span>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="contact-list-value">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-location-dot contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Adresse</span>
                    <span className="contact-list-value">
                      {COMPANY_INFO.address}
                      <br />
                      {COMPANY_INFO.cityShort}, {COMPANY_INFO.province} {COMPANY_INFO.postalCode}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="contact-card">
              <h2 className="contact-card-title">Heures d&apos;ouverture</h2>
              <ul className="contact-hours">
                {hours.map((h) => (
                  <li key={h.day}>
                    <span className="contact-hours-day">{h.day}</span>
                    <span className={h.closed ? "contact-hours-closed" : "contact-hours-time"}>
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-card contact-form-card">
              <span className="contact-form-kicker">{isPortalDemo ? "Portail gestionnaire" : "Contact"}</span>
              <h2 className="contact-card-title">{context.formTitle}</h2>
              <p className="contact-card-sub">{context.formSub}</p>

              {isPortalDemo && (
                <div className="contact-subject-pill">
                  <i className="fas fa-calendar-check"></i>
                  Sujet prérempli: démo du portail gestionnaire
                </div>
              )}

              {sent ? (
                <div className="contact-sent">
                  <div className="contact-sent-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <h3>Message envoyé</h3>
                  <p>
                    Merci {name.split(" ")[0] || ""}&thinsp;! Nous vous répondons dans les plus
                    brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-row">
                    <div className="contact-field">
                      <label htmlFor="name">Nom complet</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => trackFieldFocus("name")}
                        onBlur={() => trackFieldValue("name", name)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="phone">Téléphone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                        onFocus={() => trackFieldFocus("phone")}
                        onBlur={() => trackFieldValue("phone", phone)}
                        required
                        placeholder="514-555-1234"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">Courriel</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => trackFieldFocus("email")}
                      onBlur={() => trackFieldValue("email", email)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => trackFieldFocus("message")}
                      onBlur={() => trackFieldValue("message", message)}
                      rows={5}
                      required
                      placeholder="Décrivez votre projet en quelques mots..."
                    />
                  </div>

                  {error && <p className="contact-error">{error}</p>}

                  <button type="submit" disabled={sending} className="contact-btn contact-btn-primary contact-btn-full">
                    {sending ? "Envoi en cours..." : context.submitLabel}
                  </button>

                  <p className="contact-disclaimer">
                    En soumettant, vous acceptez d&apos;être contacté par Vosthermos au sujet de
                    votre demande.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="contact-loading">Chargement...</div>}>
      <ContactContent />
    </Suspense>
  );
}
