"use client";

import { usePathname } from "next/navigation";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/commandes": "Commandes",
  "/admin/produits": "Produits",
  "/admin/categories": "Categories",
  "/admin/analytics": "Analytics",
  "/admin/promotions": "Promotions",
  "/admin/parametres": "Parametres",
  "/admin/utilisateurs": "Utilisateurs",
};

export default function AdminHeader() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  let title = pageTitles[pathname];
  if (!title) {
    if (pathname.startsWith("/admin/produits/")) title = "Editer un produit";
    else title = "Administration";
  }

  return (
    <div className="h-16 admin-header admin-border border-b flex items-center justify-between px-6 lg:px-8">
      <h2 className="admin-text font-bold text-lg">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="admin-text-muted text-sm hidden sm:block">Admin</span>
        <div className="w-9 h-9 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </div>
  );
}
