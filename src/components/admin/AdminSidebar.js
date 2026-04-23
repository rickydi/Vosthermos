"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const DEFAULT_NAV_ITEMS = [
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
  { href: "/admin/services", label: "Services", icon: "fa-tools" },
  { href: "/admin/techniciens", label: "Techniciens", icon: "fa-hard-hat" },
  { href: "/admin/clients", label: "Clients", icon: "fa-address-book" },
  { section: "B2B · PORTAIL" },
  { href: "/admin/gestionnaires", label: "Gestionnaires", icon: "fa-user-tie" },
  { section: "SYSTEME" },
  { href: "/admin/parametres", label: "Parametres", icon: "fa-cog" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "fa-users" },
];

const LS_ORDER_KEY = "vosthermos-admin-sidebar-order";
const itemKey = (it) => it.section ? `section:${it.section}` : `link:${it.href}`;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingRdv, setPendingRdv] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Reorderable menu
  const [items, setItems] = useState(DEFAULT_NAV_ITEMS);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(LS_ORDER_KEY);
        if (!saved) return;
        const order = JSON.parse(saved);
        if (!Array.isArray(order)) return;
        const byKey = new Map(DEFAULT_NAV_ITEMS.map((it) => [itemKey(it), it]));
        const ordered = [];
        for (const k of order) {
          if (byKey.has(k)) {
            ordered.push(byKey.get(k));
            byKey.delete(k);
          }
        }
        for (const it of byKey.values()) ordered.push(it);
        if (ordered.length === DEFAULT_NAV_ITEMS.length) setItems(ordered);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const [chatRes, rdvRes, reqRes] = await Promise.all([
          fetch("/api/admin/chat"),
          fetch("/api/admin/appointments?status=pending"),
          fetch("/api/admin/work-orders/pending-count"),
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
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, []);

  function saveOrder(next) {
    try {
      localStorage.setItem(LS_ORDER_KEY, JSON.stringify(next.map(itemKey)));
    } catch {}
  }

  function resetOrder() {
    if (!confirm("Restaurer l'ordre par defaut du menu?")) return;
    setItems(DEFAULT_NAV_ITEMS);
    try { localStorage.removeItem(LS_ORDER_KEY); } catch {}
  }

  function handleDragStart(e, idx) {
    if (!reorderMode) return;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(idx)); } catch {}
  }

  function handleDragOver(e, idx) {
    if (!reorderMode || draggedIdx === null || draggedIdx === idx) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }

  function handleDrop(e, idx) {
    if (!reorderMode) return;
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(draggedIdx, 1);
    const target = idx > draggedIdx ? idx - 1 : idx;
    next.splice(target, 0, moved);
    setItems(next);
    saveOrder(next);
    setDraggedIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDraggedIdx(null);
    setDragOverIdx(null);
  }

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
          {items.map((item, idx) => {
            const isDragged = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx && !isDragged;
            const dragProps = reorderMode ? {
              draggable: true,
              onDragStart: (e) => handleDragStart(e, idx),
              onDragOver: (e) => handleDragOver(e, idx),
              onDrop: (e) => handleDrop(e, idx),
              onDragEnd: handleDragEnd,
            } : {};
            const baseClass = `transition-all ${isDragged ? "opacity-30" : ""} ${isDragOver ? "border-t-2 border-t-[var(--color-red)]" : ""} ${reorderMode ? "cursor-grab active:cursor-grabbing" : ""}`;

            if (item.section) {
              return (
                <p
                  key={itemKey(item)}
                  {...dragProps}
                  className={`admin-text-muted text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-1 ${baseClass}`}
                >
                  {reorderMode && <i className="fas fa-grip-vertical mr-2 opacity-50"></i>}
                  {item.section}
                </p>
              );
            }

            const LinkOrDiv = reorderMode ? "div" : Link;
            const linkProps = reorderMode
              ? {}
              : { href: item.href, onClick: () => setOpen(false) };

            return (
              <LinkOrDiv
                key={itemKey(item)}
                {...linkProps}
                {...dragProps}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  !reorderMode && isActive(item)
                    ? "bg-[var(--color-red)] text-white shadow-lg"
                    : "admin-text-muted admin-hover"
                } ${baseClass}`}
              >
                {reorderMode && <i className="fas fa-grip-vertical opacity-50"></i>}
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {item.label}
                {!reorderMode && item.href === "/admin/chat" && (
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
                {!reorderMode && item.href === "/admin/bons" && (
                  pendingRequests > 0 ? (
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-red-400">{pendingRequests}</span>
                    </span>
                  ) : (
                    <span className="ml-auto relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  )
                )}
                {!reorderMode && item.href === "/admin/rendez-vous" && (
                  pendingRdv > 0 ? (
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs font-bold">{pendingRdv}</span>
                    </span>
                  ) : (
                    <span className="ml-auto relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  )
                )}
              </LinkOrDiv>
            );
          })}
        </nav>

        <div className="p-4 admin-border border-t space-y-2">
          {reorderMode ? (
            <div className="space-y-2">
              <p className="text-[10px] admin-text-muted px-2">
                <i className="fas fa-info-circle mr-1"></i>Glisse les items pour reorganiser
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setReorderMode(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-[var(--color-red)] text-white"
                >
                  <i className="fas fa-check mr-1"></i>Termine
                </button>
                <button
                  onClick={resetOrder}
                  className="px-3 py-2 rounded-xl text-sm admin-text-muted admin-hover border admin-border"
                  title="Restaurer l'ordre par defaut"
                >
                  <i className="fas fa-undo"></i>
                </button>
              </div>
            </div>
          ) : (
            <>
              <ThemeToggle />
              <button
                onClick={() => setReorderMode(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm admin-text-muted admin-hover transition-all w-full"
              >
                <i className="fas fa-bars w-5 text-center"></i>
                Organiser le menu
              </button>
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
            </>
          )}
        </div>
      </aside>
    </>
  );
}
