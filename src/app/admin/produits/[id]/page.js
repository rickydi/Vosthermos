import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import ProductEditForm from "@/components/admin/ProductEditForm";

export default async function AdminProductEditPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { include: { parent: true } },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  const flatCats = [];
  for (const cat of categories) {
    flatCats.push({ id: cat.id, name: cat.name });
    for (const sub of cat.children) {
      flatCats.push({ id: sub.id, name: `  └─ ${sub.name}` });
    }
  }

  const serialized = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  return (
    <div className="p-6 lg:p-8">
      <ProductEditForm product={serialized} categories={flatCats} />
    </div>
  );
}
