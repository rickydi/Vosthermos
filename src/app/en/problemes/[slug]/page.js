import { notFound } from "next/navigation";
import Link from "next/link";
import { PROBLEMS, getProblem, PROBLEM_CATEGORIES } from "@/lib/problems-data";
import { getService } from "@/lib/services-data";

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) return {};
  return {
    title: `${problem.title} — Causes and Solutions | Vosthermos`,
    description: `${problem.description.substring(0, 155)}...`,
    alternates: { canonical: `https://www.vosthermos.com/en/problemes/${problem.slug}` },
  };
}

const urgencyColors = {
  urgent: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "High urgency — act quickly" },
  eleve: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "High priority — don't wait" },
  modere: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Moderate priority — schedule a repair" },
  faible: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Low urgency — repair when convenient" },
};

export default async function ProblemPage({ params }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  const service = getService(problem.serviceSlug);
  const urgency = urgencyColors[problem.urgency] || urgencyColors.modere;
  const related = PROBLEMS.filter((p) => p.category === problem.category && p.slug !== problem.slug).slice(0, 5);
  const catInfo = PROBLEM_CATEGORIES.find((c) => c.slug === problem.category);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What causes a ${problem.shortTitle.toLowerCase()} problem?`, acceptedAnswer: { "@type": "Answer", text: problem.causes.join(". ") } },
      { "@type": "Question", name: `How to fix a ${problem.shortTitle.toLowerCase()} problem?`, acceptedAnswer: { "@type": "Answer", text: problem.solutions.join(". ") } },
      { "@type": "Question", name: `How much does the repair cost?`, acceptedAnswer: { "@type": "Answer", text: `The typical cost is ${problem.cost}. Contact Vosthermos at 514-825-8411 for a free quote.` } },
    ],
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to fix a ${problem.shortTitle.toLowerCase()} problem`,
    description: problem.description,
    step: [
      { "@type": "HowToStep", name: "Identify the problem", text: problem.description },
      { "@type": "HowToStep", name: "Understand the causes", text: problem.causes.join(". ") },
      { "@type": "HowToStep", name: "Contact a professional", text: `Call Vosthermos at 514-825-8411 for a free quote. Service: ${service ? service.shortTitle : "repair"}.` },
    ],
  };

  return (
    <div className="pt-[65px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-4">
            <Link href="/en/problemes" className="hover:text-white transition-colors">Problems</Link>
            <span>/</span>
            {catInfo && <span className="text-white/60">{catInfo.label}</span>}
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white/80 flex items-center justify-center flex-shrink-0">
              <i className={`${problem.icon} text-2xl`}></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {problem.title}
            </h1>
          </div>
          <p className="text-white/60 text-lg max-w-3xl">{problem.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">

            {/* Urgency */}
            <div className={`${urgency.bg} ${urgency.border} border rounded-xl p-5 flex items-center gap-3`}>
              <i className={`fas fa-exclamation-circle ${urgency.text} text-lg`}></i>
              <div>
                <p className={`${urgency.text} font-semibold text-sm`}>{urgency.label}</p>
                <p className="text-gray-600 text-xs mt-0.5">Estimated cost: {problem.cost}</p>
              </div>
            </div>

            {/* Causes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <i className="fas fa-search text-[var(--color-red)] mr-2 text-lg"></i>
                Why it happens
              </h2>
              <div className="space-y-3">
                {problem.causes.map((cause, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                    <p className="text-gray-700">{cause}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <i className="fas fa-check-circle text-[var(--color-teal)] mr-2 text-lg"></i>
                How to fix it
              </h2>
              <div className="space-y-3">
                {problem.solutions.map((sol, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <i className="fas fa-check text-[var(--color-teal)] mt-1 flex-shrink-0"></i>
                    <p className="text-gray-700">{sol}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OPTI-FENETRE upsell */}
            <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                Multiple problems? OPTI-FENETRE Program
              </h3>
              <p className="text-white/70 mb-4 text-sm">
                If your windows show multiple signs of wear, the OPTI-FENETRE program combines
                all repairs into a turnkey package — up to 70% savings vs. full replacement.
              </p>
              <Link href="/en/opti-fenetre" className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
                Discover OPTI-FENETRE <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* Related problems */}
            {related.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Similar problems</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {related.map((p) => (
                    <Link key={p.slug} href={`/en/problemes/${p.slug}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <i className={`${p.icon} text-gray-400 group-hover:text-[var(--color-teal)] transition-colors`}></i>
                      <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)] transition-colors">{p.shortTitle}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px] space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Free quote</h3>
                <p className="text-gray-500 text-sm mb-4">
                  An expert will evaluate your situation and recommend the best solution.
                </p>
                <a href="tel:15148258411" className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3">
                  <i className="fas fa-phone"></i> 514-825-8411
                </a>
                <Link href="/en/rendez-vous" className="flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors w-full">
                  <i className="fas fa-calendar-alt"></i> Book an appointment
                </Link>
              </div>

              {service && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Recommended service</h3>
                  <Link href={`/en/services/${service.slug}`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center">
                      <i className={`${service.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-teal)] transition-colors">{service.shortTitle}</p>
                      <p className="text-xs text-gray-400">View details &rarr;</p>
                    </div>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">
                  Fast service &bull; Warranty &bull; 100km radius
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
