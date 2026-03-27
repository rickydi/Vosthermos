export function serializeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    nameEn: product.nameEn || null,
    descriptionEn: product.descriptionEn || null,
    detailedDescriptionEn: product.detailedDescriptionEn || null,
    createdAt: product.createdAt?.toISOString() || null,
    updatedAt: product.updatedAt?.toISOString() || null,
  };
}

export function serializeProducts(products) {
  return products.map(serializeProduct);
}
