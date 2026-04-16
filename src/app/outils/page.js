import Link from "next/link";

export const metadata = {
  title: "Outils interactifs • Vosthermos",
  description:
    "Outils gratuits pour diagnostiquer vos portes et fenetres, estimer les couts et comparer les options. Calculateurs de prix, quiz de diagnostic et comparateurs bases sur 15 ans d'experience.",
  alternates: { canonical: "https://www.vosthermos.com/outils" },
};

const TOOLS = [
  {
    slug: "quiz-diagnostic",
    icon: "fa-stethoscope",
    title: "Quiz de diagnostic",
    description: "Repondez a quelques questions pour identifier le probleme de votre fenetre ou porte et obtenir le service recommande.",
    cta: "Diagnostiquer mon probleme",
  },
  {
    slug: "cout-thermos",
    icon: "fa-calculator",
    title: "Calculateur cout thermos",
    description: "Obtenez une estimation du prix de remplacement de vos vitres thermos selon les dimensions et la quantite.",
    cta: "Calculer mon prix",
  },
  {
    slug: "reparer-vs-remplacer",
    icon: "fa-balance-scale",
    title: "Reparer vs Remplacer?",
    description: "Comparez les 2 options selon votre situation: prix, duree, garantie, impact environnemental.",
    cta: "Comparer les options",
  },
];

export default function OutilsIndex() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Outils interactifs Vosthermos",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.vosthermos.com/outils/${t.slug}`,
      name: t.title,
    })),
  };

  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <div className="bg-[var(--color-teal-dark)] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Outils interactifs gratuits</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Diagnostiquez, estimez et comparez avant de payer une soumission. Tous nos outils sont bases sur 15 ans d&apos;experience terrain.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={`/outils/${t.slug}`}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] group"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-red)] transition-colors">
                <i className={`fas ${t.icon} text-xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{t.title}</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">{t.description}</p>
              <div className="text-[var(--color-red)] text-sm font-semibold">
                {t.cta} <i className="fas fa-arrow-right ml-1"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
