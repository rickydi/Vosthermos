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
    title: `${product.sku} - ${product.name} | Vosthermos Boutique`,
    description: `Achetez ${product.name} (${product.sku}) en ligne. ${product.description || "Piece de remplacement pour portes et fenetres."} Prix: ${Number(product.price).toFixed(2)} $. Livraison disponible.`,
    alternates: {
      canonical: `${BASE}/produit/${slug}`,
      languages: {
        "fr-CA": `${BASE}/produit/${slug}`,
        "en-CA": `${BASE}/en/produit/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE}/produit/${slug}`,
      title: `${product.sku} - ${product.name} | Vosthermos`,
      description: `${product.name} - ${Number(product.price).toFixed(2)} $. Piece de remplacement pour portes et fenetres.`,
      images: [{ url: image }],
      locale: "fr_CA",
    },
  };
}

export default async function ProductPage({ params }) {
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

  // Check if images should be shown
  let showImages = true;
  try {
    const imgSetting = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'show_boutique_images'`);
    if (imgSetting[0]?.value === "false") showImages = false;
  } catch {}

  // Check for active promotions
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

  // Product JSON-LD (enriched for maximum Google visibility)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description || product.name,
    image: product.images.map((img) => `${BASE}${img.url}`),
    url: `${BASE}/produit/${product.slug}`,
    brand: { "@type": "Brand", name: "Vosthermos" },
    category: product.category?.name || "Pieces de portes et fenetres",
    offers: {
      "@type": "Offer",
      price: Number(product.price).toFixed(2),
      priceCurrency: "CAD",
      availability: product.availability === "InStock"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BASE}/produit/${product.slug}`,
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Vosthermos" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "CA", addressRegion: "QC" },
        deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" } },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };

  // ImageObject JSON-LD (for Google Images rich results)
  const imageObjectJsonLd = product.images.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `${BASE}${product.images[0].url}`,
    name: `${product.name} - ${product.sku}`,
    description: `${product.name} (${product.sku}) - Piece de remplacement pour portes et fenetres${product.category ? ` - ${product.category.name}` : ""}. Disponible chez Vosthermos.`,
    width: "800",
    height: "800",
    thumbnail: `${BASE}${product.images[0].url}`,
    associatedArticle: {
      "@type": "WebPage",
      url: `${BASE}/produit/${product.slug}`,
    },
    creator: {
      "@type": "Organization",
      name: "Vosthermos",
    },
  } : null;

  // Breadcrumb JSON-LD
  const breadcrumbItems = [
    { name: "Accueil", url: BASE },
    { name: "Boutique", url: `${BASE}/boutique` },
  ];
  if (product.category?.parent) {
    breadcrumbItems.push({
      name: product.category.parent.name,
      url: `${BASE}/boutique/${product.category.parent.slug}`,
    });
  }
  if (product.category) {
    breadcrumbItems.push({
      name: product.category.name,
      url: `${BASE}/boutique/${product.category.slug}`,
    });
  }
  breadcrumbItems.push({ name: product.sku, url: `${BASE}/produit/${product.slug}` });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className="pt-[80px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {imageObjectJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectJsonLd) }}
        />
      )}

      <div className="bg-[var(--color-teal-dark)] py-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Link href="/boutique" className="hover:text-white transition-colors">Boutique</Link>
            <span>/</span>
            {product.category?.parent && (
              <>
                <Link href={`/boutique/${product.category.parent.slug}`} className="hover:text-white transition-colors">
                  {product.category.parent.name}
                </Link>
                <span>/</span>
              </>
            )}
            {product.category && (
              <>
                <Link href={`/boutique/${product.category.slug}`} className="hover:text-white transition-colors">
                  {product.category.name}
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
          {showImages ? (
            <ProductGallery images={product.images} name={product.name} />
          ) : (
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
              <i className="fas fa-image text-gray-200 text-5xl"></i>
            </div>
          )}

          <div>
            <p className="text-sm font-mono text-[var(--color-muted)] mb-2">{product.sku}</p>
            <h1 className="text-2xl font-extrabold mb-4">{product.name}</h1>

            {discountedPrice !== null ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-3xl font-extrabold text-[var(--color-red)]">
                    {discountedPrice.toFixed(2)} $
                  </p>
                  <p className="text-xl text-[var(--color-muted)] line-through">
                    {Number(product.price).toFixed(2)} $
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm">
                  <i className="fas fa-tag"></i>
                  {promo.type === "percent" ? `${Number(promo.value)}% de rabais` : `${Number(promo.value)}$ de rabais`}
                  {promo.title && <span className="font-normal opacity-80">— {promo.title}</span>}
                </span>
              </div>
            ) : (
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-6">
                {Number(product.price).toFixed(2)} $
              </p>
            )}

            <div className="mb-6">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                product.availability === "InStock"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {product.availability === "InStock" ? "En stock" : "Rupture de stock"}
              </span>
            </div>

            <AddToCartButton product={productForCart} />

            {product.detailedDescription && (
              <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                <h2 className="font-bold mb-3">Informations supplementaires</h2>
                <div className="text-sm text-[var(--color-muted)] whitespace-pre-line leading-relaxed">
                  {product.detailedDescription}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
