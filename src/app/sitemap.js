import prisma from "@/lib/prisma";
import { CITIES } from "@/lib/cities";
import { PROBLEMS } from "@/lib/problems-data";
import { PRICING } from "@/lib/pricing-data";
import { GLOSSARY } from "@/lib/glossary-data";
import { HOWTOS } from "@/lib/howto-data";
import { SERVICES_EN } from "@/lib/services-data-en";

const BASE = "https://www.vosthermos.com";

const SERVICE_SLUGS = [
  "remplacement-quincaillerie",
  "remplacement-vitre-thermos",
  "reparation-portes-bois",
  "reparation-porte-patio",
  "reparation-porte-fenetre",
  "moustiquaires-sur-mesure",
  "calfeutrage",
  "desembuage",
  "insertion-porte",
  "coupe-froid",
];

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services/restauration-fenetres-bois-patrimoine`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/portail-gestionnaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/boutique`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blogue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/garantie`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/rendez-vous`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/pourquoi-vosthermos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/realisations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/carrieres`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/prix`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/opti-fenetre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/diagnostic`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/calculateur`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/calculateur-economies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/outils`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/outils/quiz-diagnostic`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/outils/cout-thermos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/outils/reparer-vs-remplacer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/mcp-docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },

    // B2B pages - Copropriétés
    { url: `${BASE}/copropriete`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/copropriete/plan-pluriannuel-fenetres`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/copropriete/remplacement-massif-thermos-condos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/copropriete/conformite-loi-25`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },

    // B2B pages - Commercial
    { url: `${BASE}/commercial`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/commercial/remplacement-thermos-bureau`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/commercial/infiltration-eau-batiment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },

    // Case studies
    { url: `${BASE}/realisations/marronnier-laval`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  ];

  // HowTo guides (structured data for LLMs + Google rich results)
  const howtoPages = HOWTOS.map((h) => ({
    url: `${BASE}/guides/${h.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Service pages
  const servicePages = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // Service + City pages (SEO)
  const serviceCityPages = [];
  for (const slug of SERVICE_SLUGS) {
    for (const city of CITIES) {
      serviceCityPages.push({
        url: `${BASE}/services/${slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // Reparation portes et fenetres + city pages
  const reparationCityPages = CITIES.map((city) => ({
    url: `${BASE}/reparation-portes-et-fenetres/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Category pages (parents + subcategories)
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  const categoryPages = categories.map((cat) => ({
    url: `${BASE}/boutique/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const enCategoryPages = categories.map((cat) => ({
    url: `${BASE}/en/boutique/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // RÉGIME DU SITEMAP (audit 2026-06-12): les 1480 fiches /produit FR+EN
  // (descriptions ~104 caractères, 419/740 à zéro visite) représentaient 47% du
  // sitemap et monopolisaient 61% du crawl Googlebot pendant que les pages money
  // n'étaient pas crawlées. Elles sont passées en noindex et SORTIES du sitemap.
  // La boutique et ses catégories restent indexables.

  // Blog posts
  let blogPages = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
    blogPages = posts.map((p) => ({
      url: `${BASE}/blogue/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // BlogPost table may not exist yet before migration
  }

  // Problem pages
  const problemPages = [
    { url: `${BASE}/problemes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...PROBLEMS.map((p) => ({
      url: `${BASE}/problemes/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  // English pages
  const enPages = [
    { url: `${BASE}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/en/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/en/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/en/portail-gestionnaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/opti-fenetre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/en/diagnostic`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/calculateur`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/prix`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/glossaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/problemes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/en/boutique`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/en/blogue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/en/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/garantie`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
  const enServicePages = SERVICES_EN.map((service) => ({
    url: `${BASE}/en/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  // /en/services/[slug]/[ville] (496 pages): noindex + hors sitemap — elles
  // sortaient sur des requêtes FRANÇAISES (contenu français non traduit) et
  // cannibalisaient les pages FR. L'anglophone est servi par les 8 hubs
  // /en/services/[slug] qui restent indexables.

  // Pricing detail pages
  const pricingPages = PRICING.map((p) => ({
    url: `${BASE}/prix/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const enPricingPages = PRICING.map((p) => ({
    url: `${BASE}/en/prix/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Glossary pages
  const glossaryPages = [
    { url: `${BASE}/glossaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...GLOSSARY.map((g) => ({
      url: `${BASE}/glossaire/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
  // Longue traîne EN (glossaire 47 + problemes 51): zéro vue mesurée en 28 j —
  // hors sitemap pour concentrer le crawl (pages toujours accessibles).

  return [
    ...staticPages,
    ...howtoPages,
    ...servicePages,
    ...serviceCityPages,
    ...reparationCityPages,
    ...problemPages,
    ...pricingPages,
    ...glossaryPages,
    ...categoryPages,
    ...blogPages,
    ...enPages,
    ...enServicePages,
    ...enPricingPages,
    ...enCategoryPages,
  ];
}
