export const LOCALES = ["fr", "en"];
export const DEFAULT_LOCALE = "fr";

/**
 * Extract locale from a pathname.
 * /en/services/foo -> "en"
 * /services/foo    -> "fr"
 */
export function getLocaleFromPath(pathname) {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return DEFAULT_LOCALE;
}

/**
 * Generate a localized path.
 * localePath("/services/foo", "en")  -> "/en/services/foo"
 * localePath("/services/foo", "fr")  -> "/services/foo"
 * localePath("/en/services/foo", "fr") -> "/services/foo"
 * localePath("/en/services/foo", "en") -> "/en/services/foo"
 */
export function localePath(path, locale) {
  // Strip existing /en prefix if present
  const cleanPath = path.replace(/^\/en(\/|$)/, "/");
  if (locale === "en") {
    return `/en${cleanPath === "/" ? "" : cleanPath}`;
  }
  return cleanPath || "/";
}

/**
 * Map of French route slugs to English equivalents and back.
 */
export const ROUTE_MAP_FR_TO_EN = {
  boutique: "shop",
  blogue: "blog",
  prix: "pricing",
  garantie: "warranty",
  services: "services",
  faq: "faq",
  contact: "contact",
  secteurs: "areas",
  panier: "cart",
  realisations: "projects",
  "rendez-vous": "appointment",
};

export const ROUTE_MAP_EN_TO_FR = Object.fromEntries(
  Object.entries(ROUTE_MAP_FR_TO_EN).map(([k, v]) => [v, k])
);

/**
 * Build the alternate-language URL for the current page.
 * E.g., for a French page /boutique, returns /en/boutique
 * For an English page /en/boutique, returns /boutique
 */
export function getAlternateUrl(pathname) {
  const locale = getLocaleFromPath(pathname);
  if (locale === "en") {
    // Strip /en prefix to get French URL
    const frPath = pathname.replace(/^\/en(\/|$)/, "/");
    return frPath || "/";
  }
  // Add /en prefix for English URL
  return `/en${pathname === "/" ? "" : pathname}`;
}
