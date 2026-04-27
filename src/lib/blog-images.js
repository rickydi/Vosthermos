const SITE_URL = "https://www.vosthermos.com";

const EXACT_IMAGES = {
  "5-problemes-courants-de-porte-patio-et-leurs-solutions":
    "/images/blog/5-problemes-courants-de-porte-patio-et-leurs-solutions.jpg",
  "comment-choisir-la-bonne-moustiquaire-pour-chaque-type-de-fenetre":
    "/images/blog/comment-choisir-la-bonne-moustiquaire-pour-chaque-type-de-fenetre.jpg",
  "comment-savoir-si-vos-vitres-thermos-doivent-etre-remplacees":
    "/images/blog/comment-savoir-si-vos-vitres-thermos-doivent-etre-remplacees.jpg",
  "economiser-sur-le-chauffage-en-reparant-vos-fenetres":
    "/images/blog/economiser-sur-le-chauffage-en-reparant-vos-fenetres.jpg",
  "guide-complet-du-remplacement-de-coupe-froid-au-quebec":
    "/images/blog/guide-complet-du-remplacement-de-coupe-froid-au-quebec.jpg",
  "inspection-printaniere-de-vos-portes-et-fenetres-liste-complete":
    "/images/blog/inspection-printaniere-de-vos-portes-et-fenetres-liste-complete.jpg",
  "l-importance-du-calfeutrage-avant-l-hiver-quebecois":
    "/images/blog/l-importance-du-calfeutrage-avant-l-hiver-quebecois.jpg",
  "les-avantages-du-verre-low-e-et-argon-pour-vos-thermos":
    "/images/blog/les-avantages-du-verre-low-e-et-argon-pour-vos-thermos.jpg",
  "pourquoi-la-buee-dans-vos-fenetres-est-plus-qu-un-probleme-esthetique":
    "/images/blog/pourquoi-la-buee-dans-vos-fenetres-est-plus-qu-un-probleme-esthetique.jpg",
  "reparer-ou-remplacer-ses-fenetres-le-guide-decision":
    "/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg",
};

const RULES = [
  {
    terms: ["moustiquaire", "moustiquaires"],
    image: "/images/blog/comment-choisir-la-bonne-moustiquaire-pour-chaque-type-de-fenetre.jpg",
  },
  {
    terms: ["porte-patio", "patio", "roulette", "roulettes", "coulissante", "coince", "coincee", "glisse"],
    image: "/images/quincaillerie/detail-roulette-porte-patio.jpg",
  },
  {
    terms: ["calfeutrage", "calfeutrer", "scellant", "infiltration"],
    image: "/images/blog/l-importance-du-calfeutrage-avant-l-hiver-quebecois.jpg",
  },
  {
    terms: ["coupe-froid", "coupe froid"],
    image: "/images/blog/guide-complet-du-remplacement-de-coupe-froid-au-quebec.jpg",
  },
  {
    terms: ["buee", "embue", "condensation", "desembuage", "desembuer"],
    image: "/images/blog/pourquoi-la-buee-dans-vos-fenetres-est-plus-qu-un-probleme-esthetique.jpg",
  },
  {
    terms: ["low-e", "argon"],
    image: "/images/blog/les-avantages-du-verre-low-e-et-argon-pour-vos-thermos.jpg",
  },
  {
    terms: ["chauffage", "isolation", "energie", "energetique", "climatisation", "chaleur", "hiver"],
    image: "/images/blog/economiser-sur-le-chauffage-en-reparant-vos-fenetres.jpg",
  },
  {
    terms: ["thermos", "vitre", "vitres", "verre"],
    image: "/images/blog/comment-savoir-si-vos-vitres-thermos-doivent-etre-remplacees.jpg",
  },
  {
    terms: ["bois", "restauration", "renovation", "budget", "patrimoine"],
    image: "/images/realisations/fenetre-restauration-after.jpg",
  },
  {
    terms: ["quincaillerie", "poignee", "serrure", "mecanisme", "manivelle", "guillotine"],
    image: "/images/realisations/quincaillerie-ajustement-before.jpg",
  },
  {
    terms: ["fenetre", "fenetres", "printaniere", "automne", "entretien"],
    image: "/images/blog/inspection-printaniere-de-vos-portes-et-fenetres-liste-complete.jpg",
  },
];

const CATEGORY_IMAGES = {
  conseils: "/images/vitre-thermos/detail-1.jpg",
  entretien: "/images/blog/inspection-printaniere-de-vos-portes-et-fenetres-liste-complete.jpg",
  guides: "/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg",
  nouvelles: "/images/hero-technicien.jpg",
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getBlogImage(post) {
  if (post?.coverImage) return post.coverImage;

  const slug = post?.slug || "";
  if (EXACT_IMAGES[slug]) return EXACT_IMAGES[slug];

  const searchable = normalizeText(`${slug} ${post?.title || ""} ${post?.excerpt || ""} ${(post?.tags || []).join(" ")}`);
  const match = RULES.find((rule) => rule.terms.some((term) => searchable.includes(term)));

  return match?.image || CATEGORY_IMAGES[post?.category] || CATEGORY_IMAGES.conseils;
}

export function getAbsoluteBlogImage(post) {
  const image = getBlogImage(post);
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}
