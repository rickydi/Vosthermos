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
  const localPage = getLocalRepairCityPage(ville);
  const tpl = CITY_PAGE_SEO["reparation-portes-et-fenetres"];
  const title = localPage?.seoTitle || tpl.title(city);
  const description = localPage?.seoDescription || tpl.description(city);
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
  { slug: "remplacement-quincaillerie", icon: "fas fa-cogs", title: "Quincaillerie de portes et fenêtres", desc: "Remplacement de poignées, serrures, roulettes, manivelles et charnières pour tous types de portes-patio et fenêtres." },
  { slug: "remplacement-vitre-thermos", icon: "fas fa-snowflake", title: "Vitre thermos (unité scellée)", desc: "Remplacement de vitres thermos embuées ou fissurées. Verre Low-E et gaz argon pour une isolation optimale." },
  { slug: "reparation-porte-patio", icon: "fas fa-grip-lines-vertical", title: "Réparation de porte-patio", desc: "Roulettes, rails, vitres thermos, poignées et coupe-froid. Réparation sur place de portes-patio coulissantes." },
  { slug: "reparation-porte-fenetre", icon: "fas fa-door-closed", title: "Réparation de porte-fenêtre", desc: "Mécanismes multipoints, charnières, vitres embuées et ajustements. Experts en portes-fenêtres à battant." },
  { slug: "reparation-portes-bois", icon: "fas fa-door-open", title: "Portes en bois", desc: "Restauration, sablage, vernissage, ajustement et réparation de portes et cadres en bois. Travail artisanal." },
  { slug: "moustiquaires-sur-mesure", icon: "fas fa-border-all", title: "Moustiquaires sur mesure", desc: "Fabrication et réparation de moustiquaires pour fenêtres et portes-patio. Toile de qualité et ajustement parfait." },
  { slug: "calfeutrage", icon: "fas fa-fill-drip", title: "Calfeutrage", desc: "Calfeutrage intérieur et extérieur de portes et fenêtres. Élimination des infiltrations d'air et amélioration de l'isolation." },
  { slug: "coupe-froid", icon: "fas fa-temperature-low", title: "Coupe-froid", desc: "Remplacement de coupe-froid usés pour bloquer les courants d'air et réduire vos coûts de chauffage." },
  { slug: "desembuage", icon: "fas fa-eye", title: "Désembuage", desc: "Traitement de désembuage pour redonner transparence et clarté à vos vitres thermos embuées." },
  { slug: "insertion-porte", icon: "fas fa-door-closed", title: "Insertion de porte", desc: "Remplacement de l'insertion vitrée de votre porte d'entrée. Améliore l'esthétique et l'isolation." },
];

const LOCAL_REPAIR_CITY_PAGES = {
  montreal: {
    seoTitle: "Reparation fenetres Montreal | Vosthermos",
    seoDescription:
      `Reparation fenetres Montreal: thermos embues, manivelles, coupe-froid, calfeutrage, quincaillerie et portes-patio. Reparer avant de remplacer. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation fenetres Montreal",
    lead:
      "Service specialise de reparation fenetres Montreal pour triplex, duplex, condos et maisons: thermos embues, manivelles, pentures, coupe-froid, calfeutrage, moustiquaires, cadres de bois, portes-patio et quincaillerie. L'objectif est simple: reparer l'ouverture existante avant de proposer un remplacement complet.",
    schemaName: "Reparation fenetres Montreal",
    schemaDescription:
      "Service local de reparation de fenetres a Montreal: vitres thermos, quincaillerie, manivelles, portes patio, calfeutrage, coupe-froid, moustiquaires, desembuage, portes et restauration de bois.",
    alternateName: [
      "reparation fenetres Montreal",
      "reparation fenetre Montreal",
      "reparation fenetre a Montreal",
      "reparation de fenetre Montreal",
      "reparation de fenetre a Montreal",
      "reparation de fenetres Montreal",
      "reparation des fenetres Montreal",
      "reparation de portes et fenetres Montreal",
      "reparation portes et fenetres Montreal",
      "reparation porte et fenetre Montreal",
      "portes et fenetres Montreal",
    ],
    sections: [
      {
        heading: "Reparation fenetres Montreal: reparer avant de remplacer",
        paragraphs: [
          "A Montreal, plusieurs recherches partent d'une seule intention: trouver quelqu'un qui repare les fenetres sans vendre automatiquement une fenetre neuve. Les problemes les plus frequents sont les thermos embues, les manivelles qui tournent dans le vide, les pentures usees, les coupe-froid fatigues, le calfeutrage fissure et les moustiquaires dechirees.",
          "Le service repond directement a cette intention de reparation fenetres Montreal. Nos techniciens evaluent chaque ouverture et priorisent les reparations ciblees qui prolongent la vie des fenetres existantes lorsque le cadre est encore sain.",
          "Nous desservons notamment Rosemont, Villeray, Ahuntsic, Verdun, le Plateau, Hochelaga, NDG et les arrondissements centraux pour les soumissions, la prise de mesures, les pieces de quincaillerie, le remplacement de thermos et les travaux d'etancheite.",
        ],
      },
      {
        heading: "Thermos, quincaillerie, coupe-froid et calfeutrage a Montreal",
        paragraphs: [
          "Une meme fenetre peut demander plus qu'un seul service: remplacement de vitre thermos, reparation de manivelle, changement de serrure, coupe-froid neuf, calfeutrage exterieur ou ajustement du cadre. C'est pourquoi la page Montreal relie les services specialises au lieu de laisser Google choisir une mauvaise page.",
          "Pour une vitre thermos embuee ou fissuree, la page de remplacement de thermos Montreal est la plus precise. Pour une buee legere, le desembuage Montreal peut etre analyse. Pour une fenetre qui ouvre mal, la quincaillerie et les mecanismes sont verifies en premier.",
          "Ce maillage garde la page principale forte pour reparation fenetres Montreal, tout en envoyant les recherches plus precises vers la bonne page specialisee.",
        ],
      },
      {
        heading: "Preuves utiles pour une soumission a Montreal",
        paragraphs: [
          "Pour accelerer l'estimation, les clients peuvent envoyer des photos de la fenetre, du thermos embue, de la manivelle, de la serrure, du coupe-froid ou du calfeutrage. Cela permet d'identifier la bonne piece et de confirmer si une visite de mesure est necessaire.",
          "Vosthermos garde un inventaire de plus de 740 pieces de portes et fenetres afin de regler plus rapidement les demandes de quincaillerie, roulettes, poignees, serrures, manivelles, moustiquaires et coupe-froid dans le secteur de Montreal.",
          "Les travaux courants a Montreal touchent autant les triplex et duplex que les condos, coproprietes, maisons de ville et immeubles locatifs. Le but est de donner une recommandation claire: reparer, remplacer seulement le thermos, ou remplacer l'ouverture seulement si la reparation n'est plus rentable.",
        ],
      },
    ],
    faq: [
      {
        q: "Offrez-vous la reparation fenetres a Montreal?",
        a: "Oui. Pour une reparation fenetres Montreal, nous verifions le thermos, la manivelle, les pentures, la quincaillerie, le coupe-froid, le calfeutrage, la moustiquaire et le cadre. L'objectif est de reparer la fenetre existante lorsque c'est possible au lieu de proposer un remplacement complet.",
      },
      {
        q: "Quels problemes de fenetre reparez-vous a Montreal?",
        a: "Nous reparons les fenetres a Montreal pour les thermos embues, infiltrations d'air, manivelles brisees, serrures usees, coupe-froid fatigues, moustiquaires dechirees, cadres de bois abimes et calfeutrage fissure.",
      },
      {
        q: "Faites-vous la reparation de portes et fenetres a Montreal?",
        a: "Oui. Nous reparons les portes et fenetres a Montreal: vitres thermos embuees, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires, desembuage et portes de bois. Le technicien verifie les ouvertures sur place et recommande les travaux utiles.",
      },
      {
        q: "Pourquoi reparer plutot que remplacer les portes et fenetres a Montreal?",
        a: "Dans beaucoup de triplex, duplex et condos de Montreal, le cadre est encore reparable. Remplacer le thermos, la quincaillerie ou le calfeutrage coute souvent beaucoup moins cher qu'une fenetre complete et evite des travaux inutiles.",
      },
      {
        q: "Quelle page dois-je choisir si ma vitre thermos est embuee a Montreal?",
        a: "Si la buee est entre les deux vitres, il faut verifier l'unite scellee. La page remplacement vitre thermos Montreal est la plus precise lorsque le thermos doit etre change. La page desembuage Montreal sert a evaluer si une recuperation est possible avant le remplacement.",
      },
    ],
  },
  chateauguay: {
    seoTitle: "Reparation de portes et fenetres Chateauguay | Vosthermos",
    seoDescription:
      `Reparation de portes et fenetres a Chateauguay: thermos embues, quincaillerie, portes patio, calfeutrage, coupe-froid et cadres affectes par l'humidite. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de portes et fenetres a Chateauguay",
    lead:
      "Service complet de reparation de portes et fenetres a Chateauguay pour bungalows, split-levels, maisons unifamiliales et proprietes pres de la riviere: thermos embues, quincaillerie usee, portes patio, calfeutrage, coupe-froid et cadres fatigues.",
    schemaName: "Reparation de portes et fenetres a Chateauguay",
    schemaDescription:
      "Service local de reparation de portes et fenetres a Chateauguay: vitres thermos, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires, cadres et etancheite.",
    alternateName: [
      "reparation de portes et fenetres Chateauguay",
      "reparation portes et fenetres Chateauguay",
      "reparation porte et fenetre Chateauguay",
      "portes et fenetres Chateauguay",
      "porte et fenetre Chateauguay",
    ],
    sections: [
      {
        heading: "Reparation de portes et fenetres Chateauguay: humidite, thermos et quincaillerie",
        paragraphs: [
          "A Chateauguay, la proximite de la riviere Chateauguay et du fleuve Saint-Laurent expose les portes et fenetres a plus d'humidite. Les joints fatiguent, les cadres travaillent, les thermos deviennent embues et la quincaillerie peut s'user plus rapidement.",
          "Le service a Chateauguay couvre la reparation complete de portes et fenetres, pas seulement une porte-fenetre a battant. Nos techniciens verifient les thermos, manivelles, roulettes, serrures, coupe-froid, calfeutrage, moustiquaires et cadres avant de recommander une intervention.",
          "Nous desservons le centre-ville, Chateauguay-Centre, Maple Grove, Lery et Mercier-Ouest pour les bungalows et split-levels des annees 1960 a 1980, ou une reparation ciblee coute souvent moins cher qu'un remplacement complet.",
        ],
      },
    ],
    faq: [
      {
        q: "Faites-vous la reparation de portes et fenetres a Chateauguay?",
        a: "Oui. Nous reparons les portes et fenetres a Chateauguay: vitres thermos embuees, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires et cadres. Le technicien verifie chaque ouverture et recommande la reparation utile.",
      },
      {
        q: "Quelle est la difference entre reparation de portes et fenetres et porte-fenetre?",
        a: "Une porte-fenetre vise surtout un type de porte a battant avec mecanisme, charnieres et poignee. La reparation de portes et fenetres couvre l'ensemble des ouvertures: fenetres, thermos, portes patio, quincaillerie, calfeutrage, coupe-froid et cadres.",
      },
    ],
  },
  "saint-lambert": {
    seoTitle: "Reparation de portes et fenetres Saint-Lambert | Vosthermos",
    seoDescription:
      `Reparation de portes et fenetres a Saint-Lambert: thermos embues, fenetres en bois, quincaillerie, calfeutrage, coupe-froid et portes patio. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de portes et fenetres a Saint-Lambert",
    lead:
      "Service local de reparation de portes et fenetres a Saint-Lambert pour maisons de caractere, condos et coproprietes: remplacement de thermos, quincaillerie, calfeutrage, coupe-froid, moustiquaires, portes patio et fenetres en bois.",
    schemaName: "Reparation de portes et fenetres a Saint-Lambert",
    schemaDescription:
      "Service local a Saint-Lambert pour reparer portes et fenetres: vitres thermos, fenetres en bois, quincaillerie, portes patio, calfeutrage, coupe-froid et moustiquaires.",
    alternateName: [
      "reparation fenetre Saint-Lambert",
      "reparation fenetres Saint-Lambert",
      "reparation portes et fenetres Saint-Lambert",
      "remplacement thermos Saint-Lambert",
      "fenetre Saint-Lambert",
    ],
    sections: [
      {
        heading: "Reparation de fenetres Saint-Lambert: thermos, bois et etancheite",
        paragraphs: [
          "A Saint-Lambert, plusieurs proprietes ont une valeur architecturale ou un niveau de finition qui merite une reparation precise plutot qu'un remplacement complet. Les thermos peuvent etre changes, les cadres en bois peuvent etre ajustes et la quincaillerie peut etre remise en fonction sans denaturer la maison.",
          "Nous intervenons dans le Village, Preville, Riverside, Alexandra et les secteurs pres de la gare pour les fenetres embuees, les portes patio difficiles a glisser, le calfeutrage fatigue et les coupe-froid qui laissent passer l'air.",
          "L'objectif est de garder le cadre existant lorsqu'il est sain, de corriger la vraie cause du probleme et d'eviter les travaux inutiles.",
        ],
      },
    ],
    faq: [
      {
        q: "Reparez-vous les fenetres en bois a Saint-Lambert?",
        a: "Oui. Nous pouvons restaurer les cadres en bois, remplacer le thermos, ajuster les mecanismes, refaire le calfeutrage et ameliorer l'etancheite sans enlever le cachet de la propriete.",
      },
      {
        q: "Faites-vous les condos et coproprietes a Saint-Lambert?",
        a: "Oui. Nous pouvons intervenir pour une unite ou regrouper plusieurs thermos dans une copropriete afin de simplifier la prise de mesures, la commande et l'installation.",
      },
    ],
  },
  "saint-hubert": {
    seoTitle: "Reparation de portes et fenetres Saint-Hubert | Vosthermos",
    seoDescription:
      `Reparation de portes et fenetres a Saint-Hubert: thermos embues, portes patio, manivelles, quincaillerie, calfeutrage et coupe-froid. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de portes et fenetres a Saint-Hubert",
    lead:
      "Service complet de reparation de portes et fenetres a Saint-Hubert pour bungalows, split-levels, jumeles, maisons de ville et condos: thermos, portes patio, quincaillerie, coupe-froid, moustiquaires et calfeutrage.",
    schemaName: "Reparation de portes et fenetres a Saint-Hubert",
    schemaDescription:
      "Service local de reparation a Saint-Hubert pour vitres thermos, portes patio, quincaillerie, manivelles, coupe-froid, moustiquaires et calfeutrage.",
    alternateName: [
      "reparation fenetre Saint-Hubert",
      "reparation portes et fenetres Saint-Hubert",
      "remplacement thermos Saint-Hubert",
      "reparation porte patio Saint-Hubert",
      "fenetre Saint-Hubert",
    ],
    sections: [
      {
        heading: "Reparation Saint-Hubert: thermos, portes patio et quincaillerie",
        paragraphs: [
          "Saint-Hubert regroupe un tres grand nombre de maisons construites entre les annees 1970 et 2000. C'est exactement l'age ou les thermos perdent leur etancheite, ou les manivelles fatiguent et ou les portes patio deviennent lourdes a glisser.",
          "Nous couvrons Lafleche, Maricourt, Orchard, Grande Allee et les secteurs pres du Parc de la Cite pour verifier chaque ouverture et proposer la reparation la plus rentable.",
          "Quand le cadre est sain, remplacer le thermos, les roulettes, la manivelle, le coupe-froid ou le calfeutrage coute beaucoup moins cher qu'une fenetre neuve.",
        ],
      },
    ],
    faq: [
      {
        q: "Faites-vous le remplacement de thermos a Saint-Hubert?",
        a: "Oui. Nous remplacons les vitres thermos embuees ou fissurees a Saint-Hubert en conservant le cadre existant lorsque possible.",
      },
      {
        q: "Reparez-vous les portes patio a Saint-Hubert?",
        a: "Oui. Nous remplacons les roulettes, ajustons le rail, changeons la serrure, la poignee et le coupe-froid afin que la porte glisse mieux sans devoir remplacer toute la porte.",
      },
    ],
  },
  "greenfield-park": {
    seoTitle: "Reparation de portes et fenetres Greenfield Park | Vosthermos",
    seoDescription:
      `Reparation de portes et fenetres a Greenfield Park: thermos embues, quincaillerie, portes patio, coupe-froid, moustiquaires et calfeutrage. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Reparation de portes et fenetres a Greenfield Park",
    lead:
      "Service local a Greenfield Park pour reparer les portes et fenetres des maisons, duplex, petits immeubles et condos: thermos, quincaillerie, portes patio, calfeutrage, coupe-froid et moustiquaires.",
    schemaName: "Reparation de portes et fenetres a Greenfield Park",
    schemaDescription:
      "Service de reparation de portes et fenetres a Greenfield Park: vitres thermos, quincaillerie, portes patio, coupe-froid, moustiquaires et calfeutrage.",
    alternateName: [
      "reparation fenetre Greenfield Park",
      "reparation portes et fenetres Greenfield Park",
      "remplacement thermos Greenfield Park",
      "fenetre Greenfield Park",
    ],
    sections: [
      {
        heading: "Greenfield Park: reparer les fenetres existantes avant de remplacer",
        paragraphs: [
          "Greenfield Park compte beaucoup de maisons et petits immeubles dont les cadres sont encore reparables, meme si les thermos, manivelles, coupe-froid ou portes patio montrent des signes d'usure.",
          "Nous intervenons dans les secteurs Churchill, Bellevue, Empire, Victoria et Regent pour les fenetres embuees, les portes patio lourdes, les moustiquaires endommagees et les problemes d'infiltration d'air.",
          "La reparation ciblee permet souvent de prolonger la vie des ouvertures existantes tout en ameliorant le confort et l'isolation.",
        ],
      },
    ],
    faq: [
      {
        q: "Desservez-vous Greenfield Park?",
        a: "Oui. Greenfield Park fait partie de notre zone de service locale pour la reparation de portes et fenetres, le remplacement de thermos, les portes patio, la quincaillerie et le calfeutrage.",
      },
      {
        q: "Une vieille fenetre de Greenfield Park peut-elle etre reparee?",
        a: "Souvent oui. Si le cadre est sain, remplacer le thermos, la quincaillerie ou le coupe-froid peut eviter un remplacement complet beaucoup plus couteux.",
      },
    ],
  },
};

function getLocalRepairCityPage(citySlug) {
  return LOCAL_REPAIR_CITY_PAGES[citySlug] || null;
}

export default async function ReparationVillePage({ params }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();
  const localPage = getLocalRepairCityPage(ville);

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
    if (city.slug === "montreal" && service.slug === "reparation-porte-patio") {
      return {
        ...service,
        title: "Reparation porte patio a Montreal",
        desc: "Roulettes, rail, poignee, serrure et coupe-froid. Lien direct vers la page specialisee pour la reparation de porte patio a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "remplacement-quincaillerie") {
      return {
        ...service,
        title: "Quincaillerie fenetre a Montreal",
        desc: "Manivelles, poignees, serrures, pentures et mecanismes de fenetres. Lien direct vers la page specialisee pour la quincaillerie de fenetre a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "reparation-porte-fenetre") {
      return {
        ...service,
        title: "Reparation porte-fenetre a Montreal",
        desc: "Mecanismes multipoints, pentures, poignees, ajustement et thermos. Lien direct vers la page specialisee pour la reparation de porte-fenetre a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "calfeutrage") {
      return {
        ...service,
        title: "Calfeutrage fenetre a Montreal",
        desc: "Joints de fenetres, portes, portes-patio et scellant exterieur. Lien direct vers la page specialisee pour le calfeutrage a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "coupe-froid") {
      return {
        ...service,
        title: "Coupe-froid fenetre a Montreal",
        desc: "Courants d'air, joints fatigues, portes et fenetres mal etanches. Lien direct vers la page specialisee pour le coupe-froid a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "moustiquaires-sur-mesure") {
      return {
        ...service,
        title: "Moustiquaire fenetre a Montreal",
        desc: "Fabrication, reparation et ajustement de moustiquaires de fenetres et portes-patio. Lien direct vers la page specialisee a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "reparation-portes-bois") {
      return {
        ...service,
        title: "Reparation fenetre en bois a Montreal",
        desc: "Cadres de bois, greffes, ajustement, finition et thermos dans les fenetres anciennes. Lien direct vers la page specialisee a Montreal.",
      };
    }
    if (city.slug === "montreal" && service.slug === "remplacement-vitre-thermos") {
      return {
        ...service,
        title: "Remplacement vitre thermos a Montreal",
        desc: "Vitres thermos embuees, unites scellees fissurees et thermos de triplex en fin de vie. Lien direct vers la page specialisee pour le remplacement vitre thermos a Montreal.",
      };
    }
    if (city.slug === "delson" && service.slug === "remplacement-vitre-thermos") {
      return {
        ...service,
        title: "Remplacement vitre thermos a Delson",
        desc: "Thermos embues, unites scellees fissurees et vitres de maisons des annees 1970-2000. Lien direct vers la page specialisee pour le remplacement vitre thermos a Delson.",
      };
    }
    if (city.slug === "montreal" && service.slug === "desembuage") {
      return {
        ...service,
        title: "Vitre thermos embuee a Montreal",
        desc: "Buee entre les vitres, halo blanchatre et condensation persistante. Lien direct vers la page specialisee pour le desembuage de vitre thermos a Montreal.",
      };
    }
    return service;
  };

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);

  const provider = {
    "@type": "LocalBusiness",
    "@id": "https://www.vosthermos.com/#business",
    name: "Vosthermos",
    telephone: COMPANY_INFO.phoneTel,
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
    name: localPage?.schemaName || `Reparation de portes et fenetres a ${city.name}`,
    description: localPage?.schemaDescription || `Service complet de reparation de portes et fenetres a ${city.name}. Quincaillerie, vitres thermos, portes en bois, moustiquaires, calfeutrage, coupe-froid, desembuage et insertion de porte.`,
    ...(localPage?.alternateName ? { alternateName: localPage.alternateName } : {}),
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
    ...(localPage?.faq || []),
    {
      q: `Quels services de réparation de portes et fenêtres offrez-vous à ${city.name}?`,
      a: `À ${city.name}, nous offrons la gamme complète de réparation de portes et fenêtres : remplacement de quincaillerie (poignées, serrures, roulettes), remplacement de vitres thermos embuées, réparation de portes en bois, fabrication de moustiquaires sur mesure, calfeutrage, coupe-froid, désembuage et insertion de porte. Tous nos travaux sont garantis.`,
    },
    {
      q: `Combien coûte une réparation de fenêtres à ${city.name}?`,
      a: `Le coût varie selon le type de réparation. Un remplacement de thermos débute à environ 150$ par unité installée, la quincaillerie à partir de 4.99$ la pièce. Nous offrons des soumissions gratuites à domicile partout à ${city.name} et dans la région de ${city.region}. Appelez-nous au ${COMPANY_INFO.phone}.`,
    },
    {
      q: `Est-ce que Vosthermos se déplace à ${city.name}?`,
      a: `Oui, notre équipe se déplace à ${city.name} (à ${city.distance} de notre atelier)${city.neighborhoods ? ` et couvre tous les quartiers incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}. Nous desservons également toute la région de ${city.region}. Prenez rendez-vous en ligne ou appelez-nous.`,
    },
    {
      q: `Vaut-il mieux réparer ou remplacer mes fenêtres à ${city.name}?`,
      a: `Dans la majorité des cas, la réparation est beaucoup plus économique que le remplacement complet. Un remplacement de thermos ou de quincaillerie peut prolonger la vie de vos fenêtres de 15 à 20 ans à une fraction du coût d'une fenêtre neuve. Notre technicien évaluera l'état de vos fenêtres lors de la soumission gratuite et vous recommandera la meilleure option.`,
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
                  <i className="fas fa-map-marker-alt mr-1"></i> {city.region} &bull; à {city.distance} de nos bureaux
                </span>
                {city.population && (
                  <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                    <i className="fas fa-users mr-1"></i> {city.population}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                {localPage?.h1 || (
                  <>
                    Réparation de portes et fenêtres à{" "}
                    <span className="text-[var(--color-red)]">{city.name}</span>
                  </>
                )}
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                {localPage?.lead || `Vosthermos est votre spécialiste en réparation de portes et fenêtres à ${city.name}. Que ce soit pour un thermos embué, une quincaillerie défaillante ou un calfeutrage à refaire, notre équipe intervient rapidement avec un service garanti sur tous les travaux.`}
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
            <span className="section-tag">Réparation complète</span>
            <h2 className="text-3xl font-extrabold mb-6">
              Tous vos travaux de portes et fenêtres à <span className="text-[var(--color-red)]">{city.name}</span>, un seul appel
            </h2>
            {city.description ? (
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">{city.description}</p>
            ) : (
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                Les propriétaires de {city.name} font face aux mêmes défis que partout au Québec : les hivers rigoureux, les cycles de gel et dégel, et l&apos;usure naturelle mettent à rude épreuve les portes et fenêtres. Plutôt que de remplacer des fenêtres entières à grand frais, la réparation ciblée permet de restaurer la performance de vos ouvertures à une fraction du coût.
              </p>
            )}
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              Chez Vosthermos, nous regroupons sous un même toit l&apos;ensemble des spécialités nécessaires pour remettre à neuf vos portes et fenêtres. Notre approche est simple : un technicien qualifié se déplace chez vous à {city.name}, évalue chaque ouverture et propose un plan de réparation adapté à votre budget. Pas de vente sous pression, pas de remplacement inutile.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Avec plus de 15 ans d&apos;expérience et un inventaire de plus de 700 pièces de quincaillerie, nous sommes en mesure de réparer la très grande majorité des portes et fenêtres résidentielles, peu importe la marque ou l&apos;année d&apos;installation. Tous nos travaux sont garantis et nos soumissions sont gratuites.
            </p>
            {localPage?.sections?.map((section) => (
              <div key={section.heading} className="mt-10">
                <h2 className="text-2xl font-extrabold mb-4">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-[var(--color-muted)] leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid - 8 services */}
      <section className="bg-[var(--color-background)] py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos spécialités</span>
            <h2 className="text-3xl font-extrabold">
              Services de réparation disponibles à <span className="text-[var(--color-red)]">{city.name}</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              Chaque service est offert individuellement ou combiné dans notre programme OPTI-FENÊTRE pour une remise à neuf complète.
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
              Pourquoi choisir Vosthermos à <span className="text-[var(--color-red)]">{city.name}</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "fa-tools",
                title: "Réparation plutôt que remplacement",
                desc: `Nous privilégions la réparation, ce qui vous fait économiser 50 à 70% par rapport au remplacement complet de vos fenêtres à ${city.name}. Un choix écologique et économique.`,
              },
              {
                icon: "fa-award",
                title: "Plus de 15 ans d'expérience",
                desc: `Depuis plus de 15 ans, notre équipe répare des portes et fenêtres partout dans la région de ${city.region}. Expertise, rapidité et travail soigné garanti.`,
              },
              {
                icon: "fa-shield-alt",
                title: "Travaux garantis",
                desc: "Tous nos remplacements de thermos et nos réparations sont couverts par notre garantie. Vous avez l'esprit tranquille, on s'occupe du reste.",
              },
              {
                icon: "fa-truck",
                title: `Service à domicile à ${city.name}`,
                desc: `Notre technicien se déplace directement chez vous à ${city.name} (à seulement ${city.distance} de notre atelier) pour la soumission et les travaux. Aucun déplacement de votre part.`,
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
                Réparation de portes et fenêtres dans <span className="text-[var(--color-red)]">tous les quartiers</span> de {city.name}
              </h2>
              <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
                Notre technicien se déplace dans chaque secteur de {city.name} pour évaluer et réparer vos portes et fenêtres sur place.
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
              Réparation de portes et fenêtres à{" "}
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
              Besoin d&apos;une réparation de portes ou fenêtres à {city.name}?
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Soumission gratuite sous 24 heures. Notre technicien se déplacera à {city.name} pour évaluer vos besoins et vous proposer la solution la plus économique.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm mb-8">
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                100% gratuite
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
                Évaluation en 24-48h
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
            Plus de 740 pièces de remplacement pour portes, fenêtres et moustiquaires disponibles dans notre boutique en ligne avec livraison à {city.name}.
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
              Réparation de portes et fenêtres — <span className="text-[var(--color-red)]">autres villes</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-2">
              Nous desservons également ces villes à proximité de {city.name}.
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
