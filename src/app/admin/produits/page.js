import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import ProductSearch from "@/components/admin/ProductSearch";

export default async function AdminProductsPage() {
  await requireAdmin();

  const totalProducts = await prisma.product.count();

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });

  const flatCats = [];
  for (const cat of categories) {
    flatCats.push({ id: cat.id, name: cat.name, slug: cat.slug });
    for (const sub of cat.children) {
      flatCats.push({ id: sub.id, name: `  └─ ${sub.name}`, slug: sub.slug });
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold admin-text">Produits</h1>
          <p className="admin-text-muted text-sm mt-1">{totalProducts} produits au total</p>
        </div>
      </div>
      <ProductSearch categories={flatCats} />
    </div>
  );
}
