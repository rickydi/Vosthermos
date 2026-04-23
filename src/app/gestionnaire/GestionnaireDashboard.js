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

export default function GestionnaireDashboard({ manager, clients, isGlobal, activeClient, buildings, orphanUnits, stats, notifs, interventions, invoices, invoicesTotals }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [activeTab, setActiveTab] = useState(sp.get("tab") || "dashboard");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

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
    router.push(`/gestionnaire?c=${clientId}`);
  }

  async function logout() {
    await fetch("/api/manager/auth/logout", { method: "POST" });
    router.push("/gestionnaire/login");
  }

  function changeTab(tab) {
    setActiveTab(tab);
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
        {/* SIDEBAR */}
        <aside className="gm-sidebar">
          <div className="gm-brand">
            <div className="gm-logo">VOS<span>THERMOS</span></div>
          </div>
          <div>
            <div className="gm-tag"><i className="fas fa-building" style={{ fontSize: "10px", marginRight: 4 }}></i> Portail Gestionnaire</div>
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
            </div>
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
            <nav className="gm-crumb">
              <a href="#" onClick={(e) => e.preventDefault()}>{isGlobal ? "Vue globale" : activeClient.name}</a>
              <span className="sep">/</span>
              <span className="current">{crumbs[activeTab]}</span>
            </nav>
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
              <div className="gm-page-head">
                <div>
                  <h1 className="gm-page-title">{isGlobal ? "Vue globale" : "Tableau de bord"}</h1>
                  <div className="gm-page-sub">
                    {isGlobal ? `${clients.length} copropriétés · ${stats.totalUnits} unités` : activeClient.name}
                    {stats.activeWOsCount > 0 && <> · <strong>{stats.activeWOsCount} bon{stats.activeWOsCount > 1 ? "s" : ""} actif{stats.activeWOsCount > 1 ? "s" : ""}</strong></>}
                    {stats.invoicedCount > 0 && <> · {stats.invoicedCount} facture{stats.invoicedCount > 1 ? "s" : ""} due{stats.invoicedCount > 1 ? "s" : ""}</>}
                  </div>
                </div>
                <div className="gm-page-actions">
                  <button className="gm-btn gm-btn-primary">
                    <i className="fas fa-plus"></i>Demander intervention
                  </button>
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

              {/* Bâtiments & Unités */}
              <div className="gm-section-head">
                <div className="gm-section-title">Parc de fenêtres · {buildings.length} bâtiment{buildings.length > 1 ? "s" : ""} · {stats.totalUnits} unité{stats.totalUnits > 1 ? "s" : ""}</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="legend">
                    <span><span className="dot ok"></span>Terminé</span>
                    <span><span className="dot active"></span>Actif</span>
                    <span><span className="dot none"></span>Aucun</span>
                  </div>
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
              </div>
            </div>
          )}

          {/* INTERVENTIONS TAB */}
          {activeTab === "interventions" && (
            <div className="gm-content">
              <div className="gm-page-head">
                <div>
                  <h1 className="gm-page-title">Interventions</h1>
                  <div className="gm-page-sub">
                    {interventions?.active?.length > 0 ? <><strong>{interventions.active.length} active{interventions.active.length > 1 ? "s" : ""}</strong></> : "Aucune intervention active"}
                    {interventions?.recent?.length > 0 && ` · ${interventions.recent.length} récente${interventions.recent.length > 1 ? "s" : ""}`}
                  </div>
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
                  <div key={wo.id} className="li">
                    <div className={"li-when " + (wo.statut === "in_progress" ? "now" : "soon")}>
                      {fmtDateShort(wo.date)}<br />{wo.statut === "in_progress" ? "EN COURS" : wo.statut === "scheduled" ? "PLANIFIÉ" : "BROUILLON"}
                    </div>
                    <div className="li-body">
                      <div className="li-title">{wo.number} {isGlobal && wo.clientName && <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: 12 }}>· {wo.clientName}</span>}</div>
                      <div className="li-text">
                        {wo.description ? wo.description.slice(0, 90) : "Intervention planifiée"}
                        {wo.sections.length > 0 && ` · Unités: ${wo.sections.join(", ")}`}
                        {wo.technicianName && ` · ${wo.technicianName}`}
                      </div>
                    </div>
                    <span className={"gm-tag " + (wo.statut === "in_progress" ? "green" : "red")}>
                      {wo.statut === "in_progress" ? "En cours" : "Confirmé"}
                    </span>
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
              <div className="gm-page-head">
                <div>
                  <h1 className="gm-page-title">Factures</h1>
                  <div className="gm-page-sub">
                    {stats.invoicedCount > 0 ? <><strong>{stats.invoicedCount} à régler</strong> · {fmtMoney(invoicesTotals.toPay)}</> : "Aucune facture en attente"}
                  </div>
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
              <div className="gm-page-head">
                <div>
                  <h1 className="gm-page-title">{crumbs[activeTab]}</h1>
                  <div className="gm-page-sub">Section en cours de développement</div>
                </div>
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

              {selectedUnit.openings.length > 0 && (
                <>
                  <div className="modal-section-title">Détail des ouvertures</div>
                  <div className="openings">
                    {selectedUnit.openings.map((o) => (
                      <div key={o.id} className="opening">
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
                </>
              )}
            </div>
            <div className="gm-modal-foot">
              <button className="gm-btn gm-btn-sm">
                <i className="fas fa-history"></i>Historique complet
              </button>
              <button className="gm-btn gm-btn-sm gm-btn-primary">
                <i className="fas fa-plus"></i>Demander intervention
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
