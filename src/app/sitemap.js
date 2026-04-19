import prisma from "@/lib/prisma";
import { CITIES } from "@/lib/cities";
import { PROBLEMS } from "@/lib/problems-data";
import { PRICING } from "@/lib/pricing-data";
import { GLOSSARY } from "@/lib/glossary-data";
import { HOWTOS } from "@/lib/howto-data";

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

  // Calfeutrage + city pages
  const calfeutrageCityPages = CITIES.map((city) => ({
    url: `${BASE}/calfeutrage/${city.slug}`,
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

  // Product pages
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true },
  });
  const productPages = products.map((p) => ({
    url: `${BASE}/produit/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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
    { url: `${BASE}/en/prix`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/boutique`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/en/blogue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/en/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/garantie`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
  const EN_SERVICE_SLUGS = [
    "hardware-replacement",
    "sealed-glass-replacement",
    "wooden-door-repair",
    "custom-screen-doors",
    "caulking",
    "defogging",
    "door-insert",
    "weatherstripping",
  ];
  const enServicePages = EN_SERVICE_SLUGS.map((slug) => ({
    url: `${BASE}/en/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Pricing detail pages
  const pricingPages = PRICING.map((p) => ({
    url: `${BASE}/prix/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
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

  return [...staticPages, ...howtoPages, ...servicePages, ...serviceCityPages, ...reparationCityPages, ...calfeutrageCityPages, ...problemPages, ...pricingPages, ...glossaryPages, ...categoryPages, ...productPages, ...blogPages, ...enPages, ...enServicePages];
}
