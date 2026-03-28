import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata = {
  title: "FAQ - Vosthermos | Door and Window Repair",
  description:
    "Find answers to your questions about our door and window repair services, pricing, warranties, timelines and our online store. Free quote 514-825-8411.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/faq",
    languages: {
      fr: "https://www.vosthermos.com/faq",
      en: "https://www.vosthermos.com/en/faq",
    },
  },
  openGraph: {
    title: "FAQ - Vosthermos | Door and Window Repair",
    description:
      "Answers to all your questions about door and window repair, pricing, warranties and our online store.",
    url: "https://www.vosthermos.com/en/faq",
    type: "website",
    locale: "en_CA",
  },
};

const faqCategories = [
  {
    id: "services",
    title: "Services",
    icon: "fa-wrench",
    items: [
      {
        question: "What services do you offer?",
        answer:
          "Vosthermos offers a complete range of services for your doors and windows: sealed glass unit replacement, wooden door repair and restoration, custom screen door manufacturing, hardware replacement (handles, locks, rollers, etc.) and defogging. We serve the greater Montreal area within a 100km radius of Saint-Francois-Xavier. All our work is performed by experienced technicians with over 15 years of expertise.",
      },
      {
        question: "What is the difference between defogging and sealed glass replacement?",
        answer:
          "Defogging involves removing moisture trapped between the two panes of a sealed unit without replacing the unit itself. It's a temporary and less expensive solution, but doesn't fully restore the glass's insulating properties. Sealed glass replacement involves installing a brand new sealed unit that provides optimal thermal insulation and is covered by our 10-year warranty. We generally recommend replacement for a lasting result and better energy efficiency.",
      },
      {
        question: "Do you repair all types of windows?",
        answer:
          "Yes, our team works on all types of windows: sliding, casement, awning, fixed, single-hung and basement windows. We work with all common materials, including PVC, aluminum, wood and hybrid windows. Whether it's for a sealed glass replacement, hardware change or frame repair, we have the expertise and parts needed to bring your windows back to life.",
      },
      {
        question: "Do you offer service for commercial doors?",
        answer:
          "Yes, we offer repair and parts replacement services for commercial doors and windows. This includes commercial entry doors, door closers, specialized hardware and large-dimension sealed glass replacement. We understand the importance of minimizing disruptions for your business and plan our work accordingly. Contact us at 514-825-8411 to discuss your specific needs.",
      },
      {
        question: "Do you make custom screen doors for all dimensions?",
        answer:
          "Absolutely! We manufacture custom screen doors for all dimensions, whether for standard windows or non-conventional formats. We offer several types of screen doors: fixed, sliding, retractable and for patio doors. The material (fiberglass, aluminum, pet-resistant screen) is adapted to your needs. You can also purchase the necessary materials in our online store to install them yourself.",
      },
      {
        question: "Can you replace hardware from any manufacturer?",
        answer:
          "We work with an extensive database of compatible parts covering most door and window manufacturers in Quebec. Our online store has over 740 replacement parts, including handles, locks, rollers, locking mechanisms, hinges and more. If a specific part isn't in stock, we can usually order it. Send us a photo of your current part and we'll quickly identify the right replacement.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing and quotes",
    icon: "fa-dollar-sign",
    items: [
      {
        question: "How much does sealed glass replacement cost?",
        answer:
          "Sealed glass replacement starts at $150 and varies based on several factors: glass dimensions, glass type (double, triple, Low-E, argon), window accessibility and installation complexity. We always provide a detailed, free quote before proceeding, so you know exactly what to expect. Call us at 514-825-8411 for your personalized estimate.",
      },
      {
        question: "Are quotes free?",
        answer:
          "Yes, all our quotes are completely free and without obligation. We can assess your needs by phone, email (with photos) or during a home visit depending on the project complexity. Our goal is to provide a clear and transparent estimate with no hidden fees or surprises. Contact us at 514-825-8411 or via our online form for a quick quote.",
      },
      {
        question: "Do you offer financing?",
        answer:
          "Currently, we don't offer a formal financing program. However, we accept credit card, debit card, Interac e-Transfer and cash payments. For larger projects, we can discuss flexible payment arrangements on a case-by-case basis. Feel free to bring this up during your quote to find a solution that fits your budget.",
      },
      {
        question: "Are there travel fees?",
        answer:
          "We serve the greater Montreal area and a 100km radius around Saint-Francois-Xavier with no additional travel fees for most services. For travel beyond this zone, fees may apply and will be communicated in advance during the quote. Our services cover Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny and surrounding municipalities.",
      },
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    icon: "fa-shield-alt",
    items: [
      {
        question: "What is your warranty duration?",
        answer:
          "We offer a 10-year warranty on all sealed glass unit replacements, covering manufacturing defects and loss of seal integrity. For other services like hardware replacement and screen door manufacturing, the warranty varies by part type and work performed. Specific warranty details are always included in your written quote before work begins.",
      },
      {
        question: "Is the warranty transferable?",
        answer:
          "Yes, our sealed glass warranty is transferable to the new owner if you sell your property. This is an advantage that adds value to your home. The new owner simply needs to contact us with the original invoice number to benefit from the remaining coverage. This policy demonstrates our confidence in the quality of our products and work.",
      },
      {
        question: "What exactly does the warranty cover?",
        answer:
          "Our 10-year sealed glass warranty specifically covers: condensation between panes (seal failure), glass manufacturing defects and breakage due to material defects. It does not cover accidental breakage, third-party damage, normal wear of mechanical components or damage from improper use. For hardware, the warranty covers manufacturing defects per the manufacturer's terms.",
      },
      {
        question: "How do I make a warranty claim?",
        answer:
          "To make a warranty claim, call us at 514-825-8411 or send an email to info@vosthermos.com including your invoice number, photos of the problem and a description of the situation. Our team will evaluate your claim quickly, usually within 48 business hours. If approved, we schedule the replacement at no additional cost. Always keep your original invoice as proof of purchase.",
      },
    ],
  },
  {
    id: "process",
    title: "Process and timelines",
    icon: "fa-clock",
    items: [
      {
        question: "What is the response time?",
        answer:
          "For urgent repairs (broken glass, door that won't close), we do our best to respond within 24 to 48 hours. For sealed glass replacements, the typical timeline is 1 to 3 weeks, as the unit must be custom-manufactured. Hardware replacement and screen door repair can often be done within the week following your request. Contact us at 514-825-8411 for current availability.",
      },
      {
        question: "How long does a typical service call take?",
        answer:
          "Duration depends on the type of work. Sealed glass replacement typically takes 30 to 60 minutes per window. Hardware replacement (handle, lock, roller) is usually completed in 15 to 45 minutes. Manufacturing and installing a custom screen door takes about 30 minutes. For more complex projects like wooden door repair, plan for a few hours. We always give you a time estimate when scheduling.",
      },
      {
        question: "Do I need to be present during the service call?",
        answer:
          "Yes, we require an adult to be present to give us access to the windows or doors being repaired, confirm the work to be done and inspect the final result before signing. If you can't be present, you can authorize another trusted person to receive us. We'll contact you before arrival to confirm the exact time.",
      },
    ],
  },
  {
    id: "shop",
    title: "Online store",
    icon: "fa-shopping-cart",
    items: [
      {
        question: "Can I buy parts online?",
        answer:
          "Yes! Our online store offers over 740 replacement parts for doors, windows and screen doors. You'll find hardware (handles, locks, rollers, mechanisms), screen door materials, accessories and more. Payment is secure and delivery is available throughout Quebec. You can also choose in-store pickup at our Saint-Francois-Xavier workshop.",
      },
      {
        question: "How do I know which part I need?",
        answer:
          "We know finding the right part can be difficult! Take a few photos of your current part (front, side and with a measurement for scale) and send them to us by email at info@vosthermos.com or via our contact form. Our expert advisors will identify the compatible part and point you to the right product in our store. You can also call us at 514-825-8411 for immediate assistance.",
      },
      {
        question: "What are the delivery times?",
        answer:
          "In-stock orders are usually shipped within 1 to 3 business days. Standard delivery in Quebec takes 3 to 7 business days depending on your area. For special-order parts, the timeline can be 1 to 3 weeks. In-store pickup in Saint-Francois-Xavier is available and free, usually the same day or the day after your order. You'll receive a tracking number by email once your order ships.",
      },
      {
        question: "Do you accept returns?",
        answer:
          "Yes, we accept returns within 30 days of receipt, provided the part is in its original packaging, uninstalled and in perfect condition. Custom-cut or custom-manufactured parts (screen doors, sealed glass) are not returnable. To initiate a return, contact us by email or phone with your order number. Refunds are processed within 5 to 10 business days of receiving the returned part.",
      },
    ],
  },
];

const allFaqItems = faqCategories.flatMap((cat) => cat.items);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPageEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">FAQ</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Frequently asked <span className="text-[var(--color-red)]">questions</span>
          </h1>
          <p className="text-white/60 text-lg mt-4 max-w-2xl">
            Quickly find answers to your most common questions about our
            services, pricing, warranties and our online store.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      {faqCategories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="bg-[var(--color-background)] border-b border-[var(--color-border)]"
        >
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center">
                <i
                  className={`fas ${category.icon} text-[var(--color-red)] text-sm`}
                ></i>
              </div>
              <h2 className="text-2xl font-extrabold">{category.title}</h2>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border)] px-6 md:px-8">
              <FaqAccordion items={category.items} />
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Didn&apos;t find your answer?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Our team is available to answer all your questions. Contact us by
            phone or via our online form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
            <Link
              href="/en/#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-envelope"></i> Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
