// Heures d'ouverture — SOURCE UNIQUE pour tout le site (JSON-LD, pages, API, MCP).
// Les valeurs vivent dans COMPANY_INFO (hoursWeekdays/hoursSaturday/hoursSunday),
// éditables via /admin/parametres puis « Propager sur le site ».
// Format d'une plage: "HH:MM-HH:MM" ; chaîne vide = fermé.
//
// Avant cette centralisation, les heures étaient codées en dur à 9 endroits et
// avaient divergé (le JSON-LD de /contact disait « Mar-Ven 10h-17h » pendant que
// le footer disait « Lun-Ven 8h-17h » et que l'API disait « samedi fermé »).

import { COMPANY_INFO } from "./company-info";

function parseRange(range) {
  const m = String(range || "").trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const pad = (h) => String(h).padStart(2, "0");
  return { opens: `${pad(m[1])}:${m[2]}`, closes: `${pad(m[3])}:${m[4]}` };
}

function getRanges(src = COMPANY_INFO) {
  return {
    weekdays: parseRange(src.hoursWeekdays),
    saturday: parseRange(src.hoursSaturday),
    sunday: parseRange(src.hoursSunday),
  };
}

// Pour les JSON-LD schema.org (LocalBusiness / ContactPage).
export function openingHoursSpecification(src) {
  const r = getRanges(src);
  const out = [];
  if (r.weekdays) {
    out.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: r.weekdays.opens,
      closes: r.weekdays.closes,
    });
  }
  if (r.saturday) {
    out.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: r.saturday.opens,
      closes: r.saturday.closes,
    });
  }
  if (r.sunday) {
    out.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: r.sunday.opens,
      closes: r.sunday.closes,
    });
  }
  return out;
}

function fmtFr(t) {
  const [h, m] = t.split(":");
  return m === "00" ? `${parseInt(h, 10)}h` : `${parseInt(h, 10)}h${m}`;
}

// Affichage humain français, ex.: « Lun-Ven 8h-17h • Sam 9h-13h ».
export function hoursDisplayFr(src) {
  const r = getRanges(src);
  const parts = [];
  if (r.weekdays) parts.push(`Lun-Ven ${fmtFr(r.weekdays.opens)}-${fmtFr(r.weekdays.closes)}`);
  if (r.saturday) parts.push(`Sam ${fmtFr(r.saturday.opens)}-${fmtFr(r.saturday.closes)}`);
  if (r.sunday) parts.push(`Dim ${fmtFr(r.sunday.opens)}-${fmtFr(r.sunday.closes)}`);
  return parts.join(" • ") || "Sur rendez-vous";
}

// Affichage humain anglais, ex.: « Mon-Fri 8am-5pm • Sat 9am-1pm ».
function fmtEn(t) {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}
export function hoursDisplayEn(src) {
  const r = getRanges(src);
  const parts = [];
  if (r.weekdays) parts.push(`Mon-Fri ${fmtEn(r.weekdays.opens)}-${fmtEn(r.weekdays.closes)}`);
  if (r.saturday) parts.push(`Sat ${fmtEn(r.saturday.opens)}-${fmtEn(r.saturday.closes)}`);
  if (r.sunday) parts.push(`Sun ${fmtEn(r.sunday.opens)}-${fmtEn(r.sunday.closes)}`);
  return parts.join(" • ") || "By appointment";
}

// Pour l'API publique /api/public/services.
export function hoursForApi() {
  return {
    weekdays: COMPANY_INFO.hoursWeekdays || "closed",
    saturday: COMPANY_INFO.hoursSaturday || "closed",
    sunday: COMPANY_INFO.hoursSunday || "closed",
  };
}
