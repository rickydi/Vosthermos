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
  const tpl = CITY_PAGE_SEO["reparation-portes-et-fenetres"];
  const title = tpl.title(city);
  const description = tpl.description(city);
  const url = `https://www.vosthermos.com/reparation-portes-et-fenetres/${city.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "fr_CA",
      siteName: "Vosthermos",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const allServices = [
  { slug: "remplacement-quincaillerie", icon: "fas fa-cogs", title: "Quincaillerie de portes et fenetres", desc: "Remplacement de poignees, serrures, roulettes, manivelles et charnieres pour tous types de portes-patio et fenetres." },
  { slug: "remplacement-vitre-thermos", icon: "fas fa-snowflake", title: "Vitre thermos (unite scellee)", desc: "Remplacement de vitres thermos embuees ou fissurees. Verre Low-E et gaz argon pour une isolation optimale." },
  { slug: "reparation-porte-patio", icon: "fas fa-grip-lines-vertical", title: "Reparation de porte-patio", desc: "Roulettes, rails, vitres thermos, poignees et coupe-froid. Reparation sur place de portes-patio coulissantes." },
  { slug: "reparation-porte-fenetre", icon: "fas fa-door-closed", title: "Reparation de porte-fenetre", desc: "Mecanismes multipoints, charnieres, vitres embuees et ajustements. Experts en portes-fenetres a battant." },
  { slug: "reparation-portes-bois", icon: "fas fa-door-open", title: "Portes en bois", desc: "Restauration, sablage, vernissage, ajustement et reparation de portes et cadres en bois. Travail artisanal." },
  { slug: "moustiquaires-sur-mesure", icon: "fas fa-border-all", title: "Moustiquaires sur mesure", desc: "Fabrication et reparation de moustiquaires pour fenetres et portes-patio. Toile de qualite et ajustement parfait." },
  { slug: "calfeutrage", icon: "fas fa-fill-drip", title: "Calfeutrage", desc: "Calfeutrage interieur et exterieur de portes et fenetres. Elimination des infiltrations d'air et amelioration de l'isolation." },
  { slug: "coupe-froid", icon: "fas fa-temperature-low", title: "Coupe-froid", desc: "Remplacement de coupe-froid uses pour bloquer les courants d'air et reduire vos couts de chauffage." },
  { slug: "desembuage", icon: "fas fa-eye", title: "Desembuage", desc: "Traitement de desembuage pour redonner transparence et clarte a vos vitres thermos embuees." },
  { slug: "insertion-porte", icon: "fas fa-door-closed", title: "Insertion de porte", desc: "Remplacement de l'insertion vitree de votre porte d'entree. Ameliore l'esthetique et l'isolation." },
];

export default async function ReparationVillePage({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const getServiceCard = (service) => {
    if (city.slug === "beloeil" && service.slug === "reparation-porte-patio") {
      return {
        ...service,
        title: "Reparation porte patio a Beloeil",
        desc: "Roulettes, rail, poignee, serrure et coupe-froid. Lien direct vers la page specialisee pour la reparation de porte patio a Beloeil.",
      };
    }
    if (city.slug === "beauharnois" && service.slug === "reparation-porte-patio") {
      return {
        ...service,
        title: "Reparation porte patio a Beauharnois",
        desc: "Roulettes, rail, poignee, serrure et coupe-froid. Lien direct vers la page specialisee pour la reparation de porte patio a Beauharnois.",
      };
    }
    if (city.slug === "montreal" && service.slug === "calfeutrage") {
      return {
        ...service,
        title: "Calfeutrage a Montreal",
        desc: "Joints de fenetres, portes, portes-patio et scellant exterieur. Lien direct vers la page specialisee pour le calfeutrage a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "remplacement-vitre-thermos") {
      return {
        ...service,
        title: "Remplacement vitre thermos a Montreal",
        desc: "Vitres thermos embuees, unites scellees fissurees et thermos de triplex en fin de vie. Lien direct vers la page specialisee pour le remplacement vitre thermos a Montreal.",
      };
    }
    return service;
  };

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);

  const provider = {
    "@type": "LocalBusiness",
    "@id": "https://www.vosthermos.com/#business",
    name: "Vosthermos",
    telephone: "+15148258411",
    email: COMPANY_INFO.email,
    url: "https://www.vosthermos.com",
    image: "https://www.vosthermos.com/logo.png",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_INFO.address,
      addressLocality: COMPANY_INFO.city,
      addressRegion: "QC",
      postalCode: COMPANY_INFO.postalCode,
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.5167,
      longitude: -73.3833,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Reparation de portes et fenetres a ${city.name}`,
    description: `Service complet de reparation de portes et fenetres a ${city.name}. Quincaillerie, vitres thermos, portes en bois, moustiquaires, calfeutrage, coupe-froid, desembuage et insertion de porte.`,
    url: `https://www.vosthermos.com/reparation-portes-et-fenetres/${city.slug}`,
    provider,
    areaServed: {
      "@type": "City",
      name: city.name,
      ...(city.coords && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.coords.lat,
          longitude: city.coords.lng,
        },
      }),
      containedInPlace: { "@type": "AdministrativeArea", name: city.region },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services de reparation a ${city.name}`,
      itemListElement: allServices.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.desc,
        },
      })),
    },
  };

  const faqItems = [
    {
      q: `Quels services de reparation de portes et fenetres offrez-vous a ${city.name}?`,
      a: `A ${city.name}, nous offrons la gamme complete de reparation de portes et fenetres : remplacement de quincaillerie (poignees, serrures, roulettes), remplacement de vitres thermos embuees, reparation de portes en bois, fabrication de moustiquaires sur mesure, calfeutrage, coupe-froid, desembuage et insertion de porte. Tous nos travaux sont garantis.`,
    },
    {
      q: `Combien coute une reparation de fenetres a ${city.name}?`,
      a: `Le cout varie selon le type de reparation. Un remplacement de thermos debute a environ 150$ par unite installee, la quincaillerie a partir de 4.99$ la piece. Nous offrons des soumissions gratuites a domicile partout a ${city.name} et dans la region de ${city.region}. Appelez-nous au ${COMPANY_INFO.phone}.`,
    },
    {
      q: `Est-ce que Vosthermos se deplace a ${city.name}?`,
      a: `Oui, notre equipe se deplace a ${city.name} (a ${city.distance} de notre atelier)${city.neighborhoods ? ` et couvre tous les quartiers incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}. Nous desservons egalement toute la region de ${city.region}. Prenez rendez-vous en ligne ou appelez-nous.`,
    },
    {
      q: `Vaut-il mieux reparer ou remplacer mes fenetres a ${city.name}?`,
      a: `Dans la majorite des cas, la reparation est beaucoup plus economique que le remplacement complet. Un remplacement de thermos ou de quincaillerie peut prolonger la vie de vos fenetres de 15 a 20 ans a une fraction du cout d'une fenetre neuve. Notre technicien evaluera l'etat de vos fenetres lors de la soumission gratuite et vous recommandera la meilleure option.`,
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
            <span className="text-white/70">Reparation portes et fenetres</span>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
            {/* Left: content */}
            <div>
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
                Reparation de portes et fenetres a{" "}
                <span className="text-[var(--color-red)]">{city.name}</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Vosthermos est votre specialiste en reparation de portes et fenetres a {city.name}. Que ce soit pour un thermos embue, une quincaillerie defaillante ou un calfeutrage a refaire, notre equipe intervient rapidement avec un service garanti sur tous les travaux.
              </p>

              {/* Trust badge: hours */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-8 pb-6 border-b border-white/10">
                <i className="fas fa-clock text-[var(--color-red-light)]"></i>
                <span>Lun-Ven 8h-17h &bull; Sam 9h-13h</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
                >
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
                <a
                  href="#quote-form"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
                >
                  Soumission gratuite
                </a>
              </div>
            </div>

            {/* Right: QuoteForm inline */}
            <div id="quote-form" className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-6 border border-white/[0.08] shadow-xl">
              <div className="mb-4">
                <h2 className="text-white font-bold text-lg mb-1">Soumission gratuite a {city.name}</h2>
                <p className="text-white/50 text-xs">Reponse sous 24 heures, sans engagement</p>
              </div>
              <QuoteForm compact />
              <div className="text-center mt-4 pt-4 border-t border-white/10">
                <span className="text-white/50 text-xs">ou appelez directement </span>
                <a href={`tel:${COMPANY_INFO.phoneTel}`} className="text-white font-semibold text-sm hover:text-[var(--color-red-light)]">
                  <i className="fas fa-phone text-xs"></i> {COMPANY_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction - unique content */}
      <section className="bg-white py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <span className="section-tag">Reparation complete</span>
            <h2 className="text-3xl font-extrabold mb-6">
              Tous vos travaux de portes et fenetres a <span className="text-[var(--color-red)]">{city.name}</span>, un seul appel
            </h2>
            {city.description ? (
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">{city.description}</p>
            ) : (
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                Les proprietaires de {city.name} font face aux memes defis que partout au Quebec : les hivers rigoureux, les cycles de gel et degel, et l&apos;usure naturelle mettent a rude epreuve les portes et fenetres. Plutot que de remplacer des fenetres entieres a grand frais, la reparation ciblee permet de restaurer la performance de vos ouvertures a une fraction du cout.
              </p>
            )}
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              Chez Vosthermos, nous regroupons sous un meme toit l&apos;ensemble des specialites necessaires pour remettre a neuf vos portes et fenetres. Notre approche est simple : un technicien qualifie se deplace chez vous a {city.name}, evalue chaque ouverture et propose un plan de reparation adapte a votre budget. Pas de vente sous pression, pas de remplacement inutile.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Avec plus de 15 ans d&apos;experience et un inventaire de plus de 700 pieces de quincaillerie, nous sommes en mesure de reparer la tres grande majorite des portes et fenetres residentielles, peu importe la marque ou l&apos;annee d&apos;installation. Tous nos travaux sont garantis et nos soumissions sont gratuites.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid - 8 services */}
      <section className="bg-[var(--color-background)] py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos 8 specialites</span>
            <h2 className="text-3xl font-extrabold">
              Services de reparation disponibles a <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Chaque service est offert individuellement ou combine dans notre programme OPTI-FENETRE pour une remise a neuf complete.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allServices.map((service) => {
              const s = getServiceCard(service);
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${city.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-teal)] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-teal)] transition-colors">
                    <i className={`${s.icon} text-lg text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-[var(--color-teal)] transition-colors">{s.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[var(--color-teal)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                    En savoir plus <i className="fas fa-arrow-right text-xs"></i>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi choisir Vosthermos */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos engagements</span>
            <h2 className="text-3xl font-extrabold text-white">
              Pourquoi choisir Vosthermos a <span className="text-[var(--color-red)]">{city.name}</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "fa-tools",
                title: "Reparation plutot que remplacement",
                desc: `Nous privilegions la reparation, ce qui vous fait economiser 50 a 70% par rapport au remplacement complet de vos fenetres a ${city.name}. Un choix ecologique et economique.`,
              },
              {
                icon: "fa-award",
                title: "Plus de 15 ans d'experience",
                desc: `Depuis plus de 15 ans, notre equipe repare des portes et fenetres partout dans la region de ${city.region}. Expertise, rapidite et travail soigne garanti.`,
              },
              {
                icon: "fa-shield-alt",
                title: "Travaux garantis",
                desc: "Tous nos remplacements de thermos et nos reparations sont couverts par notre garantie. Vous avez l'esprit tranquille, on s'occupe du reste.",
              },
              {
                icon: "fa-truck",
                title: `Service a domicile a ${city.name}`,
                desc: `Notre technicien se deplace directement chez vous a ${city.name} (a seulement ${city.distance} de notre atelier) pour la soumission et les travaux. Aucun deplacement de votre part.`,
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
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
                Reparation de portes et fenetres dans <span className="text-[var(--color-red)]">tous les quartiers</span> de {city.name}
              </h2>
              <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
                Notre technicien se deplace dans chaque secteur de {city.name} pour evaluer et reparer vos portes et fenetres sur place.
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
              Reparation de portes et fenetres a{" "}
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
            {/* Also display city-specific FAQ if available */}
            {city.faq && city.faq.map((item, i) => (
              <details
                key={`city-${i}`}
                className="group bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-left hover:bg-[var(--color-background)] transition-colors">
                  <span className="faq-question">{item.question}</span>
                  <i className="fas fa-chevron-down text-[var(--color-muted)] text-sm transition-transform group-open:rotate-180 flex-shrink-0"></i>
                </summary>
                <div className="faq-answer px-6 pb-5">
                  <p className="text-[var(--color-muted)] leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="section-tag">Soumission gratuite</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Besoin d&apos;une reparation de portes ou fenetres a {city.name}?
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Soumission gratuite sous 24 heures. Notre technicien se deplacera a {city.name} pour evaluer vos besoins et vous proposer la solution la plus economique.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm mb-8">
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                100% gratuite
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                Evaluation en 24-48h
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                Travaux garantis
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                740+ pieces en stock
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quote-form"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
              >
                Demander une soumission
              </a>
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
              >
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique CTA */}
      <section className="bg-white py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-tag">Boutique en ligne</span>
          <h2 className="text-2xl font-extrabold mb-4">
            Besoin de pieces? Achetez en ligne!
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
            Plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires disponibles dans notre boutique en ligne avec livraison a {city.name}.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* Other cities */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold">
              Reparation de portes et fenetres — <span className="text-[var(--color-red)]">autres villes</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-2">
              Nous desservons egalement ces villes a proximite de {city.name}.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/reparation-portes-et-fenetres/${c.slug}`}
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
