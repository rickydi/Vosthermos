import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "OPTI-FENETRE Program | Complete Window Restoration | Vosthermos",
  description:
    `The Vosthermos OPTI-FENETRE program: complete restoration of your doors and windows at a fraction of the replacement cost. Free evaluation, personalized plan, warranty. Montreal, South Shore, Laval. ${COMPANY_INFO.phone}.`,
  alternates: { canonical: "https://www.vosthermos.com/en/opti-fenetre" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/opti-fenetre",
    title: "OPTI-FENETRE Program | Vosthermos",
    description:
      "Complete restoration of your doors and windows. Same benefits as replacement, fraction of the cost.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
};

const steps = [
  {
    num: "1",
    icon: "fas fa-clipboard-check",
    title: "Free evaluation",
    desc: "An expert visits your home to inspect all your doors and windows. They identify each issue and assess the overall condition.",
  },
  {
    num: "2",
    icon: "fas fa-file-alt",
    title: "Personalized plan",
    desc: "We prepare a detailed plan of the necessary work with a guaranteed fixed price. No surprises, everything is transparent.",
  },
  {
    num: "3",
    icon: "fas fa-tools",
    title: "Complete execution",
    desc: "Our team carries out all the work in a minimum number of visits: sealed units, hardware, weatherstripping, caulking, screens.",
  },
  {
    num: "4",
    icon: "fas fa-shield-alt",
    title: "Warranty and follow-up",
    desc: "All work is covered by our warranty. We follow up to ensure your complete satisfaction.",
  },
];

const included = [
  { icon: "fas fa-snowflake", title: "Sealed unit replacement", desc: "Foggy or cracked glass" },
  { icon: "fas fa-cogs", title: "Hardware", desc: "Handles, locks, rollers" },
  { icon: "fas fa-wind", title: "Weatherstripping", desc: "New sealing gaskets" },
  { icon: "fas fa-fill-drip", title: "Caulking", desc: "Exterior and interior sealant" },
  { icon: "fas fa-border-all", title: "Screens", desc: "Repair or replacement" },
  { icon: "fas fa-door-open", title: "Wood doors", desc: "Restoration and adjustment" },
  { icon: "fas fa-eye-slash", title: "Defogging", desc: "Treatment for foggy glass" },
  { icon: "fas fa-th-large", title: "Door insert", desc: "Door glass replacement" },
];

const advantages = [
  { icon: "fas fa-piggy-bank", title: "Save up to 70%", desc: "Fraction of the cost of a complete window replacement" },
  { icon: "fas fa-clock", title: "Fast and efficient", desc: "All work coordinated for minimal disruption" },
  { icon: "fas fa-leaf", title: "Eco-friendly", desc: "Restore rather than discard — good for the environment" },
  { icon: "fas fa-certificate", title: "Full warranty", desc: "All work is covered by our Vosthermos warranty" },
  { icon: "fas fa-home", title: "Improved comfort", desc: "Better thermal and acoustic insulation for your home" },
  { icon: "fas fa-dollar-sign", title: "Resale value", desc: "Doors and windows in perfect condition increase your property value" },
];

export default function OptiFenetrePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "OPTI-FENETRE Program",
    description:
      "Turnkey program for complete restoration of residential doors and windows. Sealed unit replacement, hardware, weatherstripping, caulking and screens.",
    url: "https://www.vosthermos.com/en/opti-fenetre",
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      url: "https://www.vosthermos.com",
    },
    areaServed: [
      { "@type": "City", name: "Montreal" },
      { "@type": "City", name: "Laval" },
      { "@type": "City", name: "Longueuil" },
      { "@type": "City", name: "Brossard" },
      { "@type": "City", name: "Saint-Hyacinthe" },
      { "@type": "City", name: "Granby" },
    ],
  };

  return (
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-teal-dark)] via-[#0a6e66] to-[var(--color-teal)] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <i className="fas fa-star text-yellow-400 text-sm"></i>
              <span className="text-white/90 text-sm font-medium">Exclusive Vosthermos program</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 tracking-tight">
              OPTI-<span className="text-[var(--color-red)]">FENETRE</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 font-light mb-4">
              Complete restoration of your doors and windows
            </p>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10">
              Why replace your windows entirely when you can restore them
              and enjoy the same benefits at a fraction of the cost?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg"
              >
                <i className="fas fa-phone"></i>
                {COMPANY_INFO.phone}
              </a>
              <Link
                href="/en/#contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg"
              >
                <i className="fas fa-file-alt"></i>
                Free quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <div className="bg-white py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Compare and save
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Real example: home with 12 windows and 2 patio doors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            {/* Replacement */}
            <div className="relative rounded-2xl border-2 border-gray-200 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm font-semibold">
                Full replacement
              </div>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-black text-gray-400 line-through">$18,000</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">New windows and doors</p>
              <ul className="text-left space-y-3 text-gray-500 text-sm">
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> High cost</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> 4 to 8 week lead time</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Major work and debris</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Environmental impact</li>
              </ul>
            </div>

            {/* OPTI-FENETRE */}
            <div className="relative rounded-2xl border-2 border-[var(--color-teal)] p-8 text-center shadow-xl shadow-[var(--color-teal)]/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-teal)] text-white px-4 py-1 rounded-full text-sm font-bold">
                OPTI-FENETRE Program
              </div>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-black text-[var(--color-teal)]">$5,500</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Complete restoration</p>
              <ul className="text-left space-y-3 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> <strong>70% savings</strong></li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> Completed in 1-2 days</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> No debris, clean work</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> Eco-friendly — we restore</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            * Prices shown for reference only. Each project is individually assessed. Free quote with no obligation.
          </p>
        </div>
      </div>

      {/* Interactive Calculator */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Calculate your savings
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Enter the number of doors and windows in your home to see how much you could save.
            </p>
          </div>
          <SavingsCalculator lang="en" />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A simple 4-step process for windows that look like new
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal)] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg shadow-[var(--color-teal)]/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything is included
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The OPTI-FENETRE program covers all your needs in a single package
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {included.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-teal)] group-hover:text-white transition-colors">
                  <i className={`${item.icon} text-xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="bg-[var(--color-teal-dark)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Why choose OPTI-FENETRE?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((a) => (
              <div key={a.title} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/20 text-[var(--color-red)] flex items-center justify-center mb-4">
                  <i className={`${a.icon} text-lg`}></i>
                </div>
                <h3 className="text-white font-bold mb-2">{a.title}</h3>
                <p className="text-white/50 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What exactly is the OPTI-FENETRE program?",
                a: "It's a turnkey program that combines all our repair services into a single package: sealed unit replacement, hardware, weatherstripping, caulking, screens and door restoration. Instead of replacing your entire windows, we restore them for a fraction of the cost.",
              },
              {
                q: "How much can I save?",
                a: "On average, the OPTI-FENETRE program costs 60 to 70% less than a full replacement. For a typical home with 12 windows and 2 doors, that's savings of around $12,000.",
              },
              {
                q: "Is the result as good as a replacement?",
                a: "In most cases, yes. We replace the defective components (sealed units, gaskets, hardware) while keeping the frames that are still in good condition. The result: optimal thermal and acoustic insulation, mechanisms that work like new.",
              },
              {
                q: "How long does the work take?",
                a: "For a standard home, the work is generally completed in 1 to 2 days. That's much faster than a full replacement which can take 4 to 8 weeks.",
              },
              {
                q: "Which cities do you serve?",
                a: "We cover Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby and the entire area within a 100 km radius of our workshop.",
              },
              {
                q: "Is there a warranty?",
                a: "Yes, all work performed under the OPTI-FENETRE program is covered by our Vosthermos warranty. Sealed glass units are covered by our professional warranty.",
              },
            ].map((item, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                  <i className="fas fa-chevron-down text-gray-400 text-sm group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-light)] py-16">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to restore your windows?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Free evaluation with no obligation. Find out how much you can save
            with the OPTI-FENETRE program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-red)] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              <i className="fas fa-phone"></i>
              {COMPANY_INFO.phone}
            </a>
            <Link
              href="/en/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors text-lg"
            >
              <i className="fas fa-calendar-alt"></i>
              Book an appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
