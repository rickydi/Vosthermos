import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "@/lib/services-data";
import { CITIES, getCity } from "@/lib/cities";
import { getServiceSeo } from "@/lib/seo-templates";
import QuoteForm from "@/components/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-info";

const LOCAL_SERVICE_CITY_PAGES = {
  "reparation-porte-patio:beloeil": {
    seoTitle: "Réparation porte patio Beloeil | Roulettes et rail",
    seoDescription:
      `Porte patio difficile à ouvrir à Beloeil? Réparation de roulettes, rail, serrure, poignée et coupe-froid. Service à domicile à Beloeil. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de porte patio à Beloeil",
    lead:
      "Service spécialisé de réparation de porte patio à Beloeil: roulettes usées, rail encrassé, serrure bloquée, poignée brisée, coupe-froid fatigué ou thermos embué.",
    schemaName: "Réparation de porte patio à Beloeil",
    schemaDescription:
      "Réparation de portes patio coulissantes à Beloeil: remplacement de roulettes, ajustement de rail, serrure, poignée, coupe-froid et thermos.",
    serviceType: "Réparation de porte patio",
    alternateName: ["reparation porte patio Beloeil", "reparation porte-patio Beloeil"],
    sections: [
      {
        heading: "Réparation porte patio Beloeil: roulettes, rail et serrure",
        paragraphs: [
          "À Beloeil, beaucoup de portes patio installées dans les maisons des années 1970 à 2000 commencent à forcer sur le rail. Les roulettes s'aplatissent, le rail accumule de la saleté et la porte devient lourde à ouvrir.",
          "Nos techniciens interviennent dans le Vieux-Beloeil, le secteur de la Montagne, le Domaine Beloeil, la rue Richelieu et le boulevard Sir-Wilfrid-Laurier pour remettre les portes patio en fonction sans remplacer la porte complète.",
          "La proximité de la rivière Richelieu peut aussi accélérer la corrosion de la quincaillerie et fatiguer les coupe-froids. On vérifie les roulettes, le rail, la poignée, la serrure et l'étanchéité avant de recommander la réparation la plus économique.",
        ],
      },
    ],
    issues: [
      "Porte patio lourde ou difficile à glisser dans les maisons du Domaine Beloeil et du secteur de la Montagne",
      "Roulettes usées, rail sale ou seuil abîmé sur les portes patio des constructions 1970-2000",
      "Poignée, serrure ou coupe-froid fatigués dans les secteurs plus humides près de la rue Richelieu",
    ],
    faq: [
      {
        q: "Réparez-vous les portes patio à Beloeil?",
        a: "Oui. Nous réparons les portes patio à Beloeil: roulettes, rail, serrure, poignée, coupe-froid et thermos. Le technicien se déplace sur place et vérifie si la porte peut être réparée avant de proposer un remplacement complet.",
      },
      {
        q: "Combien coûte une réparation de porte patio à Beloeil?",
        a: "La plupart des réparations de porte patio coûtent entre 150$ et 600$ selon le problème. Le remplacement de roulettes ou l'ajustement du rail coûte beaucoup moins cher qu'une porte neuve. La soumission est gratuite.",
      },
    ],
  },
  "reparation-porte-patio:beauharnois": {
    seoTitle: "Réparation porte patio Beauharnois | Roulettes et rail",
    seoDescription:
      `Porte patio difficile à ouvrir à Beauharnois? Réparation de roulettes, rail, serrure, poignée et coupe-froid. Service à domicile à Beauharnois. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation de porte patio à Beauharnois",
    lead:
      "Service spécialisé de réparation de porte patio à Beauharnois: roulettes usées, rail encrassé, serrure bloquée, poignée brisée, coupe-froid fatigué ou thermos embué.",
    schemaName: "Réparation de porte patio à Beauharnois",
    schemaDescription:
      "Réparation de portes patio coulissantes à Beauharnois: remplacement de roulettes, ajustement de rail, serrure, poignée, coupe-froid et thermos.",
    serviceType: "Réparation de porte patio",
    alternateName: ["reparation porte patio Beauharnois", "reparation porte-patio Beauharnois"],
    sections: [
      {
        heading: "Réparation porte patio Beauharnois: roulettes, rail et serrure",
        paragraphs: [
          "À Beauharnois, l'humidité du canal de Beauharnois et du lac Saint-Louis peut accélérer la corrosion des roulettes, serrures et rails de portes patio. Une porte qui devient lourde à ouvrir n'a pas toujours besoin d'être remplacée.",
          "Nos techniciens interviennent dans le centre-ville, Maple Grove, le secteur du Canal, Melocheville et Saint-Étienne-de-Beauharnois pour réparer les portes patio sur place: roulettes, rail, poignée, serrure, coupe-froid et thermos.",
          "Les maisons ouvrières plus anciennes et les constructions des années 1980-2000 ont souvent des portes patio réparables. On vérifie l'alignement, l'état du rail et la quincaillerie avant de recommander la solution la plus économique.",
        ],
      },
    ],
    issues: [
      "Roulettes et rails de porte patio corrodés par l'humidité du canal de Beauharnois",
      "Portes patio lourdes ou difficiles à glisser dans les maisons de Maple Grove et du centre-ville",
      "Poignée, serrure ou coupe-froid fatigués dans les secteurs riverains près du lac Saint-Louis",
    ],
    faq: [
      {
        q: "Réparez-vous les portes patio à Beauharnois?",
        a: "Oui. Nous réparons les portes patio à Beauharnois: roulettes, rail, serrure, poignée, coupe-froid et thermos. Le technicien se déplace sur place et vérifie si la porte peut être réparée avant de proposer un remplacement complet.",
      },
      {
        q: "Combien coûte une réparation de porte patio à Beauharnois?",
        a: "La plupart des réparations de porte patio coûtent entre 150$ et 600$ selon le problème. Le remplacement de roulettes, l'ajustement du rail ou le changement de serrure coûte beaucoup moins cher qu'une porte neuve. La soumission est gratuite.",
      },
    ],
  },
  "reparation-porte-patio:montreal": {
    seoTitle: "Réparation porte patio Montréal | Roulettes et rail",
    seoDescription:
      `Porte patio difficile à ouvrir à Montréal? Réparation de roulettes, rail, serrure, poignée, coupe-froid et thermos. Service à domicile à Montréal. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation porte patio à Montréal",
    lead:
      "Service spécialisé de réparation porte patio à Montréal: porte coulissante lourde, roulettes usées, rail encrassé, serrure bloquée, poignée brisée, coupe-froid fatigué ou thermos embué.",
    schemaName: "Réparation porte patio à Montréal",
    schemaDescription:
      "Réparation de portes patio coulissantes à Montréal: remplacement de roulettes, ajustement de rail, serrure, poignée, coupe-froid, thermos et alignement de porte.",
    serviceType: "Réparation de porte patio",
    alternateName: [
      "reparation porte patio Montreal",
      "reparation porte-patio Montreal",
      "reparation portes patio Montreal",
      "porte patio Montreal",
      "portes patio Montreal",
    ],
    sections: [
      {
        heading: "Réparation porte patio Montréal: roulettes, rail et serrure",
        paragraphs: [
          "À Montréal, les portes patio des triplex, duplex, condos et maisons de ville subissent beaucoup de cycles gel-dégel, de poussière urbaine et d'usure sur les rails. Une porte qui devient lourde à glisser n'a pas toujours besoin d'être remplacée.",
          "Nos techniciens interviennent dans les quartiers comme Rosemont, Villeray, Ahuntsic, Verdun, le Plateau, Hochelaga, NDG et les arrondissements centraux pour remettre les portes patio en fonction: roulettes, rail, poignée, serrure, coupe-froid et thermos.",
          "La réparation est souvent plus logique qu'une installation de porte patio neuve lorsque le cadre est encore sain. On vérifie l'alignement, l'état du rail, les roulettes et l'étanchéité avant de recommander la solution la plus économique.",
        ],
      },
    ],
    issuesHeading: "Problèmes de porte patio fréquents à Montréal",
    issues: [
      "Porte patio lourde à ouvrir dans les triplex, duplex et condos montréalais",
      "Roulettes usées, rail sale ou seuil abîmé par la poussière, le sel et les cycles gel-dégel",
      "Poignée, serrure ou coupe-froid fatigués sur les portes patio de balcons et cours arrière",
    ],
    faq: [
      {
        q: "Réparez-vous les portes patio à Montréal?",
        a: "Oui. Nous réparons les portes patio à Montréal: roulettes, rail, serrure, poignée, coupe-froid, thermos et ajustement. Le technicien vérifie si la porte peut être réparée avant de proposer un remplacement complet.",
      },
      {
        q: "Faut-il réparer ou installer une porte patio neuve à Montréal?",
        a: "Si le cadre est sain, la réparation de porte patio est souvent la meilleure option. Le remplacement de roulettes, l'ajustement du rail ou le changement de serrure coûte beaucoup moins cher qu'une porte neuve. Si la porte est trop endommagée, nous vous le dirons clairement.",
      },
    ],
  },
  "remplacement-quincaillerie:montreal": {
    seoTitle: "Quincaillerie fenêtre Montréal | Manivelles et serrures",
    seoDescription:
      `Quincaillerie fenêtre Montréal: manivelles, poignées, serrures, pentures, roulettes et mécanismes. Pièces en stock et installation. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Quincaillerie fenêtre à Montréal",
    lead:
      "Service spécialisé de quincaillerie fenêtre à Montréal: manivelle brisée, poignée lousse, serrure usée, penture fatiguée, mécanisme bloqué, roulettes de porte-patio ou pièce difficile à trouver.",
    schemaName: "Quincaillerie fenêtre à Montréal",
    schemaDescription:
      "Remplacement de quincaillerie de fenêtres et portes à Montréal: manivelles, poignées, serrures, pentures, roulettes, mécanismes et ajustements.",
    serviceType: "Remplacement de quincaillerie de fenêtres",
    alternateName: [
      "quincaillerie fenetre Montreal",
      "quincaillerie de fenetre Montreal",
      "remplacement quincaillerie fenetre Montreal",
      "manivelle fenetre Montreal",
      "poignee fenetre Montreal",
      "serrure fenetre Montreal",
    ],
    sections: [
      {
        heading: "Quincaillerie fenêtre Montréal: pièces, mécanismes et ajustement",
        paragraphs: [
          "À Montréal, beaucoup de fenêtres plus anciennes sont encore bonnes, mais leur quincaillerie fatigue: manivelle qui tourne dans le vide, serrure qui ne verrouille plus, pentures usées, mécanisme coincé ou poignée cassée.",
          "Vosthermos garde un inventaire de plus de 740 pièces de portes et fenêtres pour accélérer l'identification et le remplacement de quincaillerie. Une photo de la pièce aide souvent à trouver le bon modèle avant la visite.",
          "Nous intervenons dans les triplex, duplex, condos, maisons de ville et immeubles locatifs de Montréal pour remettre les fenêtres en fonction sans remplacer l'ouverture complète.",
        ],
      },
    ],
    issuesHeading: "Problèmes de quincaillerie fréquents à Montréal",
    issues: [
      "Manivelle de fenêtre qui tourne dans le vide ou ne ferme plus complètement",
      "Serrure, poignée ou penture usée sur des fenêtres de triplex et condos",
      "Pièce de quincaillerie difficile à identifier ou modèle discontinu",
    ],
    faq: [
      {
        q: "Remplacez-vous la quincaillerie de fenêtre à Montréal?",
        a: "Oui. Nous remplaçons les manivelles, poignées, serrures, pentures, mécanismes et autres pièces de quincaillerie de fenêtres à Montréal. Une photo de la pièce aide à confirmer le bon modèle.",
      },
      {
        q: "Faut-il remplacer la fenêtre si la manivelle est brisée?",
        a: "Pas nécessairement. Si le cadre et le volet sont encore en bon état, remplacer la manivelle ou le mécanisme coûte beaucoup moins cher qu'une fenêtre neuve.",
      },
    ],
  },
  "reparation-porte-fenetre:montreal": {
    seoTitle: "Réparation porte-fenêtre Montréal | Mécanisme et thermos",
    seoDescription:
      `Réparation porte-fenêtre à Montréal: mécanisme multipoint, pentures, poignée, ajustement, coupe-froid et thermos. Service à domicile. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation porte-fenêtre à Montréal",
    lead:
      "Service spécialisé de réparation porte-fenêtre à Montréal: porte-fenêtre qui ferme mal, mécanisme multipoint bloqué, pentures usées, poignée brisée, coupe-froid fatigué ou thermos embué.",
    schemaName: "Réparation porte-fenêtre à Montréal",
    schemaDescription:
      "Réparation de portes-fenêtres à Montréal: mécanisme multipoint, pentures, poignée, ajustement, coupe-froid, thermos et étanchéité.",
    serviceType: "Réparation de porte-fenêtre",
    alternateName: [
      "reparation porte-fenetre Montreal",
      "reparation porte fenetre Montreal",
      "reparation de porte-fenetre Montreal",
      "porte-fenetre Montreal",
      "porte francaise Montreal",
    ],
    sections: [
      {
        heading: "Réparation porte-fenêtre Montréal: mécanisme, pentures et étanchéité",
        paragraphs: [
          "Une porte-fenêtre à Montréal peut être confondue avec une demande générale de portes et fenêtres, mais l'intention est différente: on parle souvent d'un mécanisme multipoint, de pentures, d'une poignée, d'un thermos ou d'un ajustement de battant.",
          "Nos techniciens vérifient l'alignement, la fermeture, le verrouillage, le coupe-froid et l'état du thermos pour corriger la vraie cause du problème.",
          "Quand la demande touche plusieurs ouvertures, la page réparation fenêtres Montréal reste la meilleure entrée. Quand le problème est précisément la porte-fenêtre, cette page spécialisée envoie le bon signal à Google et au client.",
        ],
      },
    ],
    issues: [
      "Porte-fenêtre qui frotte, ferme mal ou laisse passer l'air",
      "Mécanisme multipoint bloqué, poignée lousse ou pentures fatiguées",
      "Thermos embué ou coupe-froid usé dans une porte-fenêtre à battant",
    ],
    faq: [
      {
        q: "Réparez-vous les portes-fenêtres à Montréal?",
        a: "Oui. Nous réparons les portes-fenêtres à Montréal: mécanisme multipoint, pentures, poignée, ajustement, coupe-froid et thermos.",
      },
      {
        q: "Quelle est la différence avec la réparation de fenêtres Montréal?",
        a: "La réparation de fenêtres Montréal couvre toutes les fenêtres et ouvertures. La porte-fenêtre vise un produit précis avec battant, poignée, pentures et souvent un mécanisme multipoint.",
      },
    ],
  },
  "calfeutrage:montreal": {
    seoTitle: "Calfeutrage Montréal | Fenêtres et joints extérieurs",
    seoDescription:
      `Calfeutrage à Montréal pour fenêtres, portes, joints extérieurs et infiltrations d'air ou d'eau. Service à domicile, scellant professionnel. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Calfeutrage à Montréal",
    lead:
      "Service spécialisé de calfeutrage à Montréal: joints de fenêtres fissurés, scellant décollé, infiltrations d'air, infiltrations d'eau et contours de portes à refaire.",
    schemaName: "Calfeutrage à Montréal",
    schemaDescription:
      "Calfeutrage de portes et fenêtres à Montréal: retrait de l'ancien scellant, préparation des surfaces, application de scellant professionnel et correction des infiltrations.",
    serviceType: "Calfeutrage de portes et fenêtres",
    alternateName: ["calfeutrage Montreal", "calfeutrage fenetre Montreal", "calfeutrage exterieur Montreal"],
    sections: [
      {
        heading: "Calfeutrage Montréal: fenêtres, portes et joints extérieurs",
        paragraphs: [
          "À Montréal, les triplex, duplex et maisons plus anciennes subissent beaucoup de mouvements de structure, de cycles gel-dégel et d'exposition au vent. Les joints de calfeutrage autour des fenêtres finissent par craquer, se décoller ou perdre leur élasticité.",
          "Nos techniciens interviennent dans les arrondissements de Montréal pour retirer l'ancien scellant, nettoyer les surfaces et appliquer un calfeutrage professionnel adapté au PVC, à l'aluminium, au bois, à la brique et au revêtement extérieur.",
          "Le but est de corriger les infiltrations d'air et d'eau sans remplacer inutilement les fenêtres. On vérifie aussi les zones à risque: appuis de fenêtres, joints verticaux, portes-patio, sous-sol, contours de portes et sections exposées au soleil.",
        ],
      },
    ],
    issues: [
      "Calfeutrage fissuré ou décollé autour des fenêtres de triplex et duplex montréalais",
      "Infiltrations d'air dans les pièces exposées au vent, surtout sur les façades plus anciennes",
      "Joints extérieurs fatigués autour des portes, portes-patio et fenêtres de sous-sol",
    ],
    faq: [
      {
        q: "Faites-vous le calfeutrage à Montréal?",
        a: "Oui. Nous faisons le calfeutrage de fenêtres, portes, portes-patio et joints extérieurs à Montréal. Le technicien retire l'ancien scellant lorsque nécessaire, prépare les surfaces et applique un scellant professionnel adapté au support.",
      },
      {
        q: "Combien coûte le calfeutrage à Montréal?",
        a: "Le prix dépend du nombre d'ouvertures, de l'état de l'ancien scellant et de l'accès aux fenêtres. Pour une maison typique, le calfeutrage complet se situe souvent entre 500$ et 1 500$. La soumission est gratuite.",
      },
    ],
  },
  "coupe-froid:montreal": {
    seoTitle: "Coupe-froid fenêtre Montréal | Courants d'air",
    seoDescription:
      `Coupe-froid fenêtre Montréal: remplacement de joints usés, infiltration d'air, portes et fenêtres mal étanches. Service à domicile. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Coupe-froid fenêtre à Montréal",
    lead:
      "Service spécialisé de coupe-froid fenêtre à Montréal: courants d'air, joints écrasés, portes et fenêtres mal étanches, perte de chaleur et inconfort près des ouvertures.",
    schemaName: "Coupe-froid fenêtre à Montréal",
    schemaDescription:
      "Remplacement de coupe-froid de fenêtres et portes à Montréal: joints usés, infiltration d'air, étanchéité et ajustement des ouvertures.",
    serviceType: "Remplacement de coupe-froid",
    alternateName: [
      "coupe-froid fenetre Montreal",
      "coupe froid fenetre Montreal",
      "remplacement coupe-froid Montreal",
      "joint fenetre Montreal",
      "infiltration air fenetre Montreal",
    ],
    sections: [
      {
        heading: "Coupe-froid fenêtre Montréal: bloquer les courants d'air",
        paragraphs: [
          "À Montréal, les cycles gel-dégel et les vieilles ouvertures fatiguent les coupe-froid. Un joint écrasé ou déchiré laisse entrer l'air froid, force le chauffage et donne l'impression que la fenêtre doit être remplacée.",
          "Dans plusieurs cas, remplacer le coupe-froid et ajuster la fenêtre suffit à récupérer du confort sans changer l'ouverture complète.",
          "Nous vérifions les fenêtres, portes, portes-patio et portes-fenêtres afin de choisir le bon profil de coupe-froid et corriger les zones d'infiltration.",
        ],
      },
    ],
    issues: [
      "Courants d'air autour des fenêtres de triplex, duplex et condos",
      "Coupe-froid écrasé, sec, décollé ou manquant",
      "Porte ou fenêtre qui ferme mal après plusieurs hivers",
    ],
    faq: [
      {
        q: "Remplacez-vous les coupe-froid de fenêtre à Montréal?",
        a: "Oui. Nous remplaçons les coupe-froid de fenêtres, portes, portes-patio et portes-fenêtres à Montréal. Le technicien vérifie aussi l'ajustement, car un mauvais alignement peut causer une infiltration même avec un nouveau joint.",
      },
      {
        q: "Un coupe-froid neuf peut-il éviter un remplacement de fenêtre?",
        a: "Souvent oui. Si le cadre et le thermos sont encore bons, remplacer le coupe-froid et ajuster la fenêtre peut régler le courant d'air à beaucoup plus faible coût.",
      },
    ],
  },
  "moustiquaires-sur-mesure:montreal": {
    seoTitle: "Moustiquaire fenêtre Montréal | Réparation sur mesure",
    seoDescription:
      `Moustiquaire fenêtre Montréal: fabrication, réparation, toile déchirée, cadre croche et moustiquaire sur mesure pour fenêtres et portes-patio. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Moustiquaire fenêtre à Montréal",
    lead:
      "Service spécialisé de moustiquaire fenêtre à Montréal: toile déchirée, cadre croche, moustiquaire manquante, fabrication sur mesure et ajustement pour fenêtres ou portes-patio.",
    schemaName: "Moustiquaire fenêtre à Montréal",
    schemaDescription:
      "Fabrication et réparation de moustiquaires de fenêtres et portes-patio à Montréal: toile, cadre, ajustement et remplacement sur mesure.",
    serviceType: "Moustiquaires sur mesure",
    alternateName: [
      "moustiquaire fenetre Montreal",
      "moustiquaire Montreal",
      "reparation moustiquaire Montreal",
      "moustiquaire sur mesure Montreal",
      "moustiquaire porte patio Montreal",
    ],
    sections: [
      {
        heading: "Moustiquaire fenêtre Montréal: réparer ou fabriquer sur mesure",
        paragraphs: [
          "Les moustiquaires de fenêtres et portes-patio s'abîment vite dans les logements, condos et maisons de Montréal: toile déchirée, cadre croche, moustiquaire perdue ou modèle qui n'est plus disponible.",
          "Nous pouvons réparer la toile existante, refaire un cadre ou fabriquer une moustiquaire sur mesure selon l'ouverture.",
          "Ce service complète la réparation de fenêtres à Montréal, surtout lorsque la fenêtre fonctionne encore mais qu'il manque la protection contre les insectes.",
        ],
      },
    ],
    issues: [
      "Toile de moustiquaire déchirée ou sortie du cadre",
      "Cadre de moustiquaire croche, perdu ou impossible à replacer",
      "Besoin d'une moustiquaire sur mesure pour fenêtre ou porte-patio",
    ],
    faq: [
      {
        q: "Faites-vous des moustiquaires sur mesure à Montréal?",
        a: "Oui. Nous réparons et fabriquons des moustiquaires sur mesure pour fenêtres et portes-patio à Montréal, selon les dimensions et le type d'ouverture.",
      },
      {
        q: "Peut-on seulement changer la toile?",
        a: "Oui. Si le cadre est encore bon, remplacer seulement la toile est souvent suffisant et moins coûteux qu'une moustiquaire neuve.",
      },
    ],
  },
  "reparation-portes-bois:montreal": {
    seoTitle: "Réparation fenêtre bois Montréal | Cadres et restauration",
    seoDescription:
      `Réparation fenêtre bois Montréal: cadres abîmés, bois pourri, ajustement, finition, coupe-froid et thermos dans cadre existant. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Réparation fenêtre en bois à Montréal",
    lead:
      "Service spécialisé de réparation fenêtre en bois à Montréal: cadre abîmé, bois pourri, ajustement, coupe-froid, finition, thermos dans cadre existant et restauration d'ouverture ancienne.",
    schemaName: "Réparation fenêtre en bois à Montréal",
    schemaDescription:
      "Restauration et réparation de fenêtres en bois à Montréal: cadres, greffes, ajustement, coupe-froid, finition et remplacement de thermos dans le cadre existant.",
    serviceType: "Réparation de fenêtres en bois",
    alternateName: [
      "reparation fenetre bois Montreal",
      "reparation fenetre en bois Montreal",
      "restauration fenetre bois Montreal",
      "cadre fenetre bois Montreal",
      "bois pourri fenetre Montreal",
    ],
    sections: [
      {
        heading: "Réparation fenêtre bois Montréal: conserver le cachet sans remplacer",
        paragraphs: [
          "Montréal compte beaucoup de triplex, duplex et maisons avec des fenêtres ou cadres de bois qui méritent une réparation précise avant un remplacement complet.",
          "Nous vérifions le bois pourri, les sections à greffer, l'ajustement, le coupe-froid, le calfeutrage et la possibilité de remplacer le thermos tout en conservant le cadre existant.",
          "Cette approche est utile pour les propriétés anciennes, les façades à conserver et les clients qui veulent prolonger la vie des ouvertures sans changer tout le caractère du bâtiment.",
        ],
      },
    ],
    issues: [
      "Cadre de fenêtre en bois abîmé ou section basse fatiguée par l'humidité",
      "Fenêtre en bois qui ferme mal, frotte ou laisse passer l'air",
      "Thermos ou vitrage à remplacer dans un cadre de bois existant",
    ],
    faq: [
      {
        q: "Réparez-vous les fenêtres en bois à Montréal?",
        a: "Oui. Nous réparons les fenêtres en bois à Montréal: cadre, greffe de bois, ajustement, coupe-froid, finition et remplacement de thermos lorsque le cadre peut être conserve.",
      },
      {
        q: "Est-ce mieux de restaurer ou remplacer une fenêtre en bois?",
        a: "Si le cadre est récupérable, la restauration peut conserver le cachet du bâtiment et coûter moins cher qu'un remplacement complet. Si la structure est trop endommagée, nous le signalons clairement.",
      },
    ],
  },
  "desembuage:montreal": {
    seoTitle: "Vitre thermos embuée Montréal | Désembuage",
    seoDescription:
      `Vitre thermos embuée à Montréal? Désembuage de thermos, buée entre les vitres, halo blanchâtre et condensation. Évaluation à domicile. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Vitre thermos embuée à Montréal",
    lead:
      "Service spécialisé pour vitre thermos embuée à Montréal: buée entre les vitres, halo blanchâtre, condensation persistante et évaluation entre désembuage ou remplacement du thermos.",
    schemaName: "Vitre thermos embuée à Montréal",
    schemaDescription:
      "Désembuage de vitres thermos embuées à Montréal: évaluation de la buée, nettoyage interne, évacuation de l'humidité et recommandation honnête si le remplacement du thermos est préférable.",
    serviceType: "Désembuage de vitre thermos",
    alternateName: [
      "vitre thermos embuee Montreal",
      "thermos embue Montreal",
      "fenetre embuee Montreal",
      "desembuage Montreal",
      "condensation entre les vitres Montreal",
    ],
    sections: [
      {
        heading: "Vitre thermos embuée Montréal: buée, halo et condensation",
        paragraphs: [
          "À Montréal, les thermos des triplex, duplex, condos et maisons plus anciennes peuvent développer de la buée entre les vitres après plusieurs cycles gel-dégel. Quand l'humidité reste prisonnière dans l'unité scellée, la vitre devient voilée, blanchâtre ou embuée.",
          "Nos techniciens évaluent les vitres thermos embuées dans les secteurs comme Rosemont, Villeray, Ahuntsic, Verdun, le Plateau, Hochelaga, NDG et les arrondissements centraux pour déterminer si le désembuage est encore une bonne option.",
          "Le désembuage peut être intéressant lorsque la buée est récente ou légère. Si le verre est trop attaqué, fissuré ou rempli de dépôts permanents, nous recommandons plutôt le remplacement du thermos afin d'éviter une réparation inutile.",
        ],
      },
    ],
    issuesHeading: "Problèmes de vitre thermos embuée à Montréal",
    issues: [
      "Buée ou condensation entre les vitres thermos dans les triplex et condos montréalais",
      "Halo blanchâtre sur les thermos exposés au soleil, au froid et aux cycles gel-dégel",
      "Thermos embué dont il faut vérifier s'il peut être désembué ou s'il doit être remplacé",
    ],
    faq: [
      {
        q: "Peut-on désembuer une vitre thermos embuée à Montréal?",
        a: "Oui, dans certains cas. Le désembuage fonctionne surtout lorsque la buée est récente, que le verre n'est pas fissuré et que les dépôts ne sont pas incrustés. Le technicien vérifie la vitre sur place avant de recommander le désembuage.",
      },
      {
        q: "Quelle est la différence entre désembuage et remplacement de thermos?",
        a: "Le désembuage vise à évacuer l'humidité et améliorer la clarté du thermos existant. Le remplacement installe une unité scellée neuve. Si la vitre thermos est trop endommagée, le remplacement est plus durable que le désembuage.",
      },
    ],
  },
  "remplacement-vitre-thermos:montreal": {
    seoTitle: "Remplacement vitre thermos Montréal | Dès 150$",
    seoDescription:
      `Remplacement vitre thermos à Montréal pour fenêtres embuées, vitres thermos fissurées et unités scellées en fin de vie. Service à domicile. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Remplacement vitre thermos à Montréal",
    lead:
      "Service spécialisé de remplacement vitre thermos à Montréal: vitres thermos embuées, unités scellées fissurées, perte d'isolation et thermos de triplex ou duplex en fin de vie.",
    schemaName: "Remplacement vitre thermos à Montréal",
    schemaDescription:
      "Remplacement de vitres thermos et unités scellées à Montréal: prise de mesures, fabrication sur mesure, installation et service garanti pour fenêtres résidentielles.",
    serviceType: "Remplacement de vitre thermos",
    alternateName: ["remplacement vitre thermos Montreal", "remplacement de vitre thermos Montreal", "remplacement thermos Montreal", "vitre thermos Montreal"],
    sections: [
      {
        heading: "Remplacement vitre thermos Montréal: triplex, duplex et maisons anciennes",
        paragraphs: [
          "À Montréal, les thermos des fenêtres installées dans les années 1980 à 2000 arrivent souvent en fin de vie. La buée entre les vitres, les taches blanchâtres et la perte d'isolation indiquent que l'unité scellée doit être remplacée.",
          "Nos techniciens interviennent dans les secteurs comme le Plateau, Rosemont, Verdun, Villeray, NDG et les quartiers centraux pour prendre les mesures, commander le thermos sur mesure et remplacer uniquement la vitre, sans changer la fenêtre complète.",
          "Cette approche conserve le cadre existant des triplex, duplex et maisons plus anciennes tout en améliorant l'isolation. C'est habituellement beaucoup moins coûteux qu'un remplacement complet de fenêtre.",
        ],
      },
    ],
    issuesHeading: "Problèmes de thermos fréquents à Montréal",
    issues: [
      "Vitres thermos embuées dans les triplex et duplex montréalais",
      "Unités scellées des années 1980-2000 en fin de vie dans les quartiers centraux",
      "Perte d'isolation et condensation entre les vitres durant les hivers de Montréal",
    ],
    faq: [
      {
        q: "Faites-vous le remplacement vitre thermos à Montréal?",
        a: "Oui. Nous remplaçons les vitres thermos et unités scellées à Montréal. Le technicien prend les mesures sur place, commande le thermos sur mesure et revient l'installer en conservant le cadre existant lorsque possible.",
      },
      {
        q: "Combien coûte un remplacement thermos à Montréal?",
        a: "Le prix varie selon la dimension, le type de verre et l'accès à la fenêtre. Un thermos standard coûte souvent entre 150$ et 350$ installé. La soumission est gratuite à domicile.",
      },
    ],
  },
  "remplacement-vitre-thermos:delson": {
    seoTitle: "Remplacement vitre thermos Delson | Dès 150$",
    seoDescription:
      `Remplacement vitre thermos à Delson pour thermos embués, vitres fissurées et unités scellées en fin de vie. Service rapide à Delson. Soumission gratuite ${COMPANY_INFO.phone}.`,
    h1: "Remplacement vitre thermos à Delson",
    lead:
      "Service spécialisé de remplacement vitre thermos à Delson: thermos embués, unités scellées fissurées, perte d'isolation et vitres de maisons unifamiliales ou jumelées en fin de vie.",
    schemaName: "Remplacement vitre thermos à Delson",
    schemaDescription:
      "Remplacement de vitres thermos et unités scellées à Delson: prise de mesures, fabrication sur mesure et installation dans le cadre existant.",
    serviceType: "Remplacement de vitre thermos",
    alternateName: [
      "remplacement vitre thermos Delson",
      "remplacement de vitre thermos Delson",
      "remplacement thermos Delson",
      "vitre thermos Delson",
      "thermos embue Delson",
    ],
    sections: [
      {
        heading: "Remplacement vitre thermos Delson: thermos embués et unités scellées",
        paragraphs: [
          "À Delson, beaucoup de maisons unifamiliales et jumelées construites entre les années 1970 et 2000 ont maintenant des thermos en fin de vie. La buée entre les vitres, les taches blanchâtres et la perte d'isolation indiquent souvent que l'unité scellée doit être remplacée.",
          "Nos techniciens sont à environ 15 minutes de Delson, ce qui permet une prise de mesures rapide dans le Centre de Delson, le secteur des Érables, le quartier résidentiel Sud et près de la gare.",
          "Pour une recherche remplacement vitre thermos Delson, l'intention principale est la vitre scellée, pas le mécanisme d'une porte-fenêtre. Nous remplaçons le thermos sur mesure en conservant le cadre existant lorsque possible, sans vendre une fenêtre complète inutilement.",
        ],
      },
    ],
    issuesHeading: "Problèmes de vitre thermos fréquents à Delson",
    issues: [
      "Thermos embués dans les maisons unifamiliales et jumelées des années 1970 à 2000",
      "Unités scellées fissurées ou blanchâtres dans le Centre de Delson et le secteur des Érables",
      "Perte d'isolation et condensation entre les vitres pendant les cycles gel-dégel",
    ],
    faq: [
      {
        q: "Faites-vous le remplacement vitre thermos à Delson?",
        a: "Oui. Nous faisons le remplacement vitre thermos à Delson pour les thermos embués, fissurés ou en perte d'isolation. Le technicien prend les mesures sur place, commande l'unité scellée sur mesure et revient l'installer dans le cadre existant.",
      },
      {
        q: "Quelle est la différence entre une porte-fenêtre et une vitre thermos à Delson?",
        a: "Une porte-fenêtre concerne surtout le mécanisme, les charnières, la poignée et l'ajustement. Une vitre thermos concerne l'unité scellée dans le cadre. Pour une vitre thermos embuée ou fissurée, le remplacement du thermos est le service le plus précis.",
      },
      {
        q: "Combien coûte un remplacement thermos à Delson?",
        a: "Un remplacement de thermos standard débute souvent autour de 150$ par unité installée, selon la dimension, le type de verre et l'accès. Delson étant très proche de notre atelier, la soumission et la prise de mesures peuvent souvent se faire rapidement.",
      },
    ],
  },
};

function getLocalServiceCityPage(serviceSlug, citySlug) {
  return LOCAL_SERVICE_CITY_PAGES[`${serviceSlug}:${citySlug}`] || null;
}

const LOCAL_INTENT_LINKS = {
  "reparation-porte-fenetre:delson": [
    {
      href: "/services/remplacement-vitre-thermos/delson",
      title: "Thermos embué ou vitre scellée à remplacer?",
      description:
        "Si la demande concerne surtout une vitre thermos embuée, fissurée ou une unité scellée en fin de vie, la page spécialisée est le meilleur choix pour Delson.",
      label: "Remplacement vitre thermos Delson",
    },
  ],
  "reparation-porte-fenetre:chateauguay": [
    {
      href: "/reparation-portes-et-fenetres/chateauguay",
      title: "Besoin de réparer plusieurs portes et fenêtres?",
      description:
        "Si la demande touche plus qu'une porte-fenêtre à battant, le service local couvre les thermos, portes patio, quincaillerie, calfeutrage, coupe-froid, moustiquaires et cadres à Châteauguay.",
      label: "Réparation de portes et fenêtres Châteauguay",
    },
  ],
  "remplacement-vitre-thermos:montreal": [
    {
      href: "/services/desembuage/montreal",
      title: "La vitre est seulement embuée?",
      description:
        "Si la buée est récente ou légère, le désembuage peut être vérifié avant de remplacer l'unité scellée.",
      label: "Vitre thermos embuée Montréal",
    },
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Plusieurs fenêtres à réparer?",
      description:
        "Pour une demande plus large de réparation fenêtres Montréal, la page principale regroupe thermos, quincaillerie, coupe-froid, calfeutrage et moustiquaires.",
      label: "Réparation fenêtres Montréal",
    },
  ],
  "desembuage:montreal": [
    {
      href: "/services/remplacement-vitre-thermos/montreal",
      title: "Thermos trop endommagé?",
      description:
        "Si le verre est trop attaqué, fissuré ou rempli de dépôts permanents, le remplacement de vitre thermos est plus durable que le désembuage.",
      label: "Remplacement vitre thermos Montréal",
    },
  ],
  "reparation-porte-patio:montreal": [
    {
      href: "/services/remplacement-quincaillerie/montreal",
      title: "Pièce ou mécanisme à remplacer?",
      description:
        "Pour les roulettes, poignées, serrures et pièces difficiles à identifier, la page quincaillerie Montréal est plus précise.",
      label: "Quincaillerie fenêtre Montréal",
    },
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "La demande touche aussi les fenêtres?",
      description:
        "Si plusieurs ouvertures ont besoin d'une vérification, la page réparation fenêtres Montréal couvre l'ensemble du diagnostic.",
      label: "Réparation fenêtres Montréal",
    },
  ],
  "calfeutrage:montreal": [
    {
      href: "/services/coupe-froid/montreal",
      title: "Courant d'air autour de la fenêtre?",
      description:
        "Quand l'air passe par le joint mobile plutôt que par le scellant extérieur, le coupe-froid est souvent la vraie correction.",
      label: "Coupe-froid fenêtre Montréal",
    },
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Diagnostic complet de fenêtre",
      description:
        "La page principale Montréal aide à regrouper calfeutrage, coupe-froid, thermos et quincaillerie dans une seule lecture.",
      label: "Réparation fenêtres Montréal",
    },
  ],
  "coupe-froid:montreal": [
    {
      href: "/services/calfeutrage/montreal",
      title: "Le scellant extérieur est fissuré?",
      description:
        "Si l'infiltration vient du contour extérieur de la fenêtre ou de la porte, le calfeutrage Montréal est la page la plus précise.",
      label: "Calfeutrage fenêtre Montréal",
    },
  ],
  "remplacement-quincaillerie:montreal": [
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Besoin d'un diagnostic plus large?",
      description:
        "Si la quincaillerie n'est qu'une partie du problème, la page réparation fenêtres Montréal couvre aussi thermos, coupe-froid, calfeutrage et moustiquaires.",
      label: "Réparation fenêtres Montréal",
    },
  ],
  "reparation-porte-fenetre:montreal": [
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Ce n'est pas seulement une porte-fenêtre?",
      description:
        "Pour les demandes qui touchent plusieurs fenêtres ou portes, la page réparation fenêtres Montréal est la meilleure page d'entrée.",
      label: "Réparation fenêtres Montréal",
    },
    {
      href: "/services/remplacement-vitre-thermos/montreal",
      title: "Le problème est surtout le thermos?",
      description:
        "Si la porte-fenêtre a une vitre thermos embuée ou fissurée, la page thermos Montréal cible mieux cette intention.",
      label: "Remplacement vitre thermos Montréal",
    },
  ],
  "moustiquaires-sur-mesure:montreal": [
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Réparation complète de fenêtre",
      description:
        "Si la moustiquaire accompagne une fenêtre qui ferme mal, laisse passer l'air ou a un thermos défectueux, la page principale Montréal couvre l'ensemble.",
      label: "Réparation fenêtres Montréal",
    },
  ],
  "reparation-portes-bois:montreal": [
    {
      href: "/reparation-portes-et-fenetres/montreal",
      title: "Fenêtre bois avec plusieurs problèmes?",
      description:
        "Pour une demande qui combine bois, thermos, calfeutrage, coupe-froid et quincaillerie, la page principale Montréal sert de diagnostic global.",
      label: "Réparation fenêtres Montréal",
    },
  ],
};

function getLocalIntentLinks(serviceSlug, citySlug) {
  return LOCAL_INTENT_LINKS[`${serviceSlug}:${citySlug}`] || [];
}

export function generateStaticParams() {
  const params = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      params.push({ slug: service.slug, ville: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) return {};

  const localPage = getLocalServiceCityPage(slug, ville);
  const { title, description } = localPage
    ? { title: localPage.seoTitle, description: localPage.seoDescription }
    : getServiceSeo(slug, city, service.shortTitle);
  const url = `https://www.vosthermos.com/services/${service.slug}/${city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // Les jumelles /en/services/[slug]/[ville] sont noindex (contenu FR non
      // traduit qui sortait sur des requêtes françaises) — on ne déclare donc
      // plus de hreflang en-CA vers elles.
      languages: { "fr-CA": url, "x-default": url },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "fr_CA",
    },
  };
}

export default async function ServiceCityPage({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) notFound();

  const localPage = getLocalServiceCityPage(slug, ville);
  const intentLinks = getLocalIntentLinks(slug, ville);
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);
  // Villes voisines par vraie distance (haversine) au lieu des 8 premières du tableau
  const rad = Math.PI / 180;
  const distKm = (a, b) => {
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(s));
  };
  const otherCities = city.coords
    ? CITIES.filter((c) => c.slug !== city.slug && c.coords)
        .sort((x, y) => distKm(city.coords, x.coords) - distKm(city.coords, y.coords))
        .slice(0, 8)
    : CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localPage?.schemaName || `${service.shortTitle} à ${city.name}`,
    description: localPage?.schemaDescription || `Service professionnel de ${service.shortTitle.toLowerCase()} à ${city.name}. Vosthermos offre un service rapide et garanti.`,
    serviceType: localPage?.serviceType || service.shortTitle,
    ...(localPage?.alternateName ? { alternateName: localPage.alternateName } : {}),
    url: `https://www.vosthermos.com/services/${service.slug}/${city.slug}`,
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
    areaServed: { "@type": "City", name: city.name },
  };

  // Les FAQ thermos locales de cities.js (ex.: « Combien coûte le remplacement
  // d'une vitre thermos à Laval? ») appartiennent à CETTE page quand le service
  // est le thermos — elles ont été retirées de la page ville générique.
  const cityThermosFaq =
    slug === "remplacement-vitre-thermos"
      ? (city.faq || [])
          .filter((f) => /thermos/i.test(f.question || ""))
          .map((f) => ({ q: f.question, a: f.answer }))
      : [];

  const faqItems = [
    ...(localPage?.faq || []),
    ...cityThermosFaq,
    {
      q: `Combien coûte le service de ${service.shortTitle.toLowerCase()} à ${city.name}?`,
      a: `Le prix varie selon l'ampleur des travaux. Contactez-nous au ${COMPANY_INFO.phone} pour une soumission gratuite à ${city.name}. Nous nous déplaçons dans tous les quartiers${city.neighborhoods ? ` incluant ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}.`,
    },
    {
      q: `Desservez-vous ${city.name} pour ce service?`,
      a: `Oui, ${city.name} fait partie de notre zone de service. Nous sommes à seulement ${city.distance} de notre atelier. Nous couvrons ${city.name} et toute la région de ${city.region}.`,
    },
    {
      q: `Quel est le délai pour ${service.shortTitle.toLowerCase()} à ${city.name}?`,
      a: `En général, nous pouvons effectuer la soumission dans les 48 heures et procéder aux travaux dans un délai de 1 à 2 semaines. Pour les cas urgents à ${city.name}, contactez-nous directement.`,
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
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-6">
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">{service.shortTitle}</Link>
            <span>/</span>
            <span className="text-white/70">{city.name}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                {localPage?.h1 || `${service.shortTitle} à ${city.name}`}
              </h1>
              <p className="text-white/60 text-lg mb-6">
                {localPage?.lead || (
                  <>
                    Service professionnel de {service.shortTitle.toLowerCase()} à {city.name} et dans la région de {city.region}.
                    Nos experts se déplacent à {city.name} ({city.distance} de notre atelier) pour des travaux rapides et garantis.
                  </>
                )}
              </p>
              {/* Trust badge: hours */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
                <i className="fas fa-clock text-[var(--color-red-light)]"></i>
                <span>Lun-Ven 8h-17h &bull; Sam 9h-13h</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
                >
                  <i className="fas fa-phone"></i>
                  {COMPANY_INFO.phone}
                </a>
                <Link
                  href="/rendez-vous"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <i className="fas fa-file-alt"></i>
                  Soumission gratuite
                </Link>
              </div>
            </div>

            {/* Right: QuoteForm inline */}
            <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-8 border border-white/[0.08] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider">Service disponible</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-1">Soumission gratuite</h2>
              <p className="text-white/50 text-sm mb-5">
                {service.shortTitle} à {city.name} — réponse rapide.
              </p>
              <QuoteForm compact />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* City context */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {localPage?.h1 || `${service.shortTitle} à ${city.name}`}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {city.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Vosthermos offre un service complet de {service.shortTitle.toLowerCase()} aux résidents de {city.name}.
                {city.neighborhoods && city.neighborhoods.length > 0 && (
                  <> Nous desservons tous les quartiers incluant {city.neighborhoods.join(", ")}.</>
                )}
              </p>
            </div>

            {intentLinks.length > 0 && (
              <div className="rounded-2xl border border-[var(--color-teal)]/20 bg-[var(--color-teal)]/5 p-6 space-y-5">
                {intentLinks.map((link) => (
                  <div key={link.href}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{link.title}</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">{link.description}</p>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-[var(--color-teal)] font-bold hover:underline"
                    >
                      {link.label}
                      <i className="fas fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {localPage?.sections?.map((section) => (
              <div key={section.heading}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            ))}

            {localPage?.issues && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {localPage.issuesHeading || `Problèmes de ${service.shortTitle.toLowerCase()} fréquents à ${city.name}`}
                </h2>
                <div className="space-y-3">
                  {localPage.issues.map((issue) => (
                    <div key={issue} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-exclamation-triangle text-xs"></i>
                      </div>
                      <p className="text-gray-700 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common issues */}
            {city.commonIssues && city.commonIssues.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Problèmes courants à {city.name}
                </h2>
                <div className="space-y-3">
                  {city.commonIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-exclamation-triangle text-xs"></i>
                      </div>
                      <p className="text-gray-700 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service details */}
            {service.sections && service.sections[0] && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.sections[0].heading}
                </h2>
                {service.sections[0].paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            )}

            {/* OPTI-FENETRE upsell */}
            <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                Programme OPTI-FENÊTRE à {city.name}
              </h3>
              <p className="text-white/70 mb-4 text-sm">
                Besoin de plusieurs reparations? Le programme OPTI-FENETRE regroupe tous nos
                services en un forfait cle en main — remise a neuf complete a une fraction du
                prix du remplacement.
              </p>
              <Link
                href="/opti-fenetre"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                Decouvrir OPTI-FENETRE
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions fréquentes — {city.name}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
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
          <aside className="space-y-8">
            {/* CTA card (sticky) */}
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px]">
              <h3 className="font-bold text-gray-900 mb-2">Besoin d&apos;aide immediate?</h3>
              <p className="text-gray-500 text-sm mb-4">
                Appelez-nous pour {service.shortTitle.toLowerCase()} à {city.name}.
              </p>
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3"
              >
                <i className="fas fa-phone"></i>
                {COMPANY_INFO.phone}
              </a>
              <Link
                href="/rendez-vous"
                className="flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors w-full"
              >
                <i className="fas fa-calendar-alt"></i>
                Prendre rendez-vous
              </Link>
            </div>

            {/* Other services in this city */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Autres services a {city.name}</h3>
              <div className="space-y-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${city.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
                      <i className={`${s.icon} text-xs`}></i>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)] transition-colors">
                      {s.shortTitle}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/reparation-portes-et-fenetres/${city.slug}`}
                  className="block text-center text-[var(--color-teal)] text-sm font-medium mt-3 hover:underline"
                >
                  Tous nos services a {city.name} &rarr;
                </Link>
              </div>
            </div>

            {/* Other cities for this service */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">{service.shortTitle} — Autres villes</h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/services/${service.slug}/${c.slug}`}
                    className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-600 hover:text-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-colors border border-gray-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
