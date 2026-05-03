const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})/;

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function todayDateInput() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function dateOnlyString(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value);
  const match = raw.match(DATE_ONLY_RE);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(value, fallback = new Date()) {
  const datePart = dateOnlyString(value);
  if (!datePart) return fallback;

  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function dateOnlyForDisplay(value) {
  const datePart = dateOnlyString(value);
  if (!datePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDateOnly(value, options) {
  const date = dateOnlyForDisplay(value);
  if (!date) return "";
  return date.toLocaleDateString("fr-CA", options);
}
