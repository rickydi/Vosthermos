"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminStream } from "@/components/admin/adminStream";
import MonthlyInvoiceReportSection from "@/components/admin/MonthlyInvoiceReportSection";
import { formatDateOnly } from "@/lib/date-only";
import { adminDocumentEditHref, adminDocumentNewHref } from "@/lib/admin-document-routes";
import { workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";

function invoicePaymentStatusMeta(wo) {
  if (!["invoiced", "sent"].includes(wo?.statut)) return null;
  if (wo.paymentState === "overdue") {
    return {
      label: `${wo.daysLate || 0} j. retard`,
      className: "bg-red-500/20 text-red-300",
      icon: "fa-exclamation-triangle",
    };
  }
  if (wo.hasPartialPayments) {
    return {
      label: "Depot recu",
      className: "bg-cyan-500/20 text-cyan-300",
      icon: "fa-coins",
    };
  }
  return {
    label: "A payer",
    className: "bg-orange-500/20 text-orange-400",
    icon: "fa-dollar-sign",
  };
}

function invoiceSentLabel(wo) {
  if (wo?.statut !== "sent") return null;
  return wo.invoiceSentAt ? `Envoyee ${formatDateOnly(wo.invoiceSentAt)}` : "Facture envoyee";
}

const DOCUMENT_VIEW_CONFIG = {
  all: {
    title: "Bons de travail",
    emptyLabel: "Aucun bon de travail",
    emptyIcon: "fa-clipboard-list",
    documentType: "work_order",
    filters: [
      { key: "all", label: "Tous les bons" },
      { key: "draft", label: "Brouillons / demandes" },
      { key: "scheduled", label: "Jobs planifies" },
      { key: "in_progress", label: "En cours" },
      { key: "completed", label: "Jobs faits" },
    ],
    actions: [
      { href: "/admin/bons/nouveau?fresh=1", label: "Bon de travail", icon: "fa-clipboard-list" },
    ],
  },
  quotes: {
    title: "Soumissions",
    emptyLabel: "Aucune soumission",
    emptyIcon: "fa-file-signature",
    documentType: "quote",
    filters: [
      { key: "all", label: "Toutes" },
      { key: "quote", label: "Soumissions" },
      { key: "quote_sent", label: "Estimes envoyes" },
      { key: "quote_accepted", label: "Acceptes" },
    ],
    actions: [
      { href: adminDocumentNewHref("quote", { fresh: 1 }), label: "Nouvelle soumission", icon: "fa-file-signature" },
    ],
  },
  invoices: {
    title: "Factures",
    emptyLabel: "Aucune facture",
    emptyIcon: "fa-file-invoice-dollar",
    documentType: "invoice",
    defaultFilter: "open",
    filters: [
      { key: "open", label: "A payer" },
      { key: "overdue", label: "En retard" },
      { key: "receivable", label: "Non echues" },
      { key: "partial", label: "Depot recu" },
      { key: "paid", label: "Payees" },
      { key: "all", label: "Toutes" },
    ],
    actions: [
      { href: adminDocumentNewHref("invoice", { fresh: 1 }), label: "Nouvelle facture", icon: "fa-file-invoice-dollar" },
      { href: "/admin/paiements", label: "Paiements", icon: "fa-money-check-alt", secondary: true },
    ],
  },
};

function buildWorkOrdersQuery(documentView, filter, query = "") {
  const config = DOCUMENT_VIEW_CONFIG[documentView] || DOCUMENT_VIEW_CONFIG.all;
  const params = new URLSearchParams({ limit: "200" });
  if (config.documentType) params.set("documentType", config.documentType);
  if (query.trim()) params.set("q", query.trim());

  if (filter && filter !== "all") {
    if (documentView === "invoices" && ["open", "overdue", "receivable", "partial", "paid"].includes(filter)) {
      params.set("paymentState", filter);
    } else {
      params.set("statut", filter);
    }
  }

  return `?${params.toString()}`;
}

function statusDisplayMeta(wo, documentView) {
  const paymentStatus = invoicePaymentStatusMeta(wo);
  if (paymentStatus) return paymentStatus;

  if (documentView === "quotes" && ["quote_sent", "quote_accepted"].includes(wo?.statut) && wo.followUpStatusLabel) {
    return {
      label: wo.followUpStatusLabel,
      className: workOrderStatusClass(wo.statut),
      icon: wo.followUpStatusIcon,
    };
  }

  return {
    label: workOrderStatusLabel(wo?.statut),
    className: workOrderStatusClass(wo?.statut),
    icon: null,
  };
}

function editDocumentHref(wo, documentView) {
  if (documentView === "quotes" || ["quote", "quote_sent", "quote_accepted"].includes(wo.statut)) {
    return adminDocumentEditHref(wo.id, "quote");
  } else if (documentView === "invoices" || ["invoiced", "sent", "paid"].includes(wo.statut)) {
    return adminDocumentEditHref(wo.id, "invoice");
  }
  return adminDocumentEditHref(wo.id, "work_order");
}

export default function BonsPage({ documentView = "all" } = {}) {
  const config = DOCUMENT_VIEW_CONFIG[documentView] || DOCUMENT_VIEW_CONFIG.all;
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(config.defaultFilter || "all");
  const [query, setQuery] = useState("");
  // Vue "Rapport mensuel" integree a la page Factures (ancienne page
  // /admin/rapports-factures fusionnee ici).
  const [showReport, setShowReport] = useState(false);
  const reportAvailable = documentView === "invoices";

  function loadWorkOrders(showSpinner = true) {
    const params = buildWorkOrdersQuery(documentView, filter, query);
    if (showSpinner) setLoading(true);
    fetch(`/api/admin/work-orders${params}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.json())
      .then((data) => {
        setWorkOrders(data.workOrders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(() => loadWorkOrders(), query.trim() ? 200 : 0);
    // Filet de securite seulement: les changements arrivent en <1s par le flux
    // temps reel ci-dessous, plus besoin de recharger la liste toutes les 5s.
    const interval = setInterval(() => loadWorkOrders(false), 30000);
    const onFocus = () => loadWorkOrders(false);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [documentView, filter, query]);

  // Temps réel: un collègue/le terrain modifie un bon -> reload discret, coalescé.
  const streamReloadTimer = useRef(null);
  useAdminStream((e) => {
    if (!["work_order.changed", "follow_up.changed"].includes(e?.type)) return;
    clearTimeout(streamReloadTimer.current);
    streamReloadTimer.current = setTimeout(() => loadWorkOrders(false), 600);
  });
  useEffect(() => () => clearTimeout(streamReloadTimer.current), []);

  // Suppression d'un bon avec argent encaisse : le serveur repond 409 et on
  // force le choix note de credit / remboursement (trace comptable conservee).
  const [deleteResolution, setDeleteResolution] = useState(null);

  async function handleDelete(wo, e) {
    e.stopPropagation();
    if (!confirm(`Supprimer le bon ${wo.number}? Cette action est irreversible.`)) return;
    try {
      const res = await fetch(`/api/admin/work-orders/${wo.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.requiresResolution) {
        setDeleteResolution({ wo, paidTotal: Number(data.paidTotal || 0), saving: false });
        return;
      }
      if (!res.ok) {
        alert(data.error || "Erreur de suppression");
        return;
      }
      loadWorkOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  async function confirmDeleteWithResolution(resolution) {
    const target = deleteResolution;
    if (!target) return;
    setDeleteResolution({ ...target, saving: true });
    try {
      const res = await fetch(`/api/admin/work-orders/${target.wo.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Erreur de suppression");
        setDeleteResolution({ ...target, saving: false });
        return;
      }
      setDeleteResolution(null);
      if (data.creditNote?.id) {
        window.open(`/api/admin/credit-notes/${data.creditNote.id}/pdf`, "_blank", "noopener");
      }
      loadWorkOrders();
    } catch (err) {
      alert(err.message);
      setDeleteResolution({ ...target, saving: false });
    }
  }

  const totalUnpaid = workOrders
    .filter((wo) => ["invoiced", "sent"].includes(wo.statut))
    .reduce((sum, wo) => sum + Number(wo.balanceDue ?? wo.total ?? 0), 0);
  const documentActionClass = "px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium";
  const documentSecondaryActionClass = "px-4 py-2 border admin-border admin-text hover:bg-white/5 rounded-lg text-sm font-medium";
  const showSearch = documentView === "invoices";
  const subtitle = documentView === "quotes"
    ? `${workOrders.length} soumission${workOrders.length > 1 ? "s" : ""}`
    : documentView === "invoices"
      ? `${workOrders.length} facture${workOrders.length > 1 ? "s" : ""} | A recevoir: ${totalUnpaid.toFixed(2)}$`
      : `${workOrders.length} documents | A recevoir: ${totalUnpaid.toFixed(2)}$`;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="admin-text text-2xl font-bold">{config.title}</h1>
          <p className="admin-text-muted text-sm">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch ? (
            <div className="relative w-full sm:w-80">
              <i className="fas fa-search admin-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"></i>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher facture, client, telephone"
                className="admin-input w-full rounded-lg border py-2 pl-9 pr-9 text-sm"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="admin-text-muted admin-hover absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md"
                  title="Effacer la recherche"
                >
                  <i className="fas fa-times"></i>
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {config.actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={action.secondary ? documentSecondaryActionClass : documentActionClass}
              >
                <i className={`fas ${action.icon} mr-2`}></i>{action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {config.filters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setShowReport(false); setFilter(tab.key); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              !showReport && filter === tab.key ? "bg-cyan-700 text-white" : "admin-text-muted admin-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {reportAvailable && (
          <button
            onClick={() => setShowReport(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              showReport ? "bg-cyan-700 text-white" : "admin-text-muted admin-hover"
            }`}
          >
            <i className="fas fa-chart-pie mr-2"></i>Rapport mensuel
          </button>
        )}
      </div>

      {reportAvailable && showReport ? (
        <MonthlyInvoiceReportSection compact />
      ) : loading ? (
        <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12 admin-text-muted">
          <i className={`fas ${config.emptyIcon} text-4xl mb-3`}></i>
          <p>{config.emptyLabel}</p>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b admin-border admin-text-muted text-xs text-left">
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Technicien</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Demande le</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => {
                const isNewManagerRequest = wo.statut === "draft" && typeof wo.notes === "string" && wo.notes.startsWith("Demande du gestionnaire");
                const statusMeta = statusDisplayMeta(wo, documentView);
                const sentLabel = invoiceSentLabel(wo);
                const editHref = editDocumentHref(wo, documentView);
                return (
                  <tr
                    key={wo.id}
                    className={"border-b admin-border admin-hover cursor-pointer" + (isNewManagerRequest ? " bg-amber-500/5" : "")}
                    onClick={() => { window.location.href = editHref; }}
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {isNewManagerRequest && <span className="admin-unread-dot" title="Nouvelle demande gestionnaire"></span>}
                        <span>{wo.number}</span>
                        {isNewManagerRequest && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 uppercase tracking-wider">Nouveau</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="admin-text font-medium">{wo.client?.name}</p>
                      <p className="admin-text-muted text-xs">{wo.client?.phone}</p>
                    </td>
                    <td className="px-4 py-3 admin-text-muted">{wo.technician?.name || "-"}</td>
                    <td className="px-4 py-3 admin-text-muted">{formatDateOnly(wo.date)}</td>
                    <td className="px-4 py-3 admin-text-muted text-xs">
                      {wo.createdAt ? (
                        <>
                          {new Date(wo.createdAt).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" })}<br />
                          {new Date(wo.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                        </>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 font-bold">{Number(wo.total || 0).toFixed(2)}$</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusMeta.className}`}>
                          {statusMeta.icon ? <i className={`fas ${statusMeta.icon}`}></i> : null}
                          {statusMeta.label}
                        </span>
                        {sentLabel ? (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-300">
                            {sentLabel}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link href={editHref} className="admin-text-muted hover:admin-text text-xs mr-3" title="Modifier">
                        <i className="fas fa-pen"></i>
                      </Link>
                      <button onClick={(e) => handleDelete(wo, e)} className="text-amber-400 hover:text-amber-300 text-xs" title="Supprimer">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {deleteResolution ? (
        <DeleteResolutionModal
          target={deleteResolution}
          onClose={() => setDeleteResolution(null)}
          onConfirm={confirmDeleteWithResolution}
        />
      ) : null}
    </div>
  );
}

// Choix impose avant de supprimer une facture avec argent encaisse :
// note de credit (argent garde) ou remboursement (argent rendu). Une note
// de credit snapshot est creee pour la comptable dans les deux cas.
function DeleteResolutionModal({ target, onClose, onConfirm }) {
  const [type, setType] = useState("credit");
  const [method, setMethod] = useState("Carte");
  const [ref, setRef] = useState("");
  const isRefund = type === "refund";
  const paid = Number(target.paidTotal || 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="admin-modal-card w-full max-w-md rounded-xl border p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <div>
            <h2 className="admin-text text-base font-extrabold">Supprimer {target.wo.number}?</h2>
            <p className="admin-text-muted mt-1 text-sm">
              <span className="admin-text font-bold">{paid}$</span> ont ete encaisses sur cette facture.
              Choisis quoi faire avec cet argent avant la suppression.
            </p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("credit")}
            className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${!isRefund ? "border-teal-400 bg-teal-500/15 text-teal-200" : "admin-border admin-text-muted admin-hover"}`}
          >
            Note de credit
            <span className="block text-[10px] font-normal opacity-70">argent garde</span>
          </button>
          <button
            type="button"
            onClick={() => setType("refund")}
            className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${isRefund ? "border-amber-400 bg-amber-500/15 text-amber-200" : "admin-border admin-text-muted admin-hover"}`}
          >
            Remboursement
            <span className="block text-[10px] font-normal opacity-70">argent rendu</span>
          </button>
        </div>

        {isRefund ? (
          <div className="space-y-2">
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
            >
              {["Carte", "Interac", "Cheque", "Comptant", "Virement", "Autre"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              value={ref}
              onChange={(event) => setRef(event.target.value)}
              placeholder={method === "Carte" ? "N° confirmation Moneris" : "N° confirmation / reference (optionnel)"}
              className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        ) : null}

        <p className="admin-text-muted mt-3 text-[11px] leading-snug">
          {isRefund
            ? "Un recu de remboursement (PDF) sera cree; l'argent est considere sorti du compte."
            : "Une note de credit (PDF) sera creee; l'argent reste en credit au dossier du client."}
          {" "}Le document apparait dans le rapport mensuel de la comptable.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={target.saving}
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-bold admin-text-muted admin-hover disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={target.saving}
            onClick={() => onConfirm({ type, method: isRefund ? method : null, ref: isRefund ? ref.trim() || null : null })}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {target.saving ? "Suppression..." : "Supprimer + creer le document"}
          </button>
        </div>
      </div>
    </div>
  );
}
