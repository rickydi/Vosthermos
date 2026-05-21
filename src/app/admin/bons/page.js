"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateOnly } from "@/lib/date-only";
import { WORK_ORDER_LIST_FILTERS, workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";

export default function BonsPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  function loadWorkOrders(showSpinner = true) {
    const params = filter !== "all" ? `?statut=${filter}` : "";
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
  }, [filter]);

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
    .reduce((sum, wo) => sum + Number(wo.total || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="admin-text text-2xl font-bold">Bons, soumissions et factures</h1>
          <p className="admin-text-muted text-sm">{workOrders.length} documents | A recevoir: {totalUnpaid.toFixed(2)}$</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/bons/nouveau?fresh=1"
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-clipboard-list mr-2"></i>Bon de travail
          </Link>
          <Link
            href="/admin/bons/nouveau?fresh=1&mode=quote"
            className="px-4 py-2 border border-sky-500/40 text-sky-600 hover:bg-sky-500/10 rounded-lg text-sm font-medium"
          >
            <i className="fas fa-file-signature mr-2"></i>Soumission
          </Link>
          <Link
            href="/admin/bons/nouveau?fresh=1&mode=invoice"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-file-invoice-dollar mr-2"></i>Facture
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {WORK_ORDER_LIST_FILTERS.map((tab) => (
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
          <i className="fas fa-clipboard-list text-4xl mb-3"></i>
          <p>Aucun document</p>
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
                <th className="px-4 py-3">Demande le</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => {
                const isNewManagerRequest = wo.statut === "draft" && typeof wo.notes === "string" && wo.notes.startsWith("Demande du gestionnaire");
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
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${workOrderStatusClass(wo.statut)}`}>
                        {workOrderStatusLabel(wo.statut)}
                      </span>
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
