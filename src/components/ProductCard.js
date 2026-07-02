"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, locale, showImage = true }) {
  const isEn = locale === "en";
  const productPath = isEn ? `/en/produit/${product.slug}` : `/produit/${product.slug}`;
  const imgSrc = product.images?.[0]?.url || "/placeholder.jpg";
  const displayName = isEn ? (product.nameEn || product.name) : product.name;
  const price = Number(product.price);

  const formatPrice = (v) => isEn ? `$${v.toFixed(2)}` : `${v.toFixed(2)} $`;

  return (
    <Link
      href={productPath}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-[var(--color-border)] overflow-hidden relative"
    >
      {showImage && (
        <div className="aspect-square relative bg-gray-50 overflow-hidden">
          <Image
            src={imgSrc}
            alt={`${displayName} - ${product.sku} | Vosthermos`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <p className="text-xs text-[var(--color-muted)] font-mono mb-1">{product.sku}</p>
        <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[var(--color-teal)] transition-colors">
          {displayName}
        </h3>
        <p className="text-lg font-bold text-[var(--color-teal)]">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
