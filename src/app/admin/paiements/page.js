"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const FILTERS = [
  { key: "open", label: "A recevoir" },
  { key: "overdue", label: "En retard" },
  { key: "receivable", label: "Non echu" },
  { key: "paid", label: "Payes" },
  { key: "all", label: "Tous" },
];

const METHOD_OPTIONS = ["Interac", "Cheque", "Carte", "Comptant", "Virement", "Autre"];

function money(value) {
  return `${Number(value || 0).toFixed(2)}$`;
}

function dateInput(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function dateLabel(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" });
}

function stateMeta(payment) {
  if (payment.paymentState === "paid") {
    return { label: "Paye", className: "bg-emerald-500/15 text-emerald-300", icon: "fa-check-circle" };
  }
  if (payment.paymentState === "overdue") {
    return { label: `${payment.daysLate || 0} j. retard`, className: "bg-red-500/15 text-red-300", icon: "fa-exclamation-triangle" };
  }
  return { label: payment.daysUntilDue === 0 ? "Du aujourd'hui" : `${payment.daysUntilDue ?? "-"} j.`, className: "bg-amber-500/15 text-amber-300", icon: "fa-clock" };
}

function SummaryTile({ icon, label, value, detail, tone }) {
  const toneClass = tone === "red" ? "text-red-300 bg-red-500/10" : tone === "green" ? "text-emerald-300 bg-emerald-500/10" : "text-cyan-300 bg-cyan-500/10";
  return (
    <div className="admin-card rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="min-w-0">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-widest">{label}</p>
          <p className="admin-text text-xl font-extrabold">{value}</p>
          {detail ? <p className="admin-text-muted text-xs">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ payment, saving, onPatch }) {
  const [dueDate, setDueDate] = useState(dateInput(payment.paymentDueAt));
  const [method, setMethod] = useState(payment.paymentMethod || "Interac");
  const [notes, setNotes] = useState(payment.paymentNotes || "");
  const meta = stateMeta(payment);
  const dirty = dueDate !== dateInput(payment.paymentDueAt) || method !== (payment.paymentMethod || "Interac") || notes !== (payment.paymentNotes || "");

  async function saveDetails() {
    await onPatch(payment.id, {
      paymentDueAt: dueDate || null,
      paymentMethod: method || null,
      paymentNotes: notes || null,
    });
  }

  async function markPaid() {
    await onPatch(payment.id, {
      action: "mark-paid",
      paymentMethod: method || "Interac",
      paymentNotes: notes || null,
    });
  }

  async function markOpen() {
    if (!confirm(`Remettre ${payment.number} a recevoir?`)) return;
    await onPatch(payment.id, { action: "mark-open", statut: payment.invoiceSentAt ? "sent" : "invoiced" });
  }

  return (
    <tr className="border-b admin-border align-top">
      <td className="px-4 py-4">
        <Link href={`/admin/bons/nouveau?edit=${payment.id}`} className="admin-text font-mono text-xs font-bold hover:underline">
          {payment.number}
        </Link>
        <p className="admin-text-muted mt-1 text-[11px]">Facture: {dateLabel(payment.invoiceIssuedAt || payment.date)}</p>
      </td>
      <td className="px-4 py-4">
        <p className="admin-text font-semibold">{payment.client?.name || "Client"}</p>
        <p className="admin-text-muted text-xs">{payment.client?.phone || payment.client?.secondaryPhone || payment.client?.email || "-"}</p>
        {payment.client?.company ? <p className="admin-text-muted text-[11px]">{payment.client.company}</p> : null}
      </td>
      <td className="px-4 py-4">
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="admin-input w-36 rounded-lg border px-3 py-2 text-xs"
        />
        <p className="admin-text-muted mt-1 text-[11px]">Net {payment.paymentTermsDays || 30} j.</p>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${meta.className}`}>
          <i className={`fas ${meta.icon}`}></i>{meta.label}
        </span>
        {payment.invoiceSentAt ? <p className="admin-text-muted mt-1 text-[11px]">Envoyee {dateLabel(payment.invoiceSentAt)}</p> : null}
      </td>
      <td className="px-4 py-4 text-right">
        <p className="admin-text text-base font-extrabold">{money(payment.total)}</p>
        <p className="admin-text-muted text-[11px]">TPS/TVQ incl.</p>
      </td>
      <td className="px-4 py-4">
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className="admin-input w-32 rounded-lg border px-3 py-2 text-xs"
        >
          {METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Note paiement"
          className="admin-input mt-2 w-40 rounded-lg border px-3 py-2 text-xs"
        />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex flex-col items-end gap-2">
          {payment.paymentState === "paid" ? (
            <button
              type="button"
              disabled={saving}
              onClick={markOpen}
              className="rounded-lg px-3 py-2 text-xs font-bold text-amber-300 admin-hover disabled:opacity-50"
            >
              Reouvrir
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={markPaid}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              <i className="fas fa-check mr-1"></i>Paye
            </button>
          )}
          {dirty ? (
            <button
              type="button"
              disabled={saving}
              onClick={saveDetails}
              className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
            >
              Sauver
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ status: filter });
    if (query.trim()) params.set("q", query.trim());
    return params.toString();
  }, [filter, query]);

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?${queryString}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur paiements");
      setPayments(data.payments || []);
      setSummary(data.summary || null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(), 150);
    return () => clearTimeout(timeout);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [queryString]);

  async function patchPayment(id, payload) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur sauvegarde paiement");
      await load(false);
      return data;
    } catch (err) {
      alert(err.message);
      return null;
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="admin-text text-2xl font-bold">Paiements</h1>
          <p className="admin-text-muted text-sm">Factures a recevoir, retards et paiements confirmes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Client, telephone, facture"
            className="admin-input w-64 rounded-lg border px-3 py-2 text-sm"
          />
          <button onClick={() => load()} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600">
            <i className="fas fa-rotate mr-2"></i>Rafraichir
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryTile icon="fa-file-invoice-dollar" label="A recevoir" value={money(summary?.openTotal)} detail={`${summary?.openCount || 0} facture(s)`} />
        <SummaryTile icon="fa-exclamation-triangle" label="En retard" value={money(summary?.overdueTotal)} detail={`${summary?.overdueCount || 0} facture(s)`} tone="red" />
        <SummaryTile icon="fa-clock" label="Non echu" value={money(summary?.receivableTotal)} detail={`${summary?.receivableCount || 0} facture(s)`} />
        <SummaryTile icon="fa-check-circle" label="Paye 30 jours" value={money(summary?.paid30Total)} detail={`${summary?.paid30Count || 0} facture(s)`} tone="green" />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === tab.key ? "bg-[var(--color-red)] text-white" : "admin-text-muted admin-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : payments.length === 0 ? (
        <div className="admin-card rounded-xl border p-10 text-center">
          <i className="fas fa-money-check-alt mb-3 text-4xl admin-text-muted"></i>
          <p className="admin-text font-bold">Aucune facture dans ce filtre</p>
          <p className="admin-text-muted text-sm">Les factures apparaissent ici des que leur statut est Facture, Envoyee ou Payee.</p>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b admin-border text-left text-xs admin-text-muted">
                <th className="px-4 py-3">Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Echeance</th>
                <th className="px-4 py-3">Etat</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <PaymentRow
                  key={`${payment.id}:${payment.paymentDueAt || ""}:${payment.paymentMethod || ""}:${payment.paymentNotes || ""}:${payment.paymentState || ""}`}
                  payment={payment}
                  saving={savingId === payment.id}
                  onPatch={patchPayment}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
