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
  {
    slug: "reparer-moustiquaire-dechiree",
    title: "Comment reparer une moustiquaire dechiree ou endommagee",
    metaTitle: "Reparer une Moustiquaire Dechiree • Guide 2026 | Vosthermos",
    metaDescription: "Guide complet pour reparer une moustiquaire de fenetre ou porte-patio dechiree: remplacement de toile, reparation de cadre, outils et cout. Par Vosthermos.",
    description:
      "Une petite dechirure dans votre moustiquaire laisse entrer insectes et pollen. Ce guide vous explique comment faire la reparation vous-meme ou quand faire appel a un specialiste pour un remplacement complet de la toile.",
    totalTime: "PT30M",
    estimatedCost: { currency: "CAD", value: "5-40" },
    difficulty: "Facile",
    relatedService: "moustiquaires-sur-mesure",
    supply: [
      "Patch de reparation autocollant (pour petites dechirures)",
      "Rouleau de toile de remplacement (fibre de verre ou aluminium)",
      "Joint spline en caoutchouc (si remplacement complet)",
      "Colle pour toile de moustiquaire (optionnel)",
    ],
    tool: [
      "Couteau utilitaire avec lame neuve",
      "Roulette a spline (pour remplacement complet)",
      "Ciseaux",
      "Ruban a mesurer",
    ],
    steps: [
      {
        name: "Evaluer l'etendue du dommage",
        text:
          "Inspectez la toile. Une petite dechirure (moins de 3 cm) peut etre reparee avec un patch. Si la toile a plusieurs dechirures, des grandes fentes, ou si elle est etiree/distendue, il faut remplacer toute la toile. Si le cadre aluminium est tordu ou casse, voir l'etape 7.",
      },
      {
        name: "Pour une petite dechirure: nettoyer la zone",
        text:
          "Nettoyez la zone autour de la dechirure avec un chiffon sec. Enlevez la poussiere et les debris. Si la dechirure est au bord d'un fil, rapprochez delicatement les bords avec vos doigts pour qu'ils se touchent.",
      },
      {
        name: "Pour une petite dechirure: appliquer le patch",
        text:
          "Coupez un patch autocollant legerement plus grand que la dechirure (marge de 1 cm tout autour). Retirez le support et appliquez le patch des DEUX cotes de la moustiquaire pour un meilleur maintien. Pressez fermement 30 secondes.",
      },
      {
        name: "Pour un remplacement complet: retirer le vieux spline",
        text:
          "Avec un tournevis plat ou le dos du couteau, tirez delicatement sur l'extremite du joint spline (caoutchouc qui tient la toile dans le cadre). Une fois amorce, tirez-le completement autour du cadre. La vieille toile va se detacher.",
      },
      {
        name: "Decouper la nouvelle toile",
        text:
          "Posez la nouvelle toile a plat sur le cadre. Coupez en laissant 3 cm de surplus sur chaque cote. Alignez le fil de la toile avec le cadre (important pour un resultat propre).",
      },
      {
        name: "Installer la toile avec la roulette a spline",
        text:
          "Commencez par un coin. Placez le spline dans la rainure et enfoncez-le en passant la roulette dessus pour ancrer la toile. Travaillez sur un cote a la fois en maintenant la toile tendue. Coupez le surplus au couteau. Si la toile ondule, ajustez en retirant et reposant le spline.",
      },
      {
        name: "Inspecter le cadre",
        text:
          "Si le cadre en aluminium est tordu, essayez de le redresser delicatement avec les mains. Si un coin est brise, remplacez le coin plastique (disponible en quincaillerie). Si la deformation est severe, le cadre doit etre refabrique.",
      },
    ],
    tips: [
      "La toile en aluminium dure 15+ ans. La fibre de verre 8-10 ans.",
      "Pour les chats/chiens, optez pour la toile 'pet-resistant' (plus epaisse, ~3x plus resistante)",
      "La toile anti-pollen bloque les pollens mais reduit legerement la visibilite",
      "Pour les grandes quantites (maison complete), Vosthermos offre un rabais de 20%+",
      "Un patch de reparation coute 5-10$, une nouvelle toile 15-30$, une moustiquaire complete 30-80$",
    ],
    whenToCallPro:
      "Si la moustiquaire a plus de 3 dechirures, si le cadre est severement endommage, si vous avez besoin d'une moustiquaire sur mesure (dimensions non standards) ou si c'est une moustiquaire de porte-patio (plus complexe). Notre service de fabrication est de 25$/unite et livraison 48h.",
  },
  {
    slug: "calfeutrer-fenetre-exterieur",
    title: "Comment calfeutrer une fenetre exterieur correctement",
    metaTitle: "Comment Calfeutrer une Fenetre Exterieur • Guide Expert | Vosthermos",
    metaDescription: "Guide pro pour calfeutrer une fenetre exterieur: preparation, choix du scellant, techniques et pieges a eviter. Evitez les infiltrations d'eau. Par Vosthermos.",
    description:
      "Un calfeutrage de qualite protege votre maison contre les infiltrations d'eau et les courants d'air froid. Ce guide etape par etape vous montre comment faire un travail professionnel qui durera 10-15 ans.",
    totalTime: "PT1H",
    estimatedCost: { currency: "CAD", value: "15-50" },
    difficulty: "Intermediaire",
    relatedService: "calfeutrage",
    supply: [
      "Scellant polyurethane ou silicone hybride (ne pas utiliser silicone pur)",
      "Ruban masque de peintre",
      "Chiffons propres",
      "Alcool isopropylique (pour nettoyer)",
      "Ruban backer (pour joints larges)",
    ],
    tool: [
      "Pistolet a calfeutrer",
      "Couteau utilitaire (pour retirer vieux calfeutrage)",
      "Grattoir",
      "Spatule ou doigt mouille (pour lisser)",
      "Echelle (pour etages)",
    ],
    steps: [
      {
        name: "Choisir le bon scellant",
        text:
          "N'UTILISEZ PAS de silicone pur exterieur: il ne peut pas etre repeint et perd son elasticite au froid. Utilisez un scellant polyurethane (Sikaflex, PL Premium) ou silicone hybride (DAP Dynaflex). Ces produits sont elastiques, repeinables et certifies climat nordique (resistent -40°C a +90°C).",
      },
      {
        name: "Retirer le vieux calfeutrage",
        text:
          "Avec votre couteau utilitaire, coupez et retirez tout l'ancien scellant. Grattez les residus. Un scellant applique sur du vieux scellant ne tiendra pas. Si le vieux est dur comme du plastique, utilisez un produit enlevant a scellant (Caulk Remover) applique 2-4h avant.",
      },
      {
        name: "Nettoyer la surface a fond",
        text:
          "Nettoyez les surfaces (cadre de fenetre et mur) avec un chiffon imbibe d'alcool isopropylique. Retirez toute la poussiere, graisse, saletes. La surface doit etre SECHE et propre. C'est l'etape la plus importante: un scellant sur surface sale se decolle en 1 an.",
      },
      {
        name: "Appliquer le ruban masque",
        text:
          "Posez du ruban masque de peintre de chaque cote du joint pour obtenir une ligne propre. Laissez environ 3-5mm de largeur de joint visible (plus c'est large, plus le scellant sera visible). Le ruban facilite le nettoyage et donne un fini professionnel.",
      },
      {
        name: "Appliquer le scellant",
        text:
          "Coupez l'embout du tube a 45° a la largeur du joint (1/4 pouce typique). Percez le joint interne du tube si necessaire. Appliquez le scellant en un mouvement continu, en poussant le pistolet devant vous (pas en tirant). Maintenez un angle constant de 45° pour une extrusion reguliere.",
      },
      {
        name: "Lisser immediatement",
        text:
          "Avec votre doigt mouille (eau savonneuse) ou une spatule, lissez le joint en un seul passage. Le lissage doit se faire dans les 5 minutes avant que le scellant ne forme une peau. Retirez le ruban masque AVANT que le scellant seche (sinon le ruban se colle au scellant).",
      },
      {
        name: "Temps de sechage",
        text:
          "Le scellant est au toucher apres 30-60 min. Etancheite complete apres 24h. Peinture possible apres 48-72h (verifier les instructions du fabricant). Ne pas exposer a la pluie pendant 4h minimum apres application. Evitez de calfeutrer si pluie prevue dans la journee.",
      },
    ],
    tips: [
      "Calfeutrer a une temperature entre 5°C et 25°C (le scellant n'adhere pas bien en dehors)",
      "Un tube de 300ml couvre environ 30 pieds lineaires (selon l'epaisseur du joint)",
      "Pour les joints de plus de 1cm de largeur, utilisez du ruban backer en dessous (fond de joint) avant le scellant",
      "Le polyurethane est plus resistant mais plus cher (8-12$/tube) que le silicone hybride (5-8$/tube)",
      "La duree de vie d'un calfeutrage professionnel est de 10-15 ans. Remplacez a la premiere fissure apparente",
    ],
    whenToCallPro:
      "Pour des calfeutrages de grande envergure (maison complete), si vous avez peur des hauteurs (etages superieurs), si vos joints sont deja endommages par des infiltrations d'eau (peut necessiter reparation du revetement), ou si vous voulez garantie de 10 ans. Nos tarifs commencent a 8$/pied lineaire tout inclus.",
  },
  {
    slug: "desembuer-vitre-thermos",
    title: "Comment savoir si une vitre thermos peut etre desembuee plutot que remplacee",
    metaTitle: "Desembuer une Vitre Thermos • Guide d'Evaluation | Vosthermos",
    metaDescription: "Guide gratuit pour savoir si votre vitre thermos peut etre desembuee ou doit etre remplacee. Economisez jusqu'a 50%. Tests visuels par Vosthermos.",
    description:
      "Le desembuage est une alternative economique au remplacement complet de vos vitres thermos embuees, mais il ne fonctionne pas dans tous les cas. Ce guide vous aide a evaluer si votre situation est candidate au desembuage.",
    totalTime: "PT10M",
    estimatedCost: { currency: "CAD", value: "0" },
    difficulty: "Facile",
    relatedService: "desembuage",
    supply: [],
    tool: [
      "Lampe de poche",
      "Chiffon sec",
      "Appareil photo (pour documenter)",
    ],
    steps: [
      {
        name: "Verifier l'age de la fenetre",
        text:
          "Le desembuage fonctionne mieux sur des vitres de moins de 15 ans. Au dela, le verre a souvent des depots calcaires mineralise permanents qui ne partent pas au nettoyage. Si votre fenetre a plus de 20 ans, le remplacement est probablement une meilleure option.",
      },
      {
        name: "Observer le type de buee",
        text:
          "La buee d'une unite scellee defaillante commence generalement comme une fine couche d'humidite qui apparait le matin et disparait l'apres-midi. Avec le temps, elle devient permanente. Si votre buee est intermittente (matin/soir), votre vitre est un excellent candidat au desembuage.",
      },
      {
        name: "Chercher les depots calcaires",
        text:
          "Examinez la vitre avec une lampe de poche, de cote. Cherchez des taches blanches, laiteuses ou des lignes de depots qui ressemblent a des traces d'eau seche. Ces depots sont des mineraux qui se sont accumules a l'interieur et ne peuvent pas etre desembues. Si vous en voyez, le remplacement est necessaire.",
      },
      {
        name: "Verifier l'integrite du verre",
        text:
          "Examinez le verre des deux cotes. Cherchez des fissures, egratignures profondes ou zones de depot de saletes. Si le verre est endommage ou gravement usine par des annees de nettoyage, le desembuage ne restaurera pas sa clarte originale.",
      },
      {
        name: "Prendre des photos de reference",
        text:
          `Photographiez chaque vitre concernee en differents eclairages (matin, apres-midi, nuit). Ces photos nous aident a evaluer a distance si votre fenetre est un bon candidat. Envoyez-les par courriel a ${COMPANY_INFO.email} avec vos dimensions.`,
      },
    ],
    tips: [
      "Le desembuage coute 80-200$ par vitre (vs 150-450$ pour un remplacement)",
      "Le processus prend 1-2 heures et laisse une petite valve discrete dans le coin de la vitre",
      "Le desembuage ne restaure pas la performance energetique initiale (le gaz argon reste echappe)",
      "Si plusieurs fenetres doivent etre remplacees, le remplacement complet devient plus rentable",
      "Les fenetres avec scellant en butyl noir sont plus faciles a desembuer que celles avec scellant blanc",
    ],
    whenToCallPro:
      "Contactez-nous avec des photos pour une evaluation gratuite. Nous vous dirons honnetement si le desembuage est recommande ou si le remplacement est plus approprie pour votre situation. Vosthermos est l'un des rares specialistes du desembuage au Quebec.",
  },
  {
    slug: "changer-coupe-froid-porte-patio",
    title: "Comment changer le coupe-froid d'une porte-patio",
    metaTitle: "Changer Coupe-Froid Porte-Patio • Guide DIY | Vosthermos",
    metaDescription: "Guide etape par etape pour remplacer le coupe-froid use d'une porte-patio: identification, mesures, installation. Economisez sur le chauffage. Vosthermos.",
    description:
      "Un coupe-froid use sur une porte-patio laisse passer l'air froid et augmente vos couts de chauffage. Ce guide vous explique comment identifier, acheter et installer le bon coupe-froid pour votre modele.",
    totalTime: "PT45M",
    estimatedCost: { currency: "CAD", value: "15-50" },
    difficulty: "Intermediaire",
    relatedService: "coupe-froid",
    supply: [
      "Coupe-froid de remplacement (adapte a votre modele)",
      "Lubrifiant au silicone (pour l'installation)",
      "Chiffon propre",
    ],
    tool: [
      "Tournevis Phillips et plat",
      "Couteau utilitaire",
      "Ciseaux",
      "Ruban a mesurer",
    ],
    steps: [
      {
        name: "Identifier le type de coupe-froid",
        text:
          "Les portes-patio utilisent generalement 3 types de coupe-froid: (1) brosse (pile) pour les cotes coulissants, (2) caoutchouc/vinyle compressible pour le cadre fixe, (3) mousse compressive pour le rail. Photographiez chaque section de coupe-froid de votre porte pour identification.",
      },
      {
        name: "Prendre des mesures precises",
        text:
          "Mesurez la longueur totale de chaque section de coupe-froid a remplacer. Mesurez aussi l'epaisseur et la largeur du coupe-froid existant. Ces dimensions sont critiques: un coupe-froid mal dimensionne va soit frotter trop (porte difficile a glisser) soit ne pas assez (courant d'air).",
      },
      {
        name: "Acheter le bon modele",
        text:
          "Apportez un echantillon de l'ancien coupe-froid chez Vosthermos ou en quincaillerie. Les marques de portes-patio (Novatech, Lepage, Fenplast) utilisent souvent des profiles proprietaires differents de ceux en magasin. Si vous n'etes pas sur, prenez une photo et envoyez-la nous.",
      },
      {
        name: "Retirer l'ancien coupe-froid",
        text:
          "Ouvrez la porte-patio. Retirez l'ancien coupe-froid: certains se clipsent dans une rainure (tirez simplement), d'autres sont colles (utilisez le couteau utilitaire pour couper l'adhesif). Nettoyez la rainure avec un chiffon pour enlever toute saletes ou residus.",
      },
      {
        name: "Installer le nouveau coupe-froid",
        text:
          "Pour les modeles a rainure: coupez a la bonne longueur et enfoncez dans la rainure en commencant par un bout. Pour les modeles adhesifs: retirez le papier protecteur progressivement pendant l'installation (pas tout d'un coup). Pressez fermement sur toute la longueur.",
      },
      {
        name: "Tester l'etancheite",
        text:
          "Fermez la porte. Passez votre main le long du coupe-froid: vous ne devriez plus sentir de courant d'air. Glissez la porte plusieurs fois - elle ne devrait pas frotter excessivement. Si c'est le cas, le coupe-froid est trop epais ou mal place.",
      },
      {
        name: "Lubrifier et maintenir",
        text:
          "Vaporisez un peu de lubrifiant au silicone sur le nouveau coupe-froid pour prolonger sa vie et faciliter le glissement de la porte. Repetez l'operation 2 fois par annee (printemps et automne) pour un entretien optimal.",
      },
    ],
    tips: [
      "Un coupe-froid de qualite dure 10-15 ans. Remplacez-le au premier signe d'usure",
      "Le coupe-froid brosse (pile) resiste mieux aux intemperies que la mousse",
      "Si votre porte reste difficile a glisser apres installation, les roulettes sont probablement usees (voir notre guide)",
      "Un coupe-froid use peut augmenter votre facture de chauffage de 5-15% annuellement",
      "Le cout d'un coupe-froid complet de porte-patio est de 15-50$ en materiel, vs 80-200$ installe",
    ],
    whenToCallPro:
      "Si vous ne trouvez pas le bon profil, si le cadre de la porte est endommage, si le coupe-froid est particulierement complexe (porte-patio 3 volets, porte levante-coulissante) ou si vous voulez garantie d'etancheite. Notre service de remplacement commence a 80$ tout inclus.",
  },
  {
    slug: "changer-manivelle-fenetre",
    title: "Comment changer une manivelle de fenetre cassee",
    metaTitle: "Changer Manivelle de Fenetre • Guide Rapide | Vosthermos",
    metaDescription: "Guide pratique pour changer la manivelle cassee d'une fenetre a battant ou a auvent. Identifier le modele, outils, installation. Par Vosthermos.",
    description:
      "Une manivelle cassee empeche d'ouvrir ou de fermer votre fenetre. Ce guide vous explique comment identifier le bon modele et installer une nouvelle manivelle en 20 minutes.",
    totalTime: "PT20M",
    estimatedCost: { currency: "CAD", value: "10-40" },
    difficulty: "Facile",
    relatedService: "remplacement-quincaillerie",
    supply: [
      "Nouvelle manivelle (compatible avec votre modele)",
      "Visserie (souvent incluse avec la nouvelle manivelle)",
    ],
    tool: [
      "Tournevis Phillips #2",
      "Tournevis plat (pour retirer capuchons)",
    ],
    steps: [
      {
        name: "Identifier le type de manivelle",
        text:
          "Les fenetres utilisent 2 types principaux: (1) manivelle standard avec bras plat, (2) manivelle dissimulee (folding) qui se replie. Observez votre fenetre: si la manivelle depasse, c'est standard. Si elle se replie dans un compartiment, c'est folding. Prenez une photo de l'ensemble operateur.",
      },
      {
        name: "Identifier la marque de l'operateur",
        text:
          "Enlevez delicatement le capuchon decoratif de l'operateur (coin inferieur). Vous verrez souvent un marquage (Truth, Roto, Maco). Cette information est critique pour trouver la piece compatible. Truth est le plus courant au Quebec (marques Novatech, Fenplast, etc.).",
      },
      {
        name: "Enlever la vieille manivelle",
        text:
          "La manivelle est generalement fixee avec une ou deux vis. Devissez-les completement. Retirez la manivelle en la tirant hors de son axe. Si elle est coincee, tournez-la de droite a gauche tout en tirant. Ne forcez pas excessivement pour ne pas briser l'axe.",
      },
      {
        name: "Inspecter l'operateur",
        text:
          "Regardez l'axe carre ou rond ou se fixe la manivelle. S'il tourne sans resistance quand vous le manipulez avec les doigts, le probleme est juste la manivelle. S'il est bloque ou tourne sans actionner la fenetre, c'est l'operateur complet qui est brise (remplacement plus complexe).",
      },
      {
        name: "Installer la nouvelle manivelle",
        text:
          "Alignez la nouvelle manivelle sur l'axe (la plupart sont carre, certaines rondes avec un plat). Poussez-la jusqu'au fond. Vissez les vis de fixation. Testez en tournant - la fenetre devrait s'ouvrir/fermer sans jeu ni resistance.",
      },
    ],
    tips: [
      "Les manivelles standard coutent 10-25$. Les folding (dissimulees) 20-40$",
      "Gardez toujours une manivelle de remplacement en reserve pour les fenetres identiques",
      "Si la fenetre est difficile a ouvrir meme avec une nouvelle manivelle, l'operateur interne est a remplacer (50-120$)",
      "Les manivelles Truth sont interchangeables entre plusieurs modeles de fenetres",
      "Pour trouver votre piece: apportez l'ancienne manivelle chez Vosthermos ou envoyez une photo",
    ],
    whenToCallPro:
      "Si la vieille manivelle est cassee dans l'axe (impossible a retirer), si l'operateur interne est brise (fenetre qui ne s'ouvre/ferme pas meme avec nouvelle manivelle), ou si vous avez plusieurs manivelles a remplacer (rabais quantite). Notre service commence a 40$ tout inclus.",
  },
];

export function getHowto(slug) {
  return HOWTOS.find((h) => h.slug === slug) || null;
}

export function generateStaticParams() {
  return HOWTOS.map((h) => ({ slug: h.slug }));
}
