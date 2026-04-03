"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, promo, locale }) {
  const productPath = locale === "en" ? `/en/produit/${product.slug}` : `/produit/${product.slug}`;
  const imgSrc = product.images?.[0]?.url || "/placeholder.jpg";
  const price = Number(product.price);
  const hasDiscount = promo && promo.type !== "message";
  let discountedPrice = null;

  if (hasDiscount) {
    const v = Number(promo.value);
    if (promo.type === "percent") {
      discountedPrice = Math.round(price * (1 - v / 100) * 100) / 100;
    } else if (promo.type === "fixed") {
      discountedPrice = Math.max(0, Math.round((price - v) * 100) / 100);
    }
  }

  return (
    <Link
      href={productPath}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-[var(--color-border)] overflow-hidden relative"
    >
      {hasDiscount && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-dark)] text-white text-[11px] font-bold px-3 py-1 rounded-br-xl rounded-tl-xl shadow-sm">
          {promo.type === "percent" ? `-${promo.value}%` : `-${promo.value}$`}
        </div>
      )}
      <div className="aspect-square relative bg-gray-50 overflow-hidden product-image-container">
        <Image
          src={imgSrc}
          alt={`${product.name} - ${product.sku} | Vosthermos`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--color-muted)] font-mono mb-1">{product.sku}</p>
        <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[var(--color-teal)] transition-colors">
          {product.name}
        </h3>
        {hasDiscount ? (
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-[var(--color-red)]">
              {discountedPrice.toFixed(2)} $
            </p>
            <p className="text-sm text-[var(--color-muted)] line-through">
              {price.toFixed(2)} $
            </p>
          </div>
        ) : (
          <p className="text-lg font-bold text-[var(--color-teal)]">
            {price.toFixed(2)} $
          </p>
        )}
      </div>
    </Link>
  );
}
