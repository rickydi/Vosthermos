import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions } from "@/lib/promotions";

export const metadata = {
  title: "Door and Window Parts Online Store | 740+ Parts | Vosthermos",
  description:
    "Buy your door and window replacement parts online: handles, mechanisms, rollers, weatherstripping, screen doors. Over 740 parts compatible with Novatech, Lepage, Fenplast, Jeld-Wen. Fast delivery in Quebec.",
  keywords: "window hardware, window parts online, patio door hardware, patio door rollers, window handle, window weatherstripping, replacement screen door, door window parts Quebec",
  alternates: {
    canonical: "https://www.vosthermos.com/en/boutique",
    languages: {
      fr: "https://www.vosthermos.com/boutique",
      en: "https://www.vosthermos.com/en/boutique",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/boutique",
    title: "Door and Window Parts Online Store | Vosthermos",
    description: "Over 740 replacement parts for doors, windows and screen doors. Compatible with all manufacturers. Fast delivery in Quebec.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
};

export default async function BoutiquePageEn() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: {
        include: { _count: { select: { products: true } } },
      },
    },
    orderBy: { order: "asc" },
  });

  const activePromos = await getActivePromotions();

  function getPromoForCategory(catId) {
    for (const p of activePromos) {
      if (!p.categoryId) return p;
      if (p.categoryId === catId) return p;
    }
    return null;
  }

  const catsWithCount = categories.map((cat) => {
    const directProducts = cat._count.products;
    const subProducts = cat.children.reduce((sum, c) => sum + c._count.products, 0);
    const promo = getPromoForCategory(cat.id);
    return { ...cat, totalProducts: directProducts + subProducts, promo };
  }).filter((cat) => cat.totalProducts > 0);

  const totalProducts = catsWithCount.reduce((sum, c) => sum + c.totalProducts, 0);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vosthermos Online Store - Door and Window Hardware",
    description: `Over ${totalProducts} replacement parts for doors, windows and screen doors available online.`,
    url: "https://www.vosthermos.com/en/boutique",
    isPartOf: {
      "@type": "WebSite",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      url: "https://www.vosthermos.com",
    },
    numberOfItems: totalProducts,
    hasPart: catsWithCount.map((cat) => ({
      "@type": "CollectionPage",
      name: cat.nameEn || cat.name,
      url: `https://www.vosthermos.com/en/boutique/${cat.slug}`,
      numberOfItems: cat.totalProducts,
    })),
  };

  return (
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Door and Window Parts Online Store
          </h1>
          <p className="text-white/70 max-w-2xl mt-3 leading-relaxed">
            Find the part you need from our inventory of {totalProducts}+ products: handles, mechanisms, patio door rollers, weatherstripping, screen doors and more. Compatible with Novatech, Lepage, Fenplast, Jeld-Wen, Kohltech and other manufacturers.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-box-open"></i> {totalProducts}+ parts in stock
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-shipping-fast"></i> Fast delivery
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-lock"></i> Secure payment
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catsWithCount.map((cat) => (
            <Link
              key={cat.id}
              href={`/en/boutique/${cat.slug}`}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] text-center group relative"
            >
              {cat.promo && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                  {cat.promo.type === "percent" ? `-${Number(cat.promo.value)}%` : cat.promo.type === "fixed" ? `-${Number(cat.promo.value)}$` : "PROMO"}
                </div>
              )}
              <div className="w-16 h-16 bg-[var(--color-teal)]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-red)] transition-colors">
                <i className={`${getCategoryIcon(cat.slug)} text-2xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
              </div>
              <h2 className="font-bold text-lg group-hover:text-[var(--color-teal)] transition-colors">
                {cat.nameEn || cat.name}
              </h2>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {cat.totalProducts} product{cat.totalProducts > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>

        {/* SEO content section */}
        <div className="mt-16 border-t border-[var(--color-border)] pt-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-extrabold mb-4">
              Your <span className="text-[var(--color-red)]">door and window</span> hardware store online
            </h2>
            <div className="text-sm text-[var(--color-muted)] space-y-4 leading-relaxed">
              <p>
                Vosthermos is the only online store in Quebec specializing exclusively in replacement parts for residential doors and windows. With over {totalProducts} products in inventory, you can easily find the part compatible with your window or patio door, regardless of manufacturer: Novatech, Lepage Millwork, Fenplast, Jeld-Wen, Kohltech, PlyGem or others.
              </p>
              <p>
                Our categories include window handles and mechanisms, patio door rollers and carriages, weatherstripping and seals, replacement screen doors, and all the hardware needed to repair your doors and windows yourself.
              </p>
              <p>
                Need help identifying your part? <Link href="/en/#contact" className="text-[var(--color-teal)] font-semibold hover:underline">Contact our experts</Link> at 514-825-8411 or send us a photo. We also offer a <Link href="/en/services/hardware-replacement" className="text-[var(--color-teal)] font-semibold hover:underline">professional installation service</Link> throughout Montreal and the South Shore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
