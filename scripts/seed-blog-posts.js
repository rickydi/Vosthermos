require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d;
}

const posts = [
  // ─── Article 1 ───────────────────────────────────────────────────────────────
  {
    title: 'Comment savoir si vos vitres thermos doivent etre remplacees',
    excerpt: 'Decouvrez les signes qui indiquent que vos unites scellees sont en fin de vie et quand il est temps de les remplacer pour retrouver confort et efficacite energetique.',
    category: 'conseils',
    tags: ['thermos', 'remplacement', 'buee', 'fenetres'],
    publishedAt: daysAgo(90),
    content: `
<h2>Les signes qui ne trompent pas</h2>

<p>Vos fenetres jouent un role essentiel dans le confort de votre maison, surtout au Quebec ou les ecarts de temperature peuvent depasser 60 degres entre l'hiver et l'ete. Les vitres thermos, aussi appelees unites scellees ou unites de verre isolantes, sont conçues pour durer entre 15 et 25 ans. Mais comment savoir quand elles arrivent en fin de vie?</p>

<p>Le premier signe, et le plus evident, c'est la <strong>buee entre les deux vitres</strong>. Si vous voyez de la condensation qui apparait a l'interieur de l'unite scellee, c'est que le scellant a cede et que le gaz isolant (souvent de l'argon) s'est echappe. Cette buee ne peut pas etre nettoyee puisqu'elle se trouve entre les panneaux de verre. Au debut, elle peut apparaitre uniquement lors de variations de temperature importantes, mais avec le temps, elle devient permanente et peut meme laisser des depots mineraux blanchatres sur le verre.</p>

<h2>Condensation interieure et exterieure : quelle difference?</h2>

<p>Il est important de distinguer la condensation qui se forme <strong>a l'interieur de votre maison</strong> (sur la surface du verre cote habitation) de celle qui se forme <strong>entre les vitres</strong>. La condensation sur la surface interieure peut etre causee par un taux d'humidite trop eleve dans la maison, surtout en hiver quand on utilise un humidificateur. Cela ne signifie pas necessairement que votre thermos est defectueux.</p>

<p>Par contre, la condensation <strong>entre les deux panneaux de verre</strong> indique clairement un bris du scellant. C'est le signe le plus fiable que votre unite scellee doit etre remplacee. Si vous avez un doute, passez votre doigt sur le verre : si la buee ne s'enleve pas, c'est qu'elle est a l'interieur de l'unite.</p>

<h2>Les courants d'air pres des fenetres</h2>

<p>Un autre indicateur frequent est la <strong>sensation de froid pres de vos fenetres</strong>, meme quand elles sont bien fermees. Un thermos dont le scellant est compromis perd ses proprietes isolantes. Le gaz argon qui remplissait l'espace entre les deux vitres est remplace par de l'air humide, ce qui reduit considerablement la valeur isolante de la fenetre.</p>

<p>Pour tester, approchez votre main de la surface interieure de la vitre par une journee froide. Si vous sentez un froid marque comparativement aux autres fenetres de la maison, c'est un indicateur que le thermos ne fait plus son travail. Un thermometre infrarouge peut aussi vous aider a mesurer la temperature de surface et comparer entre les fenetres.</p>

<h3>Autres signes visuels a surveiller</h3>

<ul>
<li><strong>Distorsion visuelle</strong> : quand vous regardez a travers la vitre, les lignes droites semblent ondulees. Cela peut indiquer que le verre s'est deforme sous l'effet de la pression atmospherique apres la perte du gaz interieur.</li>
<li><strong>Depots blanchatres ou laiteux</strong> : des traces minerales permanentes entre les vitres, causees par l'evaporation repetee de la condensation.</li>
<li><strong>Fissures ou eclats</strong> : meme une petite fissure dans le verre compromet l'integrite de l'unite scellee.</li>
<li><strong>Scellant noir visible degradant</strong> : si le mastic noir entre les deux vitres semble craque, decolle ou effritte, l'unite est en fin de vie.</li>
</ul>

<h2>Reparer ou remplacer?</h2>

<p>La question revient souvent : peut-on reparer un thermos embue? Malheureusement, dans la grande majorite des cas, <strong>la reponse est non</strong>. Une fois que le scellant est brise et que le gaz s'est echappe, il n'est pas possible de "resceller" l'unite de facon durable. Certaines entreprises offrent un service de desembuage, qui consiste a percer le verre, nettoyer l'interieur et installer une valve de ventilation. Bien que cela elimine la buee temporairement, cette technique ne restaure pas les proprietes isolantes du thermos et la buee finit par revenir.</p>

<p>La solution la plus efficace et la plus durable est le <strong>remplacement de l'unite scellee</strong>. La bonne nouvelle, c'est qu'il n'est generalement pas necessaire de remplacer la fenetre au complet. Un technicien qualifie peut retirer uniquement la vitre thermos et en installer une neuve dans le cadre existant. C'est une intervention beaucoup moins couteuse qu'un remplacement de fenetre complet.</p>

<h2>L'impact sur votre facture d'energie</h2>

<p>Un thermos defectueux peut augmenter votre facture de chauffage de <strong>10 a 25%</strong> selon le nombre de fenetres affectees et leur taille. Au Quebec, ou la saison de chauffage dure de 6 a 8 mois, cela represente un montant significatif annuellement. Le remplacement de vos thermos defectueux se rentabilise generalement en 3 a 5 ans grace aux economies d'energie.</p>

<h3>Quand agir?</h3>

<p>Idealement, faites inspecter vos fenetres <strong>avant l'automne</strong> pour que les travaux soient completes avant les grands froids. Les delais de fabrication des thermos sur mesure varient de 2 a 4 semaines selon la periode de l'annee. L'automne et le debut de l'hiver sont les periodes les plus occupees, alors planifiez en consequence.</p>

<p>Si vos fenetres ont plus de 15 ans, une inspection preventive est recommandee meme en l'absence de symptomes visibles. Des problemes peuvent commencer subtilement et s'aggraver rapidement lors d'une vague de froid intense.</p>

<h2>Comment se deroule le remplacement?</h2>

<p>Le processus est simple et rapide. Un technicien se deplace pour prendre les mesures exactes de chaque unite a remplacer. Le thermos est fabrique sur mesure, puis installe en 15 a 30 minutes par fenetre. Il n'y a generalement pas besoin de toucher au cadre de la fenetre, au parement exterieur ou a la finition interieure. C'est une intervention propre qui se fait de l'interieur.</p>

<p>Chez Vosthermos, nous desservons Montreal, la Rive-Sud et les environs. Nos techniciens sont experimentes et utilisent des thermos de qualite avec garantie. Si vous observez un ou plusieurs des signes decrits dans cet article, n'hesitez pas a nous contacter pour une evaluation gratuite.</p>

<p><strong>Besoin d'une inspection ou d'une soumission? Appelez-nous au 514-825-8411 ou remplissez notre formulaire en ligne pour une estimation gratuite. Nos experts se feront un plaisir de vous conseiller.</strong></p>
`
  },

  // ─── Article 2 ───────────────────────────────────────────────────────────────
  {
    title: 'Guide complet du remplacement de coupe-froid au Quebec',
    excerpt: 'Tout ce que vous devez savoir sur les coupe-froid de fenetres et portes : types, identification, installation et quand faire appel a un professionnel.',
    category: 'guides',
    tags: ['coupe-froid', 'isolation', 'hiver', 'energie'],
    publishedAt: daysAgo(75),
    content: `
<h2>Qu'est-ce qu'un coupe-froid et pourquoi est-il si important?</h2>

<p>Le coupe-froid, aussi appele joint d'etancheite ou weatherstripping en anglais, est cette bande de materiau souple qui fait le tour de vos fenetres et portes pour empecher l'air exterieur de s'infiltrer. C'est un composant discret mais absolument essentiel a l'isolation de votre maison. Au Quebec, avec nos hivers rigoureux ou le mercure descend regulierement sous les -20 degres Celsius, un coupe-froid en mauvais etat peut transformer une fenetre parfaitement fonctionnelle en passoire energetique.</p>

<p>Selon Hydro-Quebec, les infiltrations d'air par les portes et fenetres representent jusqu'a <strong>25% des pertes de chaleur</strong> d'une maison. Remplacer des coupe-froid uses est l'une des ameliorations les plus rentables que vous puissiez faire, avec un cout minimal pour un impact significatif sur votre confort et votre facture d'electricite.</p>

<h2>Les differents types de coupe-froid</h2>

<p>Tous les coupe-froid ne sont pas egaux. Le type de joint varie selon le fabricant de la fenetre, le modele et l'annee de fabrication. Voici les principaux types que vous rencontrerez dans les maisons quebecoises :</p>

<h3>Coupe-froid en mousse</h3>

<p>C'est le type le plus basique et le moins durable. On le retrouve souvent dans les fenetres d'entree de gamme ou comme solution temporaire. La mousse comprimee ou adhesive se degrade rapidement avec les cycles de gel et degel du Quebec. Sa duree de vie est generalement de 1 a 3 ans seulement. C'est une solution de depannage acceptable, mais pas une solution permanente.</p>

<h3>Coupe-froid tubulaire en caoutchouc ou en silicone</h3>

<p>Plus durable que la mousse, le joint tubulaire offre une meilleure etancheite grace a sa forme qui s'ecrase contre le cadre. On le retrouve dans de nombreuses portes d'entree et portes-patio. Le caoutchouc EPDM est le materiau le plus courant et peut durer de 5 a 10 ans. Le silicone est encore plus resistant aux temperatures extremes.</p>

<h3>Coupe-froid a ailettes (type fin ou lame)</h3>

<p>Tres courant dans les fenetres coulissantes et les portes-patio, ce type se presente sous forme d'une mince ailette flexible. Il permet le mouvement de la fenetre tout en bloquant l'air. Il est souvent integre dans une gorge (canal) du cadre de la fenetre. Son remplacement necessite de retirer l'ancien joint de la gorge et d'y inserer le nouveau.</p>

<h3>Coupe-froid a brosse (pile weatherstrip)</h3>

<p>Compose de milliers de petites fibres fixees sur un support, ce type est utilise principalement pour les fenetres et portes coulissantes. Il empeche l'air et les insectes de passer tout en permettant un coulissement fluide. On le retrouve souvent sur les cotes et le dessus des cadres de moustiquaires et de portes-patio coulissantes.</p>

<h3>Joint de compression en caoutchouc profile</h3>

<p>C'est le type haut de gamme qu'on retrouve sur les fenetres et portes de qualite. Il a une forme specifique (souvent en D, en P ou en E) et s'insere dans une gorge dediee du cadre. Ces joints offrent la meilleure etancheite et la meilleure durabilite, avec une duree de vie de 10 a 20 ans selon les conditions.</p>

<h2>Comment identifier le type de coupe-froid a remplacer</h2>

<p>Avant de pouvoir remplacer un coupe-froid, il faut savoir exactement quel type vous avez besoin. Voici la methode :</p>

<ul>
<li><strong>Ouvrez la fenetre ou la porte</strong> et examinez le joint tout autour du cadre.</li>
<li><strong>Notez la forme</strong> : est-il plat, tubulaire, en ailette, en brosse?</li>
<li><strong>Mesurez la largeur et l'epaisseur</strong> du joint, ainsi que la largeur de la gorge s'il s'insere dans un canal.</li>
<li><strong>Prenez une photo</strong> et, si possible, retirez un petit echantillon de quelques centimetres.</li>
<li><strong>Identifiez le fabricant de la fenetre</strong> : la marque est souvent inscrite sur l'intercalaire metallique entre les deux vitres ou sur le cadre. Chaque fabricant utilise des joints specifiques.</li>
</ul>

<h2>Installation : DIY ou professionnel?</h2>

<p>Certains types de coupe-froid sont faciles a remplacer soi-meme, tandis que d'autres necessitent l'intervention d'un professionnel.</p>

<h3>Ce que vous pouvez faire vous-meme</h3>

<p>Les coupe-froid adhesifs en mousse ou en caoutchouc sont les plus simples a installer. Il suffit de nettoyer la surface, retirer le papier protecteur et coller le joint en place. Les joints a brosse pour moustiquaires se remplacent aussi facilement avec un simple outil a roulette (qu'on trouve dans toutes les quincailleries). Pour les portes d'entree, le bas de porte (seuil) avec balai integre se remplace generalement avec un tournevis et quelques vis.</p>

<h3>Quand faire appel a un professionnel</h3>

<p>Si votre fenetre utilise un joint de compression profile qui s'insere dans une gorge specifique, le remplacement peut etre plus complexe. Il faut souvent retirer le vitrage ou demonter partiellement la fenetre pour acceder au joint. De plus, trouver le bon joint de remplacement peut etre un defi : les fabricants ont chacun leurs profils proprietaires et certains modeles discontinues sont difficiles a trouver. Un professionnel comme Vosthermos dispose de catalogues complets et de fournisseurs specialises pour trouver le bon joint, meme pour les fenetres plus anciennes.</p>

<h2>Les couts a prevoir</h2>

<p>Le coupe-froid en tant que materiau est relativement peu couteux. Voici une idee des prix :</p>

<ul>
<li><strong>Mousse adhesive</strong> : 5 a 15 $ le rouleau (suffisant pour 2-3 fenetres)</li>
<li><strong>Joint tubulaire en caoutchouc</strong> : 10 a 25 $ le rouleau</li>
<li><strong>Joint profile sur mesure</strong> : 3 a 8 $ le pied lineaire</li>
<li><strong>Brosse pour moustiquaire</strong> : 8 a 20 $ le rouleau</li>
<li><strong>Main-d'oeuvre professionnelle</strong> : 50 a 150 $ par fenetre selon la complexite</li>
</ul>

<p>Considerant qu'un coupe-froid use sur une seule fenetre peut vous couter 50 a 100 $ de plus par hiver en chauffage, l'investissement se recupere rapidement, souvent des la premiere saison de chauffage.</p>

<h2>Le meilleur moment pour agir</h2>

<p>Le moment ideal pour remplacer vos coupe-froid est <strong>a la fin de l'ete ou au debut de l'automne</strong>, avant les premieres nuits froides. Les temperatures moderees permettent une meilleure adhesion des joints et un travail plus confortable. Cela dit, si vous constatez des infiltrations en plein hiver, n'attendez pas au printemps : meme une solution temporaire vaut mieux que de laisser l'air froid s'infiltrer pendant des mois.</p>

<p>Faites le tour de toutes vos fenetres et portes en meme temps. Si un coupe-froid est use a un endroit, il y a de bonnes chances que d'autres le soient aussi. Une intervention globale est plus efficace et souvent moins couteuse qu'une approche fenetre par fenetre.</p>

<p><strong>Vous ne savez pas quel type de coupe-froid vous avez besoin? Contactez Vosthermos au 514-825-8411. Nos techniciens peuvent identifier exactement le bon joint pour vos fenetres et l'installer rapidement, quel que soit le fabricant ou l'age de vos fenetres.</strong></p>
`
  },

  // ─── Article 3 ───────────────────────────────────────────────────────────────
  {
    title: '5 problemes courants de porte-patio et leurs solutions',
    excerpt: 'Votre porte-patio coince, laisse passer l\'air ou ferme mal? Decouvrez les 5 problemes les plus frequents et comment les resoudre efficacement.',
    category: 'conseils',
    tags: ['porte-patio', 'quincaillerie', 'roulettes', 'reparation'],
    publishedAt: daysAgo(60),
    content: `
<h2>La porte-patio : un element central de la maison quebecoise</h2>

<p>La porte-patio est l'une des ouvertures les plus utilisees dans les maisons du Quebec. Elle donne acces au balcon, a la terrasse ou a la cour arriere et est sollicitee quotidiennement, souvent plusieurs dizaines de fois par jour en ete. Cette utilisation intensive, combinee aux conditions climatiques extremes de notre region, fait en sorte que les portes-patio developpent inevitablement des problemes avec le temps. Voici les cinq problemes les plus courants et comment les resoudre.</p>

<h2>1. La porte glisse difficilement ou coince</h2>

<p>C'est de loin le probleme le plus frequent. Votre porte-patio qui glissait autrefois avec facilite necessite maintenant un effort considerable pour l'ouvrir ou la fermer. Plusieurs causes sont possibles :</p>

<h3>Les roulettes usees</h3>

<p>Les roulettes (aussi appelees galets ou roues) sont situees sous la porte et supportent tout son poids. Avec le temps et l'usage, elles s'usent, se deforment ou se brisent. Le nylon et le plastique se degradent, les roulements a billes s'encrassent. Le signe revelateur : la porte fait un bruit de grattement quand vous la bougez, ou elle "saute" a certains endroits du rail.</p>

<p><strong>Solution :</strong> Le remplacement des roulettes est une intervention relativement simple pour un technicien experimente. Il faut soulever la porte, retirer les anciennes roulettes et installer des neuves. Le resultat est immediat : la porte retrouve un coulissement fluide et silencieux. Le cout est generalement de 100 a 200 $ selon le modele de porte.</p>

<h3>Le rail encrasse ou endommage</h3>

<p>Le rail de guidage au sol accumule poussiere, sable, poils d'animaux et debris au fil du temps. Dans les pires cas, le rail peut etre plie, bossele ou corrode, surtout si du sel de deglacage a ete utilise a proximite.</p>

<p><strong>Solution :</strong> Commencez par un nettoyage en profondeur du rail avec un aspirateur, puis nettoyez avec un chiffon humide. Une fois propre, appliquez un lubrifiant a base de silicone (jamais de WD-40 qui attire la poussiere). Si le rail est endommage physiquement, il peut souvent etre redresse ou, dans les cas extremes, remplace.</p>

<h2>2. La porte ne ferme plus a cle</h2>

<p>Le mecanisme de verrouillage de votre porte-patio refuse de s'engager completement, ou la poignee tourne dans le vide. Ce probleme peut etre lie a plusieurs composants :</p>

<ul>
<li><strong>Le crochet ou le pene</strong> ne s'aligne plus avec la gache (la piece dans le cadre). Cela arrive quand la porte s'est affaissee suite a l'usure des roulettes.</li>
<li><strong>Le mecanisme interne de la serrure</strong> est brise. Les pieces de plastique a l'interieur du boitier de serrure se deteriorent avec le temps.</li>
<li><strong>La poignee elle-meme</strong> est fissuree ou le ressort de rappel est brise.</li>
</ul>

<p><strong>Solution :</strong> Si le probleme est un desalignement, le remplacement des roulettes (voir point 1) resout souvent les deux problemes en meme temps. Si le mecanisme de serrure est en cause, il peut etre remplace sans changer la porte. La plupart des fabricants utilisent des formats standardises, mais certains modeles plus anciens necessitent une recherche en fournisseurs specialises.</p>

<h2>3. L'air froid s'infiltre par la porte</h2>

<p>En hiver, vous sentez un courant d'air froid le long de votre porte-patio, meme quand elle est bien fermee et verrouilee. C'est un probleme d'etancheite qui peut venir de plusieurs endroits :</p>

<h3>Le coupe-froid perimetrique</h3>

<p>Le joint souple qui fait le tour du cadre de la porte se comprime et se deforme avec les annees. Il perd son elasticite et ne fait plus contact uniforme avec la porte. Les coins sont particulierement vulnerables.</p>

<h3>La barre de seuil</h3>

<p>La piece au bas de la porte qui fait contact avec le rail peut etre usee ou mal ajustee. Un espace meme minime a cet endroit laisse passer enormement d'air froid (l'air froid est plus dense et reste au sol).</p>

<p><strong>Solution :</strong> Le remplacement du coupe-froid perimetrique est la premiere etape. Ajuster la hauteur de la porte via les vis de reglage des roulettes peut aussi ameliorer le contact avec le seuil. Dans certains cas, l'ajout d'un bas de porte complementaire est la solution la plus efficace. Vosthermos offre le remplacement complet des joints d'etancheite adaptes a votre modele de porte.</p>

<h2>4. La moustiquaire est dechiree ou ne glisse plus</h2>

<p>La moustiquaire de la porte-patio est souvent le premier element a montrer des signes d'usure. Les enfants, les animaux domestiques et le vent en viennent facilement a bout. Une moustiquaire dechiree invite moustiques, mouches et autres insectes indesirables.</p>

<p><strong>Solution :</strong> Le retissage de la moustiquaire est une operation simple et economique. Le cadre existant est conserve, seule la toile est remplacee. Vous pouvez choisir entre une toile standard en fibre de verre (la plus courante), une toile en aluminium (plus durable mais plus rigide) ou une toile "pet screen" ultra-resistante si vous avez des animaux. Le retissage coute generalement entre 40 et 80 $ selon la taille.</p>

<p>Si le cadre de la moustiquaire est tordu ou brise, il peut etre remplace au complet. Les cadres sont fabriques sur mesure a partir de profils d'aluminium standards.</p>

<h2>5. Le thermos de la porte est embue</h2>

<p>Comme pour les fenetres, le vitrage isolant de votre porte-patio peut developper de la condensation entre les deux vitres. C'est un signe que le scellant de l'unite scellee a cede. La porte-patio etant generalement la plus grande surface vitree de la maison, un thermos defectueux a cet endroit a un impact significatif sur l'isolation et le confort.</p>

<p><strong>Solution :</strong> Le thermos de la porte-patio peut etre remplace sans avoir a changer la porte complete. C'est une intervention plus delicate que pour une fenetre en raison de la taille du verre, mais un technicien qualifie peut le faire efficacement. Le nouveau thermos peut etre commande avec les options modernes comme le verre Low-E et le gaz argon pour une meilleure performance energetique.</p>

<h2>Quand faut-il envisager le remplacement complet?</h2>

<p>Dans certains cas, il vaut mieux remplacer la porte-patio au complet plutot que de reparer :</p>

<ul>
<li>Le cadre en aluminium ou en PVC est deforme, fissure ou corrode</li>
<li>Plusieurs problemes s'accumulent (roulettes + serrure + thermos + coupe-froid)</li>
<li>La porte a plus de 25 ans et les pieces de remplacement sont introuvables</li>
<li>Vous souhaitez passer a un modele plus performant energetiquement</li>
</ul>

<p>Cependant, dans la majorite des cas, <strong>la reparation est nettement plus economique</strong> et suffit a redonner a votre porte-patio des annees de service supplementaires. Un bon diagnostic par un professionnel vous permettra de prendre la bonne decision.</p>

<p><strong>Votre porte-patio vous donne du fil a retordre? Contactez l'equipe Vosthermos au 514-825-8411 pour un diagnostic rapide. Nous reparons tous les modeles de portes-patio dans la grande region de Montreal et de la Rive-Sud.</strong></p>
`
  },

  // ─── Article 4 ───────────────────────────────────────────────────────────────
  {
    title: 'Reparer ou remplacer ses fenetres : le guide decision',
    excerpt: 'Quand est-il plus avantageux de reparer vos fenetres existantes plutot que de les remplacer? Analyse complete des couts, du retour sur investissement et des criteres de decision.',
    category: 'guides',
    tags: ['fenetres', 'reparation', 'remplacement', 'budget'],
    publishedAt: daysAgo(60),
    content: `
<h2>Le dilemme du proprietaire</h2>

<p>C'est la question que se pose tout proprietaire face a des fenetres vieillissantes : faut-il reparer ou tout remplacer? La reponse n'est pas toujours evidente, et l'industrie de la fenetre a tendance a pousser vers le remplacement complet, une solution souvent plus couteuse que necessaire. Ce guide vous aidera a prendre une decision eclairee en fonction de votre situation reelle.</p>

<p>Au Quebec, le remplacement complet de fenetres coute en moyenne entre <strong>600 et 1 500 $ par fenetre</strong>, installation comprise, pour des fenetres de qualite moyenne. Pour une maison typique de 15 a 20 fenetres, la facture peut facilement atteindre 15 000 a 25 000 $. En comparaison, la reparation (thermos, coupe-froid, quincaillerie) coute generalement entre <strong>100 et 400 $ par fenetre</strong>. La difference est majeure.</p>

<h2>Quand la reparation suffit</h2>

<p>Dans la majorite des cas, vos fenetres n'ont pas besoin d'etre remplacees completement. Voici les situations ou la reparation est la meilleure option :</p>

<h3>Le cadre est en bon etat</h3>

<p>Si le cadre de votre fenetre (en PVC, aluminium ou bois) est structurellement sain, sans pourriture, sans deformation importante et sans fissures majeures, il n'y a aucune raison de le remplacer. Le cadre est la partie la plus couteuse de la fenetre et aussi la plus durable. Les cadres en PVC peuvent durer 30 a 50 ans, l'aluminium encore plus longtemps.</p>

<h3>Seul le thermos est embue</h3>

<p>C'est le cas de figure le plus courant. Le scellant de l'unite de verre isolante a cede, de la buee apparait entre les vitres, mais le cadre et la quincaillerie fonctionnent encore bien. Le remplacement du thermos seul coute de <strong>150 a 350 $</strong> par fenetre selon la taille, soit une fraction du cout d'une fenetre neuve. Et le resultat est exactement le meme : une vitre claire avec de bonnes proprietes isolantes.</p>

<h3>Les joints d'etancheite sont uses</h3>

<p>Les coupe-froid et les joints de vitrage se remplacent facilement et a faible cout. C'est souvent la cause des infiltrations d'air que les gens attribuent a tort a l'usure generale de la fenetre. Pour 50 a 150 $ par fenetre, vous pouvez restaurer l'etancheite d'origine.</p>

<h3>La quincaillerie est defectueuse</h3>

<p>Poignees, cremones, charnières, mecanismes d'ouverture : toutes ces pieces se remplacent individuellement. Une fenetre qui ne ferme plus correctement n'est pas necessairement une fenetre a remplacer. C'est souvent un simple probleme de quincaillerie.</p>

<h2>Quand le remplacement est necessaire</h2>

<p>Il y a des situations ou reparer n'est plus viable, et le remplacement complet devient le meilleur investissement :</p>

<h3>Le cadre est pourri ou gravement endommage</h3>

<p>Les fenetres en bois non entretenues sont les plus susceptibles de developper de la pourriture, surtout au bas du cadre ou l'eau s'accumule. Si la pourriture est etendue et a compromis l'integrite structurelle du cadre, la reparation n'est pas realiste. De meme, un cadre d'aluminium severement corrode ou un cadre de PVC qui a jauni, craque et perdu sa rigidite indiquent qu'il est temps de changer.</p>

<h3>Les fenetres sont tres anciennes (simple vitrage)</h3>

<p>Si votre maison a encore des fenetres a simple vitrage (un seul panneau de verre, sans unite scellee), le remplacement par des fenetres a double vitrage modernes est un investissement tres rentable. La difference de performance energetique est enorme.</p>

<h3>Vous renovez en profondeur</h3>

<p>Si vous faites une renovation majeure qui inclut l'isolation des murs, le remplacement du revetement exterieur ou des modifications structurelles autour des ouvertures, c'est le moment ideal pour remplacer les fenetres aussi. Les couts marginaux sont plus faibles quand les travaux sont combines.</p>

<h3>L'infiltration d'eau est recurrente</h3>

<p>Si l'eau s'infiltre autour du cadre de la fenetre malgre le calfeutrage, il peut y avoir un probleme d'installation d'origine ou de deterioration avancee du cadre qui necessite un remplacement complet avec une installation conforme aux normes actuelles.</p>

<h2>Analyse du retour sur investissement</h2>

<p>Examinons les chiffres concretement pour une maison typique de la region de Montreal avec 15 fenetres dont le thermos est embue :</p>

<ul>
<li><strong>Remplacement complet des 15 fenetres</strong> : 12 000 a 22 500 $ (800 a 1 500 $ par fenetre)</li>
<li><strong>Remplacement des 15 thermos seulement</strong> : 2 250 a 5 250 $ (150 a 350 $ par fenetre)</li>
<li><strong>Economie d'energie estimee</strong> : similaire dans les deux cas si les cadres sont en bon etat</li>
<li><strong>Economie immediate</strong> : 9 750 a 17 250 $ en optant pour la reparation</li>
</ul>

<p>L'economie d'energie apportee par un thermos neuf est pratiquement la meme qu'on remplace seulement le thermos ou la fenetre complete, puisque c'est le vitrage qui est responsable de la majorite des pertes thermiques a travers la fenetre. Le cadre joue un role secondaire dans l'isolation, a moins qu'il soit en tres mauvais etat.</p>

<h2>Les credits et subventions</h2>

<p>Certains programmes gouvernementaux offrent des incitatifs financiers pour l'amelioration de l'efficacite energetique. Le programme Renoclimat d'Hydro-Quebec et le programme federal Maisons plus vertes peuvent offrir des remises sur le remplacement de fenetres. Cependant, ces programmes exigent generalement le remplacement <strong>complet</strong> de la fenetre (cadre inclus) pour etre admissible. Renseignez-vous aupres des programmes en vigueur avant de prendre votre decision.</p>

<p>Meme avec les subventions, le remplacement complet reste souvent plus couteux que la reparation. Les subventions couvrent rarement plus de 10 a 20% du cout total. Faites le calcul pour votre situation specifique.</p>

<h2>Notre recommandation</h2>

<p>Chez Vosthermos, notre approche est simple : nous recommandons toujours la solution la plus avantageuse pour le client. Si vos cadres sont en bon etat, nous privilegierons la reparation. Si le remplacement est la meilleure option, nous vous le dirons aussi. Notre evaluation est gratuite et sans engagement.</p>

<p><strong>Pour une evaluation honnete de l'etat de vos fenetres et une recommandation personnalisee, appelez Vosthermos au 514-825-8411. Nous desservons Montreal, Longueuil, Brossard, Saint-Hubert, Laval et toute la Rive-Sud.</strong></p>
`
  },

  // ─── Article 5 ───────────────────────────────────────────────────────────────
  {
    title: "Pourquoi la buee dans vos fenetres est plus qu'un probleme esthetique",
    excerpt: "La buee entre les vitres thermos n'est pas qu'un desagrement visuel. Decouvrez les consequences reelles sur votre sante, votre confort et votre portefeuille.",
    category: 'conseils',
    tags: ['buee', 'thermos', 'efficacite-energetique', 'confort'],
    publishedAt: daysAgo(42),
    content: `
<h2>Au-dela de l'apparence : les vrais enjeux d'un thermos defectueux</h2>

<p>Beaucoup de proprietaires vivent avec de la buee dans leurs fenetres pendant des annees en se disant que c'est un probleme purement esthetique. Apres tout, on voit encore a travers, la fenetre tient toujours en place, et il y a d'autres priorites de renovation. Mais ce raisonnement est trompeur. Un thermos embue signifie que l'unite scellee a perdu son integrite, et les consequences vont bien au-dela d'une vitre embuee.</p>

<h2>La perte d'efficacite energetique : ce que ça coute vraiment</h2>

<p>Quand le scellant d'un thermos cede, le gaz argon qui remplissait l'espace entre les deux vitres s'echappe et est remplace par de l'air ordinaire. L'argon est un gaz inerte plus dense que l'air qui offre une <strong>resistance thermique 34% superieure</strong>. Sa perte reduit significativement la performance isolante de votre fenetre.</p>

<p>Mais ce n'est pas tout. L'air humide qui remplace l'argon conduit la chaleur plus efficacement que le gaz sec d'origine. En hiver, la surface interieure de la vitre devient plus froide, ce qui cree une zone de confort reduite pres de la fenetre et force votre systeme de chauffage a travailler plus fort.</p>

<p>Selon les donnees d'Hydro-Quebec, les fenetres sont responsables de <strong>20 a 30% des pertes de chaleur</strong> d'une maison. Un thermos defectueux peut augmenter cette proportion de facon significative. Pour une maison chauffee a l'electricite dans la region de Montreal, chaque fenetre au thermos embue peut representer un surcout de <strong>40 a 100 $ par annee</strong> en chauffage, selon sa taille et son orientation. Multipliez par le nombre de fenetres affectees et par les annees ou vous repoussez la reparation, et le cout de l'inaction depasse rapidement celui du remplacement.</p>

<h2>Les risques pour la sante : moisissures et qualite de l'air</h2>

<p>C'est l'aspect le moins connu mais potentiellement le plus serieux. Un thermos defectueux cree une zone froide sur la surface interieure de la vitre. En hiver, cette zone froide provoque de la <strong>condensation sur le cote interieur de la fenetre</strong> (pas entre les vitres, mais sur la surface cote maison). Cette condensation coule le long du verre et s'accumule dans le bas du cadre de la fenetre.</p>

<p>L'humidite persistante dans le cadre de la fenetre cree un environnement ideal pour la croissance de <strong>moisissures</strong>. Les moisissures dans l'encadrement des fenetres sont un probleme courant dans les maisons quebecoises en hiver, et les thermos defectueux en sont souvent une cause contribuante.</p>

<p>Les moisissures ne sont pas qu'un probleme esthetique. Elles liberent des spores dans l'air interieur qui peuvent causer :</p>

<ul>
<li>Des reactions allergiques (eternuements, yeux qui piquent, congestion nasale)</li>
<li>De l'irritation des voies respiratoires</li>
<li>Une aggravation de l'asthme</li>
<li>Des maux de tete et de la fatigue chez les personnes sensibles</li>
<li>Dans les cas graves et prolonges, des infections respiratoires</li>
</ul>

<p>Les enfants, les personnes agees et les personnes avec des conditions respiratoires existantes sont particulierement vulnerables. Si vous avez de la moisissure recurrente autour de vos fenetres en hiver, des thermos defectueux pourraient en etre la cause.</p>

<h2>Le confort thermique : l'effet de paroi froide</h2>

<p>Meme si votre thermostat indique 21 degres Celsius, vous pouvez avoir froid pres d'une fenetre au thermos defectueux. C'est a cause de l'<strong>effet de paroi froide</strong> (ou rayonnement froid). Votre corps echange constamment de la chaleur par rayonnement avec les surfaces environnantes. Si la surface interieure d'une vitre est a 5 ou 10 degres Celsius au lieu de 15 a 18 degres comme elle devrait l'etre avec un thermos fonctionnel, vous ressentez un inconfort meme si l'air ambiant est a bonne temperature.</p>

<p>Cet effet est particulierement prononce dans les pieces avec de grandes surfaces vitrees, comme un salon avec une porte-patio ou une chambre avec une grande fenetre. Les gens compensent souvent en montant le chauffage, ce qui augmente la facture d'energie sans vraiment resoudre le probleme. La seule solution durable est de restaurer la performance isolante de la vitre en remplacant le thermos.</p>

<h2>L'impact sur la valeur de votre propriete</h2>

<p>Des fenetres embuees sont l'un des premiers elements que remarquent les acheteurs potentiels lors d'une visite. C'est un <strong>signal d'alarme</strong> qui souleve des questions sur l'entretien general de la maison. Lors d'une inspection pre-achat, chaque thermos embue sera note dans le rapport, et les acheteurs utiliseront ce point pour negocier le prix a la baisse.</p>

<p>Le cout percu par les acheteurs est souvent bien superieur au cout reel du remplacement. Un acheteur qui voit 8 fenetres embuees pensera qu'il faut remplacer toutes les fenetres de la maison (10 000 a 20 000 $), alors qu'en realite, le remplacement des 8 thermos couterait peut-etre 2 000 a 3 000 $. En reparant avant de vendre, vous evitez une devaluation disproportionnee de votre propriete.</p>

<h2>L'aggravation progressive</h2>

<p>Un thermos embue ne s'ameliore jamais tout seul. <strong>La situation ne peut qu'empirer avec le temps.</strong> L'humidite qui s'infiltre entre les vitres depose des mineraux sur la surface interieure du verre. Au debut, ces depots sont invisibles et la buee semble apparaitre et disparaitre. Avec le temps, les depots s'accumulent et forment un voile blanchatre permanent qui ne disparait plus, meme par temps sec et chaud.</p>

<p>A ce stade avance, la visibilite a travers la fenetre est severement reduite et le probleme esthetique devient vraiment genial. Mais surtout, la deterioration continue du scellant peut eventuellement affecter la stabilite structurelle de l'unite scellee, augmentant le risque de bris.</p>

<h2>Agir maintenant plutot qu'attendre</h2>

<p>Chaque saison de chauffage qui passe avec des thermos defectueux, c'est de l'argent depense en chauffage supplementaire, un risque accru de moisissures et une degradation progressive de vos fenetres. Le remplacement du thermos est une intervention rapide (30 minutes par fenetre), propre (tout se fait de l'interieur) et abordable comparativement aux benefices qu'elle procure.</p>

<p>Vosthermos remplace les thermos de toutes les marques de fenetres, pour les maisons, condos et commerces de la grande region de Montreal. Nos thermos de remplacement sont offerts avec ou sans verre Low-E et gaz argon selon vos besoins et votre budget.</p>

<p><strong>Ne laissez pas la buee vous couter plus cher qu'elle ne le devrait. Appelez Vosthermos au 514-825-8411 pour une soumission gratuite. Nous intervenons rapidement partout a Montreal, sur la Rive-Sud et a Laval.</strong></p>
`
  },

  // ─── Article 6 ───────────────────────────────────────────────────────────────
  {
    title: "L'importance du calfeutrage avant l'hiver quebecois",
    excerpt: "Le calfeutrage exterieur de vos fenetres et portes est votre premiere defense contre le froid. Apprenez pourquoi il est crucial de le verifier avant chaque hiver.",
    category: 'entretien',
    tags: ['calfeutrage', 'hiver', 'isolation', 'chauffage'],
    publishedAt: daysAgo(35),
    content: `
<h2>Le calfeutrage : la premiere ligne de defense de votre maison</h2>

<p>Le calfeutrage est ce cordon de mastic souple applique autour de l'exterieur de vos fenetres et portes, la ou le cadre rencontre le mur. Son role est de sceller cette jonction pour empecher l'eau, l'air froid et les insectes de s'infiltrer dans la structure de votre maison. C'est un element d'entretien souvent neglige, mais son impact sur le confort et l'efficacite energetique de votre maison est considerable.</p>

<p>Au Quebec, le calfeutrage subit un stress extreme. Les ecarts de temperature de plus de 60 degres Celsius entre l'ete et l'hiver font travailler les materiaux : le bois, l'aluminium, le vinyle et la maçonnerie se dilatent et se contractent a des rythmes differents. Apres quelques annees, meme le meilleur calfeutrage finit par se fissurer, se decoller ou durcir au point de perdre son etancheite.</p>

<h2>Les signes qu'il est temps de refaire le calfeutrage</h2>

<p>Inspectez le calfeutrage exterieur de toutes vos fenetres et portes au moins une fois par annee, idealement a la fin de l'ete. Voici les signes a surveiller :</p>

<h3>Fissures et craquelures</h3>

<p>Le signe le plus evident. Des fissures dans le calfeutrage, meme petites, permettent a l'eau et a l'air de s'infiltrer. L'eau qui s'infiltre derriere le cadre de la fenetre peut causer des dommages importants a la structure du mur, pourriture du bois, corrosion de l'acier, deterioration de l'isolant, et eventuellement des moisissures cachees dans les murs.</p>

<h3>Decollement</h3>

<p>Le calfeutrage ne fait plus contact avec le cadre de la fenetre ou avec le revetement du mur. On peut voir un espace entre le mastic et la surface. C'est souvent le cas quand un calfeutrage de mauvaise qualite a ete utilise ou quand la surface n'a pas ete preparee correctement avant l'application.</p>

<h3>Durcissement</h3>

<p>Le calfeutrage qui a perdu toute souplesse et qui est devenu dur comme du plastique ne peut plus suivre les mouvements de dilatation et de contraction. Il va inevitablement se fissurer ou se decoller. Pressez le calfeutrage avec votre ongle : s'il ne reprend pas sa forme, il est temps de le remplacer.</p>

<h3>Moisissure ou decoloration</h3>

<p>Un calfeutrage qui presente de la moisissure en surface ou qui a change de couleur significativement peut indiquer que l'humidite s'accumule derriere. C'est un signe qu'il faut agir rapidement.</p>

<h2>Les types de calfeutrage : choisir le bon produit</h2>

<p>Le choix du produit est crucial pour la longueur du resultat. Tous les calfeutrages ne sont pas egaux :</p>

<h3>Silicone pur</h3>

<p>Le plus durable et le plus flexible. Il resiste aux temperatures extremes (-40 a +200 degres Celsius), aux rayons UV et ne durcit pas avec le temps. Duree de vie : 20 a 50 ans. <strong>Inconvenient</strong> : il ne se peint pas et degage une odeur d'acide acetique pendant le sechage. Ideal pour les endroits ou la couleur naturelle (blanc ou transparent) est acceptable.</p>

<h3>Polyurethane</h3>

<p>Excellent produit, durable et se peint. Bonne adhesion sur la plupart des surfaces. Duree de vie : 15 a 25 ans. C'est le choix recommande pour la majorite des applications de calfeutrage exterieur de fenetres et portes quand on desire peindre par-dessus.</p>

<h3>Latex acrylique (avec silicone)</h3>

<p>Le produit le plus courant et le plus economique. Facile a appliquer, se peint, se nettoie a l'eau. Cependant, sa duree de vie est nettement inferieure : 5 a 10 ans. Il a tendance a durcir et a fissurer plus rapidement que le silicone ou le polyurethane, surtout sous notre climat. C'est un choix acceptable pour les zones protegees, mais evitez-le pour les expositions sud et ouest ou le soleil est intense.</p>

<h3>Mousse expansive</h3>

<p>Ce n'est pas du calfeutrage au sens traditionnel, mais elle est utilisee pour remplir les espaces plus larges autour des cadres de fenetres et de portes. La mousse de faible expansion est recommandee pour les fenetres, car la mousse a haute expansion peut deformer les cadres. Elle doit toujours etre protegee des UV par du calfeutrage, de la peinture ou un revetement.</p>

<h2>Comment bien appliquer le calfeutrage</h2>

<p>La preparation de la surface est la cle d'un calfeutrage durable :</p>

<ul>
<li><strong>Retirez completement l'ancien calfeutrage.</strong> N'appliquez jamais du nouveau par-dessus l'ancien. Utilisez un couteau a mastic, un grattoir ou un outil de retrait specialise. Les residus tenaces peuvent etre ramollis avec un dissolvant a calfeutrage.</li>
<li><strong>Nettoyez la surface.</strong> Enlevez la poussiere, la saleté, les residus de mastic, la peinture ecaillee. La surface doit etre propre et seche.</li>
<li><strong>Appliquez un apprêt si necessaire.</strong> Certains calfeutrages adherent mieux avec un apprêt (primer), surtout sur les surfaces poreuses comme la brique ou le beton.</li>
<li><strong>Coupez la buse a 45 degres</strong> pour un cordon uniforme. Le diametre du trou doit correspondre a la largeur du joint a remplir.</li>
<li><strong>Appliquez en un mouvement continu</strong> en maintenant une pression constante. Evitez les arrets et reprises qui creent des points faibles.</li>
<li><strong>Lissez immediatement</strong> avec un doigt mouille ou un outil de lissage pour un fini propre et un bon contact avec les deux surfaces.</li>
</ul>

<h2>Le meilleur moment pour calfeutrer</h2>

<p>La temperature ideale pour appliquer du calfeutrage est entre <strong>10 et 25 degres Celsius</strong>. Evitez les journees trop chaudes (le produit sechera trop vite) ou trop froides (adhesion reduite). A Montreal et sur la Rive-Sud, la fenetre ideale se situe entre la mi-aout et la mi-octobre. Evitez d'appliquer du calfeutrage sous la pluie ou si de la pluie est prevue dans les 24 heures suivantes.</p>

<h2>Le calfeutrage interieur : souvent oublie</h2>

<p>On pense surtout au calfeutrage exterieur, mais le calfeutrage interieur est tout aussi important. Le joint entre le cadre de la fenetre et le mur interieur (souvent cache par la moulure) joue un role de pare-air. Si ce joint est defectueux, l'air chaud et humide de la maison peut s'infiltrer dans la cavite murale, causer de la condensation a l'interieur du mur et provoquer des moisissures invisibles. Lors du remplacement de moulures ou de travaux autour des fenetres, c'est le moment ideal de verifier et de refaire ce joint interieur.</p>

<p><strong>Le calfeutrage de vos fenetres est du? L'equipe de Vosthermos offre un service complet de calfeutrage exterieur et interieur pour fenetres et portes. Appelez-nous au 514-825-8411 pour une soumission gratuite. Nous intervenons rapidement avant l'hiver dans toute la region de Montreal.</strong></p>
`
  },

  // ─── Article 7 ───────────────────────────────────────────────────────────────
  {
    title: 'Comment choisir la bonne moustiquaire pour chaque type de fenetre',
    excerpt: 'Moustiquaire fixe, coulissante, retractable ou a ressort? Apprenez a choisir le bon modele, le bon materiau et les bonnes dimensions pour chaque fenetre de votre maison.',
    category: 'guides',
    tags: ['moustiquaire', 'fenetres', 'ete', 'insectes'],
    publishedAt: daysAgo(28),
    content: `
<h2>Pourquoi une bonne moustiquaire fait toute la difference</h2>

<p>Au Quebec, l'ete est court mais intense. De mai a septembre, les moustiques, mouches noires, guepes et autres insectes rendent la vie difficile si vos fenetres ne sont pas equipees de moustiquaires fonctionnelles. Une moustiquaire en bon etat vous permet de profiter de l'air frais sans inviter les bestioles a l'interieur. C'est aussi un moyen de reduire l'utilisation de la climatisation en ouvrant simplement les fenetres les soirs plus frais.</p>

<p>Pourtant, beaucoup de proprietaires vivent avec des moustiquaires dechirees, mal ajustees ou tout simplement absentes. C'est souvent parce qu'ils ne savent pas comment les remplacer ou quel modele choisir. Ce guide vous eclairera sur les differentes options disponibles.</p>

<h2>Les types de moustiquaires selon le type de fenetre</h2>

<h3>Fenetres coulissantes (a guillotine ou horizontales)</h3>

<p>Les fenetres coulissantes sont les plus courantes dans les maisons quebecoises. Pour les fenetres a guillotine (qui montent et descendent), la moustiquaire coulissante est le choix standard. Elle s'insere dans les rails du cadre de la fenetre et peut etre retiree facilement pour le nettoyage ou le rangement hivernal.</p>

<p>Pour les fenetres coulissantes horizontales, la moustiquaire coulisse sur un rail parallele au panneau de verre. Elle couvre la moitie ouvrable de la fenetre. Assurez-vous que la moustiquaire glisse librement dans ses rails; si elle coince, les rails sont peut-etre sales ou les galets uses.</p>

<h3>Fenetres a battant (a manivelle)</h3>

<p>Les fenetres a battant s'ouvrent vers l'exterieur avec une manivelle. La moustiquaire est fixee a l'interieur, sur le cadre de la fenetre. Elle peut etre de type fixe (clips a ressort) ou a enroulement. La moustiquaire fixe est la plus simple et la moins couteuse. La moustiquaire a enroulement (retractable) est plus pratique car elle disparait dans son boitier quand on ne l'utilise pas, ce qui maximise la vue et la lumiere.</p>

<h3>Fenetres a auvent</h3>

<p>Similaires aux fenetres a battant mais elles s'ouvrent par le bas. La moustiquaire est aussi installee a l'interieur. Les options sont les memes que pour les fenetres a battant : fixe a clips ou retractable.</p>

<h3>Portes-patio coulissantes</h3>

<p>Les portes-patio necessitent une moustiquaire pleine grandeur qui coulisse sur un rail dedie. C'est la moustiquaire qui subit le plus d'usure en raison de son utilisation frequente et de sa grande taille. Les roulettes, la poignee et la toile sont les trois elements qui s'usent le plus rapidement. Une moustiquaire de porte-patio de qualite a un cadre en aluminium robuste avec des roulettes a roulement a billes.</p>

<h3>Portes d'entree</h3>

<p>Les contre-portes avec moustiquaire integree sont le choix classique. Elles combinent un panneau vitre pour l'hiver et une moustiquaire pour l'ete, avec un systeme coulissant qui permet de passer de l'un a l'autre. Les portes-moustiquaires retractables sont une alternative moderne qui disparaissent dans un boitier lateral quand elles ne sont pas utilisees.</p>

<h2>Les materiaux de toile : avantages et inconvenients</h2>

<h3>Fibre de verre</h3>

<p>C'est le materiau le plus courant et le plus economique. La toile en fibre de verre est souple, facile a installer et offre une bonne visibilite. Elle resiste bien aux UV et ne corrode pas. <strong>Inconvenient</strong> : elle est relativement fragile et peut se dechirer facilement sous la pression d'un animal ou d'un enfant. Duree de vie typique : 5 a 10 ans.</p>

<h3>Aluminium</h3>

<p>Plus robuste que la fibre de verre, la toile en aluminium resiste mieux aux impacts et aux griffures. Elle est un bon choix si vous avez des animaux domestiques. <strong>Inconvenient</strong> : elle est plus rigide, plus difficile a installer et peut se bosseler. Elle peut aussi corroder avec le temps, surtout en milieu humide. La visibilite est legerement reduite par rapport a la fibre de verre.</p>

<h3>Toile "Pet Screen" (polyester haute resistance)</h3>

<p>Conçue specifiquement pour resister aux griffes d'animaux, cette toile est environ <strong>7 fois plus resistante</strong> que la fibre de verre standard. C'est le choix ideal si vous avez des chats ou des chiens qui ont tendance a s'appuyer sur la moustiquaire. Elle est plus epaisse et reduit legerement la visibilite et le flux d'air, mais sa durabilite est incomparable.</p>

<h3>Toile "No-See-Um" (maille ultrafine)</h3>

<p>Avec une maille plus serree que la moustiquaire standard, cette toile bloque les insectes minuscules comme les brulots et les mouches de sable. Recommandee si vous habitez pres d'un plan d'eau ou en zone rurale ou ces insectes sont problematiques. <strong>Inconvenient</strong> : elle reduit le flux d'air et la visibilite de facon notable.</p>

<h3>Toile solaire (screen)</h3>

<p>Cette toile a maille plus dense bloque une partie des rayons du soleil, reduisant la chaleur et l'eblouissement. Elle offre aussi plus d'intimite depuis l'exterieur. C'est un bon choix pour les fenetres exposees plein sud ou ouest. Le flux d'air est reduit mais la protection solaire peut compenser en diminuant le besoin de climatisation.</p>

<h2>Prendre les bonnes mesures</h2>

<p>Des mesures precises sont essentielles pour une moustiquaire qui s'ajuste parfaitement :</p>

<ul>
<li><strong>Mesurez la largeur</strong> a trois endroits (haut, milieu, bas) et notez la plus petite mesure.</li>
<li><strong>Mesurez la hauteur</strong> a trois endroits (gauche, centre, droite) et notez la plus petite mesure.</li>
<li><strong>Verifiez l'equarri</strong> en mesurant les diagonales. Si la difference entre les deux diagonales depasse 3 mm, le cadre n'est pas parfaitement carre et il faudra en tenir compte.</li>
<li><strong>Notez le type de fixation</strong> : rails, clips a ressort, clips a tourner, systeme de tension.</li>
</ul>

<h2>Entretien et rangement</h2>

<p>Pour prolonger la duree de vie de vos moustiquaires :</p>

<ul>
<li>Nettoyez-les au moins une fois par ete avec de l'eau savonneuse et une brosse douce.</li>
<li>Rincez abondamment et laissez secher avant de les reinstaller.</li>
<li>Retirez les moustiquaires a l'automne si possible (surtout celles des fenetres coulissantes). Le poids de la neige et de la glace peut les deformer.</li>
<li>Rangez-les a la verticale dans un endroit sec, pas empilees a plat.</li>
<li>Reparez les petits trous immediatement avec un kit de reparation (quelques dollars en quincaillerie) avant qu'ils ne s'agrandissent.</li>
</ul>

<h2>Le retissage : quand et comment</h2>

<p>Si la toile est dechiree mais que le cadre est en bon etat, le retissage est la solution la plus economique. L'operation consiste a retirer l'ancienne toile et son cordon de retention (spline), poser la nouvelle toile sur le cadre et l'inserer dans la gorge avec un nouveau cordon a l'aide d'un outil a roulette. C'est une operation que Vosthermos effectue regulierement, avec des delais rapides et a un cout bien inferieur au remplacement du cadre complet.</p>

<p><strong>Besoin de nouvelles moustiquaires ou d'un retissage? Appelez Vosthermos au 514-825-8411. Nous fabriquons et retissons des moustiquaires sur mesure pour tous les types de fenetres et portes, avec le materiau de votre choix. Service rapide dans la region de Montreal et la Rive-Sud.</strong></p>
`
  },

  // ─── Article 8 ───────────────────────────────────────────────────────────────
  {
    title: 'Economiser sur le chauffage en reparant vos fenetres',
    excerpt: "Decouvrez combien vous pourriez economiser en reparant vos fenetres defectueuses. Chiffres concrets, retour sur investissement et conseils pratiques pour reduire votre facture d'Hydro-Quebec.",
    category: 'conseils',
    tags: ['chauffage', 'economie', 'energie', 'thermos'],
    publishedAt: daysAgo(21),
    content: `
<h2>Vos fenetres : le maillon faible de votre enveloppe thermique</h2>

<p>Au Quebec, le chauffage represente environ <strong>54% de la consommation d'energie</strong> d'une maison, selon Hydro-Quebec. C'est le poste de depense energetique le plus important, et il est directement influence par la qualite de l'enveloppe thermique de votre maison : murs, toit, fondation et surtout fenetres.</p>

<p>Les fenetres, meme en bon etat, sont le point le plus faible de l'isolation. Un mur bien isole a une valeur R de 20 a 30, tandis qu'une fenetre a double vitrage performante atteint une valeur R d'environ 3 a 4. C'est 5 a 10 fois moins isolant. Quand les fenetres sont defectueuses, thermos embues, coupe-froid uses, calfeutrage fissure, les pertes de chaleur a travers les fenetres augmentent encore davantage.</p>

<h2>Combien perdez-vous reellement?</h2>

<p>Mettons des chiffres concrets sur la situation. Pour une maison typique de la Rive-Sud de Montreal :</p>

<ul>
<li><strong>Surface de fenestration moyenne</strong> : 15 a 25 m2 (15 a 20 fenetres)</li>
<li><strong>Cout de chauffage annuel moyen</strong> : 1 500 a 2 500 $ (chauffage electrique)</li>
<li><strong>Proportion attribuable aux fenetres</strong> : 20 a 30%, soit 300 a 750 $ par annee</li>
</ul>

<p>Maintenant, si certaines de vos fenetres sont defectueuses :</p>

<ul>
<li><strong>Un thermos embue</strong> perd environ 30 a 50% de sa capacite isolante. Pour une fenetre de taille moyenne, cela represente un surcout de 40 a 80 $ par annee en chauffage.</li>
<li><strong>Un coupe-froid use</strong> laisse passer l'equivalent de 2 a 5 centimetres carres d'ouverture. C'est comme avoir un petit trou permanent dans votre mur. Surcout estime : 20 a 50 $ par fenetre par annee.</li>
<li><strong>Un calfeutrage fissure</strong> sur le pourtour exterieur permet des infiltrations d'air qui refroidissent la cavite murale autour de la fenetre. Surcout : 10 a 30 $ par fenetre par annee.</li>
</ul>

<p>Pour une maison avec 5 thermos embues, 8 coupe-froid a remplacer et un calfeutrage exterieur a refaire sur 10 fenetres, le surcout annuel en chauffage peut facilement atteindre <strong>500 a 900 $</strong>. Sur 5 ans sans intervention, c'est 2 500 a 4 500 $ depenses en chauffage inutilement.</p>

<h2>Le retour sur investissement de chaque reparation</h2>

<p>Voyons le retour sur investissement (ROI) de chaque type de reparation :</p>

<h3>Remplacement des thermos embues</h3>

<p>Cout moyen : 200 a 350 $ par fenetre. Economie annuelle estimee : 50 a 80 $ par fenetre. <strong>ROI : 3 a 5 ans.</strong> C'est un excellent investissement, surtout que le nouveau thermos durera 15 a 25 ans. Sur sa duree de vie, il vous fera economiser bien plus que son cout d'achat.</p>

<h3>Remplacement des coupe-froid</h3>

<p>Cout moyen : 50 a 150 $ par fenetre (main-d'oeuvre incluse). Economie annuelle estimee : 25 a 50 $ par fenetre. <strong>ROI : 1 a 3 ans.</strong> C'est la reparation la plus rentable, avec un retour quasi immediat. Les coupe-froid neufs ameliorent aussi significativement le confort en eliminant les courants d'air.</p>

<h3>Refection du calfeutrage exterieur</h3>

<p>Cout moyen : 15 a 40 $ par fenetre. Economie annuelle estimee : 15 a 30 $ par fenetre. <strong>ROI : 1 a 2 ans.</strong> Un investissement minimal pour un resultat immediat. Le calfeutrage protege aussi votre maison contre les infiltrations d'eau, prevenant des dommages beaucoup plus couteux.</p>

<h3>Ajustement de la quincaillerie</h3>

<p>Cout moyen : 50 a 100 $ par fenetre. Economie energetique directe : modeste, mais une fenetre qui ferme correctement offre une bien meilleure etancheite. Le benefice principal est la securite et la fonctionnalite, mais l'impact energetique est reel aussi.</p>

<h2>La strategie optimale : prioriser les reparations</h2>

<p>Si votre budget est limite, voici l'ordre dans lequel prioriser les reparations pour maximiser les economies d'energie :</p>

<ul>
<li><strong>Priorite 1 : Coupe-froid et calfeutrage.</strong> Le meilleur rapport cout-benefice. Faites toutes les fenetres et portes en meme temps.</li>
<li><strong>Priorite 2 : Thermos embues des grandes fenetres.</strong> Plus la surface vitree est grande, plus l'impact d'un thermos defectueux est important. Commencez par les portes-patio et les grandes fenetres de salon.</li>
<li><strong>Priorite 3 : Thermos des fenetres exposees au nord.</strong> Les fenetres orientees au nord reçoivent peu de chaleur solaire et sont soumises aux vents froids. Un thermos defectueux a cet endroit a un impact proportionnellement plus grand.</li>
<li><strong>Priorite 4 : Thermos des fenetres restantes.</strong> Completez les autres fenetres quand le budget le permet.</li>
</ul>

<h2>Au-dela des fenetres : les gains rapides</h2>

<p>Pendant que vous faites reparer vos fenetres, voici d'autres gestes simples pour reduire votre facture de chauffage :</p>

<ul>
<li><strong>Pellicule isolante</strong> : pour les fenetres que vous n'ouvrez pas en hiver, une pellicule de plastique retractable (kit disponible en quincaillerie pour 5 a 10 $) ajoute une couche d'air isolante. Ce n'est pas elegant mais c'est tres efficace comme mesure temporaire.</li>
<li><strong>Rideaux thermiques</strong> : des rideaux epais doublés peuvent reduire les pertes de chaleur par les fenetres de 10 a 25%. Fermez-les la nuit et ouvrez-les le jour pour profiter du gain solaire.</li>
<li><strong>Seuils de porte</strong> : verifiez le bas de vos portes exterieures. Un jour de quelques millimetres sous la porte est equivalent a un trou de la taille d'une balle de golf dans votre mur.</li>
<li><strong>Prises electriques</strong> : les prises et interrupteurs sur les murs exterieurs sont souvent source d'infiltrations. Des isolants en mousse a 2 $ l'unite (derriere la plaque) font une difference.</li>
</ul>

<h2>Les programmes d'aide financiere</h2>

<p>Hydro-Quebec et les gouvernements provincial et federal offrent periodiquement des programmes pour encourager l'efficacite energetique. Le programme Renoclimat offre des subventions pour certains travaux d'isolation, incluant parfois le remplacement de fenetres. Verifiez les programmes en cours avant d'entreprendre vos travaux, car l'admissibilite depend souvent de conditions specifiques (evaluation energetique prealable, type de travaux, etc.).</p>

<p>Chez Vosthermos, nous pouvons vous guider sur les reparations qui offrent le meilleur retour sur investissement pour votre situation specifique. Chaque maison est differente, et nos techniciens evaluent l'ensemble de vos fenetres pour recommander les interventions les plus avantageuses.</p>

<p><strong>Pret a reduire votre facture de chauffage? Contactez Vosthermos au 514-825-8411 pour une evaluation gratuite de vos fenetres. Nous identifierons les sources de pertes de chaleur et vous proposerons un plan de reparation adapte a votre budget. Service disponible a Montreal, Rive-Sud et Laval.</strong></p>
`
  },

  // ─── Article 9 ───────────────────────────────────────────────────────────────
  {
    title: 'Les avantages du verre Low-E et argon pour vos thermos',
    excerpt: "Qu'est-ce que le verre Low-E et le gaz argon? Comment ces technologies ameliorent l'efficacite de vos fenetres et quand valent-elles l'investissement supplementaire?",
    category: 'guides',
    tags: ['low-e', 'argon', 'thermos', 'technologie'],
    publishedAt: daysAgo(14),
    content: `
<h2>La technologie au service du confort</h2>

<p>Quand vient le temps de remplacer un thermos de fenetre, vous entendrez probablement parler de verre Low-E et de gaz argon. Ces technologies sont devenues la norme dans l'industrie de la fenestration, mais beaucoup de proprietaires ne comprennent pas exactement ce qu'elles font ni si elles valent le cout supplementaire. Cet article demystifie ces technologies et vous aide a faire un choix eclaire.</p>

<h2>Qu'est-ce que le verre Low-E?</h2>

<p>Low-E signifie "low emissivity" ou faible emissivite. C'est un <strong>revetement metallique microscopique</strong> applique sur l'une des surfaces du verre au cours de la fabrication. Ce revetement est invisible a l'oeil nu, vous ne le verrez pas et ne sentirez aucune difference au toucher.</p>

<p>Le role du revetement Low-E est de controler le transfert de chaleur par rayonnement a travers le verre. Pour comprendre, il faut savoir que la chaleur traverse une fenetre de trois façons : par conduction (a travers le materiau), par convection (par les mouvements d'air) et par rayonnement (par les ondes infrarouges). Le verre Low-E agit specifiquement sur le rayonnement, qui represente environ <strong>60% des transferts de chaleur</strong> a travers une fenetre standard.</p>

<h3>Comment ça fonctionne en hiver</h3>

<p>En hiver, la chaleur de votre maison rayonne vers l'exterieur a travers les fenetres. Le revetement Low-E agit comme un miroir pour les ondes infrarouges : il <strong>reflechit la chaleur interieure vers l'interieur</strong> de la maison au lieu de la laisser traverser le verre. Resultat : la chaleur reste a l'interieur, la surface interieure de la vitre est plus chaude, et votre systeme de chauffage travaille moins.</p>

<h3>Comment ça fonctionne en ete</h3>

<p>En ete, le processus s'inverse. Le soleil chauffe l'exterieur et cette chaleur essaie de penetrer a l'interieur par rayonnement. Le revetement Low-E reflechit une partie de cette chaleur solaire vers l'exterieur, reduisant le gain thermique solaire et gardant votre maison plus fraiche. Cela reduit la charge sur votre climatisation.</p>

<h3>Les differents types de Low-E</h3>

<p>Il existe deux grandes categories de revetement Low-E :</p>

<ul>
<li><strong>Low-E "hard coat" (pyrolytique)</strong> : applique pendant la fabrication du verre a haute temperature. Plus durable mais moins performant. Moins courant aujourd'hui.</li>
<li><strong>Low-E "soft coat" (sputtered)</strong> : applique en usine sous vide apres la fabrication du verre. Plus performant, c'est le type le plus utilise dans les thermos modernes. Il doit etre protege a l'interieur de l'unite scellee car il est fragile expose a l'air.</li>
</ul>

<p>Il existe aussi differentes "recettes" de Low-E adaptees aux differents climats. Au Quebec, on utilise generalement un Low-E optimise pour <strong>le gain solaire</strong> (Solar Heat Gain Coefficient eleve), car nous voulons maximiser la chaleur gratuite du soleil en hiver. Dans les regions chaudes, on utilise plutot un Low-E qui bloque le gain solaire.</p>

<h2>Qu'est-ce que le gaz argon?</h2>

<p>Le gaz argon est un gaz inerte, inodore et non toxique qui remplit l'espace entre les deux vitres du thermos. Il remplace l'air qui remplirait normalement cet espace. L'argon est <strong>plus dense que l'air</strong> et conduit la chaleur moins efficacement, ce qui ralentit le transfert de chaleur par conduction et convection a travers l'unite scellee.</p>

<p>L'argon reduit la valeur U du thermos (la valeur U mesure le transfert de chaleur, plus elle est basse, mieux c'est) d'environ <strong>15 a 20%</strong> par rapport a un thermos rempli d'air. C'est un gain significatif pour un cout supplementaire modeste.</p>

<h3>Et le krypton?</h3>

<p>Le krypton est un autre gaz inerte encore plus performant que l'argon (environ 40% de reduction de la valeur U). Cependant, il est beaucoup plus couteux. Le krypton est generalement reserve aux thermos a triple vitrage ou l'espace entre les vitres est plus mince, car le krypton performe mieux que l'argon dans les espaces etroits. Pour un thermos standard a double vitrage avec un espace de 12 a 16 mm, l'argon offre le meilleur rapport performance-prix.</p>

<h2>Performance combinee : Low-E + argon</h2>

<p>L'association du verre Low-E et du gaz argon est la combinaison standard des thermos modernes performants. Voici comment les performances se comparent :</p>

<ul>
<li><strong>Thermos standard (verre clair + air)</strong> : valeur R environ 2.0</li>
<li><strong>Thermos avec Low-E seulement</strong> : valeur R environ 2.8</li>
<li><strong>Thermos avec argon seulement</strong> : valeur R environ 2.3</li>
<li><strong>Thermos Low-E + argon</strong> : valeur R environ 3.3 a 3.7</li>
<li><strong>Triple vitrage Low-E + argon</strong> : valeur R environ 5.0 a 7.0</li>
</ul>

<p>La combinaison Low-E + argon offre donc une <strong>amelioration de 65 a 85%</strong> de la valeur isolante par rapport a un thermos standard. C'est une difference enorme qui se traduit directement en confort et en economies d'energie.</p>

<h2>La certification ENERGY STAR</h2>

<p>Au Canada, le programme ENERGY STAR classe les fenetres selon leur performance energetique en differentes zones climatiques. Le Quebec est en <strong>Zone 2</strong> (la plus exigeante). Pour obtenir la certification ENERGY STAR Zone 2, une fenetre doit avoir un facteur energetique (FE) minimum de 34. En pratique, cela necessite au minimum un thermos Low-E avec argon.</p>

<p>Quand vous remplacez un thermos, meme si vous ne remplacez pas la fenetre complete, specifier un thermos Low-E avec argon vous assure que la performance de votre fenetre sera comparable a celle d'une fenetre neuve certifiee ENERGY STAR.</p>

<h2>Le cout supplementaire : est-ce que ça vaut la peine?</h2>

<p>Un thermos Low-E + argon coute en moyenne <strong>15 a 30% de plus</strong> qu'un thermos standard en verre clair. Sur un thermos de remplacement qui coute 200 $, le surcout est donc de 30 a 60 $. Pour une maison de 15 fenetres, le surcout total serait de 450 a 900 $.</p>

<p>En retour, les economies d'energie sont significatives. Dans une maison chauffee a l'electricite au Quebec, le passage de thermos standards a des thermos Low-E + argon peut reduire la facture de chauffage de <strong>8 a 15%</strong>. Sur une facture annuelle de 2 000 $, c'est 160 a 300 $ d'economies par annee. Le surcout se recupere en 2 a 4 ans.</p>

<p>Chez Vosthermos, nous offrons les deux options (verre clair standard et Low-E + argon) pour chaque remplacement de thermos. Nous recommandons systematiquement l'option Low-E + argon pour les fenetres exposees au nord et a l'ouest, ou les pertes de chaleur sont les plus importantes. Pour les fenetres exposees au sud qui beneficient d'un bon ensoleillement hivernal, un Low-E a haut gain solaire est ideal.</p>

<p><strong>Envie de profiter des avantages du verre Low-E et argon pour vos thermos de remplacement? Contactez Vosthermos au 514-825-8411. Nous vous conseillerons sur la meilleure option pour chaque fenetre de votre maison. Soumission gratuite a Montreal, Rive-Sud et Laval.</strong></p>
`
  },

  // ─── Article 10 ──────────────────────────────────────────────────────────────
  {
    title: 'Inspection printaniere de vos portes et fenetres : liste complete',
    excerpt: "Le printemps est le moment ideal pour inspecter vos portes et fenetres apres l'hiver. Suivez cette liste de verification complete pour identifier les problemes avant qu'ils ne s'aggravent.",
    category: 'entretien',
    tags: ['inspection', 'printemps', 'entretien', 'checklist'],
    publishedAt: daysAgo(7),
    content: `
<h2>Pourquoi une inspection printaniere est essentielle</h2>

<p>L'hiver quebecois est brutal pour vos portes et fenetres. Les cycles de gel et degel repetitifs, les tempetes de neige, la glace, le verglas et les ecarts de temperature extremes mettent a rude epreuve chaque composant : les vitres, les cadres, les joints d'etancheite, la quincaillerie et le calfeutrage. Le printemps est le moment ideal pour faire le bilan des degats et planifier les reparations necessaires avant le prochain hiver.</p>

<p>Une inspection methodique au printemps vous permet de <strong>detecter les problemes tot</strong>, quand ils sont encore faciles et peu couteux a reparer. Un petit probleme neglige en avril peut devenir un gros probleme couteux en novembre. De plus, les delais de reparation sont generalement plus courts au printemps et en ete qu'a l'automne, quand tout le monde se souvient en meme temps que ses fenetres ont besoin d'attention.</p>

<h2>La liste complete d'inspection</h2>

<h3>Etape 1 : Inspection visuelle exterieure</h3>

<p>Commencez par faire le tour exterieur de votre maison. Pour chaque fenetre et porte, verifiez :</p>

<ul>
<li><strong>Le calfeutrage</strong> : cherchez les fissures, les decollements, les sections manquantes. Portez une attention particuliere aux coins superieurs ou l'eau peut s'accumuler et aux rebords inferieurs exposes au ruissellement.</li>
<li><strong>Le cadre exterieur</strong> : cherchez les signes de pourriture (pour le bois), de decoloration ou de craquelures (pour le PVC), de corrosion (pour l'aluminium). Appuyez fermement avec votre pouce sur le bois des cadres, surtout en bas; si le bois cede, c'est de la pourriture.</li>
<li><strong>Les moulures et parements</strong> : verifiez que les moulures autour de la fenetre sont bien fixees et que le parement ou le revetement n'est pas decolle ou endommage a proximite des ouvertures.</li>
<li><strong>L'egouttement</strong> : les fenetres ont un systeme de drainage (trous d'egouttement au bas du cadre) pour evacuer l'eau qui s'infiltre dans la coulisse. Verifiez qu'ils ne sont pas bloques par de la salete ou des debris.</li>
<li><strong>Les appuis de fenetre</strong> : l'appui (sill) au bas de la fenetre doit etre incline vers l'exterieur pour que l'eau s'ecoule. Si l'eau stagne, verifiez que l'appui n'est pas endommage ou que du calfeutrage n'obstrue pas l'ecoulement.</li>
</ul>

<h3>Etape 2 : Inspection visuelle interieure</h3>

<p>De l'interieur, examinez chaque fenetre et porte :</p>

<ul>
<li><strong>Les vitres thermos</strong> : regardez attentivement entre les deux vitres. Y a-t-il de la buee, de la condensation, des depots blanchatres? Verifiez a differents moments de la journee, car la buee peut apparaitre et disparaitre selon la temperature. Une fenetre exposee au soleil matinal peut sembler claire le matin mais montrer de la buee l'apres-midi quand elle est a l'ombre.</li>
<li><strong>Les traces d'eau</strong> : cherchez des traces d'infiltration d'eau sur le cadre interieur, le rebord de la fenetre ou le mur autour. Des cernes d'eau, de la peinture qui cloque ou des taches sombres indiquent un probleme d'etancheite.</li>
<li><strong>La moisissure</strong> : inspectez les coins du cadre, les joints et le rebord interieur. La moisissure noire ou verte est un signe d'exces d'humidite, possiblement lie a un probleme de fenetre.</li>
<li><strong>Les cadres interieurs</strong> : verifiez que les moulures interieures sont bien en place, sans espace entre la moulure et le mur ou entre la moulure et le cadre de la fenetre.</li>
</ul>

<h3>Etape 3 : Test de fonctionnement</h3>

<p>Testez chaque fenetre et porte mecaniquement :</p>

<ul>
<li><strong>Ouverture et fermeture</strong> : chaque fenetre doit s'ouvrir et se fermer facilement, sans forcer. Si une fenetre coince, les mecanismes peuvent etre encrasses, uses ou hors d'alignement.</li>
<li><strong>Verrouillage</strong> : les serrures et cremones doivent s'engager completement. Un verrouillage partiel signifie un defaut d'alignement ou un mecanisme use.</li>
<li><strong>Manivelles</strong> : pour les fenetres a battant, la manivelle doit tourner sans resistance excessive. Un mecanisme grippé peut casser si on force.</li>
<li><strong>Coulissement</strong> : pour les fenetres et portes coulissantes, le mouvement doit etre fluide et silencieux. Un coulissement difficile indique des roulettes usees ou un rail encrasse.</li>
<li><strong>Etancheite</strong> : fermez la fenetre et verrouillez-la. Passez votre main lentement tout autour du joint. Sentez-vous de l'air qui passe? Meme un leger courant d'air indique un coupe-froid defectueux ou un probleme d'ajustement.</li>
</ul>

<h3>Etape 4 : Inspection des moustiquaires</h3>

<p>Avant la saison des insectes, verifiez chaque moustiquaire :</p>

<ul>
<li><strong>La toile</strong> : cherchez les trous, les dechirures, les sections affaissees. Meme un petit trou laisse passer les moustiques.</li>
<li><strong>Le cadre</strong> : verifiez qu'il n'est pas tordu ou bossele. Un cadre deforme ne s'ajuste pas correctement et laisse des espaces.</li>
<li><strong>Les clips et les ressorts</strong> : assurez-vous que les mecanismes de retention tiennent bien la moustiquaire en place.</li>
<li><strong>Le coulissement</strong> : pour les moustiquaires coulissantes, verifiez que les roulettes et les rails sont en bon etat.</li>
</ul>

<h3>Etape 5 : Inspection des portes d'entree et portes-patio</h3>

<p>Les portes meritent une attention speciale :</p>

<ul>
<li><strong>Le seuil</strong> : verifiez l'usure du seuil et du balai de bas de porte. Un jour visible sous la porte fermee est une source majeure d'infiltration d'air et d'insectes.</li>
<li><strong>Les charnieres</strong> : ouvrez et fermez la porte lentement. Des grincements ou une resistance indiquent des charnieres a lubrifier ou a remplacer. Une porte qui ne reste pas en position ouverte a des charnieres usees.</li>
<li><strong>Le coupe-froid perimetrique</strong> : verifiez tout le tour de la porte. Fermez la porte sur une feuille de papier a plusieurs endroits : si vous pouvez retirer la feuille sans resistance, le coupe-froid ne fait plus son travail.</li>
<li><strong>La quincaillerie de porte-patio</strong> : poignee, serrure, crochet de verrouillage, securite enfant. Testez chaque mecanisme.</li>
</ul>

<h2>Que faire avec les resultats de votre inspection</h2>

<p>Apres votre inspection, classez les problemes identifies en trois categories :</p>

<ul>
<li><strong>Urgent</strong> : infiltrations d'eau actives, cadres pourris, serrures non fonctionnelles (securite). A reparer immediatement.</li>
<li><strong>Important</strong> : thermos embues, coupe-froid uses, calfeutrage fissure. A planifier pour l'ete ou l'automne au plus tard.</li>
<li><strong>Entretien preventif</strong> : nettoyage des rails, lubrification des mecanismes, retissage de moustiquaires. A faire quand vous avez le temps, mais ne pas negliger.</li>
</ul>

<h2>L'entretien preventif de base</h2>

<p>Profitez de votre inspection pour effectuer l'entretien de routine :</p>

<ul>
<li>Nettoyez les rails de toutes les fenetres et portes coulissantes avec un aspirateur puis un chiffon humide.</li>
<li>Lubrifiez les mecanismes (manivelles, cremones, roulettes) avec un lubrifiant a base de silicone.</li>
<li>Nettoyez les trous d'egouttement au bas des cadres avec un cure-pipe ou un petit fil.</li>
<li>Lavez les vitres interieur et exterieur pour mieux voir l'etat des thermos.</li>
<li>Nettoyez les moustiquaires a l'eau savonneuse et rincez bien.</li>
</ul>

<p>Si votre inspection revele des problemes que vous ne pouvez pas resoudre vous-meme, Vosthermos peut vous aider. Nos techniciens effectuent des inspections completes et peuvent reparer la plupart des problemes en une seule visite : thermos, coupe-froid, quincaillerie, moustiquaires et calfeutrage.</p>

<p><strong>Besoin d'aide pour vos reparations printanieres? Appelez Vosthermos au 514-825-8411 pour une evaluation gratuite. Nous intervenons rapidement dans toute la region de Montreal, la Rive-Sud, Longueuil, Brossard et Laval. Profitez du printemps pour remettre vos fenetres en parfait etat!</strong></p>
`
  }
];

async function main() {
  console.log('Seed blog posts - Vosthermos');
  console.log('==============================\n');

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    const slug = slugify(post.title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });

    if (existing) {
      console.log(`  SKIP  "${post.title}" (slug already exists)`);
      skipped++;
      continue;
    }

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content.trim(),
        category: post.category,
        tags: post.tags,
        status: 'published',
        authorName: 'Vosthermos',
        aiGenerated: false,
        publishedAt: post.publishedAt,
      },
    });

    console.log(`  OK    "${post.title}"`);
    console.log(`        slug: ${slug}`);
    console.log(`        category: ${post.category} | tags: ${post.tags.join(', ')}`);
    console.log(`        published: ${post.publishedAt.toISOString().split('T')[0]}\n`);
    created++;
  }

  console.log('==============================');
  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  if (
    e.message?.includes('does not exist') ||
    e.message?.includes('relation') ||
    e.code === 'P2021'
  ) {
    console.error('\nERROR: The BlogPost table does not exist in the database.');
    console.error('Run the Prisma migration first:\n');
    console.error('  npx prisma migrate dev\n');
    console.error('Or if in production:\n');
    console.error('  npx prisma migrate deploy\n');
  } else {
    console.error(e);
  }
  await prisma.$disconnect();
  process.exit(1);
});
