import { parseDateOnly } from "@/lib/date-only";

export const PAYMENT_TRACKED_STATUSES = new Set(["invoiced", "sent", "paid"]);
export const PAYMENT_OPEN_STATUSES = new Set(["invoiced", "sent"]);

export function isPaymentTrackedStatus(statut) {
  return PAYMENT_TRACKED_STATUSES.has(String(statut || ""));
}

export function isOpenPaymentStatus(statut) {
  return PAYMENT_OPEN_STATUSES.has(String(statut || ""));
}

export function normalizePaymentTermsDays(value) {
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : 30;
}

export function validDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(dateLike, days) {
  const base = validDate(dateLike) || new Date();
  const date = new Date(base);
  date.setDate(date.getDate() + normalizePaymentTermsDays(days));
  return date;
}

export function getInvoiceIssueDate(workOrder) {
  return (
    validDate(workOrder?.invoiceIssuedAt) ||
    validDate(workOrder?.date) ||
    validDate(workOrder?.createdAt) ||
    null
  );
}

export function getPaymentDueDate(workOrder, termsDays) {
  const stored = validDate(workOrder?.paymentDueAt);
  if (stored) return stored;
  const issuedAt = getInvoiceIssueDate(workOrder);
  if (!issuedAt) return null;
  return addDays(issuedAt, termsDays ?? workOrder?.client?.paymentTermsDays);
}

export function paymentDateOnlyTime(value) {
  const date = validDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getPaymentState(workOrder, now = new Date()) {
  if (workOrder?.statut === "paid" || workOrder?.paidAt) return "paid";
  if (!isOpenPaymentStatus(workOrder?.statut)) return "not_invoice";
  const due = paymentDateOnlyTime(getPaymentDueDate(workOrder));
  const today = paymentDateOnlyTime(now);
  if (due !== null && today !== null && due < today) return "overdue";
  return "receivable";
}

export function daysBetweenDateOnly(from, to) {
  const fromTime = paymentDateOnlyTime(from);
  const toTime = paymentDateOnlyTime(to);
  if (fromTime === null || toTime === null) return null;
  return Math.round((toTime - fromTime) / 86400000);
}

export function buildPaymentTrackingData({ statut, existing, client, invoiceDate, now = new Date() } = {}) {
  if (!isPaymentTrackedStatus(statut)) {
    if (existing?.statut === "paid") return { paidAt: null };
    return {};
  }

  const termsDays = normalizePaymentTermsDays(client?.paymentTermsDays ?? existing?.client?.paymentTermsDays);
  const issuedAt = validDate(existing?.invoiceIssuedAt) || validDate(invoiceDate) || validDate(existing?.date) || now;
  const data = {};

  if (!validDate(existing?.invoiceIssuedAt)) data.invoiceIssuedAt = issuedAt;
  if (!validDate(existing?.paymentDueAt)) data.paymentDueAt = addDays(issuedAt, termsDays);
  if (statut === "sent" && !validDate(existing?.invoiceSentAt)) data.invoiceSentAt = now;

  if (statut === "paid") {
    if (!validDate(existing?.paidAt)) data.paidAt = now;
    if (!validDate(existing?.invoiceSentAt)) data.invoiceSentAt = now;
  } else if (existing?.statut === "paid") {
    data.paidAt = null;
  }

  return data;
}

export function parsePaymentDateInput(value, fallback = null) {
  if (value === null || value === "") return null;
  if (value === undefined) return fallback;
  return parseDateOnly(value, fallback || new Date());
}

export function serializePaymentWorkOrder(workOrder, now = new Date()) {
  const termsDays = normalizePaymentTermsDays(workOrder?.client?.paymentTermsDays);
  const invoiceIssuedAt = getInvoiceIssueDate(workOrder);
  const paymentDueAt = getPaymentDueDate(workOrder, termsDays);
  const state = getPaymentState({ ...workOrder, paymentDueAt }, now);
  const daysDelta = paymentDueAt ? daysBetweenDateOnly(now, paymentDueAt) : null;

  return {
    ...workOrder,
    totalPieces: Number(workOrder.totalPieces || 0),
    totalLabor: Number(workOrder.totalLabor || 0),
    laborRate: Number(workOrder.laborRate || 0),
    subtotal: Number(workOrder.subtotal || 0),
    tps: Number(workOrder.tps || 0),
    tvq: Number(workOrder.tvq || 0),
    total: Number(workOrder.total || 0),
    invoiceIssuedAt: invoiceIssuedAt?.toISOString() || null,
    invoiceSentAt: validDate(workOrder.invoiceSentAt)?.toISOString() || null,
    paymentDueAt: paymentDueAt?.toISOString() || null,
    paidAt: validDate(workOrder.paidAt)?.toISOString() || null,
    paymentTermsDays: termsDays,
    paymentState: state,
    daysLate: state === "overdue" && daysDelta !== null ? Math.abs(daysDelta) : 0,
    daysUntilDue: state === "receivable" ? daysDelta : null,
  };
}
