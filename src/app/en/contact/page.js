"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuoteForm from "@/components/QuoteForm";
import { useCompany } from "@/lib/useCompany";
import "../../contact/contact.css";

const hours = [
  { day: "Monday", time: "CLOSED", closed: true },
  { day: "Tuesday", time: "10am - 5pm" },
  { day: "Wednesday", time: "10am - 5pm" },
  { day: "Thursday", time: "10am - 5pm" },
  { day: "Friday", time: "10am - 5pm" },
  { day: "Saturday", time: "10am - 1pm" },
  { day: "Sunday", time: "CLOSED", closed: true },
];

const SUBJECT_CONTEXT = {
  "portal-demo": {
    service: "autre",
    aliases: ["portail-demo"],
    eyebrow: "Manager portal demo",
    title: "See the manager portal in action",
    lede:
      "A guided demo to see how condo requests, interventions, photos and invoices can be centralized in one space.",
    defaultMessage:
      "Hello, I would like a demo of the Manager Portal for my condo association.",
    formTitle: "Book my demo",
    formSub: "Leave your details and we will suggest a 30-minute time slot.",
    submitLabel: "Request my demo",
    stats: [
      { value: "30 min", label: "guided demo" },
      { value: "24 h", label: "business response" },
      { value: "B2B", label: "built for condos" },
    ],
    benefits: [
      {
        icon: "fas fa-building",
        title: "View by property",
        text: "Clear follow-up for buildings, units, service requests and service history.",
      },
      {
        icon: "fas fa-camera",
        title: "Photos and proof",
        text: "Interventions, technician photos and work orders stay easy to find.",
      },
      {
        icon: "fas fa-file-invoice-dollar",
        title: "Centralized invoices",
        text: "Consult, print and track invoices with payment terms.",
      },
    ],
    demoSteps: [
      "Create a request for a unit or a building.",
      "Track status, notes and intervention photos.",
      "Find work orders and invoices in the same place.",
    ],
  },
  "heritage-restoration": {
    service: "portes-bois",
    aliases: ["restauration-patrimoine"],
    title: "Heritage restoration",
    lede: "Request an on-site evaluation for heritage wood windows and doors.",
    defaultMessage: "Hello, I would like an evaluation for a heritage restoration project.",
  },
  "opti-fenetre": {
    service: "opti-fenetre",
    title: "OPTI-FENETRE evaluation",
    lede:
      "Request an analysis of your windows to see whether restoration is more cost-effective than full replacement.",
    defaultMessage:
      "Hello, I would like an evaluation for the OPTI-FENETRE program. I can attach photos of my windows.",
    formTitle: "Request my evaluation",
    formSub: "Add photos or videos to speed up the diagnostic.",
    submitLabel: "Send my request",
  },
  condos: {
    service: "autre",
    aliases: ["copropriete"],
    title: "Condos and property managers",
    lede:
      "Let us talk about your window portfolio: multi-year plan, B2B portal and maintenance contract.",
    defaultMessage:
      "Hello, I am a property manager and would like to discuss a project.",
  },
  commercial: {
    service: "autre",
    title: "Commercial door and window service",
    lede:
      "Tell us about your building, storefront, rental property or commercial maintenance needs.",
    defaultMessage:
      "Hello, I would like information about commercial door and window repair services.",
  },
  careers: {
    service: "autre",
    title: "Careers at Vosthermos",
    lede:
      "Send us your details if you would like to join the Vosthermos team.",
    defaultMessage:
      "Hello, I would like to apply or learn more about career opportunities at Vosthermos.",
  },
};

const DEFAULT_CONTEXT = {
  title: "Tell us about your project",
  lede:
    "Free quote within 24 hours. RBQ-certified technicians across Greater Montreal and surrounding areas.",
  defaultMessage: "",
  service: "",
  formTitle: "Write to us",
  formSub: "We usually respond within one business day.",
  submitLabel: "Send message",
};

function getContext(subject) {
  if (!subject) return DEFAULT_CONTEXT;
  const direct = SUBJECT_CONTEXT[subject];
  if (direct) return { ...DEFAULT_CONTEXT, ...direct };
  const found = Object.values(SUBJECT_CONTEXT).find((item) => item.aliases?.includes(subject));
  return { ...DEFAULT_CONTEXT, ...(found || {}) };
}

function PortalPreview() {
  return (
    <div className="contact-demo-panel" aria-label="Manager portal preview">
      <div className="contact-demo-glow" aria-hidden="true"></div>
      <div className="contact-demo-window">
        <div className="contact-demo-topbar">
          <span></span>
          <span></span>
          <span></span>
          <strong>Manager portal</strong>
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
              <p>Les Cedres association</p>
              <span>12 active requests</span>
            </div>
            <div className="contact-demo-kpis">
              <div>
                <strong>8</strong>
                <span>to schedule</span>
              </div>
              <div>
                <strong>4</strong>
                <span>in progress</span>
              </div>
            </div>
            <div className="contact-demo-ticket">
              <i className="fas fa-temperature-half"></i>
              <div>
                <strong>Foggy sealed unit</strong>
                <span>Unit 304 - photos received</span>
              </div>
              <em>Priority</em>
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
        <span>Clear follow-up for boards, managers and suppliers.</span>
      </div>
    </div>
  );
}

function ContactEnContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || searchParams.get("sujet") || searchParams.get("context");
  const context = getContext(subject);
  const isPortalDemo = ["portal-demo", "portail-demo"].includes(subject);
  const company = useCompany();

  return (
    <div className={`contact-page${isPortalDemo ? " contact-page-demo" : ""}`}>
      <section className="contact-hero">
        <div className="contact-container contact-hero-grid">
          <div className="contact-hero-copy">
            <span className="contact-eyebrow">
              {context.eyebrow || `Contact - ${subject ? "Targeted request" : "Free quote"}`}
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
              <a href={`tel:${company.phoneTel}`} className="contact-btn contact-btn-primary">
                <i className="fas fa-phone"></i> {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="contact-btn contact-btn-outline">
                <i className="fas fa-envelope"></i> {company.email}
              </a>
            </div>
          </div>

          {isPortalDemo && <PortalPreview />}
        </div>
      </section>

      {context.benefits?.length > 0 && (
        <section className="contact-benefits" aria-label="Portal benefits">
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
            <div className="contact-card">
              <h2 className="contact-card-title">Contact details</h2>
              <ul className="contact-list">
                <li>
                  <i className="fas fa-phone contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Phone</span>
                    <a href={`tel:${company.phoneTel}`} className="contact-list-value">
                      {company.phone}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-envelope contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Email</span>
                    <a href={`mailto:${company.email}`} className="contact-list-value">
                      {company.email}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-location-dot contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Address</span>
                    <span className="contact-list-value">
                      {company.address}
                      <br />
                      {company.city}, {company.province} {company.postalCode}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="contact-card">
              <h2 className="contact-card-title">Business hours</h2>
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

            {context.demoSteps?.length > 0 && (
              <div className="contact-card">
                <h2 className="contact-card-title">Demo preview</h2>
                <ol className="contact-demo-steps">
                  {context.demoSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="contact-right">
            <div className="contact-card contact-form-card">
              <span className="contact-form-kicker">Contact</span>
              <h2 className="contact-card-title">{context.formTitle}</h2>
              <p className="contact-card-sub">{context.formSub}</p>

              <QuoteForm
                key={subject || "contact-en"}
                compact
                theme="light"
                lang="en"
                initialService={context.service}
                initialMessage={context.defaultMessage}
                sourceContext={subject ? `English contact form: ${subject}` : "English contact form"}
                submitLabel={context.submitLabel}
                trackingName="contact_en"
              />

              <p className="contact-disclaimer">
                By submitting this form, you agree to be contacted by Vosthermos about your request.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactEnPage() {
  return (
    <Suspense fallback={<div className="contact-page" />}>
      <ContactEnContent />
    </Suspense>
  );
}
