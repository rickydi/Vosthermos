export const DOCUMENT_COMPANY_DEFAULTS = {
  legal: "Vosthermos - Reparation et remplacement de fenetres",
  address: "61, rue de Bretagne",
  city: "Delson",
  province: "QC",
  postalCode: "",
  phone: "",
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  rbq: "5752-5248-01",
  tps: "78456 5319 RT0001",
  tvq: "1225188897 TQ0001",
  interac: "info@vosthermos.com",
};

export const TPS_RATE = 0.05;
export const TVQ_RATE = 0.09975;

export function sanitizeDocumentPrefix(prefix) {
  const value = String(prefix || "").trim();
  if (!value || value.toUpperCase() === "VOT") return "VOS";
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned || "VOS";
}

export function buildDocumentNumber(dateLike = new Date(), prefix = "VOS") {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const d = isNaN(date.getTime()) ? new Date() : date;
  const pad = (value) => String(value).padStart(2, "0");
  return [
    sanitizeDocumentPrefix(prefix),
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    pad(d.getHours()),
    pad(d.getMinutes()),
  ].join("");
}

export function resolveDocumentNumber(wo, prefix = "VOS") {
  const current = String(wo?.number || "").trim();
  if (/^[A-Za-z]{3}\d{12}$/.test(current)) return current;
  return buildDocumentNumber(wo?.createdAt || wo?.date || new Date(), prefix);
}

export function formatMoneyCad(value) {
  const number = Number(value || 0);
  const sign = number < 0 ? "-" : "";
  const [whole, decimals] = Math.abs(number).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped},${decimals} $`;
}

export function formatQuantity(value) {
  const number = Number(value || 0);
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatDateFr(dateLike) {
  if (!dateLike) return "";
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(date.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatLongDateFr(dateLike) {
  if (!dateLike) return "";
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function addDays(dateLike, days) {
  const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike || Date.now());
  const valid = isNaN(date.getTime()) ? new Date() : date;
  valid.setDate(valid.getDate() + Number(days || 0));
  return valid;
}

export function getPaymentTermsDays(wo) {
  const terms = Number(wo?.paymentTermsDays || wo?.client?.paymentTermsDays);
  return Number.isFinite(terms) && terms > 0 ? terms : 30;
}

function validDocumentDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function getDocumentDate(wo, documentType) {
  const date = documentType === "invoice"
    ? (validDocumentDate(wo?.invoiceIssuedAt) || validDocumentDate(wo?.date))
    : validDocumentDate(wo?.date);
  if (date) return date;
  const fallback = new Date();
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function getDocumentTargetDate(wo, documentType) {
  if (documentType === "invoice") {
    const dueDate = validDocumentDate(wo?.paymentDueAt);
    if (dueDate) return dueDate;
  }

  const base = getDocumentDate(wo, documentType);
  if (documentType === "invoice") return addDays(base, getPaymentTermsDays(wo));
  if (documentType === "quote") return addDays(base, 30);
  return null;
}

export function getProjectType(wo) {
  const clientType = String(wo?.client?.type || "").toLowerCase();
  const projectText = [
    wo?.client?.name,
    wo?.client?.company,
    wo?.description,
  ].filter(Boolean).join(" ");
  if (/(syndicat|condo|copropriete|copropriété)/i.test(projectText)) return "Residentiel - Condo";
  if (clientType === "gestionnaire") return "Commercial - copropriete";
  if (wo?.client?.company) return "Commercial";
  return "Residentiel";
}

export function getClientCityLine(client = {}) {
  return [
    client.city,
    client.province || "QC",
    client.postalCode,
  ].filter(Boolean).join(" ");
}

export function getProjectAddress(wo, multiline = false) {
  const first = wo?.interventionAddress || wo?.client?.address || "";
  const second = [
    wo?.interventionCity || wo?.client?.city,
    wo?.interventionPostalCode || wo?.client?.postalCode,
  ].filter(Boolean).join(", ");
  return [first, second].filter(Boolean).join(multiline ? "\n" : ", ");
}

export function resolveDocumentCompany(settings = {}) {
  const source = settings.company || settings || {};
  return {
    legal: DOCUMENT_COMPANY_DEFAULTS.legal,
    address: DOCUMENT_COMPANY_DEFAULTS.address,
    city: DOCUMENT_COMPANY_DEFAULTS.city,
    province: DOCUMENT_COMPANY_DEFAULTS.province,
    postalCode: DOCUMENT_COMPANY_DEFAULTS.postalCode,
    phone: source.phone || settings.company_phone || DOCUMENT_COMPANY_DEFAULTS.phone,
    email: DOCUMENT_COMPANY_DEFAULTS.email,
    web: source.web || settings.company_web || DOCUMENT_COMPANY_DEFAULTS.web,
    rbq: DOCUMENT_COMPANY_DEFAULTS.rbq,
    tps: DOCUMENT_COMPANY_DEFAULTS.tps,
    tvq: DOCUMENT_COMPANY_DEFAULTS.tvq,
    interac: DOCUMENT_COMPANY_DEFAULTS.interac,
  };
}

export function clientLastName(name) {
  const cleaned = String(name || "Client")
    .replace(/\b(mme|madame|m\.|monsieur|mr|mrs|ms|dr)\b\.?/gi, "")
    .replace(/[,;]+/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || "Client";
}

export function safeFileToken(value) {
  return String(value || "Client")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "Client";
}

export function documentFilename(wo, documentMeta) {
  const prefix = documentMeta?.type === "invoice" ? "Facture" : "Soumission";
  const paidSuffix = documentMeta?.type === "invoice" && documentPaymentSummary(wo).isPaid ? "_Payee" : "";
  return `${prefix}_Vosthermos_${safeFileToken(clientLastName(wo?.client?.name))}${paidSuffix}.pdf`;
}

export function documentPayments(wo = {}) {
  const payments = Array.isArray(wo.payments) ? wo.payments : [];
  if (payments.length > 0) {
    return payments
      .map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount || 0),
        method: payment.method || null,
        reference: payment.reference || null,
        note: payment.note || null,
        paidAt: validDocumentDate(payment.paidAt) || validDocumentDate(payment.createdAt) || null,
        createdAt: validDocumentDate(payment.createdAt) || null,
      }))
      .filter((payment) => payment.amount > 0)
      .sort((a, b) => {
        const aTime = a.paidAt?.getTime?.() || 0;
        const bTime = b.paidAt?.getTime?.() || 0;
        return aTime - bTime || Number(a.id || 0) - Number(b.id || 0);
      });
  }

  const paidAt = validDocumentDate(wo.paidAt);
  const total = Number(wo.total || 0);
  if (paidAt && total > 0) {
    return [{
      id: "paid",
      amount: total,
      method: wo.paymentMethod || "Paiement confirme",
      note: wo.paymentNotes || null,
      paidAt,
      createdAt: paidAt,
    }];
  }

  return [];
}

export function documentPaymentSummary(wo = {}) {
  const payments = documentPayments(wo);
  const total = Number(wo.total || 0);
  const paidTotal = Math.round(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) * 100) / 100;
  const rawBalance = Math.round((total - paidTotal) * 100) / 100;
  const statusPaid = wo.statut === "paid" || Boolean(validDocumentDate(wo.paidAt));
  const isPaid = statusPaid || (payments.length > 0 && rawBalance <= 0.005);
  return {
    payments,
    total,
    paidTotal,
    balanceDue: isPaid ? 0 : Math.max(rawBalance, 0),
    isPaid,
    hasPayments: payments.length > 0,
  };
}

export function normalizeQuoteDepositPercent(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(",", "."));
  if (!Number.isFinite(number) || number < 0 || number > 100) return undefined;
  return Math.round(number * 100) / 100;
}

function formatPercentFr(value) {
  const number = Number(value || 0);
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
}

function paymentScheduleLabel(index, count) {
  if (count <= 1) return "paiement complet";
  if (index === 0) return "a l'acceptation de la commande";
  if (index === count - 1) return "a la fin des travaux";
  return `au paiement ${index + 1}`;
}

function cleanPaymentScheduleLabel(value, index, count) {
  const text = String(value || "").replace(/[<>]/g, "").trim();
  return text || paymentScheduleLabel(index, count);
}

export function normalizeQuotePaymentSchedule(value) {
  if (value === null || value === undefined || value === "") return null;
  const rawList = Array.isArray(value) ? value : (Array.isArray(value.payments) ? value.payments : []);
  if (rawList.length === 0) return null;

  const normalized = [];
  for (let index = 0; index < rawList.length; index += 1) {
    const entry = rawList[index];
    const rawPercent = typeof entry === "object" && entry !== null ? entry.percent : entry;
    const percent = normalizeQuoteDepositPercent(rawPercent);
    if (percent === undefined || percent === null || percent <= 0) return undefined;
    normalized.push({
      percent,
      label: cleanPaymentScheduleLabel(entry?.label, index, rawList.length),
    });
  }

  const totalPercent = Math.round(normalized.reduce((sum, payment) => sum + payment.percent, 0) * 100) / 100;
  if (Math.abs(totalPercent - 100) > 0.01) return undefined;
  return normalized;
}

function numberValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function resolveQuoteTotal(wo = {}) {
  const directTotal = numberValue(wo.total);
  if (directTotal > 0) return directTotal;

  const subtotalTotal = numberValue(wo.subtotal) + numberValue(wo.tps) + numberValue(wo.tvq);
  if (subtotalTotal > 0) return subtotalTotal;

  const itemTotal = [
    ...(Array.isArray(wo.items) ? wo.items : []),
    ...(Array.isArray(wo.sections) ? wo.sections.flatMap((section) => section.items || []) : []),
  ].reduce((sum, item) => sum + numberValue(item.totalPrice), 0);
  return itemTotal;
}

export function quotePaymentCondition(wo = {}) {
  const schedule = normalizeQuotePaymentSchedule(wo.quotePaymentSchedule);
  if (schedule && schedule.length > 0) {
    const parts = schedule.map((payment, index) => {
      const label = cleanPaymentScheduleLabel(payment.label, index, schedule.length);
      return `${formatPercentFr(payment.percent)} % ${label}`;
    });
    return `<b>Paiement :</b> ${parts.join(", ")}.`;
  }

  const manualPercent = normalizeQuoteDepositPercent(wo.quoteDepositPercent);
  const total = resolveQuoteTotal(wo);
  const percent = manualPercent && manualPercent > 0 ? manualPercent : (total < 1000 ? 0 : 50);
  const balancePercent = Math.max(0, Math.round((100 - percent) * 100) / 100);

  if (percent <= 0) {
    return "<b>Paiement :</b> Aucun acompte requis; paiement complet a la fin des travaux.";
  }
  if (balancePercent <= 0) {
    return `<b>Paiement :</b> ${formatPercentFr(percent)} % a l'acceptation de la commande.`;
  }
  return `<b>Paiement :</b> ${formatPercentFr(percent)} % a l'acceptation de la commande, ${formatPercentFr(balancePercent)} % a la fin des travaux.`;
}

export function documentConditions(documentType, wo = {}) {
  if (documentType === "invoice") {
    return [
      "<b>Merci :</b> Merci d'avoir choisi Vosthermos pour vos travaux.",
      "<b>Retard :</b> Des interets de 1,5 % par mois peuvent etre appliques sur tout solde en retard.",
      "<b>Questions :</b> Pour toute question concernant cette facture, contactez-nous a info@vosthermos.com.",
      "<b>Paiement Interac :</b> info@vosthermos.com.",
    ];
  }

  if (documentType === "quote") {
    return [
      "<b>Validite :</b> Cette soumission est valide pour une periode de 30 jours a compter de la date d'emission.",
      "<b>Mesures :</b> Les dimensions indiquees sont approximatives. Une prise de mesure precise sera effectuee avant la fabrication. Toute variation significative pourrait entrainer un ajustement du prix.",
      "<b>Delai de fabrication :</b> Environ 2 a 4 semaines suivant l'acceptation de la soumission et la prise de mesures finales, selon le calendrier du fabricant.",
      quotePaymentCondition(wo),
      "<b>Exclusions :</b> Cadres, mecanismes, moustiquaires, peinture, modifications structurales et permis municipaux, sauf mention contraire dans la soumission.",
    ];
  }

  return [
    "<b>Conditions :</b> Travaux effectues selon les informations inscrites au bon.",
  ];
}

export function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "");
}

function sectionLabel(unitCode) {
  const label = String(unitCode || "").trim();
  if (!label) return "TRAVAUX";
  if (/^(unite|unité|unit)\b/i.test(label)) return label;
  if (/[,\u2014-]/.test(label) || /\b(rue|avenue|av\.|boulevard|boul\.|chemin|ch\.|route|rang|place|allee|allée|croissant)\b/i.test(label)) {
    return label;
  }
  return `UNITE ${label}`;
}

export function documentRows(wo) {
  const rows = [];
  const addItem = (item) => {
    const qty = Number(item.quantity || item.qty || 0);
    const unitPrice = Number(item.unitPrice || 0);
    rows.push({
      type: "item",
      description: item.description || "",
      unit: item.unit || (item.itemType === "labor" ? "Heures" : "Unite"),
      qty,
      unitPrice,
      amount: item.totalPrice !== undefined ? Number(item.totalPrice) : qty * unitPrice,
    });
  };

  const sections = Array.isArray(wo?.sections) ? wo.sections : [];
  if (sections.length > 0) {
    for (const section of sections) {
      rows.push({ type: "section", label: sectionLabel(section.unitCode) });
      for (const item of section.items || []) addItem(item);
    }
  } else {
    for (const item of wo?.items || []) addItem(item);
  }

  const totalLabor = Number(wo?.totalLabor || 0);
  if (totalLabor > 0) {
    const laborRate = Number(wo?.laborRate || 85);
    const hours = laborRate > 0 ? Math.round((totalLabor / laborRate) * 100) / 100 : 0;
    rows.push({
      type: "item",
      description: "Main-d'oeuvre",
      unit: "Heures",
      qty: hours,
      unitPrice: laborRate,
      amount: totalLabor,
    });
  }

  return rows;
}
