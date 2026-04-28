import Link from "next/link";
import DiagnosticToolEn from "@/components/DiagnosticToolEn";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Free Diagnostic - Is Your Sealed Glass Unit Failing? | Vosthermos",
  description:
    "Free diagnostic tool to evaluate your sealed glass units. Answer 6 questions and get an instant diagnostic with price estimate. Service in Montreal and the South Shore.",
  keywords:
    "sealed glass diagnostic, foggy window what to do, how to know if sealed unit failed, broken thermal window, window thermos test",
  alternates: {
    canonical: "https://www.vosthermos.com/en/diagnostic",
    languages: {
      "fr-CA": "https://www.vosthermos.com/diagnostic",
      "en-CA": "https://www.vosthermos.com/en/diagnostic",
    },
  },
  openGraph: {
    title: "Free Diagnostic - Is Your Sealed Glass Unit Failing? | Vosthermos",
    description:
      "Answer 6 questions and get an instant diagnostic with a price estimate for your sealed glass units.",
    url: "https://www.vosthermos.com/en/diagnostic",
    siteName: "Vosthermos",
    locale: "en_CA",
    type: "website",
  },
};

const howToSteps = [
  {
    icon: "fas fa-mouse-pointer",
    title: "Answer 6 questions",
    description:
      "Simple questions about your windows: fog, age, drafts, deposits and operation.",
  },
  {
    icon: "fas fa-chart-bar",
    title: "Get your diagnostic",
    description:
      "The tool analyzes your answers and estimates the wear level of your sealed glass units.",
  },
  {
    icon: "fas fa-file-invoice-dollar",
    title: "Receive an estimate",
    description:
      "Price estimate, potential energy savings and personalized recommendations for your windows.",
  },
];

const faqItems = [
  {
    question: "How do I know if my sealed glass unit is finished?",
    answer:
      "The main signs are permanent fog between panes, white deposits, drafts even when the window is closed, and a noticeable increase in heating costs. This free tool helps you evaluate the condition in about two minutes.",
  },
  {
    question: "Is the online diagnostic reliable?",
    answer:
      "The online diagnostic is based on the same criteria our technicians use during an in-home inspection. It gives a strong first indication. For a final evaluation, we recommend a free inspection or a photo-based quote.",
  },
  {
    question: "How much does sealed glass replacement cost after the diagnostic?",
    answer:
      "Sealed glass replacement starts at $150 per installed unit, including measuring, custom manufacturing and professional installation. The final cost depends on size and glass type.",
  },
  {
    question: "Can a foggy sealed unit be repaired instead of replaced?",
    answer:
      "Defogging can be a temporary option, but it does not restore the full energy performance of the unit. In most cases, replacing the sealed unit is the most economical long-term solution.",
  },
];

export default function DiagnosticPageEn() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to diagnose a failing sealed glass unit",
    description:
      "A 6-step diagnostic tool to evaluate your sealed glass units and determine whether replacement is needed.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        name: "Check for fog",
        text: "Look for fog between the two panes of your sealed glass unit.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Evaluate window age",
        text: "Estimate the age of the windows to understand their remaining lifespan.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Test for drafts",
        text: "Check whether you feel cold air near the closed window.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Look for deposits",
        text: "Check whether white deposits or stains are visible between the panes.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Test the mechanism",
        text: "Check whether the window opens and closes easily.",
        position: 5,
      },
      {
        "@type": "HowToStep",
        name: "Count affected windows",
        text: "Count how many windows have these symptoms to get a global estimate.",
        position: 6,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const interactionJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free sealed glass diagnostic - Vosthermos",
    description:
      "Interactive diagnostic tool to evaluate sealed glass units in 6 questions.",
    url: "https://www.vosthermos.com/en/diagnostic",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: COMPANY_INFO.phoneTel,
      url: "https://www.vosthermos.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(interactionJsonLd) }}
      />

      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Diagnostic</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                <i className="fas fa-stethoscope mr-1"></i> Free 2-minute tool
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                Is your sealed glass unit{" "}
                <span className="text-[var(--color-red)]">finished?</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Answer 6 simple questions and get an instant diagnostic: wear level,
                estimated price, potential energy savings and the right next step.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
                >
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
                <Link
                  href="#diagnostic-tool"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
                >
                  <i className="fas fa-play"></i> Start diagnostic
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <strong className="block text-3xl font-extrabold text-[var(--color-red-light)]">2 min</strong>
                  <span className="text-white/50 text-xs uppercase tracking-wider">duration</span>
                </div>
                <div>
                  <strong className="block text-3xl font-extrabold text-[var(--color-red-light)]">$150+</strong>
                  <span className="text-white/50 text-xs uppercase tracking-wider">starting price</span>
                </div>
                <div>
                  <strong className="block text-3xl font-extrabold text-[var(--color-red-light)]">6</strong>
                  <span className="text-white/50 text-xs uppercase tracking-wider">questions</span>
                </div>
                <div>
                  <strong className="block text-3xl font-extrabold text-[var(--color-red-light)]">Free</strong>
                  <span className="text-white/50 text-xs uppercase tracking-wider">inspection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-tag">How it works</span>
            <h2 className="text-3xl font-extrabold mt-2">
              A simple diagnostic in{" "}
              <span className="text-[var(--color-red)]">3 steps</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howToSteps.map((step, index) => (
              <div key={step.title} className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5">
                  <i className={`${step.icon} text-xl text-[var(--color-teal)]`}></i>
                </div>
                <span className="text-[var(--color-red)] font-extrabold text-sm">0{index + 1}</span>
                <h3 className="font-bold text-lg mt-2 mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diagnostic-tool" className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-tag">Online diagnostic</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              Start the diagnostic
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Your answers stay on this page. No account is required.
            </p>
          </div>
          <DiagnosticToolEn />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-tag">FAQ</span>
            <h2 className="text-3xl font-extrabold mt-2">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="group bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-bold text-gray-900">
                  {item.question}
                  <i className="fas fa-chevron-down text-[var(--color-muted)] group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-6 pb-6 text-[var(--color-muted)] leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Prefer a technician&apos;s opinion?
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Send photos or call us. We will confirm whether repair or replacement is the right option.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-colors"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/en/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-colors"
            >
              Send photos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
