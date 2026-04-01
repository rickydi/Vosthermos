import Link from "next/link";

export const metadata = {
  title: "professional guaranteed service | Vosthermos",
  description:
    "Vosthermos offers a professional guaranteed service on sealed glass replacements, 5 years on workmanship and a transferable warranty to the next owner. Simple and fast claim process.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/garantie",
    languages: {
      fr: "https://www.vosthermos.com/garantie",
      en: "https://www.vosthermos.com/en/garantie",
    },
  },
  openGraph: {
    title: "professional guaranteed service | Vosthermos",
    description:
      "professional guaranteed service on sealed glass, 5-year workmanship, transferable. Peace of mind guaranteed.",
    url: "https://www.vosthermos.com/en/garantie",
    type: "website",
    locale: "en_CA",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
  },
};

const guaranteeCards = [
  {
    duration: "professional warranty",
    label: "Sealed glass warranty",
    description:
      "Our sealed glass units are guaranteed against seal failure, condensation between panes and loss of energy efficiency.",
    icon: "fa-snowflake",
  },
  {
    duration: "5 years",
    label: "Workmanship warranty",
    description:
      "All our installation and repair work is covered by a comprehensive workmanship warranty.",
    icon: "fa-tools",
  },
  {
    duration: "Transferable",
    label: "Warranty transferable to next owner",
    description:
      "When selling your property, our warranty is automatically transferred to the new owner at no cost.",
    icon: "fa-exchange-alt",
  },
];

const coveredItems = [
  {
    title: "Sealed glass replacement",
    items: [
      "Seal failure between panes",
      "Condensation between panels",
      "Loss of thermal efficiency",
    ],
    icon: "fa-snowflake",
  },
  {
    title: "Hardware installed by our team",
    items: [
      "Handles and locking mechanisms",
      "Hinges",
      "Rolling systems and tracks",
    ],
    icon: "fa-cogs",
  },
  {
    title: "Custom screen doors",
    items: [
      "Aluminum frame and structure",
      "Mesh and screening",
      "Mounting systems",
    ],
    icon: "fa-border-all",
  },
  {
    title: "Wooden door repairs",
    items: [
      "Restoration work performed",
      "Parts replaced during repair",
      "Finishing and sealing",
    ],
    icon: "fa-door-open",
  },
];

const claimSteps = [
  {
    num: "1",
    title: "Contact us",
    description:
      "Call us at 514-825-8411 or fill out our online contact form. Describe the problem and have your invoice number handy.",
    icon: "fa-phone-alt",
  },
  {
    num: "2",
    title: "Assessment",
    description:
      "Our team assesses the situation, whether by photo or by visiting your home. We determine if the problem is covered by warranty.",
    icon: "fa-search",
  },
  {
    num: "3",
    title: "Replacement / Repair",
    description:
      "If the problem is covered, we proceed with the replacement or repair at no additional cost. Fast, simple and hassle-free.",
    icon: "fa-check-circle",
  },
];

const faqItems = [
  {
    question: "What exactly does the warranty cover?",
    answer:
      "Our warranty covers manufacturing and installation defects on sealed glass (professional warranty), workmanship (5 years), hardware installed by our team, custom screen doors and wooden door repairs. It does not cover damage caused by misuse, accidents or natural disasters.",
  },
  {
    question: "How do I make a claim?",
    answer:
      "Contact us by phone at 514-825-8411 or via our online form. Provide your invoice number and a description of the problem. Our team will respond within 24 to 48 business hours to schedule an assessment.",
  },
  {
    question: "Is the warranty transferable?",
    answer:
      "Yes, our warranty is fully transferable to the next owner of your home. When selling, simply pass your original invoice to the new owner. No additional steps required.",
  },
  {
    question: "What are the processing times?",
    answer:
      "We commit to assessing your claim within 48 business hours of your request. Once the claim is approved, replacement or repair work is typically completed within 5 to 10 business days, depending on parts availability.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferWarranty",
  name: "Vosthermos Warranty",
  description:
    "professional guaranteed service on sealed glass replacement, 5 years on workmanship, transferable to the next property owner.",
  url: "https://www.vosthermos.com/en/garantie",
  warrantyScope: {
    "@type": "WarrantyScope",
    name: "Sealed glass replacement, hardware, screen doors, wooden door repair",
  },
  seller: {
    "@type": "LocalBusiness",
    name: "Vosthermos",
    url: "https://www.vosthermos.com",
    telephone: "+15148258411",
  },
};

export default function WarrantyPageEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-white">Warranty</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-tag">Our commitment</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mt-2">
              Our <span className="text-[var(--color-red)]">warranty</span>
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Your peace of mind is our priority. We offer one of the best
              warranties in the industry on all our door and window repair and
              replacement work.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee Cards */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-28">
            {guaranteeCards.map((card) => (
              <div
                key={card.duration}
                className="bg-white rounded-xl p-8 shadow-lg border border-[var(--color-border)] text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${card.icon} text-2xl text-[var(--color-teal)]`}></i>
                </div>
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  {card.duration}
                </div>
                <h2 className="font-bold text-lg mb-3">{card.label}</h2>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Coverage</span>
            <h2 className="text-3xl font-extrabold">
              What our warranty{" "}
              <span className="text-[var(--color-red)]">covers</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Our warranty is comprehensive and covers all work performed by our
              team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coveredItems.map((item) => (
              <div key={item.title} className="bg-[var(--color-background)] rounded-xl p-8 border border-[var(--color-border)]">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${item.icon} text-lg text-[var(--color-red)]`}></i>
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                </div>
                <ul className="space-y-3">
                  {item.items.map((detail) => (
                    <li key={detail} className="flex items-start gap-3 text-[var(--color-muted)] text-sm">
                      <i className="fas fa-check text-green-500 mt-0.5 flex-shrink-0"></i>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Process</span>
            <h2 className="text-3xl font-extrabold text-white">
              How to make a{" "}
              <span className="text-[var(--color-red)]">claim</span>
            </h2>
            <p className="text-white/60 mt-3 max-w-2xl mx-auto">
              A simple three-step process to use your warranty.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {claimSteps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comparison</span>
            <h2 className="text-3xl font-extrabold">
              Vosthermos vs{" "}
              <span className="text-[var(--color-red)]">industry average</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Our warranty far exceeds the industry average to offer you
              maximum protection.
            </p>
          </div>
          <div className="max-w-[800px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--color-teal-dark)]">
                    <th className="text-left text-white font-bold px-6 py-4 text-sm">Criteria</th>
                    <th className="text-center text-white font-bold px-6 py-4 text-sm">
                      <span className="text-[var(--color-red-light)]">Vosthermos</span>
                    </th>
                    <th className="text-center text-white/70 font-bold px-6 py-4 text-sm">Industry average</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--color-border)]">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-snowflake text-[var(--color-teal)] mr-2 text-xs"></i>
                      Sealed glass
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">professional warranty</span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">5-professional warranty</td>
                  </tr>
                  <tr className="border-t border-[var(--color-border)] bg-[var(--color-background)]/50">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-tools text-[var(--color-teal)] mr-2 text-xs"></i>
                      Workmanship
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">5 years</span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">1-2 years</td>
                  </tr>
                  <tr className="border-t border-[var(--color-border)]">
                    <td className="px-6 py-4 font-medium text-sm">
                      <i className="fas fa-exchange-alt text-[var(--color-teal)] mr-2 text-xs"></i>
                      Transferable
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">Yes</span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-muted)] text-sm">Rarely</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">FAQ</span>
            <h2 className="text-3xl font-extrabold">
              Frequently{" "}
              <span className="text-[var(--color-red)]">asked questions</span>
            </h2>
          </div>
          <div className="max-w-[800px] mx-auto space-y-6">
            {faqItems.map((item) => (
              <div key={item.question} className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-lg flex items-start gap-3">
                  <i className="fas fa-question-circle text-[var(--color-red)] mt-1 flex-shrink-0"></i>
                  {item.question}
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed mt-3 ml-8">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Protect your investment with our warranty
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Get a free quote and discover how our professional guaranteed service protects you.
            Fast and professional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Request a quote
            </Link>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
