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
  {
    slug: "vaudreuil-dorion",
    name: "Vaudreuil-Dorion",
    region: "Vaudreuil-Soulanges",
    distance: "40 min",
    population: "55 000 habitants",
    description:
      "Vaudreuil-Dorion est la ville-centre de la MRC de Vaudreuil-Soulanges, située au confluent de la rivière des Outaouais et du fleuve Saint-Laurent. Le Vieux-Vaudreuil recèle un patrimoine bâti riche avec des maisons ancestrales le long du chemin de l'Anse, tandis que les secteurs Dorion et Valois ont connu un développement résidentiel massif depuis les années 2000. L'humidité ambiante liée à la proximité des cours d'eau accélère la dégradation des fenêtres et portes.",
    neighborhoods: ["Vieux-Vaudreuil", "Dorion", "Valois", "Secteur de la Gare", "Domaine Cavagnal"],
    commonIssues: [
      "Dégradation accélérée des joints et cadres de fenêtres causée par l'humidité du fleuve et de la rivière des Outaouais",
      "Thermos embuées dans les développements du secteur Valois et le long du boulevard de la Cité-des-Jeunes construits entre 2000 et 2010",
      "Fenêtres patrimoniales à restaurer dans les maisons ancestrales du Vieux-Vaudreuil",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Vaudreuil-Dorion?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons riveraines du Vieux-Vaudreuil peuvent nécessiter des formats sur mesure à coûts légèrement supérieurs. Soumission gratuite à domicile dans tout Vaudreuil-Dorion." },
      { question: "Les maisons ancestrales du chemin de l'Anse à Vaudreuil peuvent-elles recevoir des thermos modernes?", answer: "Oui, nous adaptons des vitres thermos modernes aux cadres de fenêtres anciennes des maisons du chemin de l'Anse dans le Vieux-Vaudreuil. Nous préservons les moulures et le cachet patrimonial tout en améliorant significativement l'isolation thermique et acoustique." },
      { question: "L'humidité du fleuve affecte-t-elle les fenêtres à Vaudreuil-Dorion?", answer: "Oui, la proximité du fleuve Saint-Laurent et de la rivière des Outaouais crée un taux d'humidité élevé qui accélère la corrosion de la quincaillerie et la dégradation des joints d'étanchéité. Nous recommandons un entretien préventif régulier pour les propriétés riveraines." },
    ],
  },
  {
    slug: "valleyfield",
    name: "Salaberry-de-Valleyfield",
    region: "Vaudreuil-Soulanges",
    distance: "55 min",
    population: "42 000 habitants",
    description:
      "Salaberry-de-Valleyfield est une ville historique industrielle bordée par le lac Saint-François et le canal de Beauharnois. Le centre-ville et le secteur de la Grande-Île abritent un patrimoine bâti ouvrier des années 1920-1960 avec de nombreuses maisons aux fenêtres vieillissantes. Les quartiers résidentiels plus récents le long du boulevard Monseigneur-Langlois combinent bungalows et maisons de ville des années 1980-2000.",
    neighborhoods: ["Centre-ville", "Grande-Île", "Boulevard Monseigneur-Langlois", "Secteur du Lac", "Parc Delpha-Sauvé"],
    commonIssues: [
      "Fenêtres à battant d'origine avec contre-fenêtres en bois dans les maisons ouvrières de la rue Victoria et du secteur Grande-Île",
      "Infiltrations d'air et condensation excessive dans les bungalows des années 80 près du lac Saint-François",
      "Quincaillerie corrodée par l'humidité du lac et du canal de Beauharnois",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Salaberry-de-Valleyfield?", answer: "Un thermos standard coûte entre 125$ et 300$ installé. Les maisons ouvrières du centre-ville avec des fenêtres de petit format permettent souvent des remplacements économiques. Pour les adaptations sur mesure des formats anciens, comptez entre 275$ et 450$. Soumission gratuite dans tout Valleyfield." },
      { question: "Les maisons ouvrières du centre-ville de Valleyfield valent-elles la peine d'être réparées?", answer: "Absolument. Les maisons ouvrières des années 1920-1960 du centre-ville et de la Grande-Île ont des cadres souvent encore en bon état structurel. Le remplacement des thermos et la réparation de quincaillerie coûtent une fraction du prix d'un remplacement complet de fenêtres, tout en redonnant confort et efficacité énergétique à ces propriétés au cachet unique." },
      { question: "Les maisons près du lac Saint-François ont-elles plus de problèmes de fenêtres?", answer: "Oui, l'humidité élevée du lac Saint-François accélère la dégradation des joints, la corrosion de la quincaillerie et la formation de buée dans les thermos. Un entretien préventif et des produits résistants à l'humidité sont recommandés pour ces propriétés." },
    ],
  },
  {
    slug: "ile-perrot",
    name: "Île-Perrot",
    region: "Vaudreuil-Soulanges",
    distance: "35 min",
    population: "11 000 habitants",
    description:
      "Île-Perrot est une municipalité insulaire située entre le lac des Deux-Montagnes et le lac Saint-Louis, offrant un cadre de vie riverain prisé. Le parc immobilier est majoritairement composé de bungalows et maisons unifamiliales des années 1970-1990, avec quelques développements récents. L'exposition aux vents du large et l'humidité lacustre imposent des contraintes particulières sur les fenêtres et portes.",
    neighborhoods: ["Pointe du Domaine", "Secteur du Golf", "Boulevard Perrot", "Windcrest", "Baie Brazeau"],
    commonIssues: [
      "Thermos embuées dans les bungalows du secteur Windcrest et du boulevard Perrot construits dans les années 70-90",
      "Infiltrations d'air causées par les vents dominants sur les fenêtres côté lac",
      "Cadres de fenêtres endommagés par les cycles gel-dégel amplifiés par l'environnement insulaire",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Île-Perrot?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les fenêtres exposées aux vents du lac, nous recommandons des thermos à triple vitrage pour une meilleure isolation, ce qui peut augmenter le coût à 400$-500$." },
      { question: "Les vents du lac affectent-ils les fenêtres à Île-Perrot?", answer: "Oui, l'exposition aux vents dominants du lac des Deux-Montagnes et du lac Saint-Louis exerce une pression supplémentaire sur les joints et la quincaillerie. Les fenêtres côté lac se détériorent généralement plus vite et nécessitent un entretien plus fréquent." },
      { question: "Les propriétés riveraines d'Île-Perrot nécessitent-elles des fenêtres spéciales?", answer: "Les maisons du boulevard Perrot et de la Pointe du Domaine, directement exposées aux vents du lac, bénéficient grandement de thermos à haut rendement (low-E avec argon ou triple vitrage). L'investissement supplémentaire se rentabilise rapidement en économies de chauffage vu l'exposition aux éléments." },
    ],
  },
  {
    slug: "pincourt",
    name: "Pincourt",
    region: "Vaudreuil-Soulanges",
    distance: "35 min",
    population: "15 000 habitants",
    description:
      "Pincourt est une ville résidentielle paisible située sur l'île Perrot, bordée par le lac des Deux-Montagnes. La majorité des propriétés ont été construites entre 1975 et 2005, créant un parc immobilier homogène de maisons unifamiliales et de jumelés. Les résidents font face aux défis typiques des constructions de cette époque : thermos en fin de vie, quincaillerie usée et joints détériorés.",
    neighborhoods: ["Pincourt-Centre", "Secteur du Parc Olympique", "Boisé de Pincourt", "Cardinal-Léger", "Pointe à Brunet"],
    commonIssues: [
      "Thermos en fin de vie dans les maisons du secteur Cardinal-Léger et de la Pointe à Brunet construites entre 1975 et 1995",
      "Quincaillerie de fenêtres à manivelle grippée dans les constructions des années 80-90",
      "Portes d'entrée mal isolées causant des pertes de chaleur dans les propriétés de 30-40 ans",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Pincourt?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons de Pincourt ont généralement des formats de fenêtres standards, ce qui facilite un remplacement rapide et économique." },
      { question: "Les fenêtres à manivelle de Pincourt peuvent-elles être réparées?", answer: "Oui, nous réparons couramment les fenêtres à manivelle (à auvent ou à battant) des maisons des années 80-90. Le remplacement du mécanisme de manivelle, des charnières et des joints redonne une fonctionnalité complète sans avoir à changer la fenêtre entière." },
      { question: "Pourquoi tant de maisons à Pincourt ont-elles des fenêtres à manivelle problématiques?", answer: "Les constructions des années 1980-1995 à Pincourt utilisaient massivement des fenêtres à manivelle (à auvent ou à battant) dont les mécanismes d'ouverture ont une durée de vie de 20 à 30 ans. Le remplacement du mécanisme et des joints est beaucoup plus économique que de changer la fenêtre entière — comptez entre 75$ et 150$ par fenêtre pour la quincaillerie." },
    ],
  },
  {
    slug: "notre-dame-ile-perrot",
    name: "Notre-Dame-de-l'Île-Perrot",
    region: "Vaudreuil-Soulanges",
    distance: "35 min",
    population: "12 000 habitants",
    description:
      "Notre-Dame-de-l'Île-Perrot est une municipalité résidentielle familiale sur l'île Perrot, reconnue pour ses rues boisées et son ambiance villageoise. Le parc immobilier se compose principalement de maisons unifamiliales construites entre 1985 et 2010, avec un mélange de bungalows et de maisons à étages. La proximité des lacs des Deux-Montagnes et Saint-Louis influence l'entretien des fenêtres et portes.",
    neighborhoods: ["Secteur du Village", "Domaine de l'Île", "Boulevard Don-Quichotte", "Parc-Nature", "Pointe du Moulin"],
    commonIssues: [
      "Thermos embuées dans les maisons familiales du boulevard Don-Quichotte et du Domaine de l'Île construites entre 1985 et 2000",
      "Moustiquaires endommagées sur les grandes fenêtres des propriétés familiales",
      "Joints d'étanchéité détériorés par les variations climatiques liées à l'environnement lacustre",
    ],
    faq: [
      { question: "Combien coûte la réparation de fenêtres à Notre-Dame-de-l'Île-Perrot?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons familiales typiques de Notre-Dame ont des formats de fenêtres courants qui permettent un remplacement efficace et abordable." },
      { question: "Réparez-vous les moustiquaires à Notre-Dame-de-l'Île-Perrot?", answer: "Oui, le remplacement et la réparation de moustiquaires font partie de nos services. Nous réparons les cadres, remplaçons les toiles et ajustons les systèmes de fixation pour toutes les tailles de fenêtres." },
      { question: "Les fenêtres des maisons près du parc historique de la Pointe-du-Moulin nécessitent-elles un entretien particulier?", answer: "Oui, les propriétés du secteur Pointe du Moulin et du boulevard Don-Quichotte côté lac sont particulièrement exposées aux vents lacustres. L'humidité du lac des Deux-Montagnes accélère l'usure des joints et de la quincaillerie. Nous recommandons une inspection aux 3-5 ans pour ces propriétés riveraines." },
    ],
  },
  {
    slug: "saint-lazare",
    name: "Saint-Lazare",
    region: "Vaudreuil-Soulanges",
    distance: "40 min",
    population: "22 000 habitants",
    description:
      "Saint-Lazare est une municipalité à caractère semi-rural reconnue pour ses grands terrains boisés et sa communauté équestre. Les propriétés sont majoritairement de grandes maisons unifamiliales construites entre 1990 et 2015 sur des terrains spacieux. Les constructions de cette période commencent à nécessiter leurs premiers remplacements de thermos et ajustements de quincaillerie.",
    neighborhoods: ["Secteur des Forêts", "Domaine des Cèdres", "Chanterel", "Saddlebrook", "Les Roulottes"],
    commonIssues: [
      "Premiers remplacements de thermos dans les maisons du secteur Chanterel et Saddlebrook construites entre 1995 et 2010",
      "Fenêtres surdimensionnées difficiles à entretenir dans les grandes propriétés",
      "Portes-patio à ajuster dans les maisons de 15-25 ans avec léger tassement de sol",
    ],
    faq: [
      { question: "Quel est le coût pour remplacer des thermos à Saint-Lazare?", answer: "Un thermos standard coûte entre 175$ et 400$ installé. Les grandes propriétés de Saint-Lazare ont souvent des fenêtres surdimensionnées et des baies vitrées panoramiques qui nécessitent des thermos plus grands, pouvant aller de 450$ à 650$. Le coût moyen par maison est plus élevé qu'en banlieue dense vu la taille des propriétés." },
      { question: "Pouvez-vous intervenir sur les grandes fenêtres des propriétés de Saint-Lazare?", answer: "Oui, nous avons l'expérience des fenêtres surdimensionnées typiques des grandes propriétés de Saint-Lazare. Nous utilisons des équipements adaptés pour la manipulation sécuritaire des grands formats de thermos." },
      { question: "Les grandes propriétés équestres de Saint-Lazare ont-elles des besoins particuliers en fenêtres?", answer: "Oui, les propriétés du secteur Saddlebrook et des Forêts sont souvent de grandes maisons avec des fenêtres surdimensionnées et des baies vitrées panoramiques donnant sur les terrains boisés. Ces grands formats nécessitent des thermos sur mesure et une manipulation spécialisée, mais le remplacement reste bien plus économique qu'un changement complet de fenêtres." },
    ],
  },
  {
    slug: "beauharnois",
    name: "Beauharnois",
    region: "Vaudreuil-Soulanges",
    distance: "35 min",
    population: "14 000 habitants",
    description:
      "Beauharnois est une ville historique industrielle située le long du canal de Beauharnois et du lac Saint-Louis. Le centre-ville conserve un patrimoine bâti ouvrier des années 1930-1960 avec de nombreuses maisons à rénover. Les secteurs plus récents comme Maple Grove offrent des constructions résidentielles des années 1980-2000. La proximité du canal crée un environnement humide qui accélère la détérioration des composantes de fenêtres.",
    neighborhoods: ["Centre-ville", "Maple Grove", "Secteur du Canal", "Melocheville", "Saint-Étienne-de-Beauharnois"],
    commonIssues: [
      "Fenêtres à guillotine et à battant d'origine dans les maisons ouvrières construites pour les travailleurs de la centrale de Beauharnois dans les années 1930-1960",
      "Quincaillerie corrodée par l'humidité du canal de Beauharnois",
      "Thermos embuées dans les constructions résidentielles des années 80-90 de Maple Grove",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Beauharnois?", answer: "Un thermos standard coûte entre 125$ et 300$ installé. Les maisons ouvrières du centre-ville ont souvent des fenêtres de petit format qui permettent des remplacements économiques. Pour les formats non standards des bâtiments plus anciens, comptez entre 275$ et 475$." },
      { question: "L'humidité du canal de Beauharnois affecte-t-elle les fenêtres?", answer: "Oui, la proximité du canal et du lac Saint-Louis crée un taux d'humidité élevé qui accélère la corrosion de la quincaillerie, la dégradation des joints et la formation de buée dans les thermos. Un entretien préventif régulier est fortement recommandé." },
      { question: "Peut-on moderniser les fenêtres des maisons ouvrières de Beauharnois sans perdre leur cachet?", answer: "Oui, les maisons ouvrières des années 1930-1960 du centre-ville de Beauharnois, construites à l'époque de la centrale hydroélectrique, ont souvent des cadres de fenêtres encore solides. Nous remplaçons uniquement les thermos et la quincaillerie usée, conservant le cadre d'origine et le caractère architectural de ces maisons à un coût bien inférieur au remplacement complet." },
    ],
  },
  {
    slug: "saint-jerome",
    name: "Saint-Jérôme",
    region: "Laurentides",
    distance: "50 min",
    population: "80 000 habitants",
    description:
      "Saint-Jérôme, la Porte du Nord, est le pôle urbain principal des Laurentides avec un riche patrimoine bâti. Le centre-ville autour de la cathédrale et de la rivière du Nord abrite des bâtiments commerciaux et résidentiels du début du 20e siècle. Les secteurs Bellefeuille et Lafontaine ont connu une forte croissance résidentielle avec des maisons des années 1980 à aujourd'hui. La rigueur des hivers laurentiens impose des contraintes importantes sur les fenêtres.",
    neighborhoods: ["Centre-ville", "Bellefeuille", "Lafontaine", "Secteur de la Gare", "Parc Labelle"],
    commonIssues: [
      "Thermos embuées dans les bungalows le long du boulevard de La Salette à Bellefeuille et de la rue Melançon à Lafontaine, construits dans les années 80-90",
      "Infiltrations d'air et condensation excessive durant les hivers rigoureux des Laurentides",
      "Fenêtres à restaurer dans les bâtiments patrimoniaux du centre-ville historique",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Saint-Jérôme?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés du centre-ville historique nécessitant des formats sur mesure, les prix peuvent atteindre 400$ à 550$. Soumission gratuite à domicile." },
      { question: "Pourquoi les bungalows de Bellefeuille et Lafontaine ont-ils autant de problèmes de thermos?", answer: "Les secteurs Bellefeuille et Lafontaine ont connu un boom de construction dans les années 1980-1995, avec des thermos de première et deuxième génération dont la durée de vie est maintenant atteinte. De plus, les hivers plus rigoureux des Laurentides (2 à 4 degrés de moins qu'à Montréal) imposent un stress thermique supérieur qui accélère la perte d'étanchéité du scellant." },
      { question: "Les hivers des Laurentides causent-ils plus de dommages aux fenêtres?", answer: "Oui, les températures plus froides des Laurentides accentuent les cycles de gel-dégel et la condensation, ce qui accélère la dégradation des thermos et des joints d'étanchéité. Des thermos à haut rendement avec gaz argon sont particulièrement recommandés dans cette région." },
    ],
  },
  {
    slug: "mirabel",
    name: "Mirabel",
    region: "Laurentides",
    distance: "45 min",
    population: "63 000 habitants",
    description:
      "Mirabel est une vaste municipalité des Laurentides qui a connu une explosion démographique depuis les années 2000, passant de 25 000 à plus de 60 000 habitants. Les secteurs comme le Domaine Vert Nord, Saint-Augustin et Saint-Janvier abritent de vastes développements de maisons neuves et semi-neuves. Les premières vagues de constructions (2000-2012) montrent maintenant leurs premiers signes d'usure de thermos et de quincaillerie.",
    neighborhoods: ["Domaine Vert Nord", "Saint-Janvier", "Saint-Augustin", "Domaine Vert Sud", "Secteur de la 15"],
    commonIssues: [
      "Premiers remplacements de thermos dans les développements du Domaine Vert Nord et de Saint-Janvier construits entre 2000 et 2012",
      "Poignées cassées et mécanismes de verrouillage défaillants sur les fenêtres d'entrée de gamme des constructions de série",
      "Portes-patio désalignées par le tassement de fondation dans les sols argileux typiques du secteur de la 15",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Mirabel?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons récentes de Mirabel ont généralement des formats standards qui permettent un remplacement rapide et économique." },
      { question: "Les maisons neuves de Mirabel ont-elles déjà besoin de réparations?", answer: "Oui, les premières vagues de constructions (2000-2012) atteignent 14 à 26 ans. Les thermos commencent à montrer de la buée et la quincaillerie d'entrée de gamme, courante dans les constructions de volume, peut nécessiter des remplacements." },
      { question: "Pourquoi la quincaillerie des maisons neuves de Mirabel s'use-t-elle si vite?", answer: "La croissance rapide de Mirabel a attiré beaucoup de constructeurs de volume (maisons de série) qui utilisaient parfois de la quincaillerie d'entrée de gamme pour réduire les coûts. Les poignées, mécanismes de verrouillage et charnières de ces fenêtres montrent des signes d'usure après seulement 10-15 ans. Nous remplaçons ces composantes par des pièces de qualité supérieure pour une durabilité accrue." },
    ],
  },
  {
    slug: "boisbriand",
    name: "Boisbriand",
    region: "Laurentides",
    distance: "40 min",
    population: "27 000 habitants",
    description:
      "Boisbriand est une ville résidentielle des Laurentides connue pour son parc immobilier diversifié, allant des bungalows des années 1970 dans le secteur du Faubourg Boisbriand aux développements récents près de l'autoroute 15. La ville abrite aussi l'ancien site de l'usine GM, maintenant reconverti en quartier résidentiel. Les propriétaires des maisons plus anciennes font face à des remplacements massifs de thermos en fin de vie.",
    neighborhoods: ["Faubourg Boisbriand", "Secteur de la 640", "Place de la Gare", "Domaine des Mille-Îles", "Boisé de la Rivière"],
    commonIssues: [
      "Thermos en fin de vie dans les bungalows du Faubourg Boisbriand et du Domaine des Mille-Îles, construits lors du boom résidentiel des années 70-80",
      "Portes-patio à roulettes usées dans les propriétés de 30-40 ans",
      "Fenêtres à manivelle grippées nécessitant un remplacement de mécanisme",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Boisbriand?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les bungalows typiques de Boisbriand ont généralement des fenêtres de formats standards, ce qui permet un remplacement efficace et abordable." },
      { question: "Réparez-vous les portes-patio à Boisbriand?", answer: "Oui, la réparation de portes-patio est l'un de nos services les plus demandés. Nous remplaçons les roulettes, poignées, serrures et rails usés pour redonner un fonctionnement fluide à votre porte-patio." },
      { question: "Les bungalows du Faubourg Boisbriand nécessitent-ils tous un remplacement de thermos?", answer: "Le Faubourg Boisbriand, développé principalement dans les années 1970-1985, abrite des bungalows dont les thermos d'origine ont largement dépassé leur durée de vie utile de 20-30 ans. Si vous voyez de la buée entre les vitres, le scellant a cédé et le gaz isolant s'est échappé. Nous remplaçons souvent 5 à 12 thermos par maison dans ce secteur, avec des économies de chauffage immédiates." },
    ],
  },
  {
    slug: "sainte-therese",
    name: "Sainte-Thérèse",
    region: "Laurentides",
    distance: "40 min",
    population: "27 000 habitants",
    description:
      "Sainte-Thérèse est une ville dynamique des Laurentides avec un centre-ville animé et un patrimoine bâti varié. Le Vieux-Sainte-Thérèse possède des maisons de caractère du début du 20e siècle, tandis que les secteurs résidentiels des années 1960-1980 forment le cœur du parc immobilier. La ville est aussi reconnue pour son cégep et ses commerces de la rue Turgeon, autour desquels gravitent des propriétés locatives nécessitant un entretien régulier des fenêtres.",
    neighborhoods: ["Vieux-Sainte-Thérèse", "Rue Turgeon", "Secteur du Cégep", "Ducharme", "Parc Richelieu"],
    commonIssues: [
      "Thermos embuées dans les maisons des rues Ducharme, Blainville et du secteur du Cégep, construites dans les années 60-80",
      "Fenêtres en bois à restaurer dans les maisons de caractère du Vieux-Sainte-Thérèse le long de la rue Blainville Est",
      "Quincaillerie usée et serrures défaillantes sur les fenêtres des immeubles locatifs de la rue Turgeon et du secteur du Cégep",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Sainte-Thérèse?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les propriétés plus anciennes du Vieux-Sainte-Thérèse peuvent nécessiter des formats sur mesure à coûts légèrement supérieurs." },
      { question: "Réparez-vous les fenêtres des immeubles locatifs à Sainte-Thérèse?", answer: "Oui, nous offrons des services adaptés aux propriétaires d'immeubles locatifs : remplacement de thermos en lot, réparation de quincaillerie et entretien préventif. Des tarifs avantageux sont disponibles pour les projets multi-unités." },
      { question: "Y a-t-il beaucoup de fenêtres à remplacer dans le secteur de la rue Turgeon?", answer: "Le secteur commercial de la rue Turgeon et les rues résidentielles adjacentes abritent de nombreux immeubles locatifs et propriétés des années 1950-1970 dont les fenêtres sont en fin de vie. Les propriétaires-bailleurs y font régulièrement appel à nos services pour des remplacements de thermos en lot, ce qui permet des tarifs avantageux par unité." },
    ],
  },
  {
    slug: "rosemere",
    name: "Rosemère",
    region: "Laurentides",
    distance: "40 min",
    population: "15 000 habitants",
    description:
      "Rosemère est une municipalité résidentielle cossue des Laurentides, bordée par la rivière des Mille-Îles. La ville est reconnue pour ses rues boisées, ses grands terrains et ses propriétés haut de gamme. Le parc immobilier comprend des maisons des années 1960-1970 dans le secteur du Grand-Moulin et des propriétés de prestige le long de la rivière. Les propriétaires investissent généralement dans des réparations de qualité pour maintenir la valeur de leurs propriétés.",
    neighborhoods: ["Grand-Moulin", "Secteur Rivière", "Manoir des Trembles", "Tylee", "Sainte-Françoise"],
    commonIssues: [
      "Thermos surdimensionnées à remplacer dans les propriétés de prestige du secteur Grand-Moulin et le long de la rivière des Mille-Îles",
      "Fenêtres en bois noble à restaurer dans les maisons de prestige des années 60-70",
      "Portes-patio de grande taille nécessitant un ajustement de quincaillerie spécialisée",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Rosemère?", answer: "Les prix varient de 200$ à 550$ selon les dimensions. Les propriétés cossues de Rosemère ont souvent des fenêtres surdimensionnées et des baies vitrées panoramiques donnant sur la rivière des Mille-Îles. Pour les fenêtres en bois noble, prévoyez un budget supérieur pour une restauration qui respecte le prestige de la propriété." },
      { question: "Restaurez-vous les fenêtres en bois des maisons de prestige de Rosemère?", answer: "Oui, nous avons l'expertise pour restaurer les fenêtres en bois noble des propriétés de prestige. Nous préservons le bois d'origine, remplaçons le thermos et restaurons les mécanismes pour maintenir le cachet de votre maison." },
      { question: "Les maisons riveraines de la rivière des Mille-Îles à Rosemère ont-elles des problèmes particuliers?", answer: "Oui, les propriétés du secteur Grand-Moulin et le long de la rivière des Mille-Îles subissent un taux d'humidité plus élevé qui accélère la corrosion de la quincaillerie en métal et la dégradation des cadres en bois. Nous recommandons des inspections aux 3 ans et l'utilisation de quincaillerie en acier inoxydable pour ces propriétés riveraines haut de gamme." },
    ],
  },
  {
    slug: "lorraine",
    name: "Lorraine",
    region: "Laurentides",
    distance: "40 min",
    population: "10 000 habitants",
    description:
      "Lorraine est une petite municipalité résidentielle huppée des Laurentides, reconnue pour ses rues sinueuses bordées d'arbres matures et ses propriétés unifamiliales de grande valeur. Les maisons, principalement construites entre 1975 et 2000, sont généralement de grands formats sur des terrains boisés. Les propriétaires de Lorraine privilégient des réparations de qualité supérieure pour maintenir le prestige de leurs propriétés.",
    neighborhoods: ["Secteur du Boisé", "Chemin de Lorraine", "Domaine des Chênes", "Secteur du Golf", "Montée Lesage"],
    commonIssues: [
      "Remplacement de thermos surdimensionnées dans les résidences du chemin de Lorraine et du Domaine des Chênes avec baies vitrées panoramiques",
      "Quincaillerie haut de gamme usée sur les portes-patio et fenêtres de grande taille",
      "Condensation et perte d'efficacité énergétique dans les maisons des années 75-90",
    ],
    faq: [
      { question: "Quel est le coût de remplacement de thermos à Lorraine?", answer: "Les prix varient de 200$ à 600$ selon les dimensions. Les résidences de prestige de Lorraine ont des fenêtres et baies vitrées surdimensionnées qui nécessitent des thermos sur mesure et une manipulation spécialisée avec ventouses. Le budget moyen par maison à Lorraine est supérieur à la moyenne régionale en raison de la taille des propriétés." },
      { question: "Offrez-vous des produits haut de gamme pour les propriétés de Lorraine?", answer: "Oui, nous proposons des thermos à haut rendement avec verre low-E, gaz argon et intercalaires Super Spacer pour une performance maximale. Ces produits conviennent parfaitement aux propriétés de prestige de Lorraine." },
      { question: "Comment entretenir les grandes baies vitrées des maisons de Lorraine en hiver?", answer: "Les grandes propriétés de Lorraine, avec leurs vastes surfaces vitrées donnant sur les terrains boisés, perdent beaucoup de chaleur si les thermos sont défaillants. Nous recommandons de vérifier annuellement l'absence de buée entre les vitres et de faire inspecter la quincaillerie. Le remplacement par des thermos low-E avec argon peut réduire les pertes thermiques de 40% sur les grandes baies vitrées." },
    ],
  },
  {
    slug: "deux-montagnes",
    name: "Deux-Montagnes",
    region: "Laurentides",
    distance: "45 min",
    population: "18 000 habitants",
    description:
      "Deux-Montagnes est une ville résidentielle située en bordure du lac des Deux-Montagnes, offrant un cadre de vie riverain accessible. Le parc immobilier est composé principalement de bungalows et de maisons à étages des années 1960-1990, avec quelques développements plus récents. La proximité du lac et l'exposition aux vents créent des conditions qui accélèrent la détérioration des composantes de fenêtres.",
    neighborhoods: ["Centre-ville", "Secteur de la Plage", "Grand-Moulin", "Olympia", "Domaine Deux-Montagnes"],
    commonIssues: [
      "Thermos embuées dans les bungalows des rues du secteur Olympia et Grand-Moulin construits dans les années 60-80",
      "Quincaillerie corrodée par les embruns et l'humidité constante du lac des Deux-Montagnes, surtout côté plage",
      "Infiltrations d'air par les joints détériorés sur les fenêtres exposées aux vents du lac",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Deux-Montagnes?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés riveraines du lac exposées aux vents, nous recommandons des thermos à haut rendement pour une meilleure isolation." },
      { question: "L'humidité du lac affecte-t-elle les fenêtres à Deux-Montagnes?", answer: "Oui, la proximité du lac des Deux-Montagnes crée un environnement plus humide qui accélère la corrosion de la quincaillerie et la dégradation des joints. Les propriétés côté lac nécessitent un entretien plus fréquent." },
      { question: "Les fenêtres du secteur de la Plage à Deux-Montagnes s'usent-elles plus vite?", answer: "Oui, les propriétés du secteur de la Plage et d'Olympia, directement exposées au lac des Deux-Montagnes, subissent des conditions plus sévères : vents du large, embruns et humidité constante. La quincaillerie y corrode plus rapidement et les joints de thermos cèdent souvent 5 à 8 ans avant ceux des maisons situées plus à l'intérieur. Un entretien préventif aux 3 ans est fortement recommandé." },
    ],
  },
  {
    slug: "saint-eustache",
    name: "Saint-Eustache",
    region: "Laurentides",
    distance: "45 min",
    population: "46 000 habitants",
    description:
      "Saint-Eustache est une ville historique des Laurentides, connue pour la bataille de 1837 et son église patrimoniale. Le Vieux-Saint-Eustache conserve un patrimoine bâti remarquable le long de la rivière du Chêne, tandis que les vastes secteurs résidentiels des années 1970-1990 au sud de l'autoroute 640 forment le cœur du parc immobilier. La ville offre un mélange de besoins en restauration patrimoniale et en remplacement de thermos standards.",
    neighborhoods: ["Vieux-Saint-Eustache", "Secteur de la 640", "Grande-Côte", "Domaine des Érables", "Boulevard Arthur-Sauvé"],
    commonIssues: [
      "Thermos en fin de vie dans les vastes développements le long du boulevard Arthur-Sauvé et de la Grande-Côte construits dans les années 70-90",
      "Fenêtres patrimoniales à restaurer dans les bâtiments historiques du Vieux-Saint-Eustache",
      "Portes d'entrée mal isolées dans les bungalows causant des pertes de chaleur importantes",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Saint-Eustache?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les propriétés patrimoniales du Vieux-Saint-Eustache peuvent nécessiter des formats sur mesure pour respecter le cachet historique." },
      { question: "Restaurez-vous les fenêtres des bâtiments patrimoniaux de Saint-Eustache?", answer: "Oui, nous avons l'expérience de la restauration de fenêtres dans les bâtiments patrimoniaux. Nous préservons l'apparence d'origine tout en intégrant des thermos modernes pour améliorer l'efficacité énergétique, dans le respect des normes patrimoniales." },
      { question: "L'église de Saint-Eustache a des fenêtres patrimoniales — travaillez-vous sur ce type de bâtiment?", answer: "Nous intervenons principalement sur les propriétés résidentielles, mais notre expertise en restauration de fenêtres anciennes s'applique aux maisons patrimoniales du Vieux-Saint-Eustache le long de la rivière du Chêne. Ces maisons du 19e siècle nécessitent un savoir-faire particulier pour remplacer les thermos tout en préservant les cadres et moulures d'époque." },
    ],
  },
  {
    slug: "sainte-marthe-sur-le-lac",
    name: "Sainte-Marthe-sur-le-Lac",
    region: "Laurentides",
    distance: "45 min",
    population: "20 000 habitants",
    description:
      "Sainte-Marthe-sur-le-Lac est une ville résidentielle en bordure du lac des Deux-Montagnes, marquée par les inondations historiques de 2019 qui ont affecté des centaines de propriétés. De nombreux propriétaires ont dû reconstruire ou rénover après le bris de la digue, créant une demande importante pour le remplacement de fenêtres et portes endommagées. Le parc immobilier comprend des bungalows des années 1970-1990 et des constructions post-inondation.",
    neighborhoods: ["Secteur de la Digue", "Centre-ville", "Domaine Lakeshore", "Secteur du Parc", "Boulevard des Promenades"],
    commonIssues: [
      "Remplacement de fenêtres et portes du secteur de la Digue endommagées par les inondations de 2019 et l'humidité résiduelle persistante",
      "Thermos embuées dans les bungalows du boulevard des Promenades et du Domaine Lakeshore construits dans les années 70-90",
      "Moisissures autour des cadres de fenêtres et quincaillerie corrodée dans les maisons du secteur de la Digue touchées par l'humidité résiduelle post-inondation",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Sainte-Marthe-sur-le-Lac?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés ayant subi des dommages d'eau, nous offrons des évaluations complètes pour identifier toutes les composantes à remplacer." },
      { question: "Pouvez-vous remplacer des fenêtres endommagées par les inondations?", answer: "Oui, nous avons accompagné plusieurs propriétaires de Sainte-Marthe après les inondations de 2019. Nous remplaçons les thermos, les cadres endommagés par l'eau, la quincaillerie corrodée et les joints détériorés." },
      { question: "Les maisons reconstruites après les inondations de 2019 ont-elles aussi besoin d'entretien?", answer: "Les propriétés reconstruites ou rénovées après le bris de la digue en 2019 ont des fenêtres neuves, mais l'humidité résiduelle dans les fondations et les murs peut accélérer la condensation et la dégradation des joints. Nous recommandons une inspection préventive 3 à 5 ans après les travaux post-inondation pour détecter tout signe de détérioration prématurée." },
    ],
  },
  {
    slug: "lassomption",
    name: "L'Assomption",
    region: "Lanaudière",
    distance: "40 min",
    population: "23 000 habitants",
    description:
      "L'Assomption est une ville historique de Lanaudière fondée en 1724, avec un centre-ville patrimonial remarquable le long de la rivière L'Assomption. Le Vieux-L'Assomption abrite des bâtiments datant du 18e et 19e siècle, incluant le collège classique et des maisons de pierre. Les secteurs résidentiels plus récents vers l'autoroute 40 offrent des constructions des années 1980-2010. Ce mélange crée des besoins variés en réparation de fenêtres.",
    neighborhoods: ["Vieux-L'Assomption", "Secteur du Collège", "Boulevard l'Ange-Gardien", "Domaine de l'Assomption", "Secteur de la 40"],
    commonIssues: [
      "Fenêtres patrimoniales en bois à restaurer dans les bâtiments centenaires du Vieux-L'Assomption, notamment autour du collège classique et de la rue Saint-Étienne",
      "Thermos embuées dans les constructions résidentielles des années 1985-2005",
      "Quincaillerie grippée sur les fenêtres des maisons de 20 à 35 ans",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à L'Assomption?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les bâtiments patrimoniaux du Vieux-L'Assomption, des travaux sur mesure peuvent être nécessaires à des coûts supérieurs pour respecter le cachet historique." },
      { question: "Restaurez-vous les fenêtres patrimoniales à L'Assomption?", answer: "Oui, nous avons l'expertise pour travailler sur les fenêtres des bâtiments patrimoniaux. Nous préservons les cadres d'origine en bois, remplaçons les thermos et restaurons la quincaillerie pour maintenir l'authenticité historique." },
      { question: "Les bâtiments du Vieux-L'Assomption autour du collège classique ont-ils des fenêtres récupérables?", answer: "Le Vieux-L'Assomption, fondé en 1724, abrite des maisons de pierre et de bois du 18e et 19e siècle dont les fenêtres en bois sont souvent encore structurellement saines malgré leur âge. Nous remplaçons les thermos et restaurons les cadres et la quincaillerie, ce qui revient à une fraction du coût d'un remplacement complet tout en préservant le patrimoine architectural de ce quartier historique remarquable." },
    ],
  },
  {
    slug: "lavaltrie",
    name: "Lavaltrie",
    region: "Lanaudière",
    distance: "50 min",
    population: "14 000 habitants",
    description:
      "Lavaltrie est une municipalité riveraine du fleuve Saint-Laurent dans Lanaudière, connue pour ses îles de Berthier à proximité et son caractère semi-rural. Le parc immobilier comprend un noyau villageois ancien le long de la route 138, des bungalows des années 1970-1990 et des développements résidentiels plus récents. La proximité du fleuve et l'exposition aux vents créent des conditions exigeantes pour les fenêtres et portes.",
    neighborhoods: ["Village de Lavaltrie", "Route 138", "Secteur du Fleuve", "Domaine des Berges", "Saint-Antoine"],
    commonIssues: [
      "Infiltrations d'air causées par les vents du fleuve sur les fenêtres des maisons de la route 138 et du Domaine des Berges, côté eau",
      "Thermos embuées dans les bungalows des années 70-90 du secteur résidentiel",
      "Cadres de fenêtres en bois détériorés par l'humidité du fleuve dans le vieux village",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Lavaltrie?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés riveraines du fleuve exposées aux vents, nous recommandons des thermos à haut rendement pour maximiser l'isolation." },
      { question: "Les vents du fleuve affectent-ils les fenêtres à Lavaltrie?", answer: "Oui, l'exposition au fleuve Saint-Laurent génère des vents importants qui exercent une pression sur les joints et la quincaillerie. Les fenêtres côté fleuve se détériorent plus rapidement et nécessitent un entretien plus fréquent." },
      { question: "Pourquoi les maisons du Vieux-Lavaltrie le long de la route 138 ont-elles autant de problèmes de fenêtres?", answer: "Le noyau villageois de Lavaltrie le long de la route 138 abrite des maisons datant du 19e siècle jusqu'aux années 1960, directement exposées aux vents du fleuve Saint-Laurent. La combinaison de l'âge des fenêtres, de l'humidité fluviale et du vent dominant crée des conditions parmi les plus exigeantes pour les composantes de fenêtres dans notre zone de service." },
    ],
  },
  {
    slug: "saint-constant",
    name: "Saint-Constant",
    region: "Rive-Sud",
    distance: "15 min",
    population: "28 000 habitants",
    description:
      "Saint-Constant est une ville en pleine croissance de la Rive-Sud, voisine immédiate de Delson. La ville offre un mélange de quartiers établis des années 1980-2000 autour du Vieux-Saint-Constant et de développements récents comme le secteur de la Route 132. Les premières générations de maisons nécessitent maintenant des remplacements de thermos et de quincaillerie, tandis que les constructions plus récentes requièrent surtout de l'entretien préventif.",
    neighborhoods: ["Vieux-Saint-Constant", "Secteur de la 132", "Domaine des Moissons", "Parc régional", "Secteur des Érables"],
    commonIssues: [
      "Thermos embuées dans les maisons du Vieux-Saint-Constant et du secteur des Érables construites entre 1985 et 2000",
      "Portes-patio à roulettes usées dans les propriétés du Domaine des Moissons et de la montée Saint-Régis",
      "Moustiquaires déchirées et cadres endommagés dans les secteurs familiaux en pleine croissance",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Saint-Constant?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Saint-Constant étant à seulement 15 minutes de nos bureaux, les frais de déplacement sont minimaux. Soumission gratuite et rapide." },
      { question: "Les maisons du Vieux-Saint-Constant ont-elles des besoins différents en fenêtres?", answer: "Oui, le secteur du Vieux-Saint-Constant autour de la montée Saint-Régis abrite des maisons plus anciennes (années 1960-1980) avec des fenêtres à guillotine et des cadres en bois qui nécessitent parfois de la restauration en plus du remplacement de thermos. Les développements plus récents du secteur de la 132 et du Domaine des Moissons ont surtout besoin de remplacements de thermos standards et d'ajustements de quincaillerie." },
      { question: "Les maisons des années 90 de Saint-Constant ont-elles besoin de nouveaux thermos?", answer: "Les maisons construites entre 1985 et 2000 à Saint-Constant atteignent maintenant 26 à 41 ans. La durée de vie d'un thermos étant de 20 à 30 ans, il est normal que la buée apparaisse et que les thermos doivent être remplacés." },
    ],
  },
  {
    slug: "sainte-catherine",
    name: "Sainte-Catherine",
    region: "Rive-Sud",
    distance: "15 min",
    population: "18 000 habitants",
    description:
      "Sainte-Catherine est une ville résidentielle compacte de la Rive-Sud, située entre le fleuve Saint-Laurent et l'écluse de Sainte-Catherine sur la Voie maritime. La ville possède un parc immobilier principalement composé de bungalows et de maisons à étages des années 1970-1995. La proximité du fleuve et de la Voie maritime crée un environnement humide qui influence la durabilité des composantes de fenêtres.",
    neighborhoods: ["Secteur du Fleuve", "Boulevard Saint-Laurent", "Secteur de l'Écluse", "Parc de la Commune", "Domaine Catherine"],
    commonIssues: [
      "Thermos embuées dans les bungalows du boulevard Saint-Laurent et du secteur de l'Écluse construits dans les années 70-80",
      "Quincaillerie corrodée par l'humidité du fleuve et de la Voie maritime",
      "Joints d'étanchéité détériorés causant des infiltrations d'air dans les maisons de 30-50 ans",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Sainte-Catherine?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Sainte-Catherine étant à seulement 15 minutes de nos bureaux à Delson, nous pouvons offrir un service rapide avec des frais de déplacement minimaux." },
      { question: "L'humidité du fleuve affecte-t-elle les fenêtres à Sainte-Catherine?", answer: "Oui, la proximité du fleuve Saint-Laurent et de la Voie maritime crée un taux d'humidité élevé qui accélère la corrosion de la quincaillerie et la dégradation des joints. Un entretien préventif régulier est recommandé." },
      { question: "Les vibrations de la Voie maritime affectent-elles les fenêtres à Sainte-Catherine?", answer: "Les propriétés proches de l'écluse de Sainte-Catherine et de la Voie maritime du Saint-Laurent subissent des vibrations causées par le passage des navires de gros tonnage. Ces micro-vibrations peuvent accélérer la fatigue des joints d'étanchéité et le desserrage de la quincaillerie au fil des années. Nous ajustons et renforçons les composantes pour résister à ces conditions uniques." },
    ],
  },
  {
    slug: "carignan",
    name: "Carignan",
    region: "Montérégie",
    distance: "20 min",
    population: "10 000 habitants",
    description:
      "Carignan est une municipalité à caractère semi-rural de la Montérégie, reconnue pour ses grands terrains, son aéroport et ses propriétés de prestige. Le parc immobilier comprend de grandes maisons unifamiliales sur des terrains boisés, avec des constructions principalement des années 1985-2015. Le caractère champêtre de Carignan attire des propriétaires exigeants qui investissent dans l'entretien de qualité de leurs propriétés.",
    neighborhoods: ["Secteur de l'Aéroport", "Chemin de Chambly", "Domaine des Patriotes", "Secteur du Mont-Saint-Bruno", "Route 112"],
    commonIssues: [
      "Thermos surdimensionnées à remplacer dans les résidences de prestige du chemin de Chambly et du secteur du Mont-Saint-Bruno",
      "Fenêtres exposées aux vents dominants sur les propriétés à terrains dégagés le long de la route 112",
      "Portes-patio de grande dimension nécessitant un ajustement de quincaillerie spécialisée",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Carignan?", answer: "Les prix varient de 200$ à 550$ selon les dimensions. Les propriétés de prestige de Carignan ont souvent des fenêtres surdimensionnées et des baies vitrées panoramiques donnant sur les terrains boisés. Le budget moyen par maison est plus élevé qu'en banlieue standard en raison de la taille des résidences." },
      { question: "Pouvez-vous intervenir sur les grandes fenêtres des propriétés de Carignan?", answer: "Oui, nous avons l'expertise et l'équipement nécessaires pour manipuler et installer des thermos de grand format. Les propriétés spacieuses de Carignan nécessitent souvent ce type d'intervention spécialisée." },
      { question: "Les terrains dégagés de Carignan créent-ils des problèmes pour les fenêtres?", answer: "Oui, les grandes propriétés de Carignan sur des terrains ouverts et dégagés, notamment le long du chemin de Chambly et de la route 112, sont plus exposées aux vents que les maisons en milieu urbain dense. Cette exposition accélère l'usure des joints d'étanchéité et sollicite davantage la quincaillerie. Des thermos à haut rendement et une quincaillerie robuste sont recommandés." },
    ],
  },
  {
    slug: "saint-basile-le-grand",
    name: "Saint-Basile-le-Grand",
    region: "Montérégie",
    distance: "20 min",
    population: "18 000 habitants",
    description:
      "Saint-Basile-le-Grand est une municipalité résidentielle paisible au pied du mont Saint-Bruno, reconnue pour ses rues boisées et sa qualité de vie familiale. Le parc immobilier est composé de maisons unifamiliales des années 1975-2005, avec un cœur villageois le long de la montée Robert et des développements plus récents. Les propriétaires accordent une grande importance à l'entretien de leurs maisons, créant une demande régulière pour les services de fenêtres et portes.",
    neighborhoods: ["Village", "Montée Robert", "Secteur du Ruisseau", "Domaine du Mont", "Secteur des Trembles"],
    commonIssues: [
      "Thermos embuées dans les maisons de la montée Robert et du Village construites entre 1975 et 1995",
      "Fenêtres à manivelle grippées dans les maisons du secteur des Trembles et du Domaine du Mont datant des années 80-90",
      "Condensation excessive et givre intérieur lors des froids intenses dans les propriétés exposées au pied du mont Saint-Bruno",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Saint-Basile-le-Grand?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons typiques de Saint-Basile-le-Grand ont des formats de fenêtres courants qui permettent un remplacement efficace et abordable." },
      { question: "Les fenêtres à manivelle peuvent-elles être réparées plutôt que remplacées?", answer: "Oui, dans la majorité des cas nous pouvons remplacer uniquement le mécanisme de manivelle, les charnières et les joints sans changer la fenêtre entière. C'est une solution économique très populaire pour les maisons des années 80-90 de Saint-Basile." },
      { question: "Le microclimat au pied du mont Saint-Bruno affecte-t-il les fenêtres à Saint-Basile?", answer: "Oui, les propriétés du Domaine du Mont et du secteur du Ruisseau, au pied du mont Saint-Bruno, sont exposées à un microclimat plus frais et humide créé par la montagne. Les nuits plus froides et la rosée matinale fréquente augmentent la condensation sur les fenêtres défaillantes. Des thermos à haut rendement avec gaz argon réduisent considérablement ce phénomène." },
    ],
  },
  {
    slug: "beloeil",
    name: "Beloeil",
    region: "Montérégie",
    distance: "25 min",
    population: "24 000 habitants",
    description:
      "Beloeil est une ville résidentielle au pied du mont Saint-Hilaire, bordée par la rivière Richelieu. Le Vieux-Beloeil le long de la rue Richelieu possède un charme patrimonial avec des maisons de caractère, tandis que les secteurs résidentiels des années 1970-2000 forment le cœur du parc immobilier. La proximité de la rivière Richelieu crée un environnement humide qui influence la durabilité des fenêtres.",
    neighborhoods: ["Vieux-Beloeil", "Rue Richelieu", "Secteur de la Montagne", "Domaine Beloeil", "Boulevard Sir-Wilfrid-Laurier"],
    commonIssues: [
      "Humidité de la rivière Richelieu causant la dégradation prématurée des cadres en bois et joints des maisons de la rue Richelieu et du boulevard Sir-Wilfrid-Laurier",
      "Thermos en fin de vie dans les maisons du secteur de la Montagne et du Domaine Beloeil construites entre 1975 et 1995",
      "Fenêtres de caractère à restaurer dans les propriétés patrimoniales du Vieux-Beloeil",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Beloeil?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les propriétés patrimoniales du Vieux-Beloeil peuvent nécessiter des formats sur mesure pour respecter le cachet architectural." },
      { question: "L'humidité de la rivière Richelieu affecte-t-elle les fenêtres à Beloeil?", answer: "Oui, la proximité de la rivière Richelieu augmente le taux d'humidité, ce qui accélère la corrosion de la quincaillerie et la dégradation des joints d'étanchéité. Nous recommandons un entretien préventif régulier pour les propriétés riveraines." },
      { question: "Les maisons de la rue Richelieu à Beloeil valent-elles la peine d'être restaurées?", answer: "Les propriétés de caractère le long de la rue Richelieu dans le Vieux-Beloeil ont un cachet architectural unique qui justifie amplement une restauration de qualité. Nous remplaçons les thermos et restaurons les cadres en bois, les moulures et la quincaillerie d'époque. Le résultat améliore l'isolation tout en préservant la valeur patrimoniale de ces maisons recherchées." },
    ],
  },
  {
    slug: "mont-saint-hilaire",
    name: "Mont-Saint-Hilaire",
    region: "Montérégie",
    distance: "25 min",
    population: "20 000 habitants",
    description:
      "Mont-Saint-Hilaire est une municipalité prestigieuse au pied de la montagne du même nom, réserve de la biosphère de l'UNESCO. La ville est reconnue pour ses propriétés haut de gamme, ses rues boisées et son environnement naturel exceptionnel. Le parc immobilier comprend des maisons de prestige des années 1970-2010, souvent avec de grandes fenêtres offrant des vues sur la montagne. Les propriétaires investissent dans des réparations de qualité.",
    neighborhoods: ["Village", "Secteur de la Montagne", "Domaine des Érables", "Chemin des Patriotes", "Rue Fortier"],
    commonIssues: [
      "Thermos surdimensionnées à remplacer dans les résidences du chemin des Patriotes et de la rue Fortier avec vue panoramique sur le mont Saint-Hilaire",
      "Condensation et perte d'efficacité dans les fenêtres panoramiques des maisons haut de gamme",
      "Fenêtres en bois noble à restaurer dans les propriétés de prestige",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Mont-Saint-Hilaire?", answer: "Les prix varient de 200$ à 600$ selon les dimensions. Les résidences haut de gamme de Mont-Saint-Hilaire ont souvent de grandes fenêtres panoramiques et des baies vitrées pour profiter de la vue sur la montagne, ce qui nécessite des thermos de grand format. Le budget moyen est plus élevé qu'en banlieue standard en raison du prestige et de la taille des propriétés." },
      { question: "Pouvez-vous remplacer les thermos des grandes fenêtres panoramiques?", answer: "Oui, nous sommes spécialisés dans le remplacement de thermos surdimensionnés. Nous utilisons des techniques de manipulation adaptées aux grands formats pour les propriétés de Mont-Saint-Hilaire avec vue sur la montagne." },
      { question: "Comment maximiser la vue sur la montagne tout en restant bien isolé à Mont-Saint-Hilaire?", answer: "Les propriétés du secteur de la Montagne et du chemin des Patriotes sont prisées pour leur vue sur le mont Saint-Hilaire, réserve de la biosphère de l'UNESCO. Nous installons des thermos à haut rendement (low-E avec argon) qui maximisent la luminosité et la vue tout en offrant une isolation thermique supérieure. Le résultat : profiter du panorama sans sacrifier le confort ni la facture de chauffage." },
    ],
  },
  {
    slug: "otterburn-park",
    name: "Otterburn Park",
    region: "Montérégie",
    distance: "25 min",
    population: "9 000 habitants",
    description:
      "Otterburn Park est une petite municipalité résidentielle nichée entre le mont Saint-Hilaire et la rivière Richelieu. La ville offre un cadre champêtre avec des rues bordées d'arbres matures et un parc immobilier composé principalement de bungalows et de cottages des années 1960-1990. Le caractère boisé de la ville et la proximité de la rivière créent un environnement humide qui peut affecter les fenêtres et portes.",
    neighborhoods: ["Secteur de la Rivière", "Chemin des Patriotes", "Mountain Road", "Secteur du Boisé", "Prince-Charles"],
    commonIssues: [
      "Thermos embuées dans les bungalows et cottages des rues Mountain Road et du chemin des Patriotes datant des années 60-80",
      "Cadres de fenêtres en bois gonflés par l'humidité de la rivière Richelieu et du milieu boisé",
      "Quincaillerie rouillée et mécanismes grippés sur les fenêtres vieillissantes",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Otterburn Park?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les bungalows et cottages typiques d'Otterburn Park ont généralement des formats de fenêtres standards, ce qui facilite un remplacement économique." },
      { question: "L'environnement boisé et humide d'Otterburn Park affecte-t-il les fenêtres?", answer: "Oui, la combinaison de la proximité de la rivière Richelieu et du couvert forestier crée un environnement plus humide qui accélère la dégradation des cadres en bois et des joints d'étanchéité. Un entretien préventif régulier est recommandé." },
      { question: "Pourquoi les cadres de fenêtres en bois pourrissent-ils plus vite à Otterburn Park?", answer: "Otterburn Park est nichée dans un environnement très boisé entre le mont Saint-Hilaire et la rivière Richelieu. L'ombre des arbres matures empêche le séchage rapide des cadres après la pluie, et l'humidité de la rivière reste emprisonnée par le couvert forestier. Les cadres en bois des bungalows des rues Mountain Road et Prince-Charles sont particulièrement touchés. Nous pouvons restaurer ou remplacer les sections endommagées." },
    ],
  },
  {
    slug: "marieville",
    name: "Marieville",
    region: "Montérégie",
    distance: "30 min",
    population: "12 000 habitants",
    description:
      "Marieville est une petite ville de la Montérégie au caractère semi-rural, située au bord de la rivière Richelieu. Le noyau villageois autour de la rue Sainte-Marie conserve un patrimoine bâti des 19e et 20e siècles, tandis que les développements résidentiels plus récents s'étendent vers la route 227. Le parc immobilier diversifié crée des besoins allant de la restauration patrimoniale au remplacement de thermos standards.",
    neighborhoods: ["Centre-ville", "Rue Sainte-Marie", "Secteur de la Rivière", "Route 227", "Domaine des Pins"],
    commonIssues: [
      "Fenêtres à battant et à guillotine vétustes dans les maisons patrimoniales de la rue Sainte-Marie et du secteur de l'église",
      "Thermos embuées dans les constructions résidentielles de la route 227 et du Domaine des Pins datant des années 80-2000",
      "Infiltrations d'air dans les maisons plus anciennes avec joints d'étanchéité détériorés",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Marieville?", answer: "Un thermos standard coûte entre 140$ et 325$ installé. Les propriétés patrimoniales du centre-ville peuvent nécessiter des formats sur mesure entre 300$ et 500$. Pour les maisons plus récentes du secteur de la route 227, les formats standards permettent des remplacements économiques. Soumission gratuite à domicile." },
      { question: "Restaurez-vous les fenêtres des maisons anciennes de Marieville?", answer: "Oui, nous avons l'expertise pour restaurer les fenêtres des maisons patrimoniales. Nous préservons les cadres d'origine, remplaçons les thermos et restaurons les mécanismes tout en respectant le cachet historique." },
      { question: "Les maisons de la rue Sainte-Marie ont-elles des fenêtres récupérables malgré leur âge?", answer: "Les maisons patrimoniales de la rue Sainte-Marie au centre-ville de Marieville ont souvent des cadres en bois encore structurellement sains malgré leur âge. Nous évaluons chaque cas individuellement : si le cadre est récupérable, nous remplaçons uniquement le thermos et la quincaillerie, ce qui revient à 40-60% moins cher qu'un remplacement complet de fenêtre tout en préservant le cachet d'époque." },
    ],
  },
  {
    slug: "contrecoeur",
    name: "Contrecœur",
    region: "Montérégie",
    distance: "35 min",
    population: "8 000 habitants",
    description:
      "Contrecœur est une municipalité riveraine du fleuve Saint-Laurent en Montérégie, avec un noyau villageois historique le long de la route Marie-Victorin et un secteur industriel portuaire. Le parc immobilier comprend des maisons patrimoniales du Vieux-Contrecœur, des bungalows des années 1970-1990 et des constructions plus récentes. L'exposition au fleuve et aux vents crée des conditions exigeantes pour les fenêtres et portes.",
    neighborhoods: ["Vieux-Contrecœur", "Route Marie-Victorin", "Secteur du Port", "Domaine de la Rive", "Parc Antoine-Pécaudy"],
    commonIssues: [
      "Infiltrations d'air causées par les vents du fleuve sur les maisons de la route Marie-Victorin exposées côté eau",
      "Fenêtres patrimoniales en bois à restaurer dans les maisons historiques du Vieux-Contrecœur près du parc Antoine-Pécaudy",
      "Thermos embuées et rails encrassés par la poussière portuaire dans les bungalows des années 70-90 du Domaine de la Rive",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Contrecœur?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les propriétés riveraines exposées aux vents du fleuve, nous recommandons des thermos à haut rendement pour une meilleure isolation." },
      { question: "Les vents du fleuve affectent-ils les fenêtres à Contrecœur?", answer: "Oui, l'exposition directe au fleuve Saint-Laurent génère des vents importants qui accélèrent la dégradation des joints et de la quincaillerie. Les fenêtres côté fleuve nécessitent un entretien plus fréquent." },
      { question: "Les activités portuaires de Contrecœur affectent-elles la durabilité des fenêtres?", answer: "Les propriétés proches du secteur du Port et de la route Marie-Victorin subissent une exposition combinée aux vents du fleuve, à la poussière industrielle et aux vibrations du trafic lourd portuaire. Ces conditions accélèrent l'encrassement des rails de fenêtres coulissantes et l'usure des joints d'étanchéité. Un nettoyage et un entretien préventif annuel prolongent significativement la durée de vie des composantes." },
    ],
  },
  {
    slug: "saint-amable",
    name: "Saint-Amable",
    region: "Montérégie",
    distance: "20 min",
    population: "14 000 habitants",
    description:
      "Saint-Amable est une municipalité résidentielle en croissance de la Montérégie, offrant un cadre semi-rural à proximité de Sainte-Julie et de Varennes. La ville a connu un développement important depuis les années 1990, avec de nombreuses maisons unifamiliales et jumelés. Les premières vagues de constructions commencent à nécessiter des remplacements de thermos et des ajustements de quincaillerie.",
    neighborhoods: ["Village", "Rue Principale", "Domaine des Érables", "Secteur du Parc", "Montée de la Mine"],
    commonIssues: [
      "Premiers remplacements de thermos dans les maisons du Domaine des Érables et de la Montée de la Mine construites entre 1990 et 2005",
      "Quincaillerie d'entrée de gamme cassée ou grippée dans les constructions de série le long de la rue Principale",
      "Portes d'entrée et portes-patio désalignées par le tassement des sols argileux dans les propriétés de 20 à 35 ans",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Saint-Amable?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Les maisons typiques de Saint-Amable ont des formats de fenêtres standards qui permettent un remplacement rapide et économique." },
      { question: "Les maisons des années 90-2000 de Saint-Amable ont-elles besoin de nouveaux thermos?", answer: "Les maisons construites entre 1990 et 2005 atteignent maintenant 21 à 36 ans. La durée de vie d'un thermos étant de 20 à 30 ans, il est normal que la buée apparaisse. Un remplacement préventif améliore le confort et réduit la facture de chauffage." },
      { question: "Les sols argileux de Saint-Amable causent-ils des problèmes aux fenêtres et portes?", answer: "Oui, Saint-Amable est située sur un sol argileux qui se contracte et gonfle selon les saisons. Ce mouvement du sol peut causer un léger tassement différentiel des fondations, ce qui désaligne les cadres de fenêtres et de portes. Nous corrigeons ces désalignements en ajustant la quincaillerie, les charnières et les points de fermeture pour retrouver un fonctionnement fluide et étanche." },
    ],
  },
  {
    slug: "mercier",
    name: "Mercier",
    region: "Montérégie",
    distance: "15 min",
    population: "14 000 habitants",
    description:
      "Mercier est une municipalité résidentielle de la Montérégie située à proximité immédiate de Châteauguay et de Delson. La ville offre un cadre semi-rural avec un parc immobilier composé de maisons unifamiliales des années 1975-2010. Le boulevard Sainte-Marguerite constitue l'artère principale, autour de laquelle s'organisent les secteurs résidentiels. La proximité de nos bureaux permet un service particulièrement rapide.",
    neighborhoods: ["Centre de Mercier", "Boulevard Sainte-Marguerite", "Secteur du Parc", "Route 138", "Domaine du Ruisseau"],
    commonIssues: [
      "Thermos embuées dans les maisons du boulevard Sainte-Marguerite et de la route 138 construites entre 1975 et 1995",
      "Portes-patio à roulettes nylon usées dans les propriétés du Domaine du Ruisseau et du secteur du Parc",
      "Moustiquaires déchirées et cadres de moustiquaires oxydés sur les fenêtres de 25 à 40 ans",
    ],
    faq: [
      { question: "Quel est le prix pour remplacer des thermos à Mercier?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Mercier étant à seulement 15 minutes de nos bureaux, les frais de déplacement sont minimaux. Soumission gratuite et rapide." },
      { question: "Pourquoi les portes-patio des maisons de Mercier sont-elles souvent difficiles à ouvrir?", answer: "Les maisons des années 1975-1995 le long du boulevard Sainte-Marguerite et du secteur résidentiel de Mercier avaient des portes-patio avec des roulettes en nylon qui s'usent après 20-25 ans. Le rail s'encrasse aussi avec le temps. Nous remplaçons les roulettes, nettoyons ou remplaçons le rail et ajustons l'alignement — votre porte-patio glissera comme neuve pour une fraction du prix d'un remplacement." },
      { question: "Réparez-vous les portes-patio à Mercier?", answer: "Oui, nous remplaçons les roulettes, poignées, serrures et rails usés des portes-patio. C'est l'un de nos services les plus demandés pour les maisons de 25 à 40 ans comme celles qu'on retrouve à Mercier." },
    ],
  },
  {
    slug: "mcmasterville",
    name: "McMasterville",
    region: "Montérégie",
    distance: "25 min",
    population: "6 000 habitants",
    description:
      "McMasterville est une petite municipalité résidentielle de la Montérégie, nichée entre Beloeil et Mont-Saint-Hilaire le long de la rivière Richelieu. Le parc immobilier est composé principalement de bungalows et de maisons à étages des années 1960-1990, construits pour les travailleurs de l'ancienne poudrière CIL. Les propriétaires font face aux défis typiques des constructions de cette époque : thermos en fin de vie et quincaillerie vieillissante.",
    neighborhoods: ["Secteur de la Rivière", "Boulevard Sir-Wilfrid-Laurier", "Chemin des Patriotes", "Domaine des Pins", "Secteur de l'Église"],
    commonIssues: [
      "Thermos en fin de vie dans les bungalows des années 60-80 construits pour les travailleurs de la CIL",
      "Quincaillerie rouillée et mécanismes grippés sur les fenêtres de 40 ans et plus",
      "Humidité de la rivière Richelieu causant la dégradation des cadres en bois",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à McMasterville?", answer: "Un thermos standard coûte entre 140$ et 300$ installé. Les bungalows typiques de McMasterville, construits pour les travailleurs de l'ancienne poudrière, ont des formats de fenêtres modestes et standards qui permettent des remplacements très économiques. C'est souvent l'un des secteurs les plus abordables de notre zone de service." },
      { question: "Les vieilles maisons de McMasterville valent-elles la peine d'être réparées?", answer: "Oui, le remplacement des thermos et la réparation de quincaillerie redonnent une efficacité énergétique et un confort significatifs. C'est beaucoup plus économique que le remplacement complet des fenêtres et peut se rentabiliser en économies de chauffage." },
      { question: "Les bungalows d'anciens travailleurs de la CIL à McMasterville ont-ils des fenêtres particulières?", answer: "Les bungalows construits dans les années 1960-1980 pour les travailleurs de la poudrière CIL (aujourd'hui le site décontaminé) sont des maisons modestes avec des fenêtres de formats standards, souvent coulissantes ou à battant. Les thermos d'origine ont largement dépassé leur durée de vie. L'avantage : les formats standards permettent des remplacements rapides et économiques, entre 140$ et 300$ par thermos." },
    ],
  },
  {
    slug: "richelieu",
    name: "Richelieu",
    region: "Montérégie",
    distance: "30 min",
    population: "5 000 habitants",
    description:
      "Richelieu est une petite municipalité de la Montérégie bordée par la rivière Richelieu, à mi-chemin entre Chambly et Saint-Jean-sur-Richelieu. Le noyau villageois le long de la rivière conserve des maisons de caractère, tandis que les développements résidentiels des années 1980-2000 offrent des propriétés plus récentes. La proximité de la rivière crée un environnement humide qui accélère la détérioration des composantes de fenêtres.",
    neighborhoods: ["Village", "Chemin des Patriotes", "Secteur de la Rivière", "Route 112", "Domaine Richelieu"],
    commonIssues: [
      "Cadres de fenêtres en bois gonflés et difficiles à opérer dans les maisons du chemin des Patriotes exposées à l'humidité de la rivière",
      "Thermos embuées dans les constructions résidentielles de la route 112 et du Domaine Richelieu datant des années 80-2000",
      "Quincaillerie corrodée et joints pourris sur les fenêtres des maisons de caractère du noyau villageois",
    ],
    faq: [
      { question: "Quel est le prix d'un remplacement de thermos à Richelieu?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Soumission gratuite à domicile dans la municipalité de Richelieu et tout le secteur de la rivière Richelieu." },
      { question: "L'humidité de la rivière affecte-t-elle les fenêtres à Richelieu?", answer: "Oui, la proximité directe de la rivière Richelieu augmente significativement l'humidité ambiante, ce qui accélère la corrosion de la quincaillerie, le gonflement des cadres en bois et la dégradation des joints. Un entretien régulier est essentiel." },
      { question: "Pourquoi les fenêtres du chemin des Patriotes à Richelieu gonflent-elles?", answer: "Les maisons de caractère le long du chemin des Patriotes à Richelieu sont directement exposées à l'humidité de la rivière Richelieu. Le bois des cadres absorbe cette humidité et gonfle, rendant les fenêtres difficiles à ouvrir ou fermer. Nous rabottons et ajustons les cadres, appliquons des traitements hydrofuges et remplaçons la quincaillerie corrodée pour un fonctionnement fluide et durable." },
    ],
  },
  {
    slug: "saint-philippe",
    name: "Saint-Philippe",
    region: "Montérégie",
    distance: "10 min",
    population: "8 000 habitants",
    description:
      "Saint-Philippe est une municipalité voisine immédiate de Delson, offrant un cadre semi-rural en pleine transformation résidentielle. La ville combine un noyau villageois traditionnel le long de la montée Saint-Claude avec de nouveaux développements résidentiels qui attirent de jeunes familles. La proximité de nos bureaux permet le service le plus rapide de notre zone de couverture.",
    neighborhoods: ["Village", "Montée Saint-Claude", "Secteur de la Route 104", "Domaine des Champs", "Rang Saint-André"],
    commonIssues: [
      "Thermos embuées dans les maisons du noyau villageois de la montée Saint-Claude datant des années 1975-2000",
      "Poignées cassées et mécanismes de verrouillage défaillants dans les nouvelles constructions du secteur des Champs et du rang Saint-André",
      "Portes d'entrée désalignées par le tassement des fondations dans les sols agricoles fraîchement urbanisés de Saint-Philippe",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Saint-Philippe?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Saint-Philippe étant à seulement 10 minutes de nos bureaux, c'est notre secteur le plus proche avec des frais de déplacement minimaux." },
      { question: "Les nouveaux développements résidentiels de Saint-Philippe ont-ils déjà besoin de réparations?", answer: "Saint-Philippe connaît une transformation résidentielle rapide avec de nouveaux quartiers qui poussent le long de la montée Saint-Claude et du rang Saint-André. Les constructions de 5 à 15 ans montrent parfois des défauts de quincaillerie d'entrée de gamme : poignées qui cassent, mécanismes de verrouillage défaillants et joints de porte mal ajustés. Nous corrigeons ces problèmes rapidement grâce à notre proximité (10 minutes)." },
      { question: "Les nouvelles constructions de Saint-Philippe ont-elles des problèmes de fenêtres?", answer: "Les constructions neuves utilisent parfois de la quincaillerie d'entrée de gamme qui peut montrer des signes d'usure après quelques années. De plus, le tassement normal des fondations peut causer un léger désalignement des portes et fenêtres." },
    ],
  },
  {
    slug: "vercheres",
    name: "Verchères",
    region: "Montérégie",
    distance: "30 min",
    population: "6 000 habitants",
    description:
      "Verchères est une municipalité historique de la Montérégie, célèbre pour Madeleine de Verchères et son patrimoine du régime français. Le noyau villageois le long du fleuve Saint-Laurent conserve des maisons ancestrales et patrimoniales remarquables. Les secteurs résidentiels plus récents offrent des constructions des années 1980-2010. L'exposition au fleuve et les vents dominants imposent des contraintes importantes sur l'intégrité des fenêtres.",
    neighborhoods: ["Vieux-Verchères", "Route Marie-Victorin", "Secteur du Fleuve", "Domaine des Patriotes", "Rang de la Beauce"],
    commonIssues: [
      "Fenêtres patrimoniales en bois à restaurer dans les maisons ancestrales du Vieux-Verchères le long de la route Marie-Victorin",
      "Infiltrations d'air et quincaillerie corrodée par les vents dominants du fleuve Saint-Laurent sur les propriétés du Domaine des Patriotes côté eau",
      "Thermos embuées dans les constructions du rang de la Beauce et du secteur résidentiel datant des années 85-2005",
    ],
    faq: [
      { question: "Combien coûte un remplacement de thermos à Verchères?", answer: "Un thermos standard coûte entre 150$ et 350$ installé. Pour les maisons patrimoniales du Vieux-Verchères, des travaux sur mesure peuvent être nécessaires pour respecter le cachet historique." },
      { question: "Restaurez-vous les fenêtres patrimoniales de Verchères?", answer: "Oui, nous avons l'expertise pour intervenir sur les fenêtres des bâtiments patrimoniaux. Nous préservons les cadres d'origine, remplaçons les thermos et restaurons la quincaillerie tout en respectant le caractère historique des propriétés du Vieux-Verchères." },
      { question: "Les maisons ancestrales du Vieux-Verchères nécessitent-elles des réparations spécialisées?", answer: "Oui, le Vieux-Verchères le long de la route Marie-Victorin abrite des maisons datant du régime français, célèbres pour leur lien avec l'histoire de Madeleine de Verchères. Ces maisons patrimoniales nécessitent un savoir-faire particulier : restauration de cadres en bois d'époque, remplacement de thermos adapté aux formats anciens et préservation des moulures d'origine. Nous avons l'expertise pour ce type d'intervention délicate." },
    ],
  },
];

export function getCity(slug) {
  return CITIES.find((c) => c.slug === slug) || null;
}
