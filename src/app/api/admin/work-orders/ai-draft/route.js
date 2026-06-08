import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { COMPANY_INFO } from "@/lib/company-info";
import { callAnthropicAdmin } from "@/lib/anthropic-admin";

export const runtime = "nodejs";

const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_COUNT = 6;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES_TOTAL_BYTES = 20 * 1024 * 1024;
const ACCEPTED_PDF_TYPES = new Set(["application/pdf"]);
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const MAX_PDF_TEXT_CHARS = 12000;

function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function cleanMoney(value) {
  const number = Number(String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100) / 100) : 0;
}

function normalizePlainText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatNameCase(value) {
  const text = cleanText(value, 160).replace(/\s{2,}/g, " ");
  if (!text) return "";

  return text.split(/(\s+|-|')/).map((part) => {
    if (!part || /^\s+$/.test(part) || part === "-" || part === "'") return part;
    if (part.includes("@")) return part.toLowerCase();
    if (/^\d+$/.test(part)) return part;
    const lower = part.toLocaleLowerCase("fr-CA");
    return lower.charAt(0).toLocaleUpperCase("fr-CA") + lower.slice(1);
  }).join("");
}

function emailGreetingName(value) {
  return cleanText(value, 160).replace(/\s{2,}/g, " ").trim();
}

function looksLikeBusinessName(value) {
  return /\b(gestion|immobili|syndicat|condo|copropriete|copropriÃ©tÃ©|inc\.?|ltee|ltÃ©e|senc|compagnie|corporation|groupe|proprietes|propriÃ©tÃ©s)\b/i
    .test(String(value || ""));
}

function extractCompanyFromRawText(rawText) {
  const firstLine = String(rawText || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
  if (!firstLine) return "";
  const emailMatch = firstLine.match(/^(.+?)(?:,|\s)+[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const beforeEmail = cleanText(emailMatch?.[1], 160).replace(/[,;]+$/g, "").trim();
  return beforeEmail && looksLikeBusinessName(beforeEmail) ? formatNameCase(beforeEmail) : "";
}

function extractContactNameFromRawText(rawText) {
  const match = String(rawText || "").match(/\bcontact\s*:\s*([^\n\r]+)/i);
  return formatNameCase(match?.[1] || "");
}

function personalizeEmailBody(body, clientName) {
  const message = cleanText(body, 2000).replace(/\r\n/g, "\n").trim();
  if (!message) return "";

  const name = emailGreetingName(clientName);
  if (!name) return message;

  const english = /^hello\b/i.test(message);
  const greeting = `${english ? "Hello" : "Bonjour"} ${name},`;
  if (/^(bonjour|hello)\b[^\n]*(\n|$)/i.test(message)) {
    return message.replace(/^(bonjour|hello)\b[^\n]*(\n|$)/i, `${greeting}\n`).trim();
  }
  return `${greeting}\n\n${message}`.trim();
}

function cleanWarning(value) {
  return cleanText(value, 240)
    .replace(/\s+(additionnelles?|supplementaires?)\s+(a|à)\s+commander\b/gi, "")
    .replace(/\s+(a|à)\s+commander\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function uniqueWarnings(warnings) {
  return Array.from(new Set(warnings.map(cleanWarning).filter(Boolean))).slice(0, 8);
}

function correctSuspiciousRepairText(text) {
  const value = cleanText(text, 300);
  if (!value) return { text: value, warnings: [] };

  const normalized = normalizePlainText(value);
  const repairContext = /\b(porte\s+patio|porte|fenetres?|thermos|moustiquaire|manivelle|charniere|coupe[-\s]?froid|roulettes?|rail|calfeutrage|vitre)\b/i;
  if (/\brelation\b/i.test(normalized) && repairContext.test(normalized)) {
    const corrected = value.replace(/\brelation\b/gi, (match) => (
      match[0] === match[0].toUpperCase() ? "R\u00e9paration" : "r\u00e9paration"
    ));
    if (corrected !== value) {
      return {
        text: corrected,
        warnings: [`Correction appliquee: "${value}" -> "${corrected}".`],
      };
    }
  }

  if (
    /\bremplacement\s+d['’]une?\s+fenetre\b/i.test(normalized) &&
    /\b(charnieres?|manivelles?|quincaillerie|mecanisme)\b/i.test(normalized) &&
    !/\b(fenetre\s+complete|complete\s+fenetre|nouvelle\s+fenetre)\b/i.test(normalized)
  ) {
    const corrected = value.replace(
      /\bremplacement\s+d['’]une?\s+fen\S*tre\b/i,
      "Réparation de quincaillerie sur une fenêtre",
    );
    if (corrected !== value) {
      return {
        text: corrected,
        warnings: [`Correction appliquee: "${value}" -> "${corrected}".`],
      };
    }
  }
  return { text: value, warnings: [] };
}

function normalizeHardwareRepairDescription(text) {
  const value = cleanText(text, 300)
    .replace(/\bcharniers\b/gi, "charnières")
    .replace(/\bcharnier\b/gi, "charnière")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!value) return "";

  const normalized = normalizePlainText(value);
  const hasWindow = /\bfenetres?\b/i.test(normalized);
  const hasHardware = /\b(charnieres?|manivelles?|mecanisme|mecanismes|quincaillerie)\b/i.test(normalized);
  const fullReplacement = /\b(fenetre\s+complete|complete\s+fenetre|nouvelle\s+fenetre)\b/i.test(normalized);
  if (!hasWindow || !hasHardware || fullReplacement || /\bquincaillerie\b/i.test(normalized)) return value;

  const quantityMatch = normalized.match(/^(\d+)\s+fenetres?\b/i);
  const qty = quantityMatch ? Number(quantityMatch[1]) : 1;
  const target = qty > 1 ? `${qty} fenêtres` : `${qty} fenêtre`;
  const detail = value
    .replace(/^\d+\s+fen\S*tres?\b/i, "")
    .replace(/^fen\S*tres?\b/i, "")
    .replace(/^\s*(?:avec\s+)?/i, "")
    .trim();
  return `Réparation de quincaillerie sur ${target}${detail ? ` avec ${detail}` : ""}`;
}

function cleanUnitCode(value) {
  const text = cleanText(value, 80)
    .replace(/\s{2,}/g, " ")
    .replace(/[.;:]+$/g, "")
    .replace(/\bapp\.?\b/gi, "appartement")
    .replace(/\bapt\.?\b/gi, "appartement")
    .replace(/\bunité\b/gi, "unite")
    .trim();
  return text ? text.toUpperCase() : "";
}

function splitUnitFromDescription(description) {
  const value = cleanText(description, 300).replace(/\s{2,}/g, " ").trim();
  if (!value) return null;

  const serviceStart = "(?:r[eé]paration|remplacement|ajustement|installation|nettoyage|calfeutrage|relation|1\\s+fen[eê]tre|\\d+\\s+fen[eê]tres?)";
  const withLabel = value.match(new RegExp(
    `^((?:appartement|app\\.?|apt\\.?|unite|unit[eé]?|local|bureau)\\s+[A-Za-z0-9][A-Za-z0-9 ._-]{0,32}?)\\s+(?=${serviceStart}\\b)(.+)$`,
    "i",
  ));
  if (withLabel) {
    return { unitCode: cleanUnitCode(withLabel[1]), description: withLabel[2].trim() };
  }

  const compactCode = value.match(new RegExp(
    `^([A-Za-z]\\s*[- ]\\s*\\d{1,5}[A-Za-z]?)\\s+(?=${serviceStart}\\b)(.+)$`,
    "i",
  ));
  if (compactCode) {
    return { unitCode: cleanUnitCode(compactCode[1]), description: compactCode[2].trim() };
  }

  return null;
}

function parseUnitLine(line) {
  const value = cleanText(line, 120).replace(/\s{2,}/g, " ").replace(/[.;:]+$/g, "").trim();
  if (!value) return "";
  if (/^(?:appartement|app\.?|apt\.?|unite|unit[eé]?|local|bureau)\s+[A-Za-z0-9][A-Za-z0-9 ._-]{0,32}$/i.test(value)) {
    return cleanUnitCode(value);
  }
  if (/^[A-Za-z]\s*[- ]\s*\d{1,5}[A-Za-z]?$/i.test(value)) {
    return cleanUnitCode(value);
  }
  return "";
}

function parsePricedLine(line) {
  const value = cleanText(line, 300).replace(/\s{2,}/g, " ").trim();
  const match = value.match(/^(.+?)\s+(\d+(?:[,.]\d{1,2})?)\s*\$?(?:\s*(?:plus\s*(?:tx|taxes?)|avant\s*taxes?|taxes?\s*en\s*sus))?$/i);
  if (!match) return null;
  const unitPrice = cleanMoney(match[2]);
  if (unitPrice <= 0) return null;

  let description = normalizeHardwareRepairDescription(match[1]);
  const split = splitUnitFromDescription(description);
  const unitCode = split?.unitCode || "";
  if (split?.description) description = normalizeHardwareRepairDescription(split.description);
  const corrected = correctSuspiciousRepairText(description);
  return {
    unitCode,
    item: {
      description: corrected.text,
      quantity: 1,
      unitPrice,
    },
    warnings: corrected.warnings,
  };
}

function parsePriceOnlyLine(line) {
  const value = cleanText(line, 80).replace(/\s{2,}/g, " ").trim();
  const match = value.match(/^(\d+(?:[,.]\d{1,2})?)\s*\$?(?:\s*(?:plus\s*(?:tx|taxes?)|avant\s*taxes?|taxes?\s*en\s*sus))?$/i);
  if (!match) return 0;
  return cleanMoney(match[1]);
}

function extractSectionsFromRawText(rawText) {
  const sections = [];
  const byUnit = new Map();
  const warnings = [];
  let currentUnit = "";
  let pendingDescription = "";

  const ensureSection = (unitCode) => {
    if (!unitCode) return null;
    if (!byUnit.has(unitCode)) {
      const section = { unitCode, items: [] };
      byUnit.set(unitCode, section);
      sections.push(section);
    }
    return byUnit.get(unitCode);
  };

  for (const line of String(rawText || "").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean)) {
    const unitLine = parseUnitLine(line);
    if (unitLine) {
      currentUnit = unitLine;
      pendingDescription = "";
      ensureSection(currentUnit);
      continue;
    }

    const priced = parsePricedLine(line);
    if (priced?.item) {
      const unitCode = priced.unitCode || currentUnit;
      if (!unitCode) continue;
      pendingDescription = "";
      warnings.push(...priced.warnings);
      ensureSection(unitCode)?.items.push(priced.item);
      continue;
    }

    const priceOnly = parsePriceOnlyLine(line);
    if (priceOnly > 0 && currentUnit && pendingDescription) {
      const corrected = correctSuspiciousRepairText(normalizeHardwareRepairDescription(pendingDescription));
      warnings.push(...corrected.warnings);
      ensureSection(currentUnit)?.items.push({
        description: corrected.text,
        quantity: 1,
        unitPrice: priceOnly,
      });
      pendingDescription = "";
      continue;
    }

    if (currentUnit && /\b(r[eÃ©]paration|replacement|remplacement|installation|ajustement|nettoyage|fen[eÃª]tre|vitre|thermos|manivelle|charnieres?|charniers?|rail|operateur|op[eÃ©]rateur)\b/i.test(line)) {
      pendingDescription = pendingDescription ? `${pendingDescription} ${line}` : line;
    }
  }

  return {
    sections: sections.filter((section) => section.items.length > 0),
    warnings,
  };
}

function inferBillingName(client = {}, fallbackEmail = "") {
  const name = cleanText(client.name, 120);
  const email = cleanText(client.email || fallbackEmail, 160).toLowerCase();
  const localPart = email.split("@")[0] || "";
  const syndicateMatch = localPart.match(/^syndicat[-_.\s]*(\d+)/i);
  if (syndicateMatch && !/\bsyndicat\b/i.test(name)) {
    return `Syndicat ${syndicateMatch[1]}`;
  }
  return name;
}

function inferClientType(client = {}) {
  const name = cleanText(client.name, 120).toLowerCase();
  if (/(syndicat|condo|copropriete|copropriété)/i.test(name)) return "particulier";
  return client.type === "gestionnaire" ? "gestionnaire" : "particulier";
}

function cleanDescriptionAndWarnings(description, warnings) {
  const nextWarnings = [...warnings];
  let cleaned = cleanText(description, 1200);
  cleaned = cleaned.replace(/\s*(?:[aàAÀ] confirmer|[aàAÀ] verifier)\s*:\s*([^.\n]+)(?:\.|$)/g, (match, detail) => {
    const warning = cleanWarning(`A confirmer: ${detail}`);
    if (warning) nextWarnings.push(warning);
    return match.endsWith(".") ? "." : "";
  });
  cleaned = cleaned
    .replace(/\.{2,}/g, ".")
    .replace(/\s+\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { description: cleaned, warnings: nextWarnings };
}

function buildDescriptionFromItems(items, documentType, sections = []) {
  const sectionItems = sections.flatMap((section) => section.items || []);
  const descriptions = [...items, ...sectionItems]
    .map((item) => cleanText(item?.description, 180).replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, 5);
  if (descriptions.length === 0) return "";
  const prefix = documentType === "quote" ? "Travaux proposes" : "Travaux effectues";
  return `${prefix} : ${descriptions.join("; ")}.`;
}

function parseJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return JSON.parse(raw.slice(first, last + 1));
  }
  throw new Error("Reponse IA invalide");
}

function cleanImageInput(input) {
  if (!input || typeof input !== "object") return null;

  let mediaType = cleanText(input.mediaType || input.type, 40).toLowerCase();
  let data = String(input.data || "").trim();
  const dataUrl = data.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (dataUrl) {
    mediaType = dataUrl[1].toLowerCase();
    data = dataUrl[2];
  }

  if (!data) return null;
  if (!ACCEPTED_IMAGE_TYPES.has(mediaType)) {
    throw new Error("Image non supportee. Utilise PNG, JPG, WEBP ou GIF.");
  }

  data = data.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    throw new Error("Image invalide.");
  }

  const bytes = Buffer.byteLength(data, "base64");
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("Image trop lourde. Maximum 8 MB.");
  }

  return { mediaType, data, size: bytes };
}

function cleanImagesInput(body) {
  const rawImages = Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []);
  if (rawImages.length > MAX_IMAGE_COUNT) {
    throw new Error(`Maximum ${MAX_IMAGE_COUNT} images par analyse.`);
  }

  const images = rawImages.map(cleanImageInput).filter(Boolean);
  const totalBytes = images.reduce((sum, image) => sum + image.size, 0);
  if (totalBytes > MAX_IMAGES_TOTAL_BYTES) {
    throw new Error(`Images trop lourdes ensemble. Maximum ${Math.round(MAX_IMAGES_TOTAL_BYTES / 1024 / 1024)} MB au total.`);
  }
  return images;
}

function cleanPdfInput(body) {
  const rawPdf = body.pdf && typeof body.pdf === "object" ? body.pdf : null;
  if (!rawPdf) return null;

  const mediaType = cleanText(rawPdf.mediaType || rawPdf.type || "application/pdf", 80).toLowerCase();
  if (!ACCEPTED_PDF_TYPES.has(mediaType)) {
    throw new Error("PDF non supporte.");
  }

  let data = String(rawPdf.data || "");
  if (data.includes(",")) data = data.split(",").pop();
  data = data.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    throw new Error("PDF invalide.");
  }

  const bytes = Buffer.byteLength(data, "base64");
  if (bytes > MAX_PDF_BYTES) {
    throw new Error(`PDF trop lourd. Maximum ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB.`);
  }

  return {
    mediaType,
    data,
    name: cleanText(rawPdf.name || "document.pdf", 180),
    size: bytes,
  };
}

async function extractPdfText(pdf) {
  if (!pdf?.data) return "";
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: Buffer.from(pdf.data, "base64") });
  try {
    const result = await parser.getText();
    return cleanText(result.text, MAX_PDF_TEXT_CHARS).replace(/\s+\n/g, "\n").replace(/\n{4,}/g, "\n\n\n");
  } finally {
    await parser.destroy();
  }
}

function samePricedRepairItem(a, b) {
  if (Math.round(Number(a?.unitPrice || 0) * 100) !== Math.round(Number(b?.unitPrice || 0) * 100)) return false;
  const text = normalizePlainText(`${a?.description || ""} ${b?.description || ""}`);
  return /\b(fenetre|charnieres?|manivelles?|mecanisme|quincaillerie|porte|thermos|moustiquaire)\b/i.test(text);
}

function sanitizeDraft(input, fallbackDocumentType, rawText = "") {
  const draft = input && typeof input === "object" ? input : {};
  const documentType = ["invoice", "quote"].includes(draft.documentType) ? draft.documentType : fallbackDocumentType;
  const client = draft.client && typeof draft.client === "object" ? draft.client : {};
  const intervention = draft.intervention && typeof draft.intervention === "object" ? draft.intervention : {};
  const email = draft.email && typeof draft.email === "object" ? draft.email : {};
  const items = Array.isArray(draft.items) ? draft.items : [];
  const rawSections = Array.isArray(draft.sections) ? draft.sections : [];
  const initialWarnings = Array.isArray(draft.warnings) ? draft.warnings : [];
  const rawExtract = extractSectionsFromRawText(rawText);
  const moved = cleanDescriptionAndWarnings(draft.description, initialWarnings);
  const correctionWarnings = [];
  const rawCompany = extractCompanyFromRawText(rawText);
  const rawContactName = extractContactNameFromRawText(rawText);

  const cleanDraftItem = (item) => {
    const corrected = correctSuspiciousRepairText(normalizeHardwareRepairDescription(item?.description));
    correctionWarnings.push(...corrected.warnings);
    return {
      description: corrected.text,
      quantity: Math.max(0, Number(item?.quantity) || 1),
      unitPrice: cleanMoney(item?.unitPrice),
    };
  };

  let cleanItems = items.slice(0, 30)
    .map(cleanDraftItem)
    .filter((item) => item.description && item.unitPrice > 0);

  const cleanSections = rawSections.slice(0, 30)
    .map((item) => {
      const unitCode = cleanUnitCode(item?.unitCode || item?.unit || item?.code || item?.title);
      return {
        unitCode,
        items: Array.isArray(item?.items) ? item.items.slice(0, 30).map(cleanDraftItem).filter((line) => line.description && line.unitPrice > 0) : [],
      };
    })
    .filter((section) => section.unitCode && section.items.length > 0);

  const groupedByUnit = new Map(cleanSections.map((section) => [section.unitCode, section]));
  cleanItems = cleanItems.filter((item) => {
    const split = splitUnitFromDescription(item.description);
    if (!split?.unitCode || !split.description) return true;
    const corrected = correctSuspiciousRepairText(split.description);
    correctionWarnings.push(...corrected.warnings);
    const section = groupedByUnit.get(split.unitCode) || { unitCode: split.unitCode, items: [] };
    section.items.push({ ...item, description: corrected.text });
    groupedByUnit.set(split.unitCode, section);
    return false;
  });

  for (const rawSection of rawExtract.sections) {
    if (!groupedByUnit.has(rawSection.unitCode)) {
      groupedByUnit.set(rawSection.unitCode, rawSection);
      cleanItems = cleanItems.filter((item) => !rawSection.items.some((rawItem) => samePricedRepairItem(item, rawItem)));
    }
  }
  const sections = Array.from(groupedByUnit.values());

  const companyName = formatNameCase(client.company || rawCompany || "");
  const inferredName = inferBillingName(client, email.to);
  const billingName = formatNameCase(
    companyName && (!inferredName || !looksLikeBusinessName(inferredName))
      ? companyName
      : inferredName,
  );
  const clientType = sections.length > 0 ? "gestionnaire" : inferClientType({ ...client, name: billingName });
  const contactName = formatNameCase(client.contactName || client.contact || client.attention || rawContactName || "");
  const correctedDescription = correctSuspiciousRepairText(moved.description || buildDescriptionFromItems(cleanItems, documentType, sections));
  const description = correctedDescription.text;
  const warningList = uniqueWarnings([
    ...moved.warnings,
    ...rawExtract.warnings,
    ...correctionWarnings,
    ...correctedDescription.warnings,
  ]);

  return {
    documentType,
    client: {
      name: billingName,
      company: companyName || (looksLikeBusinessName(billingName) ? billingName : ""),
      contactName,
      email: cleanText(client.email || email.to, 160),
      phone: cleanText(client.phone, 80),
      secondaryPhone: cleanText(client.secondaryPhone, 80),
      address: cleanText(client.address, 180),
      city: cleanText(client.city, 80),
      postalCode: cleanText(client.postalCode, 20),
      type: clientType,
    },
    intervention: {
      address: cleanText(intervention.address || client.address, 180),
      city: cleanText(intervention.city || client.city, 80),
      postalCode: cleanText(intervention.postalCode || client.postalCode, 20),
    },
    description,
    items: cleanItems,
    sections,
    email: {
      to: cleanText(email.to || client.email, 160),
      subject: cleanText(email.subject, 180),
      body: personalizeEmailBody(email.body, contactName || (clientType === "gestionnaire" ? "" : billingName)),
    },
    warnings: warningList,
  };
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const pastedText = cleanText(body.text, 6000);
  const documentType = body.documentType === "quote" ? "quote" : "invoice";
  let images = [];
  let pdf = null;
  let pdfText = "";
  try {
    images = cleanImagesInput(body);
    pdf = cleanPdfInput(body);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Document invalide" }, { status: 400 });
  }
  if (pdf) {
    try {
      pdfText = await extractPdfText(pdf);
    } catch (err) {
      console.error("[work-orders ai-draft] pdf parse error:", err?.message || err);
      return NextResponse.json({ error: "Impossible de lire le PDF. Essaie un PDF texte ou ajoute une image/capture." }, { status: 400 });
    }
  }
  if (pdf && !pdfText && !pastedText && images.length === 0) {
    return NextResponse.json({ error: "PDF sans texte lisible. Pour un PDF scanne, ajoute une image ou une capture." }, { status: 400 });
  }

  const rawText = [
    pastedText,
    pdfText ? `Texte extrait du PDF "${pdf.name}":\n${pdfText}` : "",
  ].filter(Boolean).join("\n\n");
  if (!rawText && images.length === 0) return NextResponse.json({ error: "Texte, PDF ou image requis" }, { status: 400 });

  const userContent = [];
  for (const image of images) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mediaType,
        data: image.data,
      },
    });
  }
  userContent.push({
    type: "text",
    text: rawText || "Analyse les images jointes et cree le brouillon de document Vosthermos a partir du texte visible.",
  });

  let ai;
  try {
    ai = await callAnthropicAdmin({
      maxTokens: 1800,
      system: `Tu extrais un brouillon de document Vosthermos a partir d'un message brut.

Retourne STRICTEMENT un objet JSON valide, sans markdown.

Schema:
{
  "documentType": "invoice" | "quote",
  "client": {
    "name": "nom a facturer",
    "company": "compagnie ou gestion immobiliere si presente",
    "contactName": "nom complet du contact humain pour les courriels, surtout en B2B",
    "email": "email de facturation",
    "phone": "telephone principal, avec nom du contact si present",
    "secondaryPhone": "autre telephone, avec nom du contact si present",
    "address": "adresse civique complete sans ville si possible",
    "city": "ville",
    "postalCode": "code postal si present",
    "type": "particulier" | "gestionnaire"
  },
  "intervention": { "address": "adresse des travaux", "city": "ville", "postalCode": "code postal" },
  "description": "court resume professionnel des travaux confirmes seulement; obligatoire si au moins une ligne avec prix clair est detectee",
  "items": [{ "description": "ligne facture/soumission", "quantity": 1, "unitPrice": 0 }],
  "sections": [{ "unitCode": "APPARTEMENT E-0918", "items": [{ "description": "ligne facture/soumission pour cette unite", "quantity": 1, "unitPrice": 0 }] }],
  "email": { "to": "email destinataire", "subject": "sujet email", "body": "message email court et professionnel" },
  "warnings": ["points ambigus ou prix manquants"]
}

Regles:
- Type demande: ${documentType}.
- Utilise le design PDF existant: tu ne generes pas de PDF, seulement les donnees.
- Si une ou plusieurs images sont fournies, lis le texte visible comme des captures, photos de notes, courriels ou soumissions recues. Combine toutes les images avec le texte colle si les deux sont fournis.
- Si plusieurs images sont fournies, traite-les comme des pages ou photos du meme dossier client, dans l'ordre recu.
- Si une partie d'une image est illisible, ne l'invente pas; mets le point dans warnings.
- Si un PDF est fourni, le texte extrait est inclus sous "Texte extrait du PDF". Utilise-le comme le contenu original du document recu.
- Si le texte extrait du PDF semble incomplet, ambigu ou mal segmente, garde les champs certains seulement et mets le reste dans warnings.
- Les lignes avec prix clair vont dans items, ou dans sections[].items lorsqu'une unite/appartement est detecte.
- Si une ligne ou un bloc commence par APPARTEMENT, APT, APP, UNITE, LOCAL, BUREAU ou un code du genre E-0918, mets cette valeur dans sections[].unitCode et les lignes facturees qui suivent dans sections[].items.
- Quand une ligne est mise dans sections[].items, ne repete pas le code d'unite dans items.description.
- Si aucune unite n'est detectee, utilise items comme avant.
- Si des unites/appartements sont detectes pour un syndicat, gestionnaire, immeuble ou copropriete, utilise client.type "gestionnaire".
- Si au moins une ligne avec prix clair va dans items ou sections[].items, remplis aussi description avec un resume court des travaux confirmes.
- Les mentions sans prix clair ne vont pas dans items ni dans description; mets-les seulement dans warnings.
- Pour les warnings, conserve les mots du client autant que possible: "A confirmer: [texte original] (prix non fourni)".
- Si un mot semble incoherent mais la correction est evidente, applique la correction dans description/items et signale-la dans warnings. Exemple: "Relation de la porte patio" devient "Reparation de la porte patio" et ajoute un warning de correction appliquee.
- N'ajoute jamais "a commander", "a remplacer", "additionnel" ou une intention similaire si le message original ne le dit pas clairement.
- Si le message dit "Envoyer la facture a [email]" et que l'email identifie une entite de facturation, utilise cette entite comme client.name. Exemple: syndicat315@... => "Syndicat 315".
- Si le message commence par une compagnie suivie d'un email, exemple "Gestion Immobiliere Tremcor, aguay@...", mets la compagnie dans client.name et client.company, mets l'email dans client.email et email.to.
- Les personnes dans "coordonnees" sont des contacts; mets le meilleur contact humain dans client.contactName, mais ne remplace pas le client facture par ce contact si une entite de facturation est donnee.
- Ne mets pas type "gestionnaire" seulement parce qu'il y a un syndicat ou un condo; utilise "particulier" sauf si le message dit clairement gestionnaire, compagnie, compte commercial, immeuble ou contient des unites/appartements a facturer.
- Pour items.description, redige des lignes professionnelles et completes. Si le prix semble global pour la reparation, precise que main-d'oeuvre et pieces sont incluses.
- Si le texte dit "fenetre" avec charnieres, manivelle, mecanisme ou quincaillerie, il s'agit d'une reparation/remplacement de quincaillerie sur la fenetre. N'ecris jamais "remplacement d'une fenetre" sauf si le texte original dit clairement que la fenetre complete est remplacee.
- Ne calcule pas les taxes. Les prix unitaires sont avant taxes.
- Si le message donne un email ou dit "envoyer la facture a", mets cet email dans client.email et email.to.
- Mets les noms propres avec majuscules normales. Exemple: "claudine inizan" doit devenir "Claudine Inizan".
- email.body doit commencer par "Bonjour [nom complet]," ou "Hello [full name]," si la demande est en anglais.
- Pour un client B2B/gestionnaire/copropriete, email.body doit saluer client.contactName si disponible, jamais le nom de l'immeuble ou du syndicat. Exemple: pas "Bonjour Le Maronier,"; utiliser "Bonjour Marie-Claude Tremblay,".
- Pour un client particulier, email.body utilise le nom complet de client.name, pas seulement le premier prenom. Garde les noms composes, traits d'union, doubles noms et noms de famille complets.
- Personnalise email.body avec le type de document, les travaux/adresse ou le contexte utile detecte; evite un texte generique qui pourrait etre envoye a n'importe qui.
- Si la demande est en anglais, genere email.body en anglais. Sinon en francais quebecois professionnel.
- Pour une facture, sujet: "Facture Vosthermos - [client ou adresse]". Pour une soumission: "Soumission Vosthermos - [client ou adresse]".
- Le numero de telephone Vosthermos est ${COMPANY_INFO.phone}.`,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });
  } catch (err) {
    console.error("Anthropic draft error:", err.detail || err.message);
    return NextResponse.json({ error: err.message || "Erreur IA" }, { status: err.status || 500 });
  }

  try {
    const data = ai.data;
    const text = data.content?.[0]?.text || "";
    const draft = sanitizeDraft(parseJson(text), documentType, rawText);
    return NextResponse.json({ draft, analysisCost: ai.analysisCost });
  } catch (err) {
    console.error("[work-orders ai-draft] parse error:", err?.message || err);
    return NextResponse.json({ error: "Impossible de lire le brouillon IA" }, { status: 500 });
  }
}
