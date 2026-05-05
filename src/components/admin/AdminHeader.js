"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/vendeur": "Vendeur",
  "/admin/commandes": "Commandes",
  "/admin/produits": "Produits",
  "/admin/categories": "Categories",
  "/admin/suivi-clients": "Suivi clients",
  "/admin/calculateur-thermos": "Calculateur thermos",
  "/admin/analytics": "Analytics",
  "/admin/promotions": "Promotions",
  "/admin/parametres": "Parametres",
  "/admin/activite": "Activite admin",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/gestionnaires": "Acces gestionnaires",
  "/admin/menu": "Menu admin",
};

export default function AdminHeader() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  let title = pageTitles[pathname];
  if (!title) {
    if (pathname.startsWith("/admin/produits/")) title = "Editer un produit";
    else if (pathname.startsWith("/admin/gestionnaires/")) title = "Gestionnaire";
    else title = "Administration";
  }

  return (
    <div className="h-16 admin-header admin-border border-b flex items-center justify-between px-6 lg:px-8">
      <h2 className="admin-text font-bold text-lg">{title}</h2>
      <div className="flex items-center gap-3">
        <ThemeToggle iconOnly />
        <span className="admin-text-muted text-sm hidden sm:block">Admin</span>
        <div className="w-9 h-9 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </div>
  );
}
