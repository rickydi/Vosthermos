"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: "fa-tachometer-alt", exact: true },
  { section: "BOUTIQUE" },
  { href: "/admin/commandes", label: "Commandes", icon: "fa-shopping-bag" },
  { href: "/admin/produits", label: "Produits", icon: "fa-boxes" },
  { href: "/admin/categories", label: "Categories", icon: "fa-folder-open" },
  { section: "GESTION" },
  { href: "/admin/chat", label: "Chat clients", icon: "fa-comments" },
  { href: "/admin/analytics", label: "Analytics", icon: "fa-chart-line" },
  { href: "/admin/promotions", label: "Promotions", icon: "fa-tag" },
  { href: "/admin/blogue", label: "Blogue", icon: "fa-pen-nib" },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: "fa-calendar-check" },
  { href: "/admin/seo", label: "SEO", icon: "fa-search" },
  { section: "TERRAIN" },
  { href: "/admin/bons", label: "Bons de travail", icon: "fa-clipboard-list" },
  { href: "/admin/techniciens", label: "Techniciens", icon: "fa-hard-hat" },
  { href: "/admin/clients", label: "Clients", icon: "fa-address-book" },
  { section: "SYSTEME" },
  { href: "/admin/parametres", label: "Parametres", icon: "fa-cog" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "fa-users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingRdv, setPendingRdv] = useState(0);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const [chatRes, rdvRes] = await Promise.all([
          fetch("/api/admin/chat"),
          fetch("/api/admin/appointments?status=pending"),
        ]);
        const chatData = await chatRes.json();
        if (Array.isArray(chatData)) {
          setUnreadChat(chatData.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
        }
        const rdvData = await rdvRes.json();
        if (Array.isArray(rdvData)) {
          setPendingRdv(rdvData.length);
        }
      } catch {}
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, []);

  if (pathname === "/admin/login") return null;

  function isActive(item) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 admin-card backdrop-blur p-3 rounded-xl admin-text"
      >
        <i className={`fas ${open ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 admin-sidebar z-40 flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 admin-border border-b">
          <Link href="/admin" onClick={() => setOpen(false)}>
            <Image
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos Admin"
              width={150}
              height={42}
              className="h-8 w-auto [data-admin-theme='light']_&:hidden"
            />
            <span className="text-xl font-extrabold admin-text hidden [data-admin-theme='light']_&:block">VOSTHERMOS</span>
          </Link>
          <p className="admin-text-muted text-xs mt-1">Administration</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) =>
            item.section ? (
              <p key={item.section} className="admin-text-muted text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-1">
                {item.section}
              </p>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item)
                    ? "bg-[var(--color-red)] text-white shadow-lg"
                    : "admin-text-muted admin-hover"
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {item.label}
                {item.href === "/admin/chat" && (
                  unreadChat > 0 ? (
                    <span className="ml-auto flex items-center gap-1.5 animate-[wiggle_3s_ease-in-out_infinite_2s]">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold">{unreadChat}</span>
                    </span>
                  ) : (
                    <span className="ml-auto relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  )
                )}
                {item.href === "/admin/rendez-vous" && pendingRdv > 0 && (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-bold">{pendingRdv}</span>
                  </span>
                )}
              </Link>
            )
          )}
        </nav>

        <div className="p-4 admin-border border-t space-y-2">
          <ThemeToggle />
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm admin-text-muted admin-hover transition-all"
          >
            <i className="fas fa-external-link-alt w-5 text-center"></i>
            Voir le site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm admin-text-muted hover:text-red-400 admin-hover transition-all w-full"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
