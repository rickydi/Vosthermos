import { notFound } from "next/navigation";
import Link from "next/link";
import { HOWTOS, getHowto, generateStaticParams as getParams } from "@/lib/howto-data";
import { getService } from "@/lib/services-data";

export function generateStaticParams() {
  return getParams();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const howto = getHowto(slug);
  if (!howto) return {};
  return {
    title: howto.metaTitle,
    description: howto.metaDescription,
    alternates: { canonical: `https://www.vosthermos.com/guides/${howto.slug}` },
  };
}

export default async function HowToPage({ params }) {
  const { slug } = await params;
  const howto = getHowto(slug);
  if (!howto) notFound();

  const relatedService = howto.relatedService ? getService(howto.relatedService) : null;

  // ── Schema.org HowTo JSON-LD (critical for LLMs + Google rich results) ──
  const howtoJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howto.title,
    description: howto.description,
    image: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
    totalTime: howto.totalTime,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: howto.estimatedCost.currency,
      value: howto.estimatedCost.value,
    },
    supply: (howto.supply || []).map((s) => ({ "@type": "HowToSupply", name: s })),
    tool: (howto.tool || []).map((t) => ({ "@type": "HowToTool", name: t })),
    step: howto.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `https://www.vosthermos.com/guides/${howto.slug}#step-${i + 1}`,
    })),
    author: {
      "@type": "Organization",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.vosthermos.com" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://www.vosthermos.com/guides" },
      { "@type": "ListItem", position: 3, name: howto.title, item: `https://www.vosthermos.com/guides/${howto.slug}` },
    ],
  };

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] text-white py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <Link href="/guides" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6">
            <i className="fas fa-arrow-left"></i> Retour aux guides
          </Link>
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <span className="px-3 py-1 bg-white/10 rounded-full">Difficulte: {howto.difficulty}</span>
            <span className="px-3 py-1 bg-white/10 rounded-full">
              Duree: {howto.totalTime.replace("PT", "").replace("M", " min").replace("H", " h ")}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full">
              Cout estime: {howto.estimatedCost.value}$ {howto.estimatedCost.currency}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{howto.title}</h1>
          <p className="text-white/80 text-lg">{howto.description}</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Supplies + Tools */}
        {(howto.supply?.length > 0 || howto.tool?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {howto.supply?.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-3">
                  <i className="fas fa-box-open mr-2 text-[var(--color-red)]"></i>Materiel necessaire
                </h3>
                <ul className="text-sm text-[var(--color-text-muted)] space-y-2">
                  {howto.supply.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i className="fas fa-check text-[var(--color-teal)] mt-1"></i>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {howto.tool?.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-3">
                  <i className="fas fa-tools mr-2 text-[var(--color-red)]"></i>Outils necessaires
                </h3>
                <ul className="text-sm text-[var(--color-text-muted)] space-y-2">
                  {howto.tool.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i className="fas fa-check text-[var(--color-teal)] mt-1"></i>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6 mb-10">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">Etapes</h2>
          {howto.steps.map((s, i) => (
            <div
              key={i}
              id={`step-${i + 1}`}
              className="bg-white rounded-xl p-6 border border-[var(--color-border)] relative"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-red)] text-white font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)] mb-2">{s.name}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                    {s.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        {howto.tips?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-10">
            <h3 className="font-bold text-yellow-900 mb-3">
              <i className="fas fa-lightbulb mr-2"></i>Astuces de pro
            </h3>
            <ul className="text-sm text-yellow-900 space-y-2">
              {howto.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* When to call a pro */}
        {howto.whenToCallPro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-10">
            <h3 className="font-bold text-red-900 mb-3">
              <i className="fas fa-phone mr-2"></i>Quand appeler un professionnel
            </h3>
            <p className="text-sm text-red-900 mb-4">{howto.whenToCallPro}</p>
            {relatedService && (
              <Link
                href={`/services/${relatedService.slug}`}
                className="inline-block px-6 py-3 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                Voir le service {relatedService.shortTitle}
              </Link>
            )}
          </div>
        )}

        {/* Other guides */}
        <div className="border-t border-[var(--color-border)] pt-8">
          <h3 className="font-bold text-[var(--color-text)] mb-4">Autres guides</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {HOWTOS.filter((h) => h.slug !== howto.slug).slice(0, 4).map((h) => (
              <Link
                key={h.slug}
                href={`/guides/${h.slug}`}
                className="bg-white rounded-lg p-4 border border-[var(--color-border)] hover:border-[var(--color-red)] transition-colors"
              >
                <p className="font-semibold text-sm text-[var(--color-text)]">{h.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{h.difficulty}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
