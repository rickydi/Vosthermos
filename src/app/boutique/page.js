import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions } from "@/lib/promotions";

export const metadata = {
  title: "Quincaillerie de portes et fenetres en ligne | 740+ pieces | Vosthermos",
  description:
    "Achetez en ligne vos pieces de remplacement pour portes et fenetres: poignees, mecanismes, rouleaux, coupe-froid, moustiquaires. Plus de 740 pieces compatibles avec Novatech, Lepage, Fenplast, Jeld-Wen. Livraison rapide au Quebec.",
  keywords: "quincaillerie fenetre, pieces fenetre en ligne, quincaillerie porte patio, rouleau porte patio, poignee fenetre, coupe-froid fenetre, moustiquaire remplacement, pieces porte et fenetre Quebec",
  alternates: { canonical: "https://www.vosthermos.com/boutique" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/boutique",
    title: "Quincaillerie de portes et fenetres en ligne | Vosthermos",
    description: "Plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires. Compatibles avec tous les manufacturiers. Livraison rapide au Quebec.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
};

export default async function BoutiquePage() {
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

  // Find promo for a category (direct match or global)
  function getPromoForCategory(catId) {
    for (const p of activePromos) {
      if (!p.categoryId) return p; // global
      if (p.categoryId === catId) return p; // direct
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
    name: "Boutique en ligne Vosthermos - Quincaillerie de portes et fenetres",
    description: `Plus de ${totalProducts} pieces de remplacement pour portes, fenetres et moustiquaires disponibles en ligne.`,
    url: "https://www.vosthermos.com/boutique",
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
      name: cat.name,
      url: `https://www.vosthermos.com/boutique/${cat.slug}`,
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
            Quincaillerie de portes et fenetres en ligne
          </h1>
          <p className="text-white/70 max-w-2xl mt-3 leading-relaxed">
            Trouvez la piece qu&apos;il vous faut parmi notre inventaire de {totalProducts}+ produits: poignees, mecanismes, rouleaux de porte-patio, coupe-froid, moustiquaires et plus. Compatible avec Novatech, Lepage, Fenplast, Jeld-Wen, Kohltech et autres manufacturiers.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-box-open"></i> {totalProducts}+ pieces en stock
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-shipping-fast"></i> Livraison rapide
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
              <i className="fas fa-lock"></i> Paiement securise
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catsWithCount.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique/${cat.slug}`}
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
                {cat.name}
              </h2>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {cat.totalProducts} produit{cat.totalProducts > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>

        {/* SEO content section */}
        <div className="mt-16 border-t border-[var(--color-border)] pt-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-extrabold mb-4">
              Votre quincaillerie de <span className="text-[var(--color-red)]">portes et fenetres</span> en ligne
            </h2>
            <div className="text-sm text-[var(--color-muted)] space-y-4 leading-relaxed">
              <p>
                Vosthermos est la seule boutique en ligne au Quebec specialisee exclusivement dans les pieces de remplacement pour portes et fenetres residentielles. Avec plus de {totalProducts} produits en inventaire, vous trouverez facilement la piece compatible avec votre fenetre ou porte-patio, quel que soit le manufacturier: Novatech, Lepage Millwork, Fenplast, Jeld-Wen, Kohltech, PlyGem ou autres.
              </p>
              <p>
                Nos categories incluent les poignees et mecanismes de fenetre, les rouleaux et chariots de porte-patio, les coupe-froid et joints d&apos;etancheite, les moustiquaires de remplacement, ainsi que toute la quincaillerie necessaire pour reparer vous-meme vos portes et fenetres.
              </p>
              <p>
                Besoin d&apos;aide pour identifier votre piece? <Link href="/#contact" className="text-[var(--color-teal)] font-semibold hover:underline">Contactez nos experts</Link> au 514-825-8411 ou envoyez-nous une photo. Nous offrons egalement un <Link href="/services/remplacement-quincaillerie" className="text-[var(--color-teal)] font-semibold hover:underline">service d&apos;installation professionnel</Link> partout a Montreal et sur la Rive-Sud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
