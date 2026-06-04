"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateOnly } from "@/lib/date-only";
import { WORK_ORDER_LIST_FILTERS, workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";

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
    title: "Bons, soumissions et factures",
    emptyLabel: "Aucun document",
    emptyIcon: "fa-clipboard-list",
    filters: WORK_ORDER_LIST_FILTERS,
    actions: [
      { href: "/admin/bons/nouveau?fresh=1", label: "Bon de travail", icon: "fa-clipboard-list" },
      { href: "/admin/bons/nouveau?fresh=1&mode=quote", label: "Soumission", icon: "fa-file-signature" },
      { href: "/admin/bons/nouveau?fresh=1&mode=invoice", label: "Facture", icon: "fa-file-invoice-dollar" },
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
      { href: "/admin/bons/nouveau?fresh=1&mode=quote", label: "Nouvelle soumission", icon: "fa-file-signature" },
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
      { href: "/admin/bons/nouveau?fresh=1&mode=invoice", label: "Nouvelle facture", icon: "fa-file-invoice-dollar" },
      { href: "/admin/paiements", label: "Paiements", icon: "fa-money-check-alt", secondary: true },
    ],
  },
};

function buildWorkOrdersQuery(documentView, filter) {
  const config = DOCUMENT_VIEW_CONFIG[documentView] || DOCUMENT_VIEW_CONFIG.all;
  const params = new URLSearchParams({ limit: "200" });
  if (config.documentType) params.set("documentType", config.documentType);

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

export default function BonsPage({ documentView = "all" } = {}) {
  const config = DOCUMENT_VIEW_CONFIG[documentView] || DOCUMENT_VIEW_CONFIG.all;
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(config.defaultFilter || "all");

  function loadWorkOrders(showSpinner = true) {
    const params = buildWorkOrdersQuery(documentView, filter);
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
    loadWorkOrders();
    const interval = setInterval(() => loadWorkOrders(false), 5000);
    const onFocus = () => loadWorkOrders(false);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [documentView, filter]);

  async function handleDelete(wo, e) {
    e.stopPropagation();
    if (!confirm(`Supprimer le bon ${wo.number}? Cette action est irreversible.`)) return;
    try {
      const res = await fetch(`/api/admin/work-orders/${wo.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erreur de suppression");
        return;
      }
      loadWorkOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  const totalUnpaid = workOrders
    .filter((wo) => ["invoiced", "sent"].includes(wo.statut))
    .reduce((sum, wo) => sum + Number(wo.balanceDue ?? wo.total ?? 0), 0);
  const documentActionClass = "px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium";
  const documentSecondaryActionClass = "px-4 py-2 border admin-border admin-text hover:bg-white/5 rounded-lg text-sm font-medium";
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {config.filters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab.key ? "bg-cyan-700 text-white" : "admin-text-muted admin-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12 admin-text-muted">
          <i className={`fas ${config.emptyIcon} text-4xl mb-3`}></i>
          <p>{config.emptyLabel}</p>
        </div>
      ) : (
        <div className="admin-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b admin-border admin-text-muted text-xs text-left">
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Technicien</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Route</th>
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
                return (
                  <tr
                    key={wo.id}
                    className={"border-b admin-border admin-hover cursor-pointer" + (isNewManagerRequest ? " bg-amber-500/5" : "")}
                    onClick={() => { window.location.href = `/admin/bons/nouveau?edit=${wo.id}`; }}
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
                    <td className="px-4 py-3 admin-text-muted">
                      {wo.route ? (
                        <Link href="/admin/routes" className="text-cyan-300 hover:underline">
                          {wo.route.area || wo.route.name}
                        </Link>
                      ) : "-"}
                    </td>
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
                      <Link href={`/admin/bons/nouveau?edit=${wo.id}`} className="admin-text-muted hover:admin-text text-xs mr-3" title="Modifier">
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
    </div>
  );
}
