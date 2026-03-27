import prisma from "@/lib/prisma";

// Get all active promotions (cached per request)
export async function getActivePromotions() {
  const now = new Date();
  return prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { category: { include: { parent: true } } },
  });
}

// Find the best promotion for a product's category
export function getPromoForProduct(product, promos) {
  if (!promos || promos.length === 0) return null;

  for (const promo of promos) {
    // Global promo (no category)
    if (!promo.categoryId) return promo;

    // Direct category match
    if (product.categoryId === promo.categoryId) return promo;

    // Parent category match (promo on parent applies to subcategories)
    if (product.category?.parentId === promo.categoryId) return promo;
  }

  return null;
}

// Calculate discounted price
export function getDiscountedPrice(price, promo) {
  if (!promo || promo.type === "message") return null;

  const p = Number(price);
  const v = Number(promo.value);

  if (promo.type === "percent") {
    return Math.round((p * (1 - v / 100)) * 100) / 100;
  }
  if (promo.type === "fixed") {
    return Math.max(0, Math.round((p - v) * 100) / 100);
  }
  return null;
}
