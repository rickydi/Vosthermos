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
  const canManageOpenings = !isGlobal && hasPerm(activeClient, "manage_openings");
  const canManageUnits = !isGlobal && hasPerm(activeClient, "manage_units");

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
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="legend">
                    <span><span className="dot ok"></span>Terminé</span>
                    <span><span className="dot active"></span>Actif</span>
                    <span><span className="dot none"></span>Aucun</span>
                  </div>
                  {canManageUnits && (
                    <button
                      className="gm-btn gm-btn-sm gm-btn-primary"
                      onClick={() => setBuildingEditor({ code: "", name: "", address: "" })}
                    >
                      <i className="fas fa-plus"></i>Ajouter bâtiment
                    </button>
                  )}
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
                        <button
                          className="gm-btn gm-btn-sm"
                          onClick={() => setUnitEditor({ buildingId: b.id, buildingName: b.name, code: "", description: "" })}
                          style={{ marginLeft: 8 }}
                        >
                          <i className="fas fa-plus"></i>Ajouter unité
                        </button>
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
          onSaved={() => { setOpeningEditor(null); router.refresh(); }}
          onDeleted={() => { setOpeningEditor(null); router.refresh(); }}
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

function TextInput({ label, value, onChange, placeholder, required, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>{label}</label>
      <input required={required} type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }} />
    </div>
  );
}

function BuildingEditor({ clientId, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ code: initial.code || "", name: initial.name || "", address: initial.address || "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/manager/buildings", {
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
    <div className="gm-modal-backdrop open" onClick={(e) => { if (e.target.classList.contains("gm-modal-backdrop")) onClose(); }}>
      <div className="gm-modal" style={{ maxWidth: 500 }}>
        <div className="gm-modal-head">
          <div className="modal-tag"><i className="fas fa-building"></i></div>
          <div><div className="gm-modal-title">Nouveau bâtiment</div></div>
          <button className="gm-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={save} className="gm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ background: "#fdf2f3", color: "#c10615", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
            <TextInput label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} placeholder="A" required />
            <TextInput label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Bâtiment A" required />
          </div>
          <TextInput label="Adresse (optionnel)" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="1500 Montée Monette" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
            <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">{saving ? "..." : "Créer"}</button>
          </div>
        </form>
      </div>
    </div>
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
    <div className="gm-modal-backdrop open" onClick={(e) => { if (e.target.classList.contains("gm-modal-backdrop")) onClose(); }}>
      <div className="gm-modal" style={{ maxWidth: 500 }}>
        <div className="gm-modal-head">
          <div className="modal-tag"><i className="fas fa-door-open"></i></div>
          <div>
            <div className="gm-modal-title">Nouvelle unité</div>
            {initial.buildingName && <div className="gm-modal-sub">{initial.buildingName}</div>}
          </div>
          <button className="gm-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={save} className="gm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ background: "#fdf2f3", color: "#c10615", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextInput label="Code unité" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="A-101" required />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Bâtiment</label>
              <select value={form.buildingId || ""} onChange={(e) => setForm({ ...form, buildingId: e.target.value || null })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }}>
                <option value="">Aucun</option>
                {buildings.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
              </select>
            </div>
          </div>
          <TextInput label="Description (optionnel)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: 3 chambres" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
            <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">{saving ? "..." : "Créer"}</button>
          </div>
        </form>
      </div>
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      onSaved();
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  }

  async function del() {
    if (!confirm("Supprimer cette ouverture?")) return;
    const res = await fetch(`/api/manager/openings/${initial.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    onDeleted();
  }

  return (
    <div className="gm-modal-backdrop open" onClick={(e) => { if (e.target.classList.contains("gm-modal-backdrop")) onClose(); }}>
      <div className="gm-modal" style={{ maxWidth: 560 }}>
        <div className="gm-modal-head">
          <div className="modal-tag">{form.type === "fenetre" ? "🪟" : form.type.startsWith("porte") ? "🚪" : "◳"}</div>
          <div>
            <div className="gm-modal-title">{initial.isNew ? "Nouvelle ouverture" : "Modifier l'ouverture"}</div>
          </div>
          <button className="gm-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={save} className="gm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ background: "#fdf2f3", color: "#c10615", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}>{err}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }}>
                {OPENING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }}>
                <option value="ok">OK</option>
                <option value="active">Bon actif</option>
                <option value="done">Terminé récemment</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Localisation</label>
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Salon · nord" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Description (optionnel)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Année</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2014" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Marque</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Novatech" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4, display: "block" }}>Photo</label>
            {preview && !removePhoto ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={preview} alt="Aperçu" style={{ maxHeight: 140, borderRadius: 6 }} />
                <button type="button" onClick={() => { setPreview(null); setFile(null); setRemovePhoto(true); }}
                  style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, background: "#e30718", color: "white", border: "none", borderRadius: "50%", cursor: "pointer" }}>
                  <i className="fas fa-times" style={{ fontSize: 11 }}></i>
                </button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }} />
            )}
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>JPEG, PNG, WebP ou GIF · max 8 MB</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <div>
              {!initial.isNew && <button type="button" onClick={del} className="gm-btn gm-btn-sm" style={{ color: "var(--red)", borderColor: "rgba(227,7,24,0.3)" }}>
                <i className="fas fa-trash"></i>Supprimer
              </button>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onClose} className="gm-btn gm-btn-sm">Annuler</button>
              <button type="submit" disabled={saving} className="gm-btn gm-btn-sm gm-btn-primary">
                {saving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
