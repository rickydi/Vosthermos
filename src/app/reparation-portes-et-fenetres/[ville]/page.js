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
    seoTitle: "Réparation fenêtres Montréal | Vosthermos",
    seoDescription:
      `Réparation fenêtres Montréal: thermos embués, manivelles, coupe-froid, calfeutrage, quincaillerie et portes-patio. Réparer avant de remplacer. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation fenêtres Montréal",
    lead:
      "Service spécialisé de réparation fenêtres Montréal pour triplex, duplex, condos et maisons: thermos embués, manivelles, pentures, coupe-froid, calfeutrage, moustiquaires, cadres de bois, portes-patio et quincaillerie. L'objectif est simple: réparer l'ouverture existante avant de proposer un remplacement complet.",
    schemaName: "Réparation fenêtres Montréal",
    schemaDescription:
      "Service local de réparation de fenêtres à Montréal: vitres thermos, quincaillerie, manivelles, portes patio, calfeutrage, coupe-froid, moustiquaires, désembuage, portes et restauration de bois.",
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
        heading: "Réparation fenêtres Montréal: réparer avant de remplacer",
        paragraphs: [
          "À Montréal, plusieurs recherches partent d'une seule intention: trouver quelqu'un qui répare les fenêtres sans vendre automatiquement une fenêtre neuve. Les problèmes les plus fréquents sont les thermos embués, les manivelles qui tournent dans le vide, les pentures usées, les coupe-froid fatigués, le calfeutrage fissuré et les moustiquaires déchirées.",
          "Le service répond directement à cette intention de réparation fenêtres Montréal. Nos techniciens évaluent chaque ouverture et priorisent les réparations ciblées qui prolongent la vie des fenêtres existantes lorsque le cadre est encore sain.",
          "Nous desservons notamment Rosemont, Villeray, Ahuntsic, Verdun, le Plateau, Hochelaga, NDG et les arrondissements centraux pour les soumissions, la prise de mesures, les pièces de quincaillerie, le remplacement de thermos et les travaux d'étanchéité.",
        ],
      },
      {
        heading: "Thermos, quincaillerie, coupe-froid et calfeutrage à Montréal",
        paragraphs: [
          "Une même fenêtre peut demander plus qu'un seul service: remplacement de vitre thermos, réparation de manivelle, changement de serrure, coupe-froid neuf, calfeutrage extérieur ou ajustement du cadre. C'est pourquoi la page Montréal relie les services spécialisés au lieu de laisser Google choisir une mauvaise page.",
          "Pour une vitre thermos embuée ou fissurée, la page de remplacement de thermos Montréal est la plus précise. Pour une buée légère, le désembuage Montréal peut être analysé. Pour une fenêtre qui ouvre mal, la quincaillerie et les mécanismes sont vérifiés en premier.",
          "Ce maillage garde la page principale forte pour réparation fenêtres Montréal, tout en envoyant les recherches plus précises vers la bonne page spécialisée.",
        ],
      },
      {
        heading: "Preuves utiles pour une soumission à Montréal",
        paragraphs: [
          "Pour accélérer l'estimation, les clients peuvent envoyer des photos de la fenêtre, du thermos embué, de la manivelle, de la serrure, du coupe-froid ou du calfeutrage. Cela permet d'identifier la bonne pièce et de confirmer si une visite de mesure est nécessaire.",
          "Vosthermos garde un inventaire de plus de 740 pièces de portes et fenêtres afin de régler plus rapidement les demandes de quincaillerie, roulettes, poignées, serrures, manivelles, moustiquaires et coupe-froid dans le secteur de Montréal.",
          "Les travaux courants à Montréal touchent autant les triplex et duplex que les condos, copropriétés, maisons de ville et immeubles locatifs. Le but est de donner une recommandation claire: réparer, remplacer seulement le thermos, ou remplacer l'ouverture seulement si la réparation n'est plus rentable.",
        ],
      },
    ],
    faq: [
      {
        q: "Offrez-vous la réparation fenêtres à Montréal?",
        a: "Oui. Pour une réparation fenêtres Montréal, nous vérifions le thermos, la manivelle, les pentures, la quincaillerie, le coupe-froid, le calfeutrage, la moustiquaire et le cadre. L'objectif est de réparer la fenêtre existante lorsque c'est possible au lieu de proposer un remplacement complet.",
      },
      {
        q: "Quels problèmes de fenêtre réparez-vous à Montréal?",
        a: "Nous réparons les fenêtres à Montréal pour les thermos embués, infiltrations d'air, manivelles brisées, serrures usées, coupe-froid fatigués, moustiquaires déchirées, cadres de bois abîmés et calfeutrage fissuré.",
      },
      {
        q: "Faites-vous la réparation de portes et fenêtres à Montréal?",
        a: "Oui. Nous réparons les portes et fenêtres à Montréal: vitres thermos embuées, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires, désembuage et portes de bois. Le technicien vérifie les ouvertures sur place et recommande les travaux utiles.",
      },
      {
        q: "Pourquoi réparer plutôt que remplacer les portes et fenêtres à Montréal?",
        a: "Dans beaucoup de triplex, duplex et condos de Montréal, le cadre est encore réparable. Remplacer le thermos, la quincaillerie ou le calfeutrage coûte souvent beaucoup moins cher qu'une fenêtre complète et évite des travaux inutiles.",
      },
      {
        q: "Quelle page dois-je choisir si ma vitre thermos est embuée à Montréal?",
        a: "Si la buée est entre les deux vitres, il faut vérifier l'unité scellée. La page remplacement vitre thermos Montréal est la plus précise lorsque le thermos doit être changé. La page désembuage Montréal sert à évaluer si une récupération est possible avant le remplacement.",
      },
    ],
  },
  chateauguay: {
    seoTitle: "Réparation de portes et fenêtres Châteauguay | Vosthermos",
    seoDescription:
      `Réparation de portes et fenêtres à Châteauguay: thermos embués, quincaillerie, portes patio, calfeutrage, coupe-froid et cadres affectés par l'humidité. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de portes et fenêtres à Châteauguay",
    lead:
      "Service complet de réparation de portes et fenêtres à Châteauguay pour bungalows, split-levels, maisons unifamiliales et propriétés près de la rivière: thermos embués, quincaillerie usée, portes patio, calfeutrage, coupe-froid et cadres fatigués.",
    schemaName: "Réparation de portes et fenêtres à Châteauguay",
    schemaDescription:
      "Service local de réparation de portes et fenêtres à Châteauguay: vitres thermos, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires, cadres et étanchéité.",
    alternateName: [
      "reparation de portes et fenetres Chateauguay",
      "reparation portes et fenetres Chateauguay",
      "reparation porte et fenetre Chateauguay",
      "portes et fenetres Chateauguay",
      "porte et fenetre Chateauguay",
    ],
    sections: [
      {
        heading: "Réparation de portes et fenêtres Châteauguay: humidité, thermos et quincaillerie",
        paragraphs: [
          "À Châteauguay, la proximité de la rivière Châteauguay et du fleuve Saint-Laurent expose les portes et fenêtres à plus d'humidité. Les joints fatiguent, les cadres travaillent, les thermos deviennent embués et la quincaillerie peut s'user plus rapidement.",
          "Le service à Châteauguay couvre la réparation complète de portes et fenêtres, pas seulement une porte-fenêtre à battant. Nos techniciens vérifient les thermos, manivelles, roulettes, serrures, coupe-froid, calfeutrage, moustiquaires et cadres avant de recommander une intervention.",
          "Nous desservons le centre-ville, Châteauguay-Centre, Maple Grove, Léry et Mercier-Ouest pour les bungalows et split-levels des années 1960 à 1980, où une réparation ciblée coûte souvent moins cher qu'un remplacement complet.",
        ],
      },
    ],
    faq: [
      {
        q: "Faites-vous la réparation de portes et fenêtres à Châteauguay?",
        a: "Oui. Nous réparons les portes et fenêtres à Châteauguay: vitres thermos embuées, quincaillerie, portes patio, calfeutrage, coupe-froid, moustiquaires et cadres. Le technicien vérifie chaque ouverture et recommande la réparation utile.",
      },
      {
        q: "Quelle est la différence entre réparation de portes et fenêtres et porte-fenêtre?",
        a: "Une porte-fenêtre vise surtout un type de porte à battant avec mécanisme, charnières et poignée. La réparation de portes et fenêtres couvre l'ensemble des ouvertures: fenêtres, thermos, portes patio, quincaillerie, calfeutrage, coupe-froid et cadres.",
      },
    ],
  },
  "saint-lambert": {
    seoTitle: "Réparation de portes et fenêtres Saint-Lambert | Vosthermos",
    seoDescription:
      `Réparation de portes et fenêtres à Saint-Lambert: thermos embués, fenêtres en bois, quincaillerie, calfeutrage, coupe-froid et portes patio. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de portes et fenêtres à Saint-Lambert",
    lead:
      "Service local de réparation de portes et fenêtres à Saint-Lambert pour maisons de caractère, condos et copropriétés: remplacement de thermos, quincaillerie, calfeutrage, coupe-froid, moustiquaires, portes patio et fenêtres en bois.",
    schemaName: "Réparation de portes et fenêtres à Saint-Lambert",
    schemaDescription:
      "Service local à Saint-Lambert pour réparer portes et fenêtres: vitres thermos, fenêtres en bois, quincaillerie, portes patio, calfeutrage, coupe-froid et moustiquaires.",
    alternateName: [
      "reparation fenetre Saint-Lambert",
      "reparation fenetres Saint-Lambert",
      "reparation portes et fenetres Saint-Lambert",
      "fenetre Saint-Lambert",
    ],
    sections: [
      {
        heading: "Réparation de fenêtres Saint-Lambert: thermos, bois et étanchéité",
        paragraphs: [
          "À Saint-Lambert, plusieurs propriétés ont une valeur architecturale ou un niveau de finition qui mérite une réparation précise plutôt qu'un remplacement complet. Les thermos peuvent être changés, les cadres en bois peuvent être ajustés et la quincaillerie peut être remise en fonction sans dénaturer la maison.",
          "Nous intervenons dans le Village, Préville, Riverside, Alexandra et les secteurs près de la gare pour les fenêtres embuées, les portes patio difficiles à glisser, le calfeutrage fatigué et les coupe-froid qui laissent passer l'air.",
          "L'objectif est de garder le cadre existant lorsqu'il est sain, de corriger la vraie cause du problème et d'éviter les travaux inutiles.",
        ],
      },
    ],
    faq: [
      {
        q: "Réparez-vous les fenêtres en bois à Saint-Lambert?",
        a: "Oui. Nous pouvons restaurer les cadres en bois, remplacer le thermos, ajuster les mécanismes, refaire le calfeutrage et améliorer l'étanchéité sans enlever le cachet de la propriété.",
      },
      {
        q: "Faites-vous les condos et copropriétés à Saint-Lambert?",
        a: "Oui. Nous pouvons intervenir pour une unité ou regrouper plusieurs thermos dans une copropriété afin de simplifier la prise de mesures, la commande et l'installation.",
      },
    ],
  },
  "saint-hubert": {
    seoTitle: "Réparation de portes et fenêtres Saint-Hubert | Vosthermos",
    seoDescription:
      `Réparation de portes et fenêtres à Saint-Hubert: thermos embués, portes patio, manivelles, quincaillerie, calfeutrage et coupe-froid. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de portes et fenêtres à Saint-Hubert",
    lead:
      "Service complet de réparation de portes et fenêtres à Saint-Hubert pour bungalows, split-levels, jumelés, maisons de ville et condos: thermos, portes patio, quincaillerie, coupe-froid, moustiquaires et calfeutrage.",
    schemaName: "Réparation de portes et fenêtres à Saint-Hubert",
    schemaDescription:
      "Service local de réparation à Saint-Hubert pour vitres thermos, portes patio, quincaillerie, manivelles, coupe-froid, moustiquaires et calfeutrage.",
    alternateName: [
      "reparation fenetre Saint-Hubert",
      "reparation portes et fenetres Saint-Hubert",
      "reparation porte patio Saint-Hubert",
      "fenetre Saint-Hubert",
    ],
    sections: [
      {
        heading: "Réparation Saint-Hubert: thermos, portes patio et quincaillerie",
        paragraphs: [
          "Saint-Hubert regroupe un très grand nombre de maisons construites entre les années 1970 et 2000. C'est exactement l'âge où les thermos perdent leur étanchéité, où les manivelles fatiguent et où les portes patio deviennent lourdes à glisser.",
          "Nous couvrons Laflèche, Maricourt, Orchard, Grande Allée et les secteurs près du Parc de la Cité pour vérifier chaque ouverture et proposer la réparation la plus rentable.",
          "Quand le cadre est sain, remplacer le thermos, les roulettes, la manivelle, le coupe-froid ou le calfeutrage coûte beaucoup moins cher qu'une fenêtre neuve.",
        ],
      },
    ],
    faq: [
      {
        q: "Faites-vous le remplacement de thermos à Saint-Hubert?",
        a: "Oui. Nous remplaçons les vitres thermos embuées ou fissurées à Saint-Hubert en conservant le cadre existant lorsque possible.",
      },
      {
        q: "Réparez-vous les portes patio à Saint-Hubert?",
        a: "Oui. Nous remplaçons les roulettes, ajustons le rail, changeons la serrure, la poignée et le coupe-froid afin que la porte glisse mieux sans devoir remplacer toute la porte.",
      },
    ],
  },
  "greenfield-park": {
    seoTitle: "Réparation de portes et fenêtres Greenfield Park | Vosthermos",
    seoDescription:
      `Réparation de portes et fenêtres à Greenfield Park: thermos embués, quincaillerie, portes patio, coupe-froid, moustiquaires et calfeutrage. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de portes et fenêtres à Greenfield Park",
    lead:
      "Service local à Greenfield Park pour réparer les portes et fenêtres des maisons, duplex, petits immeubles et condos: thermos, quincaillerie, portes patio, calfeutrage, coupe-froid et moustiquaires.",
    schemaName: "Réparation de portes et fenêtres à Greenfield Park",
    schemaDescription:
      "Service de réparation de portes et fenêtres à Greenfield Park: vitres thermos, quincaillerie, portes patio, coupe-froid, moustiquaires et calfeutrage.",
    alternateName: [
      "reparation fenetre Greenfield Park",
      "reparation portes et fenetres Greenfield Park",
      "fenetre Greenfield Park",
    ],
    sections: [
      {
        heading: "Greenfield Park: réparer les fenêtres existantes avant de remplacer",
        paragraphs: [
          "Greenfield Park compte beaucoup de maisons et petits immeubles dont les cadres sont encore réparables, même si les thermos, manivelles, coupe-froid ou portes patio montrent des signes d'usure.",
          "Nous intervenons dans les secteurs Churchill, Bellevue, Empire, Victoria et Regent pour les fenêtres embuées, les portes patio lourdes, les moustiquaires endommagées et les problèmes d'infiltration d'air.",
          "La réparation ciblée permet souvent de prolonger la vie des ouvertures existantes tout en améliorant le confort et l'isolation.",
        ],
      },
    ],
    faq: [
      {
        q: "Desservez-vous Greenfield Park?",
        a: "Oui. Greenfield Park fait partie de notre zone de service locale pour la réparation de portes et fenêtres, le remplacement de thermos, les portes patio, la quincaillerie et le calfeutrage.",
      },
      {
        q: "Une vieille fenêtre de Greenfield Park peut-elle être réparée?",
        a: "Souvent oui. Si le cadre est sain, remplacer le thermos, la quincaillerie ou le coupe-froid peut éviter un remplacement complet beaucoup plus coûteux.",
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

  // « Villes à proximité » triées par VRAIE distance (haversine sur les coords
  // de cities.js) — avant: slice(0,12) listait Montréal comme « proche » de Granby,
  // et ~50 villes ne recevaient aucun lien interne.
  const distKm = (a, b) => {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(s));
  };
  const otherCities = city.coords
    ? CITIES.filter((c) => c.slug !== city.slug && c.coords)
        .sort((x, y) => distKm(city.coords, x.coords) - distKm(city.coords, y.coords))
        .slice(0, 12)
    : CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);

  const provider = {
    "@type": "LocalBusiness",
    "@id": "https://www.vosthermos.com/#business",
    name: "Vosthermos",
    telephone: COMPANY_INFO.phoneTel,
    email: COMPANY_INFO.email,
    url: "https://www.vosthermos.com",
    image: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
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
      latitude: 45.3669,
      longitude: -73.5492,
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

  // Dé-cannibalisation: la page ville ne répond plus elle-même aux questions
  // « thermos » (prix, remplacement) — c'est le territoire exclusif de
  // /services/remplacement-vitre-thermos/[ville]. On garde ici uniquement
  // l'intention « réparation de portes et fenêtres » + les FAQ locales non-thermos.
  const cityFaq = (city.faq || []).filter((f) => !/thermos/i.test(f.question || ""));

  const faqItems = [
    ...(localPage?.faq || []),
    {
      q: `Quels services de réparation de portes et fenêtres offrez-vous à ${city.name}?`,
      a: `À ${city.name}, nous offrons la gamme complète de réparation de portes et fenêtres : remplacement de quincaillerie (poignées, serrures, roulettes), réparation de portes en bois, fabrication de moustiquaires sur mesure, calfeutrage, coupe-froid et insertion de porte. Pour une vitre embuée, consultez notre page dédiée au remplacement de vitre. Tous nos travaux sont garantis.`,
    },
    {
      q: `Combien coûte une réparation de fenêtres à ${city.name}?`,
      a: `Le coût dépend du type de réparation : la quincaillerie débute à 4,99$ la pièce et la majorité des réparations coûtent une fraction du prix d'une fenêtre neuve. Nous offrons des soumissions gratuites à domicile partout à ${city.name} et dans la région de ${city.region}. Appelez-nous au ${COMPANY_INFO.phone}.`,
    },
    {
      q: `Est-ce que Vosthermos se déplace à ${city.name}?`,
      a: `Oui, notre équipe se déplace à ${city.name} (à ${city.distance} de notre atelier)${city.neighborhoods ? ` et couvre tous les quartiers incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}. Nous desservons également toute la région de ${city.region}. Prenez rendez-vous en ligne ou appelez-nous.`,
    },
    {
      q: `Vaut-il mieux réparer ou remplacer mes fenêtres à ${city.name}?`,
      a: `Dans la majorité des cas, la réparation est beaucoup plus économique que le remplacement complet. Une réparation ciblée (vitre, quincaillerie, coupe-froid) peut prolonger la vie de vos fenêtres de 15 à 20 ans à une fraction du coût d'une fenêtre neuve. Notre technicien évaluera l'état de vos fenêtres lors de la soumission gratuite et vous recommandera la meilleure option.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // Les FAQ locales de cities.js (le contenu le plus différenciant de la page)
    // font maintenant partie du schema — elles étaient affichées mais absentes
    // du JSON-LD, donc invisibles pour les rich results.
    mainEntity: [
      ...faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
      ...cityFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ],
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
            {/* Problèmes courants locaux (cities.js) — le contenu le plus différenciant
                par ville, auparavant affiché uniquement sur les pages service×ville. */}
            {city.commonIssues && city.commonIssues.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-extrabold mb-4">
                  Problèmes courants à {city.name}
                </h2>
                <ul className="space-y-3">
                  {city.commonIssues.map((issue) => (
                    <li key={issue} className="flex items-start gap-3 text-[var(--color-muted)] leading-relaxed">
                      <i className="fas fa-circle-check text-[var(--color-teal)] mt-1.5 flex-shrink-0"></i>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            {/* FAQ locales (non-thermos: celles-ci vivent sur la page service dédiée) */}
            {cityFaq.map((item, i) => (
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
