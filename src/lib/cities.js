export const CITIES = [
  {
    slug: "montreal",
    name: "Montréal",
    region: "Île de Montréal",
    distance: "30 min",
    population: "1.8M habitants",
    description:
      "Montréal possède un parc immobilier parmi les plus anciens au Québec, avec des milliers de triplex et duplex centenaires sur le Plateau, à Rosemont et dans Verdun. Les fenêtres à guillotine d'époque et les vitres thermos des années 80-90 arrivent massivement en fin de vie, causant buée, infiltrations et pertes énergétiques importantes durant nos hivers rigoureux.",
    neighborhoods: ["Le Plateau-Mont-Royal", "Rosemont-La Petite-Patrie", "Verdun", "Notre-Dame-de-Grâce", "Villeray"],
    commonIssues: [
      "Buée entre les vitres thermos des vieux triplex et duplex centenaires",
      "Quincaillerie rouillée et mécanismes grippés sur les fenêtres à guillotine d'époque",
      "Joints d'étanchéité détériorés causant des infiltrations d'air dans les bâtiments d'avant-guerre",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Montréal?", answer: "Le prix varie selon la taille et le type de vitre. Pour un thermos standard de fenêtre de triplex montréalais, comptez entre 150$ et 350$ par unité installée. Nous offrons des soumissions gratuites à domicile partout sur l'île de Montréal." },
      { question: "Desservez-vous tous les arrondissements de Montréal?", answer: "Oui, nous couvrons l'ensemble de l'île de Montréal, du Plateau-Mont-Royal à Verdun, en passant par NDG, Villeray, Rosemont et tous les autres arrondissements. Notre atelier est à seulement 30 minutes du centre-ville." },
      { question: "Les vieux triplex de Montréal peuvent-ils recevoir des vitres thermos modernes?", answer: "Absolument. Nous sommes spécialisés dans l'adaptation de vitres thermos modernes aux cadres de fenêtres des triplex et duplex centenaires de Montréal. Nous conservons le cachet d'origine tout en améliorant l'isolation thermique." },
      { question: "Quel est le délai pour une réparation de fenêtres à Montréal?", answer: "En général, nous pouvons effectuer la soumission dans les 48 heures et procéder à l'installation dans un délai de 1 à 2 semaines. En période de forte demande (automne), prévoyez un peu plus de temps." },
    ],
  },
  {
    slug: "laval",
    name: "Laval",
    region: "Laval",
    distance: "35 min",
    population: "440 000 habitants",
    description:
      "Laval combine un vaste parc de bungalows des années 1970-80 dans les secteurs comme Chomedey et Fabreville avec des développements récents de condos et maisons de ville à Sainte-Rose et Sainte-Dorothée. Les propriétaires de maisons plus anciennes font face à des remplacements massifs de vitres thermos, tandis que les constructions neuves nécessitent surtout de l'entretien préventif de quincaillerie.",
    neighborhoods: ["Chomedey", "Sainte-Rose", "Fabreville", "Vimont", "Sainte-Dorothée"],
    commonIssues: [
      "Vitres thermos embuées dans les bungalows des années 70-80 de Chomedey et Fabreville",
      "Portes-patio à roulettes usées dans les propriétés de 30-40 ans",
      "Moustiquaires endommagées par le vent sur les grandes fenêtres des constructions neuves",
    ],
    faq: [
      { question: "Combien coûte le remplacement d'une vitre thermos à Laval?", answer: "Les prix débutent autour de 150$ pour un thermos standard. Pour les bungalows typiques de Chomedey ou Fabreville avec des fenêtres plus grandes, le coût se situe généralement entre 200$ et 400$ par unité. Soumission gratuite sur place." },
      { question: "Offrez-vous un service de réparation de portes-patio à Laval?", answer: "Oui, la réparation de portes-patio est l'un de nos services les plus demandés à Laval. Nous remplaçons les roulettes, les poignées, les serrures et les rails usés. Nous nous déplaçons dans tous les quartiers de Laval." },
      { question: "Pourquoi les bungalows de Laval ont-ils souvent des problèmes de thermos?", answer: "Les bungalows construits entre 1970 et 1985 à Laval utilisaient des vitres thermos de première génération dont la durée de vie est de 20 à 30 ans. Ces thermos sont maintenant largement en fin de vie, ce qui explique la buée et la perte d'isolation." },
    ],
  },
  {
    slug: "longueuil",
    name: "Longueuil",
    region: "Rive-Sud",
    distance: "20 min",
    population: "260 000 habitants",
    description:
      "Longueuil est l'une des plus anciennes villes de la Rive-Sud avec un patrimoine bâti diversifié allant des maisons patrimoniales du Vieux-Longueuil aux grands ensembles résidentiels des années 1970-80 de LeMoyne et Saint-Hubert. Cette diversité architecturale crée des besoins variés en réparation, du remplacement de fenêtres en bois centenaires aux vitres thermos standards.",
    neighborhoods: ["Vieux-Longueuil", "LeMoyne", "Saint-Hubert", "Greenfield Park"],
    commonIssues: [
      "Fenêtres en bois pourri ou gauchi dans les maisons patrimoniales du Vieux-Longueuil",
      "Scellant craquelé et vitres thermos embuées dans les constructions des années 70-80",
      "Portes d'entrée en bois déformées par les cycles gel-dégel de la Rive-Sud",
    ],
    faq: [
      { question: "Quel est le prix d'une réparation de fenêtres à Longueuil?", answer: "Le coût dépend du type de réparation. Un remplacement de thermos standard commence à environ 150$, tandis que la restauration de fenêtres en bois patrimoniales du Vieux-Longueuil peut varier entre 300$ et 600$. Nous offrons une soumission gratuite." },
      { question: "Vous déplacez-vous à Longueuil et dans tout le secteur Rive-Sud?", answer: "Oui, Longueuil est à seulement 20 minutes de nos bureaux. Nous desservons le Vieux-Longueuil, LeMoyne, Saint-Hubert, Greenfield Park et tous les secteurs avoisinants de la Rive-Sud." },
      { question: "Les fenêtres patrimoniales du Vieux-Longueuil peuvent-elles être réparées plutôt que remplacées?", answer: "Dans la majorité des cas, oui. Nous sommes spécialisés dans la restauration de fenêtres en bois anciennes. Nous pouvons remplacer uniquement le thermos, réparer le cadre et redonner vie à vos fenêtres patrimoniales à une fraction du coût d'un remplacement complet." },
      { question: "Combien de temps dure un remplacement de thermos à Longueuil?", answer: "L'installation d'un thermos prend généralement entre 30 et 60 minutes par fenêtre. Pour une maison typique de Longueuil nécessitant 5 à 10 thermos, nous complétons le travail en une seule journée." },
    ],
  },
  {
    slug: "brossard",
    name: "Brossard",
    region: "Rive-Sud",
    distance: "25 min",
    population: "90 000 habitants",
    description:
      "Brossard connaît un contraste marqué entre les bungalows des années 1970 du secteur A et les tours de condos modernes près du Quartier DIX30 et du REM. Les propriétaires de maisons plus anciennes ont besoin de remplacements complets de vitres thermos, alors que les copropriétés neuves présentent parfois des défauts d'installation nécessitant des ajustements de quincaillerie.",
    neighborhoods: ["Quartier DIX30", "Secteur A (bungalows)", "Secteur R", "Panama", "Brossard-Éclair"],
    commonIssues: [
      "Thermos embuées dans les bungalows des années 70 du secteur résidentiel ancien",
      "Quincaillerie de portes-patio défaillante dans les condos neufs près du DIX30",
      "Perte d'efficacité énergétique des grandes baies vitrées face aux vents dominants",
    ],
    faq: [
      { question: "Combien coûte un remplacement de vitre thermos à Brossard?", answer: "Pour les bungalows du secteur A de Brossard, un thermos standard coûte entre 150$ et 300$. Les grandes baies vitrées des condos près du DIX30 peuvent coûter entre 350$ et 600$ selon les dimensions. Soumission gratuite et sans engagement." },
      { question: "Réparez-vous les fenêtres de condos à Brossard?", answer: "Oui, nous intervenons régulièrement dans les tours de condos de Brossard, notamment près du Quartier DIX30. Nous travaillons avec les syndicats de copropriété et pouvons offrir des tarifs de groupe pour les projets de remplacement à grande échelle." },
      { question: "Pourquoi mes fenêtres neuves de Brossard ont-elles déjà des problèmes de quincaillerie?", answer: "Les constructions neuves utilisent parfois de la quincaillerie d'entrée de gamme qui peut montrer des signes d'usure prématurée. Nous remplaçons poignées, mécanismes de verrouillage et charnières par des pièces de qualité supérieure." },
    ],
  },
  {
    slug: "boucherville",
    name: "Boucherville",
    region: "Rive-Sud",
    distance: "20 min",
    population: "44 000 habitants",
    description:
      "Boucherville marie harmonieusement son vieux quartier historique datant du régime français avec des développements résidentiels modernes de haute qualité. Les maisons patrimoniales du Vieux-Boucherville nécessitent des réparations spécialisées de fenêtres en bois, tandis que les propriétés des années 1990-2000 du secteur De Mortagne arrivent à l'âge où les vitres thermos commencent à faillir.",
    neighborhoods: ["Vieux-Boucherville", "De Mortagne", "Harmonie", "Du Boisé", "Les Promenades"],
    commonIssues: [
      "Restauration de fenêtres en bois d'origine dans les maisons patrimoniales du Vieux-Boucherville",
      "Vitres thermos en fin de vie dans les développements des années 90 du secteur De Mortagne",
      "Moustiquaires endommagées par la proximité du fleuve et les vents riverains",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Boucherville?", answer: "Les prix varient entre 150$ et 400$ par thermos selon la taille. Les maisons du secteur De Mortagne construites dans les années 90 ont souvent des formats standards qui se situent dans la fourchette de 175$ à 275$. Soumission gratuite à domicile." },
      { question: "Faites-vous la restauration de fenêtres patrimoniales à Boucherville?", answer: "Oui, nous avons une expertise particulière pour les fenêtres en bois d'origine du Vieux-Boucherville. Nous restaurons les cadres, remplaçons les vitres et préservons le cachet patrimonial de ces maisons historiques." },
      { question: "Desservez-vous tous les quartiers de Boucherville?", answer: "Absolument. Boucherville est à seulement 20 minutes de nos bureaux. Nous couvrons le Vieux-Boucherville, De Mortagne, Harmonie, Du Boisé et Les Promenades. Nous offrons un service rapide grâce à notre proximité." },
    ],
  },
  {
    slug: "saint-hyacinthe",
    name: "Saint-Hyacinthe",
    region: "Montérégie",
    distance: "45 min",
    population: "58 000 habitants",
    description:
      "Capitale agroalimentaire du Québec, Saint-Hyacinthe possède un centre-ville historique avec de nombreuses maisons victoriennes et des bâtiments commerciaux centenaires le long de la rivière Yamaska. Le parc immobilier vieillissant du centre, combiné au taux d'humidité élevé de cette zone agricole, accélère la dégradation des joints de vitres thermos et des cadres en bois.",
    neighborhoods: ["Centre-ville historique", "Douville", "La Providence", "Saint-Thomas-d'Aquin", "Secteur Casavant"],
    commonIssues: [
      "Pourriture des cadres de fenêtres en bois accélérée par l'humidité de la zone agricole",
      "Thermos embuées dans les maisons victoriennes et bâtiments centenaires du centre-ville",
      "Infiltrations d'eau autour des fenêtres causées par les pluies abondantes de la plaine",
    ],
    faq: [
      { question: "Combien coûte une réparation de fenêtres à Saint-Hyacinthe?", answer: "Un remplacement de thermos standard à Saint-Hyacinthe coûte entre 150$ et 350$. Pour les maisons victoriennes du centre-ville nécessitant des travaux de restauration de cadres en bois, le prix peut varier entre 300$ et 700$ selon l'ampleur des travaux." },
      { question: "Vous déplacez-vous jusqu'à Saint-Hyacinthe pour les réparations?", answer: "Oui, Saint-Hyacinthe fait partie de notre zone de service régulière. Nous sommes à environ 45 minutes de route et nous nous y déplaçons plusieurs fois par semaine pour servir notre clientèle de la Montérégie." },
      { question: "L'humidité de la zone agricole de Saint-Hyacinthe affecte-t-elle les fenêtres?", answer: "Oui, le taux d'humidité plus élevé dans cette zone agricole accélère la dégradation des joints d'étanchéité et la pourriture des cadres en bois. Nous recommandons des inspections régulières et un entretien préventif pour prolonger la durée de vie de vos fenêtres." },
      { question: "Offrez-vous un service d'urgence à Saint-Hyacinthe?", answer: "Nous priorisons les situations urgentes comme les bris de vitre ou les infiltrations actives. Contactez-nous au 514-825-8411 et nous ferons notre possible pour intervenir rapidement, généralement dans les 24 à 48 heures." },
    ],
  },
  {
    slug: "granby",
    name: "Granby",
    region: "Estrie",
    distance: "55 min",
    population: "70 000 habitants",
    description:
      "Située aux portes des Cantons-de-l'Est, Granby subit des hivers plus rigoureux que la grande région montréalaise avec des accumulations de neige supérieures. Le centre-ville conserve un beau patrimoine bâti du début du 20e siècle, et la ville connaît aussi une croissance résidentielle notable. L'exposition au froid intense rend l'efficacité des vitres thermos cruciale pour le confort et les coûts de chauffage.",
    neighborhoods: ["Centre-ville", "Secteur Ouest (Zoo)", "Drummondville Est", "Waterloo Road", "Miner"],
    commonIssues: [
      "Perte d'efficacité thermique accélérée par les hivers plus froids des Cantons-de-l'Est",
      "Condensation excessive et givre intérieur sur les fenêtres simple ou double vitrage ancien",
      "Quincaillerie grippée par le gel prolongé des portes et fenêtres exposées au nord",
    ],
    faq: [
      { question: "Combien coûte le remplacement de thermos à Granby?", answer: "Les prix sont similaires à ceux de la grande région : entre 150$ et 400$ par thermos selon la dimension. Vu les hivers plus rigoureux des Cantons-de-l'Est, nous recommandons des thermos à haut rendement énergétique (low-E avec argon) dont le coût se situe entre 250$ et 500$." },
      { question: "Desservez-vous Granby même si c'est plus éloigné?", answer: "Oui, Granby fait partie de notre territoire de service régulier. Nous sommes à environ 55 minutes et nous regroupons les rendez-vous dans le secteur Estrie pour offrir un service efficace. Aucuns frais de déplacement supplémentaires." },
      { question: "Pourquoi les fenêtres à Granby se dégradent-elles plus vite qu'à Montréal?", answer: "Les hivers plus froids et plus longs des Cantons-de-l'Est, combinés à de plus grandes accumulations de neige, créent un stress thermique supérieur sur les joints et les thermos. L'écart de température intérieur-extérieur plus important accélère la perte d'étanchéité du scellant." },
    ],
  },
  {
    slug: "saint-jean-sur-richelieu",
    name: "Saint-Jean-sur-Richelieu",
    region: "Montérégie",
    distance: "35 min",
    population: "100 000 habitants",
    description:
      "Saint-Jean-sur-Richelieu, traversée par la rivière Richelieu, possède un riche patrimoine militaire et architectural hérité de la garnison et du Fort Saint-Jean. La proximité de la rivière augmente le taux d'humidité ambiante, ce qui accélère la détérioration des joints d'étanchéité des fenêtres et la corrosion de la quincaillerie, particulièrement dans le Vieux-Saint-Jean et le secteur Iberville.",
    neighborhoods: ["Vieux-Saint-Jean", "Iberville", "Saint-Luc", "L'Acadie", "Secteur du Fort"],
    commonIssues: [
      "Corrosion accélérée de la quincaillerie due à l'humidité de la rivière Richelieu",
      "Joints d'étanchéité dégradés prématurément dans les maisons riveraines",
      "Fenêtres en bois gonflées et difficiles à opérer à cause du taux d'humidité élevé",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Saint-Jean-sur-Richelieu?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés riveraines du Vieux-Saint-Jean qui nécessitent souvent des formats sur mesure, les prix peuvent atteindre 400$ à 550$. Soumission gratuite et sans engagement." },
      { question: "L'humidité de la rivière Richelieu cause-t-elle des problèmes aux fenêtres?", answer: "Oui, la proximité de la rivière Richelieu augmente significativement le taux d'humidité ambiante, ce qui accélère la corrosion de la quincaillerie, la dégradation des joints et le gonflement des cadres en bois. Un entretien préventif régulier est fortement recommandé." },
      { question: "Vous déplacez-vous dans le secteur Iberville et Saint-Luc?", answer: "Oui, nous couvrons l'ensemble de Saint-Jean-sur-Richelieu incluant le Vieux-Saint-Jean, Iberville, Saint-Luc, L'Acadie et le secteur du Fort. Nous sommes à seulement 35 minutes de route." },
      { question: "Pouvez-vous réparer des fenêtres en bois gonflées par l'humidité?", answer: "Oui, c'est un problème fréquent à Saint-Jean-sur-Richelieu. Nous pouvons raboter et ajuster les cadres gonflés, remplacer les pièces de quincaillerie corrodées et appliquer des traitements pour prévenir la récidive." },
    ],
  },
  {
    slug: "chambly",
    name: "Chambly",
    region: "Montérégie",
    distance: "25 min",
    population: "31 000 habitants",
    description:
      "Chambly est reconnue pour son patrimoine historique exceptionnel autour du Fort Chambly et du bassin de Chambly. Le Vieux-Chambly abrite des maisons de pierre et de bois datant du 18e et 19e siècle qui requièrent des réparations spécialisées respectant le cachet patrimonial. Les secteurs résidentiels plus récents le long du boulevard Fréchette présentent des besoins plus classiques de remplacement de thermos.",
    neighborhoods: ["Vieux-Chambly", "Secteur du Fort", "Boulevard Fréchette", "Domaine des Patriotes", "De Salaberry"],
    commonIssues: [
      "Restauration délicate de fenêtres patrimoniales dans les maisons historiques du Vieux-Chambly",
      "Humidité du bassin de Chambly causant la dégradation prématurée des cadres en bois",
      "Thermos standards en fin de vie dans les développements résidentiels des années 90",
    ],
    faq: [
      { question: "Combien coûte la réparation de fenêtres à Chambly?", answer: "Les prix varient selon le type de travaux. Un thermos standard coûte entre 150$ et 300$. Pour la restauration de fenêtres patrimoniales du Vieux-Chambly, les coûts se situent entre 350$ et 800$ selon la complexité et le respect du cachet historique." },
      { question: "Respectez-vous les normes patrimoniales du Vieux-Chambly?", answer: "Oui, nous avons l'expérience de travailler sur des bâtiments patrimoniaux. Nous utilisons des techniques de restauration qui préservent l'apparence d'origine tout en intégrant des thermos modernes pour améliorer l'efficacité énergétique." },
      { question: "L'humidité du bassin de Chambly affecte-t-elle mes fenêtres?", answer: "Oui, la proximité du bassin de Chambly et de la rivière Richelieu crée un environnement plus humide qui accélère la dégradation des cadres en bois et des joints d'étanchéité. Nous recommandons un entretien préventif aux 3 à 5 ans pour les propriétés riveraines." },
    ],
  },
  {
    slug: "terrebonne",
    name: "Terrebonne",
    region: "Lanaudière",
    distance: "40 min",
    population: "121 000 habitants",
    description:
      "Terrebonne offre un contraste fascinant entre son Vieux-Terrebonne historique au bord de la rivière des Mille-Îles et les vastes développements résidentiels de Lachenaie et La Plaine qui ont explosé depuis les années 2000. Les maisons patrimoniales du vieux quartier nécessitent des réparations de fenêtres en bois, tandis que les constructions des 15-20 dernières années commencent à montrer les premiers signes d'usure des thermos.",
    neighborhoods: ["Vieux-Terrebonne", "Lachenaie", "La Plaine", "Côte de Terrebonne", "Urbanova"],
    commonIssues: [
      "Fenêtres en bois à restaurer dans les bâtiments historiques du Vieux-Terrebonne",
      "Premiers signes de buée dans les thermos des maisons construites entre 2000 et 2010",
      "Portes-patio mal ajustées dans les constructions rapides des nouveaux développements",
    ],
    faq: [
      { question: "Quel est le coût d'un remplacement de thermos à Terrebonne?", answer: "Un thermos standard à Terrebonne coûte entre 150$ et 350$ installé. Les maisons des développements récents de Lachenaie et La Plaine ont souvent des formats standards qui se situent dans la fourchette économique. Soumission gratuite." },
      { question: "Les maisons neuves de Terrebonne ont-elles déjà besoin de réparations?", answer: "Oui, les constructions des années 2000-2010 commencent à montrer les premiers signes d'usure : buée dans les thermos, portes-patio mal ajustées et quincaillerie défaillante. C'est normal après 15-20 ans et nous intervenons régulièrement dans ces quartiers." },
      { question: "Desservez-vous Lachenaie et La Plaine?", answer: "Oui, nous couvrons tout Terrebonne incluant le Vieux-Terrebonne, Lachenaie, La Plaine, Urbanova et la Côte de Terrebonne. Nous sommes à environ 40 minutes de route et nous nous y déplaçons régulièrement." },
      { question: "Faites-vous la restauration de fenêtres dans le Vieux-Terrebonne?", answer: "Oui, nous avons l'expertise pour restaurer les fenêtres en bois des bâtiments historiques du Vieux-Terrebonne. Nous préservons le cachet patrimonial tout en améliorant l'isolation et le fonctionnement des fenêtres." },
    ],
  },
  {
    slug: "repentigny",
    name: "Repentigny",
    region: "Lanaudière",
    distance: "40 min",
    population: "87 000 habitants",
    description:
      "Repentigny s'étend le long du fleuve Saint-Laurent et de la rivière L'Assomption, avec le secteur Le Gardeur qui constitue un pôle résidentiel important. La ville possède un parc immobilier majoritairement composé de maisons unifamiliales des années 1980-2000. L'exposition aux vents du fleuve et les écarts de température importants entre été et hiver mettent les fenêtres et portes à rude épreuve.",
    neighborhoods: ["Le Gardeur", "Repentigny Centre", "Secteur de la Presqu'île", "Le Domaine", "Les Rives"],
    commonIssues: [
      "Thermos embuées dans les maisons unifamiliales des années 80-90 du secteur Le Gardeur",
      "Infiltrations d'air par les cadres de fenêtres exposés aux vents du fleuve Saint-Laurent",
      "Quincaillerie usée des portes-patio dans les propriétés de 25-35 ans",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Repentigny?", answer: "Les prix se situent entre 150$ et 350$ par thermos pour les formats standards des maisons unifamiliales de Repentigny. Les grandes fenêtres exposées au fleuve peuvent coûter entre 300$ et 500$ selon les dimensions. Soumission gratuite." },
      { question: "Vous déplacez-vous à Repentigny et au secteur Le Gardeur?", answer: "Oui, Repentigny est à environ 40 minutes de nos bureaux et fait partie de notre zone de service régulière. Nous couvrons Repentigny Centre, Le Gardeur, la Presqu'île et tous les quartiers avoisinants." },
      { question: "Les vents du fleuve à Repentigny endommagent-ils les fenêtres?", answer: "Oui, l'exposition aux vents du fleuve Saint-Laurent crée un stress supplémentaire sur les joints d'étanchéité et la quincaillerie des fenêtres. Les maisons riveraines nécessitent souvent un remplacement de thermos plus tôt que la moyenne." },
    ],
  },
  {
    slug: "blainville",
    name: "Blainville",
    region: "Laurentides",
    distance: "45 min",
    population: "61 000 habitants",
    description:
      "Blainville est l'une des villes en plus forte croissance des Laurentides, avec des développements résidentiels de qualité qui se sont multipliés depuis les années 1990. Le parc immobilier est relativement jeune, mais les premières générations de maisons (1990-2005) atteignent maintenant l'âge critique où les vitres thermos perdent leur étanchéité. Les constructions récentes du secteur Fontainebleau et des Domaines nécessitent surtout de l'entretien préventif.",
    neighborhoods: ["Fontainebleau", "Les Domaines", "Blainville-sur-le-Lac", "Vieux Blainville", "Chambéry"],
    commonIssues: [
      "Vitres thermos atteignant leur fin de vie utile dans les maisons construites entre 1990 et 2005",
      "Ajustement de quincaillerie neuve défaillante dans les constructions récentes",
      "Moustiquaires endommagées par les tempêtes fréquentes du piémont laurentien",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des vitres thermos à Blainville?", answer: "Un thermos standard à Blainville coûte entre 150$ et 350$. Les maisons construites entre 1990 et 2005, très courantes dans les secteurs Fontainebleau et Les Domaines, ont souvent des formats standards qui permettent des remplacements économiques." },
      { question: "Desservez-vous Blainville dans les Laurentides?", answer: "Oui, Blainville fait partie de notre zone de service régulière. Nous sommes à environ 45 minutes et nous regroupons régulièrement nos interventions dans le secteur des Basses-Laurentides pour un service efficace." },
      { question: "Les maisons des années 90 à Blainville ont-elles besoin de remplacements de thermos?", answer: "Oui, c'est le moment critique. Les thermos installés entre 1990 et 2005 atteignent maintenant 20 à 35 ans, soit la fin de leur durée de vie utile. Si vous remarquez de la buée entre les vitres, c'est le signe que le scellant a cédé et que le remplacement est nécessaire." },
      { question: "Offrez-vous une garantie sur vos travaux à Blainville?", answer: "Oui, tous nos remplacements de thermos sont couverts par une service professionnel garanti, peu importe votre localisation. Cette garantie couvre les défauts de fabrication et d'installation." },
    ],
  },
  {
    slug: "chateauguay",
    name: "Châteauguay",
    region: "Montérégie",
    distance: "30 min",
    population: "52 000 habitants",
    description:
      "Située au confluent de la rivière Châteauguay et du fleuve Saint-Laurent, Châteauguay est particulièrement exposée à l'humidité ambiante qui accélère la dégradation des fenêtres et portes. Le parc immobilier, largement composé de bungalows et de split-levels des années 1960-80, présente des besoins importants en remplacement de vitres thermos et en réparation de cadres affectés par l'humidité chronique.",
    neighborhoods: ["Centre-ville", "Châteauguay-Centre", "Secteur Maple Grove", "Léry", "Mercier-Ouest"],
    commonIssues: [
      "Dégradation accélérée des joints et cadres due à l'humidité de la rivière et du fleuve",
      "Thermos embuées dans les bungalows et split-levels des années 60-80",
      "Moisissure autour des cadres de fenêtres causée par la condensation liée à l'humidité ambiante",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Châteauguay?", answer: "Les prix vont de 150$ à 350$ pour un thermos standard. Les bungalows et split-levels des années 60-80, très répandus à Châteauguay, ont souvent des fenêtres de dimensions courantes qui permettent des remplacements à coûts compétitifs." },
      { question: "L'humidité à Châteauguay cause-t-elle de la moisissure autour des fenêtres?", answer: "Oui, la proximité de la rivière Châteauguay et du fleuve Saint-Laurent crée un taux d'humidité élevé qui favorise la condensation sur les fenêtres mal isolées. Le remplacement de thermos défaillants et l'amélioration de l'étanchéité réduisent considérablement ce problème." },
      { question: "Desservez-vous Châteauguay et les environs?", answer: "Oui, Châteauguay est à seulement 30 minutes de nos bureaux. Nous couvrons le centre-ville, le secteur Maple Grove, Léry et Mercier-Ouest. C'est l'un de nos secteurs les plus proches." },
    ],
  },
  {
    slug: "la-prairie",
    name: "La Prairie",
    region: "Montérégie",
    distance: "20 min",
    population: "27 000 habitants",
    description:
      "La Prairie est l'une des plus anciennes villes de la Rive-Sud, avec un vieux village patrimonial fondé en 1667 qui abrite des maisons de pierre et de bois nécessitant des restaurations spécialisées. En contraste, les nouveaux quartiers résidentiels au sud de l'autoroute 30 offrent des constructions modernes. Cette dualité crée des besoins très différents en matière de réparation de portes et fenêtres.",
    neighborhoods: ["Vieux-La-Prairie", "Boisé de La Prairie", "Secteur de l'autoroute 30", "Les Berges", "Le Village"],
    commonIssues: [
      "Restauration de fenêtres patrimoniales dans les maisons historiques du Vieux-La-Prairie",
      "Remplacement de thermos dans les propriétés des années 1980-90 du secteur central",
      "Ajustement de portes-patio neuves dans les développements récents au sud de la 30",
    ],
    faq: [
      { question: "Quel est le prix d'une réparation de fenêtres à La Prairie?", answer: "Un remplacement de thermos standard coûte entre 150$ et 300$. Pour les fenêtres patrimoniales du Vieux-La-Prairie nécessitant des restaurations spécialisées, les prix peuvent aller de 350$ à 700$. Soumission gratuite à domicile." },
      { question: "Restaurez-vous les fenêtres patrimoniales du Vieux-La-Prairie?", answer: "Oui, nous avons l'expertise pour travailler sur les maisons historiques fondées dès 1667. Nous restaurons les fenêtres en bois d'origine, remplaçons les vitres tout en préservant le cachet patrimonial unique de ce quartier historique." },
      { question: "La Prairie est-elle dans votre zone de service?", answer: "Oui, La Prairie est à seulement 20 minutes de nos bureaux, c'est l'un de nos secteurs les plus proches. Nous pouvons souvent offrir des rendez-vous le jour même ou le lendemain pour les résidents de La Prairie." },
      { question: "Faites-vous des ajustements de portes-patio dans les nouvelles constructions de La Prairie?", answer: "Oui, les constructions récentes au sud de l'autoroute 30 nécessitent parfois des ajustements de portes-patio après le tassement initial de la maison. Nous corrigeons l'alignement, remplaçons les roulettes et ajustons la quincaillerie." },
    ],
  },
  {
    slug: "sainte-julie",
    name: "Sainte-Julie",
    region: "Montérégie",
    distance: "25 min",
    population: "34 000 habitants",
    description:
      "Sainte-Julie est une banlieue résidentielle prisée des familles, caractérisée par des quartiers de maisons unifamiliales bien entretenues construites principalement entre 1985 et 2010. Le mont Saint-Bruno à proximité crée un microclimat avec des vents plus soutenus qui sollicitent davantage les fenêtres. Les propriétaires investissent régulièrement dans l'entretien et le remplacement de leurs vitres thermos pour maintenir la valeur de leurs propriétés.",
    neighborhoods: ["Domaine des Hauts-Bois", "Secteur du Moulin", "Le Richelieu", "Les Cèdres", "De Montarville"],
    commonIssues: [
      "Thermos en fin de vie dans les maisons unifamiliales des années 85-2000",
      "Exposition aux vents du mont Saint-Bruno usant prématurément les joints de fenêtres",
      "Moustiquaires à remplacer après 15-20 ans dans les propriétés familiales bien entretenues",
    ],
    faq: [
      { question: "Combien coûte un remplacement de vitre thermos à Sainte-Julie?", answer: "Les prix se situent entre 150$ et 350$ pour un thermos standard. Les maisons unifamiliales des années 85-2000, très courantes à Sainte-Julie, ont souvent des fenêtres de formats standards qui permettent un remplacement rapide et économique." },
      { question: "Les vents du mont Saint-Bruno affectent-ils les fenêtres à Sainte-Julie?", answer: "Oui, le microclimat créé par le mont Saint-Bruno génère des vents plus soutenus qui sollicitent davantage les joints d'étanchéité des fenêtres. Les propriétés exposées au vent nécessitent souvent un remplacement de thermos un peu plus tôt que la moyenne." },
      { question: "Desservez-vous Sainte-Julie?", answer: "Oui, Sainte-Julie est à seulement 25 minutes de nos bureaux. Nous y intervenons fréquemment dans les secteurs du Moulin, Domaine des Hauts-Bois, De Montarville et tous les quartiers résidentiels." },
    ],
  },
  {
    slug: "varennes",
    name: "Varennes",
    region: "Montérégie",
    distance: "25 min",
    population: "23 000 habitants",
    description:
      "Varennes s'étire le long du fleuve Saint-Laurent avec un charme riverain distinctif. La proximité du fleuve et de la zone industrielle pétrochimique à l'est crée des conditions environnementales particulières qui peuvent affecter la durabilité des matériaux de fenêtres. Le parc résidentiel mélange des maisons patrimoniales du vieux village, des bungalows des années 70-80 et des développements plus récents.",
    neighborhoods: ["Vieux-Varennes", "Secteur du Fleuve", "Domaine de la Baronnie", "Le Boisé", "Sainte-Anne"],
    commonIssues: [
      "Corrosion de quincaillerie accélérée par la proximité du fleuve et l'air salin",
      "Thermos embuées dans les bungalows des années 70-80 du secteur résidentiel central",
      "Cadres de fenêtres en bois dégradés dans les maisons patrimoniales du Vieux-Varennes",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Varennes?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les maisons patrimoniales du Vieux-Varennes nécessitant des formats sur mesure ou de la restauration de cadres, les prix peuvent aller jusqu'à 500$ à 700$." },
      { question: "La proximité du fleuve et de la zone industrielle affecte-t-elle les fenêtres à Varennes?", answer: "Oui, l'air salin du fleuve et les conditions environnementales particulières de la zone pétrochimique peuvent accélérer la corrosion de la quincaillerie et la dégradation des joints. Un entretien préventif régulier est recommandé pour les propriétés de Varennes." },
      { question: "Vous déplacez-vous à Varennes pour les réparations de fenêtres?", answer: "Oui, Varennes est à seulement 25 minutes de nos bureaux. Nous couvrons le Vieux-Varennes, le secteur du Fleuve, le Domaine de la Baronnie et tous les quartiers de Varennes sans frais de déplacement supplémentaires." },
    ],
  },
  {
    slug: "delson",
    name: "Delson",
    region: "Montérégie",
    distance: "15 min",
    population: "12 500 habitants",
    description:
      "Delson est une petite communauté à seulement 15 minutes de nos bureaux, ce qui nous permet d'offrir un service particulièrement rapide et flexible. Le parc immobilier est composé principalement de maisons unifamiliales et de jumelés construits entre les années 1970 et 2000. Étant notre voisin le plus proche, les résidents de Delson bénéficient souvent de nos meilleurs délais d'intervention.",
    neighborhoods: ["Centre de Delson", "Secteur des Érables", "Quartier résidentiel Sud", "Près de la gare"],
    commonIssues: [
      "Thermos embuées dans les maisons unifamiliales et jumelés des années 70-90",
      "Portes d'entrée en bois déformées par les cycles gel-dégel répétés",
      "Quincaillerie de fenêtres coulissantes usée dans les propriétés de 25-40 ans",
    ],
    faq: [
      { question: "Combien coûte une réparation de fenêtres à Delson?", answer: "Un thermos standard coûte entre 150$ et 300$. Étant notre secteur le plus proche (15 minutes), les résidents de Delson bénéficient souvent de nos meilleurs délais et d'un service particulièrement flexible pour les soumissions et installations." },
      { question: "Quel est le délai d'intervention à Delson?", answer: "Delson étant à seulement 15 minutes de nos bureaux, nous pouvons souvent offrir des rendez-vous le jour même ou le lendemain. C'est notre secteur le plus rapide à desservir, ce qui nous permet une grande flexibilité d'horaire." },
      { question: "Les maisons des années 70-90 à Delson ont-elles besoin de thermos neuves?", answer: "Très probablement, oui. Les vitres thermos de cette époque ont une durée de vie de 20 à 30 ans. Si vous voyez de la buée entre les vitres, c'est le signe que le scellant a cédé et que le gaz isolant s'est échappé. Le remplacement améliorera votre confort et réduira vos coûts de chauffage." },
      { question: "Réparez-vous les fenêtres coulissantes à Delson?", answer: "Oui, nous remplaçons les mécanismes de fenêtres coulissantes usés : rails, roulettes, poignées et serrures. Nous pouvons redonner un fonctionnement fluide à vos fenêtres sans les remplacer au complet." },
    ],
  },
  {
    slug: "candiac",
    name: "Candiac",
    region: "Montérégie",
    distance: "20 min",
    population: "24 000 habitants",
    description:
      "Candiac est une ville planifiée fondée en 1957, reconnaissable à son plan d'urbanisme en forme de feuille d'érable. L'uniformité architecturale des quartiers d'origine signifie que de nombreuses maisons ont des fenêtres de même type et du même âge, entraînant des vagues de remplacements simultanés. Les secteurs plus récents près du boulevard Montcalm présentent des constructions modernes avec des besoins différents.",
    neighborhoods: ["Quartier de la Feuille d'érable", "Secteur Montcalm Nord", "Secteur Montcalm Sud", "Les Prairies", "Candiac Centre"],
    commonIssues: [
      "Vagues de remplacements de thermos dans les maisons d'époque au plan uniforme des années 60-70",
      "Fenêtres coulissantes d'origine à mécanismes obsolètes difficiles à réparer",
      "Portes-patio standard de même modèle nécessitant des pièces de quincaillerie identiques en série",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Candiac?", answer: "Un thermos standard coûte entre 150$ et 300$. L'avantage à Candiac est que les maisons du quartier de la Feuille d'érable ont souvent des fenêtres de mêmes dimensions, ce qui peut permettre des tarifs de volume si vous remplacez plusieurs thermos en même temps." },
      { question: "Les maisons de même époque à Candiac peuvent-elles bénéficier de tarifs de groupe?", answer: "Oui, puisque Candiac est une ville planifiée avec des maisons de même type et âge, nous proposons régulièrement des tarifs préférentiels pour les voisins qui regroupent leurs travaux. Contactez-nous pour organiser des soumissions de groupe dans votre quartier." },
      { question: "Trouvez-vous des pièces de quincaillerie pour les fenêtres d'origine de Candiac?", answer: "Oui, nous avons un large inventaire de pièces de remplacement compatibles avec les fenêtres et portes-patio d'époque installées dans les maisons des années 60-70 de Candiac. Si la pièce exacte n'est plus fabriquée, nous trouvons un équivalent compatible." },
      { question: "Desservez-vous le secteur Montcalm de Candiac?", answer: "Oui, nous couvrons tout Candiac incluant le quartier de la Feuille d'érable, les secteurs Montcalm Nord et Sud, Les Prairies et Candiac Centre. Nous sommes à seulement 20 minutes de route." },
    ],
  },
  {
    slug: "saint-bruno",
    name: "Saint-Bruno-de-Montarville",
    region: "Montérégie",
    distance: "20 min",
    population: "28 000 habitants",
    description:
      "Saint-Bruno-de-Montarville est un secteur huppé au pied du mont Saint-Bruno, reconnu pour ses propriétés haut de gamme entourées de verdure. Les maisons y sont souvent plus grandes avec de vastes surfaces vitrées et des portes-patio de qualité supérieure. Les propriétaires exigeants recherchent des réparations soignées qui respectent le cachet de leurs résidences et maintiennent l'efficacité énergétique de leurs fenêtres surdimensionnées.",
    neighborhoods: ["Vieux-Saint-Bruno", "Domaine du Mont-Bruno", "Les Promenades Saint-Bruno", "Carignan-Limite", "Lac du Village"],
    commonIssues: [
      "Remplacement de thermos surdimensionnées sur les grandes baies vitrées des propriétés haut de gamme",
      "Quincaillerie haut de gamme usée sur les portes-patio de grande taille",
      "Fenêtres en bois noble à restaurer dans les maisons de prestige du Vieux-Saint-Bruno",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Saint-Bruno-de-Montarville?", answer: "Les prix varient de 175$ à 500$ selon les dimensions. Les propriétés haut de gamme de Saint-Bruno ont souvent des fenêtres surdimensionnées et des baies vitrées qui nécessitent des thermos plus grands, ce qui augmente légèrement le coût par rapport aux formats standards." },
      { question: "Réparez-vous les grandes baies vitrées des maisons haut de gamme de Saint-Bruno?", answer: "Oui, nous sommes spécialisés dans le remplacement de thermos surdimensionnés pour les grandes baies vitrées. Nous utilisons des techniques de manipulation adaptées aux grands formats et des thermos à haut rendement (low-E, argon) pour maintenir l'efficacité énergétique." },
      { question: "Restaurez-vous les fenêtres en bois noble du Vieux-Saint-Bruno?", answer: "Oui, nous avons l'expertise pour restaurer les fenêtres en bois noble (chêne, érable, acajou) des maisons de prestige. Nous préservons le bois d'origine, remplaçons uniquement le thermos et restaurons les mécanismes pour maintenir le cachet de votre propriété." },
      { question: "Saint-Bruno est-il dans votre zone de service?", answer: "Oui, Saint-Bruno-de-Montarville est à seulement 20 minutes de nos bureaux. C'est l'un de nos secteurs les plus proches et nous y intervenons très régulièrement." },
    ],
  },
  {
    slug: "mascouche",
    name: "Mascouche",
    region: "Lanaudière",
    distance: "45 min",
    population: "53 000 habitants",
    description:
      "Mascouche a connu une croissance résidentielle fulgurante depuis les années 2000, avec de vastes développements comme le Domaine des Côteaux et le secteur Le Village. La ville est passée de 30 000 à plus de 50 000 habitants en deux décennies. Les constructions neuves dominent le paysage, mais les premières générations de maisons (2000-2010) montrent déjà les premiers signes d'usure des composantes de fenêtres et portes.",
    neighborhoods: ["Le Village", "Domaine des Côteaux", "Mascouche-Centre", "Secteur de l'Arena", "Les Jardins"],
    commonIssues: [
      "Premiers remplacements de thermos dans les maisons construites entre 2000 et 2010",
      "Défauts de quincaillerie d'origine dans les constructions de volume à prix compétitif",
      "Portes-patio à ajuster dans les nouvelles constructions avec tassement de fondation récent",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Mascouche?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons construites entre 2000 et 2010, très courantes à Mascouche, ont souvent des formats standards qui facilitent un remplacement rapide et économique." },
      { question: "Les maisons neuves de Mascouche ont-elles déjà besoin de réparations de fenêtres?", answer: "Oui, les premières vagues de constructions (2000-2010) atteignent maintenant 15 à 25 ans. Les thermos commencent à montrer de la buée et la quincaillerie d'origine, parfois d'entrée de gamme dans les constructions de volume, peut nécessiter des remplacements." },
      { question: "Desservez-vous Mascouche dans Lanaudière?", answer: "Oui, Mascouche fait partie de notre zone de service régulière. Nous sommes à environ 45 minutes et nous regroupons nos interventions dans le secteur Lanaudière (Mascouche, Terrebonne, Repentigny) pour un service efficace." },
      { question: "Les portes-patio peuvent-elles se désaligner à cause du tassement de fondation?", answer: "Oui, c'est un problème courant dans les constructions récentes de Mascouche. Le tassement des fondations durant les premières années peut causer un désalignement des portes-patio. Nous ajustons les roulettes, les rails et les cadres pour retrouver un fonctionnement fluide." },
    ],
  },
];

export function getCity(slug) {
  return CITIES.find((c) => c.slug === slug) || null;
}
