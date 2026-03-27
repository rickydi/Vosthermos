import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Articles SEO ────────────────────────────────────────────────────────────

const posts = [
  // ─── Article 1 ─────────────────────────────────────────────────────────────
  {
    title: 'Quelle est la durée de vie d\'une vitre thermos?',
    slug: 'duree-de-vie-vitre-thermos',
    excerpt: 'Découvrez combien de temps dure une vitre thermos, les signes de fin de vie à surveiller et les facteurs qui influencent sa longévité. Guide complet pour propriétaires québécois.',
    category: 'guides',
    tags: ['thermos', 'durée de vie', 'remplacement', 'efficacité énergétique'],
    publishedAt: new Date('2026-03-01T10:00:00Z'),
    content: `
<h2>Durée de vie moyenne d'une vitre thermos</h2>

<p>Une vitre thermos, aussi appelée <strong>unité scellée</strong> ou <strong>verre isolant</strong>, a une durée de vie moyenne de <strong>15 à 25 ans</strong>. Cette fourchette varie considérablement selon la qualité de fabrication, les conditions climatiques et l'entretien de vos fenêtres. Au Québec, où les écarts de température peuvent dépasser 60 degrés entre l'hiver et l'été, les unités scellées sont soumises à un stress thermique important qui peut raccourcir leur longévité.</p>

<p>Les fabricants québécois offrent généralement des garanties de 10 à 20 ans sur leurs unités scellées. Toutefois, il n'est pas rare qu'un thermos de qualité supérieure dure bien au-delà de sa garantie lorsqu'il est installé correctement et entretenu régulièrement.</p>

<h2>Les facteurs qui influencent la durée de vie</h2>

<h3>La qualité du scellant</h3>

<p>Le scellant est l'élément le plus critique d'une vitre thermos. Les unités modernes utilisent un <strong>double scellant</strong> : un scellant intérieur en polyisobutylène (PIB) qui agit comme barrière contre l'humidité, et un scellant extérieur en polysulfure ou silicone structurel qui assure la résistance mécanique. Un thermos avec un double scellant de qualité durera significativement plus longtemps qu'un modèle à scellant unique.</p>

<h3>L'exposition au soleil</h3>

<p>Les fenêtres orientées <strong>sud et ouest</strong> reçoivent davantage de rayonnement solaire, ce qui accélère la dégradation du scellant. Les cycles répétés de dilatation et de contraction causés par le réchauffement solaire direct créent un stress mécanique qui affaiblit progressivement l'étanchéité. Les vitres thermos exposées au plein soleil peuvent perdre jusqu'à 5 ans de durée de vie par rapport à celles qui sont protégées ou orientées nord.</p>

<h3>La qualité de l'installation</h3>

<p>Une installation inadéquate est l'une des premières causes de défaillance prématurée. Un thermos mal calé dans le cadre, un drainage insuffisant ou une pression excessive sur le verre peuvent compromettre le scellant dès les premières années. C'est pourquoi il est essentiel de faire appel à des professionnels qualifiés pour l'installation.</p>

<h3>Le type de gaz isolant</h3>

<p>Les unités remplies de <strong>gaz argon</strong> offrent une meilleure isolation que celles remplies d'air sec. L'argon, plus dense que l'air, réduit les transferts thermiques par convection. Cependant, même les meilleures unités perdent environ 1% de leur gaz argon par année, ce qui explique en partie la diminution graduelle de la performance isolante au fil du temps.</p>

<h2>Les signes qu'un thermos arrive en fin de vie</h2>

<ul>
<li><strong>Buée entre les vitres</strong> : le signe le plus évident. Si de la condensation apparaît entre les deux panneaux de verre et ne peut pas être essuyée, le scellant est brisé.</li>
<li><strong>Dépôts blanchâtres</strong> : des traces minérales permanentes causées par l'évaporation répétée de la condensation à l'intérieur de l'unité.</li>
<li><strong>Distorsion visuelle</strong> : les lignes droites semblent ondulées quand vous regardez à travers la vitre, signe que le verre s'est déformé après la perte du gaz intérieur.</li>
<li><strong>Sensation de froid accru</strong> : une perte notable d'isolation par rapport aux autres fenêtres de la maison.</li>
<li><strong>Scellant dégradé visible</strong> : le mastic noir entre les vitres est craqué, décollé ou effrité.</li>
</ul>

<h2>Comment prolonger la durée de vie de vos thermos</h2>

<p>Plusieurs gestes simples peuvent aider à maximiser la longévité de vos unités scellées :</p>

<ul>
<li><strong>Maintenir un bon drainage</strong> : assurez-vous que les trous de drainage au bas du cadre de fenêtre ne sont pas obstrués. L'eau stagnante est l'ennemi numéro un du scellant.</li>
<li><strong>Contrôler l'humidité intérieure</strong> : un taux d'humidité trop élevé dans la maison augmente le stress sur les scellants. Visez un taux entre 30% et 50% en hiver.</li>
<li><strong>Éviter les chocs thermiques</strong> : ne placez pas de sources de chaleur intense directement devant vos fenêtres (radiateurs, lampes chauffantes).</li>
<li><strong>Inspecter annuellement</strong> : vérifiez l'état du scellant et du cadre chaque automne, avant la saison froide.</li>
</ul>

<h2>Quand remplacer plutôt que réparer?</h2>

<p>Lorsqu'un thermos montre des signes de défaillance, le <strong>remplacement de l'unité scellée</strong> est presque toujours la meilleure option. Contrairement à une idée répandue, il n'est généralement pas nécessaire de remplacer la fenêtre complète. Le remplacement du thermos seul coûte une fraction du prix d'une fenêtre neuve tout en restaurant la performance isolante d'origine.</p>

<p>Chez <strong>Vosthermos</strong>, nous offrons le <a href="/services/remplacement-vitre-thermos">remplacement de vitres thermos</a> avec des unités de haute qualité fabriquées au Québec. Nos techniciens se déplacent chez vous pour une installation rapide et professionnelle. Consultez notre page <a href="/prix">prix</a> pour obtenir une estimation adaptée à vos besoins.</p>

<h2>En résumé</h2>

<p>La durée de vie d'une vitre thermos se situe entre 15 et 25 ans selon la qualité, l'exposition et l'entretien. En surveillant les signes de dégradation et en agissant rapidement au premier signe de buée, vous éviterez les pertes d'énergie coûteuses et maintiendrez le confort de votre maison. N'hésitez pas à visiter notre <a href="/boutique">boutique en ligne</a> pour découvrir nos produits ou à nous contacter pour une évaluation gratuite.</p>
`
  },

  // ─── Article 2 ─────────────────────────────────────────────────────────────
  {
    title: 'Vitre thermos en liquidation: bonne ou mauvaise idée?',
    slug: 'vitre-thermos-liquidation-bonne-mauvaise-idee',
    excerpt: 'Acheter une vitre thermos en liquidation semble économique, mais est-ce vraiment un bon investissement? Découvrez les avantages, risques et ce qu\'il faut vérifier avant d\'acheter.',
    category: 'conseils',
    tags: ['thermos', 'liquidation', 'qualité', 'prix'],
    publishedAt: new Date('2026-03-08T10:00:00Z'),
    content: `
<h2>Le marché des vitres thermos en liquidation au Québec</h2>

<p>Les annonces de <strong>vitres thermos en liquidation</strong> sont de plus en plus fréquentes au Québec. Que ce soit en ligne, dans les circulaires ou chez certains détaillants, les rabais affichés peuvent atteindre 50% à 70% du prix régulier. Face à de telles économies potentielles, la tentation est forte. Mais avant de vous précipiter, il est important de comprendre pourquoi ces produits se retrouvent en liquidation et quels risques vous prenez.</p>

<h2>Pourquoi certaines vitres thermos sont-elles en liquidation?</h2>

<p>Plusieurs raisons peuvent expliquer la mise en liquidation de vitres thermos :</p>

<ul>
<li><strong>Surplus de production</strong> : le fabricant a produit plus d'unités que la demande ne le justifiait.</li>
<li><strong>Dimensions non standard</strong> : des unités fabriquées sur mesure pour un projet annulé ou modifié, qui ne correspondent pas aux dimensions courantes.</li>
<li><strong>Fin de gamme</strong> : le fabricant discontinue un modèle pour en introduire un nouveau.</li>
<li><strong>Défauts esthétiques mineurs</strong> : des imperfections visuelles qui n'affectent pas la performance mais ne répondent pas aux standards de première qualité.</li>
<li><strong>Entreposage prolongé</strong> : des unités qui sont restées en entrepôt pendant plusieurs mois, voire années.</li>
<li><strong>Fermeture ou restructuration d'entreprise</strong> : liquidation de l'inventaire complet.</li>
</ul>

<h2>Les avantages d'acheter en liquidation</h2>

<h3>Des économies significatives</h3>

<p>Le principal attrait est évidemment le <strong>prix réduit</strong>. Pour un propriétaire qui doit remplacer plusieurs unités scellées, les économies peuvent se chiffrer en centaines, voire en milliers de dollars. Si la vitre thermos correspond exactement à vos dimensions et que sa qualité est vérifiée, c'est une excellente affaire.</p>

<h3>Disponibilité immédiate</h3>

<p>Contrairement aux unités fabriquées sur mesure qui nécessitent un délai de production de 2 à 4 semaines, les vitres en liquidation sont généralement <strong>disponibles immédiatement</strong>. Cela peut être un avantage considérable si vous avez besoin d'un remplacement urgent avant l'hiver.</p>

<h2>Les risques à considérer</h2>

<h3>L'absence de garantie ou une garantie réduite</h3>

<p>C'est le risque le plus important. La plupart des vitres thermos en liquidation sont vendues <strong>sans garantie</strong> ou avec une garantie considérablement réduite. Or, la garantie du fabricant est votre protection principale contre les défauts de fabrication qui peuvent prendre des années à se manifester. Une unité scellée sans garantie qui développe de la buée après 3 ans représente une perte totale de votre investissement.</p>

<h3>La dégradation du scellant en entreposage</h3>

<p>Les vitres thermos sont conçues pour être installées, pas entreposées pendant de longues périodes. Un <strong>entreposage prolongé</strong>, surtout dans des conditions non optimales (humidité, variations de température, exposition aux UV), peut accélérer la dégradation du scellant avant même que le produit soit installé. Une unité qui a passé 18 mois dans un entrepôt non climatisé a déjà perdu une partie de sa durée de vie utile.</p>

<h3>Des dimensions qui ne correspondent pas exactement</h3>

<p>Chaque ouverture de fenêtre a ses dimensions propres, et même un écart de quelques millimètres peut poser problème. Acheter une vitre thermos en liquidation signifie souvent <strong>accepter des dimensions approximatives</strong>. Un thermos trop petit nécessitera des cales supplémentaires, tandis qu'un thermos trop grand devra être refusé ou, pire, forcé dans le cadre, ce qui compromet son intégrité.</p>

<h3>Des caractéristiques techniques inadaptées</h3>

<p>Les vitres thermos ne sont pas toutes identiques. L'épaisseur du verre, le type de revêtement Low-E, le gaz de remplissage (argon vs air), l'espacement entre les vitres — tous ces paramètres influencent la performance. Un thermos en liquidation pourrait avoir des <strong>spécifications inférieures</strong> à ce que votre installation requiert.</p>

<h2>Ce qu'il faut vérifier avant d'acheter</h2>

<ul>
<li><strong>La date de fabrication</strong> : évitez les unités fabriquées il y a plus de 12 mois.</li>
<li><strong>Les dimensions exactes</strong> : mesurez vos ouvertures au millimètre près et comparez avec les dimensions de l'unité en liquidation.</li>
<li><strong>La certification</strong> : vérifiez que le produit porte le sceau IGMAC/IGCC (Insulating Glass Manufacturers Alliance of Canada).</li>
<li><strong>L'état du scellant</strong> : inspectez visuellement le pourtour de l'unité pour détecter tout signe de dégradation.</li>
<li><strong>Les conditions de retour</strong> : assurez-vous de pouvoir retourner le produit s'il ne convient pas.</li>
<li><strong>La présence de buée</strong> : même neuve, une unité mal stockée peut déjà montrer de la condensation intérieure.</li>
</ul>

<h2>L'alternative : le remplacement sur mesure au juste prix</h2>

<p>Plutôt que de risquer un achat en liquidation qui pourrait vous coûter cher à long terme, considérez le <a href="/services/remplacement-vitre-thermos">remplacement sur mesure de vos vitres thermos</a>. Chez <strong>Vosthermos</strong>, nous offrons des unités scellées fabriquées au Québec, aux dimensions exactes de vos fenêtres, avec une garantie complète du fabricant.</p>

<p>Nos <a href="/prix">prix compétitifs</a> incluent la prise de mesures, la fabrication sur mesure et l'installation professionnelle. Quand on calcule le coût réel — incluant la garantie, la durabilité et la performance énergétique —, le remplacement sur mesure représente souvent un meilleur investissement que la liquidation. Visitez notre <a href="/boutique">boutique</a> pour voir nos options ou demandez une soumission gratuite.</p>
`
  },

  // ─── Article 3 ─────────────────────────────────────────────────────────────
  {
    title: 'Prix d\'une vitre thermos au pied carré au Québec en 2026',
    slug: 'prix-vitre-thermos-pied-carre-quebec-2026',
    excerpt: 'Combien coûte une vitre thermos au pied carré au Québec? Découvrez les prix moyens en 2026, les facteurs qui influencent le coût et comment bien budgéter votre projet.',
    category: 'guides',
    tags: ['prix', 'thermos', 'pied carré', 'coût', 'budget'],
    publishedAt: new Date('2026-03-15T10:00:00Z'),
    content: `
<h2>Prix moyen d'une vitre thermos au pied carré en 2026</h2>

<p>En 2026, le <strong>prix d'une vitre thermos au pied carré</strong> au Québec se situe généralement entre <strong>8$ et 25$ du pied carré</strong>, selon le type de verre, les options choisies et la quantité commandée. Ce prix couvre l'unité scellée elle-même, sans l'installation. Avec l'installation professionnelle, comptez entre <strong>15$ et 40$ du pied carré</strong> tout inclus.</p>

<p>Il est important de comprendre que ces prix sont des moyennes. Le coût réel de votre projet dépend de nombreux facteurs que nous détaillerons dans cet article.</p>

<h2>Tableau comparatif des prix par type de thermos</h2>

<p>Voici un aperçu des prix moyens au pied carré selon le type de vitre thermos :</p>

<ul>
<li><strong>Double vitrage standard (air sec)</strong> : 8$ à 12$ /pi²  — Le modèle de base, sans revêtement Low-E ni gaz argon. Convient aux pièces secondaires ou aux bâtiments non chauffés.</li>
<li><strong>Double vitrage Low-E avec argon</strong> : 12$ à 18$ /pi²  — Le choix le plus populaire au Québec. Le revêtement Low-E réduit les pertes de chaleur et le gaz argon améliore l'isolation. Excellent rapport qualité-prix.</li>
<li><strong>Triple vitrage Low-E avec argon</strong> : 18$ à 25$ /pi²  — Trois panneaux de verre pour une isolation supérieure. Recommandé pour les façades exposées au nord et les régions très froides.</li>
<li><strong>Verre trempé ou feuilleté</strong> : supplément de 3$ à 8$ /pi²  — Requis par le code du bâtiment pour certaines applications (portes, fenêtres près du sol, salles de bain).</li>
<li><strong>Verre teinté ou réfléchissant</strong> : supplément de 2$ à 5$ /pi²  — Pour réduire l'éblouissement et le gain solaire sur les façades sud et ouest.</li>
</ul>

<h2>Les facteurs qui influencent le prix</h2>

<h3>Les dimensions de l'unité</h3>

<p>Le <strong>prix au pied carré diminue généralement</strong> avec l'augmentation de la taille de l'unité. Une petite vitre thermos de 2 pi² coûtera proportionnellement plus cher au pied carré qu'une grande vitre de 15 pi². C'est parce que les coûts fixes de fabrication (manipulation, scellage, contrôle qualité) sont répartis sur une plus grande surface. Cependant, les très grandes unités (au-delà de 25 pi²) peuvent entraîner des surcoûts liés à la manipulation et au verre plus épais requis.</p>

<h3>La forme et les découpes</h3>

<p>Les formes non rectangulaires (trapèze, arc, cercle) coûtent significativement plus cher. Les <strong>découpes sur mesure</strong> peuvent ajouter 30% à 100% au prix de base, car elles nécessitent un travail manuel et génèrent plus de pertes de matière.</p>

<h3>Le nombre d'unités commandées</h3>

<p>Comme pour la plupart des produits manufacturés, le <strong>volume compte</strong>. Commander 10 unités en même temps coûtera moins cher au pied carré que de commander une seule unité. Les fournisseurs offrent souvent des rabais de volume à partir de 5 unités.</p>

<h3>Le revêtement Low-E</h3>

<p>Le revêtement <strong>Low-E (faible émissivité)</strong> est une couche microscopique d'oxyde métallique appliquée sur le verre qui réfléchit la chaleur radiante. Au Québec, le Low-E est devenu pratiquement standard pour les fenêtres résidentielles. Il existe différentes variantes (Low-E 180, Low-E 272, etc.) dont les performances et les prix varient.</p>

<h3>La région et l'accessibilité</h3>

<p>Les prix peuvent varier selon votre localisation. Les régions éloignées des grands centres (Abitibi, Côte-Nord, Gaspésie) peuvent voir des <strong>surcoûts de transport</strong> de 10% à 20%. À Montréal, Québec et dans les couronnes, les prix sont généralement plus compétitifs grâce à la proximité des fabricants et à la concurrence.</p>

<h2>Comment calculer le coût de votre projet</h2>

<p>Pour estimer le budget nécessaire au remplacement de vos vitres thermos, suivez ces étapes :</p>

<ul>
<li><strong>Mesurez chaque fenêtre</strong> : largeur × hauteur en pouces, puis divisez par 144 pour obtenir la superficie en pieds carrés.</li>
<li><strong>Identifiez le type de verre nécessaire</strong> : double ou triple, avec ou sans Low-E, verre trempé si requis.</li>
<li><strong>Multipliez la superficie totale par le prix au pied carré</strong> correspondant au type choisi.</li>
<li><strong>Ajoutez l'installation</strong> : environ 50$ à 100$ par unité pour l'installation professionnelle.</li>
<li><strong>Prévoyez une marge</strong> de 10% à 15% pour les imprévus.</li>
</ul>

<h3>Exemple concret</h3>

<p>Pour une maison avec 8 fenêtres de taille moyenne (environ 6 pi² chacune), soit 48 pi² au total, en double vitrage Low-E avec argon à 15$ du pied carré :</p>

<ul>
<li>Vitres thermos : 48 × 15$ = 720$</li>
<li>Installation (8 × 75$) : 600$</li>
<li>Total estimé : <strong>1 320$</strong></li>
</ul>

<p>Ce montant est à comparer avec le remplacement complet des fenêtres, qui coûterait facilement <strong>8 000$ à 15 000$</strong> pour le même nombre de fenêtres. Le remplacement des thermos seuls représente donc une économie de 80% à 90%.</p>

<h2>Obtenir le meilleur prix</h2>

<p>Pour obtenir le meilleur prix sur vos vitres thermos au Québec en 2026, voici nos recommandations :</p>

<ul>
<li><strong>Demandez plusieurs soumissions</strong> : comparez au moins 3 fournisseurs avant de vous engager.</li>
<li><strong>Regroupez vos remplacements</strong> : faites remplacer toutes vos unités défaillantes en même temps pour bénéficier de meilleurs tarifs.</li>
<li><strong>Planifiez hors saison</strong> : les mois de novembre à février sont généralement moins achalandés, ce qui peut se traduire par de meilleurs prix et des délais plus courts.</li>
<li><strong>Vérifiez les subventions</strong> : des programmes comme Rénoclimat peuvent couvrir une partie des coûts si le remplacement améliore l'efficacité énergétique de votre maison.</li>
</ul>

<p>Chez <strong>Vosthermos</strong>, nous offrons des <a href="/prix">prix transparents et compétitifs</a> pour le <a href="/services/remplacement-vitre-thermos">remplacement de vitres thermos</a> partout au Québec. Chaque soumission est détaillée, sans frais cachés. Visitez notre <a href="/boutique">boutique en ligne</a> pour consulter nos produits ou demandez votre estimation gratuite dès aujourd'hui.</p>
`
  },

  // ─── Article 4 ─────────────────────────────────────────────────────────────
  {
    title: 'Fenêtre embuée: causes, solutions et prévention',
    slug: 'fenetre-embuee-causes-solutions-prevention',
    excerpt: 'Votre fenêtre est embuée entre les deux vitres? Découvrez les causes de la condensation, les solutions efficaces et comment prévenir ce problème courant au Québec.',
    category: 'conseils',
    tags: ['fenêtre embuée', 'condensation', 'désembuage', 'thermos'],
    publishedAt: new Date('2026-03-22T10:00:00Z'),
    content: `
<h2>Pourquoi votre fenêtre est-elle embuée?</h2>

<p>Une <strong>fenêtre embuée</strong> est un problème extrêmement courant au Québec, particulièrement durant les mois d'hiver. Mais toutes les fenêtres embuées ne se valent pas. Pour trouver la bonne solution, il faut d'abord identifier <strong>où se forme la condensation</strong> : sur la surface intérieure, sur la surface extérieure, ou entre les deux vitres. Chaque cas a des causes et des solutions différentes.</p>

<h2>Condensation sur la surface intérieure de la vitre</h2>

<h3>Les causes</h3>

<p>La condensation qui se forme sur la <strong>surface intérieure</strong> de votre fenêtre (côté maison) est généralement causée par un <strong>taux d'humidité trop élevé</strong> dans votre habitation. En hiver, l'air chaud et humide de la maison entre en contact avec la surface froide de la vitre, ce qui provoque la condensation de la vapeur d'eau.</p>

<p>Les sources courantes d'humidité excessive incluent :</p>

<ul>
<li><strong>La cuisine et les douches</strong> sans ventilation adéquate</li>
<li><strong>Le séchage du linge</strong> à l'intérieur</li>
<li><strong>Un humidificateur</strong> réglé trop haut</li>
<li><strong>Un sous-sol humide</strong> ou des problèmes de drainage</li>
<li><strong>Les plantes d'intérieur</strong> en grande quantité</li>
<li><strong>Une maison neuve ou récemment rénovée</strong> : le béton, le plâtre et le bois libèrent de l'humidité pendant les premiers mois.</li>
</ul>

<h3>Les solutions</h3>

<ul>
<li><strong>Réduire le taux d'humidité</strong> : maintenez un taux entre 30% et 40% en hiver. Un hygromètre (moins de 20$) vous permettra de le mesurer.</li>
<li><strong>Améliorer la ventilation</strong> : utilisez les hottes de cuisine et les ventilateurs de salle de bain systématiquement. Assurez-vous que votre échangeur d'air fonctionne correctement.</li>
<li><strong>Favoriser la circulation d'air</strong> : évitez les rideaux épais qui empêchent l'air chaud d'atteindre la fenêtre. Ouvrez les stores pendant la journée.</li>
<li><strong>Utiliser un déshumidificateur</strong> : particulièrement utile au sous-sol et dans les pièces sans ventilation.</li>
</ul>

<p>Si la condensation intérieure n'apparaît que sur certaines fenêtres, cela peut indiquer que ces fenêtres ont une <strong>valeur isolante inférieure</strong> aux autres. Un vitrage simple ou un thermos en fin de vie sera plus susceptible de se couvrir de buée qu'un double vitrage Low-E performant.</p>

<h2>Condensation entre les deux vitres du thermos</h2>

<h3>La cause</h3>

<p>C'est le problème le plus préoccupant. Lorsque la <strong>buée apparaît entre les deux panneaux de verre</strong> de votre unité scellée, cela signifie que le <strong>scellant est brisé</strong>. L'air humide a pénétré à l'intérieur de l'unité, et le dessiccant (la substance qui absorbe l'humidité à l'intérieur du cadre intercalaire) est saturé. Le gaz isolant (habituellement de l'argon) s'est échappé et a été remplacé par de l'air humide.</p>

<p>Au début, la buée peut n'apparaître que par temps froid ou lors de grandes variations de température. Avec le temps, elle devient permanente et peut laisser des <strong>dépôts minéraux blanchâtres</strong> qui rendent la vitre de plus en plus opaque.</p>

<h3>Comment confirmer le diagnostic</h3>

<p>Pour vérifier si la buée est bien entre les vitres :</p>

<ul>
<li><strong>Passez votre doigt</strong> sur la buée : si elle ne s'enlève pas, elle est à l'intérieur de l'unité scellée.</li>
<li><strong>Vérifiez des deux côtés</strong> : si la buée n'est ni sur la surface intérieure ni sur la surface extérieure, elle est forcément entre les vitres.</li>
<li><strong>Observez le pattern</strong> : la buée entre les vitres forme souvent des motifs caractéristiques, apparaissant d'abord au bas de la fenêtre ou dans les coins.</li>
</ul>

<h3>La solution : le remplacement du thermos</h3>

<p>Contrairement à une idée répandue, il n'existe <strong>aucune réparation durable</strong> pour un thermos dont le scellant est brisé. Certaines entreprises proposent le « désembuage » qui consiste à percer de petits trous dans le verre pour ventiler l'intérieur de l'unité. Cette technique élimine temporairement la buée visible, mais elle <strong>ne restaure pas l'isolation</strong> puisque le gaz argon est perdu et que l'unité n'est plus scellée. De plus, les trous percés deviennent des points d'entrée pour la poussière et les insectes.</p>

<p>La seule solution véritablement efficace est le <a href="/services/remplacement-vitre-thermos"><strong>remplacement de l'unité scellée</strong></a>. La bonne nouvelle, c'est qu'il n'est généralement pas nécessaire de remplacer la fenêtre complète. Seul le thermos (le verre) est changé, ce qui représente une économie considérable.</p>

<h2>Condensation sur la surface extérieure</h2>

<p>La condensation sur la <strong>surface extérieure</strong> de la vitre (côté rue) est un phénomène normal et en réalité un <strong>signe de bonne performance</strong> de votre fenêtre. Elle se produit principalement au printemps et à l'automne, tôt le matin, quand la température extérieure est fraîche et l'humidité est élevée. Un thermos très isolant empêche la chaleur intérieure de réchauffer la surface extérieure du verre, ce qui permet la condensation.</p>

<p>Aucune action n'est nécessaire. La buée disparaît d'elle-même quand le soleil réchauffe la surface du verre.</p>

<h2>Prévenir les problèmes de fenêtres embuées</h2>

<ul>
<li><strong>Choisissez des thermos de qualité</strong> avec double scellant et gaz argon.</li>
<li><strong>Faites installer vos fenêtres par des professionnels</strong> qualifiés pour assurer une étanchéité optimale.</li>
<li><strong>Entretenez la ventilation de votre maison</strong> : nettoyez les filtres de l'échangeur d'air régulièrement.</li>
<li><strong>Agissez rapidement</strong> au premier signe de buée entre les vitres : un remplacement rapide évite les dommages au cadre.</li>
<li><strong>Inspectez vos fenêtres annuellement</strong> : vérifiez l'état du scellant, du coupe-froid et du cadre.</li>
</ul>

<p>Vous avez une fenêtre embuée entre les vitres? <strong>Vosthermos</strong> peut vous aider. Consultez nos <a href="/prix">tarifs</a> ou visitez notre <a href="/boutique">boutique</a> pour découvrir nos solutions de remplacement de vitres thermos adaptées à tous les types de fenêtres.</p>
`
  },

  // ─── Article 5 ─────────────────────────────────────────────────────────────
  {
    title: 'Subventions pour le remplacement de fenêtres au Québec en 2026',
    slug: 'subventions-remplacement-fenetres-quebec-2026',
    excerpt: 'Guide complet des subventions disponibles au Québec en 2026 pour le remplacement de fenêtres: Rénoclimat, LogisVert, montants, admissibilité et démarches à suivre.',
    category: 'nouvelles',
    tags: ['subventions', 'Rénoclimat', 'aide financière', 'remplacement fenêtres'],
    publishedAt: new Date('2026-03-29T10:00:00Z'),
    content: `
<h2>Les programmes de subventions pour les fenêtres au Québec en 2026</h2>

<p>Le <strong>remplacement de fenêtres</strong> représente un investissement important pour les propriétaires québécois. Heureusement, plusieurs programmes gouvernementaux offrent des <strong>aides financières</strong> qui peuvent réduire significativement la facture. En 2026, les principaux programmes en vigueur sont Rénoclimat (provincial) et le programme de la Subvention canadienne pour des maisons plus vertes (fédéral). Voici tout ce que vous devez savoir pour en profiter.</p>

<h2>Rénoclimat : le programme phare du Québec</h2>

<h3>Qu'est-ce que Rénoclimat?</h3>

<p><strong>Rénoclimat</strong> est un programme du gouvernement du Québec, administré par Transition énergétique Québec (TEQ), qui encourage les propriétaires à améliorer l'efficacité énergétique de leur habitation. Le remplacement de fenêtres et de portes fait partie des travaux admissibles, à condition que les nouveaux produits offrent une meilleure performance énergétique que ceux qu'ils remplacent.</p>

<h3>Montants disponibles pour les fenêtres</h3>

<p>Les montants de subvention pour le remplacement de fenêtres sous Rénoclimat varient selon le type d'amélioration :</p>

<ul>
<li><strong>Remplacement de fenêtres</strong> (cadre complet) : jusqu'à <strong>50$ à 125$ par ouverture</strong>, selon le facteur d'amélioration énergétique.</li>
<li><strong>Remplacement de portes-fenêtres</strong> : jusqu'à <strong>75$ à 175$ par ouverture</strong>.</li>
<li><strong>Bonification pour les ménages à faible revenu</strong> : les montants peuvent être doublés pour les ménages dont le revenu se situe sous un certain seuil.</li>
</ul>

<p><strong>Important</strong> : Le remplacement des unités scellées seules (thermos) peut être admissible si une amélioration mesurable de la performance énergétique est démontrée lors de l'évaluation post-travaux. Consultez un conseiller en énergie accrédité pour confirmer l'admissibilité de votre projet.</p>

<h3>Conditions d'admissibilité</h3>

<ul>
<li>L'habitation doit avoir été <strong>construite depuis au moins un an</strong>.</li>
<li>Le propriétaire doit <strong>habiter le logement</strong> (résidence principale).</li>
<li>Une <strong>évaluation énergétique avant les travaux</strong> doit être réalisée par un conseiller accrédité.</li>
<li>Les travaux doivent être réalisés <strong>après l'évaluation initiale</strong>.</li>
<li>Une <strong>évaluation post-travaux</strong> doit confirmer l'amélioration de la performance.</li>
<li>Les fenêtres installées doivent porter la certification <strong>ENERGY STAR</strong> pour la zone climatique du Québec.</li>
</ul>

<h3>Les étapes à suivre</h3>

<ul>
<li><strong>Inscrivez-vous</strong> au programme Rénoclimat via le site de TEQ ou en appelant au 1-866-266-0008.</li>
<li><strong>Faites réaliser l'évaluation initiale</strong> (coût d'environ 150$ à 250$, parfois subventionné).</li>
<li><strong>Recevez votre rapport</strong> avec les recommandations et les améliorations admissibles.</li>
<li><strong>Réalisez les travaux</strong> dans un délai de 18 mois.</li>
<li><strong>Faites réaliser l'évaluation post-travaux</strong> pour confirmer les améliorations.</li>
<li><strong>Recevez votre subvention</strong> par chèque dans les semaines qui suivent.</li>
</ul>

<h2>LogisVert : le programme fédéral</h2>

<h3>Qu'est-ce que LogisVert?</h3>

<p>Le programme <strong>LogisVert</strong> (successeur de la Subvention canadienne pour des maisons plus vertes / Greener Homes Grant) est l'initiative fédérale pour la rénovation écoénergétique des habitations canadiennes. Il offre des subventions pour une variété de travaux, dont le remplacement de fenêtres.</p>

<h3>Montants pour les fenêtres</h3>

<ul>
<li><strong>Remplacement de fenêtres</strong> certifiées ENERGY STAR : jusqu'à <strong>125$ à 250$ par ouverture</strong>.</li>
<li><strong>Maximum par habitation</strong> : jusqu'à <strong>5 000$ à 10 000$</strong> pour l'ensemble des travaux admissibles.</li>
<li><strong>Évaluation EnerGuide</strong> : un remboursement partiel ou total des frais d'évaluation énergétique est souvent offert.</li>
</ul>

<h3>Cumul avec Rénoclimat</h3>

<p>La bonne nouvelle est que les subventions de <strong>LogisVert et Rénoclimat sont cumulables</strong>. En combinant les deux programmes, un propriétaire qui remplace 10 fenêtres pourrait obtenir jusqu'à <strong>2 000$ à 3 750$ en subventions</strong>, ce qui réduit considérablement le coût net du projet.</p>

<h2>Autres aides financières disponibles</h2>

<h3>Programmes municipaux</h3>

<p>Plusieurs municipalités québécoises offrent leurs propres programmes d'aide à la rénovation écoénergétique. Par exemple :</p>

<ul>
<li><strong>Montréal</strong> : programme Réno-Logement et programmes d'arrondissement.</li>
<li><strong>Québec</strong> : programme Habitation durable.</li>
<li><strong>Laval, Longueuil, Gatineau</strong> : divers programmes ponctuels — informez-vous auprès de votre municipalité.</li>
</ul>

<h3>Le crédit d'impôt RénoVert</h3>

<p>Bien que le crédit d'impôt provincial <strong>RénoVert</strong> ait été discontinué dans sa forme originale, le gouvernement du Québec lance régulièrement de nouvelles mesures fiscales pour encourager la rénovation écoénergétique. Consultez le site de Revenu Québec pour les mesures en vigueur en 2026.</p>

<h3>Financement à taux réduit</h3>

<p>Certaines institutions financières offrent des <strong>prêts à taux réduit</strong> pour les travaux d'efficacité énergétique. Le programme fédéral offre également des options de financement à taux avantageux qui peuvent être combinées avec les subventions.</p>

<h2>Comment maximiser vos subventions</h2>

<ul>
<li><strong>Inscrivez-vous aux deux programmes</strong> (Rénoclimat et LogisVert) avant de commencer les travaux.</li>
<li><strong>Faites réaliser l'évaluation énergétique</strong> avant tout achat ou installation.</li>
<li><strong>Choisissez des produits certifiés ENERGY STAR</strong> pour la zone climatique du Québec (zone 3).</li>
<li><strong>Conservez toutes les factures</strong> : elles seront nécessaires pour le versement des subventions.</li>
<li><strong>Combinez les travaux</strong> : profitez de l'évaluation pour identifier d'autres améliorations admissibles (isolation, portes, ventilation).</li>
<li><strong>Renseignez-vous auprès de votre municipalité</strong> pour les programmes locaux additionnels.</li>
</ul>

<h2>Vosthermos vous accompagne dans vos démarches</h2>

<p>Naviguer dans les programmes de subventions peut sembler complexe, mais les économies en valent la peine. Chez <strong>Vosthermos</strong>, nous connaissons bien ces programmes et pouvons vous guider dans vos démarches.</p>

<p>Nos produits de <a href="/services/remplacement-vitre-thermos">remplacement de vitres thermos</a> répondent aux normes requises pour l'admissibilité aux subventions. Nous fournissons toute la documentation nécessaire, incluant les spécifications techniques et les certifications des produits installés.</p>

<p>Consultez notre page <a href="/prix">prix</a> pour estimer le coût de votre projet avant subventions, et contactez-nous pour une soumission gratuite. Ensemble, nous trouverons la solution la plus économique pour améliorer le confort et l'efficacité énergétique de votre maison. Visitez aussi notre <a href="/boutique">boutique</a> pour découvrir nos produits.</p>
`
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seed blog SEO articles - Vosthermos');
  console.log('=====================================\n');

  let upserted = 0;

  for (const post of posts) {
    const result = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content.trim(),
        category: post.category,
        tags: post.tags,
        status: 'published',
        authorName: 'Vosthermos',
        aiGenerated: true,
        publishedAt: post.publishedAt,
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content.trim(),
        category: post.category,
        tags: post.tags,
        status: 'published',
        authorName: 'Vosthermos',
        aiGenerated: true,
        publishedAt: post.publishedAt,
      },
    });

    console.log(`  OK  [${result.id}] "${post.title}"`);
    console.log(`      slug: ${post.slug}`);
    console.log(`      category: ${post.category} | tags: ${post.tags.join(', ')}`);
    console.log(`      published: ${post.publishedAt.toISOString().split('T')[0]}\n`);
    upserted++;
  }

  console.log('=====================================');
  console.log(`Done. ${upserted} articles upserted.\n`);
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
