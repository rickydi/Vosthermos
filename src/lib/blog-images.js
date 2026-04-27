const SITE_URL = "https://www.vosthermos.com";

const COVER_REPLACEMENTS = {
  "/images/blog/5-problemes-courants-de-porte-patio-et-leurs-solutions.jpg":
    "/images/quincaillerie/detail-roulette-porte-patio.jpg",
  "/images/blog/comment-choisir-la-bonne-moustiquaire-pour-chaque-type-de-fenetre.jpg":
    "/images/realisations/thermos-remplacement-after.jpg",
  "/images/blog/comment-savoir-si-vos-vitres-thermos-doivent-etre-remplacees.jpg":
    "/images/vitre-thermos/detail-1.jpg",
  "/images/blog/l-importance-du-calfeutrage-avant-l-hiver-quebecois.jpg":
    "/images/realisations/quincaillerie-ajustement-after.jpg",
  "/images/blog/les-avantages-du-verre-low-e-et-argon-pour-vos-thermos.jpg":
    "/images/vitre-thermos/reparation-1.jpg",
  "/images/blog/reparer-ou-remplacer-ses-fenetres-le-guide-decision.jpg":
    "/images/realisations/fenetre-restauration-after.jpg",
};

const EXACT_IMAGES = {
  "5-problemes-courants-de-porte-patio-et-leurs-solutions":
    "/images/quincaillerie/detail-roulette-porte-patio.jpg",
  "comment-choisir-la-bonne-moustiquaire-pour-chaque-type-de-fenetre":
    "/images/realisations/thermos-remplacement-after.jpg",
  "comment-savoir-si-vos-vitres-thermos-doivent-etre-remplacees":
    "/images/vitre-thermos/detail-1.jpg",
  "economiser-sur-le-chauffage-en-reparant-vos-fenetres":
    "/images/blog/economiser-sur-le-chauffage-en-reparant-vos-fenetres.jpg",
  "guide-complet-du-remplacement-de-coupe-froid-au-quebec":
    "/images/blog/guide-complet-du-remplacement-de-coupe-froid-au-quebec.jpg",
  "inspection-printaniere-de-vos-portes-et-fenetres-liste-complete":
    "/images/blog/inspection-printaniere-de-vos-portes-et-fenetres-liste-complete.jpg",
  "l-importance-du-calfeutrage-avant-l-hiver-quebecois":
    "/images/realisations/quincaillerie-ajustement-after.jpg",
  "les-avantages-du-verre-low-e-et-argon-pour-vos-thermos":
    "/images/vitre-thermos/reparation-1.jpg",
  "pourquoi-la-buee-dans-vos-fenetres-est-plus-qu-un-probleme-esthetique":
    "/images/blog/pourquoi-la-buee-dans-vos-fenetres-est-plus-qu-un-probleme-esthetique.jpg",
  "reparer-ou-remplacer-ses-fenetres-le-guide-decision":
    "/images/realisations/fenetre-restauration-after.jpg",
};

const RULES = [
  {
    terms: ["climatisation", "chaleur", "ete", "fraiche", "frais"],
    image: "/images/vitre-thermos/detail-1.jpg",
  },
  {
    terms: ["hiver", "automne", "chauffage", "isolation", "energie", "energetique"],
    image: "/images/blog/guide-complet-du-remplacement-de-coupe-froid-au-quebec.jpg",
  },
  {
    terms: ["budget", "renovation", "subvention", "subventions", "renoclimat", "financement"],
    image: "/images/realisations/fenetre-restauration-after.jpg",
  },
  {
    terms: ["porte-patio", "patio", "roulette", "roulettes", "coulissante", "coince", "coincee", "glisse"],
    image: "/images/quincaillerie/detail-roulette-porte-patio.jpg",
  },
  {
    terms: ["calfeutrage", "calfeutrer", "scellant", "infiltration"],
    image: "/images/realisations/quincaillerie-ajustement-after.jpg",
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
    image: "/images/vitre-thermos/reparation-1.jpg",
  },
  {
    terms: ["thermos", "vitre", "vitres", "verre"],
    image: "/images/realisations/thermos-remplacement-after.jpg",
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
    terms: ["moustiquaire", "moustiquaires"],
    image: "/images/realisations/thermos-remplacement-after.jpg",
  },
  {
    terms: ["fenetre", "fenetres", "printaniere", "automne", "entretien"],
    image: "/images/blog/inspection-printaniere-de-vos-portes-et-fenetres-liste-complete.jpg",
  },
];

const CATEGORY_IMAGES = {
  conseils: "/images/realisations/thermos-remplacement-after.jpg",
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

function replaceNonQuebecCover(image) {
  if (!image) return "";
  const localPath = image.startsWith(SITE_URL) ? image.slice(SITE_URL.length) : image;
  return COVER_REPLACEMENTS[localPath] || image;
}

export function getBlogImage(post) {
  if (post?.coverImage) return replaceNonQuebecCover(post.coverImage);

  const slug = post?.slug || "";
  if (EXACT_IMAGES[slug]) return EXACT_IMAGES[slug];

  const searchable = normalizeText(`${slug} ${post?.title || ""} ${(post?.tags || []).join(" ")}`);
  const match = RULES.find((rule) => rule.terms.some((term) => searchable.includes(term)));

  return match?.image || CATEGORY_IMAGES[post?.category] || CATEGORY_IMAGES.conseils;
}

export function getAbsoluteBlogImage(post) {
  const image = getBlogImage(post);
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}
