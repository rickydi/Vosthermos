import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import OrderTable from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold admin-text mb-8">Commandes</h1>
      <OrderTable orders={serialized} />
    </div>
  );
}
