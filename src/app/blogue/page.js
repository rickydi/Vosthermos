import prisma from "@/lib/prisma";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";

export const metadata = {
  title: "Blogue | Vosthermos - Conseils portes et fenetres",
  description:
    "Decouvrez nos articles de blogue sur la reparation de portes et fenetres, l'entretien, les guides pratiques et les nouvelles de Vosthermos.",
  alternates: { canonical: "https://www.vosthermos.com/blogue" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/blogue",
    title: "Blogue | Vosthermos",
    description:
      "Conseils d'experts pour l'entretien et la reparation de vos portes et fenetres.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
};

const POSTS_PER_PAGE = 12;

const categories = [
  { value: "all", label: "Tous" },
  { value: "conseils", label: "Conseils" },
  { value: "entretien", label: "Entretien" },
  { value: "guides", label: "Guides" },
  { value: "nouvelles", label: "Nouvelles" },
];

export default async function BloguePage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1");
  const cat = params?.categorie || "all";

  const where = {
    status: "published",
    publishedAt: { not: null },
  };
  if (cat && cat !== "all") {
    where.category = cat;
  }

  let posts = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),
      prisma.blogPost.count({ where }),
    ]);
  } catch {
    // Table may not exist yet before migration
  }

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const serialized = posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blogue Vosthermos",
    description:
      "Conseils et guides sur la reparation de portes et fenetres au Quebec",
    url: "https://www.vosthermos.com/blogue",
    publisher: {
      "@type": "Organization",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
    },
  };

  return (
    <div className="pt-[80px]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Notre blogue
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Conseils d&apos;experts, guides pratiques et nouvelles pour bien
            entretenir vos portes et fenetres
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex gap-2 overflow-x-auto">
          {categories.map((c) => {
            const isActive = cat === c.value || (!cat && c.value === "all");
            const href =
              c.value === "all"
                ? "/blogue"
                : `/blogue?categorie=${c.value}`;
            return (
              <Link
                key={c.value}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[var(--color-teal)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {serialized.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serialized.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={`/blogue?page=${page - 1}${cat !== "all" ? `&categorie=${cat}` : ""}`}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    &larr; Precedent
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={`/blogue?page=${p}${cat !== "all" ? `&categorie=${cat}` : ""}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-[var(--color-teal)] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
                {page < totalPages && (
                  <Link
                    href={`/blogue?page=${page + 1}${cat !== "all" ? `&categorie=${cat}` : ""}`}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Suivant &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <i className="fas fa-newspaper text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-500 text-lg">
              Aucun article pour le moment.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Revenez bientot pour decouvrir nos conseils!
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Besoin de conseils personnalises?
          </h2>
          <p className="text-white/60 mb-8">
            Nos experts sont disponibles pour repondre a toutes vos questions
            sur vos portes et fenetres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
            >
              <i className="fas fa-phone"></i>
              514-825-8411
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-envelope"></i>
              Soumission gratuite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
