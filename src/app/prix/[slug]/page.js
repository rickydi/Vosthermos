import { notFound } from "next/navigation";
import Link from "next/link";
import { PRICING, getPricing } from "@/lib/pricing-data";
import { getService } from "@/lib/services-data";

export function generateStaticParams() {
  return PRICING.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pricing = getPricing(slug);
  if (!pricing) return {};
  return {
    title: pricing.metaTitle,
    description: pricing.metaDescription,
    alternates: { canonical: `https://www.vosthermos.com/prix/${pricing.slug}` },
  };
}

export default async function PricingDetailPage({ params }) {
  const { slug } = await params;
  const pricing = getPricing(slug);
  if (!pricing) notFound();

  const service = getService(pricing.serviceSlug);
  const otherPricing = PRICING.filter((p) => p.slug !== pricing.slug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pricing.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="pt-[65px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-14">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-4">
            <Link href="/prix" className="hover:text-white transition-colors">Prix</Link>
            <span>/</span>
            <span className="text-white/60">{pricing.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Combien coute : {pricing.title.toLowerCase()}
          </h1>
          <p className="text-white/60 text-lg">{pricing.heroSubtitle}</p>
          <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
            <span className="text-3xl font-black text-white">{pricing.priceRange.min}$ — {pricing.priceRange.max}$</span>
            <span className="text-white/50 text-sm">{pricing.priceRange.unit}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            {/* Price table */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <i className="fas fa-dollar-sign text-[var(--color-teal)] mr-2"></i>
                Grille tarifaire 2026
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">Service</th>
                      <th className="text-right px-5 py-3 text-sm font-semibold text-gray-700">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.tableRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{row.item}</td>
                        <td className="px-5 py-3.5 text-sm text-right font-semibold text-gray-900">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * Prix a titre indicatif, taxes en sus. Soumission gratuite et sans engagement pour un prix exact.
              </p>
            </div>

            {/* Factors */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <i className="fas fa-sliders-h text-[var(--color-red)] mr-2"></i>
                Ce qui influence le prix
              </h2>
              <div className="space-y-4">
                {pricing.factors.map((f, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison table */}
            {pricing.comparison && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-balance-scale text-[var(--color-teal)] mr-2"></i>
                  {pricing.comparison.title}
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--color-teal-dark)] text-white">
                        <th className="text-left px-5 py-3 text-sm font-semibold"></th>
                        <th className="text-center px-5 py-3 text-sm font-semibold">
                          <i className="fas fa-check mr-1"></i> Reparation
                        </th>
                        <th className="text-center px-5 py-3 text-sm font-semibold">Remplacement complet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.comparison.rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{row.label}</td>
                          <td className="px-5 py-3.5 text-sm text-center font-semibold text-[var(--color-teal)]">{row.thermos}</td>
                          <td className="px-5 py-3.5 text-sm text-center text-gray-500">{row.complet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Savings callout */}
            {pricing.savings && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-piggy-bank text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Economie reelle</h3>
                  <p className="text-green-700 text-sm">{pricing.savings}</p>
                </div>
              </div>
            )}

            {/* OPTI-FENETRE upsell */}
            <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                Besoin de plusieurs reparations? Programme OPTI-FENETRE
              </h3>
              <p className="text-white/70 mb-4 text-sm">
                Regroupez thermos, quincaillerie, coupe-froid, calfeutrage et moustiquaires en un seul forfait.
                Jusqu'a 70% d'economie vs le remplacement complet.
              </p>
              <Link href="/opti-fenetre" className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
                Voir le programme <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions frequentes sur les prix</h2>
              <div className="space-y-4">
                {pricing.faq.map((item, i) => (
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900 pr-4 text-sm">{item.q}</span>
                      <i className="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px] space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Soumission gratuite</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Obtenez un prix exact pour votre projet. Sans engagement.
                </p>
                <a href="tel:15148258411" className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3">
                  <i className="fas fa-phone"></i> 514-825-8411
                </a>
                <Link href="/rendez-vous" className="flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors w-full">
                  <i className="fas fa-calendar-alt"></i> Prendre rendez-vous
                </Link>
              </div>

              {service && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Service associe</h3>
                  <Link href={`/services/${service.slug}`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center">
                      <i className={`${service.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-teal)]">{service.shortTitle}</p>
                      <p className="text-xs text-gray-400">Details du service &rarr;</p>
                    </div>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Autres grilles de prix</h3>
                <div className="space-y-2">
                  {otherPricing.map((p) => (
                    <Link key={p.slug} href={`/prix/${p.slug}`} className="block text-sm text-gray-600 hover:text-[var(--color-teal)] transition-colors py-1">
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
