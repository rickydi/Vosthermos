"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDateOnly, todayDateInput } from "@/lib/date-only";
import { workOrderStatusLabel } from "@/lib/work-order-status";

const FILTERS = [
  { key: "open", label: "A recevoir" },
  { key: "overdue", label: "En retard" },
  { key: "receivable", label: "Non echu" },
  { key: "deposit", label: "Depots" },
  { key: "paid", label: "Payes" },
  { key: "all", label: "Tous" },
];

const SORT_OPTIONS = [
  { key: "due", label: "Echeance", icon: "fa-calendar-day" },
  { key: "recent", label: "Plus recentes", icon: "fa-clock-rotate-left" },
];

const METHOD_OPTIONS = ["Interac", "Cheque", "Carte", "Comptant", "Virement", "Autre"];
// Libelle affiche seulement : la valeur stockee reste "Carte" pour ne pas
// fragmenter les rapports par mode avec les paiements deja inscrits.
const METHOD_LABELS = { Carte: "Carte (Moneris)" };
function methodLabel(option) {
  return METHOD_LABELS[option] || option;
}

function money(value) {
  return `${Number(value || 0).toFixed(2)}$`;
}

// Parse defensif: sur iOS Safari, res.json() sur une reponse non-JSON (HTML
// d'erreur, corps vide) leve "The string did not match the expected pattern."
// qui finissait affiche tel quel a l'utilisateur.
async function readJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Reponse invalide du serveur (${res.status})`);
  }
}

function dateInput(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function dateLabel(value) {
  if (!value) return "-";
  // Ancre a midi (lib/date-only) : un champ @db.Date minuit UTC ne recule
  // plus d'un jour en heure de Montreal.
  return formatDateOnly(value, { day: "2-digit", month: "short", year: "numeric" }) || "-";
}

function stateMeta(payment) {
  if (payment.paymentState === "paid") {
    return { label: "Paye", className: "bg-emerald-500/15 text-emerald-300", icon: "fa-check-circle" };
  }
  if (payment.paymentState === "deposit") {
    if ((payment.paymentsTotal || 0) > 0) {
      return { label: "Depot recu (avant facture)", className: "bg-cyan-500/15 text-cyan-300", icon: "fa-coins" };
    }
    const pct = payment.quoteDepositPercent ? ` ${payment.quoteDepositPercent}%` : "";
    return { label: `Depot${pct} a recevoir`, className: "bg-amber-500/15 text-amber-300", icon: "fa-coins" };
  }
  if (payment.hasPartialPayments) {
    return { label: "Depot recu", className: "bg-cyan-500/15 text-cyan-300", icon: "fa-coins" };
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

function newClientKey() {
  try {
    return crypto.randomUUID();
  } catch {
    return `pk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function PaymentRow({ payment, saving, onPatch }) {
  const [dueDate, setDueDate] = useState(dateInput(payment.paymentDueAt));
  const [method, setMethod] = useState(payment.paymentMethod || "Interac");
  const [paymentDate, setPaymentDate] = useState(todayDateInput());
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [reference, setReference] = useState("");
  // Cle d'idempotence : identique pour tous les clics d'une meme saisie, le
  // serveur n'inscrit le paiement qu'une fois. Regeneree apres chaque succes.
  const [clientKey, setClientKey] = useState(newClientKey);
  const [showDepositEmailModal, setShowDepositEmailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const meta = stateMeta(payment);
  const dirty = dueDate !== dateInput(payment.paymentDueAt);
  const balance = Number(payment.balanceDue ?? payment.total ?? 0);
  const payments = payment.payments || [];
  const creditNotes = payment.creditNotes || [];
  const clientEmail = payment.client?.email || "";
  const isDeposit = payment.paymentState === "deposit";

  async function saveDetails() {
    await onPatch(payment.id, {
      paymentDueAt: dueDate || null,
    });
  }

  function depositPayload(sendEmail) {
    return {
      action: "add-payment",
      amount: depositAmount,
      paidAt: paymentDate || null,
      paymentMethod: method || "Interac",
      reference: reference.trim() || null,
      paymentNotes: paymentNote || null,
      clientKey,
      sendEmail,
      to: sendEmail ? clientEmail : undefined,
    };
  }

  async function saveDeposit(sendEmail) {
    const data = await onPatch(payment.id, depositPayload(sendEmail));
    if (!data) return;
    setDepositAmount("");
    setPaymentNote("");
    setReference("");
    setClientKey(newClientKey());
    setShowDepositEmailModal(false);
  }

  async function addDeposit() {
    if (!clientEmail) {
      if (!confirm("Aucun email client. Inscrire le depot sans envoyer de facture?")) return;
      await saveDeposit(false);
      return;
    }
    setShowDepositEmailModal(true);
  }

  async function markPaid() {
    const data = await onPatch(payment.id, {
      action: "mark-paid",
      paidAt: paymentDate || null,
      paymentMethod: method || "Interac",
      reference: reference.trim() || null,
      paymentNotes: paymentNote || null,
      clientKey,
      sendEmail: true,
    });
    if (!data) return;
    setPaymentNote("");
    setReference("");
    setClientKey(newClientKey());
  }

  async function resendPaidEmail() {
    if (!payment.client?.email) return;
    if (!confirm(`Renvoyer la facture payee a ${payment.client.email}?`)) return;
    await onPatch(payment.id, {
      action: "resend-paid-email",
      to: payment.client.email,
    });
  }

  async function sendPaymentEmail(paymentEntry) {
    if (!clientEmail) {
      alert("Email client manquant.");
      return;
    }
    if (!confirm(`Envoyer la facture avec ce paiement de ${money(paymentEntry.amount)} a ${clientEmail}?`)) return;
    await onPatch(payment.id, {
      action: "send-payment-email",
      paymentId: paymentEntry.id,
      to: clientEmail,
    });
  }

  async function markOpen() {
    if (!confirm(`Remettre ${payment.number} a recevoir et retirer les paiements inscrits?`)) return;
    await onPatch(payment.id, { action: "mark-open", statut: payment.invoiceSentAt ? "sent" : "invoiced" });
  }

  async function deletePayment(paymentEntry) {
    if (!confirm(`Retirer ce paiement de ${money(paymentEntry.amount)}?`)) return;
    await onPatch(payment.id, { action: "delete-payment", paymentId: paymentEntry.id, statut: payment.invoiceSentAt ? "sent" : "invoiced" });
  }

  return (
    <tr className="border-b admin-border align-top">
      <td className="px-4 py-4">
        <Link href={`/admin/bons/nouveau?edit=${payment.id}`} className="admin-text font-mono text-xs font-bold hover:underline">
          {payment.number}
        </Link>
        {isDeposit ? (
          <p className="admin-text-muted mt-1 text-[11px]">{workOrderStatusLabel(payment.statut)} - {dateLabel(payment.date)}</p>
        ) : (
          <p className="admin-text-muted mt-1 text-[11px]">Facture: {dateLabel(payment.invoiceIssuedAt || payment.date)}</p>
        )}
        <a
          href={`/api/admin/work-orders/${payment.id}/pdf${isDeposit ? "" : "?documentType=invoice"}`}
          target="_blank"
          rel="noreferrer"
          className="admin-text-muted mt-2 inline-flex items-center gap-1 text-[11px] hover:underline"
        >
          <i className="fas fa-file-pdf"></i>PDF
        </a>
      </td>
      <td className="px-4 py-4">
        <p className="admin-text font-semibold">{payment.client?.name || "Client"}</p>
        <p className="admin-text-muted text-xs">{payment.client?.phone || payment.client?.secondaryPhone || payment.client?.email || "-"}</p>
        {payment.client?.company ? <p className="admin-text-muted text-[11px]">{payment.client.company}</p> : null}
      </td>
      <td className="px-4 py-4">
        {isDeposit ? null : (
          <>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="admin-input w-36 rounded-lg border px-3 py-2 text-xs"
            />
            <p className="admin-text-muted mt-1 text-[11px]">Net {payment.paymentTermsDays || 30} j.</p>
          </>
        )}
        <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${meta.className}`}>
          <i className={`fas ${meta.icon}`}></i>{meta.label}
        </span>
        {payment.invoiceSentAt ? <p className="admin-text-muted mt-1 text-[11px]">Envoyee {dateLabel(payment.invoiceSentAt)}</p> : null}
        {!isDeposit && dirty ? (
          <button
            type="button"
            disabled={saving}
            onClick={saveDetails}
            className="mt-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
          >
            Sauver echeance
          </button>
        ) : null}
      </td>
      <td className="px-4 py-4 text-right">
        <p className="admin-text text-base font-extrabold">{money(balance)}</p>
        <p className="admin-text-muted text-[11px]">Solde a payer</p>
        <div className="mt-2 space-y-0.5 text-[11px]">
          <p className="admin-text-muted">Total: <span className="admin-text">{money(payment.total)}</span></p>
          <p className="admin-text-muted">Recu: <span className="text-emerald-300">{money(payment.paymentsTotal)}</span></p>
        </div>
      </td>
      <td className="px-4 py-4">
        {payments.length > 0 ? (
          <div className="mb-3 space-y-1">
            {payments.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border admin-border px-2 py-1.5 text-[11px]">
                <div className="min-w-0">
                  <p className="admin-text font-bold">
                    {money(entry.amount)} <span className="admin-text-muted font-normal">{entry.method || ""}{entry.reference ? ` #${entry.reference}` : ""}</span>
                  </p>
                  <p className="admin-text-muted truncate">Paiement recu - {dateLabel(entry.paidAt)}{entry.note ? ` - ${entry.note}` : ""}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={`/api/admin/work-orders/${payment.id}/pdf?documentType=invoice&paymentId=${entry.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-cyan-300 admin-hover"
                    title="PDF de la facture avec ce depot"
                  >
                    <i className="fas fa-file-pdf"></i>
                    <span>PDF</span>
                  </a>
                  <button
                    type="button"
                    disabled={saving || !clientEmail}
                    onClick={() => sendPaymentEmail(entry)}
                    className="rounded-md px-2 py-1 text-emerald-300 admin-hover disabled:opacity-50"
                    title={clientEmail ? `Envoyer a ${clientEmail}` : "Email client manquant"}
                    aria-label="Envoyer la facture de ce paiement"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                  {payment.paymentState !== "paid" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deletePayment(entry)}
                      className="rounded-md px-2 py-1 text-red-300 admin-hover disabled:opacity-50"
                      title="Retirer le paiement"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {creditNotes.length > 0 ? (
          <div className="mb-3 space-y-1">
            {creditNotes.map((note) => (
              <div key={note.id} className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-[11px] ${note.isRefund ? "border-amber-500/40 bg-amber-500/5" : "border-teal-500/40 bg-teal-500/5"}`}>
                <div className="min-w-0">
                  <p className={`font-bold ${note.isRefund ? "text-amber-300" : "text-teal-300"}`}>
                    -{money(note.total)} <span className="font-normal">{note.isRefund ? `Rembourse (${note.refundMethod}${note.refundRef ? ` #${note.refundRef}` : ""})` : "Note de credit"}</span>
                  </p>
                  <p className="admin-text-muted truncate">{note.number} - {dateLabel(note.issuedAt)}</p>
                </div>
                <a
                  href={`/api/admin/credit-notes/${note.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-cyan-300 admin-hover"
                  title="PDF de la note de credit"
                >
                  <i className="fas fa-file-pdf"></i>
                  <span>PDF</span>
                </a>
              </div>
            ))}
          </div>
        ) : null}
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className="admin-input w-36 rounded-lg border px-3 py-2 text-xs"
        >
          {METHOD_OPTIONS.map((option) => <option key={option} value={option}>{methodLabel(option)}</option>)}
        </select>
        <input
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
          className="admin-input ml-2 w-36 rounded-lg border px-3 py-2 text-xs"
        />
        <div className="mt-2">
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder={method === "Carte" ? "N° confirmation Moneris" : "N° confirmation Moneris (optionnel)"}
            className="admin-input w-[296px] rounded-lg border px-3 py-2 text-xs"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            placeholder="Montant depot"
            className="admin-input w-32 rounded-lg border px-3 py-2 text-xs"
          />
          <input
            value={paymentNote}
            onChange={(event) => setPaymentNote(event.target.value)}
            placeholder="Note"
            className="admin-input w-44 rounded-lg border px-3 py-2 text-xs"
          />
          <button
            type="button"
            disabled={saving || !depositAmount}
            onClick={addDeposit}
            className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
          >
            <i className="fas fa-plus mr-1"></i>Depot
          </button>
        </div>
        {showDepositEmailModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="admin-modal-card w-full max-w-md rounded-xl border p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div>
                  <h2 className="admin-text text-base font-extrabold">Envoyer la facture mise a jour?</h2>
                  <p className="admin-text-muted mt-1 text-sm">
                    Le depot sera inscrit, puis le PDF de facture avec le paiement recu sera genere.
                  </p>
                </div>
              </div>
              <div className="mb-4 rounded-lg border admin-border p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="admin-text-muted">Facture</span>
                  <span className="admin-text font-mono font-bold">{payment.number}</span>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="admin-text-muted">Depot</span>
                  <span className="admin-text font-bold">{money(String(depositAmount).replace(",", "."))}</span>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="admin-text-muted">Email</span>
                  <span className="admin-text max-w-[240px] truncate font-bold" title={clientEmail}>{clientEmail}</span>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowDepositEmailModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-bold admin-text-muted admin-hover disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveDeposit(false)}
                  className="rounded-lg border admin-border px-4 py-2 text-sm font-bold admin-text transition-colors hover:bg-white/5 disabled:opacity-50"
                >
                  Non, inscrire seulement
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveDeposit(true)}
                  className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane mr-2"></i>Oui, envoyer le PDF
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex flex-col items-end gap-2">
          {payment.paymentState === "paid" ? (
            <>
              <span className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300">
                <i className="fas fa-check mr-1"></i>Payee
              </span>
              <button
                type="button"
                disabled={saving || !payment.client?.email}
                onClick={resendPaidEmail}
                className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/10 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <i className="fas fa-paper-plane mr-1"></i>Renvoyer
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={markOpen}
                className="rounded-lg px-3 py-2 text-xs font-bold text-amber-300 admin-hover disabled:opacity-50"
              >
                Reouvrir
              </button>
            </>
          ) : isDeposit ? (
            <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-[11px] font-bold text-cyan-300">
              <i className="fas fa-coins mr-1"></i>Avant facturation
            </span>
          ) : (
            <button
              type="button"
              disabled={saving || balance <= 0}
              onClick={markPaid}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              <i className="fas fa-paper-plane mr-1"></i>Paye + envoyer
            </button>
          )}
          {(payment.paymentsTotal || 0) > 0 ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowRefundModal(true)}
              className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
            >
              <i className="fas fa-rotate-left mr-1"></i>Rembourser / Avoir
            </button>
          ) : null}
          {payment.client?.email ? (
            <p className="admin-text-muted max-w-[150px] truncate text-[11px]" title={payment.client.email}>{payment.client.email}</p>
          ) : (
            <p className="text-red-300 text-[11px]">Email manquant</p>
          )}
        </div>
        {showRefundModal ? (
          <RefundModal
            payment={payment}
            saving={saving}
            onClose={() => setShowRefundModal(false)}
            onSubmit={async (payload) => {
              const data = await onPatch(payment.id, payload);
              if (data) setShowRefundModal(false);
            }}
          />
        ) : null}
      </td>
    </tr>
  );
}

function RefundModal({ payment, saving, onClose, onSubmit }) {
  const [creditType, setCreditType] = useState("refund");
  const [amount, setAmount] = useState(String(payment.paymentsTotal || ""));
  const [refundMethod, setRefundMethod] = useState(payment.paymentMethod || "Carte");
  const [refundRef, setRefundRef] = useState("");
  const [reason, setReason] = useState("");
  const isRefund = creditType === "refund";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 text-left">
      <div className="admin-modal-card w-full max-w-md rounded-xl border p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
            <i className="fas fa-rotate-left"></i>
          </div>
          <div>
            <h2 className="admin-text text-base font-extrabold">Rembourser ou crediter {payment.number}</h2>
            <p className="admin-text-muted mt-1 text-sm">
              Encaisse sur cette facture : <span className="admin-text font-bold">{money(payment.paymentsTotal)}</span>
            </p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCreditType("refund")}
            className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${isRefund ? "border-amber-400 bg-amber-500/15 text-amber-200" : "admin-border admin-text-muted admin-hover"}`}
          >
            Remboursement
            <span className="block text-[10px] font-normal opacity-70">argent rendu au client</span>
          </button>
          <button
            type="button"
            onClick={() => setCreditType("credit")}
            className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${!isRefund ? "border-teal-400 bg-teal-500/15 text-teal-200" : "admin-border admin-text-muted admin-hover"}`}
          >
            Note de credit
            <span className="block text-[10px] font-normal opacity-70">argent garde en credit</span>
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="admin-text-muted mb-1 block text-[11px] font-bold uppercase">Montant</label>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Montant"
            />
          </div>
          {isRefund ? (
            <>
              <div>
                <label className="admin-text-muted mb-1 block text-[11px] font-bold uppercase">Rembourse par</label>
                <select
                  value={refundMethod}
                  onChange={(event) => setRefundMethod(event.target.value)}
                  className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {METHOD_OPTIONS.map((option) => <option key={option} value={option}>{methodLabel(option)}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-text-muted mb-1 block text-[11px] font-bold uppercase">
                  N° confirmation Moneris {refundMethod === "Carte" ? "" : "(optionnel)"}
                </label>
                <input
                  value={refundRef}
                  onChange={(event) => setRefundRef(event.target.value)}
                  className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="ex. 660123456789"
                />
              </div>
            </>
          ) : null}
          <div>
            <label className="admin-text-muted mb-1 block text-[11px] font-bold uppercase">Raison (optionnel)</label>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="ex. Piece non installee"
            />
          </div>
        </div>

        <p className="admin-text-muted mt-3 text-[11px] leading-snug">
          {isRefund
            ? "Un recu de remboursement (PDF) sera cree; l'argent est considere sorti du compte."
            : "Une note de credit (PDF) sera creee; aucun argent rendu."}
          {" "}La facture d'origine reste intacte pour la comptable.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-bold admin-text-muted admin-hover disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving || !amount}
            onClick={() => onSubmit({
              action: "create-credit-note",
              creditType,
              amount,
              refundMethod: isRefund ? refundMethod : null,
              refundRef: isRefund ? refundRef.trim() || null : null,
              reason: reason.trim() || null,
            })}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50 ${isRefund ? "bg-amber-700 hover:bg-amber-600" : "bg-teal-700 hover:bg-teal-600"}`}
          >
            {isRefund ? "Confirmer le remboursement" : "Creer la note de credit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("open");
  const [sort, setSort] = useState("due");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ status: filter, sort, limit: "500" });
    if (query.trim()) params.set("q", query.trim());
    return params.toString();
  }, [filter, query, sort]);

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?${queryString}`, { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = `/admin/login?callbackUrl=${encodeURIComponent("/admin/paiements")}`;
        return;
      }
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || `Erreur paiements (${res.status})`);
      setPayments(data.payments || []);
      setSummary(data.summary || null);
      setLoadError("");
    } catch (err) {
      console.error("Chargement paiements:", err);
      setLoadError("Impossible de charger les paiements. Verifie ta connexion puis reessaie.");
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
      if (res.status === 401) {
        window.location.href = `/admin/login?callbackUrl=${encodeURIComponent("/admin/paiements")}`;
        return null;
      }
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || `Erreur sauvegarde paiement (${res.status})`);
      await load(false);
      if (data.emailError) {
        const prefix = payload.action === "send-payment-email" ? "Le courriel n'a pas ete envoye" : "Paiement enregistre, mais le courriel n'a pas ete envoye";
        alert(`${prefix}: ${data.emailError}`);
      } else if (payload.action === "add-payment" && data.emailSent) {
        alert(`Facture mise a jour envoyee a ${data.emailTo}`);
      } else if (payload.action === "send-payment-email" && data.emailSent) {
        alert(`Facture du paiement envoyee a ${data.emailTo}`);
      } else if ((payload.action === "mark-paid" || payload.action === "resend-paid-email") && data.emailSent) {
        alert(`Facture payee envoyee a ${data.emailTo}`);
      }
      return data;
    } catch (err) {
      console.error("Sauvegarde paiement:", err);
      alert(err instanceof SyntaxError || err.name === "TypeError"
        ? "La sauvegarde n'a pas pu etre confirmee. Verifie ta connexion puis reessaie."
        : err.message);
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
          <div className="flex rounded-lg border admin-border p-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  sort === option.key ? "bg-[var(--color-red)] text-white" : "admin-text-muted admin-hover"
                }`}
              >
                <i className={`fas ${option.icon}`}></i>
                {option.label}
              </button>
            ))}
          </div>
          <button onClick={() => load()} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600">
            <i className="fas fa-rotate mr-2"></i>Rafraichir
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span><i className="fas fa-triangle-exclamation mr-2"></i>{loadError}</span>
          <button onClick={() => load()} className="whitespace-nowrap rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30">
            Reessayer
          </button>
        </div>
      ) : null}

      <div className={`mb-6 grid grid-cols-1 gap-4 ${summary?.depositCount ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4"}`}>
        <SummaryTile icon="fa-file-invoice-dollar" label="A recevoir" value={money(summary?.openTotal)} detail={`${summary?.openCount || 0} facture(s)`} />
        <SummaryTile icon="fa-exclamation-triangle" label="En retard" value={money(summary?.overdueTotal)} detail={`${summary?.overdueCount || 0} facture(s)`} tone="red" />
        <SummaryTile icon="fa-clock" label="Non echu" value={money(summary?.receivableTotal)} detail={`${summary?.receivableCount || 0} facture(s)`} />
        {summary?.depositCount ? (
          <SummaryTile icon="fa-coins" label="Depots recus" value={money(summary?.depositTotal)} detail={`${summary?.depositCount || 0} dossier(s) avant facture`} />
        ) : null}
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
          <table className="w-full min-w-[1280px] text-sm">
            <thead>
              <tr className="border-b admin-border text-left text-xs admin-text-muted">
                <th className="px-4 py-3">Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Echeance / etat</th>
                <th className="px-4 py-3 text-right">Solde</th>
                <th className="px-4 py-3">Paiements</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <PaymentRow
                  key={`${payment.id}:${payment.paymentDueAt || ""}:${payment.paymentState || ""}:${payment.paymentsTotal || 0}:${payment.balanceDue || 0}`}
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
