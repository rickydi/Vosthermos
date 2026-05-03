"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const DASHBOARD_ITEM = {
  href: "/admin",
  label: "Tableau de bord",
  icon: "fa-tachometer-alt",
  exact: true,
};

const NAV_SECTIONS = [
  {
    key: "production",
    label: "Production",
    icon: "fa-clipboard-check",
    dotClass: "bg-emerald-400",
    accentClass: "text-emerald-400",
    summary: "Suivis, bons, rendez-vous",
    items: [
      { href: "/admin/suivi-clients", label: "Suivi clients", icon: "fa-tasks" },
      { href: "/admin/bons", label: "Bons de travail", icon: "fa-clipboard-list" },
      { href: "/admin/rendez-vous", label: "Rendez-vous", icon: "fa-calendar-check" },
      { href: "/admin/chat", label: "Chat clients", icon: "fa-comments" },
      { href: "/admin/techniciens", label: "Techniciens", icon: "fa-hard-hat" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    icon: "fa-address-book",
    dotClass: "bg-sky-400",
    accentClass: "text-sky-400",
    summary: "Clients, ventes, portail",
    items: [
      { href: "/admin/clients", label: "Base clients", icon: "fa-address-book" },
      { href: "/admin/vendeur", label: "Vendeur", icon: "fa-handshake" },
      { href: "/admin/gestionnaires", label: "Acces gestionnaires", icon: "fa-door-open" },
    ],
  },
  {
    key: "boutique",
    label: "Boutique",
    icon: "fa-shopping-bag",
    dotClass: "bg-violet-400",
    accentClass: "text-violet-400",
    summary: "Commandes et catalogue",
    items: [
      { href: "/admin/commandes", label: "Commandes", icon: "fa-shopping-bag" },
      { href: "/admin/produits", label: "Produits", icon: "fa-boxes" },
      { href: "/admin/categories", label: "Categories", icon: "fa-folder-open" },
      { href: "/admin/promotions", label: "Promotions", icon: "fa-tag" },
    ],
  },
  {
    key: "site",
    label: "Site web",
    icon: "fa-globe",
    dotClass: "bg-cyan-400",
    accentClass: "text-cyan-400",
    summary: "SEO, contenu, statistiques",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: "fa-chart-line" },
      { href: "/admin/seo", label: "SEO", icon: "fa-search" },
      { href: "/admin/blogue", label: "Blogue", icon: "fa-pen-nib" },
      { href: "/admin/services", label: "Services", icon: "fa-tools" },
    ],
  },
  {
    key: "systeme",
    label: "Systeme",
    icon: "fa-shield-alt",
    dotClass: "bg-amber-400",
    accentClass: "text-amber-400",
    summary: "Reglages et utilisateurs",
    items: [
      { href: "/admin/activite", label: "Activite admin", icon: "fa-history" },
      { href: "/admin/parametres", label: "Parametres", icon: "fa-cog" },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "fa-users" },
    ],
  },
];

function isItemActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function detectSectionKey(pathname) {
  return NAV_SECTIONS.find((section) =>
    section.items.some((item) => isItemActive(pathname, item))
  )?.key;
}

function getItemBadge(href, badges) {
  if (href === "/admin/chat") return badges.unreadChat;
  if (href === "/admin/bons") return badges.pendingRequests;
  if (href === "/admin/rendez-vous") return badges.pendingRdv;
  return 0;
}

function StatusBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-5 rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white shadow-sm shadow-amber-500/30">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sectionPickerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingRdv, setPendingRdv] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  const detectedSectionKey = detectSectionKey(pathname);
  const activeSectionKey = detectedSectionKey || "production";
  const activeSection =
    NAV_SECTIONS.find((section) => section.key === activeSectionKey) || NAV_SECTIONS[0];
  const activeBadges = { unreadChat, pendingRdv, pendingRequests };

  useEffect(() => {
    if (!sectionPickerOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (sectionPickerRef.current && !sectionPickerRef.current.contains(event.target)) {
        setSectionPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [sectionPickerOpen]);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const noCache = { cache: "no-store", headers: { "Cache-Control": "no-cache" } };
        const [chatRes, rdvRes, reqRes] = await Promise.all([
          fetch("/api/admin/chat", noCache),
          fetch("/api/admin/appointments?status=pending", noCache),
          fetch("/api/admin/work-orders/pending-count", noCache),
        ]);
        const chatData = await chatRes.json();
        if (Array.isArray(chatData)) {
          setUnreadChat(chatData.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
        }
        const rdvData = await rdvRes.json();
        if (Array.isArray(rdvData)) {
          setPendingRdv(rdvData.length);
        }
        const reqData = await reqRes.json();
        if (typeof reqData?.count === "number") {
          setPendingRequests(reqData.count);
        }
      } catch {}
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 5000);
    const onFocus = () => fetchBadges();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  if (pathname === "/admin/login") return null;

  function handleSectionSelect(sectionKey) {
    const section = NAV_SECTIONS.find((item) => item.key === sectionKey);
    setSectionPickerOpen(false);
    if (section?.items[0]) {
      setOpen(false);
      router.push(section.items[0].href);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 admin-card backdrop-blur p-3 rounded-xl admin-text"
        aria-label="Ouvrir le menu admin"
      >
        <i className={`fas ${open ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 admin-sidebar z-40 flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 admin-border border-b">
          <Link href="/admin" onClick={() => setOpen(false)}>
            <Image
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos Admin"
              width={150}
              height={42}
              className="h-8 w-auto [data-admin-theme='light']_&:hidden"
            />
            <span className="text-xl font-extrabold admin-text hidden [data-admin-theme='light']_&:block">
              VOSTHERMOS
            </span>
          </Link>
          <p className="admin-text-muted text-xs mt-1">Administration</p>
        </div>

        <div className="px-3 pt-4">
          <Link
            href={DASHBOARD_ITEM.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              isItemActive(pathname, DASHBOARD_ITEM)
                ? "bg-[var(--color-red)] text-white shadow-lg"
                : "admin-text-muted admin-hover"
            }`}
          >
            <i className={`fas ${DASHBOARD_ITEM.icon} w-5 text-center`}></i>
            {DASHBOARD_ITEM.label}
          </Link>
        </div>

        <div className="relative px-3 pt-3" ref={sectionPickerRef}>
          <button
            type="button"
            onClick={() => setSectionPickerOpen((value) => !value)}
            className="w-full rounded-xl border admin-border admin-card px-3 py-3 text-left transition-all hover:bg-white/5"
            aria-expanded={sectionPickerOpen}
          >
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${activeSection.dotClass}`}></span>
              <i className={`fas ${activeSection.icon} w-5 text-center ${activeSection.accentClass}`}></i>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold admin-text">{activeSection.label}</span>
                <span className="block truncate text-[10px] admin-text-muted">{activeSection.summary}</span>
              </span>
              <i className={`fas fa-chevron-down text-xs admin-text-muted transition-transform ${
                sectionPickerOpen ? "rotate-180" : ""
              }`}></i>
            </div>
          </button>

          <div
            className={`absolute left-3 right-3 top-full z-50 mt-2 overflow-hidden rounded-xl border admin-border admin-bg shadow-2xl transition-all origin-top ${
              sectionPickerOpen
                ? "opacity-100 scale-y-100 pointer-events-auto"
                : "opacity-0 scale-y-95 pointer-events-none"
            }`}
          >
            {NAV_SECTIONS.map((section) => {
              const sectionCount = section.items.reduce(
                (sum, item) => sum + getItemBadge(item.href, activeBadges),
                0
              );
              const selected = section.key === activeSection.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => handleSectionSelect(section.key)}
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                    selected ? "bg-white/10 admin-text" : "admin-text-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${section.dotClass}`}></span>
                  <i className={`fas ${section.icon} w-5 text-center ${section.accentClass}`}></i>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{section.label}</span>
                    <span className="block truncate text-[10px] opacity-70">{section.summary}</span>
                  </span>
                  <StatusBadge count={sectionCount} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-6 mt-4 border-t admin-border pt-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${activeSection.accentClass}`}>
            {activeSection.label}
          </span>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {activeSection.items.map((item) => {
            const active = isItemActive(pathname, item);
            const count = getItemBadge(item.href, activeBadges);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[var(--color-red)] text-white shadow-lg"
                    : "admin-text-muted admin-hover"
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <StatusBadge count={count} />
              </Link>
            );
          })}
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
