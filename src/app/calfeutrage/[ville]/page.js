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
  return {
    title: tpl.title(city),
    description: tpl.description(city),
    alternates: { canonical: `https://www.vosthermos.com/calfeutrage/${city.slug}` },
  };
}

const typesCalfeutrage = [
  {
    icon: "fa-home",
    title: "Calfeutrage exterieur",
    desc: "Application de scellant haute performance autour des cadres de fenetres et portes en contact avec les elements. Protege contre la pluie, la neige et le vent.",
  },
  {
    icon: "fa-couch",
    title: "Calfeutrage interieur",
    desc: "Scellement des joints entre les cadres de fenetres et les murs interieurs. Elimine les courants d'air et ameliore l'isolation acoustique de vos pieces.",
  },
  {
    icon: "fa-border-all",
    title: "Calfeutrage de fenetres",
    desc: "Retrait de l'ancien calfeutrage deteriore et application d'un produit neuf adapte au materiau de vos fenetres (PVC, aluminium, bois).",
  },
  {
    icon: "fa-door-open",
    title: "Calfeutrage de portes",
    desc: "Scellement du pourtour des portes d'entree, portes-patio et portes de garage. Bloque les infiltrations d'air aux points de contact avec le cadre.",
  },
  {
    icon: "fa-building",
    title: "Calfeutrage de fondation",
    desc: "Scellement des joints entre la fondation et le revetement exterieur. Previent les infiltrations d'eau et les remontees d'humidite dans le sous-sol.",
  },
];

const signesCalfeutrage = [
  { icon: "fa-wind", title: "Infiltrations d'air", desc: "Vous sentez des courants d'air froid pres de vos fenetres ou portes, meme lorsqu'elles sont fermees. Le calfeutrage use laisse passer l'air exterieur." },
  { icon: "fa-tint", title: "Condensation excessive", desc: "De la buee se forme regulierement sur vos vitres ou sur les cadres de fenetres, signe que l'humidite penetre par des joints mal scelles." },
  { icon: "fa-file-invoice-dollar", title: "Facture de chauffage elevee", desc: "Vos couts de chauffage augmentent sans raison apparente. Les pertes thermiques par un calfeutrage deteriore peuvent representer jusqu'a 25% de votre facture." },
  { icon: "fa-crack", title: "Calfeutrage craquele ou decolle", desc: "Le scellant autour de vos fenetres est visiblement fissure, jauni, durci ou decolle du cadre. C'est le signe qu'il a atteint sa fin de vie utile." },
];

const avantages = [
  { icon: "fa-leaf", title: "Economies d'energie", desc: "Un calfeutrage professionnel peut reduire vos pertes de chaleur de 15 a 25%, ce qui se traduit par des economies significatives sur votre facture de chauffage annuelle." },
  { icon: "fa-thermometer-half", title: "Confort accru", desc: "Fini les courants d'air froid pres des fenetres. Chaque piece de votre maison maintient une temperature uniforme, ete comme hiver." },
  { icon: "fa-bacterium", title: "Prevention de la moisissure", desc: "En eliminant les infiltrations d'humidite, le calfeutrage previent la formation de moisissures nocives pour la sante autour de vos cadres de fenetres." },
  { icon: "fa-chart-line", title: "Valeur de la propriete", desc: "Des fenetres et portes bien scellees sont un atout lors de la revente. Les acheteurs recherchent des maisons efficaces energetiquement et bien entretenues." },
];

export default async function CalfeutrageVillePage({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Calfeutrage de portes et fenetres a ${city.name}`,
    description: `Service professionnel de calfeutrage de portes et fenetres a ${city.name}, ${city.region}. Elimination des infiltrations d'air et d'eau, amelioration de l'isolation thermique.`,
    url: `https://www.vosthermos.com/calfeutrage/${city.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
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
      q: `Combien coute le calfeutrage de fenetres a ${city.name}?`,
      a: `Le prix du calfeutrage a ${city.name} depend du nombre d'ouvertures et de l'etat du calfeutrage existant. Pour une maison typique de ${city.region}, le calfeutrage complet de toutes les fenetres et portes se situe generalement entre 500$ et 1 500$. Nous offrons des soumissions gratuites a domicile. Appelez-nous au ${COMPANY_INFO.phone}.`,
    },
    {
      q: `A quelle frequence faut-il refaire le calfeutrage a ${city.name}?`,
      a: `Au Quebec, le calfeutrage exterieur devrait etre inspecte chaque annee et refait en moyenne tous les 5 a 7 ans. Les conditions climatiques de ${city.region} — cycles de gel-degel, pluies abondantes, neige — accelerent la degradation des scellants. Un calfeutrage preventif coute beaucoup moins cher que les reparations liees aux infiltrations d'eau.`,
    },
    {
      q: `Quelle est la meilleure saison pour faire le calfeutrage a ${city.name}?`,
      a: `L'ideal est de faire le calfeutrage entre mai et octobre, lorsque la temperature est superieure a 5°C pour assurer une adhesion optimale du scellant. Cependant, chez Vosthermos, nous utilisons des produits professionnels qui permettent de travailler a des temperatures plus basses si necessaire. N'attendez pas l'hiver pour agir!`,
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
              <i className="fas fa-map-marker-alt mr-1"></i> {city.region} &bull; a {city.distance} de nos bureaux
            </span>
            {city.population && (
              <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <i className="fas fa-users mr-1"></i> {city.population}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Calfeutrage de portes et fenetres a{" "}
            <span className="text-[var(--color-red)]">{city.name}</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Le calfeutrage est la premiere ligne de defense de votre maison contre les infiltrations d&apos;air et d&apos;eau. A {city.name}, les conditions climatiques exigeantes rendent un scellant en bon etat essentiel pour votre confort et vos economies d&apos;energie.
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
              Protegez votre maison a <span className="text-[var(--color-red)]">{city.name}</span> contre les infiltrations
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              Le calfeutrage est souvent le grand oublie de l&apos;entretien residentiel. Pourtant, un scellant deteriore autour de vos fenetres et portes peut etre responsable de jusqu&apos;a 25% des pertes de chaleur de votre maison. A {city.name}, ou les hivers sont longs et les ecarts de temperature importants, un calfeutrage en bon etat fait une difference tangible sur votre facture de chauffage.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              Chez Vosthermos, nous utilisons des scellants professionnels a base de polyurethane et de silicone haute performance, congus pour resister aux conditions climatiques quebecoises. Contrairement aux produits grand public, nos scellants conservent leur souplesse et leur adhesion pendant 7 a 10 ans, meme apres des centaines de cycles de gel et degel.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Notre technicien retire d&apos;abord l&apos;ancien calfeutrage deteriore, nettoie la surface de contact, puis applique le nouveau scellant avec precision. Le resultat : une etancheite parfaite, une finition propre et une isolation retrouvee pour vos portes et fenetres a {city.name}.
            </p>
          </div>
        </div>
      </section>

      {/* Types de calfeutrage */}
      <section className="bg-[var(--color-background)] py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos specialites</span>
            <h2 className="text-3xl font-extrabold">
              Types de calfeutrage offerts a <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Nous adaptons le type de scellant et la technique d&apos;application a chaque situation pour un resultat durable.
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
              Signes que votre calfeutrage doit etre <span className="text-[var(--color-red)]">remplace</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Reconnaissez ces symptomes? Il est temps de faire inspecter le calfeutrage de votre maison a {city.name}.
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
              Avantages du calfeutrage professionnel a <span className="text-[var(--color-red)]">{city.name}</span>
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
                Notre equipe se deplace partout a {city.name} pour le calfeutrage de vos portes et fenetres.
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
            <span className="section-tag">Questions frequentes</span>
            <h2 className="text-3xl font-extrabold">
              Calfeutrage a{" "}
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
                Besoin de calfeutrage a {city.name}?
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Ne laissez pas un calfeutrage use gonfler votre facture de chauffage. Remplissez le formulaire pour recevoir une soumission gratuite. Notre technicien se deplacera a {city.name} pour evaluer l&apos;etat de vos joints et vous proposer la meilleure solution.
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
                  Retrait complet de l&apos;ancien calfeutrage
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
          <span className="section-tag">Services complementaires</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Autres services de reparation a {city.name}
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            En plus du calfeutrage, Vosthermos offre une gamme complete de services de reparation de portes et fenetres a {city.name}.
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
              Nous offrons le service de calfeutrage dans ces villes pres de {city.name}.
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
