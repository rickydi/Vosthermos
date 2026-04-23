"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function initials(first, last) {
  return `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase();
}

function clientInitials(name) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || name.slice(0, 2).toUpperCase();
}

function fmtMoney(n) { return Number(n || 0).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"; }
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" }).toUpperCase();
}

const OPENING_TYPES = [
  { value: "fenetre", label: "Fenêtre" },
  { value: "porte", label: "Porte" },
  { value: "porte-patio", label: "Porte-patio" },
  { value: "porte-francaise", label: "Porte française" },
];

function hasPerm(activeClient, perm) {
  return activeClient?.permissions?.includes(perm) || false;
}

export default function GestionnaireDashboard({ manager, clients, isGlobal, activeClient, buildings, orphanUnits, stats, notifs, interventions, invoices, invoicesTotals }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [activeTab, setActiveTab] = useState(sp.get("tab") || "dashboard");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [openingEditor, setOpeningEditor] = useState(null);
  const [buildingEditor, setBuildingEditor] = useState(null);
  const [unitEditor, setUnitEditor] = useState(null);
  const [newCopro, setNewCopro] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bonsActifsOpen, setBonsActifsOpen] = useState(false);
  const [requestModal, setRequestModal] = useState(null); // null | { unitCode? }
  const [viewRequestId, setViewRequestId] = useState(null);
  const canManageOpenings = !isGlobal && hasPerm(activeClient, "manage_openings");
  const canManageUnits = !isGlobal && hasPerm(activeClient, "manage_units");
  const canRequest = !isGlobal && hasPerm(activeClient, "request_intervention");

  useEffect(() => {
    const onClickOutside = () => setOpenMenu(null);
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedUnit(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);


  function switchClient(clientId) {
    setSidebarOpen(false);
    router.push(`/gestionnaire?c=${clientId}`);
  }

  async function logout() {
    await fetch("/api/manager/auth/logout", { method: "POST" });
    router.push("/gestionnaire/login");
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setSidebarOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }

  const crumbs = {
    dashboard: "Tableau de bord",
    interventions: "Interventions",
    plan: "Plan pluriannuel",
    factures: "Factures",
    documents: "Documents",
    parametres: "Paramètres",
  };

  const totalActiveWOs = clients.reduce((sum) => sum, stats.activeWOsCount);

  return (
    <div className="gm-root">
      <div className="gm-app">
        {/* Overlay mobile */}
        <div
          className={"gm-sidebar-overlay" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={"gm-sidebar" + (sidebarOpen ? " open" : "")}>
          <div className="gm-brand">
            <div className="gm-logo">VOS<span>THERMOS</span></div>
          </div>
          <div>
            <div className="gm-tag"><i className="fas fa-building" style={{ fontSize: "10px", marginRight: 4 }}></i> Portail Gestionnaire</div>
          </div>

          <div>
            <div className="sb-sec-title" style={{ marginBottom: 10 }}>Menu</div>
            <div className="nav">
              {[
                { id: "dashboard", icon: "fa-th-large", label: "Tableau de bord" },
                { id: "interventions", icon: "far fa-calendar", label: "Interventions", badge: stats.activeWOsCount },
                { id: "plan", icon: "far fa-chart-bar", label: "Plan pluriannuel" },
                { id: "factures", icon: "far fa-file", label: "Factures", badge: stats.invoicedCount },
                { id: "documents", icon: "far fa-folder", label: "Documents" },
                { id: "parametres", icon: "fas fa-cog", label: "Paramètres" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={"nav-item" + (activeTab === item.id ? " active" : "")}
                  onClick={() => changeTab(item.id)}
                >
                  <i className={item.icon.startsWith("fa") ? item.icon : "fas " + item.icon}></i>
                  <span>{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="sb-sec-title" style={{ marginBottom: 10 }}>Vos copropriétés · {clients.length}</div>
            <div className="synd-picker">
              {clients.length > 1 && (
                <button
                  className={"synd-btn all" + (isGlobal ? " active" : "")}
                  onClick={() => router.push("/gestionnaire?c=global")}
                >
                  <i className="fas fa-th-large"></i>
                  <span>Vue globale · {clients.length} copros</span>
                </button>
              )}
              {clients.map((c) => (
                <button
                  key={c.clientId}
                  className={"synd-btn" + (!isGlobal && activeClient && c.clientId === activeClient.id ? " active" : "")}
                  onClick={() => switchClient(c.clientId)}
                >
                  <div className="sb-emblem">{clientInitials(c.clientName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="synd-name">{c.clientName}</div>
                    <div className="synd-sub">{c.city || "—"}</div>
                  </div>
                </button>
              ))}
              <button
                className="synd-btn"
                onClick={() => setNewCopro(true)}
                style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", marginTop: 4, paddingTop: 12 }}
              >
                <div className="sb-emblem" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <i className="fas fa-plus" style={{ fontSize: 10 }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="synd-name" style={{ fontSize: 12 }}>Ajouter copropriété</div>
                </div>
              </button>
            </div>
          </div>

          <div className="user-card">
            <div className="avatar">{initials(manager.firstName, manager.lastName)}</div>
            <div className="user-info">
              <div className="user-name">{manager.firstName} {manager.lastName}</div>
              <div className="user-email">{manager.email}</div>
            </div>
            <button className="user-logout" onClick={logout} title="Se déconnecter">
              <i className="fas fa-sign-out-alt" style={{ fontSize: 12 }}></i>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="gm-main">
          <div className="gm-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="gm-menu-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <i className="fas fa-bars"></i>
              </button>
              <h2 className="gm-topbar-title">{crumbs[activeTab]}</h2>
            </div>
            <div className="gm-top-right">
              <button className="bell">
                <i className="far fa-bell" style={{ fontSize: 14 }}></i>
                {notifs.filter((n) => n.kind === "urgent").length > 0 && <span className="bell-dot"></span>}
              </button>
            </div>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="gm-content">
              <div className="gm-page-head gm-page-head-compact">
                <div className="gm-page-sub">
                  {isGlobal ? `${clients.length} copropriétés · ${stats.totalUnits} unités` : activeClient.name}
                  {stats.activeWOsCount > 0 && <> · <strong>{stats.activeWOsCount} bon{stats.activeWOsCount > 1 ? "s" : ""} actif{stats.activeWOsCount > 1 ? "s" : ""}</strong></>}
                  {stats.invoicedCount > 0 && <> · {stats.invoicedCount} facture{stats.invoicedCount > 1 ? "s" : ""} due{stats.invoicedCount > 1 ? "s" : ""}</>}
                </div>
                <div className="gm-page-actions">
                  {canRequest && (
                    <button className="gm-btn gm-btn-primary" onClick={() => setRequestModal({})}>
                      <i className="fas fa-plus"></i>Demander intervention
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications */}
              {notifs.length > 0 && (
                <>
                  <div className="gm-section-head">
                    <div className="gm-section-title">Notifications · {notifs.length}</div>
                  </div>
                  <div className="gm-card" style={{ padding: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                      {notifs.map((n, i) => (
                        <div key={i} className={"inb" + (n.kind === "urgent" ? " urgent" : n.kind === "ok" ? " ok" : "")}>
                          <div className="inb-icon"><i className={"fas " + n.icon}></i></div>
                          <div className="inb-body">
                            <div className="inb-top">
                              <div className="inb-name">{n.name}</div>
                              <div className="inb-time">{n.time}</div>
                            </div>
                            <div className="inb-text">{n.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Bons actifs · accordéon */}
              {interventions?.active?.length > 0 && (
                <div className={"gm-accordion" + (bonsActifsOpen ? " open" : "")} style={{ marginBottom: 12 }}>
                  <button
                    type="button"
                    className="gm-accordion-head"
                    onClick={() => setBonsActifsOpen((v) => !v)}
                    aria-expanded={bonsActifsOpen}
                  >
                    <i className={"fas fa-chevron-right gm-accordion-caret"}></i>
                    <span className="gm-accordion-title">
                      Bons actifs
                      <span className="gm-accordion-count">{interventions.active.length}</span>
                    </span>
                    <span
                      className="gm-btn gm-btn-sm"
                      style={{ marginLeft: "auto" }}
                      onClick={(e) => { e.stopPropagation(); setActiveTab("interventions"); }}
                    >
                      Voir tout<i className="fas fa-arrow-right" style={{ marginLeft: 4 }}></i>
                    </span>
                  </button>
                  <div className="gm-accordion-panel">
                    <div className="gm-accordion-inner">
                      <div className="gm-card" style={{ padding: 0, overflow: "hidden", marginTop: 8 }}>
                        {interventions.active.map((wo) => {
                          const statusConfig = {
                            draft: { label: "En attente Vosthermos", tag: "amber" },
                            scheduled: { label: "Planifié", tag: "red" },
                            in_progress: { label: "En cours", tag: "green" },
                          }[wo.statut] || { label: wo.statut, tag: "" };
                          return (
                            <div
                              key={wo.id}
                              className="li"
                              style={{ cursor: "pointer", borderBottom: "1px solid var(--border)" }}
                              onClick={() => setViewRequestId(wo.id)}
                            >
                              <div className={"li-when " + (wo.statut === "in_progress" ? "now" : wo.statut === "draft" ? "" : "soon")}>
                                {fmtDateShort(wo.date)}<br />{wo.statut === "in_progress" ? "EN COURS" : wo.statut === "scheduled" ? "PLANIFIÉ" : "EN ATTENTE"}
                              </div>
                              <div className="li-body">
                                <div className="li-title">
                                  {wo.number}
                                  {isGlobal && wo.clientName && <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: 12 }}> · {wo.clientName}</span>}
                                </div>
                                <div className="li-text">
                                  {wo.description ? wo.description.slice(0, 100) : "Intervention planifiée"}
                                  {wo.sections.length > 0 ? ` · Unités: ${wo.sections.join(", ")}` : " · Intervention générale"}
                                </div>
                                {wo.technicianName && (
                                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                      <i className="fas fa-user-hard-hat"></i>
                                      <span style={{ color: "var(--text-muted)" }}>Technicien attitré :</span>
                                      <strong>{wo.technicianName}</strong>
                                    </span>
                                    {wo.technicianPhone && (
                                      <a
                                        href={`tel:${wo.technicianPhone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ color: "var(--red)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                                      >
                                        <i className="fas fa-phone"></i> {wo.technicianPhone}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <span className={"gm-tag " + statusConfig.tag}>{statusConfig.label}</span>
                                <i className="fas fa-chevron-right" style={{ color: "var(--text-muted)", fontSize: 11 }}></i>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bâtiments & Unités */}
              <div className="gm-section-head">
                <div className="gm-section-title">Parc de fenêtres · {buildings.length} bâtiment{buildings.length > 1 ? "s" : ""} · {stats.totalUnits} unité{stats.totalUnits > 1 ? "s" : ""}</div>
                <div className="legend">
                  <span><span className="dot ok"></span>Terminé</span>
                  <span><span className="dot active"></span>Actif</span>
                  <span><span className="dot none"></span>Aucun</span>
                </div>
              </div>

              <div className="gm-card" style={{ padding: 24 }}>
                {buildings.length === 0 && orphanUnits.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    Aucun bâtiment enregistré. Contactez Vosthermos pour configurer votre parc.
                  </div>
                )}
                {buildings.map((b) => (
                  <div key={b.id} className="bldg">
                    <div className="bldg-head">
                      <div className="bldg-tag">{b.code}</div>
                      <div>
                        <div className="bldg-name">{b.name}</div>
                        {isGlobal && b.clientName && <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>{b.clientName}</div>}
                      </div>
                      <div className="bldg-meta">{b.metaLine}</div>
                      {canManageUnits && (
                        <div style={{ display: "flex", gap: 6, marginLeft: 8, flexWrap: "wrap" }}>
                          <button
                            className="gm-btn gm-btn-sm"
                            onClick={() => setBuildingEditor({ id: b.id, code: b.code, name: b.name, address: b.address || "" })}
                          >
                            <i className="fas fa-edit"></i>Modifier bâtiment
                          </button>
                          <button
                            className="gm-btn gm-btn-sm"
                            onClick={() => setUnitEditor({ buildingId: b.id, buildingName: b.name, code: "", description: "" })}
                          >
                            <i className="fas fa-plus"></i>Ajouter unité
                          </button>
                        </div>
                      )}
                    </div>
                    {b.units.length === 0 ? (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>Aucune unité enregistrée</p>
                    ) : (
                      <div className="unit-grid">
                        {b.units.map((u) => (
                          <div
                            key={u.id}
                            className={"unit" + (u.status === "active" ? " active" : u.status === "done" ? " done" : "")}
                            onClick={() => setSelectedUnit({ ...u, buildingName: b.name, clientName: b.clientName })}
                          >
                            {u.status !== "none" && <span className="unit-dot"></span>}
                            <div className="unit-num">{u.code}</div>
                            <div className="unit-sub">{u.statusLabel}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {orphanUnits.length > 0 && (
                  <div className="bldg">
                    <div className="bldg-head">
                      <div className="bldg-tag" style={{ background: "var(--text-muted)" }}>?</div>
                      <div className="bldg-name">Unités sans bâtiment</div>
                      <div className="bldg-meta">{orphanUnits.length} unité{orphanUnits.length > 1 ? "s" : ""}</div>
                    </div>
                    <div className="unit-grid">
                      {orphanUnits.map((u) => (
                        <div
                          key={u.id}
                          className={"unit" + (u.status === "active" ? " active" : u.status === "done" ? " done" : "")}
                          onClick={() => setSelectedUnit({ ...u, buildingName: "—" })}
                        >
                          {u.status !== "none" && <span className="unit-dot"></span>}
                          <div className="unit-num">{u.code}</div>
                          <div className="unit-sub">{u.statusLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {canManageUnits && (
                  <button
                    type="button"
                    className="gm-add-bldg"
                    onClick={() => setBuildingEditor({ code: "", name: "", address: "" })}
                  >
                    <i className="fas fa-plus-circle"></i>
                    <span>Ajouter un bâtiment</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* INTERVENTIONS TAB */}
          {activeTab === "interventions" && (
            <div className="gm-content">
              <div className="gm-page-head gm-page-head-compact">
                <div className="gm-page-sub">
                  {interventions?.active?.length > 0 ? <><strong>{interventions.active.length} active{interventions.active.length > 1 ? "s" : ""}</strong></> : "Aucune intervention active"}
                  {interventions?.recent?.length > 0 && ` · ${interventions.recent.length} récente${interventions.recent.length > 1 ? "s" : ""}`}
                </div>
                <div className="gm-page-actions">
                  <button className="gm-btn gm-btn-primary">
                    <i className="fas fa-plus"></i>Demander intervention
                  </button>
                </div>
              </div>

              <div className="gm-section-head">
                <div className="gm-section-title">À venir / en cours</div>
              </div>
              {!interventions?.active?.length ? (
                <div className="gm-card" style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                  Aucune intervention planifiée
                </div>
              ) : (
                interventions.active.map((wo) => (
                  <div
                    key={wo.id}
                    className="li"
                    style={{ cursor: "pointer" }}
                    onClick={() => setViewRequestId(wo.id)}
                  >
                    <div className={"li-when " + (wo.statut === "in_progress" ? "now" : wo.statut === "draft" ? "" : "soon")}>
                      {fmtDateShort(wo.date)}<br />{wo.statut === "in_progress" ? "EN COURS" : wo.statut === "scheduled" ? "PLANIFIÉ" : "EN ATTENTE"}
                    </div>
                    <div className="li-body">
                      <div className="li-title">
                        {wo.number}
                        {isGlobal && wo.clientName && <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: 12 }}> · {wo.clientName}</span>}
                        {wo.isManagerRequest && wo.statut === "draft" && <span className="gm-tag amber" style={{ marginLeft: 8 }}>Demande envoyée</span>}
                      </div>
                      <div className="li-text">
                        {wo.description ? wo.description.slice(0, 120) : "Intervention planifiée"}
                        {wo.sections.length > 0 && ` · Unités: ${wo.sections.join(", ")}`}
                      </div>
                      {wo.technicianName && (
                        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <i className="fas fa-user-hard-hat"></i>
                            <span style={{ color: "var(--text-muted)" }}>Technicien attitré :</span>
                            <strong>{wo.technicianName}</strong>
                          </span>
                          {wo.technicianPhone && (
                            <a
                              href={`tel:${wo.technicianPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: "var(--red)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <i className="fas fa-phone"></i> {wo.technicianPhone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                      <span className={"gm-tag " + (wo.statut === "in_progress" ? "green" : wo.statut === "draft" ? "amber" : "red")}>
                        {wo.statut === "in_progress" ? "En cours" : wo.statut === "draft" ? "En attente Vosthermos" : "Confirmé"}
                      </span>
                      <i className="fas fa-chevron-right" style={{ color: "var(--text-muted)", fontSize: 11 }}></i>
                    </div>
                  </div>
                ))
              )}

              {interventions?.recent?.length > 0 && (
                <>
                  <div className="gm-section-head" style={{ marginTop: 24 }}>
                    <div className="gm-section-title">Historique récent</div>
                  </div>
                  {interventions.recent.map((wo) => (
                    <div key={wo.id} className="li">
                      <div className="li-when">{fmtDateShort(wo.date)}<br />Terminée</div>
                      <div className="li-body">
                        <div className="li-title">{wo.number}</div>
                        <div className="li-text">{wo.description?.slice(0, 100) || "—"} · {fmtMoney(wo.total)}</div>
                      </div>
                      <span className="gm-tag green">Terminé</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* FACTURES TAB */}
          {activeTab === "factures" && (
            <div className="gm-content">
              <div className="gm-page-head gm-page-head-compact">
                <div className="gm-page-sub">
                  {stats.invoicedCount > 0 ? <><strong>{stats.invoicedCount} à régler</strong> · {fmtMoney(invoicesTotals.toPay)}</> : "Aucune facture en attente"}
                </div>
              </div>

              <div className="gm-grid" style={{ marginBottom: 16 }}>
                <div className="gm-card" style={{ gridColumn: "span 4" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--red)" }}>{fmtMoney(invoicesTotals.toPay)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>Total à payer</div>
                </div>
                <div className="gm-card" style={{ gridColumn: "span 4" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--green)" }}>{fmtMoney(invoicesTotals.paid)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>Payé</div>
                </div>
                <div className="gm-card" style={{ gridColumn: "span 4" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--teal-dark)" }}>{invoices.length}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>Factures · 12 mois</div>
                </div>
              </div>

              <div className="gm-card" style={{ padding: 0, overflow: "hidden" }}>
                {invoices.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Aucune facture</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Facture</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Date</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Description</th>
                        <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Total</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{inv.number}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>{fmtDate(inv.date)}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13 }}>
                            {inv.description?.slice(0, 80) || "—"}
                            {isGlobal && inv.clientName && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{inv.clientName}</div>}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700, fontSize: 14 }}>{fmtMoney(inv.total)}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span className={"gm-tag " + (inv.statut === "paid" ? "green" : "amber")}>
                              {inv.statut === "paid" ? "Payé" : "À payer"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* PLAN / DOCUMENTS / PARAMÈTRES — placeholders */}
          {(activeTab === "plan" || activeTab === "documents" || activeTab === "parametres") && (
            <div className="gm-content">
              <div className="gm-page-head gm-page-head-compact">
                <div className="gm-page-sub">Section en cours de développement</div>
              </div>
              <div className="gm-card" style={{ textAlign: "center", padding: 60 }}>
                <i className="fas fa-tools" style={{ fontSize: 36, color: "var(--border-strong)", marginBottom: 12 }}></i>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Section bientôt disponible</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {activeTab === "plan" && "Plan pluriannuel et budget prévisionnel 5 ans."}
                  {activeTab === "documents" && "Rapports, plans et attestations Loi 25."}
                  {activeTab === "parametres" && "Profil et préférences de notifications."}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal nouvelle copropriété */}
      {newCopro && (
        <CoproEditor
          onClose={() => setNewCopro(false)}
          onSaved={(clientId) => { setNewCopro(false); router.push(`/gestionnaire?c=${clientId}`); }}
        />
      )}

      {/* Modal éditeur de bâtiment */}
      {buildingEditor && activeClient && (
        <BuildingEditor
          clientId={activeClient.id}
          initial={buildingEditor}
          onClose={() => setBuildingEditor(null)}
          onSaved={() => { setBuildingEditor(null); router.refresh(); }}
        />
      )}

      {/* Modal éditeur d'unité */}
      {unitEditor && activeClient && (
        <UnitEditor
          clientId={activeClient.id}
          buildings={buildings.map((b) => ({ id: b.id, name: b.name, code: b.code }))}
          initial={unitEditor}
          onClose={() => setUnitEditor(null)}
          onSaved={() => { setUnitEditor(null); router.refresh(); }}
        />
      )}

      {/* Modal éditeur d'ouverture */}
      {openingEditor && (
        <OpeningEditor
          initial={openingEditor}
          onClose={() => setOpeningEditor(null)}
          onSaved={(saved, isNew) => {
            setSelectedUnit((prev) => {
              if (!prev) return prev;
              const opns = prev.openings || [];
              return {
                ...prev,
                openings: isNew
                  ? [...opns, saved]
                  : opns.map((o) => (o.id === saved.id ? { ...o, ...saved } : o)),
              };
            });
            setOpeningEditor(null);
            router.refresh();
          }}
          onDeleted={(deletedId) => {
            setSelectedUnit((prev) => {
              if (!prev) return prev;
              return { ...prev, openings: (prev.openings || []).filter((o) => o.id !== deletedId) };
            });
            setOpeningEditor(null);
            router.refresh();
          }}
        />
      )}

      {/* Modal unité */}
      {selectedUnit && (
        <div className="gm-modal-backdrop open" onClick={(e) => { if (e.target.classList.contains("gm-modal-backdrop")) setSelectedUnit(null); }}>
          <div className="gm-modal">
            <div className="gm-modal-head">
              <div className={"modal-tag" + (selectedUnit.status === "active" ? " active" : selectedUnit.status === "done" ? " done" : "")}>
                {selectedUnit.code}
              </div>
              <div>
                <div className="gm-modal-title">Unité {selectedUnit.code}</div>
                <div className="gm-modal-sub">{selectedUnit.buildingName} · {isGlobal ? (selectedUnit.clientName || "—") : activeClient.name}</div>
              </div>
              <button className="gm-modal-close" onClick={() => setSelectedUnit(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="gm-modal-body">
              <div className="modal-kv"><span className="k">Statut</span><span className="v">
                {selectedUnit.status === "active" && <span className="gm-tag red">Bon actif · {selectedUnit.statusLabel}</span>}
                {selectedUnit.status === "done" && <span className="gm-tag green">Terminé</span>}
                {selectedUnit.status === "none" && <span className="gm-tag gray">Aucune intervention</span>}
              </span></div>
              <div className="modal-kv"><span className="k">Ouvertures</span><span className="v">{selectedUnit.openings.length || "Aucune renseignée"}</span></div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 10 }}>
                <div className="modal-section-title" style={{ margin: 0 }}>Détail des ouvertures</div>
                {canManageOpenings && (
                  <button
                    className="gm-btn gm-btn-sm gm-btn-primary"
                    onClick={() => setOpeningEditor({ isNew: true, unitId: selectedUnit.id, type: "fenetre", location: "", status: "ok" })}
                  >
                    <i className="fas fa-plus"></i>Ajouter
                  </button>
                )}
              </div>
              {selectedUnit.openings.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg)", borderRadius: 8 }}>
                  Aucune ouverture enregistrée
                  {canManageOpenings && ". Cliquez « Ajouter » pour commencer."}
                </div>
              ) : (
                <div className="openings">
                  {selectedUnit.openings.map((o) => (
                    <div key={o.id} className="opening" onClick={canManageOpenings ? () => setOpeningEditor(o) : undefined} style={canManageOpenings ? { cursor: "pointer" } : {}}>
                      <div className="opening-photo">
                        {o.photoUrl ? <img src={o.photoUrl} alt={o.location} /> : <i className="fas fa-camera"></i>}
                        {o.status === "active" && <span className="opening-badge active">Actif</span>}
                        {o.status === "done" && <span className="opening-badge done">Terminé</span>}
                      </div>
                      <div className="opening-body">
                        <div className="opening-type">{o.type.replace("-", " ")}</div>
                        <div className="opening-loc">{o.location}</div>
                        {o.description && <div className="opening-sub">{o.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="gm-modal-foot gm-form-actions-split">
              {canManageUnits ? (
                <button
                  className="gm-btn gm-btn-sm"
                  style={{ color: "var(--red)", borderColor: "rgba(227,7,24,0.3)" }}
                  onClick={async () => {
                    if (!confirm(`Supprimer l'unité ${selectedUnit.code}?\n\nNote: les bons de travail historiques restent intacts.`)) return;
                    const res = await fetch(`/api/manager/units/${selectedUnit.id}`, { method: "DELETE" });
                    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
                    const deletedId = selectedUnit.id;
                    setSelectedUnit(null);
                    router.refresh();
                    // Also remove locally — router.refresh will re-render with fresh data, but in case
                    // we need immediate visual feedback, we can leave it to the re-render from server.
                  }}
                >
                  <i className="fas fa-trash"></i>Supprimer l'unité
                </button>
              ) : <div />}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gm-btn gm-btn-sm">
                  <i className="fas fa-history"></i>Historique
                </button>
                {canRequest && (
                  <button
                    className="gm-btn gm-btn-sm gm-btn-primary"
                    onClick={() => setRequestModal({ unitId: selectedUnit.id })}
                  >
                    <i className="fas fa-plus"></i>Demander intervention
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail d'une demande */}
      {viewRequestId && (
        <RequestDetailModal
          requestId={viewRequestId}
          onClose={() => setViewRequestId(null)}
          onDeleted={() => { setViewRequestId(null); router.refresh(); }}
        />
      )}

      {/* Modal demande d'intervention */}
      {requestModal && (
        <InterventionRequestModal
          clientId={activeClient?.id || null}
          clientName={activeClient?.name}
          presetUnitId={requestModal.unitId}
          presetOpeningId={requestModal.openingId}
          onClose={() => setRequestModal(null)}
          onSaved={(number) => {
            setRequestModal(null);
            alert(`Demande envoyée · bon ${number}\n\nVosthermos a été notifié et traitera votre demande prochainement.`);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="gm-field">
      <label className="gm-field-label">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, required, type = "text" }) {
  return (
    <Field label={label}>
      <input className="gm-field-input" required={required} type={type} value={value || ""}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  );
}

function ModalShell({ icon, title, subtitle, onClose, level = 2, maxWidth = 560, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className={`gm-modal-backdrop open level-${level}`} onClick={(e) => { if (e.target.classList.contains("gm-modal-backdrop")) onClose(); }}>
      <div className="gm-modal" style={{ maxWidth }}>
        <div className="gm-modal-head">
          <div className="modal-tag">{icon}</div>
          <div style={{ minWidth: 0 }}>
            <div className="gm-modal-title">{title}</div>
            {subtitle && <div className="gm-modal-sub">{subtitle}</div>}
          </div>
          <button className="gm-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CoproEditor({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", company: "", address: "", city: "", province: "QC", postalCode: "",
    phone: "", email: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/manager/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur");
      onSaved(d.client.id);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  return (
    <ModalShell
      icon={<i className="fas fa-building"></i>}
      title="Nouvelle copropriété"
      subtitle="Vous en serez automatiquement gestionnaire"
      onClose={onClose}
      level={2}
      maxWidth={600}
    >
      <form onSubmit={save} className="gm-modal-body gm-form">
        {err && <div className="gm-form-err">{err}</div>}
        <TextInput label="Nom du syndicat *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Syndicat Le Marronnier" required />
        <div className="gm-field-row gm-field-row-2">
          <TextInput label="Contact dans la copropriété" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Jean Tremblay (président)" />
          <TextInput label="Courriel du contact" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="president@syndicat.ca" />
        </div>
        <TextInput label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="1500 Montée Monette" />
        <div className="gm-field-row gm-field-row-address">
          <TextInput label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Laval" />
          <TextInput label="Province" value={form.province} onChange={(v) => setForm({ ...form, province: v })} />
          <TextInput label="Code postal" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} placeholder="H7M 5C9" />
        </div>
        <TextInput label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="450-555-0100" />
        <div className="gm-form-actions">
          <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
          <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">
            {saving ? "Création..." : "Créer la copropriété"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function BuildingEditor({ clientId, initial, onClose, onSaved }) {
  const isEdit = !!initial.id;
  const [form, setForm] = useState({
    code: initial.code || "",
    name: initial.name || "",
    address: initial.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const url = isEdit ? `/api/manager/buildings/${initial.id}` : "/api/manager/buildings";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? form : { ...form, clientId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      onSaved();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function del() {
    if (!confirm(`Supprimer le bâtiment ${initial.name}?\n\nLes unités ne sont pas supprimées — elles perdent simplement leur bâtiment.`)) return;
    const res = await fetch(`/api/manager/buildings/${initial.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    onSaved();
  }

  return (
    <ModalShell
      icon={<i className="fas fa-building"></i>}
      title={isEdit ? "Modifier bâtiment" : "Nouveau bâtiment"}
      subtitle={isEdit ? initial.name : undefined}
      onClose={onClose}
      level={2}
      maxWidth={500}
    >
      <form onSubmit={save} className="gm-modal-body gm-form">
        {err && <div className="gm-form-err">{err}</div>}
        <div className="gm-field-row gm-field-row-name">
          <TextInput label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} placeholder="A" required />
          <TextInput label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Bâtiment A" required />
        </div>
        <TextInput label="Adresse (optionnel)" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="1500 Montée Monette" />
        <div className="gm-form-actions gm-form-actions-split">
          {isEdit ? (
            <button type="button" onClick={del} className="gm-btn gm-btn-sm" style={{ color: "var(--red)", borderColor: "rgba(227,7,24,0.3)" }}>
              <i className="fas fa-trash"></i>Supprimer
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
            <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">
              {saving ? "..." : isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function UnitEditor({ clientId, buildings, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    code: initial.code || "",
    buildingId: initial.buildingId || buildings[0]?.id || null,
    description: initial.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/manager/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      onSaved();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  return (
    <ModalShell
      icon={<i className="fas fa-door-open"></i>}
      title="Nouvelle unité"
      subtitle={initial.buildingName || undefined}
      onClose={onClose}
      level={2}
      maxWidth={500}
    >
      <form onSubmit={save} className="gm-modal-body gm-form">
        {err && <div className="gm-form-err">{err}</div>}
        <div className="gm-field-row gm-field-row-2">
          <TextInput label="Code unité" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="A-101" required />
          <Field label="Bâtiment">
            <select value={form.buildingId || ""} onChange={(e) => setForm({ ...form, buildingId: e.target.value || null })}>
              <option value="">Aucun</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </Field>
        </div>
        <TextInput label="Description (optionnel)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: 3 chambres" />
        <div className="gm-form-actions">
          <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
          <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">{saving ? "Création..." : "Créer"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function RequestDetailModal({ requestId, onClose, onDeleted }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/manager/intervention-requests/${requestId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setData(d);
      })
      .catch((e) => setErr(e.message));
  }, [requestId]);

  async function del() {
    if (!confirm(`Annuler la demande ${data?.number || ""}?\n\nCeci supprime définitivement la demande.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/manager/intervention-requests/${requestId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { alert(d.error || "Erreur"); setDeleting(false); return; }
    onDeleted();
  }

  const statutLabel = {
    draft: "En attente Vosthermos",
    scheduled: "Planifié",
    in_progress: "En cours",
    completed: "Terminé",
    invoiced: "Facturé",
    paid: "Payé",
  }[data?.statut] || data?.statut;

  const statutColor = data?.statut === "draft" ? "amber" : data?.statut === "in_progress" ? "green" : "red";

  return (
    <ModalShell
      icon={<i className="fas fa-wrench"></i>}
      title={data?.number || "Chargement..."}
      subtitle={data ? `Demande · ${new Date(data.createdAt).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}` : ""}
      onClose={onClose}
      level={3}
      maxWidth={640}
    >
      {err ? (
        <div className="gm-modal-body">
          <div className="gm-form-err">{err}</div>
        </div>
      ) : !data ? (
        <div className="gm-modal-body" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <i className="fas fa-spinner fa-spin"></i> Chargement...
        </div>
      ) : (
        <div className="gm-modal-body">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <span className={"gm-tag " + statutColor}>{statutLabel}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Date souhaitée : {data.date ? new Date(data.date).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </span>
          </div>

          <div className="modal-section-title" style={{ marginTop: 0 }}>Description du problème</div>
          <div style={{ padding: 12, background: "var(--bg)", borderRadius: 6, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {data.description || "—"}
          </div>

          {data.notes && (
            <>
              <div className="modal-section-title">Informations de la demande</div>
              <div style={{ padding: 12, background: "var(--bg)", borderRadius: 6, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text-dim)" }}>
                {data.notes}
              </div>
            </>
          )}

          {data.sections && data.sections.length > 0 && (
            <>
              <div className="modal-section-title">Unités concernées · {data.sections.length}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.sections.map((s) => (
                  <div key={s.id} style={{ padding: 10, background: "var(--bg)", borderRadius: 6, fontSize: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.unitCode}</div>
                    <div style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{s.notes || "—"}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {data.statut !== "draft" && data.technician && (
            <>
              <div className="modal-section-title">Technicien attitré</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg)", borderRadius: 6 }}>
                <i className="fas fa-user-hard-hat" style={{ fontSize: 28, color: "var(--text-dim)", flexShrink: 0 }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{data.technician.name}</div>
                  {data.technician.phone ? (
                    <a
                      href={`tel:${data.technician.phone}`}
                      style={{ fontSize: 13, color: "var(--red)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <i className="fas fa-phone"></i> {data.technician.phone}
                    </a>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Téléphone non disponible</div>
                  )}
                </div>
                {data.technician.phone && (
                  <a
                    href={`tel:${data.technician.phone}`}
                    className="gm-btn gm-btn-sm"
                    style={{ background: "var(--red)", color: "#fff", borderColor: "var(--red)", textDecoration: "none" }}
                  >
                    <i className="fas fa-phone"></i> Appeler
                  </a>
                )}
              </div>
            </>
          )}

          {data.statut !== "draft" && (
            <div style={{ marginTop: 16, padding: 12, background: "#ecfdf5", borderRadius: 6, fontSize: 12, color: "#047857" }}>
              <i className="fas fa-info-circle" style={{ marginRight: 6 }}></i>
              Vosthermos a pris en charge votre demande. Pour toute modification, contactez-nous directement.
            </div>
          )}
        </div>
      )}

      <div className="gm-modal-foot gm-form-actions-split">
        <div>
          {data?.statut === "draft" && (
            <button
              className="gm-btn gm-btn-sm"
              style={{ color: "var(--red)", borderColor: "rgba(227,7,24,0.3)" }}
              onClick={del}
              disabled={deleting}
            >
              <i className="fas fa-trash"></i>{deleting ? "Annulation..." : "Annuler cette demande"}
            </button>
          )}
        </div>
        <button className="gm-btn gm-btn-sm" onClick={onClose}>Fermer</button>
      </div>
    </ModalShell>
  );
}

function InterventionRequestModal({ clientId, clientName, presetUnitId, presetOpeningId, onClose, onSaved }) {
  const [tree, setTree] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  // selections = Map<unitId, Set<openingId>> — Set vide = unité entière sans opening précise
  const [selections, setSelections] = useState(new Map());
  const [expandedBuildings, setExpandedBuildings] = useState(new Set());
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [form, setForm] = useState({ description: "", urgency: "normale", preferredDate: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/manager/tree")
      .then((r) => r.json())
      .then((d) => {
        setTree(d.clients || []);
        if (presetUnitId && !selections.size) {
          const next = new Map();
          const opSet = new Set();
          if (presetOpeningId) opSet.add(Number(presetOpeningId));
          next.set(Number(presetUnitId), opSet);
          setSelections(next);
          // Auto-select client + auto-expand bâtiment/unité du preset
          for (const c of d.clients || []) {
            for (const b of c.buildings) {
              if (b.units.find((u) => u.id === Number(presetUnitId))) {
                setSelectedClientId(c.id);
                setExpandedBuildings(new Set([b.id]));
                setExpandedUnits(new Set([Number(presetUnitId)]));
                return;
              }
            }
            if ((c.orphanUnits || []).find((u) => u.id === Number(presetUnitId))) {
              setSelectedClientId(c.id);
              setExpandedUnits(new Set([Number(presetUnitId)]));
              return;
            }
          }
        }
      })
      .catch(() => setTree([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetUnitId, presetOpeningId]);

  function toggleBuilding(id) {
    setExpandedBuildings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleUnit(id) {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeC = tree?.find((c) => c.id === Number(selectedClientId));
  const buildings = activeC?.buildings || [];
  const orphans = activeC?.orphanUnits || [];

  function toggleOpening(unitId, openingId) {
    const next = new Map(selections);
    const set = new Set(next.get(unitId) || []);
    if (set.has(openingId)) set.delete(openingId);
    else set.add(openingId);
    if (set.size === 0 && !next.get(unitId)) next.delete(unitId);
    else next.set(unitId, set);
    setSelections(next);
  }

  function toggleUnitAll(unit) {
    const next = new Map(selections);
    const currentSet = next.get(unit.id);
    const allIds = unit.openings.map((o) => o.id);
    const allSelected = currentSet && allIds.every((id) => currentSet.has(id));
    if (allSelected) {
      next.delete(unit.id);
    } else {
      next.set(unit.id, new Set(allIds));
    }
    setSelections(next);
  }

  function toggleUnitGeneral(unitId) {
    const next = new Map(selections);
    if (next.has(unitId) && next.get(unitId).size === 0) {
      next.delete(unitId);
    } else {
      next.set(unitId, new Set());
    }
    setSelections(next);
  }

  const totalOpenings = [...selections.values()].reduce((s, set) => s + set.size, 0);
  const totalUnits = selections.size;

  async function save(e) {
    e.preventDefault();
    setErr("");

    // Validation cote client avec messages clairs
    if (!selectedClientId) {
      setErr("Sélectionnez une copropriété avant d'envoyer la demande.");
      return;
    }
    if (!form.description.trim()) {
      setErr("Décrivez brièvement le problème avant d'envoyer la demande.");
      return;
    }

    setSaving(true);
    try {
      const selectionsPayload = [...selections.entries()].map(([unitId, opSet]) => ({
        unitId,
        openingIds: [...opSet],
      }));
      const res = await fetch("/api/manager/intervention-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: Number(selectedClientId),
          selections: selectionsPayload,
          description: form.description,
          urgency: form.urgency,
          preferredDate: form.preferredDate || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur serveur");
      onSaved(d.number);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  if (!tree) {
    return (
      <ModalShell icon={<i className="fas fa-wrench"></i>} title="Demander une intervention" onClose={onClose} level={3} maxWidth={720}>
        <div className="gm-modal-body" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <i className="fas fa-spinner fa-spin"></i> Chargement...
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      icon={<i className="fas fa-wrench"></i>}
      title="Demander une intervention"
      subtitle={activeC?.name || clientName}
      onClose={onClose}
      level={3}
      maxWidth={720}
    >
      <form onSubmit={save} className="gm-modal-body gm-form">
        {err && <div className="gm-form-err">{err}</div>}

        <Field label="Copropriété *">
          <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelections(new Map()); }} required>
            <option value="">— Sélectionner —</option>
            {tree.map((c) => <option key={c.id} value={c.id}>{c.name}{c.city ? ` · ${c.city}` : ""}</option>)}
          </select>
        </Field>

        {selectedClientId && (
          <Field label="Unités et ouvertures à inclure (optionnel — cochez ce qui est concerné)">
            <div className="gm-picker">
              {buildings.length === 0 && orphans.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  Aucune unité enregistrée. La demande sera générale sur la copropriété.
                </div>
              )}
              {buildings.map((b) => {
                if (b.units.length === 0) return null;
                const isOpen = expandedBuildings.has(b.id);
                const unitsWithSelections = b.units.filter((u) => selections.has(u.id)).length;
                return (
                  <div key={b.id} className={"gm-picker-bldg" + (isOpen ? " open" : "")}>
                    <div className="gm-picker-bldg-head" onClick={() => toggleBuilding(b.id)}>
                      <i className={`fas fa-chevron-right gm-picker-caret`}></i>
                      <div style={{ width: 24, height: 24, borderRadius: 4, background: "var(--teal-dark)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{b.code}</div>
                      <div>{b.name}</div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>· {b.units.length} unité{b.units.length > 1 ? "s" : ""}</span>
                      {unitsWithSelections > 0 && <span className="gm-picker-selcount" style={{ marginLeft: "auto" }}>{unitsWithSelections}</span>}
                    </div>
                    {isOpen && b.units.map((u) => (
                      <UnitPickerRow
                        key={u.id}
                        unit={u}
                        selections={selections}
                        expanded={expandedUnits.has(u.id)}
                        onToggleExpand={() => toggleUnit(u.id)}
                        toggleOpening={toggleOpening}
                        toggleUnitAll={toggleUnitAll}
                        toggleUnitGeneral={toggleUnitGeneral}
                      />
                    ))}
                  </div>
                );
              })}
              {orphans.length > 0 && (() => {
                const orphansKey = "orphans";
                const isOpen = expandedBuildings.has(orphansKey);
                return (
                  <div className={"gm-picker-bldg" + (isOpen ? " open" : "")}>
                    <div className="gm-picker-bldg-head" onClick={() => toggleBuilding(orphansKey)}>
                      <i className={`fas fa-chevron-right gm-picker-caret`}></i>
                      <i className="fas fa-question" style={{ color: "var(--text-muted)", fontSize: 10, width: 24, textAlign: "center" }}></i>
                      <div>Unités sans bâtiment</div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>· {orphans.length}</span>
                    </div>
                    {isOpen && orphans.map((u) => (
                      <UnitPickerRow
                        key={u.id}
                        unit={u}
                        selections={selections}
                        expanded={expandedUnits.has(u.id)}
                        onToggleExpand={() => toggleUnit(u.id)}
                        toggleOpening={toggleOpening}
                        toggleUnitAll={toggleUnitAll}
                        toggleUnitGeneral={toggleUnitGeneral}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="gm-picker-summary">
              {totalUnits === 0 ? (
                <span>Aucune unité sélectionnée — la demande sera générale</span>
              ) : (
                <span><strong>{totalUnits}</strong> unité{totalUnits > 1 ? "s" : ""} · <strong>{totalOpenings}</strong> ouverture{totalOpenings !== 1 ? "s" : ""} ciblée{totalOpenings !== 1 ? "s" : ""}</span>
              )}
            </div>
          </Field>
        )}

        <div className="gm-field-row gm-field-row-2">
          <Field label="Priorité">
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              <option value="normale">Normale</option>
              <option value="haute">Priorité haute</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Date souhaitée (optionnel)">
            <input className="gm-field-input" type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          </Field>
        </div>

        <Field label="Description du problème *">
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez ce qui nécessite une intervention&#10;(ex: vitre embuée, porte qui bloque, infiltration d'eau...)"
            required />
        </Field>

        <div style={{ padding: 12, background: "var(--bg)", borderRadius: 6, fontSize: 12, color: "var(--text-muted)" }}>
          <i className="fas fa-info-circle" style={{ marginRight: 6, color: "var(--red)" }}></i>
          Vosthermos recevra votre demande par courriel. Un bon de travail regroupant toutes les unités ciblées sera créé en brouillon.
        </div>

        <div className="gm-form-actions">
          <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
          <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">
            {saving ? "Envoi..." : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function UnitPickerRow({ unit, selections, expanded, onToggleExpand, toggleOpening, toggleUnitAll, toggleUnitGeneral }) {
  const currentSet = selections.get(unit.id);
  const hasOpenings = unit.openings.length > 0;
  const selectedCount = currentSet?.size || 0;
  const allSelected = hasOpenings && currentSet && unit.openings.every((o) => currentSet.has(o.id));
  const generalSelected = currentSet && currentSet.size === 0;

  return (
    <div className={"gm-picker-unit" + (expanded ? " open" : "")}>
      <div className="gm-picker-unit-head" onClick={onToggleExpand}>
        <i className={`fas fa-chevron-right gm-picker-caret`} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}></i>
        <span className="gm-picker-unit-code">{unit.code}</span>
        {unit.description && <span className="gm-picker-unit-desc">· {unit.description}</span>}
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>· {unit.openings.length} ouverture{unit.openings.length !== 1 ? "s" : ""}</span>
        {selectedCount > 0 && <span className="gm-picker-selcount" style={{ marginLeft: "auto" }}>{selectedCount}</span>}
        {generalSelected && selectedCount === 0 && <span className="gm-picker-selcount" style={{ marginLeft: "auto" }}>✓</span>}
      </div>
      {expanded && (
        <div className="gm-picker-unit-body">
          {hasOpenings && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button type="button" className="gm-picker-unit-all" onClick={(e) => { e.stopPropagation(); toggleUnitAll(unit); }}>
                {allSelected ? "Tout décocher" : "Tout cocher"}
              </button>
            </div>
          )}
          {!hasOpenings ? (
            <div className="gm-picker-no-openings">
              <label onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={!!generalSelected} onChange={() => toggleUnitGeneral(unit.id)} />
                Inclure cette unité (aucune ouverture enregistrée)
              </label>
            </div>
          ) : (
            <div className="gm-picker-openings">
              {unit.openings.map((o) => {
                const isSelected = currentSet?.has(o.id);
                return (
                  <div
                    key={o.id}
                    className={"gm-picker-opening" + (isSelected ? " selected" : "")}
                    onClick={(e) => { e.stopPropagation(); toggleOpening(unit.id, o.id); }}
                  >
                    <div className="gm-picker-opening-photo">
                      {o.photoUrl ? <img src={o.photoUrl} alt={o.location} /> : <i className="fas fa-camera"></i>}
                    </div>
                    <div className="gm-picker-opening-check">
                      {isSelected ? <i className="fas fa-check" style={{ fontSize: 11 }}></i> : null}
                    </div>
                    <div className="gm-picker-opening-body">
                      <div className="gm-picker-opening-type">{o.type.replace("-", " ")}</div>
                      <div className="gm-picker-opening-loc">{o.location}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoDropzone({ onFile }) {
  const [drag, setDrag] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }

  return (
    <div
      className={"gm-dropzone" + (drag ? " drag" : "")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <div className="gm-dropzone-icon">
        <i className="fas fa-camera"></i>
      </div>
      <div>
        <div className="gm-dropzone-title">Déposez une photo ici</div>
        <div className="gm-dropzone-sub">ou <strong>cliquez pour parcourir</strong></div>
        <div className="gm-dropzone-sub" style={{ marginTop: 4 }}>JPEG · PNG · WebP · GIF — max 8 MB</div>
      </div>
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

function OpeningEditor({ initial, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    id: initial.id,
    type: initial.type || "fenetre",
    location: initial.location || "",
    description: initial.description || "",
    year: initial.year || "",
    brand: initial.brand || "",
    status: initial.status || "ok",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.photoUrl || null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function handleFile(f) {
    setFile(f);
    setRemovePhoto(false);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      if (initial.isNew) fd.set("unitId", initial.unitId);
      for (const k of ["type", "location", "description", "year", "brand", "status"]) {
        if (form[k] !== undefined && form[k] !== null && form[k] !== "") fd.set(k, form[k]);
      }
      if (file) fd.set("photo", file);
      if (removePhoto) fd.set("removePhoto", "true");

      const url = initial.isNew ? "/api/manager/openings" : `/api/manager/openings/${initial.id}`;
      const method = initial.isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onSaved(data.opening, !!initial.isNew);
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  }

  async function del() {
    if (!confirm("Supprimer cette ouverture?")) return;
    const res = await fetch(`/api/manager/openings/${initial.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    onDeleted(initial.id);
  }

  const icon = form.type === "fenetre"
    ? <i className="far fa-window-maximize"></i>
    : form.type === "porte-patio"
      ? <i className="fas fa-bars"></i>
      : <i className="fas fa-door-closed"></i>;

  return (
    <ModalShell
      icon={icon}
      title={initial.isNew ? "Nouvelle ouverture" : "Modifier l'ouverture"}
      onClose={onClose}
      level={3}
      maxWidth={560}
    >
      <form onSubmit={save} className="gm-modal-body gm-form">
        {err && <div className="gm-form-err">{err}</div>}
        <div className="gm-field-row gm-field-row-2">
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {OPENING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Statut">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ok">OK</option>
              <option value="active">Bon actif</option>
              <option value="done">Terminé récemment</option>
            </select>
          </Field>
        </div>
        <Field label="Localisation *">
          <input className="gm-field-input" required value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Salon · nord" />
        </Field>
        <Field label="Description (optionnel)">
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Détails ou notes sur cette ouverture" />
        </Field>
        <div className="gm-field-row gm-field-row-2">
          <Field label="Année">
            <input className="gm-field-input" type="number" value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2014" />
          </Field>
          <Field label="Marque">
            <input className="gm-field-input" value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Novatech" />
          </Field>
        </div>
        <Field label="Photo de l'ouverture">
          {preview && !removePhoto ? (
            <div className="gm-photo-preview">
              <img src={preview} alt="Aperçu" />
              <button type="button"
                onClick={() => { setPreview(null); setFile(null); setRemovePhoto(true); }}
                className="gm-photo-remove"
                aria-label="Retirer la photo">
                <i className="fas fa-times" style={{ fontSize: 11 }}></i>
              </button>
            </div>
          ) : (
            <PhotoDropzone onFile={handleFile} />
          )}
        </Field>
        <div className="gm-form-actions gm-form-actions-split">
          {!initial.isNew ? (
            <button type="button" onClick={del} className="gm-btn gm-btn-sm" style={{ color: "var(--red)", borderColor: "rgba(227,7,24,0.3)" }}>
              <i className="fas fa-trash"></i>Supprimer
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
            <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
