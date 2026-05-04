export const FOLLOW_UP_COLUMNS_SETTINGS_KEY = "admin_follow_up_columns";

export const FOLLOW_UP_TERMINAL_SET = new Set(["lost", "completed", "archived"]);

export const DEFAULT_FOLLOW_UP_COLUMNS = [
  { key: "to_call", label: "A appeler", icon: "fa-phone", tone: "sky", visible: true, locked: true },
  { key: "called", label: "Appel fait", icon: "fa-headset", tone: "blue", visible: true, locked: true },
  { key: "estimate_sent", label: "Estime envoye", icon: "fa-file-invoice-dollar", tone: "amber", visible: true, locked: true },
  { key: "won", label: "Accepte", icon: "fa-check", tone: "emerald", visible: true, locked: true },
  { key: "scheduled", label: "Job planifie", icon: "fa-calendar-check", tone: "violet", visible: true, locked: true },
  { key: "completed", label: "Job fait", icon: "fa-flag-checkered", tone: "teal", visible: true, locked: true },
  { key: "lost", label: "Perdu / refuse", icon: "fa-ban", tone: "slate", visible: true, locked: true },
];

export const FOLLOW_UP_TONES = {
  sky: {
    label: "Bleu pale",
    badge: "bg-sky-500/15 text-sky-300",
    soft: "bg-sky-500/10 text-sky-300",
    ring: "ring-sky-400/25",
    border: "border-sky-400/30",
    button: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  blue: {
    label: "Bleu",
    badge: "bg-blue-500/15 text-blue-300",
    soft: "bg-blue-500/10 text-blue-300",
    ring: "ring-blue-400/25",
    border: "border-blue-400/30",
    button: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  amber: {
    label: "Ambre",
    badge: "bg-amber-500/15 text-amber-300",
    soft: "bg-amber-500/10 text-amber-300",
    ring: "ring-amber-400/25",
    border: "border-amber-400/30",
    button: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  emerald: {
    label: "Vert",
    badge: "bg-emerald-500/15 text-emerald-300",
    soft: "bg-emerald-500/10 text-emerald-300",
    ring: "ring-emerald-400/25",
    border: "border-emerald-400/30",
    button: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  violet: {
    label: "Violet",
    badge: "bg-violet-500/15 text-violet-300",
    soft: "bg-violet-500/10 text-violet-300",
    ring: "ring-violet-400/25",
    border: "border-violet-400/30",
    button: "bg-violet-600 hover:bg-violet-500 text-white",
  },
  teal: {
    label: "Sarcelle",
    badge: "bg-teal-500/15 text-teal-300",
    soft: "bg-teal-500/10 text-teal-300",
    ring: "ring-teal-400/25",
    border: "border-teal-400/30",
    button: "bg-teal-600 hover:bg-teal-500 text-white",
  },
  slate: {
    label: "Gris",
    badge: "bg-slate-500/15 text-slate-300",
    soft: "bg-slate-500/10 text-slate-300",
    ring: "ring-slate-400/25",
    border: "border-slate-400/30",
    button: "bg-slate-600 hover:bg-slate-500 text-white",
  },
};

export const FOLLOW_UP_ICON_OPTIONS = [
  "fa-list-check",
  "fa-phone",
  "fa-headset",
  "fa-file-invoice-dollar",
  "fa-check",
  "fa-calendar-check",
  "fa-flag-checkered",
  "fa-ban",
  "fa-comments",
  "fa-clipboard-list",
  "fa-hourglass-half",
  "fa-archive",
];

export function followUpSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
}

export function normalizeFollowUpColumns(columns) {
  if (!Array.isArray(columns)) return DEFAULT_FOLLOW_UP_COLUMNS;
  const byKey = new Map(DEFAULT_FOLLOW_UP_COLUMNS.map((c) => [c.key, c]));
  const normalized = [];

  for (const col of columns) {
    if (!col?.key) continue;
    const base = byKey.get(col.key) || {};
    normalized.push({
      key: followUpSlug(col.key),
      label: String(col.label || base.label || col.key).slice(0, 40),
      icon: FOLLOW_UP_ICON_OPTIONS.includes(col.icon) ? col.icon : (base.icon || "fa-list-check"),
      tone: FOLLOW_UP_TONES[col.tone] ? col.tone : (base.tone || "blue"),
      visible: col.visible !== false,
      locked: Boolean(base.locked || col.locked),
    });
    byKey.delete(col.key);
  }

  for (const col of byKey.values()) normalized.push(col);
  return normalized.length ? normalized : DEFAULT_FOLLOW_UP_COLUMNS;
}

export function followUpColumnMeta(columns, key) {
  return columns.find((c) => c.key === key) || { key, label: key, icon: "fa-list-check", tone: "slate", visible: true };
}

export function followUpToneClasses(tone) {
  return FOLLOW_UP_TONES[tone] || FOLLOW_UP_TONES.slate;
}

function columnSearchText(column = {}) {
  return followUpSlug([column.key, column.label].filter(Boolean).join(" "));
}

export function isAcceptedFollowUpStatus(columns, status) {
  if (status === "won") return true;
  const text = columnSearchText(followUpColumnMeta(columns, status));
  return text.includes("accept") || text.includes("gagne") || text.includes("pris");
}

export function isLostFollowUpColumn(column) {
  const text = columnSearchText(column);
  return column.key === "lost" || text.includes("perdu") || text.includes("refus") || text.includes("lost");
}

export function isLostFollowUpStatus(columns, status) {
  return isLostFollowUpColumn(followUpColumnMeta(columns, status));
}

export function followUpStatusFromWorkOrderStatut(statut) {
  if (statut === "scheduled" || statut === "in_progress") return "scheduled";
  if (statut === "completed" || statut === "invoiced" || statut === "sent" || statut === "paid") return "completed";
  if (statut === "draft") return "won";
  return "to_call";
}
