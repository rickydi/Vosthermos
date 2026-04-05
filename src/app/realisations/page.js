import Link from "next/link";
import RealisationsGrid from "./RealisationsGrid";

export const metadata = {
  title: "Nos realisations | Vosthermos - Portfolio de nos travaux",
  description:
    "Decouvrez nos realisations en reparation de portes et fenetres : remplacement de vitres thermos, quincaillerie, moustiquaires sur mesure et restauration de portes en bois. Avant/apres de projets completes a Montreal, Rive-Sud et environs.",
  alternates: { canonical: "https://www.vosthermos.com/realisations" },
  openGraph: {
    title: "Nos realisations | Vosthermos",
    description:
      "Galerie de nos travaux en reparation de portes et fenetres. Avant/apres, temoignages et projets completes a travers le Quebec.",
    url: "https://www.vosthermos.com/realisations",
    type: "website",
    locale: "fr_CA",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
  },
};

const projects = [
  {
    id: 1,
    title: "Remplacement de thermos double - fenetre de salon",
    category: "Vitre Thermos",
    city: "Brossard",
    description:
      "Remplacement d'un thermos double embue sur une grande fenetre de salon. Le client a retrouve une vue cristalline et une meilleure isolation thermique, reduisant sa facture de chauffage.",
    beforeImage: "/images/realisations/project-1-before.jpg",
    afterImage: "/images/realisations/project-1-after.jpg",
  },
  {
    id: 2,
    title: "Remplacement complet de quincaillerie porte-patio",
    category: "Quincaillerie",
    city: "Montreal",
    description:
      "Remplacement de la poignee, du mecanisme de verrouillage et des rouleaux d'une porte-patio coulissante. La porte glisse maintenant sans effort et se verrouille parfaitement.",
    beforeImage: "/images/realisations/project-2-before.jpg",
    afterImage: "/images/realisations/project-2-after.jpg",
  },
  {
    id: 3,
    title: "Restauration d'une porte en bois centenaire",
    category: "Portes",
    city: "Longueuil",
    description:
      "Restauration complete d'une porte d'entree en bois massif datant de 1920. Poncage, reparation des fissures, remplacement de la quincaillerie et finition avec vernis marin protecteur.",
    beforeImage: "/images/realisations/project-3-before.jpg",
    afterImage: "/images/realisations/project-3-after.jpg",
  },
  {
    id: 4,
    title: "Fabrication de moustiquaires sur mesure pour veranda",
    category: "Moustiquaires",
    city: "Laval",
    description:
      "Fabrication et installation de 8 moustiquaires sur mesure pour une veranda trois-saisons. Cadres en aluminium avec toile en fibre de verre haute resistance.",
    beforeImage: "/images/realisations/project-4-before.jpg",
    afterImage: "/images/realisations/project-4-after.jpg",
  },
  {
    id: 5,
    title: "Calfeutrage complet de fenetres en PVC",
    category: "Calfeutrage",
    city: "Saint-Hyacinthe",
    description:
      "Remplacement du calfeutrage deteriore sur 12 fenetres en PVC. Elimination des infiltrations d'air et d'eau, amelioration significative de l'efficacite energetique de la maison.",
    beforeImage: "/images/realisations/project-5-before.jpg",
    afterImage: "/images/realisations/project-5-after.jpg",
  },
  {
    id: 6,
    title: "Remplacement de 6 thermos triple dans un condo",
    category: "Vitre Thermos",
    city: "Boucherville",
    description:
      "Remplacement de 6 unites thermos triple avec gaz argon et Low-E dans un condo au 8e etage. Intervention realisee en une seule journee avec nacelle exterieure.",
    beforeImage: "/images/realisations/project-6-before.jpg",
    afterImage: "/images/realisations/project-6-after.jpg",
  },
  {
    id: 7,
    title: "Reparation de mecanisme a cremone sur fenetres a battant",
    category: "Quincaillerie",
    city: "Terrebonne",
    description:
      "Remplacement des mecanismes a cremone defectueux sur 4 fenetres a battant. Les fenetres s'ouvrent et se ferment maintenant facilement et l'etancheite est retrouvee.",
    beforeImage: "/images/realisations/project-7-before.jpg",
    afterImage: "/images/realisations/project-7-after.jpg",
  },
  {
    id: 8,
    title: "Restauration de portes-fenetres francaises en bois",
    category: "Portes",
    city: "Chambly",
    description:
      "Restauration de deux portes-fenetres francaises en chene. Reparation des moulures, remplacement des vitres fendillees et application d'une teinture noyer pour retrouver l'eclat original.",
    beforeImage: "/images/realisations/project-8-before.jpg",
    afterImage: "/images/realisations/project-8-after.jpg",
  },
  {
    id: 9,
    title: "Installation de moustiquaires a enroulement",
    category: "Moustiquaires",
    city: "Repentigny",
    description:
      "Installation de moustiquaires a enroulement retractables sur 3 portes-patio. Solution elegante et pratique qui s'integre parfaitement au cadre existant.",
    beforeImage: "/images/realisations/project-9-before.jpg",
    afterImage: "/images/realisations/project-9-after.jpg",
  },
  {
    id: 10,
    title: "Remplacement de thermos et calfeutrage - maison bi-generation",
    category: "Vitre Thermos",
    city: "Granby",
    description:
      "Projet complet incluant le remplacement de 10 thermos embues et le recalfeutrage de toutes les fenetres d'une maison bi-generation. Economies d'energie estimees a 25%.",
    beforeImage: "/images/realisations/project-10-before.jpg",
    afterImage: "/images/realisations/project-10-after.jpg",
  },
  {
    id: 11,
    title: "Remplacement de rouleaux et rail de porte-patio",
    category: "Quincaillerie",
    city: "Blainville",
    description:
      "Remplacement des rouleaux uses et du rail endommage d'une porte-patio de 8 pieds. Le proprietaire n'arrivait plus a ouvrir sa porte; elle glisse maintenant comme neuve.",
    beforeImage: "/images/realisations/project-11-before.jpg",
    afterImage: "/images/realisations/project-11-after.jpg",
  },
  {
    id: 12,
    title: "Calfeutrage et coupe-froid - immeuble commercial",
    category: "Calfeutrage",
    city: "Chateauguay",
    description:
      "Remplacement du calfeutrage exterieur et des coupe-froid sur 20 fenetres d'un immeuble commercial. Travaux realises en fin de semaine pour ne pas perturber les activites.",
    beforeImage: "/images/realisations/project-12-before.jpg",
    afterImage: "/images/realisations/project-12-after.jpg",
  },
];

const categories = [
  "Tous",
  "Quincaillerie",
  "Vitre Thermos",
  "Portes",
  "Moustiquaires",
  "Calfeutrage",
];

export default function RealisationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-white">Realisations</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-tag">Notre portfolio</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mt-2">
              Nos{" "}
              <span className="text-[var(--color-red)]">realisations</span>
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Decouvrez une selection de nos projets completes a travers le Quebec.
              Chaque intervention temoigne de notre savoir-faire et de notre
              engagement envers la qualite.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--color-teal)]">
                500+
              </div>
              <div className="text-[var(--color-muted)] text-sm mt-1">
                Projets completes
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--color-teal)]">
                450+
              </div>
              <div className="text-[var(--color-muted)] text-sm mt-1">
                Clients satisfaits
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--color-teal)]">
                50+
              </div>
              <div className="text-[var(--color-muted)] text-sm mt-1">
                Villes desservies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Projects Grid (client component) */}
      <section className="bg-[var(--color-background)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <RealisationsGrid
            projects={projects}
            categories={categories}
          />
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-quote-left text-2xl text-[var(--color-teal)]"></i>
          </div>
          <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
            &laquo;Nous avions 8 fenetres avec des thermos embues et on pensait
            devoir tout remplacer. Vosthermos nous a fait economiser des milliers
            de dollars en remplacant seulement les vitres thermos. Le resultat est
            impeccable et la service professionnel garanti nous rassure enormement.&raquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="stars text-sm">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
          <p className="text-[var(--color-muted)] mt-2 text-sm">
            Marie-Claude D. &mdash; Brossard
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Votre projet pourrait etre le prochain
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Que ce soit pour un remplacement de thermos, une reparation de
            quincaillerie ou la fabrication de moustiquaires sur mesure, notre
            equipe est prete a transformer vos portes et fenetres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Demander une soumission gratuite
            </Link>
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
