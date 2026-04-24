import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { serializeProducts } from "@/lib/serialize";
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions, getPromoForProduct } from "@/lib/promotions";

export async function generateMetadata({ params, searchParams }) {
  const { categorie } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1);
  const category = await prisma.category.findUnique({ where: { slug: categorie } });
  if (!category) return {};
  const displayName = category.nameEn || category.name;
  const frBaseUrl = `https://www.vosthermos.com/boutique/${categorie}`;
  const enBaseUrl = `https://www.vosthermos.com/en/boutique/${categorie}`;
  const frUrl = page > 1 ? `${frBaseUrl}?page=${page}` : frBaseUrl;
  const enUrl = page > 1 ? `${enBaseUrl}?page=${page}` : enBaseUrl;
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";
  return {
    title: `${displayName}${pageSuffix} - Vosthermos Shop | Door and Window Parts`,
    description: `Buy ${displayName.toLowerCase()} parts online. Wide selection, competitive prices. Vosthermos, your specialized hardware store.`,
    alternates: {
      canonical: enUrl,
      languages: {
        "fr-CA": frUrl,
        "en-CA": enUrl,
      },
    },
    openGraph: {
      type: "website",
      url: enUrl,
      title: `${displayName}${pageSuffix} - Vosthermos Shop`,
      description: `${displayName} parts available online at Vosthermos.`,
      images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "en_CA",
    },
  };
}

export default async function CategoryPageEn({ params, searchParams }) {
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

  const hasSubcats = category.children.length > 0;
  const subcatsWithProducts = category.children.filter(c => c._count.products > 0);

  let totalProducts;
  if (hasSubcats) {
    totalProducts = category.children.reduce((sum, c) => sum + c._count.products, 0);
  } else {
    totalProducts = await prisma.product.count({ where: { categoryId: category.id } });
  }

  const breadcrumbParent = category.parent;
  const activePromos = await getActivePromotions();

  // Check if images should be shown (admin setting)
  let showImages = true;
  try {
    const imgSetting = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'show_boutique_images'`);
    if (imgSetting[0]?.value === "false") showImages = false;
  } catch {}

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

  return (
    <div className="pt-[80px]">
      <div className="bg-[var(--color-teal-dark)] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
            <Link href="/en/boutique" className="hover:text-white transition-colors">Shop</Link>
            {breadcrumbParent && (
              <>
                <span>/</span>
                <Link href={`/en/boutique/${breadcrumbParent.slug}`} className="hover:text-white transition-colors">
                  {breadcrumbParent.nameEn || breadcrumbParent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-white">{category.nameEn || category.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{category.nameEn || category.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            {totalProducts} part{totalProducts > 1 ? "s" : ""} available online
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {hasSubcats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subcatsWithProducts.map((sub) => {
              const subPromo = activePromos.find(p => !p.categoryId || p.categoryId === sub.id || p.categoryId === category.id);
              return (
                <Link
                  key={sub.id}
                  href={`/en/boutique/${sub.slug}`}
                  className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] text-center group relative"
                >
                  {subPromo && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                      {subPromo.type === "percent" ? `-${Number(subPromo.value)}%` : subPromo.type === "fixed" ? `-${Number(subPromo.value)}$` : "SALE"}
                    </div>
                  )}
                  <div className="w-16 h-16 bg-[var(--color-teal)]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-red)] transition-colors">
                    <i className={`${getCategoryIcon(sub.slug)} text-2xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                  </div>
                  <h2 className="font-bold text-lg group-hover:text-[var(--color-teal)] transition-colors">
                    {sub.nameEn || sub.name}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-2">
                    {sub._count.products} product{sub._count.products > 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const promo = getPromoForProduct({ ...product, categoryId: category.id, category }, activePromos);
                const serializedPromo = promo ? { type: promo.type, value: Number(promo.value) } : null;
                return <ProductCard key={product.id} product={product} promo={serializedPromo} showImage={showImages} locale="en" />;
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/en/boutique/${categorie}?page=${p}`}
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
