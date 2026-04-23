"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BonsPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  function loadWorkOrders() {
    const params = filter !== "all" ? `?statut=${filter}` : "";
    setLoading(true);
    fetch(`/api/admin/work-orders${params}`)
      .then((r) => r.json())
      .then((data) => { setWorkOrders(data.workOrders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadWorkOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

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

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400",
    scheduled: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    completed: "bg-green-500/20 text-green-400",
    invoiced: "bg-orange-500/20 text-orange-400",
    paid: "bg-emerald-500/20 text-emerald-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = {
    draft: "Brouillon",
    scheduled: "Planifié",
    in_progress: "En cours",
    completed: "Complété",
    invoiced: "Facturé",
    paid: "Payé",
    sent: "Envoyé",
  };

  const totalUnpaid = workOrders.filter((w) => w.statut === "invoiced").reduce((sum, w) => sum + w.total, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="admin-text text-2xl font-bold">Bons de travail</h1>
          <p className="admin-text-muted text-sm">{workOrders.length} bons | À recevoir: {totalUnpaid.toFixed(2)}$</p>
        </div>
        <Link href="/admin/bons/nouveau"
          className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
          <i className="fas fa-plus mr-2"></i>Nouveau bon
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Tous" },
          { key: "draft", label: "Brouillons" },
          { key: "scheduled", label: "Planifiés" },
          { key: "completed", label: "Complétés" },
          { key: "invoiced", label: "Facturés" },
          { key: "paid", label: "Payés" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key ? "bg-[var(--color-red)]/10 text-[var(--color-red)]" : "admin-text-muted admin-hover"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12 admin-text-muted">
          <i className="fas fa-clipboard-list text-4xl mb-3"></i>
          <p>Aucun bon de travail</p>
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
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id} className="border-b admin-border admin-hover cursor-pointer" onClick={() => window.location.href = `/admin/bons/${wo.id}`}>
                  <td className="px-4 py-3 font-mono text-xs">{wo.number}</td>
                  <td className="px-4 py-3">
                    <p className="admin-text font-medium">{wo.client?.name}</p>
                    <p className="admin-text-muted text-xs">{wo.client?.phone}</p>
                  </td>
                  <td className="px-4 py-3 admin-text-muted">{wo.technician?.name || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">{new Date(wo.date).toLocaleDateString("fr-CA")}</td>
                  <td className="px-4 py-3 font-bold">{wo.total.toFixed(2)}$</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>
                      {statusLabels[wo.statut] || wo.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/admin/bons/nouveau?edit=${wo.id}`}
                      className="admin-text-muted hover:admin-text text-xs mr-3" title="Modifier">
                      <i className="fas fa-pen"></i>
                    </Link>
                    <button onClick={(e) => handleDelete(wo, e)}
                      className="text-red-500 hover:text-red-600 text-xs" title="Supprimer">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
