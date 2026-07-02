// Helpers purs de l'editeur de documents (bons / factures / soumissions).
// Extraits de page.js — aucune logique modifiee.
import { dateOnlyString } from "@/lib/date-only";

export const DRAFT_KEY = "vosthermos:nouveau-bon:draft";
export const AI_IMAGE_SESSION_KEY = "vosthermos:nouveau-bon:ai-image";
export const AI_ANALYSIS_SESSION_KEY = "vosthermos:nouveau-bon:ai-analysis";
export const AI_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const AI_IMAGE_MAX_COUNT = 6;
export const AI_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const AI_IMAGE_TOTAL_MAX_BYTES = 20 * 1024 * 1024;
export const AI_PDF_TYPES = ["application/pdf"];
export const AI_PDF_MAX_BYTES = 12 * 1024 * 1024;

export function formatBytes(bytes) {
  const size = Number(bytes) || 0;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

export function formatUsdCost(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "0.00 $ US";
  if (amount < 0.0001) return "<0.0001 $ US";
  if (amount < 0.01) return `${amount.toFixed(4)} $ US`;
  return `${amount.toFixed(2)} $ US`;
}

export function formatTokenCount(value) {
  return new Intl.NumberFormat("fr-CA").format(Number(value || 0));
}

export function readAiImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Image manquante"));
      return;
    }
    if (!AI_IMAGE_TYPES.includes(file.type)) {
      reject(new Error("Image non supportee. Utilise PNG, JPG, WEBP ou GIF."));
      return;
    }
    if (file.size > AI_IMAGE_MAX_BYTES) {
      reject(new Error("Image trop lourde. Maximum 8 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const data = result.includes(",") ? result.split(",").pop() : result;
      resolve({
        data,
        mediaType: file.type,
        name: file.name || "image collee",
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error("Impossible de lire l'image"));
    reader.readAsDataURL(file);
  });
}

export function readAiPdfFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("PDF manquant"));
      return;
    }
    const isPdf = file.type === "application/pdf" || String(file.name || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      reject(new Error("Fichier non supporte. Utilise un PDF."));
      return;
    }
    if (file.size > AI_PDF_MAX_BYTES) {
      reject(new Error(`PDF trop lourd. Maximum ${formatBytes(AI_PDF_MAX_BYTES)}.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const data = result.includes(",") ? result.split(",").pop() : result;
      resolve({
        data,
        mediaType: "application/pdf",
        name: file.name || "document.pdf",
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error("Impossible de lire le PDF"));
    reader.readAsDataURL(file);
  });
}

export function formatPercentInput(value) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return Number.isInteger(number) ? String(number) : String(number).replace(".", ",");
}

export function parseQuoteDepositPercentInput(value) {
  const text = String(value || "").trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0 || number > 100) return undefined;
  return Math.round(number * 100) / 100;
}

export function defaultQuotePaymentTexts(count) {
  const safeCount = Math.max(1, Math.min(6, Number(count) || 2));
  if (safeCount === 1) return ["100"];
  if (safeCount === 2) return ["50", "50"];
  const base = Math.floor((100 / safeCount) * 100) / 100;
  const values = Array.from({ length: safeCount }, () => base);
  values[safeCount - 1] = Math.round((100 - base * (safeCount - 1)) * 100) / 100;
  return values.map(formatPercentInput);
}

export function resizeQuotePaymentTexts(current, count) {
  const defaults = defaultQuotePaymentTexts(count);
  return defaults.map((value, index) => {
    const currentValue = current[index];
    return currentValue === undefined || currentValue === "" ? value : currentValue;
  });
}

export function quotePaymentUiLabel(index, count) {
  if (count <= 1) return "Paiement complet";
  if (index === 0) return "Acceptation";
  if (index === count - 1) return "Fin des travaux";
  return `Paiement ${index + 1}`;
}

export function quotePaymentConditionLabel(index, count) {
  if (count <= 1) return "paiement complet";
  if (index === 0) return "a l'acceptation de la commande";
  if (index === count - 1) return "a la fin des travaux";
  return `au paiement ${index + 1}`;
}

export function parseQuotePaymentScheduleInput(countValue, percentTexts) {
  if (countValue === "auto") return null;
  const count = Number(countValue);
  if (!Number.isInteger(count) || count < 1 || count > 6) return undefined;
  const payments = [];
  for (let index = 0; index < count; index += 1) {
    const percent = parseQuoteDepositPercentInput(percentTexts[index]);
    if (percent === undefined || percent === null || percent <= 0) return undefined;
    payments.push({
      percent,
      label: quotePaymentConditionLabel(index, count),
    });
  }
  const total = Math.round(payments.reduce((sum, payment) => sum + payment.percent, 0) * 100) / 100;
  if (Math.abs(total - 100) > 0.01) return undefined;
  return payments;
}

export function quotePaymentEditorFromWorkOrder(wo) {
  const schedule = Array.isArray(wo?.quotePaymentSchedule) ? wo.quotePaymentSchedule : [];
  if (schedule.length > 0) {
    return {
      count: String(schedule.length),
      texts: schedule.map((payment) => formatPercentInput(payment.percent)),
    };
  }

  const legacyDeposit = parseQuoteDepositPercentInput(wo?.quoteDepositPercent);
  if (legacyDeposit && legacyDeposit > 0) {
    if (legacyDeposit >= 100) return { count: "1", texts: ["100"] };
    return {
      count: "2",
      texts: [formatPercentInput(legacyDeposit), formatPercentInput(100 - legacyDeposit)],
    };
  }

  return { count: "auto", texts: defaultQuotePaymentTexts(2) };
}

export function aiImageSrc(image) {
  if (!image) return "";
  if (image.url) return image.url;
  if (image.data && image.mediaType) return `data:${image.mediaType};base64,${image.data}`;
  return "";
}

export function aiImageStorageKey(workOrderId) {
  return workOrderId ? `${AI_IMAGE_SESSION_KEY}:${workOrderId}` : `${AI_IMAGE_SESSION_KEY}:draft`;
}

export function normalizeAiImages(value) {
  const images = Array.isArray(value) ? value : (value ? [value] : []);
  return images.filter((image) => aiImageSrc(image)).slice(0, AI_IMAGE_MAX_COUNT);
}

export function aiImagesTotalSize(images) {
  return normalizeAiImages(images).reduce((sum, image) => sum + (Number(image.size) || 0), 0);
}

export function saveAiImagesSession(images, workOrderId) {
  const cleanImages = normalizeAiImages(images);
  if (typeof window === "undefined" || cleanImages.length === 0) return;
  try {
    window.sessionStorage.setItem(aiImageStorageKey(workOrderId), JSON.stringify(cleanImages));
  } catch {}
}

export function loadAiImagesSession(workOrderId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(aiImageStorageKey(workOrderId));
    if (!raw) return null;
    const images = normalizeAiImages(JSON.parse(raw));
    return images.length > 0 ? images : null;
  } catch {
    return null;
  }
}

export function clearAiImagesSession(workOrderId) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(aiImageStorageKey(workOrderId));
  } catch {}
}

export function aiAnalysisStorageKey(workOrderId) {
  return workOrderId ? `${AI_ANALYSIS_SESSION_KEY}:${workOrderId}` : `${AI_ANALYSIS_SESSION_KEY}:draft`;
}

export function normalizeAiAnalysisSession(value) {
  if (!value || typeof value !== "object") return null;
  const text = String(value.text || "");
  const draft = value.draft && typeof value.draft === "object" ? value.draft : null;
  const emailDraft = value.emailDraft && typeof value.emailDraft === "object" ? value.emailDraft : null;
  if (!text.trim() && !draft && !emailDraft) return null;
  return { text, draft, emailDraft };
}

export function saveAiAnalysisSession(value, workOrderId) {
  const clean = normalizeAiAnalysisSession(value);
  if (typeof window === "undefined" || !clean) return;
  try {
    window.localStorage.setItem(aiAnalysisStorageKey(workOrderId), JSON.stringify(clean));
  } catch {}
}

export function loadAiAnalysisSession(workOrderId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(aiAnalysisStorageKey(workOrderId));
    if (!raw) return null;
    return normalizeAiAnalysisSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearAiAnalysisSession(workOrderId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(aiAnalysisStorageKey(workOrderId));
  } catch {}
}

export function getNavigationType() {
  if (typeof window === "undefined") return "navigate";
  return window.performance?.getEntriesByType?.("navigation")?.[0]?.type || "navigate";
}

export function shouldRestoreNewBonDraft({ freshDraft, resumeDraft }) {
  if (freshDraft) return false;
  if (resumeDraft) return true;
  return getNavigationType() === "reload";
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function normalizeTimeInput(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[h.,]/g, ":");

  if (!raw) return "";

  let hours;
  let minutes;
  const compact = raw.match(/^(\d{3,4})$/);
  const separated = raw.match(/^(\d{1,2})(?::(\d{0,2}))?$/);

  if (compact) {
    const digits = compact[1];
    hours = Number(digits.slice(0, -2));
    minutes = Number(digits.slice(-2));
  } else if (separated) {
    hours = Number(separated[1]);
    minutes = separated[2] === "" || separated[2] === undefined ? 0 : Number(separated[2]);
  } else {
    return "";
  }

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) return "";
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export const LABOR_HOUR_OPTIONS = Array.from({ length: 16 * 4 + 1 }, (_, index) => {
  const value = index / 4;
  return { value, label: formatLaborHours(value) };
});

export function formatLaborHours(value) {
  const totalMinutes = Math.round(Number(value || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "0h";
  return `${hours > 0 ? `${hours}h` : ""}${minutes > 0 ? pad2(minutes) : ""}`;
}

export function normalizeWorkItem(it) {
  const unitPrice = Number(it.unitPrice);
  if ((it.itemType || "piece") === "discount") {
    return {
      productId: it.productId,
      serviceId: it.serviceId,
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPrice,
      itemType: "discount",
      discountMode: "amount",
      discountPercent: 0,
      discountAmount: Math.abs(unitPrice || 0),
    };
  }
  return {
    productId: it.productId,
    serviceId: it.serviceId,
    description: it.description,
    quantity: Number(it.quantity),
    unitPrice,
    itemType: it.itemType || "piece",
  };
}
export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function hasMeaningfulText(value) {
  return String(value || "").trim().length > 0;
}

export function looksLikeProvinceOnly(value) {
  return /^(qc|quebec|quÃ©bec)$/i.test(String(value || "").trim());
}

export function looksLikeBusinessName(value) {
  return /\b(gestion|immobili|syndicat|condo|copropriete|copropriÃ©tÃ©|inc\.?|ltee|ltÃ©e|senc|s\.a\.|compagnie|corporation|groupe|proprietes|propriÃ©tÃ©s)\b/i
    .test(String(value || ""));
}

export function draftBusinessName(draftClient = {}) {
  const company = String(draftClient.company || "").trim();
  if (company) return company;
  const name = String(draftClient.name || "").trim();
  return looksLikeBusinessName(name) ? name : "";
}

export function clientMatchesDraft(client, draftClient = {}) {
  const email = String(draftClient.email || "").trim().toLowerCase();
  const phone = onlyDigits(draftClient.phone);
  const secondaryPhone = onlyDigits(draftClient.secondaryPhone);
  const name = String(draftClient.name || "").trim().toLowerCase();
  const company = String(draftClient.company || "").trim().toLowerCase();
  if (email && String(client.email || "").trim().toLowerCase() === email) return true;
  const clientPhones = [client.phone, client.secondaryPhone].map(onlyDigits).filter(Boolean);
  if (phone && clientPhones.includes(phone)) return true;
  if (secondaryPhone && clientPhones.includes(secondaryPhone)) return true;
  if (company && String(client.company || "").trim().toLowerCase() === company) return true;
  return Boolean(name && String(client.name || "").trim().toLowerCase() === name);
}

export const CLIENT_STOP_WORDS = new Set([
  "le", "la", "les", "l", "de", "du", "des", "d", "un", "une", "the",
  "gestion", "immobiliere", "immobilier", "syndicat", "copropriete", "condo",
  "inc", "ltee", "ltd", "compagnie", "corporation", "groupe",
]);

export function normalizeClientLookupText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['â€™`]/g, " ")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripLeadingClientArticles(value) {
  return normalizeClientLookupText(value)
    .replace(/^(?:l |le |la |les |de |du |des |d |un |une |the )+/i, "")
    .trim();
}

export function stripLeadingClientArticlesRaw(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:l['â€™]\s*|le\s+|la\s+|les\s+|de\s+|du\s+|des\s+|d['â€™]\s*|un\s+|une\s+|the\s+)/i, "")
    .trim();
}

export function clientLookupTokens(value) {
  return Array.from(new Set(
    normalizeClientLookupText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !CLIENT_STOP_WORDS.has(token))
  ));
}

export function textSimilarityScore(a, b) {
  const left = stripLeadingClientArticles(a);
  const right = stripLeadingClientArticles(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    const shortLength = Math.min(left.length, right.length);
    const longLength = Math.max(left.length, right.length);
    return Math.max(0.72, shortLength / longLength);
  }

  const leftTokens = clientLookupTokens(left);
  const rightTokens = clientLookupTokens(right);
  if (leftTokens.length === 0 || rightTokens.length === 0) return 0;
  const rightSet = new Set(rightTokens);
  const common = leftTokens.filter((token) => rightSet.has(token)).length;
  let fuzzyCommon = common;
  if (common < Math.min(leftTokens.length, rightTokens.length)) {
    for (const token of leftTokens) {
      if (rightSet.has(token)) continue;
      const bestTokenScore = Math.max(...rightTokens.map((rightToken) => wordSimilarityScore(token, rightToken)));
      if (bestTokenScore >= 0.68) fuzzyCommon += bestTokenScore;
    }
  }
  if (!fuzzyCommon) return 0;
  return Math.min(1, (2 * fuzzyCommon) / (leftTokens.length + rightTokens.length));
}

export function wordSimilarityScore(a, b) {
  const left = normalizeClientLookupText(a).replace(/\s/g, "");
  const right = normalizeClientLookupText(b).replace(/\s/g, "");
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.length < 5 || right.length < 5) return 0;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }

  const rows = left.length + 1;
  const cols = right.length + 1;
  const distances = Array.from({ length: rows }, (_, row) => {
    const line = Array(cols).fill(0);
    line[0] = row;
    return line;
  });
  for (let col = 0; col < cols; col += 1) distances[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      distances[row][col] = Math.min(
        distances[row - 1][col] + 1,
        distances[row][col - 1] + 1,
        distances[row - 1][col - 1] + cost
      );
    }
  }

  const distance = distances[left.length][right.length];
  return 1 - distance / Math.max(left.length, right.length);
}

export function bestSimilarity(leftValues, rightValues) {
  let best = 0;
  for (const left of leftValues) {
    for (const right of rightValues) {
      best = Math.max(best, textSimilarityScore(left, right));
    }
  }
  return best;
}

export function scoreClientForDraft(client, draftClient = {}) {
  const reasons = [];
  const email = String(draftClient.email || "").trim().toLowerCase();
  const clientEmail = String(client.email || "").trim().toLowerCase();
  const draftPhones = [draftClient.phone, draftClient.secondaryPhone].map(onlyDigits).filter(Boolean);
  const clientPhones = [client.phone, client.secondaryPhone].map(onlyDigits).filter(Boolean);

  if (email && clientEmail && email === clientEmail) {
    return { score: 100, reasons: ["Email identique"] };
  }
  if (draftPhones.some((phone) => phone && clientPhones.includes(phone))) {
    return { score: 98, reasons: ["Telephone identique"] };
  }

  const draftBusinessValues = [draftClient.company, draftClient.name].filter(Boolean);
  const clientBusinessValues = [client.company, client.name].filter(Boolean);
  const nameScore = bestSimilarity(clientBusinessValues, draftBusinessValues);
  const contactScore = bestSimilarity([client.contactName].filter(Boolean), [draftClient.contactName].filter(Boolean));
  const addressScore = bestSimilarity([client.address].filter(Boolean), [draftClient.address].filter(Boolean));
  const cityScore = textSimilarityScore(client.city, draftClient.city);

  let score = 0;
  if (nameScore >= 0.95) {
    score = Math.max(score, 94);
    reasons.push("Nom pratiquement identique");
  } else if (nameScore >= 0.78) {
    score = Math.max(score, 82);
    reasons.push("Nom tres proche");
  } else if (nameScore >= 0.66) {
    score = Math.max(score, 74);
    reasons.push("Nom proche avec orthographe differente");
  } else if (nameScore >= 0.5) {
    score = Math.max(score, 62);
    reasons.push("Mots importants en commun");
  }

  if (contactScore >= 0.9) {
    score = Math.max(score, 72);
    reasons.push("Contact proche");
  }
  if (addressScore >= 0.82) {
    score = Math.min(96, score + 10);
    reasons.push("Adresse proche");
  }
  if (cityScore >= 0.95 && score > 0) {
    score = Math.min(96, score + 4);
    reasons.push("Meme ville");
  }

  return { score, reasons };
}

export function clientSearchQueriesForDraft(draftClient = {}) {
  const rawValues = [
    draftClient.email,
    draftClient.phone,
    draftClient.secondaryPhone,
    draftClient.company,
    draftClient.name,
    draftClient.contactName,
    draftClient.address,
  ].map((value) => String(value || "").trim()).filter(Boolean);
  const strippedRawValues = rawValues.map(stripLeadingClientArticlesRaw).filter(Boolean);

  const tokenValues = clientLookupTokens([
    draftClient.company,
    draftClient.name,
    draftClient.contactName,
    draftClient.address,
  ].filter(Boolean).join(" "));
  const tokenPrefixes = tokenValues
    .filter((token) => token.length >= 6)
    .flatMap((token) => [token.slice(0, 4), token.slice(0, 3)]);

  const phoneFragments = [draftClient.phone, draftClient.secondaryPhone]
    .map(onlyDigits)
    .filter((value) => value.length >= 7)
    .flatMap((value) => [value.slice(-7), value.slice(-4)]);

  return Array.from(new Set([...rawValues, ...strippedRawValues, ...tokenValues, ...tokenPrefixes, ...phoneFragments]))
    .filter((value) => value.length >= 3)
    .slice(0, 20);
}

export function decorateClientSuggestion(client, score, reasons) {
  return {
    ...client,
    matchScore: score,
    matchReasons: reasons.length ? reasons : ["Client semblable"],
  };
}

export async function findClientCandidatesForAiDraft(draftClient = {}) {
  const queries = clientSearchQueriesForDraft(draftClient);
  const byId = new Map();

  const addClients = (clients) => {
    for (const client of clients) {
      if (client?.id && !byId.has(client.id)) byId.set(client.id, client);
    }
  };

  for (const query of queries) {
    const res = await fetch(`/api/admin/clients?q=${encodeURIComponent(query)}&limit=50`, { cache: "no-store" });
    if (!res.ok) continue;
    const data = await res.json().catch(() => ({}));
    addClients(Array.isArray(data.clients) ? data.clients : []);
  }

  if (byId.size < 5) {
    const res = await fetch("/api/admin/clients?limit=200&sort=name_asc", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      addClients(Array.isArray(data.clients) ? data.clients : []);
      const pages = Math.min(Number(data.pages || 1), 12);
      for (let page = 2; page <= pages; page += 1) {
        const pageRes = await fetch(`/api/admin/clients?limit=200&sort=name_asc&page=${page}`, { cache: "no-store" });
        if (!pageRes.ok) continue;
        const pageData = await pageRes.json().catch(() => ({}));
        addClients(Array.isArray(pageData.clients) ? pageData.clients : []);
      }
    }
  }

  const scored = Array.from(byId.values())
    .map((client) => {
      const match = scoreClientForDraft(client, draftClient);
      return { client, ...match };
    })
    .filter((item) => item.score >= 55 || clientMatchesDraft(item.client, draftClient))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const exact = scored.find((item) => clientMatchesDraft(item.client, draftClient));
  return {
    exact: exact ? decorateClientSuggestion(exact.client, Math.max(exact.score, 100), ["Correspondance exacte"]) : null,
    suggestions: scored
      .filter((item) => !exact || item.client.id !== exact.client.id)
      .map((item) => decorateClientSuggestion(item.client, item.score, item.reasons)),
  };
}

export function formatDraftClientLine(draftClient = {}) {
  const parts = [
    draftClient.name,
    draftClient.company ? `Compagnie: ${draftClient.company}` : "",
    draftClient.contactName ? `Contact: ${draftClient.contactName}` : "",
    draftClient.email,
    draftClient.phone,
    draftClient.secondaryPhone,
    [draftClient.address, draftClient.city, draftClient.postalCode].filter(Boolean).join(", "),
  ].map((value) => String(value || "").trim()).filter(Boolean);
  return parts.length ? parts.join("\n") : "Client a verifier";
}

export function resolveAiEmailDraft(aiDraft = {}, client = null) {
  const draft = aiDraft && typeof aiDraft === "object" ? aiDraft : {};
  const email = draft.email && typeof draft.email === "object" ? draft.email : {};
  const to = [
    email.to,
    draft.client?.email,
    client?.email,
  ].map((value) => String(value || "").trim()).find(Boolean) || "";
  const subject = String(email.subject || "").trim();
  const body = String(email.body || "").trim();
  if (!to && !subject && !body) return null;
  return { to, subject, body };
}

export function formatEmailDraftNote(emailDraft) {
  if (!emailDraft?.body) return "";
  return [
    "Email IA propose:",
    emailDraft.to ? `Destinataire: ${emailDraft.to}` : null,
    emailDraft.subject ? `Sujet: ${emailDraft.subject}` : null,
    "",
    emailDraft.body,
  ].filter((line) => line !== null).join("\n");
}

export function appendUniqueNoteBlocks(current, blocks) {
  const existing = String(current || "").trim();
  const nextBlocks = blocks
    .map((block) => String(block || "").trim())
    .filter(Boolean)
    .filter((block) => !existing.includes(block.slice(0, Math.min(block.length, 220))));
  if (nextBlocks.length === 0) return existing;
  return [existing, nextBlocks.join("\n\n")].filter(Boolean).join("\n\n");
}

export function draftItemsToWorkItems(items = []) {
  return items
    .map((item) => ({
      productId: null,
      serviceId: null,
      description: String(item.description || "").trim(),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      itemType: "piece",
    }))
    .filter((item) => item.description && item.unitPrice > 0);
}

export function draftSectionsToWorkSections(sections = []) {
  const byUnit = new Map();
  for (const section of sections || []) {
    const unitCode = String(section?.unitCode || section?.unit || section?.code || "").trim().toUpperCase();
    if (!unitCode) continue;
    const items = draftItemsToWorkItems(section?.items || []);
    if (items.length === 0) continue;
    if (!byUnit.has(unitCode)) byUnit.set(unitCode, { unitCode, items: [] });
    byUnit.get(unitCode).items.push(...items);
  }
  return Array.from(byUnit.values());
}

export function draftSectionItems(sections = []) {
  return draftSectionsToWorkSections(sections).flatMap((section) => section.items);
}

export function descriptionFromAiDraft(draft = {}) {
  const explicit = String(draft.description || "").trim();
  if (explicit) return explicit;
  const descriptions = [...(draft.items || []), ...draftSectionItems(draft.sections)]
    .map((item) => String(item?.description || "").trim().replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, 5);
  if (descriptions.length === 0) return "";
  const prefix = draft.documentType === "quote" ? "Travaux proposes" : "Travaux effectues";
  return `${prefix} : ${descriptions.join("; ")}.`;
}

export function emailDraftStorageKey(workOrderId) {
  return `vosthermos:document-email-draft:${workOrderId}`;
}

export function followUpDateLabel(value) {
  const date = dateOnlyString(value);
  return date ? ` | ${date}` : "";
}
