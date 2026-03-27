import { PROBLEMS } from "./problems-data";
import { PRICING } from "./pricing-data";
import { CITIES } from "./cities";

// Map service slugs to related problem slugs
const SERVICE_TO_PROBLEMS = {
  "remplacement-vitre-thermos": ["fenetre-embuee", "condensation-entre-vitres", "vitre-thermos-embuee", "double-vitrage-brise", "buee-fenetre-matin", "fenetre-froide-au-toucher", "fenetre-bruyante", "facture-chauffage-elevee"],
  "remplacement-quincaillerie": ["fenetre-difficile-ouvrir", "fenetre-bloquee", "fenetre-qui-ferme-mal", "manivelle-fenetre-cassee", "loquet-fenetre-brise", "charniere-fenetre-cassee", "fenetre-guillotine-bloquee", "porte-patio-coince", "roulette-porte-patio-usee", "serrure-porte-patio-bloquee", "poignee-porte-patio-cassee", "quincaillerie-rouille", "fenetre-ne-verrouille-plus"],
  "calfeutrage": ["infiltration-eau-fenetre", "moisissure-contour-fenetre", "calfeutrage-fenetre-craque", "scellant-fenetre-decolle", "fenetre-sous-sol-infiltration"],
  "coupe-froid": ["courant-air-fenetre", "fenetre-qui-siffle", "fenetre-givre-interieur", "coupe-froid-use", "porte-patio-laisse-passer-air", "fenetre-qui-forme-glace"],
  "reparation-portes-bois": ["porte-bois-qui-colle", "porte-entree-gonflee", "cadre-fenetre-pourri", "porte-bois-pourri-bas", "peinture-fenetre-ecaille", "porte-qui-grince", "porte-entree-difficile-fermer"],
  "moustiquaires-sur-mesure": ["moustiquaire-dechiree", "moustiquaire-qui-tombe", "moustiquaire-cadre-tordu", "porte-moustiquaire-dechiree"],
  "desembuage": ["vitre-opaque-blanchatre", "fenetre-embuee", "vitre-thermos-embuee"],
  "insertion-porte": ["insertion-porte-embuee", "vitrage-porte-brise"],
};

// Map product category slugs to problems
const PRODUCT_CATEGORY_TO_PROBLEMS = {
  "roulettes": ["porte-patio-coince", "roulette-porte-patio-usee", "porte-patio-rail-use"],
  "poignees": ["poignee-porte-patio-cassee", "porte-patio-coince"],
  "serrures": ["serrure-porte-patio-bloquee", "fenetre-ne-verrouille-plus"],
  "manivelles": ["manivelle-fenetre-cassee", "fenetre-difficile-ouvrir"],
  "loquets": ["loquet-fenetre-brise", "fenetre-qui-ferme-mal", "fenetre-difficile-verrouiller"],
  "charnieres": ["charniere-fenetre-cassee", "porte-qui-grince"],
  "coupe-froid": ["coupe-froid-use", "courant-air-fenetre", "fenetre-qui-siffle"],
  "moustiquaires": ["moustiquaire-dechiree", "moustiquaire-qui-tombe"],
};

// Get related problems for a service
export function getProblemsForService(serviceSlug, limit = 6) {
  const slugs = SERVICE_TO_PROBLEMS[serviceSlug] || [];
  return slugs
    .map((s) => PROBLEMS.find((p) => p.slug === s))
    .filter(Boolean)
    .slice(0, limit);
}

// Get related problems for a product category
export function getProblemsForProductCategory(categorySlug, limit = 4) {
  // Try to match category slug with known mappings
  for (const [key, problemSlugs] of Object.entries(PRODUCT_CATEGORY_TO_PROBLEMS)) {
    if (categorySlug.includes(key)) {
      return problemSlugs
        .map((s) => PROBLEMS.find((p) => p.slug === s))
        .filter(Boolean)
        .slice(0, limit);
    }
  }
  return [];
}

// Get pricing page for a service
export function getPricingForService(serviceSlug) {
  return PRICING.find((p) => p.serviceSlug === serviceSlug);
}

// Get related services for a problem
export function getServiceForProblem(problemSlug) {
  for (const [serviceSlug, problemSlugs] of Object.entries(SERVICE_TO_PROBLEMS)) {
    if (problemSlugs.includes(problemSlug)) return serviceSlug;
  }
  return null;
}

// Get top cities for linking
export function getTopCities(limit = 6) {
  return CITIES.slice(0, limit);
}

// Build a comprehensive link map for any page
export function getSmartLinks(context) {
  const { type, serviceSlug, problemSlug, citySlug, categorySlug } = context;
  const links = { problems: [], pricing: null, cities: [], services: [], relatedProblems: [] };

  if (type === "service" && serviceSlug) {
    links.problems = getProblemsForService(serviceSlug, 4);
    links.pricing = getPricingForService(serviceSlug);
    links.cities = getTopCities(6);
  }

  if (type === "problem" && problemSlug) {
    const problem = PROBLEMS.find((p) => p.slug === problemSlug);
    if (problem) {
      links.pricing = getPricingForService(problem.serviceSlug);
      links.cities = getTopCities(4);
    }
  }

  if (type === "product" && categorySlug) {
    links.problems = getProblemsForProductCategory(categorySlug, 4);
  }

  if (type === "city" && citySlug && serviceSlug) {
    links.problems = getProblemsForService(serviceSlug, 3);
    links.pricing = getPricingForService(serviceSlug);
  }

  return links;
}
