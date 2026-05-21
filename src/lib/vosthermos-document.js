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

export function getDocumentDate(wo) {
  const date = wo?.date ? new Date(wo.date) : new Date();
  return isNaN(date.getTime()) ? new Date() : date;
}

export function getDocumentTargetDate(wo, documentType) {
  const base = getDocumentDate(wo);
  if (documentType === "invoice") return addDays(base, getPaymentTermsDays(wo));
  if (documentType === "quote") return addDays(base, 30);
  return null;
}

export function getProjectType(wo) {
  const clientType = String(wo?.client?.type || "").toLowerCase();
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
  return `${prefix}_Vosthermos_${safeFileToken(clientLastName(wo?.client?.name))}.pdf`;
}

export function documentConditions(documentType) {
  if (documentType === "invoice") {
    return [
      "<b>Merci :</b> Merci d'avoir choisi Vosthermos pour vos travaux.",
      "<b>Questions :</b> Pour toute question concernant cette facture, contactez-nous a info@vosthermos.com.",
      "<b>Paiement Interac :</b> info@vosthermos.com.",
    ];
  }

  if (documentType === "quote") {
    return [
      "<b>Validite :</b> Cette soumission est valide pour une periode de 30 jours a compter de la date d'emission.",
      "<b>Mesures :</b> Les dimensions indiquees sont approximatives. Une prise de mesure precise sera effectuee avant la fabrication. Toute variation significative pourrait entrainer un ajustement du prix.",
      "<b>Delai de fabrication :</b> Environ 2 a 4 semaines suivant l'acceptation de la soumission et la prise de mesures finales, selon le calendrier du fabricant.",
      "<b>Garantie thermos :</b> Les thermos sont garantis 10 ans contre les defauts de fabrication, perte de scellement ou condensation entre les vitres. Main-d'oeuvre garantie 1 an.",
      "<b>Paiement :</b> 10 % a la signature du contrat, 40 % au debut des travaux pour la commande des materiaux, 50 % a la fin de l'installation.",
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
      rows.push({ type: "section", label: section.unitCode ? `UNITE ${section.unitCode}` : "TRAVAUX" });
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
