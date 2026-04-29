import prisma from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalProducts, totalCategories, totalOrders, recentOrders, activeManagers] = await Promise.all([
    prisma.product.count(),
    prisma.category.count({ where: { parentId: null } }),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.managerUser.count({ where: { isActive: true } }),
  ]);

  const pendingOrders = await prisma.order.count({ where: { status: "pending" } });

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    shipped: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmee",
    shipped: "Expediee",
    delivered: "Livree",
    cancelled: "Annulee",
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold admin-text mb-8">Tableau de bord</h1>

      <div className="admin-card rounded-xl border p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center">
            <i className="fas fa-door-open text-lg"></i>
          </div>
          <div>
            <h2 className="admin-text font-bold">Acces direct au portail gestionnaire</h2>
            <p className="admin-text-muted text-sm">
              {activeManagers} compte{activeManagers > 1 ? "s" : ""} actif{activeManagers > 1 ? "s" : ""}. Ouvre la page et clique sur l&apos;oeil du gestionnaire.
            </p>
          </div>
        </div>
        <Link
          href="/admin/gestionnaires"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold"
        >
          <i className="fas fa-user-tie"></i>
          Ouvrir les acces
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Commandes en attente", value: pendingOrders, icon: "fa-clock", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Total commandes", value: totalOrders, icon: "fa-shopping-bag", color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Produits", value: totalProducts, icon: "fa-boxes", color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Categories", value: totalCategories, icon: "fa-folder-open", color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="admin-card rounded-xl p-5 border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <i className={`fas ${stat.icon} ${stat.color}`}></i>
              </div>
              <span className="admin-text-muted text-sm">{stat.label}</span>
            </div>
            <p className="text-3xl font-extrabold admin-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="admin-card rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between p-5 admin-border border-b">
          <h2 className="font-bold admin-text">Commandes recentes</h2>
          <Link href="/admin/commandes" className="text-[var(--color-red)] text-sm font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-5 admin-text-muted text-center">Aucune commande pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="admin-text-muted text-xs uppercase admin-border border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="admin-border border-b admin-hover transition-colors">
                    <td className="p-4 admin-text-muted font-mono text-sm">#{order.id}</td>
                    <td className="p-4">
                      <p className="admin-text text-sm font-medium">{order.name}</p>
                      <p className="admin-text-muted text-xs">{order.email}</p>
                    </td>
                    <td className="p-4 admin-text font-bold text-sm">{Number(order.total).toFixed(2)} $</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 admin-text-muted text-sm">
                      {new Date(order.createdAt).toLocaleDateString("fr-CA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
