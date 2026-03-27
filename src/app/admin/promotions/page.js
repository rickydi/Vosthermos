import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import PromotionManager from "@/components/admin/PromotionManager";

export default async function AdminPromotionsPage() {
  await requireAdmin();

  const promotions = await prisma.promotion.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

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

  const serialized = promotions.map((p) => ({
    ...p,
    value: Number(p.value),
    startDate: p.startDate.toISOString().split("T")[0],
    endDate: p.endDate.toISOString().split("T")[0],
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <PromotionManager promotions={serialized} categories={flatCats} />
    </div>
  );
}
