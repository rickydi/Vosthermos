"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function money(value) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function lastMonthYm() {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlyInvoiceReportSection({ compact = false } = {}) {
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  async function loadSummary(nextMonth = "") {
    setLoading(true);
    setToast(null);
    try {
      const qs = new URLSearchParams({ format: "summary" });
      if (nextMonth) qs.set("month", nextMonth);
      const res = await fetch(`/api/admin/factures/report?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSummary(data);
      setMonth(data.month || nextMonth);
    } catch (error) {
      setToast({ type: "error", message: error.message || "Erreur" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const months = summary?.months || [];
  const totals = summary?.totals || {};
  const hasMonth = Boolean(month);
  const monthOptions = hasMonth && !months.includes(month) ? [month, ...months] : months;
  const hasInvoices = Number(totals.count || 0) > 0;
  const reportHref = useMemo(() => {
    if (!hasMonth) return { pdf: "#", csv: "#" };
    return {
      pdf: `/api/admin/factures/report?month=${month}&format=pdf`,
      csv: `/api/admin/factures/report?month=${month}&format=csv`,
    };
  }, [hasMonth, month]);

  async function changeMonth(value) {
    setMonth(value);
    await loadSummary(value);
  }

  async function sendReport() {
    if (!summary?.accountantConfigured) {
      setToast({ type: "error", message: "Configure le courriel du comptable dans Parametres." });
      return;
    }
    if (!hasInvoices) {
      setToast({ type: "error", message: "Aucune facture pour ce mois." });
      return;
    }
    if (!window.confirm(`Envoyer le rapport de ${summary.monthLabel || month} au comptable maintenant?`)) return;
    setSending(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/factures/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      const driveMsg = data.drive?.uploaded
        ? " Depot Drive complete."
        : data.drive?.error
          ? ` Drive non depose: ${data.drive.error}.`
          : "";
      setToast({ type: "success", message: `Rapport envoye a ${data.to} (${data.count} facture${data.count > 1 ? "s" : ""}).${driveMsg}` });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Erreur" });
    } finally {
      setSending(false);
    }
  }

  if (loading && !summary) {
    return (
      <div className="admin-card border admin-border rounded-xl p-4 mb-6">
        <p className="admin-text-muted text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement du rapport comptable...</p>
      </div>
    );
  }

  return (
    <div className={`admin-card border admin-border rounded-xl ${compact ? "p-5" : "p-4 mb-6"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="admin-text font-bold text-lg flex items-center gap-2">
            <i className="fas fa-chart-pie text-cyan-300"></i>
            Rapport mensuel comptable
          </h2>
          <p className="admin-text-muted text-xs mt-1">
            PDF resume + export CSV des factures du mois, envoyables au comptable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(event) => changeMonth(event.target.value)}
            className="admin-input border rounded-lg px-3 py-2 text-sm min-w-40"
            disabled={loading}
          >
            {monthOptions.length === 0 ? (
              <option value={month || lastMonthYm()}>Aucun mois facture</option>
            ) : (
              monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))
            )}
          </select>
          <a
            href={reportHref.pdf}
            target="_blank"
            rel="noreferrer"
            className={`px-3 py-2 rounded-lg text-sm font-bold ${hasInvoices ? "bg-cyan-700 hover:bg-cyan-600 text-white" : "bg-white/5 admin-text-muted pointer-events-none"}`}
          >
            <i className="fas fa-file-pdf mr-2"></i>PDF
          </a>
          <a
            href={reportHref.csv}
            className={`px-3 py-2 rounded-lg border admin-border text-sm ${hasInvoices ? "admin-text hover:bg-white/5" : "admin-text-muted pointer-events-none opacity-60"}`}
          >
            <i className="fas fa-file-csv mr-2"></i>CSV
          </a>
          <button
            type="button"
            onClick={sendReport}
            disabled={sending || !hasInvoices || !summary?.accountantConfigured}
            className="px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-sm font-bold disabled:opacity-50 disabled:hover:bg-transparent"
            title={summary?.accountantConfigured ? "Envoyer au comptable" : "Configurer le courriel du comptable dans Parametres"}
          >
            {sending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi...</> : <><i className="fas fa-paper-plane mr-2"></i>Envoyer</>}
          </button>
        </div>
      </div>

      {!summary?.accountantConfigured && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Courriel du comptable non configure. <Link href="/admin/parametres" className="font-bold underline">Ajouter dans Parametres</Link>.
        </div>
      )}

      {toast && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm border ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <div className="rounded-lg border admin-border bg-white/[0.02] px-3 py-2">
          <div className="admin-text-muted text-[10px] uppercase font-bold">Factures</div>
          <div className="admin-text text-lg font-black">{totals.count || 0}</div>
        </div>
        <div className="rounded-lg border admin-border bg-white/[0.02] px-3 py-2">
          <div className="admin-text-muted text-[10px] uppercase font-bold">Total</div>
          <div className="admin-text text-lg font-black">{money(totals.total)}</div>
        </div>
        <div className="rounded-lg border admin-border bg-white/[0.02] px-3 py-2">
          <div className="admin-text-muted text-[10px] uppercase font-bold">Taxes</div>
          <div className="admin-text text-lg font-black">{money(Number(totals.tps || 0) + Number(totals.tvq || 0))}</div>
        </div>
        <div className="rounded-lg border admin-border bg-white/[0.02] px-3 py-2">
          <div className="admin-text-muted text-[10px] uppercase font-bold">Encaisse</div>
          <div className="text-emerald-300 text-lg font-black">{money(totals.paidTotal)}</div>
        </div>
        <div className="rounded-lg border admin-border bg-white/[0.02] px-3 py-2">
          <div className="admin-text-muted text-[10px] uppercase font-bold">Solde</div>
          <div className="text-amber-300 text-lg font-black">{money(totals.balanceDue)}</div>
        </div>
      </div>
    </div>
  );
}
