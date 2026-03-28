import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { serializeProducts } from "@/lib/serialize";
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions, getPromoForProduct } from "@/lib/promotions";

export async function generateMetadata({ params }) {
  const { categorie } = await params;
  const category = await prisma.category.findUnique({ where: { slug: categorie } });
  if (!category) return {};
  return {
    title: `${category.name} - Boutique Vosthermos | Pieces de portes et fenetres`,
    description: `Achetez des pieces de ${category.name.toLowerCase()} en ligne. Vaste choix, prix competitifs. Vosthermos, votre quincaillerie specialisee.`,
    alternates: { canonical: `https://www.vosthermos.com/boutique/${categorie}` },
    openGraph: {
      type: "website",
      url: `https://www.vosthermos.com/boutique/${categorie}`,
      title: `${category.name} - Boutique Vosthermos`,
      description: `Pieces de ${category.name.toLowerCase()} disponibles en ligne chez Vosthermos.`,
      images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "fr_CA",
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { categorie } = await params;
  const sp = await searchParams;
  const page = parseInt(sp?.page || "1");
  const perPage = 24;

  const category = await prisma.category.findUnique({
    where: { slug: categorie },
    include: {
      parent: true,
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category) notFound();

  // If this category has children (subcategories), show them instead of products
  const hasSubcats = category.children.length > 0;
  const subcatsWithProducts = category.children.filter(c => c._count.products > 0);

  // Count total products (direct + in subcats)
  let totalProducts;
  if (hasSubcats) {
    totalProducts = category.children.reduce((sum, c) => sum + c._count.products, 0);
  } else {
    totalProducts = await prisma.product.count({ where: { categoryId: category.id } });
  }

  // Get breadcrumb parent
  const breadcrumbParent = category.parent;

  // Get active promotions
  const activePromos = await getActivePromotions();

  // Get products only if no subcategories
  let products = [];
  let totalPages = 0;
  if (!hasSubcats) {
    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: { sku: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where: { categoryId: category.id } }),
    ]);
    products = serializeProducts(rawProducts);
    totalPages = Math.ceil(total / perPage);
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Boutique", item: "https://www.vosthermos.com/boutique" },
      ...(breadcrumbParent
        ? [{ "@type": "ListItem", position: 2, name: breadcrumbParent.name, item: `https://www.vosthermos.com/boutique/${breadcrumbParent.slug}` }]
        : []),
      { "@type": "ListItem", position: breadcrumbParent ? 3 : 2, name: category.name, item: `https://www.vosthermos.com/boutique/${categorie}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} - Quincaillerie Vosthermos`,
    description: `Pieces de ${category.name.toLowerCase()} pour portes et fenetres. ${totalProducts} produits disponibles en ligne.`,
    url: `https://www.vosthermos.com/boutique/${categorie}`,
    numberOfItems: totalProducts,
    isPartOf: {
      "@type": "WebSite",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
    },
  };

  // ItemList schema for product carousel in Google
  const itemListJsonLd = products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        url: `https://www.vosthermos.com/produit/${p.slug}`,
        image: p.images[0]?.url ? `https://www.vosthermos.com${p.images[0].url}` : undefined,
        sku: p.sku,
        offers: {
          "@type": "Offer",
          price: Number(p.price).toFixed(2),
          priceCurrency: "CAD",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
    })),
  } : null;

  return (
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="bg-[var(--color-teal-dark)] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
            <Link href="/boutique" className="hover:text-white transition-colors">Boutique</Link>
            {breadcrumbParent && (
              <>
                <span>/</span>
                <Link href={`/boutique/${breadcrumbParent.slug}`} className="hover:text-white transition-colors">
                  {breadcrumbParent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-white">{category.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{category.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            {totalProducts} piece{totalProducts > 1 ? "s" : ""} de {category.name.toLowerCase()} disponible{totalProducts > 1 ? "s" : ""} en ligne
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {hasSubcats ? (
          /* Show subcategories */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subcatsWithProducts.map((sub) => {
              // Check if promo applies to this subcategory or its parent
              const subPromo = activePromos.find(p => !p.categoryId || p.categoryId === sub.id || p.categoryId === category.id);
              return (
                <Link
                  key={sub.id}
                  href={`/boutique/${sub.slug}`}
                  className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] text-center group relative"
                >
                  {subPromo && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                      {subPromo.type === "percent" ? `-${Number(subPromo.value)}%` : subPromo.type === "fixed" ? `-${Number(subPromo.value)}$` : "PROMO"}
                    </div>
                  )}
                  <div className="w-16 h-16 bg-[var(--color-teal)]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-red)] transition-colors">
                    <i className={`${getCategoryIcon(sub.slug)} text-2xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                  </div>
                  <h2 className="font-bold text-lg group-hover:text-[var(--color-teal)] transition-colors">
                    {sub.name}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-2">
                    {sub._count.products} produit{sub._count.products > 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Show products directly */
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const promo = getPromoForProduct({ ...product, categoryId: category.id, category }, activePromos);
                const serializedPromo = promo ? { type: promo.type, value: Number(promo.value) } : null;
                return <ProductCard key={product.id} product={product} promo={serializedPromo} />;
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/boutique/${categorie}?page=${p}`}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      p === page
                        ? "bg-[var(--color-red)] text-white shadow-lg"
                        : "bg-white border border-[var(--color-border)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
