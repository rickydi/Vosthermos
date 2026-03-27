import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Articles SEO — Topical Authority + Seasonal Content ────────────────────
// 14 articles pour combler les lacunes thématiques et exploiter les pics saisonniers

const posts = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TASK 1 — Topical Authority: 10 articles couvrant les gaps restants
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Article 1 ─────────────────────────────────────────────────────────────
  {
    title: 'Comment choisir entre le double et le triple vitrage?',
    slug: 'double-vs-triple-vitrage-comment-choisir',
    excerpt: 'Double ou triple vitrage? Découvrez les différences de performance, de coût et d\'isolation pour faire le bon choix selon votre situation au Québec.',
    category: 'guides',
    tags: ['double vitrage', 'triple vitrage', 'isolation', 'efficacité énergétique', 'comparatif'],
    publishedAt: new Date('2026-04-03T10:00:00Z'),
    content: `
<h2>Double vitrage vs triple vitrage : comprendre les différences</h2>

<p>Quand vient le temps de remplacer vos fenêtres ou vos <strong>unités scellées</strong>, la question se pose inévitablement : faut-il opter pour le <strong>double vitrage</strong> ou investir dans le <strong>triple vitrage</strong>? Au Québec, où les hivers sont rigoureux et les écarts de température extrêmes, ce choix a un impact direct sur votre confort et votre facture de chauffage. Voici un guide complet pour vous aider à décider.</p>

<h2>Comment fonctionne chaque type de vitrage?</h2>

<h3>Le double vitrage</h3>

<p>Le double vitrage se compose de <strong>deux panneaux de verre</strong> séparés par un espace rempli d'air sec ou de <a href="/glossaire/gaz-argon">gaz argon</a>. Cet espace crée une barrière isolante qui limite les transferts de chaleur. Les modèles modernes intègrent un <strong>revêtement Low-E</strong> (faible émissivité) qui réfléchit la chaleur vers l'intérieur en hiver, améliorant considérablement l'isolation.</p>

<p>Le double vitrage Low-E avec argon offre un coefficient d'isolation (valeur R) d'environ <strong>R-3 à R-4</strong>, ce qui en fait un choix très performant pour la majorité des applications résidentielles au Québec.</p>

<h3>Le triple vitrage</h3>

<p>Le triple vitrage ajoute un <strong>troisième panneau de verre</strong>, créant ainsi deux chambres isolantes au lieu d'une. Avec deux revêtements Low-E et deux espaces remplis de gaz argon, il atteint une valeur R de <strong>R-5 à R-8</strong>, soit une amélioration de 40% à 100% par rapport au double vitrage.</p>

<h2>Comparatif détaillé des performances</h2>

<h3>Isolation thermique</h3>

<ul>
<li><strong>Double vitrage Low-E/argon</strong> : valeur U d'environ 1.6 à 1.8 W/m²K. Excellent pour la plupart des situations.</li>
<li><strong>Triple vitrage Low-E/argon</strong> : valeur U d'environ 0.8 à 1.2 W/m²K. Supérieur pour les façades nord et les zones très exposées au vent.</li>
</ul>

<h3>Isolation acoustique</h3>

<p>Le triple vitrage offre une <strong>réduction sonore supplémentaire de 5 à 10 décibels</strong> par rapport au double vitrage. Si votre maison est située près d'une route achalandée ou d'un aéroport, cet avantage peut justifier l'investissement à lui seul.</p>

<h3>Gain solaire</h3>

<p>Le coefficient de gain solaire (SHGC) du triple vitrage est généralement inférieur à celui du double vitrage. Cela signifie que le triple vitrage laisse passer <strong>moins de chaleur solaire gratuite</strong> en hiver. Pour les fenêtres orientées sud, le double vitrage peut paradoxalement offrir un meilleur bilan énergétique global grâce au gain solaire passif.</p>

<h3>Poids et structure</h3>

<p>Le triple vitrage est environ <strong>50% plus lourd</strong> que le double vitrage. Ce poids supplémentaire peut nécessiter des cadres plus robustes et une quincaillerie plus résistante. Vérifiez que vos cadres de fenêtre actuels peuvent supporter ce poids additionnel avant d'opter pour le triple vitrage. Notre service de <a href="/services/remplacement-quincaillerie">remplacement de quincaillerie</a> peut vous aider à adapter vos cadres.</p>

<h2>Quand choisir le double vitrage?</h2>

<ul>
<li><strong>Budget limité</strong> : le double vitrage Low-E/argon offre le meilleur rapport qualité-prix pour la majorité des propriétaires.</li>
<li><strong>Fenêtres orientées sud</strong> : le gain solaire passif compense largement la légère perte d'isolation.</li>
<li><strong>Remplacement de thermos uniquement</strong> : si vous conservez vos cadres existants, le double vitrage est généralement la seule option compatible.</li>
<li><strong>Petites fenêtres</strong> : les gains du triple vitrage sont proportionnellement moindres sur les petites surfaces.</li>
</ul>

<h2>Quand choisir le triple vitrage?</h2>

<ul>
<li><strong>Construction neuve ou rénovation majeure</strong> : l'investissement se rentabilise sur la durée de vie du bâtiment.</li>
<li><strong>Façades nord et ouest</strong> : là où le gain solaire est minimal et l'exposition au froid est maximale.</li>
<li><strong>Régions très froides</strong> : Saguenay, Abitibi, Bas-Saint-Laurent et autres régions où les températures descendent fréquemment sous -30°C.</li>
<li><strong>Projets visant la certification Novoclimat ou Passivhaus</strong> : ces standards exigent généralement du triple vitrage.</li>
<li><strong>Proximité d'une source de bruit</strong> : l'isolation acoustique supérieure du triple vitrage est un atout majeur.</li>
</ul>

<h2>Impact sur votre facture de chauffage</h2>

<p>En moyenne, le passage du double au triple vitrage réduit les pertes thermiques par les fenêtres de <strong>30% à 50%</strong>. Pour une maison typique au Québec avec 15 fenêtres, cela peut représenter une économie annuelle de <strong>150$ à 400$</strong> sur la facture de chauffage. Utilisez notre <a href="/prix">calculateur de prix</a> pour estimer l'impact sur votre situation spécifique.</p>

<h2>Le coût : un facteur déterminant</h2>

<p>Le triple vitrage coûte généralement <strong>25% à 40% plus cher</strong> que le double vitrage. Pour un projet de remplacement de 10 fenêtres, la différence peut atteindre 2 000$ à 5 000$. Le retour sur investissement se situe entre 10 et 20 ans selon les conditions. N'oubliez pas que des <a href="/blog/subventions-remplacement-fenetres-quebec-2026">subventions gouvernementales</a> peuvent réduire significativement cet écart.</p>

<h2>Notre recommandation</h2>

<p>Pour la grande majorité des propriétaires québécois qui remplacent leurs <a href="/glossaire/unite-scellee">unités scellées</a>, le <strong>double vitrage Low-E avec argon</strong> reste le choix optimal. Il offre un excellent niveau d'isolation à un prix accessible et convient à la plupart des cadres existants.</p>

<p>Le triple vitrage se justifie pleinement dans les constructions neuves haute performance et pour les fenêtres particulièrement exposées au froid. Chez <strong>Vosthermos</strong>, nous offrons les deux options et pouvons vous conseiller selon votre situation. Consultez notre <a href="/services/remplacement-vitre-thermos">service de remplacement de thermos</a> ou visitez notre <a href="/boutique">boutique</a> pour découvrir nos produits.</p>
`
  },

  // ─── Article 2 ─────────────────────────────────────────────────────────────
  {
    title: 'Guide d\'entretien saisonnier pour vos portes et fenêtres',
    slug: 'guide-entretien-saisonnier-portes-fenetres',
    excerpt: 'Suivez notre calendrier d\'entretien saisonnier pour prolonger la durée de vie de vos portes et fenêtres. Conseils pratiques pour chaque saison au Québec.',
    category: 'entretien',
    tags: ['entretien', 'portes', 'fenêtres', 'saisonnier', 'maintenance', 'durée de vie'],
    publishedAt: new Date('2026-04-10T10:00:00Z'),
    content: `
<h2>Pourquoi l'entretien saisonnier est essentiel au Québec</h2>

<p>Vos <strong>portes et fenêtres</strong> subissent des conditions parmi les plus extrêmes au monde : des hivers à -30°C, des étés humides à 35°C, des pluies verglaçantes, du vent et des rayons UV intenses. Sans un entretien régulier et adapté à chaque saison, leur durée de vie peut être réduite de <strong>5 à 10 ans</strong>. Voici un calendrier complet pour garder vos ouvertures en parfait état toute l'année.</p>

<h2>Printemps (avril-mai) : le grand nettoyage</h2>

<h3>Nettoyage en profondeur</h3>

<ul>
<li><strong>Lavez les vitres</strong> intérieures et extérieures avec une solution d'eau tiède et de vinaigre blanc. Évitez les produits à base d'ammoniaque qui peuvent endommager les revêtements Low-E.</li>
<li><strong>Nettoyez les cadres</strong> en vinyle ou en aluminium avec de l'eau savonneuse douce. Pour les cadres en bois, utilisez un nettoyant spécifique au bois.</li>
<li><strong>Dégagez les rails de coulissement</strong> de vos portes-patio et fenêtres coulissantes. L'accumulation de saleté, de sable de déglaçage et de débris est la cause principale de blocage.</li>
<li><strong>Nettoyez les trous de drainage</strong> au bas des cadres avec un petit fil métallique ou un cure-pipe. Ces trous permettent à l'eau de s'écouler et leur obstruction cause des infiltrations.</li>
</ul>

<h3>Inspection post-hiver</h3>

<ul>
<li>Vérifiez l'état du <a href="/glossaire/calfeutrage">calfeutrage</a> extérieur. L'hiver peut avoir causé des fissures ou des décollements.</li>
<li>Inspectez les <a href="/glossaire/coupe-froid">coupe-froid</a> pour détecter l'usure, l'écrasement ou le déchirement.</li>
<li>Examinez les unités scellées pour tout signe de <a href="/glossaire/buee-entre-vitres">buée entre les vitres</a>.</li>
<li>Testez le fonctionnement de toutes les poignées, serrures et mécanismes d'ouverture.</li>
</ul>

<h2>Été (juin-août) : lubrification et protection</h2>

<h3>Lubrification des mécanismes</h3>

<p>L'été est le moment idéal pour lubrifier toute la <strong>quincaillerie</strong> de vos portes et fenêtres :</p>

<ul>
<li><strong>Charnières et pivots</strong> : appliquez quelques gouttes de lubrifiant silicone (jamais de WD-40 qui attire la poussière).</li>
<li><strong>Mécanismes de verrouillage</strong> : lubrifiez les serrures avec un lubrifiant graphite sec.</li>
<li><strong>Rails de coulissement</strong> : nettoyez puis appliquez un lubrifiant silicone en spray sur les rails de vos <a href="/services/reparation-portes-bois">portes-patio</a> et fenêtres coulissantes.</li>
<li><strong>Crémones et compas</strong> : lubrifiez les points d'articulation des fenêtres oscillo-battantes.</li>
</ul>

<h3>Vérification des moustiquaires</h3>

<p>Inspectez vos <a href="/services/moustiquaires-sur-mesure">moustiquaires</a> : toile déchirée, cadre tordu, système de rétention défectueux. Une moustiquaire endommagée ne protège pas seulement contre les insectes — elle contribue aussi à la ventilation naturelle de votre maison en été.</p>

<h3>Protection contre les UV</h3>

<p>Si vous avez des cadres en bois, vérifiez l'état du vernis ou de la peinture. Les UV intenses de l'été québécois dégradent rapidement les finitions. Un rafraîchissement de la protection au début de l'été prolongera la vie de vos cadres de plusieurs années.</p>

<h2>Automne (septembre-octobre) : préparation hivernale</h2>

<h3>Calfeutrage et étanchéité</h3>

<p>L'automne est le moment <strong>critique</strong> pour l'étanchéité :</p>

<ul>
<li><strong>Inspectez tout le <a href="/services/calfeutrage">calfeutrage</a></strong> autour de chaque porte et fenêtre. Remplacez immédiatement tout joint fissuré, décollé ou manquant.</li>
<li><strong>Remplacez les <a href="/services/coupe-froid">coupe-froid</a> usés</strong>. Un coupe-froid en mauvais état peut augmenter vos pertes de chaleur de 10% à 25%.</li>
<li><strong>Vérifiez le seuil des portes</strong> extérieures. L'espace entre le seuil et le bas de la porte ne devrait pas laisser passer la lumière du jour.</li>
</ul>

<h3>Remplacement préventif des thermos défaillants</h3>

<p>Si vous avez repéré des <a href="/glossaire/unite-scellee">unités scellées</a> montrant des signes de buée ou de perte d'isolation, <strong>n'attendez pas l'hiver</strong> pour les remplacer. Le <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a> se fait idéalement en automne, quand les températures sont encore clémentes et les délais de fabrication plus courts.</p>

<h3>Conversion saisonnière</h3>

<ul>
<li>Retirez les moustiquaires des fenêtres fixes et rangez-les proprement.</li>
<li>Installez les contre-fenêtres si votre maison en est équipée.</li>
<li>Vérifiez que toutes les fenêtres se ferment et se verrouillent correctement.</li>
</ul>

<h2>Hiver (novembre-mars) : surveillance et gestion de l'humidité</h2>

<h3>Gestion de la condensation</h3>

<p>La <a href="/blog/fenetre-embuee-causes-solutions-prevention">condensation sur les fenêtres</a> est le problème numéro un en hiver :</p>

<ul>
<li><strong>Maintenez l'humidité relative</strong> entre 30% et 40% quand la température extérieure descend sous -10°C.</li>
<li><strong>Utilisez un hygromètre</strong> pour surveiller le taux d'humidité dans votre maison.</li>
<li><strong>Faites fonctionner les ventilateurs de salle de bain et la hotte de cuisine</strong> systématiquement pour évacuer l'humidité excédentaire.</li>
<li><strong>Dégagez les bouches de chaleur</strong> situées sous les fenêtres pour permettre la circulation d'air chaud le long des vitres.</li>
</ul>

<h3>Surveillance de la glace</h3>

<ul>
<li>Ne grattez <strong>jamais</strong> la glace sur les vitres avec un outil métallique — vous risquez de rayer le verre ou d'endommager le revêtement Low-E.</li>
<li>Si de la glace se forme entre les vitres, c'est un signe que le thermos est défaillant et doit être remplacé.</li>
<li>Surveillez l'accumulation de glace sur les seuils de portes et dégagez-la régulièrement pour éviter les dommages au coupe-froid.</li>
</ul>

<h2>Liste de contrôle annuelle téléchargeable</h2>

<p>Pour vous faciliter la tâche, voici les <strong>5 gestes essentiels</strong> à poser chaque année :</p>

<ul>
<li><strong>1. Nettoyer</strong> les vitres, cadres, rails et trous de drainage (printemps).</li>
<li><strong>2. Lubrifier</strong> toute la quincaillerie (été).</li>
<li><strong>3. Calfeutrer</strong> et remplacer les coupe-froid (automne).</li>
<li><strong>4. Inspecter</strong> les thermos pour détecter la buée (printemps et automne).</li>
<li><strong>5. Contrôler</strong> l'humidité et la condensation (hiver).</li>
</ul>

<p>En suivant ce calendrier d'entretien, vous prolongerez la durée de vie de vos portes et fenêtres de plusieurs années et éviterez des réparations coûteuses. Si vous constatez un problème lors de vos inspections, <strong>Vosthermos</strong> offre une gamme complète de services : du <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a> au <a href="/services/calfeutrage">calfeutrage professionnel</a>. Consultez nos <a href="/prix">tarifs</a> ou visitez notre <a href="/boutique">boutique</a> pour voir nos produits.</p>
`
  },

  // ─── Article 3 ─────────────────────────────────────────────────────────────
  {
    title: 'Les 7 erreurs à éviter lors du remplacement de thermos',
    slug: 'erreurs-a-eviter-remplacement-thermos',
    excerpt: 'Évitez les erreurs coûteuses lors du remplacement de vos vitres thermos. Découvrez les 7 pièges les plus courants et comment les contourner pour un résultat durable.',
    category: 'conseils',
    tags: ['remplacement', 'thermos', 'erreurs', 'conseils', 'installation'],
    publishedAt: new Date('2026-04-17T10:00:00Z'),
    content: `
<h2>Remplacement de thermos : les erreurs qui coûtent cher</h2>

<p>Le <a href="/services/remplacement-vitre-thermos">remplacement d'une vitre thermos</a> est un travail qui semble simple en apparence, mais qui recèle plusieurs pièges pour les non-initiés. Une erreur lors de la prise de mesures, du choix du produit ou de l'installation peut transformer un investissement judicieux en source de problèmes récurrents. Voici les <strong>7 erreurs les plus courantes</strong> et comment les éviter.</p>

<h2>Erreur #1 : Prendre les mauvaises mesures</h2>

<p>C'est l'erreur la plus fréquente et la plus coûteuse. Une vitre thermos fabriquée sur mesure qui ne correspond pas aux dimensions exactes de votre ouverture est <strong>inutilisable</strong>.</p>

<h3>Ce qu'il faut faire</h3>

<ul>
<li>Mesurez la <strong>largeur et la hauteur du vitrage</strong>, pas du cadre complet.</li>
<li>Prenez les mesures à <strong>trois endroits</strong> (haut, milieu, bas pour la largeur; gauche, centre, droite pour la hauteur) et gardez la plus petite mesure.</li>
<li>Mesurez l'<strong>épaisseur totale de l'unité scellée</strong> existante, incluant l'espace d'air.</li>
<li>Notez le type de <a href="/glossaire/intercalaire">intercalaire</a> (spacer) et sa largeur.</li>
</ul>

<p>En cas de doute, faites appel à un professionnel. Chez Vosthermos, la prise de mesures est incluse dans nos services.</p>

<h2>Erreur #2 : Choisir le thermos le moins cher sans vérifier les spécifications</h2>

<p>Tous les thermos ne sont pas égaux. Un prix anormalement bas cache souvent des compromis sur la qualité :</p>

<ul>
<li><strong>Absence de gaz argon</strong> : les unités remplies d'air sec sont moins isolantes.</li>
<li><strong>Pas de revêtement Low-E</strong> : les pertes de chaleur seront nettement supérieures.</li>
<li><strong>Scellant simple</strong> au lieu du double scellant standard de l'industrie.</li>
<li><strong>Pas de certification IGMAC</strong> : aucune garantie de conformité aux normes canadiennes.</li>
</ul>

<p>L'économie initiale se transforme souvent en dépense double lorsque le thermos bas de gamme doit être remplacé après seulement 5 à 8 ans. Consultez notre article sur les <a href="/blog/vitre-thermos-liquidation-bonne-mauvaise-idee">vitres thermos en liquidation</a> pour en savoir plus.</p>

<h2>Erreur #3 : Ignorer l'état du cadre</h2>

<p>Remplacer un thermos dans un cadre pourri ou déformé est une perte d'argent. Avant le remplacement, vérifiez :</p>

<ul>
<li><strong>Le bois</strong> : présence de pourriture, de moisissure ou de dommages causés par les insectes.</li>
<li><strong>L'aluminium ou le vinyle</strong> : déformation, fissures, décoloration excessive.</li>
<li><strong>Le drainage</strong> : les trous de drainage doivent être dégagés et fonctionnels.</li>
<li><strong>L'aplomb</strong> : un cadre qui n'est plus d'aplomb mettra une pression inégale sur le nouveau thermos.</li>
</ul>

<p>Si le cadre est endommagé, il vaut mieux le <a href="/services/reparation-portes-bois">réparer ou le remplacer</a> en même temps que le thermos.</p>

<h2>Erreur #4 : Oublier de vérifier le type de vitrage requis par le code</h2>

<p>Le <strong>Code national du bâtiment du Canada</strong> et le Code de construction du Québec imposent du <strong>verre trempé ou feuilleté</strong> dans certaines situations :</p>

<ul>
<li>Fenêtres dont le bas se trouve à moins de <strong>450 mm du plancher</strong>.</li>
<li>Portes et fenêtres adjacentes aux portes (dans un rayon de 300 mm).</li>
<li>Cabines de douche et salles de bain.</li>
<li>Fenêtres au-dessus d'escaliers ou d'une dénivellation.</li>
</ul>

<p>Installer du verre non trempé là où le code l'exige pose un <strong>risque de sécurité</strong> et peut compliquer la revente de votre propriété.</p>

<h2>Erreur #5 : Mal installer les cales de support</h2>

<p>Les <strong>cales (setting blocks)</strong> sont les petits blocs de plastique ou de caoutchouc qui supportent le poids du thermos dans le cadre. Une installation incorrecte entraîne :</p>

<ul>
<li><strong>Une pression inégale</strong> sur le scellant qui accélère sa dégradation.</li>
<li><strong>Un affaissement du thermos</strong> qui bloque les mécanismes de la fenêtre.</li>
<li><strong>Des points de contact verre-métal</strong> qui peuvent provoquer une fracture thermique.</li>
</ul>

<p>Les cales doivent être positionnées au quart de la largeur à partir de chaque coin, et jamais directement dans les coins.</p>

<h2>Erreur #6 : Négliger le scellement et le <a href="/glossaire/calfeutrage">calfeutrage</a></h2>

<p>Le nouveau thermos est installé, mais si le joint entre le verre et le cadre n'est pas correctement scellé, l'humidité s'infiltrera et causera :</p>

<ul>
<li>De la <strong>condensation prématurée</strong> entre les vitres.</li>
<li>De la <strong>moisissure</strong> dans le cadre.</li>
<li>Une <strong>perte d'isolation</strong> autour du thermos.</li>
</ul>

<p>Utilisez un mastic de <a href="/services/calfeutrage">calfeutrage</a> de qualité, compatible avec le type de cadre et le type de verre. Le calfeutrage intérieur et extérieur sont tous deux nécessaires.</p>

<h2>Erreur #7 : Tenter un remplacement par temps extrême</h2>

<p>Remplacer un thermos par -20°C en janvier ou par 40°C au soleil en plein été est une mauvaise idée :</p>

<ul>
<li><strong>Par grand froid</strong> : les mastics de scellement ne durcissent pas correctement sous 5°C. Le verre froid qui entre en contact avec l'air chaud intérieur subit un choc thermique.</li>
<li><strong>Par grande chaleur</strong> : le verre dilaté peut se briser lors de la manipulation, et les scellants sèchent trop vite pour permettre un positionnement précis.</li>
</ul>

<p>La <strong>température idéale</strong> pour un remplacement de thermos se situe entre 10°C et 25°C — soit au printemps ou à l'automne au Québec.</p>

<h2>La solution : faire appel à des professionnels</h2>

<p>Le remplacement d'une vitre thermos est un travail de précision qui demande de l'expérience et les bons outils. Chez <strong>Vosthermos</strong>, nos techniciens qualifiés connaissent ces erreurs et savent les éviter. Chaque installation est réalisée selon les normes de l'industrie, avec des produits certifiés et une garantie complète.</p>

<p>Consultez nos <a href="/prix">prix transparents</a> pour le remplacement de thermos ou visitez notre <a href="/boutique">boutique en ligne</a> pour découvrir nos unités scellées. Demandez votre soumission gratuite dès aujourd'hui.</p>
`
  },

  // ─── Article 4 ─────────────────────────────────────────────────────────────
  {
    title: 'Porte-patio qui coince : causes et solutions complètes',
    slug: 'porte-patio-coince-causes-solutions',
    excerpt: 'Votre porte-patio est difficile à ouvrir ou coince? Découvrez les causes principales et les solutions pour retrouver un coulissement fluide, étape par étape.',
    category: 'conseils',
    tags: ['porte-patio', 'réparation', 'coulissement', 'roulettes', 'quincaillerie'],
    publishedAt: new Date('2026-04-24T10:00:00Z'),
    content: `
<h2>Pourquoi votre porte-patio coince : les causes fréquentes</h2>

<p>Une <strong>porte-patio qui coince</strong> ou qui est difficile à ouvrir est l'un des problèmes domestiques les plus frustrants — et l'un des plus courants au Québec. Avec les cycles de gel-dégel, les variations d'humidité et l'usure normale, les portes coulissantes finissent toutes par présenter des problèmes de fonctionnement. La bonne nouvelle : dans la majorité des cas, le problème peut être résolu sans remplacer la porte complète.</p>

<h2>Cause #1 : Un rail encrassé ou endommagé</h2>

<p>Le rail de coulissement au sol est la cause la plus fréquente de blocage. Au fil du temps, il accumule :</p>

<ul>
<li><strong>Saleté et débris</strong> : poussière, sable (surtout le sable de déglaçage entré avec les bottes en hiver), poils d'animaux, miettes.</li>
<li><strong>Résidus de lubrifiants anciens</strong> : les vieux lubrifiants deviennent collants et emprisonnent la saleté.</li>
<li><strong>Déformation du rail</strong> : un objet lourd tombé sur le rail ou un ajustement de la fondation peut le déformer.</li>
</ul>

<h3>Solution</h3>

<p>Aspirez soigneusement le rail, puis nettoyez-le avec de l'eau chaude savonneuse et une vieille brosse à dents. Une fois sec, appliquez un <strong>lubrifiant à base de silicone</strong> (jamais de WD-40 ni d'huile végétale). Si le rail est déformé, il peut souvent être redressé avec une pince et un bloc de bois, mais un rail gravement endommagé devra être remplacé.</p>

<h2>Cause #2 : Des roulettes usées ou brisées</h2>

<p>Les <strong>roulettes</strong> (ou galets) sont les petites roues fixées au bas de la porte qui permettent le coulissement. Après 10 à 15 ans d'utilisation, elles s'usent, se fissurent ou se bloquent.</p>

<h3>Signes d'usure des roulettes</h3>

<ul>
<li>La porte <strong>grince ou gratte</strong> contre le rail.</li>
<li>Elle ne reste plus alignée et <strong>frotte contre le cadre</strong> d'un côté.</li>
<li>Il faut la <strong>soulever légèrement</strong> pour la faire coulisser.</li>
<li>Elle se <strong>décroche</strong> de son rail.</li>
</ul>

<h3>Solution</h3>

<p>Les roulettes sont des pièces remplaçables. Notre service de <a href="/services/remplacement-quincaillerie">remplacement de quincaillerie</a> inclut les roulettes pour tous les modèles de portes-patio. Le remplacement nécessite de retirer la porte de son cadre — un travail de deux personnes — et de visser les nouvelles roulettes. L'ajustement se fait ensuite avec la vis de réglage en hauteur accessible par le côté de la porte.</p>

<h2>Cause #3 : Un mauvais ajustement en hauteur</h2>

<p>Les portes-patio ont des <strong>vis de réglage</strong> accessibles par le bas ou le côté qui permettent d'ajuster la hauteur de la porte par rapport au rail. Un mauvais ajustement cause :</p>

<ul>
<li><strong>Porte trop basse</strong> : elle frotte sur le rail et est difficile à déplacer.</li>
<li><strong>Porte trop haute</strong> : elle ne s'engage pas correctement dans le rail supérieur et peut sortir de sa trajectoire.</li>
</ul>

<h3>Solution</h3>

<p>Repérez les <strong>trous de réglage</strong> au bas de la porte (souvent couverts par un petit capuchon en plastique). Avec un tournevis cruciforme ou un tournevis à douille de 4 mm, tournez la vis :</p>

<ul>
<li><strong>Dans le sens horaire</strong> pour monter la porte.</li>
<li><strong>Dans le sens antihoraire</strong> pour la descendre.</li>
</ul>

<p>Ajustez par petits incréments (quart de tour) et testez le coulissement après chaque ajustement. La porte doit coulisser librement tout en restant bien engagée dans les rails.</p>

<h2>Cause #4 : Le cadre est déformé ou hors d'aplomb</h2>

<p>La structure de votre maison bouge avec le temps. Le tassement de la fondation, le gonflement saisonnier du bois et les mouvements structurels peuvent <strong>déformer le cadre</strong> de la porte-patio.</p>

<h3>Signes de déformation</h3>

<ul>
<li>L'espace entre la porte et le cadre est <strong>inégal</strong> (plus large en haut qu'en bas, ou l'inverse).</li>
<li>La porte coince davantage à <strong>certains moments de l'année</strong> (souvent au printemps quand le sol dégèle).</li>
<li>Le verrouillage est <strong>difficile</strong> car le loquet ne s'aligne plus avec la gâche.</li>
</ul>

<h3>Solution</h3>

<p>Un réajustement du cadre peut résoudre les cas légers. Pour les déformations importantes, il peut être nécessaire de recaler le cadre ou d'ajuster la gâche de serrure. Si la déformation est causée par un problème de fondation, il faut d'abord régler la cause structurelle.</p>

<h2>Cause #5 : Un coupe-froid qui obstrue le mouvement</h2>

<p>Les <a href="/services/coupe-froid">coupe-froid</a> neufs ou mal installés peuvent créer trop de friction et empêcher le mouvement fluide de la porte. Inversement, un coupe-froid usé laisse la porte <strong>flotter</strong> dans son cadre, ce qui cause du jeu et des claquements.</p>

<h3>Solution</h3>

<p>Vérifiez que le coupe-froid est de la bonne épaisseur et correctement positionné. Il doit créer un contact ferme mais sans résistance excessive. Le remplacement des coupe-froid est un entretien simple qui améliore à la fois le coulissement et l'isolation.</p>

<h2>Quand appeler un professionnel?</h2>

<p>Faites appel à un spécialiste si :</p>

<ul>
<li>La porte est <strong>trop lourde</strong> pour être retirée de manière sécuritaire (les portes-patio en verre trempé pèsent entre 35 et 80 kg).</li>
<li>Le verre du thermos est <strong>embué ou fissuré</strong> — un <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a> est alors nécessaire.</li>
<li>Le cadre est <strong>gravement endommagé</strong> ou pourri.</li>
<li>Vous ne trouvez pas les <strong>pièces de remplacement</strong> compatibles.</li>
</ul>

<p>Chez <strong>Vosthermos</strong>, nous réparons et remplaçons les composants de portes-patio de toutes marques. De la simple roulette au remplacement complet du thermos, nous avons la solution. Visitez notre <a href="/boutique">boutique</a> pour voir nos pièces de quincaillerie ou consultez nos <a href="/prix">prix</a> pour une soumission.</p>
`
  },

  // ─── Article 5 ─────────────────────────────────────────────────────────────
  {
    title: 'Comment ajuster une fenêtre à guillotine qui ne reste pas ouverte',
    slug: 'fenetre-guillotine-ne-reste-pas-ouverte-ajustement',
    excerpt: 'Votre fenêtre à guillotine retombe dès que vous la lâchez? Découvrez les causes du problème et les étapes pour ajuster ou réparer les balanciers et mécanismes.',
    category: 'conseils',
    tags: ['fenêtre à guillotine', 'balancier', 'réparation', 'ajustement', 'quincaillerie'],
    publishedAt: new Date('2026-05-01T10:00:00Z'),
    content: `
<h2>Fenêtre à guillotine qui ne tient pas ouverte : un problème courant</h2>

<p>Les <strong>fenêtres à guillotine</strong> (aussi appelées fenêtres à coulisse verticale) sont parmi les plus populaires dans les maisons québécoises, particulièrement dans les constructions d'avant 2000. Leur mécanisme de contrepoids permet normalement de maintenir le panneau mobile en position ouverte. Quand ce mécanisme fait défaut, la fenêtre retombe dès qu'on la lâche — un problème aussi agaçant que dangereux, surtout avec des enfants à la maison.</p>

<h2>Comment fonctionne le système de contrepoids</h2>

<h3>Les anciens systèmes à corde et poids</h3>

<p>Les fenêtres à guillotine traditionnelles (maisons d'avant 1970) utilisent des <strong>poids en fonte</strong> cachés dans les montants du cadre, reliés au panneau mobile par des cordes. Quand la corde casse ou le poids se détache, le panneau n'est plus soutenu.</p>

<h3>Les systèmes à balanciers modernes</h3>

<p>Les fenêtres plus récentes utilisent des <strong>balanciers à ressort</strong> (aussi appelés <em>block-and-tackle balances</em> ou <em>spiral balances</em>). Ces mécanismes compacts remplacent les anciens poids et fonctionnent grâce à un ressort hélicoïdal sous tension. Avec le temps, le ressort perd de sa force et ne peut plus soutenir le poids du panneau.</p>

<h2>Diagnostic : identifier la cause du problème</h2>

<h3>Étape 1 : Identifier le type de mécanisme</h3>

<p>Ouvrez la fenêtre et observez les côtés du cadre :</p>

<ul>
<li><strong>Cordes visibles</strong> dans des rainures latérales → système à poids et cordes.</li>
<li><strong>Tube métallique ou tube en plastique</strong> dans un rail latéral → balancier à spirale.</li>
<li><strong>Boîtier rectangulaire</strong> avec une corde ou un ruban → balancier block-and-tackle.</li>
<li><strong>Rails à friction</strong> sans mécanisme visible → système à friction (fenêtres bas de gamme).</li>
</ul>

<h3>Étape 2 : Tester le mécanisme</h3>

<ul>
<li>Soulevez le panneau à mi-hauteur et relâchez-le. S'il descend <strong>lentement</strong>, le balancier est faible mais fonctionnel — un ajustement peut suffire.</li>
<li>Si le panneau <strong>tombe brusquement</strong>, le mécanisme est brisé ou complètement détendu.</li>
<li>Si le panneau est <strong>difficile à monter</strong> puis retombe, les rails de friction sont peut-être encrassés ou tordus.</li>
</ul>

<h2>Solutions selon le type de mécanisme</h2>

<h3>Système à poids et cordes</h3>

<p>Si la corde est cassée :</p>

<ul>
<li><strong>Retirez la moulure latérale</strong> (le couvre-joint du montant) pour accéder à la cavité où se trouve le poids.</li>
<li><strong>Récupérez le poids</strong> tombé au fond de la cavité.</li>
<li><strong>Remplacez la corde</strong> par un cordage en nylon tressé de calibre similaire. Évitez le coton qui pourrit.</li>
<li><strong>Rattachez le poids</strong> et remontez la moulure.</li>
</ul>

<p>Ce type de réparation est relativement simple mais demande de la patience et un accès aux cavités du cadre.</p>

<h3>Balancier à spirale</h3>

<p>Le <strong>balancier à spirale</strong> peut souvent être réajusté :</p>

<ul>
<li>Repérez la <strong>vis de tension</strong> au bas du tube de balancier.</li>
<li>Tournez cette vis dans le <strong>sens horaire</strong> pour augmenter la tension du ressort (3 à 5 tours devraient suffire).</li>
<li>Testez la fenêtre après chaque ajustement.</li>
<li>Si le ressort est cassé à l'intérieur du tube, le balancier complet doit être remplacé.</li>
</ul>

<h3>Balancier block-and-tackle</h3>

<p>Ce type de balancier se remplace en entier :</p>

<ul>
<li><strong>Retirez le panneau mobile</strong> en le basculant vers l'intérieur (la plupart des fenêtres modernes ont un mécanisme de basculement pour le nettoyage).</li>
<li><strong>Décrochez l'ancien balancier</strong> du rail et de l'attache au panneau.</li>
<li><strong>Installez le nouveau balancier</strong> de même longueur et même capacité de charge. La capacité doit correspondre au poids du panneau (généralement entre 4 et 15 kg).</li>
</ul>

<p>Notre <a href="/boutique">boutique en ligne</a> offre des balanciers compatibles avec les marques de fenêtres les plus courantes au Québec. Si vous n'êtes pas sûr du modèle, notre service de <a href="/services/remplacement-quincaillerie">remplacement de quincaillerie</a> peut identifier et fournir la pièce exacte.</p>

<h2>Solution temporaire : la tige de support</h2>

<p>En attendant la réparation, vous pouvez maintenir votre fenêtre ouverte avec :</p>

<ul>
<li>Un <strong>bâton ou une tige en bois</strong> coupé à la bonne longueur, coincé entre le panneau mobile et le cadre du bas.</li>
<li>Un <strong>blocage de fenêtre commercial</strong> (disponible en quincaillerie) qui se fixe sur le rail.</li>
</ul>

<p><strong>Attention</strong> : ces solutions temporaires ne remplacent pas une réparation. Un panneau non soutenu qui retombe peut causer des blessures graves, surtout pour les enfants.</p>

<h2>Quand remplacer la fenêtre complète?</h2>

<p>Le remplacement de la fenêtre entière se justifie quand :</p>

<ul>
<li>Le cadre est <strong>pourri ou gravement endommagé</strong>.</li>
<li>Le thermos montre des signes de <a href="/blog/fenetre-embuee-causes-solutions-prevention">buée entre les vitres</a> en plus du problème de balancier.</li>
<li>Les pièces de remplacement ne sont <strong>plus disponibles</strong> pour votre modèle de fenêtre.</li>
<li>La fenêtre a plus de <strong>25-30 ans</strong> et présente plusieurs problèmes simultanés.</li>
</ul>

<p>Dans tous les autres cas, la réparation du mécanisme de balancier est beaucoup plus économique. Chez <strong>Vosthermos</strong>, nous pouvons remplacer les balanciers, les <a href="/glossaire/coupe-froid">coupe-froid</a> et les <a href="/glossaire/unite-scellee">unités scellées</a> de vos fenêtres à guillotine, prolongeant leur durée de vie de plusieurs années. Consultez nos <a href="/prix">tarifs</a> pour une estimation.</p>
`
  },

  // ─── Article 6 ─────────────────────────────────────────────────────────────
  {
    title: 'Guide complet du calfeutrage de fenêtres au Québec',
    slug: 'guide-complet-calfeutrage-fenetres-quebec',
    excerpt: 'Tout savoir sur le calfeutrage de fenêtres au Québec : types de scellant, quand calfeutrer, techniques d\'application et erreurs courantes. Guide pratique étape par étape.',
    category: 'guides',
    tags: ['calfeutrage', 'fenêtres', 'scellant', 'étanchéité', 'isolation', 'guide'],
    publishedAt: new Date('2026-05-08T10:00:00Z'),
    content: `
<h2>Le calfeutrage : un geste simple qui fait une grande différence</h2>

<p>Le <a href="/services/calfeutrage">calfeutrage</a> est l'un des moyens les plus économiques et efficaces d'améliorer l'isolation de votre maison. Selon Ressources naturelles Canada, les <strong>fuites d'air autour des portes et fenêtres</strong> représentent jusqu'à 25% des pertes de chaleur d'une maison. Un calfeutrage adéquat peut réduire votre facture de chauffage de <strong>10% à 15%</strong> par année — et le matériel nécessaire coûte à peine quelques dollars par fenêtre.</p>

<h2>Quand faut-il calfeutrer?</h2>

<h3>Les signes qu'un recalfeutrage est nécessaire</h3>

<ul>
<li><strong>Joints fissurés ou craquelés</strong> : le scellant a perdu son élasticité et ne suit plus les mouvements de dilatation/contraction.</li>
<li><strong>Joints décollés</strong> : le scellant s'est détaché du cadre ou du mur, créant un espace ouvert.</li>
<li><strong>Courants d'air</strong> : vous sentez de l'air froid autour de vos fenêtres en hiver, même quand elles sont fermées.</li>
<li><strong>Condensation excessive</strong> : l'air humide extérieur qui s'infiltre par les joints déficients cause de la <a href="/blog/fenetre-embuee-causes-solutions-prevention">condensation sur les fenêtres</a>.</li>
<li><strong>Insectes ou poussière</strong> : des fourmis, araignées ou particules de poussière qui apparaissent autour des fenêtres indiquent des brèches dans l'étanchéité.</li>
</ul>

<h3>La meilleure saison pour calfeutrer</h3>

<p>Au Québec, la <strong>période idéale</strong> pour le calfeutrage extérieur est de la <strong>mi-mai à la mi-octobre</strong>, quand les températures sont supérieures à 5°C. La plupart des scellants nécessitent au moins 24 heures de temps sec et tempéré pour durcir correctement. Le calfeutrage intérieur peut être fait en toute saison puisque la température intérieure est contrôlée.</p>

<h2>Les types de scellant pour fenêtres</h2>

<h3>Scellant acrylique au latex</h3>

<ul>
<li><strong>Avantages</strong> : facile à appliquer, nettoyable à l'eau, peintunable, peu coûteux (3$ à 6$/tube).</li>
<li><strong>Inconvénients</strong> : peu flexible, se fissure en 3 à 5 ans au Québec, ne convient pas aux joints exposés à l'eau.</li>
<li><strong>Utilisation</strong> : joints intérieurs seulement (contour de moulures, finition).</li>
</ul>

<h3>Scellant silicone</h3>

<ul>
<li><strong>Avantages</strong> : extrêmement durable (20+ ans), très flexible, résistant aux UV et aux températures extrêmes, imperméable.</li>
<li><strong>Inconvénients</strong> : non peintunable, plus difficile à appliquer proprement, odeur forte à l'application.</li>
<li><strong>Utilisation</strong> : joints extérieurs exposés aux intempéries, verre-à-cadre.</li>
</ul>

<h3>Scellant polyuréthane</h3>

<ul>
<li><strong>Avantages</strong> : excellente adhérence, très durable (15 à 20 ans), peintunable, flexible.</li>
<li><strong>Inconvénients</strong> : plus cher (8$ à 15$/tube), nettoyage au solvant, sensible aux UV s'il n'est pas peint.</li>
<li><strong>Utilisation</strong> : le meilleur choix pour les joints extérieurs cadre-à-mur. C'est le scellant que les professionnels recommandent au Québec.</li>
</ul>

<h3>Scellant hybride (silicone modifié)</h3>

<ul>
<li><strong>Avantages</strong> : combine la flexibilité du silicone et la peinturabilité de l'acrylique, durable (15+ ans).</li>
<li><strong>Inconvénients</strong> : le plus cher (12$ à 18$/tube).</li>
<li><strong>Utilisation</strong> : polyvalent, intérieur et extérieur. Idéal quand l'apparence finale compte.</li>
</ul>

<h2>Technique de calfeutrage étape par étape</h2>

<h3>Préparation (la clé du succès)</h3>

<ul>
<li><strong>Retirez l'ancien scellant</strong> avec un couteau à mastic ou un outil de retrait de calfeutrage. Un décapant chimique peut faciliter le travail pour le silicone tenace.</li>
<li><strong>Nettoyez la surface</strong> à l'alcool à friction pour enlever toute trace de graisse, saleté ou ancien scellant. Le nouveau scellant n'adhérera pas sur une surface sale.</li>
<li><strong>Séchez complètement</strong> la surface. Toute humidité résiduelle empêchera une bonne adhésion.</li>
<li><strong>Appliquez un ruban de masquage</strong> de chaque côté du joint pour une finition nette et professionnelle.</li>
</ul>

<h3>Application</h3>

<ul>
<li><strong>Coupez l'embout</strong> du tube à un angle de 45° avec une ouverture d'environ 5 mm (ajustez selon la largeur du joint).</li>
<li><strong>Appliquez à vitesse constante</strong> en poussant le pistolet plutôt qu'en le tirant, pour forcer le scellant dans le joint.</li>
<li><strong>Lissez immédiatement</strong> avec un doigt mouillé d'eau savonneuse (pour le latex/polyuréthane) ou un outil de lissage trempé dans du liquide vaisselle.</li>
<li><strong>Retirez le ruban de masquage</strong> immédiatement après le lissage, pendant que le scellant est encore frais.</li>
</ul>

<h3>Séchage</h3>

<p>Respectez les temps de séchage du fabricant. En général :</p>

<ul>
<li><strong>Latex</strong> : 2 à 4 heures en surface, 24 heures pour le durcissement complet.</li>
<li><strong>Silicone</strong> : 30 minutes en surface, 24 à 48 heures pour le durcissement.</li>
<li><strong>Polyuréthane</strong> : 4 à 8 heures en surface, 3 à 7 jours pour le durcissement complet.</li>
</ul>

<h2>Les erreurs courantes à éviter</h2>

<ul>
<li><strong>Calfeutrer par-dessus l'ancien scellant</strong> : le nouveau joint n'adhérera pas correctement et se décollera rapidement.</li>
<li><strong>Utiliser le mauvais type de scellant</strong> : un scellant acrylique à l'extérieur ne durera pas un hiver québécois.</li>
<li><strong>Calfeutrer les trous de drainage</strong> : ces trous au bas du cadre de fenêtre sont essentiels pour l'évacuation de l'eau. Ne les bouchez jamais!</li>
<li><strong>Appliquer un cordon trop épais</strong> : un joint de 5 à 8 mm est optimal. Au-delà, le scellant n'adhère pas correctement au fond du joint et se fissure au centre.</li>
<li><strong>Calfeutrer par temps froid ou humide</strong> : le scellant ne durcira pas correctement et se décollera au premier cycle de gel-dégel.</li>
</ul>

<h2>Faire appel à un professionnel</h2>

<p>Le calfeutrage de quelques fenêtres est un projet de bricolage accessible. Mais pour une maison complète (15 à 25 fenêtres), le <a href="/services/calfeutrage">service de calfeutrage professionnel</a> de Vosthermos garantit un résultat impeccable avec les bons produits. Nous utilisons exclusivement des scellants polyuréthane et hybrides de qualité professionnelle, adaptés au climat québécois.</p>

<p>Combinez le calfeutrage avec le remplacement de vos <a href="/services/coupe-froid">coupe-froid</a> et le <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a> défaillants pour maximiser l'efficacité énergétique de votre maison. Consultez nos <a href="/prix">tarifs</a> ou visitez notre <a href="/boutique">boutique</a> pour les produits disponibles.</p>
`
  },

  // ─── Article 7 ─────────────────────────────────────────────────────────────
  {
    title: 'Pourquoi vos fenêtres font de la condensation et comment y remédier',
    slug: 'condensation-fenetres-causes-solutions-remedier',
    excerpt: 'Condensation sur vos fenêtres en hiver? Découvrez les causes de la buée intérieure, les risques pour votre santé et votre maison, et les solutions efficaces.',
    category: 'conseils',
    tags: ['condensation', 'fenêtres', 'humidité', 'buée', 'ventilation', 'moisissure'],
    publishedAt: new Date('2026-05-15T10:00:00Z'),
    content: `
<h2>Condensation sur les fenêtres : un problème de surface qui cache des enjeux profonds</h2>

<p>Chaque hiver, des milliers de propriétaires québécois font face au même phénomène : des <strong>gouttelettes d'eau</strong>, du <strong>givre</strong> ou même de la <strong>glace</strong> qui se forment sur la surface intérieure de leurs fenêtres. Cette condensation n'est pas qu'un désagrément esthétique — c'est le symptôme d'un déséquilibre dans votre maison qui peut mener à des problèmes sérieux de moisissure, de pourriture et de qualité de l'air.</p>

<p><strong>Important</strong> : il faut distinguer la condensation <strong>sur</strong> la surface intérieure de la vitre (traitable) de la buée <strong>entre</strong> les deux vitres d'un thermos (qui nécessite un <a href="/services/remplacement-vitre-thermos">remplacement de l'unité scellée</a>). Cet article traite du premier cas.</p>

<h2>Pourquoi la condensation se forme sur vos fenêtres</h2>

<h3>La science derrière le phénomène</h3>

<p>La condensation se produit quand l'air chaud et humide de votre maison entre en contact avec la <strong>surface froide</strong> de la vitre. L'air ne pouvant plus retenir autant d'humidité à température réduite, l'eau se dépose sous forme de gouttelettes. C'est exactement le même principe qu'un verre d'eau froide qui « sue » en été.</p>

<p>Le <strong>point de rosée</strong> est la température à laquelle l'air commence à libérer son humidité. Plus l'air est humide et plus la vitre est froide, plus la condensation apparaît facilement.</p>

<h3>Les sources d'humidité dans votre maison</h3>

<ul>
<li><strong>La respiration</strong> : une famille de 4 personnes produit environ 10 litres d'eau par jour juste en respirant.</li>
<li><strong>La cuisine</strong> : bouillir de l'eau, cuire à la vapeur, faire fonctionner le lave-vaisselle.</li>
<li><strong>La douche</strong> : chaque douche de 10 minutes libère environ 0.5 litre d'eau dans l'air.</li>
<li><strong>Le séchage du linge</strong> : surtout si vous faites sécher des vêtements à l'intérieur en hiver.</li>
<li><strong>Les plantes</strong> : de nombreuses plantes d'intérieur libèrent beaucoup d'humidité par transpiration.</li>
<li><strong>Un sous-sol humide</strong> : l'humidité remonte du sol et des murs de fondation.</li>
</ul>

<h2>Quand la condensation devient-elle un problème?</h2>

<h3>Les risques pour votre santé</h3>

<p>La condensation persistante crée un environnement idéal pour la <strong>moisissure</strong>. Les spores de moisissure en suspension dans l'air causent :</p>

<ul>
<li>Irritation des voies respiratoires et aggravation de l'asthme.</li>
<li>Réactions allergiques (éternuements, yeux qui piquent, congestion nasale).</li>
<li>Infections respiratoires chez les personnes vulnérables (enfants, aînés, immunodéprimés).</li>
</ul>

<h3>Les risques pour votre maison</h3>

<ul>
<li><strong>Pourriture des cadres en bois</strong> : l'eau qui coule des vitres imbibe les cadres et moulures.</li>
<li><strong>Dégradation du gypse et de la peinture</strong> : cloques, écaillage, taches d'humidité autour des fenêtres.</li>
<li><strong>Détérioration des <a href="/glossaire/coupe-froid">coupe-froid</a></strong> : l'humidité constante accélère leur dégradation.</li>
<li><strong>Dommages au plancher</strong> : l'eau qui s'écoule peut endommager les planchers de bois franc sous les fenêtres.</li>
</ul>

<h2>Les solutions efficaces</h2>

<h3>Solution #1 : Contrôler l'humidité intérieure</h3>

<p>Le taux d'humidité relative recommandé en hiver au Québec :</p>

<ul>
<li><strong>-20°C et moins</strong> : 25% à 30% d'humidité relative.</li>
<li><strong>-10°C à -20°C</strong> : 30% à 35%.</li>
<li><strong>0°C à -10°C</strong> : 35% à 40%.</li>
<li><strong>Au-dessus de 0°C</strong> : 40% à 45%.</li>
</ul>

<p>Investissez dans un <strong>hygromètre</strong> (15$ à 30$ en quincaillerie) et surveillez votre taux. Si nécessaire, réduisez les sources d'humidité ou utilisez un déshumidificateur.</p>

<h3>Solution #2 : Améliorer la ventilation</h3>

<ul>
<li><strong>Ventilateurs de salle de bain</strong> : faites-les fonctionner pendant la douche et 30 minutes après. Assurez-vous qu'ils sont raccordés à l'extérieur (et non au grenier).</li>
<li><strong>Hotte de cuisine</strong> : utilisez-la systématiquement lors de la cuisson, idéalement évacuée vers l'extérieur.</li>
<li><strong>Échangeur d'air (VRC)</strong> : un système de ventilation récupérateur de chaleur est la solution la plus efficace. Il renouvelle l'air de votre maison tout en conservant 70% à 85% de la chaleur.</li>
<li><strong>Ouvrez les fenêtres</strong> brièvement (5 à 10 minutes) même en hiver pour renouveler l'air — l'énergie perdue est minimale.</li>
</ul>

<h3>Solution #3 : Favoriser la circulation d'air près des fenêtres</h3>

<ul>
<li><strong>Dégagez les bouches de chaleur</strong> situées sous les fenêtres. Ne les bloquez pas avec des meubles, des rideaux ou des plinthes décoratives.</li>
<li><strong>Ouvrez les rideaux et stores</strong> pendant la journée pour permettre à l'air chaud de circuler le long des vitres.</li>
<li><strong>Un ventilateur de plafond</strong> réglé au minimum peut améliorer la circulation d'air dans les pièces problématiques.</li>
</ul>

<h3>Solution #4 : Améliorer la performance de vos fenêtres</h3>

<p>Si la condensation persiste malgré un contrôle adéquat de l'humidité et de la ventilation, vos fenêtres sont peut-être insuffisamment isolantes :</p>

<ul>
<li><strong>Remplacez les thermos défaillants</strong> : un thermos avec un scellant brisé ou du gaz argon épuisé offre une surface intérieure plus froide. Le <a href="/services/remplacement-vitre-thermos">remplacement du thermos</a> améliore significativement la température de la surface vitrée.</li>
<li><strong>Passez au double vitrage Low-E avec argon</strong> : si vos fenêtres ont encore du simple ou du double vitrage sans revêtement Low-E, la mise à niveau réduira dramatiquement la condensation. Lisez notre <a href="/blog/double-vs-triple-vitrage-comment-choisir">comparatif double vs triple vitrage</a> pour plus de détails.</li>
<li><strong>Améliorez le <a href="/services/calfeutrage">calfeutrage</a> et les <a href="/services/coupe-froid">coupe-froid</a></strong> : les infiltrations d'air froid refroidissent localement les surfaces et aggravent la condensation.</li>
</ul>

<h2>Condensation entre les vitres : un autre problème</h2>

<p>Si la buée ou les dépôts se trouvent <strong>entre les deux panneaux de verre</strong> et ne peuvent pas être essuyés, il ne s'agit pas d'un problème d'humidité intérieure. Le scellant de votre <a href="/glossaire/unite-scellee">unité scellée</a> est brisé. Dans ce cas, consultez notre article détaillé sur les <a href="/blog/fenetre-embuee-causes-solutions-prevention">fenêtres embuées</a> ou contactez-nous pour un <a href="/services/desembuage">diagnostic de désembuage</a>.</p>

<h2>Quand appeler Vosthermos</h2>

<p>Si la condensation cause des dégâts visibles ou si vos fenêtres présentent plusieurs symptômes (buée entre les vitres, courants d'air, givre intérieur), il est temps d'agir. Chez <strong>Vosthermos</strong>, nous offrons un diagnostic complet de vos fenêtres et proposons les solutions adaptées à votre situation : remplacement de thermos, calfeutrage, coupe-froid ou quincaillerie. Visitez notre <a href="/boutique">boutique</a> ou consultez nos <a href="/prix">prix</a>.</p>
`
  },

  // ─── Article 8 ─────────────────────────────────────────────────────────────
  {
    title: 'Combien de temps dure un remplacement de thermos? Le processus étape par étape',
    slug: 'processus-remplacement-thermos-etapes-duree',
    excerpt: 'Découvrez les étapes complètes d\'un remplacement de thermos, du diagnostic initial à l\'installation finale. Durée, processus et à quoi vous attendre.',
    category: 'guides',
    tags: ['remplacement', 'thermos', 'processus', 'installation', 'durée', 'étapes'],
    publishedAt: new Date('2026-05-22T10:00:00Z'),
    content: `
<h2>Le processus complet de remplacement d'un thermos</h2>

<p>Beaucoup de propriétaires hésitent à faire remplacer leurs <a href="/glossaire/unite-scellee">unités scellées</a> parce qu'ils ne savent pas à quoi s'attendre. Combien de temps ça prend? Est-ce que ma maison sera ouverte aux intempéries pendant les travaux? Faudra-t-il repeindre? Voici un guide complet du processus, de la première prise de contact à l'installation finale.</p>

<h2>Étape 1 : Le diagnostic et la prise de mesures (15 à 30 minutes)</h2>

<h3>L'évaluation initiale</h3>

<p>Un technicien se déplace chez vous pour <strong>évaluer l'état de vos fenêtres</strong>. Il vérifie :</p>

<ul>
<li>Le nombre et l'emplacement des thermos à remplacer.</li>
<li>L'état des cadres, de la <a href="/glossaire/quincaillerie">quincaillerie</a>, des <a href="/glossaire/coupe-froid">coupe-froid</a> et du <a href="/glossaire/calfeutrage">calfeutrage</a>.</li>
<li>Le type de verre requis (trempé, Low-E, teinté, etc.).</li>
<li>La présence d'intercalaires spéciaux ou de formes non standard.</li>
</ul>

<h3>La prise de mesures</h3>

<p>Chaque thermos est mesuré avec précision :</p>

<ul>
<li><strong>Largeur et hauteur</strong> du vitrage visible, mesurées à trois points différents.</li>
<li><strong>Épaisseur totale</strong> de l'unité scellée (important pour la compatibilité avec le cadre).</li>
<li><strong>Type et largeur de l'intercalaire</strong> existant.</li>
</ul>

<p>Les mesures sont enregistrées au millimètre près. C'est cette précision qui garantit un ajustement parfait du nouveau thermos.</p>

<h2>Étape 2 : La soumission et la commande (1 à 3 jours)</h2>

<p>Après la visite, vous recevez une <strong>soumission détaillée</strong> qui inclut :</p>

<ul>
<li>Le prix unitaire de chaque thermos (selon les dimensions et les options).</li>
<li>Les options disponibles : type de verre, revêtement Low-E, gaz argon, teinte.</li>
<li>Les travaux connexes recommandés (calfeutrage, coupe-froid, quincaillerie).</li>
<li>Le coût total incluant la main-d'oeuvre et les taxes.</li>
</ul>

<p>Consultez notre page <a href="/prix">prix</a> pour avoir un aperçu des tarifs avant même la visite. Une fois la soumission acceptée, la commande est passée au fabricant.</p>

<h2>Étape 3 : La fabrication (2 à 4 semaines)</h2>

<p>Vos unités scellées sont <strong>fabriquées sur mesure au Québec</strong>. Le délai de fabrication varie selon :</p>

<ul>
<li><strong>La période de l'année</strong> : l'automne est la saison la plus achalandée (tout le monde veut remplacer avant l'hiver). Au printemps et en été, les délais sont généralement plus courts.</li>
<li><strong>Le type de verre</strong> : les options spéciales (triple vitrage, verre trempé, formes non standard) peuvent allonger le délai.</li>
<li><strong>Le volume</strong> : une commande de 1 à 3 thermos passe généralement plus vite qu'une commande de 15+.</li>
</ul>

<p>En moyenne, comptez <strong>2 à 3 semaines</strong> pour les vitres thermos standard et <strong>3 à 4 semaines</strong> pour les commandes spéciales.</p>

<h2>Étape 4 : L'installation (20 à 45 minutes par thermos)</h2>

<h3>La préparation</h3>

<p>Le jour de l'installation, le technicien :</p>

<ul>
<li>Protège les planchers et les meubles autour de chaque fenêtre avec des toiles de protection.</li>
<li>Prépare ses outils et vérifie les nouvelles unités scellées une dernière fois.</li>
</ul>

<h3>Le retrait de l'ancien thermos</h3>

<ul>
<li>Les <strong>parcloses</strong> (moulures qui maintiennent le verre dans le cadre) sont délicatement retirées avec un outil spécial pour éviter de les endommager.</li>
<li>L'ancien thermos est extrait du cadre. S'il est brisé ou embué, il est manipulé avec soin pour éviter les éclats.</li>
<li>Le cadre est nettoyé : anciens scellants retirés, fond de feuillure nettoyé, trous de drainage vérifiés.</li>
</ul>

<h3>L'installation du nouveau thermos</h3>

<ul>
<li>Les <strong>cales de support</strong> sont positionnées correctement au fond du cadre (au quart de la largeur à partir de chaque coin).</li>
<li>Le nouveau thermos est inséré délicatement dans le cadre.</li>
<li>Un cordon de <strong>mastic d'étanchéité</strong> est appliqué entre le verre et le cadre.</li>
<li>Les parcloses sont replacées et fixées.</li>
<li>Le <a href="/services/calfeutrage">calfeutrage</a> extérieur est refait si nécessaire.</li>
</ul>

<h3>La vérification finale</h3>

<ul>
<li>Le technicien vérifie l'étanchéité, le bon fonctionnement de la fenêtre et l'apparence finale.</li>
<li>Il nettoie les vitres et la zone de travail.</li>
<li>Un rapport d'installation vous est remis avec les détails de la garantie.</li>
</ul>

<h2>Durée totale du processus</h2>

<p>Voici un résumé des délais typiques :</p>

<ul>
<li><strong>Visite diagnostic</strong> : 15 à 30 minutes (jour 1).</li>
<li><strong>Soumission</strong> : 1 à 3 jours ouvrables.</li>
<li><strong>Fabrication</strong> : 2 à 4 semaines.</li>
<li><strong>Installation</strong> : 20 à 45 minutes par thermos (jour de l'installation).</li>
</ul>

<p>Pour un projet typique de 3 à 5 thermos, le <strong>temps d'installation total</strong> est d'environ <strong>2 à 3 heures</strong>. Votre maison n'est jamais « ouverte » — chaque fenêtre est exposée pendant quelques minutes seulement lors de l'échange du verre.</p>

<h2>Questions fréquentes sur le processus</h2>

<h3>Est-ce que ça salit beaucoup?</h3>

<p>Non. Le remplacement de thermos est un travail propre. Il n'y a pas de poussière de construction ni de résidus importants. Le technicien nettoie au fur et à mesure.</p>

<h3>Faut-il être présent?</h3>

<p>Oui, idéalement. Le technicien a besoin d'accéder aux fenêtres de l'intérieur et peut avoir des questions ou des recommandations en cours de travail.</p>

<h3>Est-ce que l'hiver est un bon moment pour remplacer?</h3>

<p>C'est possible, mais pas idéal. Les scellants d'étanchéité performent mieux par temps tempéré (au-dessus de 5°C). Si c'est urgent, le remplacement peut se faire en hiver, mais le <a href="/services/calfeutrage">calfeutrage extérieur</a> devra être complété au printemps. Les meilleurs moments sont le printemps et l'automne.</p>

<h3>Combien ça coûte?</h3>

<p>Le coût dépend des dimensions, du type de verre et du nombre d'unités. Visitez notre page <a href="/prix">prix</a> pour une estimation détaillée ou consultez notre <a href="/boutique">boutique</a> pour voir les produits disponibles. En général, le remplacement du thermos coûte <strong>30% à 50% du prix d'une fenêtre neuve</strong> — une économie significative.</p>

<p>Prêt à lancer votre projet? Contactez <strong>Vosthermos</strong> pour planifier votre visite diagnostic gratuite. Nous desservons Montréal, Laval, la Rive-Sud et les environs.</p>
`
  },

  // ─── Article 9 ─────────────────────────────────────────────────────────────
  {
    title: 'Les meilleurs types de quincaillerie pour portes-patio en 2026',
    slug: 'meilleure-quincaillerie-porte-patio-2026',
    excerpt: 'Guide complet de la quincaillerie de porte-patio en 2026 : roulettes, serrures, poignées et mécanismes. Comment choisir les meilleures pièces pour votre porte coulissante.',
    category: 'guides',
    tags: ['quincaillerie', 'porte-patio', 'roulettes', 'serrures', 'poignées', '2026'],
    publishedAt: new Date('2026-05-29T10:00:00Z'),
    content: `
<h2>La quincaillerie de porte-patio : un guide pour 2026</h2>

<p>La <a href="/glossaire/quincaillerie">quincaillerie</a> est le coeur mécanique de votre porte-patio. Des roulettes au mécanisme de verrouillage, chaque composant joue un rôle crucial dans le fonctionnement quotidien, la sécurité et l'étanchéité de votre porte coulissante. En 2026, les options se sont multipliées et la qualité varie énormément d'un fabricant à l'autre. Voici notre guide pour choisir les bonnes pièces.</p>

<h2>Les roulettes : le composant le plus critique</h2>

<h3>Types de roulettes disponibles</h3>

<ul>
<li><strong>Roulettes en nylon</strong> : les plus courantes sur les portes d'entrée de gamme. Légères et silencieuses, elles conviennent pour les portes légères (moins de 40 kg). Durée de vie : 8 à 12 ans.</li>
<li><strong>Roulettes à roulement à billes en acier</strong> : la référence pour les portes-patio standard. Elles supportent des charges de 40 à 80 kg par roulette et offrent un coulissement très fluide. Durée de vie : 15 à 20 ans.</li>
<li><strong>Roulettes en acier inoxydable</strong> : indispensables en zone côtière ou pour les portes exposées à l'humidité. Résistantes à la corrosion, elles sont idéales pour les portes-patio donnant sur une piscine ou un spa.</li>
<li><strong>Roulettes tandem</strong> : composées de deux roues parallèles, elles répartissent mieux le poids des portes lourdes (80 kg+). Recommandées pour les portes en verre trempé épais ou le triple vitrage.</li>
</ul>

<h3>Comment choisir la bonne roulette</h3>

<ul>
<li><strong>Pesez votre porte</strong> ou consultez les spécifications du fabricant. Choisissez des roulettes dont la capacité de charge dépasse le poids de votre porte d'au moins 30%.</li>
<li><strong>Identifiez le type de montage</strong> : les roulettes à insert, à vis ou à clip ne sont pas interchangeables. Prenez une photo de vos roulettes actuelles avant d'acheter.</li>
<li><strong>Vérifiez le diamètre de la roue</strong> : il doit correspondre exactement à l'original pour maintenir le bon espacement entre la porte et le rail.</li>
</ul>

<h2>Les systèmes de verrouillage</h2>

<h3>Serrure à crochet (hook lock)</h3>

<p>Le système le plus répandu sur les portes-patio coulissantes. Un crochet métallique s'engage dans une gâche fixée au montant du cadre. En 2026, les modèles à <strong>double crochet</strong> offrent une sécurité nettement supérieure aux anciens modèles à crochet simple.</p>

<h3>Serrure multipoint</h3>

<p>Les portes-patio haut de gamme utilisent des serrures à <strong>2 ou 3 points de verrouillage</strong> qui s'engagent simultanément en haut, au centre et en bas du cadre. Ce système offre :</p>

<ul>
<li>Une <strong>sécurité maximale</strong> contre les tentatives d'effraction.</li>
<li>Un <strong>meilleur scellement</strong> de la porte contre le coupe-froid (pression uniforme sur toute la hauteur).</li>
<li>Une <strong>résistance accrue au vent</strong>.</li>
</ul>

<h3>Barre de sécurité et verrou auxiliaire</h3>

<p>En complément de la serrure principale, une <strong>barre de sécurité</strong> posée dans le rail ou un verrou à pied (foot lock) ajoute une couche de protection contre les intrusions. C'est un ajout simple et peu coûteux qui renforce considérablement la sécurité.</p>

<h2>Les poignées</h2>

<h3>Types de poignées</h3>

<ul>
<li><strong>Poignée à mortaise</strong> : encastrée dans l'épaisseur du montant de la porte. Modèle le plus courant, disponible en plusieurs styles et finitions.</li>
<li><strong>Poignée en surface</strong> : montée sur la face du montant. Plus facile à remplacer, mais moins élégante.</li>
<li><strong>Poignée avec serrure intégrée</strong> : combine la poignée et le mécanisme de verrouillage en une seule unité. Pratique mais plus coûteuse à remplacer.</li>
</ul>

<h3>Finitions populaires en 2026</h3>

<ul>
<li><strong>Noir mat</strong> : la tendance dominante en 2026, qui s'harmonise avec les cadres noirs de plus en plus populaires.</li>
<li><strong>Chrome brossé</strong> : un classique intemporel, facile à entretenir.</li>
<li><strong>Laiton satiné</strong> : en vogue pour les designs de style contemporain ou farmhouse.</li>
<li><strong>Blanc</strong> : le choix traditionnel pour les portes-patio en vinyle blanc.</li>
</ul>

<h2>Les guides et butoirs</h2>

<ul>
<li><strong>Guide de plancher</strong> : la pièce qui maintient le bas de la porte dans l'axe du rail. Un guide usé ou cassé laisse la porte osciller latéralement et rend le verrouillage difficile.</li>
<li><strong>Butoir anti-choc</strong> : absorbe l'impact quand la porte est ouverte trop vigoureusement. Protège le cadre et le verre des dommages.</li>
<li><strong>Guide anti-soulèvement</strong> : empêche la porte d'être soulevée hors de son rail — un élément de sécurité important contre les cambriolages.</li>
</ul>

<h2>Les moustiquaires coulissantes</h2>

<p>La <a href="/services/moustiquaires-sur-mesure">moustiquaire de porte-patio</a> est un élément de quincaillerie souvent négligé. En 2026, les options incluent :</p>

<ul>
<li><strong>Moustiquaire coulissante standard</strong> : cadre en aluminium avec toile en fibre de verre. Économique et efficace.</li>
<li><strong>Moustiquaire rétractable</strong> : se rétracte dans un boîtier latéral quand elle n'est pas utilisée. Idéale pour préserver la vue.</li>
<li><strong>Toile anti-UV</strong> : réduit le gain solaire de 30% à 50% tout en préservant la vue. Populaire pour les portes orientées sud et ouest.</li>
</ul>

<h2>Où trouver les bonnes pièces</h2>

<p>La difficulté principale avec la quincaillerie de porte-patio est de trouver des pièces <strong>compatibles avec votre modèle spécifique</strong>. Les quincailleries résidentielles offrent rarement un choix suffisant, et les grandes surfaces ne stockent que les modèles les plus courants.</p>

<p>Chez <strong>Vosthermos</strong>, notre <a href="/boutique">boutique en ligne</a> offre un vaste inventaire de pièces de quincaillerie pour portes-patio de toutes marques. Roulettes, serrures, poignées, guides — nous avons les pièces compatibles avec les marques les plus courantes au Québec. Notre service de <a href="/services/remplacement-quincaillerie">remplacement de quincaillerie</a> inclut l'identification de la pièce, la commande et l'installation professionnelle.</p>

<p>Consultez nos <a href="/prix">tarifs</a> ou envoyez-nous une photo de votre quincaillerie actuelle pour une identification rapide et une soumission gratuite.</p>
`
  },

  // ─── Article 10 ────────────────────────────────────────────────────────────
  {
    title: 'Isolation des fenêtres : guide pour réduire votre facture de chauffage',
    slug: 'isolation-fenetres-reduire-facture-chauffage',
    excerpt: 'Réduisez votre facture de chauffage en améliorant l\'isolation de vos fenêtres. Guide complet des solutions : thermos, calfeutrage, pellicules et plus encore.',
    category: 'guides',
    tags: ['isolation', 'fenêtres', 'chauffage', 'économie énergie', 'efficacité énergétique'],
    publishedAt: new Date('2026-06-05T10:00:00Z'),
    content: `
<h2>Vos fenêtres : le maillon faible de l'isolation de votre maison</h2>

<p>Les <strong>fenêtres et les portes</strong> représentent jusqu'à <strong>30% des pertes de chaleur</strong> d'une maison au Québec. Même dans une maison bien isolée (murs R-24, grenier R-60), les fenêtres offrent souvent une résistance thermique de seulement R-2 à R-4 — soit 6 à 12 fois moins que les murs. Améliorer l'isolation de vos fenêtres est donc l'un des investissements les plus rentables pour réduire votre facture de chauffage.</p>

<h2>Diagnostic : par où commencer?</h2>

<h3>Identifiez vos fenêtres problématiques</h3>

<p>Toutes les fenêtres ne sont pas également responsables des pertes de chaleur. Priorisez celles qui :</p>

<ul>
<li><strong>Montrent de la condensation ou du givre</strong> sur la face intérieure en hiver.</li>
<li><strong>Laissent passer des courants d'air</strong> (testez avec un bâtonnet d'encens le long des joints).</li>
<li><strong>Ont un thermos embué</strong> entre les vitres — signe que le scellant est brisé et l'isolation compromise.</li>
<li><strong>Sont orientées nord ou ouest</strong> — les plus exposées au froid et au vent dominant.</li>
<li><strong>Sont de grande dimension</strong> — plus la surface vitrée est grande, plus les pertes sont importantes.</li>
</ul>

<h3>Estimez vos pertes actuelles</h3>

<p>En moyenne, chaque fenêtre standard (3 x 4 pieds) avec un vieux thermos ou un simple double vitrage sans Low-E laisse échapper l'équivalent de <strong>40$ à 80$ de chauffage par hiver</strong>. Multipliez par le nombre de fenêtres problématiques pour estimer votre potentiel d'économie.</p>

<h2>Les solutions d'isolation par ordre d'efficacité et de coût</h2>

<h3>1. Remplacement des coupe-froid (5$ à 15$ par fenêtre)</h3>

<p>C'est la solution la plus <strong>économique et la plus rapide</strong>. Les <a href="/services/coupe-froid">coupe-froid</a> usés ou écrasés laissent passer des courants d'air qui représentent une part significative des pertes thermiques. Leur remplacement prend 15 à 30 minutes par fenêtre et peut réduire les infiltrations d'air de <strong>50% à 80%</strong>.</p>

<h3>2. Calfeutrage professionnel (8$ à 25$ par fenêtre)</h3>

<p>Le <a href="/services/calfeutrage">calfeutrage</a> comble les espaces entre le cadre de fenêtre et le mur. Un recalfeutrage complet avec un scellant polyuréthane de qualité peut réduire vos pertes de chaleur autour des fenêtres de <strong>10% à 15%</strong>. Consultez notre <a href="/blog/guide-complet-calfeutrage-fenetres-quebec">guide complet du calfeutrage</a> pour les détails.</p>

<h3>3. Pellicule thermorétractable pour fenêtres (3$ à 8$ par fenêtre)</h3>

<p>Cette solution économique consiste à appliquer un film plastique transparent sur le cadre intérieur de la fenêtre, créant une <strong>couche d'air isolante supplémentaire</strong>. Après rétraction au sèche-cheveux, la pellicule est pratiquement invisible. Elle peut améliorer l'isolation de R-1, réduisant la sensation de froid près des fenêtres. C'est une solution temporaire idéale pour les fenêtres qu'on ne prévoit pas remplacer immédiatement.</p>

<h3>4. Remplacement des thermos défaillants (80$ à 250$ par fenêtre)</h3>

<p>Le <a href="/services/remplacement-vitre-thermos">remplacement des unités scellées</a> défaillantes est l'intervention avec le meilleur retour sur investissement. Un thermos neuf avec <strong>revêtement Low-E et gaz argon</strong> offre une isolation nettement supérieure à un ancien thermos dont le scellant est brisé ou le gaz s'est échappé. L'économie annuelle par fenêtre peut atteindre <strong>40$ à 80$</strong>, avec un retour sur investissement de 3 à 5 ans.</p>

<h3>5. Pellicule Low-E appliquée (40$ à 80$ par fenêtre)</h3>

<p>Pour les fenêtres en bon état mais sans revêtement Low-E, une <strong>pellicule Low-E autocollante</strong> peut être appliquée sur la vitre intérieure. Elle réfléchit une partie de la chaleur radiante vers l'intérieur. L'amélioration est modeste (R-0.5 à R-1) mais significative sur un grand nombre de fenêtres.</p>

<h3>6. Habillage de fenêtres isolant (50$ à 200$ par fenêtre)</h3>

<p>Les <strong>stores cellulaires</strong> (aussi appelés stores alvéolaires ou « honeycomb ») emprisonnent l'air dans des cellules et créent une barrière isolante significative. Les modèles à double cellule offrent une amélioration de R-2 à R-4 quand ils sont fermés — soit un doublement de la performance isolante de la fenêtre. Ils sont particulièrement efficaces la nuit.</p>

<h3>7. Remplacement complet des fenêtres (500$ à 1 500$ par fenêtre)</h3>

<p>Quand les cadres sont endommagés ou les fenêtres très anciennes (simple vitrage, cadres en bois pourri), le remplacement complet est la seule solution. Les fenêtres modernes certifiées <strong>ENERGY STAR</strong> pour la zone climatique du Québec offrent des performances nettement supérieures. Combiné aux <a href="/blog/subventions-remplacement-fenetres-quebec-2026">subventions gouvernementales</a>, le coût net peut être considérablement réduit.</p>

<h2>Plan d'action recommandé</h2>

<p>Voici notre approche recommandée, du moins coûteux au plus coûteux :</p>

<ul>
<li><strong>Phase 1</strong> (immédiat, budget minimal) : Remplacez tous les coupe-froid usés et refaites le calfeutrage déficient. Budget : 200$ à 500$ pour une maison typique.</li>
<li><strong>Phase 2</strong> (court terme) : Remplacez les thermos défaillants (embués, brisés). Budget : 500$ à 2 500$ selon le nombre.</li>
<li><strong>Phase 3</strong> (moyen terme) : Installez des stores cellulaires et appliquez des pellicules pour les fenêtres sans Low-E. Budget : variable.</li>
<li><strong>Phase 4</strong> (long terme) : Remplacez les fenêtres complètes les plus anciennes et les moins performantes. Profitez des subventions.</li>
</ul>

<h2>Calculez vos économies potentielles</h2>

<p>Chez <strong>Vosthermos</strong>, nous offrons toutes les solutions des phases 1 et 2 : <a href="/services/coupe-froid">coupe-froid</a>, <a href="/services/calfeutrage">calfeutrage</a> et <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a>. Ces interventions combinées peuvent réduire vos pertes de chaleur par les fenêtres de <strong>40% à 60%</strong>, avec un retour sur investissement rapide.</p>

<p>Visitez notre <a href="/boutique">boutique</a> pour voir nos produits, consultez nos <a href="/prix">prix</a> pour une estimation ou contactez-nous pour une évaluation gratuite de l'isolation de vos fenêtres.</p>
`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK 2 — Seasonal/Predictive SEO Content: 4 articles saisonniers
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Article 11 ────────────────────────────────────────────────────────────
  {
    title: 'Préparez vos fenêtres pour l\'hiver : guide automnal complet',
    slug: 'preparer-fenetres-hiver-guide-automne',
    excerpt: 'Checklist complète pour préparer vos fenêtres avant l\'hiver québécois. Inspections, réparations et remplacements à faire en automne pour éviter les mauvaises surprises.',
    category: 'entretien',
    tags: ['hiver', 'automne', 'préparation', 'fenêtres', 'checklist', 'entretien saisonnier'],
    publishedAt: new Date('2026-06-12T10:00:00Z'),
    content: `
<h2>Pourquoi préparer vos fenêtres avant l'hiver est crucial au Québec</h2>

<p>L'hiver québécois met vos fenêtres à rude épreuve. Avec des températures qui plongent régulièrement sous les <strong>-25°C</strong> et des vents violents, chaque faille dans l'étanchéité de vos fenêtres se transforme en courant d'air glacial et en dollars perdus sur votre facture de chauffage. Le moment idéal pour agir est <strong>septembre et octobre</strong>, quand les températures sont encore assez clémentes pour les travaux extérieurs et que les professionnels ne sont pas encore submergés par la demande de dernière minute.</p>

<h2>La checklist complète de préparation hivernale</h2>

<h3>Inspection visuelle (30 minutes pour toute la maison)</h3>

<p>Faites le tour de chaque fenêtre et porte extérieure, à l'intérieur et à l'extérieur :</p>

<ul>
<li><strong>Calfeutrage extérieur</strong> : cherchez les fissures, les joints décollés, les espaces entre le cadre et le revêtement. Tout défaut doit être corrigé avant le gel. Consultez notre <a href="/blog/guide-complet-calfeutrage-fenetres-quebec">guide du calfeutrage</a> pour les techniques.</li>
<li><strong>Coupe-froid</strong> : fermez chaque fenêtre et vérifiez l'étanchéité. Passez un morceau de papier entre le cadre et le battant — si le papier glisse facilement, le <a href="/services/coupe-froid">coupe-froid</a> est usé et doit être remplacé.</li>
<li><strong>Thermos</strong> : repérez toute fenêtre qui montre de la <a href="/blog/fenetre-embuee-causes-solutions-prevention">buée ou des dépôts entre les vitres</a>. Un thermos défaillant avant l'hiver signifie des pertes de chaleur majeures pendant les 5 prochains mois.</li>
<li><strong>Verre fissuré</strong> : même une petite fissure peut devenir une fracture complète avec le gel. Faites remplacer le thermos avant l'hiver.</li>
<li><strong>Cadres</strong> : vérifiez l'état du bois (pourriture, gonflement), du vinyle (fissures, déformation) ou de l'aluminium (corrosion, bris).</li>
</ul>

<h3>Test d'étanchéité à l'air (15 minutes)</h3>

<p>Par une journée venteuse, ou en créant une dépression dans la maison (fermez toutes les fenêtres, allumez la hotte et les ventilateurs de salle de bain) :</p>

<ul>
<li>Passez la main ou un <strong>bâtonnet d'encens</strong> le long du périmètre de chaque fenêtre et porte.</li>
<li>Notez les endroits où vous sentez un courant d'air ou voyez la fumée dévier.</li>
<li>Portez une attention particulière aux coins inférieurs (les joints y cèdent en premier) et au seuil des portes extérieures.</li>
</ul>

<h3>Réparations prioritaires à faire en automne</h3>

<h3>Priorité 1 : Calfeutrage et coupe-froid</h3>

<p>Ces réparations sont les <strong>plus urgentes et les moins coûteuses</strong>. Refaire le <a href="/services/calfeutrage">calfeutrage</a> déficient et remplacer les <a href="/services/coupe-froid">coupe-froid</a> usés peut se faire en une journée pour une maison entière et coûte généralement moins de 500$. L'impact sur votre confort et votre facture est immédiat.</p>

<h3>Priorité 2 : Remplacement des thermos embués</h3>

<p>Les <a href="/glossaire/unite-scellee">unités scellées</a> qui montrent de la buée ont perdu leur <a href="/glossaire/gaz-argon">gaz argon</a> et leur capacité isolante. Le <a href="/services/remplacement-vitre-thermos">remplacement</a> doit se faire <strong>avant les grands froids</strong> — idéalement en septembre-octobre. Le délai de fabrication est de 2 à 3 semaines, donc planifiez tôt.</p>

<h3>Priorité 3 : Quincaillerie de porte-patio</h3>

<p>Une porte-patio qui <a href="/blog/porte-patio-coince-causes-solutions">ne ferme pas correctement</a> est une source majeure de perte de chaleur. Roulettes usées, serrure qui ne s'engage pas, guide de plancher brisé — toutes ces pièces de <a href="/services/remplacement-quincaillerie">quincaillerie</a> doivent être fonctionnelles avant l'hiver.</p>

<h2>Conversion saisonnière des fenêtres</h2>

<ul>
<li><strong>Retirez les moustiquaires</strong> des fenêtres fixes et rangez-les à l'intérieur. Les moustiquaires réduisent légèrement le gain solaire — en les retirant pour l'hiver, vous maximisez la chaleur gratuite du soleil.</li>
<li><strong>Installez les contre-fenêtres</strong> si votre maison en est équipée (surtout les maisons d'avant 1980).</li>
<li><strong>Posez une pellicule isolante</strong> thermorétractable sur les fenêtres les moins performantes. Consultez notre <a href="/blog/isolation-fenetres-reduire-facture-chauffage">guide d'isolation des fenêtres</a> pour les détails.</li>
</ul>

<h2>Les gestes à poser pendant l'hiver</h2>

<ul>
<li><strong>Contrôlez l'humidité</strong> : maintenez le taux d'humidité relative entre 25% et 35% quand la température extérieure est sous -10°C. Cela prévient la <a href="/blog/condensation-fenetres-causes-solutions-remedier">condensation excessive</a> et la formation de glace sur les fenêtres.</li>
<li><strong>Ne bloquez pas les bouches de chaleur</strong> situées sous les fenêtres — l'air chaud qui circule le long des vitres prévient la condensation.</li>
<li><strong>Ouvrez les rideaux le jour</strong> (surtout côté sud) pour profiter du gain solaire, et fermez-les la nuit pour ajouter une couche d'isolation.</li>
<li><strong>Ne grattez jamais la glace</strong> à l'intérieur de vos fenêtres avec un outil métallique. Utilisez un chiffon chaud et humide.</li>
</ul>

<h2>Le coût de l'inaction</h2>

<p>Reporter les réparations à « l'an prochain » coûte cher. Pour chaque fenêtre avec un thermos défaillant ou un calfeutrage manquant, vous perdez en moyenne <strong>50$ à 100$ par hiver</strong> en chauffage supplémentaire. Pour une maison avec 5 fenêtres problématiques, cela représente 250$ à 500$ perdus — soit souvent plus que le coût des réparations elles-mêmes.</p>

<p>N'attendez pas le premier gel. Contactez <strong>Vosthermos</strong> dès septembre pour planifier vos travaux. Consultez nos <a href="/prix">tarifs</a> ou visitez notre <a href="/boutique">boutique</a> pour les produits disponibles. Plus vous agissez tôt, plus vous avez le choix des dates et évitez la cohue d'octobre-novembre.</p>
`
  },

  // ─── Article 12 ────────────────────────────────────────────────────────────
  {
    title: 'Climatisation et fenêtres : comment garder votre maison fraîche en été',
    slug: 'fenetres-chaleur-ete-garder-maison-fraiche',
    excerpt: 'Gardez votre maison fraîche en été sans exploser votre facture de climatisation. Le rôle des fenêtres, du verre Low-E, de la ventilation et des moustiquaires.',
    category: 'conseils',
    tags: ['été', 'chaleur', 'climatisation', 'Low-E', 'ventilation', 'moustiquaires', 'fraîcheur'],
    publishedAt: new Date('2026-06-19T10:00:00Z'),
    content: `
<h2>Vos fenêtres et la chaleur estivale : un rôle clé souvent ignoré</h2>

<p>Si l'hiver québécois est le champion de la perte de chaleur par les fenêtres, l'été inverse le problème : vos fenêtres deviennent des <strong>sources de gain de chaleur</strong> qui peuvent faire grimper la température intérieure de votre maison de plusieurs degrés. Avec des épisodes de canicule de plus en plus fréquents au Québec, comprendre le rôle de vos fenêtres dans le confort estival peut vous faire économiser des centaines de dollars en climatisation.</p>

<h2>Comment la chaleur entre par vos fenêtres</h2>

<h3>Le rayonnement solaire direct</h3>

<p>Le soleil est la source principale de surchauffe. Une fenêtre standard sans protection solaire laisse passer <strong>70% à 85%</strong> de l'énergie solaire qui la frappe. Pour une fenêtre de 15 pieds carrés orientée ouest, cela équivaut à un radiateur de <strong>1 500 watts</strong> pendant les heures d'après-midi en juillet.</p>

<h3>Le coefficient de gain solaire (SHGC)</h3>

<p>Le <strong>SHGC</strong> (Solar Heat Gain Coefficient) mesure la proportion d'énergie solaire qui traverse le verre. Plus le chiffre est bas, moins le verre laisse passer de chaleur :</p>

<ul>
<li><strong>Verre simple clair</strong> : SHGC de 0.85 — laisse passer presque toute la chaleur solaire.</li>
<li><strong>Double vitrage clair</strong> : SHGC de 0.70 à 0.76.</li>
<li><strong>Double vitrage Low-E standard</strong> : SHGC de 0.35 à 0.55 — réduit significativement le gain solaire.</li>
<li><strong>Double vitrage Low-E solaire</strong> : SHGC de 0.20 à 0.30 — optimal pour les façades sud et ouest.</li>
</ul>

<h2>Solutions pour garder votre maison fraîche</h2>

<h3>Solution #1 : Le verre Low-E solaire</h3>

<p>Le <strong>revêtement Low-E solaire</strong> est spécifiquement conçu pour bloquer la chaleur solaire tout en laissant passer la lumière visible. Si vos fenêtres orientées sud et ouest n'ont pas de revêtement Low-E, le <a href="/services/remplacement-vitre-thermos">remplacement du thermos</a> par une unité avec Low-E solaire peut réduire le gain de chaleur de <strong>40% à 60%</strong>.</p>

<p>Attention : le choix du type de Low-E est important. Le <strong>Low-E standard</strong> (comme le Low-E 180) est optimisé pour retenir la chaleur en hiver — idéal pour les fenêtres nord. Le <strong>Low-E solaire</strong> (comme le Low-E 272) bloque davantage de chaleur solaire — parfait pour les fenêtres sud et ouest. Pour un <a href="/blog/double-vs-triple-vitrage-comment-choisir">choix éclairé entre les types de vitrage</a>, consultez notre guide comparatif.</p>

<h3>Solution #2 : Les moustiquaires pour une ventilation naturelle</h3>

<p>La <strong>ventilation naturelle</strong> est le moyen le plus économique de rafraîchir votre maison. Ouvrir les fenêtres le soir et la nuit quand la température extérieure descend sous 22°C peut éliminer complètement le besoin de climatisation pendant de nombreuses nuits d'été.</p>

<p>Pour ventiler efficacement, vous avez besoin de <a href="/services/moustiquaires-sur-mesure">moustiquaires en bon état</a> sur toutes les fenêtres ouvrantes. Les moustiquaires trouées ou déchirées laissent entrer les insectes, décourageant l'ouverture des fenêtres et forçant l'utilisation de la climatisation.</p>

<p>Nos moustiquaires sont disponibles en plusieurs types :</p>

<ul>
<li><strong>Moustiquaire standard</strong> (toile en fibre de verre) : bloque les insectes avec un impact minimal sur la circulation d'air.</li>
<li><strong>Moustiquaire haute visibilité</strong> (toile ultrafine) : préserve mieux la vue tout en protégeant contre les insectes.</li>
<li><strong>Moustiquaire solaire</strong> : réduit le gain solaire de 30% à 50% tout en permettant la ventilation. Idéale pour les fenêtres très ensoleillées.</li>
</ul>

<h3>Solution #3 : La protection solaire extérieure</h3>

<p>L'ombrage <strong>extérieur</strong> est 3 à 4 fois plus efficace que l'ombrage intérieur pour bloquer la chaleur, car il empêche les rayons solaires d'atteindre le verre :</p>

<ul>
<li><strong>Auvents et marquises</strong> : réduisent le gain solaire de 60% à 75% sur les fenêtres qu'ils protègent.</li>
<li><strong>Volets extérieurs</strong> : la solution la plus efficace (réduction de 80%+), mais plus coûteuse.</li>
<li><strong>Végétation</strong> : des arbres à feuilles caduques côté sud et ouest fournissent de l'ombre en été et laissent passer le soleil en hiver. Un choix écologique et durable.</li>
</ul>

<h3>Solution #4 : La protection solaire intérieure</h3>

<ul>
<li><strong>Stores cellulaires</strong> : les stores alvéolaires à double cellule réduisent le gain solaire de 40% à 60% et offrent également une isolation thermique en hiver.</li>
<li><strong>Rideaux épais à doublure blanche</strong> : le blanc réfléchit la lumière. Fermez-les pendant les heures d'ensoleillement direct.</li>
<li><strong>Film solaire pour vitres</strong> : une pellicule teintée ou réfléchissante appliquée sur le verre réduit le gain solaire de 30% à 70%. Solution économique mais qui réduit aussi la luminosité.</li>
</ul>

<h3>Solution #5 : La ventilation croisée stratégique</h3>

<p>Pour maximiser la ventilation naturelle :</p>

<ul>
<li>Ouvrez des fenêtres sur les <strong>côtés opposés</strong> de la maison pour créer un courant d'air traversant.</li>
<li>Ouvrez les fenêtres du <strong>côté ombragé</strong> (nord et est le matin, nord et ouest le soir) plus grand que celles du côté ensoleillé.</li>
<li>Ouvrez les fenêtres du <strong>rez-de-chaussée</strong> et un vasistas ou une fenêtre au deuxième étage pour créer un effet cheminée (l'air chaud monte et sort par le haut, aspirant l'air frais par le bas).</li>
<li>Utilisez des <strong>ventilateurs de fenêtre</strong> pour amplifier le mouvement d'air.</li>
</ul>

<h2>L'été et l'entretien de vos fenêtres</h2>

<p>L'été est aussi le moment idéal pour :</p>

<ul>
<li><strong>Lubrifier la quincaillerie</strong> de vos portes et fenêtres (consultez notre <a href="/blog/guide-entretien-saisonnier-portes-fenetres">guide d'entretien saisonnier</a>).</li>
<li><strong>Réparer ou remplacer les moustiquaires</strong> endommagées.</li>
<li><strong>Planifier le remplacement des thermos</strong> défaillants en vue de l'automne — les délais sont plus courts en été.</li>
</ul>

<p>Chez <strong>Vosthermos</strong>, nous offrons des solutions pour le confort estival et hivernal. De nos <a href="/services/moustiquaires-sur-mesure">moustiquaires sur mesure</a> à nos thermos avec verre Low-E solaire, nous pouvons vous aider à garder votre maison confortable en toute saison. Visitez notre <a href="/boutique">boutique</a> ou consultez nos <a href="/prix">prix</a>.</p>
`
  },

  // ─── Article 13 ────────────────────────────────────────────────────────────
  {
    title: 'Quand est le meilleur moment pour remplacer ses thermos? (Calendrier 2026-2027)',
    slug: 'meilleur-moment-remplacer-thermos-calendrier-2026-2027',
    excerpt: 'Découvrez le calendrier optimal pour remplacer vos thermos en 2026-2027. Meilleurs prix, délais plus courts et conditions idéales selon la saison au Québec.',
    category: 'guides',
    tags: ['remplacement', 'thermos', 'calendrier', 'meilleur moment', 'saison', '2026', '2027'],
    publishedAt: new Date('2026-06-26T10:00:00Z'),
    content: `
<h2>Le timing parfait pour remplacer vos thermos au Québec</h2>

<p>Le <a href="/services/remplacement-vitre-thermos">remplacement de thermos</a> peut être fait à n'importe quel moment de l'année, mais toutes les saisons ne sont pas égales. Le moment où vous choisissez de faire vos travaux influence directement le <strong>prix</strong>, les <strong>délais</strong>, la <strong>qualité de l'installation</strong> et même la <strong>disponibilité des professionnels</strong>. Voici un calendrier mensuel pour planifier intelligemment votre projet en 2026-2027.</p>

<h2>Calendrier mois par mois</h2>

<h3>Janvier-Février : la saison creuse</h3>

<p><strong>Note : 6/10</strong></p>

<ul>
<li><strong>Avantages</strong> : les fabricants et installateurs sont les moins occupés de l'année. Vous obtiendrez les <strong>délais les plus courts</strong> (souvent 1 à 2 semaines de fabrication) et parfois des <strong>rabais hors-saison</strong> de 5% à 15%.</li>
<li><strong>Inconvénients</strong> : les températures extrêmes rendent le calfeutrage extérieur difficile (les scellants ne durcissent pas correctement sous 5°C). L'ouverture de la fenêtre pendant le remplacement crée un inconfort temporaire important.</li>
<li><strong>Recommandation</strong> : acceptable pour une urgence (verre brisé, infiltration d'eau) mais pas idéal. Prévoyez une visite de calfeutrage de finition au printemps.</li>
</ul>

<h3>Mars-Avril : le début de la saison</h3>

<p><strong>Note : 8/10</strong></p>

<ul>
<li><strong>Avantages</strong> : les températures remontent au-dessus de 5°C, permettant un calfeutrage adéquat. La demande est encore modérée, donc les <strong>délais sont courts</strong> et la <strong>disponibilité est bonne</strong>.</li>
<li><strong>Inconvénients</strong> : le temps est imprévisible (pluie, neige tardive). Les journées de gel nocturne peuvent encore compliquer le séchage du scellant.</li>
<li><strong>Recommandation</strong> : excellent moment pour lancer un projet. Vous aurez vos nouvelles vitres bien avant la chaleur estivale.</li>
</ul>

<h3>Mai-Juin : la période idéale</h3>

<p><strong>Note : 10/10</strong></p>

<ul>
<li><strong>Avantages</strong> : les <strong>conditions sont optimales</strong> à tous les niveaux. Températures stables entre 15°C et 25°C, temps sec, parfait pour le calfeutrage et l'installation. Les fabricants ont terminé leur maintenance d'équipement hivernale. Les délais sont raisonnables (2 à 3 semaines).</li>
<li><strong>Inconvénients</strong> : la demande commence à monter. Réservez tôt, surtout pour les gros projets.</li>
<li><strong>Recommandation</strong> : c'est <strong>LA meilleure période</strong> pour remplacer vos thermos. Si vous pouvez planifier, visez cette fenêtre.</li>
</ul>

<h3>Juillet-Août : l'été chaud</h3>

<p><strong>Note : 7/10</strong></p>

<ul>
<li><strong>Avantages</strong> : le temps est généralement beau et sec. C'est aussi le moment où les propriétaires remarquent les problèmes de gain solaire excessif et décident d'agir.</li>
<li><strong>Inconvénients</strong> : les <strong>vacances du secteur de la construction</strong> (dernières 2 semaines de juillet) rallongent les délais. Les températures très élevées peuvent compliquer la manipulation du verre (risque de choc thermique). Les scellants sèchent trop vite par forte chaleur.</li>
<li><strong>Recommandation</strong> : bon moment si vous commandez avant les vacances de la construction. Évitez les journées de canicule pour l'installation.</li>
</ul>

<h3>Septembre-Octobre : la haute saison</h3>

<p><strong>Note : 8/10 (si vous réservez tôt) / 5/10 (de dernière minute)</strong></p>

<ul>
<li><strong>Avantages</strong> : les conditions de température sont excellentes (10°C à 20°C). C'est le dernier moment pour agir avant l'hiver — une forte motivation.</li>
<li><strong>Inconvénients</strong> : c'est la <strong>période la plus achalandée</strong> de l'année. Tout le monde veut remplacer ses thermos avant l'hiver. Les délais de fabrication s'allongent à <strong>3 à 5 semaines</strong>. Les installateurs sont débordés. Si vous attendez octobre pour appeler, votre projet risque de ne pas être complété avant les grands froids.</li>
<li><strong>Recommandation</strong> : excellent si vous avez planifié à l'avance (commande en août pour installation en septembre). Risqué si vous attendez la dernière minute. Consultez notre article sur la <a href="/blog/preparer-fenetres-hiver-guide-automne">préparation hivernale des fenêtres</a>.</li>
</ul>

<h3>Novembre-Décembre : la fin de saison</h3>

<p><strong>Note : 5/10</strong></p>

<ul>
<li><strong>Avantages</strong> : la demande chute brutalement après les premières neiges. Les <strong>prix peuvent être négociés</strong> et la disponibilité s'améliore.</li>
<li><strong>Inconvénients</strong> : les températures froides compliquent le calfeutrage. Les jours raccourcissent, limitant les heures de travail. Le risque de gel pendant l'installation est réel.</li>
<li><strong>Recommandation</strong> : acceptable pour les projets intérieurs ou les urgences, mais le calfeutrage extérieur devra attendre le printemps.</li>
</ul>

<h2>Résumé du calendrier 2026-2027</h2>

<ul>
<li><strong>Meilleure période</strong> : mai à juin 2026, ou mai à juin 2027.</li>
<li><strong>Très bon</strong> : mars-avril et septembre (si réservé à l'avance).</li>
<li><strong>Acceptable</strong> : juillet-août et octobre-novembre.</li>
<li><strong>À éviter si possible</strong> : décembre à février (sauf urgence).</li>
</ul>

<h2>Comment obtenir les meilleurs prix</h2>

<ul>
<li><strong>Commandez en hiver pour une installation au printemps</strong> : certains fournisseurs offrent des rabais pour les commandes anticipées.</li>
<li><strong>Groupez vos remplacements</strong> : remplacer 5 thermos en même temps coûte proportionnellement moins cher que de les faire un à la fois. Consultez notre page <a href="/prix">prix</a> pour les rabais de volume.</li>
<li><strong>Profitez des <a href="/blog/subventions-remplacement-fenetres-quebec-2026">subventions gouvernementales</a></strong> : inscrivez-vous aux programmes avant de commencer les travaux.</li>
<li><strong>Combinez les travaux</strong> : si vous faites remplacer des thermos, profitez-en pour faire le <a href="/services/calfeutrage">calfeutrage</a> et les <a href="/services/coupe-froid">coupe-froid</a> en même temps — les frais de déplacement sont partagés.</li>
</ul>

<p>Chez <strong>Vosthermos</strong>, nous offrons des <a href="/prix">prix compétitifs</a> toute l'année et des délais parmi les plus courts de l'industrie. Visitez notre <a href="/boutique">boutique</a> ou contactez-nous pour planifier votre projet au moment optimal.</p>
`
  },

  // ─── Article 14 ────────────────────────────────────────────────────────────
  {
    title: 'Budget rénovation fenêtres 2026-2027 : planifier ses dépenses intelligemment',
    slug: 'budget-renovation-fenetres-2026-2027-planifier-depenses',
    excerpt: 'Planifiez votre budget de rénovation de fenêtres pour 2026-2027. Coûts réels, options de financement, subventions Rénoclimat, crédits d\'impôt et approche par phases.',
    category: 'guides',
    tags: ['budget', 'rénovation', 'fenêtres', 'coût', 'financement', 'subventions', '2026', '2027'],
    publishedAt: new Date('2026-07-03T10:00:00Z'),
    content: `
<h2>Planifier son budget de rénovation de fenêtres au Québec</h2>

<p>La <strong>rénovation des fenêtres</strong> est l'un des projets les plus rentables pour les propriétaires québécois. Qu'il s'agisse du <a href="/services/remplacement-vitre-thermos">remplacement des thermos</a>, du recalfeutrage complet ou du remplacement de fenêtres entières, un budget bien planifié vous permettra de maximiser votre investissement tout en étalant les dépenses de façon confortable. Voici un guide de planification financière complet pour 2026-2027.</p>

<h2>Les coûts réels en 2026 au Québec</h2>

<h3>Remplacement de thermos (unité scellée seulement)</h3>

<p>Le remplacement du thermos est la solution la plus <strong>économique</strong> quand les cadres sont encore en bon état :</p>

<ul>
<li><strong>Petite fenêtre</strong> (2 à 4 pi²) : 80$ à 150$ installé.</li>
<li><strong>Fenêtre standard</strong> (5 à 10 pi²) : 120$ à 250$ installé.</li>
<li><strong>Grande fenêtre</strong> (11 à 20 pi²) : 200$ à 400$ installé.</li>
<li><strong>Porte-patio</strong> (panneau fixe ou mobile) : 250$ à 500$ installé.</li>
</ul>

<p>Ces prix incluent le thermos double vitrage Low-E avec argon, la main-d'oeuvre et le calfeutrage. Consultez notre page <a href="/prix">prix détaillés</a> pour une estimation précise selon vos dimensions.</p>

<h3>Remplacement de quincaillerie</h3>

<ul>
<li><strong><a href="/services/remplacement-quincaillerie">Roulettes de porte-patio</a></strong> : 75$ à 200$ (pièce + installation).</li>
<li><strong>Serrure de porte-patio</strong> : 60$ à 150$.</li>
<li><strong>Poignée</strong> : 40$ à 120$ selon le modèle.</li>
<li><strong>Mécanisme de fenêtre à guillotine</strong> (balancier) : 50$ à 120$ par fenêtre.</li>
</ul>

<h3>Calfeutrage et coupe-froid</h3>

<ul>
<li><strong><a href="/services/calfeutrage">Calfeutrage professionnel</a></strong> : 15$ à 35$ par fenêtre (extérieur et intérieur).</li>
<li><strong><a href="/services/coupe-froid">Remplacement de coupe-froid</a></strong> : 10$ à 25$ par fenêtre.</li>
<li><strong>Forfait maison complète</strong> (15 fenêtres + 2 portes) : 400$ à 800$.</li>
</ul>

<h3>Remplacement de fenêtres complètes</h3>

<p>Pour les cas où le cadre est trop endommagé pour conserver :</p>

<ul>
<li><strong>Fenêtre en vinyle standard</strong> : 500$ à 900$ installée.</li>
<li><strong>Fenêtre en vinyle haut de gamme</strong> : 800$ à 1 200$ installée.</li>
<li><strong>Fenêtre hybride (vinyle/aluminium)</strong> : 900$ à 1 500$ installée.</li>
<li><strong>Porte-patio coulissante complète</strong> : 1 500$ à 4 000$ installée.</li>
</ul>

<h2>Les subventions et crédits d'impôt disponibles</h2>

<h3>Rénoclimat (provincial)</h3>

<p>Le programme <strong>Rénoclimat</strong> offre des subventions pour le remplacement de fenêtres certifiées ENERGY STAR :</p>

<ul>
<li><strong>50$ à 125$ par ouverture</strong> remplacée (fenêtre complète).</li>
<li><strong>75$ à 175$ par porte-fenêtre</strong> remplacée.</li>
<li>Bonification pour les <strong>ménages à faible revenu</strong>.</li>
<li>Nécessite une évaluation énergétique avant ET après les travaux.</li>
</ul>

<p>Pour plus de détails, consultez notre <a href="/blog/subventions-remplacement-fenetres-quebec-2026">guide complet des subventions 2026</a>.</p>

<h3>LogisVert (fédéral)</h3>

<ul>
<li><strong>125$ à 250$ par ouverture</strong> (fenêtre ou porte).</li>
<li>Maximum de <strong>5 000$ à 10 000$</strong> par habitation.</li>
<li><strong>Cumulable</strong> avec Rénoclimat.</li>
</ul>

<h3>Crédit d'impôt et autres mesures</h3>

<ul>
<li>Vérifiez les <strong>mesures fiscales provinciales et fédérales</strong> en vigueur pour la rénovation écoénergétique.</li>
<li>Certaines <strong>municipalités</strong> offrent des subventions additionnelles (Montréal, Québec, Laval, etc.).</li>
<li>Le cumul de toutes les aides peut couvrir <strong>15% à 35%</strong> du coût total d'un projet de remplacement de fenêtres.</li>
</ul>

<h2>Options de financement</h2>

<h3>Le financement par le fournisseur</h3>

<p>Plusieurs entreprises de fenêtres offrent des plans de financement avec :</p>

<ul>
<li><strong>Paiements mensuels</strong> étalés sur 12 à 60 mois.</li>
<li>Parfois des <strong>promotions à taux 0%</strong> pour les 6 à 12 premiers mois.</li>
<li>Approbation rapide et processus simplifié.</li>
</ul>

<h3>La marge de crédit hypothécaire (HELOC)</h3>

<p>Si vous avez de l'équité dans votre propriété, une marge de crédit hypothécaire offre :</p>

<ul>
<li>Les <strong>meilleurs taux d'intérêt</strong> (taux préférentiel + 0.5% à 1%).</li>
<li>Des intérêts <strong>déductibles d'impôt</strong> si les travaux augmentent la valeur de la propriété.</li>
<li>Flexibilité de remboursement.</li>
</ul>

<h3>Le prêt personnel vert</h3>

<p>Plusieurs institutions financières offrent des <strong>prêts verts</strong> à taux réduit pour les travaux d'efficacité énergétique. Les taux sont généralement 1% à 2% inférieurs aux prêts personnels réguliers.</p>

<h2>Stratégie : l'approche par phases</h2>

<p>Vous n'avez pas besoin de tout faire en même temps. Voici une approche par phases étalée sur 2026-2027 :</p>

<h3>Phase 1 — Automne 2026 : les urgences (budget : 500$ à 1 500$)</h3>

<ul>
<li>Remplacez les thermos embués et défaillants (les fenêtres avec <a href="/blog/fenetre-embuee-causes-solutions-prevention">buée entre les vitres</a>).</li>
<li>Refaites le calfeutrage déficient sur toutes les fenêtres.</li>
<li>Remplacez les coupe-froid usés.</li>
<li>Impact immédiat sur votre facture de chauffage dès l'hiver 2026-2027.</li>
</ul>

<h3>Phase 2 — Printemps 2027 : l'optimisation (budget : 500$ à 2 000$)</h3>

<ul>
<li>Remplacez la <a href="/services/remplacement-quincaillerie">quincaillerie</a> défaillante (roulettes de porte-patio, balanciers de fenêtres à guillotine).</li>
<li>Remplacez les thermos restants qui ne sont pas encore en fin de vie mais qui approchent.</li>
<li>Installez des <a href="/services/moustiquaires-sur-mesure">moustiquaires</a> neuves pour la saison estivale.</li>
</ul>

<h3>Phase 3 — Été/automne 2027 : le remplacement complet (budget : variable)</h3>

<ul>
<li>Remplacez les fenêtres complètes dont les cadres sont trop endommagés.</li>
<li>Inscrivez-vous aux programmes de subventions avant de commencer.</li>
<li>Profitez de la <a href="/blog/meilleur-moment-remplacer-thermos-calendrier-2026-2027">période optimale</a> (mai-juin) pour les meilleurs prix et délais.</li>
</ul>

<h2>Retour sur investissement</h2>

<p>Le remplacement de thermos et l'amélioration de l'étanchéité des fenêtres offrent l'un des <strong>meilleurs retours sur investissement</strong> en rénovation résidentielle :</p>

<ul>
<li><strong>Économies d'énergie</strong> : 150$ à 600$ par année selon le nombre de fenêtres traitées.</li>
<li><strong>Augmentation de la valeur de la propriété</strong> : les fenêtres performantes ajoutent 1% à 3% à la valeur de revente.</li>
<li><strong>Confort accru</strong> : élimination des courants d'air, de la condensation et des variations de température.</li>
<li><strong>Retour sur investissement</strong> : 2 à 5 ans pour les thermos et le calfeutrage, 7 à 12 ans pour les fenêtres complètes.</li>
</ul>

<p>Chez <strong>Vosthermos</strong>, nous pouvons vous accompagner dans chaque phase de votre projet. Du simple remplacement de thermos à la rénovation complète, nous offrons des <a href="/prix">prix transparents</a> et un service professionnel. Visitez notre <a href="/boutique">boutique</a> pour voir nos produits ou contactez-nous pour une soumission gratuite et un plan budgétaire personnalisé.</p>
`
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seed blog SEO — Topical Authority + Seasonal Content');
  console.log('=====================================================\n');

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

  console.log('=====================================================');
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
