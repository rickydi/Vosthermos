// HowTo guides for GEO (Generative Engine Optimization) and Google Rich Results
// These are structured step-by-step guides that LLMs and search engines love.
// Each guide emits a Schema.org HowTo JSON-LD block on its page.

export const HOWTOS = [
  {
    slug: "remplacer-roulette-porte-patio",
    title: "Comment remplacer les roulettes d'une porte-patio",
    metaTitle: "Comment remplacer les roulettes d'une porte-patio • Guide 2026 | Vosthermos",
    metaDescription: "Guide etape par etape pour remplacer les roulettes d'une porte-patio qui glisse mal. Outils, pieces, duree, cout et astuces de pro. 15 ans d'experience.",
    description:
      "Une porte-patio qui glisse mal ou sort du rail a presque toujours un probleme de roulettes usees. Ce guide vous explique comment les remplacer vous-meme ou faire evaluer la situation par nos techniciens.",
    totalTime: "PT45M",
    estimatedCost: { currency: "CAD", value: "30-150" },
    difficulty: "Intermediaire",
    relatedService: "reparation-porte-patio",
    supply: [
      "Paire de roulettes de remplacement (compatibles avec votre modele)",
      "Tournevis Phillips #2",
      "Cle Allen 4mm",
      "Cle a molette ou pince-etau",
      "Lubrifiant au silicone (pour le rail)",
    ],
    tool: [
      "Tournevis Phillips",
      "Cle Allen 4mm",
      "Pince-etau ou cle a molette",
      "Aspirateur (pour nettoyer le rail)",
    ],
    steps: [
      {
        name: "Retirer la porte-patio de son rail",
        text:
          "Commencez par devisser la vis de reglage en haut de la porte (cote verrou) pour relever la porte au maximum. Ensuite, soulevez la porte vers le haut pour la degager du rail inferieur et tirez le bas de la porte vers vous. Attention: une porte-patio pese entre 40 et 80 kg, demandez de l'aide.",
      },
      {
        name: "Nettoyer le rail avec un aspirateur",
        text:
          "Profitez du fait que la porte est enlevee pour nettoyer le rail a fond avec un aspirateur. Retirez toute la salete, cheveux, poils d'animaux et debris accumules. Un rail encrasse fait user les roulettes prematurement.",
      },
      {
        name: "Devisser les roulettes usees",
        text:
          "Les roulettes se trouvent au bas de la porte, a chaque coin. Devissez les vis de fixation (generalement 2 par roulette) avec votre tournevis Phillips. Si la vis est rouillee, utilisez un spray penetrant type WD-40 et attendez 10 minutes.",
      },
      {
        name: "Installer les nouvelles roulettes",
        text:
          "Inserez les nouvelles roulettes exactement dans le meme sens que les anciennes. Vissez les vis de fixation. Assurez-vous que les roulettes tournent librement apres installation. Conseil: choisir des roulettes en acier inoxydable a roulement a billes pour une duree de vie 3x plus longue.",
      },
      {
        name: "Reinstaller la porte-patio",
        text:
          "Inclinez le bas de la porte et engagez les nouvelles roulettes sur le rail inferieur. Assurez-vous que le haut de la porte s'engage correctement dans le rail superieur. Testez le glissement: la porte doit glisser sans effort.",
      },
      {
        name: "Ajuster la hauteur de la porte",
        text:
          "Avec la vis de reglage en haut (cote verrou), ajustez la hauteur de la porte pour qu'elle ferme correctement sur son coupe-froid. Testez l'ouverture et la fermeture plusieurs fois. Appliquez un peu de lubrifiant au silicone sur le rail pour une glisse optimale.",
      },
    ],
    tips: [
      "Si les roulettes sont usees, le rail peut aussi l'etre. Inspectez-le visuellement.",
      "Remplacez toujours les 2 roulettes en meme temps, meme si une seule semble usee.",
      "Les roulettes en plastique d'origine s'usent en 10-15 ans. L'acier inoxydable dure 25+ ans.",
      "Si le probleme persiste apres remplacement, le cadre de la porte est peut-etre desequilibre. Appelez-nous pour une evaluation.",
    ],
    whenToCallPro:
      "Si vous n'arrivez pas a enlever la porte, si le rail est deforme, si le cadre semble desaligne ou si la porte reste difficile a glisser apres remplacement. Notre service est de 150$-300$ incluant les roulettes et l'ajustement complet.",
  },
  {
    slug: "diagnostiquer-vitre-thermos-embuee",
    title: "Comment diagnostiquer une vitre thermos embuee",
    metaTitle: "Diagnostiquer une Vitre Thermos Embuee • Guide Expert 2026",
    metaDescription: "Comment savoir si votre vitre thermos doit etre remplacee ou desembuee. Tests visuels, signes d'urgence et solutions. Guide gratuit par Vosthermos.",
    description:
      "Une buee entre les panneaux de verre signifie que le scellant de l'unite thermos a fait defaut. Ce guide vous aide a identifier le probleme et choisir la bonne solution (desembuage vs remplacement).",
    totalTime: "PT15M",
    estimatedCost: { currency: "CAD", value: "0" },
    difficulty: "Facile",
    relatedService: "remplacement-vitre-thermos",
    supply: [],
    tool: [
      "Lampe de poche",
      "Chiffon sec",
      "Bloc-notes pour noter les fenetres affectees",
    ],
    steps: [
      {
        name: "Identifier ou se trouve la buee",
        text:
          "La buee d'une vitre thermos defectueuse se trouve TOUJOURS entre les 2 panneaux de verre, impossible a essuyer de l'interieur ou de l'exterieur. Si la buee est sur la surface interieure, c'est de la condensation liee a l'humidite de la piece (ce n'est pas un probleme de thermos).",
      },
      {
        name: "Verifier avec un chiffon sec",
        text:
          "Essuyez la vitre sur sa face interieure avec un chiffon sec. Si la buee reste, elle est emprisonnee entre les vitres. Si elle disparait, c'est de la condensation de surface (humidifiez moins la maison, ventilez mieux).",
      },
      {
        name: "Examiner les bords de la vitre",
        text:
          "Regardez les bords de la vitre avec une lampe de poche. Un joint de scellant fissure, jauni ou noirci est un indicateur que l'unite thermos est compromise. C'est la cause principale des buees permanentes.",
      },
      {
        name: "Tester a differentes temperatures",
        text:
          "Observez la vitre tot le matin (froid) et en apres-midi (chaud). Si la buee apparait/disparait selon la temperature, c'est clair: l'humidite circule entre les panneaux = scellant defectueux. Si la buee est permanente, le probleme est plus avance (depot calcaire sur le verre).",
      },
      {
        name: "Evaluer les degats et choisir la solution",
        text:
          "Buee legere et intermittente: desembuage possible (80-150$/vitre). Buee permanente mais verre encore clair: desembuage limite ou remplacement recommande. Taches blanches/depots calcaires visibles: remplacement obligatoire (150-400$/vitre). Contactez-nous avec une photo pour une evaluation gratuite.",
      },
    ],
    tips: [
      "Prenez des photos de chaque vitre affectee pour notre evaluation",
      "Notez si le probleme est saisonnier (typique en hiver quand l'ecart de temperature est grand)",
      "Verifiez votre garantie — beaucoup de fenetres recentes ont 10-20 ans de garantie sur le thermos",
      "Plus vous attendez, plus les depots calcaires rendent le desembuage impossible",
    ],
    whenToCallPro:
      "Pour evaluation gratuite d'une ou plusieurs vitres, pour obtenir une soumission precise ou si vous hesitez entre desembuage et remplacement. Nous nous deplacons gratuitement a Montreal et sur la Rive-Sud.",
  },
  {
    slug: "ajuster-porte-patio-qui-glisse-mal",
    title: "Comment ajuster une porte-patio qui glisse mal sans changer les roulettes",
    metaTitle: "Ajuster une Porte-Patio qui Glisse Mal • Guide 2026 | Vosthermos",
    metaDescription: "Avant de remplacer les roulettes, essayez ces 5 ajustements simples qui reglent 40% des problemes de glissement de porte-patio. Guide gratuit.",
    description:
      "Avant de remplacer les roulettes d'une porte-patio qui glisse mal, il y a plusieurs ajustements simples qui reglent souvent le probleme gratuitement. Ce guide vous explique la sequence complete.",
    totalTime: "PT20M",
    estimatedCost: { currency: "CAD", value: "0-15" },
    difficulty: "Facile",
    relatedService: "reparation-porte-patio",
    supply: [
      "Lubrifiant au silicone (pas de WD-40 ni graisse — attire la poussiere)",
      "Aspirateur",
    ],
    tool: [
      "Tournevis Phillips",
      "Aspirateur",
    ],
    steps: [
      {
        name: "Aspirer le rail inferieur",
        text:
          "40% des portes qui glissent mal ont simplement un rail encrasse. Passez l'aspirateur sur toute la longueur du rail inferieur. Ciblez les coins et les zones ou la porte s'arrete. Enlevez tous les cheveux, poussiere et debris.",
      },
      {
        name: "Lubrifier le rail au silicone",
        text:
          "Vaporisez du lubrifiant au silicone sur toute la longueur du rail (pas de WD-40 qui s'evapore, pas de graisse qui attire la poussiere). Le silicone est durable et n'affecte pas les surfaces vinyles/aluminium.",
      },
      {
        name: "Ajuster la hauteur avec la vis de reglage",
        text:
          "En haut de la porte, cote verrou, il y a une vis de reglage. La tourner dans le sens des aiguilles souleve la porte, dans l'autre sens l'abaisse. Si la porte frotte sur le rail du haut ou du bas, c'est cette vis qu'il faut ajuster. Faites des quarts de tour a la fois.",
      },
      {
        name: "Verifier l'alignement du cadre",
        text:
          "Ouvrez la porte a 50%. Regardez si l'espace entre la porte et le cadre est uniforme sur toute la hauteur. Si le cadre est voile (plus etroit en haut qu'en bas par exemple), la porte va toujours frotter. Dans ce cas, ajustez la hauteur pour compenser autant que possible.",
      },
      {
        name: "Tester et ajuster",
        text:
          "Glissez la porte plusieurs fois apres chaque ajustement. Si apres ces 4 etapes le probleme persiste, c'est probablement les roulettes qui sont usees — dans ce cas, voyez notre guide 'Remplacer les roulettes de porte-patio' ou contactez nos techniciens.",
      },
    ],
    tips: [
      "Ne jamais utiliser de WD-40 sur le rail — ca attire la saleté et s'evapore",
      "Si le rail est bosse ou deforme, aucun ajustement ne reglera le probleme — il faut remplacer le rail",
      "Le lubrifiant au silicone dure 3-6 mois avant de devoir etre reapplique",
      "Faites l'entretien preventif 2x par annee (printemps + automne)",
    ],
    whenToCallPro:
      "Si apres ces ajustements la porte glisse toujours mal, si le rail est visiblement bosse, ou si vous n'etes pas a l'aise de toucher au mecanisme. Notre service commence a 150$ tout inclus.",
  },
];

export function getHowto(slug) {
  return HOWTOS.find((h) => h.slug === slug) || null;
}

export function generateStaticParams() {
  return HOWTOS.map((h) => ({ slug: h.slug }));
}
