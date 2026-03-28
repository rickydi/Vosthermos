import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import { serializeProduct } from "@/lib/serialize";
import { getActivePromotions, getPromoForProduct, getDiscountedPrice } from "@/lib/promotions";

const BASE = "https://www.vosthermos.com";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) return {};

  const image = product.images[0]?.url
    ? `${BASE}${product.images[0].url}`
    : `${BASE}/images/Vos-Thermos-Logo.png`;

  return {
    title: `${product.sku} - ${product.nameEn || product.name} | Vosthermos Shop`,
    description: `Buy ${product.nameEn || product.name} (${product.sku}) online. ${product.descriptionEn || product.description || "Replacement part for doors and windows."} Price: $${Number(product.price).toFixed(2)}. Delivery available.`,
    alternates: {
      canonical: `${BASE}/en/produit/${slug}`,
      languages: {
        fr: `${BASE}/produit/${slug}`,
        en: `${BASE}/en/produit/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE}/en/produit/${slug}`,
      title: `${product.sku} - ${product.nameEn || product.name} | Vosthermos`,
      description: `${product.nameEn || product.name} - $${Number(product.price).toFixed(2)}. Door and window replacement part.`,
      images: [{ url: image }],
      locale: "en_CA",
    },
  };
}

export default async function ProductPageEn({ params }) {
  const { slug } = await params;

  const rawProduct = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { include: { parent: true } },
    },
  });

  if (!rawProduct) notFound();

  const product = serializeProduct(rawProduct);
  const activePromos = await getActivePromotions();
  const promo = getPromoForProduct(rawProduct, activePromos);
  const discountedPrice = promo ? getDiscountedPrice(product.price, promo) : null;

  const productForCart = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    image: product.images[0]?.url || "/placeholder.jpg",
    slug: product.slug,
  };

  return (
    <div className="pt-[80px]">
      <div className="bg-[var(--color-teal-dark)] py-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Link href="/en/boutique" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            {product.category?.parent && (
              <>
                <Link href={`/en/boutique/${product.category.parent.slug}`} className="hover:text-white transition-colors">
                  {product.category.parent.nameEn || product.category.parent.name}
                </Link>
                <span>/</span>
              </>
            )}
            {product.category && (
              <>
                <Link href={`/en/boutique/${product.category.slug}`} className="hover:text-white transition-colors">
                  {product.category.nameEn || product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white">{product.sku}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <p className="text-sm font-mono text-[var(--color-muted)] mb-2">{product.sku}</p>
            <h1 className="text-2xl font-extrabold mb-4">{product.nameEn || product.name}</h1>

            {discountedPrice !== null ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-3xl font-extrabold text-[var(--color-red)]">
                    ${discountedPrice.toFixed(2)}
                  </p>
                  <p className="text-xl text-[var(--color-muted)] line-through">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm">
                  <i className="fas fa-tag"></i>
                  {promo.type === "percent" ? `${Number(promo.value)}% off` : `$${Number(promo.value)} off`}
                  {promo.title && <span className="font-normal opacity-80">— {promo.title}</span>}
                </span>
              </div>
            ) : (
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-6">
                ${Number(product.price).toFixed(2)}
              </p>
            )}

            <div className="mb-6">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                product.availability === "InStock"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {product.availability === "InStock" ? "In stock" : "Out of stock"}
              </span>
            </div>

            <AddToCartButton product={productForCart} />

            {(product.detailedDescriptionEn || product.detailedDescription) && (
              <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                <h2 className="font-bold mb-3">Additional information</h2>
                <div className="text-sm text-[var(--color-muted)] whitespace-pre-line leading-relaxed">
                  {product.detailedDescriptionEn || product.detailedDescription}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
