import Link from "next/link";

export const metadata = {
  title: "Carrieres chez Vosthermos | Rejoignez notre equipe",
  description:
    "Rejoignez l'equipe Vosthermos! Decouvrez nos postes disponibles en reparation de portes et fenetres : technicien, representant service client, apprenti vitrier. Equipe familiale, formation continue, salaire competitif.",
  alternates: { canonical: "https://www.vosthermos.com/carrieres" },
  openGraph: {
    title: "Carrieres chez Vosthermos | Rejoignez notre equipe",
    description:
      "Nous recrutons! Technicien en reparation, representant service client, apprenti vitrier. Equipe familiale, formation et avantages competitifs.",
    url: "https://www.vosthermos.com/carrieres",
    type: "website",
    locale: "fr_CA",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
  },
};

const positions = [
  {
    title: "Technicien(ne) en reparation de portes et fenetres",
    type: "Temps plein",
    location: "Saint-Francois-Xavier + deplacements",
    description:
      "Nous recherchons un(e) technicien(ne) experimente(e) ou motive(e) a apprendre pour rejoindre notre equipe de terrain. Vous serez responsable des interventions chez nos clients pour le remplacement de vitres thermos, la reparation de quincaillerie et la fabrication de moustiquaires.",
    responsibilities: [
      "Effectuer le remplacement de vitres thermos chez les clients",
      "Diagnostiquer et reparer les problemes de quincaillerie de portes et fenetres",
      "Fabriquer et installer des moustiquaires sur mesure",
      "Effectuer des reparations et restaurations de portes en bois",
      "Prendre les mesures necessaires pour les commandes de pieces",
      "Maintenir un vehicule de service propre et bien organise",
      "Offrir un service a la clientele courtois et professionnel",
    ],
    requirements: [
      "Experience en reparation de portes et fenetres (un atout, formation offerte)",
      "DEP en menuiserie, vitrerie ou domaine connexe (un atout)",
      "Permis de conduire valide classe 5",
      "Bonne condition physique (travail debout, levage de charges)",
      "Souci du detail et minutie dans le travail",
      "Excellent sens du service a la clientele",
      "Capacite a travailler de facon autonome",
    ],
  },
  {
    title: "Representant(e) au service a la clientele",
    type: "Temps plein",
    location: "Saint-Francois-Xavier",
    description:
      "Nous cherchons une personne dynamique et organisee pour gerer les communications avec nos clients, traiter les commandes de la boutique en ligne et coordonner les rendez-vous de service. Vous serez le premier point de contact de nos clients.",
    responsibilities: [
      "Repondre aux appels telephoniques et courriels des clients",
      "Traiter les commandes de la boutique en ligne",
      "Identifier les pieces necessaires a partir de photos et descriptions des clients",
      "Planifier et coordonner les rendez-vous de service",
      "Preparer les soumissions et assurer le suivi",
      "Gerer l'inventaire et les commandes de pieces",
      "Mettre a jour les fiches produits de la boutique en ligne",
    ],
    requirements: [
      "Experience en service a la clientele (minimum 2 ans)",
      "Excellentes aptitudes en communication en francais (oral et ecrit)",
      "Connaissance de base en portes et fenetres (un atout, formation offerte)",
      "Maitrise des outils informatiques (courriel, Excel, systeme de commandes)",
      "Sens de l'organisation et capacite a gerer plusieurs taches",
      "Attitude positive et esprit d'equipe",
      "Bilinguisme francais/anglais (un atout)",
    ],
  },
  {
    title: "Apprenti(e) vitrier/vitriere",
    type: "Temps plein",
    location: "Saint-Francois-Xavier + deplacements",
    description:
      "Poste ideal pour une personne motivee qui souhaite apprendre le metier de vitrier dans un environnement formateur et bienveillant. Vous travaillerez aux cotes de nos techniciens experimentes et apprendrez toutes les facettes de la reparation de portes et fenetres.",
    responsibilities: [
      "Assister les techniciens lors des interventions chez les clients",
      "Apprendre les techniques de remplacement de vitres thermos",
      "Participer a la fabrication de moustiquaires sur mesure",
      "Preparer le materiel et les outils pour les interventions",
      "Effectuer la manutention des vitres et pieces de remplacement",
      "Maintenir l'atelier propre et organise",
      "Livrer des pieces aux clients et sur les chantiers",
    ],
    requirements: [
      "Diplome d'etudes secondaires (DES) ou equivalent",
      "Interet pour le travail manuel et le domaine de la construction",
      "Permis de conduire valide classe 5",
      "Bonne condition physique",
      "Ponctualite et fiabilite",
      "Attitude positive et volonte d'apprendre",
      "Aucune experience requise, formation complete offerte",
    ],
  },
];

const avantages = [
  {
    icon: "fa-users",
    title: "Equipe familiale et accueillante",
    description:
      "Chez Vosthermos, chaque employe est traite comme un membre de la famille. Ambiance conviviale, respect mutuel et entraide sont au coeur de notre quotidien.",
  },
  {
    icon: "fa-graduation-cap",
    title: "Formation continue et developpement",
    description:
      "Nous investissons dans le developpement de nos employes. Formation sur le terrain, ateliers techniques et accompagnement personnalise pour faire progresser votre carriere.",
  },
  {
    icon: "fa-dollar-sign",
    title: "Salaire competitif et avantages",
    description:
      "Remuneration competitive basee sur l'experience, bonifications sur la performance, conges payes et horaire stable du lundi au vendredi.",
  },
  {
    icon: "fa-truck",
    title: "Vehicule de service fourni",
    description:
      "Les techniciens beneficient d'un vehicule de service entierement equipe pour les deplacements chez les clients, incluant l'essence et l'entretien.",
  },
];

const jobPostingJsonLd = positions.map((pos) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: pos.title,
  description: pos.description,
  employmentType: "FULL_TIME",
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      streetAddress: "330 Ch. St-Francois-Xavier, Local 101",
      addressLocality: "Saint-Francois-Xavier",
      addressRegion: "QC",
      postalCode: "J0H 1S0",
      addressCountry: "CA",
    },
  },
  hiringOrganization: {
    "@type": "Organization",
    name: "Vosthermos",
    sameAs: "https://www.vosthermos.com",
    logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  },
  datePosted: "2026-03-01",
  validThrough: "2026-12-31",
  applicantLocationRequirements: {
    "@type": "Country",
    name: "Canada",
  },
  jobBenefits:
    "Vehicule de service fourni, formation continue, salaire competitif, equipe familiale",
  skills: pos.requirements.join(", "),
  responsibilities: pos.responsibilities.join(", "),
}));

export default function CarrieresPage() {
  return (
    <>
      {jobPostingJsonLd.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[85px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-white">Carrieres</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-tag">Carrieres</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mt-2">
              Rejoignez notre{" "}
              <span className="text-[var(--color-red)]">equipe</span>
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Vosthermos est en pleine croissance et nous cherchons des personnes
              passionnees pour se joindre a notre equipe familiale. Decouvrez nos
              opportunites et construisez votre carriere avec nous.
            </p>
          </div>
        </div>
      </section>

      {/* Pourquoi travailler chez nous */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Avantages</span>
            <h2 className="text-3xl font-extrabold">
              Pourquoi travailler chez{" "}
              <span className="text-[var(--color-red)]">Vosthermos</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Nous offrons bien plus qu&apos;un emploi. Joignez-vous a une equipe
              ou votre contribution est valorisee et votre developpement est une
              priorite.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {avantages.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] group text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--color-red)] transition-colors">
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

      {/* Postes */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Postes disponibles</span>
            <h2 className="text-3xl font-extrabold">
              Nos <span className="text-[var(--color-red)]">opportunites</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Consultez nos postes actuels et a venir. Meme si un poste n&apos;est
              pas affiche, nous acceptons les candidatures spontanees en tout temps.
            </p>
          </div>
          <div className="space-y-8">
            {positions.map((pos) => (
              <div
                key={pos.title}
                className="bg-[var(--color-background)] rounded-xl p-8 border border-[var(--color-border)]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{pos.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-teal)] font-semibold bg-[var(--color-teal)]/10 px-3 py-1 rounded-full">
                        <i className="fas fa-clock text-[10px]"></i>
                        {pos.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] font-semibold bg-[var(--color-border)]/50 px-3 py-1 rounded-full">
                        <i className="fas fa-map-marker-alt text-[10px] text-[var(--color-red)]"></i>
                        {pos.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:info@vosthermos.com?subject=Candidature - ${pos.title}`}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 shrink-0"
                  >
                    <i className="fas fa-paper-plane text-xs"></i> Postuler
                  </a>
                </div>

                <p className="text-[var(--color-muted)] leading-relaxed mb-6">
                  {pos.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-teal)] mb-4">
                      <i className="fas fa-tasks mr-2"></i>Responsabilites
                    </h4>
                    <ul className="space-y-2">
                      {pos.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm text-[var(--color-muted)]"
                        >
                          <i className="fas fa-check text-green-500 mt-0.5 flex-shrink-0 text-xs"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-teal)] mb-4">
                      <i className="fas fa-list-ul mr-2"></i>Exigences
                    </h4>
                    <ul className="space-y-2">
                      {pos.requirements.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm text-[var(--color-muted)]"
                        >
                          <i className="fas fa-circle text-[var(--color-border)] mt-1.5 flex-shrink-0 text-[6px]"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Candidature spontanee */}
      <section className="section-dark py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="section-tag">Candidature spontanee</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Aucun poste ne vous{" "}
              <span className="text-[var(--color-red)]">correspond</span>?
            </h2>
            <p className="text-white/60 mt-4 leading-relaxed">
              Nous sommes toujours a la recherche de personnes talentueuses et
              motivees. Envoyez-nous votre CV et une lettre de motivation par
              courriel. Nous conserverons votre candidature dans notre banque et
              vous contacterons des qu&apos;un poste correspondant a votre profil
              se liberera.
            </p>
            <div className="mt-10 bg-white/[0.06] backdrop-blur-md rounded-xl p-8 border border-white/[0.08]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/20 flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-envelope text-[var(--color-red)]"></i>
                  </div>
                  <h3 className="text-white font-bold mb-1">Par courriel</h3>
                  <a
                    href="mailto:info@vosthermos.com?subject=Candidature spontanee"
                    className="text-[var(--color-red-light)] hover:text-white transition-colors font-medium"
                  >
                    info@vosthermos.com
                  </a>
                  <p className="text-white/40 text-sm mt-1">
                    Joindre votre CV en format PDF
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/20 flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-phone text-[var(--color-red)]"></i>
                  </div>
                  <h3 className="text-white font-bold mb-1">Par telephone</h3>
                  <a
                    href="tel:15148258411"
                    className="text-[var(--color-red-light)] hover:text-white transition-colors font-medium"
                  >
                    514-825-8411
                  </a>
                  <p className="text-white/40 text-sm mt-1">
                    Du lundi au vendredi, 8h a 17h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Envoyez votre candidature
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Rejoignez une equipe passionnee qui fait une difference chaque jour.
            Envoyez votre CV des maintenant et commencez une nouvelle etape de
            votre carriere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@vosthermos.com?subject=Candidature spontanee"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              <i className="fas fa-paper-plane"></i> Envoyer mon CV
            </a>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
