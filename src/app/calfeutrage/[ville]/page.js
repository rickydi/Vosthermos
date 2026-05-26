import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, getCity } from "@/lib/cities";
import QuoteForm from "@/components/QuoteForm";
import { CITY_PAGE_SEO } from "@/lib/seo-templates";
import { COMPANY_INFO } from "@/lib/company-info";

export async function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) return {};
  const tpl = CITY_PAGE_SEO["calfeutrage"];
  const canonical =
    city.slug === "montreal"
      ? "https://www.vosthermos.com/services/calfeutrage/montreal"
      : `https://www.vosthermos.com/calfeutrage/${city.slug}`;
  return {
    title: tpl.title(city),
    description: tpl.description(city),
    alternates: { canonical },
  };
}

// Contenu local personnalise par ville (amorce). Les villes absentes utilisent
// le texte par defaut du template (avec city.name insere).
const LOCAL_CALFEUTRAGE = {
  montreal: {
    lead: "À Montréal, entre les triplex et duplex centenaires du Plateau, de Rosemont et de Verdun et les condos récents du centre-ville, les besoins en calfeutrage varient énormément. Joints de pierre, cadres de bois d'origine ou fenêtres PVC modernes : un scellant adapté à chaque type de bâti est essentiel pour bloquer l'air et l'eau.",
    intro: "Le parc immobilier montréalais est l'un des plus anciens au Québec. Dans les triplex et plex du Plateau, de Villeray ou d'Hochelaga, le calfeutrage d'origine est souvent fissuré, durci ou absent, ce qui laisse l'air froid s'infiltrer et fait grimper la facture de chauffage. Un calfeutrage refait dans les règles redonne de l'étanchéité sans dénaturer le cachet du bâtiment.",
  },
  laval: {
    lead: "À Laval, le vaste parc de bungalows et de maisons à étages des années 1960 à 1990 (Chomedey, Fabreville, Sainte-Rose, Vimont) arrive exactement à l'âge où le calfeutrage extérieur se dégrade et laisse passer l'air et l'humidité.",
    intro: "Les maisons de Laval ont majoritairement été construites entre les années 1960 et 1990. À cet âge, le scellant d'origine autour des fenêtres et des portes a perdu sa souplesse, se fissure et se décolle. Refaire le calfeutrage est l'une des interventions les plus rentables pour réduire les pertes de chaleur dans ces propriétés.",
  },
  longueuil: {
    lead: "À Longueuil, du patrimoine bâti du Vieux-Longueuil aux secteurs résidentiels de Saint-Hubert et Greenfield Park, un calfeutrage en bon état protège autant les fenêtres de bois anciennes que les ouvertures plus récentes contre les infiltrations.",
    intro: "Longueuil combine des bâtiments patrimoniaux et un grand parc résidentiel d'après-guerre. Sur les fenêtres de bois du Vieux-Longueuil comme sur les modèles PVC plus récents, un calfeutrage détérioré est une cause fréquente de courants d'air et de condensation. Un scellant neuf, appliqué proprement, règle le problème durablement.",
  },
  brossard: {
    lead: "À Brossard, des secteurs résidentiels établis aux développements de condos et de maisons récentes près du Quartier DIX30, le calfeutrage protège vos ouvertures contre les vents et les écarts de température marqués de la Rive-Sud.",
    intro: "Brossard compte autant des maisons unifamiliales des décennies passées que des constructions récentes. Dans les deux cas, le calfeutrage extérieur travaille sous l'effet des cycles de gel-dégel et finit par se fissurer. Une inspection et un remplacement ciblé évitent les infiltrations d'eau et les pertes de chaleur.",
  },
};

const typesCalfeutrage = [
  {
    icon: "fa-home",
    title: "Calfeutrage extérieur",
    desc: "Application de scellant haute performance autour des cadres de fenêtres et portes en contact avec les éléments. Protège contre la pluie, la neige et le vent.",
  },
  {
    icon: "fa-couch",
    title: "Calfeutrage intérieur",
    desc: "Scellement des joints entre les cadres de fenêtres et les murs intérieurs. Élimine les courants d'air et améliore l'isolation acoustique de vos pièces.",
  },
  {
    icon: "fa-border-all",
    title: "Calfeutrage de fenêtres",
    desc: "Retrait de l'ancien calfeutrage détérioré et application d'un produit neuf adapté au matériau de vos fenêtres (PVC, aluminium, bois).",
  },
  {
    icon: "fa-door-open",
    title: "Calfeutrage de portes",
    desc: "Scellement du pourtour des portes d'entrée, portes-patio et portes de garage. Bloque les infiltrations d'air aux points de contact avec le cadre.",
  },
  {
    icon: "fa-building",
    title: "Calfeutrage de fondation",
    desc: "Scellement des joints entre la fondation et le revêtement extérieur. Prévient les infiltrations d'eau et les remontées d'humidité dans le sous-sol.",
  },
];

const signesCalfeutrage = [
  { icon: "fa-wind", title: "Infiltrations d'air", desc: "Vous sentez des courants d'air froid près de vos fenêtres ou portes, même lorsqu'elles sont fermées. Le calfeutrage usé laisse passer l'air extérieur." },
  { icon: "fa-tint", title: "Condensation excessive", desc: "De la buée se forme régulièrement sur vos vitres ou sur les cadres de fenêtres, signe que l'humidité pénètre par des joints mal scellés." },
  { icon: "fa-file-invoice-dollar", title: "Facture de chauffage élevée", desc: "Vos coûts de chauffage augmentent sans raison apparente. Les pertes thermiques par un calfeutrage détérioré peuvent représenter jusqu'à 25% de votre facture." },
  { icon: "fa-crack", title: "Calfeutrage craquelé ou décollé", desc: "Le scellant autour de vos fenêtres est visiblement fissuré, jauni, durci ou décollé du cadre. C'est le signe qu'il a atteint sa fin de vie utile." },
];

const avantages = [
  { icon: "fa-leaf", title: "Économies d'énergie", desc: "Un calfeutrage professionnel peut réduire vos pertes de chaleur de 15 à 25%, ce qui se traduit par des économies significatives sur votre facture de chauffage annuelle." },
  { icon: "fa-thermometer-half", title: "Confort accru", desc: "Fini les courants d'air froid près des fenêtres. Chaque pièce de votre maison maintient une température uniforme, été comme hiver." },
  { icon: "fa-bacterium", title: "Prévention de la moisissure", desc: "En éliminant les infiltrations d'humidité, le calfeutrage prévient la formation de moisissures nocives pour la santé autour de vos cadres de fenêtres." },
  { icon: "fa-chart-line", title: "Valeur de la propriété", desc: "Des fenêtres et portes bien scellées sont un atout lors de la revente. Les acheteurs recherchent des maisons efficaces énergétiquement et bien entretenues." },
];

export default async function CalfeutrageVillePage({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const local = LOCAL_CALFEUTRAGE[city.slug] || null;
  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Calfeutrage de portes et fenêtres à ${city.name}`,
    description: `Service professionnel de calfeutrage de portes et fenêtres à ${city.name}, ${city.region}. Élimination des infiltrations d'air et d'eau, amélioration de l'isolation thermique.`,
    url: `https://www.vosthermos.com/calfeutrage/${city.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: COMPANY_INFO.phoneTel,
      email: COMPANY_INFO.email,
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_INFO.address,
        addressLocality: COMPANY_INFO.city,
        addressRegion: "QC",
        addressCountry: "CA",
      },
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "AdministrativeArea", name: city.region },
    },
  };

  const faqItems = [
    {
      q: `Combien coûte le calfeutrage de fenêtres à ${city.name}?`,
      a: `Le prix du calfeutrage à ${city.name} dépend du nombre d'ouvertures et de l'état du calfeutrage existant. Pour une maison typique de ${city.region}, le calfeutrage complet de toutes les fenêtres et portes se situe généralement entre 500$ et 1 500$. Nous offrons des soumissions gratuites à domicile. Appelez-nous au ${COMPANY_INFO.phone}.`,
    },
    {
      q: `À quelle fréquence faut-il refaire le calfeutrage à ${city.name}?`,
      a: `Au Québec, le calfeutrage extérieur devrait être inspecté chaque année et refait en moyenne tous les 5 à 7 ans. Les conditions climatiques de ${city.region} — cycles de gel-dégel, pluies abondantes, neige — accélèrent la dégradation des scellants. Un calfeutrage préventif coûte beaucoup moins cher que les réparations liées aux infiltrations d'eau.`,
    },
    {
      q: `Quelle est la meilleure saison pour faire le calfeutrage à ${city.name}?`,
      a: `L'idéal est de faire le calfeutrage entre mai et octobre, lorsque la température est supérieure à 5°C pour assurer une adhésion optimale du scellant. Cependant, chez Vosthermos, nous utilisons des produits professionnels qui permettent de travailler à des températures plus basses si nécessaire. N'attendez pas l'hiver pour agir!`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero + Breadcrumb */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/services/calfeutrage" className="hover:text-white transition-colors">Calfeutrage</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <i className="fas fa-map-marker-alt mr-1"></i> {city.region} &bull; à {city.distance} de nos bureaux
            </span>
            {city.population && (
              <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <i className="fas fa-users mr-1"></i> {city.population}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Calfeutrage de portes et fenêtres à{" "}
            <span className="text-[var(--color-red)]">{city.name}</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            {local?.lead || `Le calfeutrage est la première ligne de défense de votre maison contre les infiltrations d'air et d'eau. À ${city.name}, les conditions climatiques exigeantes rendent un scellant en bon état essentiel pour votre confort et vos économies d'énergie.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/rendez-vous"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Soumission gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <span className="section-tag">Calfeutrage professionnel</span>
            <h2 className="text-3xl font-extrabold mb-6">
              Protégez votre maison à <span className="text-[var(--color-red)]">{city.name}</span> contre les infiltrations
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              {local?.intro || `Le calfeutrage est souvent le grand oublié de l'entretien résidentiel. Pourtant, un scellant détérioré autour de vos fenêtres et portes peut être responsable de jusqu'à 25% des pertes de chaleur de votre maison. À ${city.name}, où les hivers sont longs et les écarts de température importants, un calfeutrage en bon état fait une différence tangible sur votre facture de chauffage.`}
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              Chez Vosthermos, nous utilisons des scellants professionnels à base de polyuréthane et de silicone haute performance, conçus pour résister aux conditions climatiques québécoises. Contrairement aux produits grand public, nos scellants conservent leur souplesse et leur adhésion pendant 7 à 10 ans, même après des centaines de cycles de gel et dégel.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Notre technicien retire d'abord l'ancien calfeutrage détérioré, nettoie la surface de contact, puis applique le nouveau scellant avec précision. Le résultat : une étanchéité parfaite, une finition propre et une isolation retrouvée pour vos portes et fenêtres à {city.name}.
            </p>
          </div>
        </div>
      </section>

      {/* Types de calfeutrage */}
      <section className="bg-[var(--color-background)] py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos spécialités</span>
            <h2 className="text-3xl font-extrabold">
              Types de calfeutrage offerts à <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Nous adaptons le type de scellant et la technique d'application à chaque situation pour un résultat durable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typesCalfeutrage.map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
                  <i className={`fas ${t.icon} text-lg text-[var(--color-teal)]`}></i>
                </div>
                <h3 className="font-bold text-base mb-2">{t.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signes que vous avez besoin de calfeutrage */}
      <section className="bg-white py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Diagnostic</span>
            <h2 className="text-3xl font-extrabold">
              Signes que votre calfeutrage doit être <span className="text-[var(--color-red)]">remplacé</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Reconnaissez ces symptômes? Il est temps de faire inspecter le calfeutrage de votre maison à {city.name}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {signesCalfeutrage.map((s) => (
              <div
                key={s.title}
                className="flex gap-4 bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)]"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center shrink-0">
                  <i className={`fas ${s.icon} text-[var(--color-red)]`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages du calfeutrage professionnel */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Avantages</span>
            <h2 className="text-3xl font-extrabold text-white">
              Avantages du calfeutrage professionnel à <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {avantages.map((a) => (
              <div key={a.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${a.icon}`}></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{a.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quartiers desservis */}
      {city.neighborhoods && city.neighborhoods.length > 0 && (
        <section className="bg-white py-16 border-b border-[var(--color-border)]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10">
              <span className="section-tag">Zone de service</span>
              <h2 className="text-3xl font-extrabold">
                Calfeutrage dans <span className="text-[var(--color-red)]">tous les quartiers</span> de {city.name}
              </h2>
              <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
                Notre équipe se déplace partout à {city.name} pour le calfeutrage de vos portes et fenêtres.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {city.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-2 bg-[var(--color-background)] rounded-full px-5 py-3 text-sm font-medium border border-[var(--color-border)]"
                >
                  <i className="fas fa-map-pin text-[var(--color-teal)] text-xs"></i>
                  {n}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-[var(--color-background)] py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Questions fréquentes</span>
            <h2 className="text-3xl font-extrabold">
              Calfeutrage à{" "}
              <span className="text-[var(--color-red)]">{city.name}</span> — FAQ
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-left hover:bg-[var(--color-background)] transition-colors">
                  <span className="faq-question">{item.q}</span>
                  <i className="fas fa-chevron-down text-[var(--color-muted)] text-sm transition-transform group-open:rotate-180 flex-shrink-0"></i>
                </summary>
                <div className="faq-answer px-6 pb-5">
                  <p className="text-[var(--color-muted)] leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + QuoteForm */}
      <section className="bg-[var(--color-teal-dark)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="section-tag">Soumission gratuite</span>
              <h2 className="text-3xl font-extrabold text-white mb-6">
                Besoin de calfeutrage à {city.name}?
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Ne laissez pas un calfeutrage usé gonfler votre facture de chauffage. Remplissez le formulaire pour recevoir une soumission gratuite. Notre technicien se déplacera à {city.name} pour évaluer l'état de vos joints et vous proposer la meilleure solution.
              </p>
              <div className="space-y-4 text-white/80 text-sm">
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-[var(--color-red)]"></i>
                  Inspection gratuite de tous vos joints
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-[var(--color-red)]"></i>
                  Scellants professionnels haute performance
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-[var(--color-red)]"></i>
                  Retrait complet de l'ancien calfeutrage
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-[var(--color-red)]"></i>
                  Finition propre et durable (7-10 ans)
                </div>
              </div>
              <div className="mt-8">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
                >
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* Other services CTA */}
      <section className="bg-white py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Services complémentaires</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Autres services de réparation à {city.name}
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            En plus du calfeutrage, Vosthermos offre une gamme complète de services de réparation de portes et fenêtres à {city.name}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/services/remplacement-vitre-thermos/${city.slug}`} className="inline-flex items-center gap-2 bg-[var(--color-background)] px-5 py-3 rounded-full text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
              <i className="fas fa-snowflake text-[var(--color-teal)] text-xs"></i> Vitre thermos
            </Link>
            <Link href={`/services/remplacement-quincaillerie/${city.slug}`} className="inline-flex items-center gap-2 bg-[var(--color-background)] px-5 py-3 rounded-full text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
              <i className="fas fa-cogs text-[var(--color-teal)] text-xs"></i> Quincaillerie
            </Link>
            <Link href={`/services/coupe-froid/${city.slug}`} className="inline-flex items-center gap-2 bg-[var(--color-background)] px-5 py-3 rounded-full text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
              <i className="fas fa-temperature-low text-[var(--color-teal)] text-xs"></i> Coupe-froid
            </Link>
            <Link href={`/reparation-portes-et-fenetres/${city.slug}`} className="inline-flex items-center gap-2 bg-[var(--color-background)] px-5 py-3 rounded-full text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
              <i className="fas fa-tools text-[var(--color-teal)] text-xs"></i> Tous les services
            </Link>
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold">
              Calfeutrage — <span className="text-[var(--color-red)]">autres villes desservies</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-2">
              Nous offrons le service de calfeutrage dans ces villes près de {city.name}.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/calfeutrage/${c.slug}`}
                className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 text-sm font-medium hover:shadow-md hover:bg-[var(--color-teal)] hover:text-white transition-all border border-[var(--color-border)]"
              >
                <i className="fas fa-map-marker-alt text-[var(--color-red)] text-xs"></i>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
