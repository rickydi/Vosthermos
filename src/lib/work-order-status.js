export const WORK_ORDER_STATUS_OPTIONS = [
  { key: "draft", label: "Brouillon", colorClass: "bg-yellow-500/20 text-yellow-400" },
  { key: "scheduled", label: "Job planifie", colorClass: "bg-blue-500/20 text-blue-400" },
  { key: "in_progress", label: "En cours", colorClass: "bg-purple-500/20 text-purple-400" },
  { key: "completed", label: "Job fait", colorClass: "bg-green-500/20 text-green-400" },
  { key: "invoiced", label: "Facture", colorClass: "bg-orange-500/20 text-orange-400" },
  { key: "sent", label: "Envoye", colorClass: "bg-blue-500/20 text-blue-400" },
  { key: "paid", label: "Paye", colorClass: "bg-emerald-500/20 text-emerald-400" },
];

export const WORK_ORDER_STATUS_META = Object.fromEntries(
  WORK_ORDER_STATUS_OPTIONS.map((status) => [status.key, status])
);

export const WORK_ORDER_LIST_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "draft", label: "Brouillons" },
  { key: "scheduled", label: "Jobs planifies" },
  { key: "completed", label: "Jobs faits" },
  { key: "invoiced", label: "A payer" },
  { key: "sent", label: "Envoyes" },
  { key: "paid", label: "Payes" },
];

export function workOrderStatusLabel(status) {
  return WORK_ORDER_STATUS_META[status]?.label || status || "-";
}

export function workOrderStatusClass(status) {
  return WORK_ORDER_STATUS_META[status]?.colorClass || "bg-slate-500/20 text-slate-300";
}
