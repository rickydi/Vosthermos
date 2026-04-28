import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Pourquoi choisir Vosthermos | Experts en reparation de portes et fenetres",
  description:
    "Decouvrez pourquoi Vosthermos est le choix numero un pour la reparation de portes et fenetres au Quebec. 15+ ans d'experience, service garanti, 740+ pieces en inventaire, boutique en ligne unique et service rapide dans un rayon de 100km.",
  alternates: { canonical: "https://www.vosthermos.com/pourquoi-vosthermos" },
  openGraph: {
    title: "Pourquoi choisir Vosthermos | Experts en reparation",
    description:
      "15+ ans d'experience, service garanti, 740+ pieces en inventaire. Decouvrez ce qui fait de Vosthermos le leader en reparation de portes et fenetres au Quebec.",
    url: "https://www.vosthermos.com/pourquoi-vosthermos",
    type: "website",
    locale: "fr_CA",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vosthermos",
  url: "https://www.vosthermos.com",
  logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  foundingDate: "2010",
  description:
    "Entreprise familiale specialisee dans la reparation de portes et fenetres depuis plus de 15 ans. Remplacement de vitres thermos, quincaillerie, moustiquaires sur mesure et reparation de portes en bois.",
  founders: [
    {
      "@type": "Person",
      name: "Equipe fondatrice Vosthermos",
      description:
        "Famille passionnee par la restauration et la reparation de portes et fenetres, avec une expertise transmise et perfectionnee au fil des annees.",
    },
  ],
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 5,
    maxValue: 15,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_INFO.address,
    addressLocality: COMPANY_INFO.city,
    addressRegion: "QC",
    postalCode: COMPANY_INFO.postalCode,
    addressCountry: "CA",
  },
  telephone: "+15148258411",
  email: COMPANY_INFO.email,
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 45.3669,
      longitude: -73.5492,
    },
    geoRadius: "100000",
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61562303553558",
    "https://instagram.com/vosthermos/",
  ],
};

const differenciateurs = [
  {
    icon: "fa-award",
    title: "15+ ans d'experience",
    description:
      "Plus de 15 ans d'expertise dans la reparation de portes et fenetres. Notre savoir-faire est reconnu a travers toute la grande region de Montreal.",
  },
  {
    icon: "fa-shield-alt",
    title: "service garanti sur thermos",
    description:
      "Tous nos remplacements de vitres thermos sont couverts par une service professionnel garanti, transferable au prochain proprietaire de votre residence.",
  },
  {
    icon: "fa-boxes",
    title: "740+ pieces en inventaire",
    description:
      "Un inventaire de plus de 740 pieces de remplacement pour portes et fenetres, des plus courantes aux plus rares. Nous avons ce qu'il vous faut.",
  },
  {
    icon: "fa-shopping-cart",
    title: "Boutique en ligne unique au Quebec",
    description:
      "La seule boutique en ligne au Quebec dediee aux pieces de remplacement pour portes et fenetres. Commandez 24/7, livraison rapide partout au Quebec.",
  },
  {
    icon: "fa-truck",
    title: "Service rapide dans un rayon de 100km",
    description:
      "Notre equipe se deplace dans un rayon de 100km autour de Delson, couvrant Montreal, Laval, la Rive-Sud et les regions environnantes.",
  },
  {
    icon: "fa-file-invoice",
    title: "Soumissions gratuites, sans engagement",
    description:
      "Toutes nos soumissions sont entierement gratuites et sans engagement. Aucun frais cache, aucune surprise. Vous decidez en toute liberte.",
  },
];

const valeurs = [
  {
    icon: "fa-handshake",
    title: "Integrite",
    description:
      "Nous croyons en la transparence et l'honnetete. Chaque soumission est claire, chaque prix est juste, et nous ne recommandons jamais de travaux inutiles. Votre confiance est notre bien le plus precieux.",
  },
  {
    icon: "fa-gem",
    title: "Qualite",
    description:
      "Nous utilisons exclusivement des materiaux de premiere qualite et nos techniciens sont formes aux meilleures pratiques de l'industrie. Chaque intervention est realisee avec precision et souci du detail.",
  },
  {
    icon: "fa-heart",
    title: "Service client",
    description:
      "Chez Vosthermos, chaque client est traite comme un membre de la famille. Nous sommes a l'ecoute, reactifs et toujours disponibles pour repondre a vos questions et preoccupations.",
  },
];

const stats = [
  { value: "15+", label: "Ans d'experience" },
  { value: "740+", label: "Pieces en inventaire" },
  { value: "50+", label: "Villes desservies" },
  { value: "Incluse", label: "Service garanti" },
];

export default function PourquoiVosthermosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-white">Pourquoi Vosthermos</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-tag">Notre difference</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mt-2">
              Pourquoi choisir{" "}
              <span className="text-[var(--color-red)]">Vosthermos</span>?
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Depuis plus de 15 ans, notre equipe d&apos;experts se consacre a la
              reparation et au remplacement de portes et fenetres avec passion,
              integrite et un souci constant de la qualite.
            </p>
          </div>
        </div>
      </section>

      {/* Nos differenciateurs */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos avantages</span>
            <h2 className="text-3xl font-extrabold">
              Ce qui nous{" "}
              <span className="text-[var(--color-red)]">distingue</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Decouvrez les raisons pour lesquelles des centaines de clients nous
              font confiance chaque annee pour leurs portes et fenetres.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differenciateurs.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] group"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-red)] transition-colors">
                  <i
                    className={`fas ${item.icon} text-xl text-[var(--color-teal)] group-hover:text-white transition-colors`}
                  ></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-14">
              <span className="section-tag">Notre parcours</span>
              <h2 className="text-3xl font-extrabold">
                L&apos;histoire de{" "}
                <span className="text-[var(--color-red)]">Vosthermos</span>
              </h2>
            </div>
            <div className="space-y-6 text-[var(--color-muted)] leading-relaxed">
              <p>
                Vosthermos est ne il y a plus de 15 ans d&apos;une passion simple
                mais profonde : redonner vie aux portes et fenetres plutot que de
                les remplacer inutilement. Ce qui a commence comme un petit
                atelier familial specialise dans le remplacement de vitres thermos
                s&apos;est rapidement transforme en une entreprise reconnue a
                travers toute la grande region de Montreal.
              </p>
              <p>
                Au fil des annees, nous avons developpe une expertise unique qui
                couvre l&apos;ensemble des besoins en reparation de portes et
                fenetres : du remplacement de quincaillerie a la fabrication de
                moustiquaires sur mesure, en passant par la restauration de portes
                en bois ancestrales. Notre equipe de techniciens experimentes
                intervient aujourd&apos;hui dans plus de 20 villes a travers le
                Quebec.
              </p>
              <p>
                En 2023, nous avons lance notre boutique en ligne, une premiere
                au Quebec pour les pieces de remplacement de portes et fenetres.
                Avec plus de 740 pieces en inventaire, nos clients peuvent
                desormais commander leurs pieces 24 heures sur 24, 7 jours sur 7,
                et les recevoir rapidement a domicile ou venir les chercher a
                notre atelier.
              </p>
              <p>
                Aujourd&apos;hui, Vosthermos continue de grandir tout en
                preservant les valeurs qui ont fait notre succes : un service
                personnalise, des prix honnetes, une qualite irrepprochable et
                une garantie parmi les meilleures de l&apos;industrie. Chaque
                client qui nous fait confiance devient un peu membre de notre
                famille.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notre approche */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-tag">Notre philosophie</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                Reparer plutot que{" "}
                <span className="text-[var(--color-red)]">remplacer</span>
              </h2>
              <div className="space-y-5 mt-6 text-white/70 leading-relaxed">
                <p>
                  Chez Vosthermos, nous croyons fermement qu&apos;une porte ou une
                  fenetre en bon etat structural ne devrait pas etre envoyee au
                  depotoir simplement parce qu&apos;un thermos est embue ou
                  qu&apos;une poignee est brisee. Notre approche privilegiee est
                  la reparation et le remplacement de composantes specifiques.
                </p>
                <p>
                  Cette philosophie est non seulement plus economique pour nos
                  clients, mais elle est aussi beaucoup plus respectueuse de
                  l&apos;environnement. Chaque fenetre reparee plutot que
                  remplacee, c&apos;est des centaines de kilogrammes de materiaux
                  qui ne se retrouvent pas dans nos sites d&apos;enfouissement.
                </p>
                <p>
                  En choisissant la reparation, vous economisez en moyenne 60 a
                  70% par rapport au cout d&apos;un remplacement complet de fenetre,
                  tout en conservant l&apos;esthetique et le cachet original de votre
                  propriete.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-white/[0.08] text-center">
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  60-70%
                </div>
                <p className="text-white/60 text-sm">
                  d&apos;economie vs remplacement complet
                </p>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-white/[0.08] text-center">
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  <i className="fas fa-leaf text-green-400"></i>
                </div>
                <p className="text-white/60 text-sm">
                  Approche eco-responsable et durable
                </p>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-white/[0.08] text-center">
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  <i className="fas fa-home text-white"></i>
                </div>
                <p className="text-white/60 text-sm">
                  Preservez le cachet de votre maison
                </p>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-white/[0.08] text-center">
                <div className="text-3xl font-extrabold text-[var(--color-red)] mb-2">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <p className="text-white/60 text-sm">
                  Intervention rapide, meme journee possible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos valeurs</span>
            <h2 className="text-3xl font-extrabold">
              Les piliers de{" "}
              <span className="text-[var(--color-red)]">notre entreprise</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valeurs.map((valeur) => (
              <div key={valeur.title} className="text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-6">
                  <i
                    className={`fas ${valeur.icon} text-3xl text-[var(--color-teal)]`}
                  ></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{valeur.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed">
                  {valeur.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chiffres cles */}
      <section className="bg-[var(--color-teal-dark)] py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Pret a nous faire confiance?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Obtenez une soumission gratuite et sans engagement. Notre equipe est
            prete a repondre a toutes vos questions et a prendre soin de vos
            portes et fenetres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission
            </Link>
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
