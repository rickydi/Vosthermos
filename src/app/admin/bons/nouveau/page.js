"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CatalogPicker from "@/components/admin/CatalogPicker";
import ClientPicker from "@/components/admin/ClientPicker";
import ThermosQuoteInline from "@/components/admin/ThermosQuoteInline";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { dateOnlyString, todayDateInput } from "@/lib/date-only";
import {
  DEFAULT_FOLLOW_UP_COLUMNS,
  FOLLOW_UP_COLUMNS_SETTINGS_KEY,
  followUpStatusFromWorkOrderStatut,
  normalizeFollowUpColumns,
  workOrderStatutFromFollowUpStatus,
} from "@/lib/follow-up-columns";
import { isInvoiceStatus, isQuoteStatus } from "@/lib/work-order-document";

const DRAFT_KEY = "vosthermos:nouveau-bon:draft";
const AI_IMAGE_SESSION_KEY = "vosthermos:nouveau-bon:ai-image";
const AI_ANALYSIS_SESSION_KEY = "vosthermos:nouveau-bon:ai-analysis";
const AI_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const AI_IMAGE_MAX_COUNT = 6;
const AI_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const AI_IMAGE_TOTAL_MAX_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes) {
  const size = Number(bytes) || 0;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function formatUsdCost(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "0.00 $ US";
  if (amount < 0.0001) return "<0.0001 $ US";
  if (amount < 0.01) return `${amount.toFixed(4)} $ US`;
  return `${amount.toFixed(2)} $ US`;
}

function formatTokenCount(value) {
  return new Intl.NumberFormat("fr-CA").format(Number(value || 0));
}

function readAiImageFile(file) {
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

function aiImageSrc(image) {
  if (!image) return "";
  if (image.url) return image.url;
  if (image.data && image.mediaType) return `data:${image.mediaType};base64,${image.data}`;
  return "";
}

function aiImageStorageKey(workOrderId) {
  return workOrderId ? `${AI_IMAGE_SESSION_KEY}:${workOrderId}` : `${AI_IMAGE_SESSION_KEY}:draft`;
}

function normalizeAiImages(value) {
  const images = Array.isArray(value) ? value : (value ? [value] : []);
  return images.filter((image) => aiImageSrc(image)).slice(0, AI_IMAGE_MAX_COUNT);
}

function aiImagesTotalSize(images) {
  return normalizeAiImages(images).reduce((sum, image) => sum + (Number(image.size) || 0), 0);
}

function saveAiImagesSession(images, workOrderId) {
  const cleanImages = normalizeAiImages(images);
  if (typeof window === "undefined" || cleanImages.length === 0) return;
  try {
    window.sessionStorage.setItem(aiImageStorageKey(workOrderId), JSON.stringify(cleanImages));
  } catch {}
}

function loadAiImagesSession(workOrderId) {
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

function clearAiImagesSession(workOrderId) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(aiImageStorageKey(workOrderId));
  } catch {}
}

function aiAnalysisStorageKey(workOrderId) {
  return workOrderId ? `${AI_ANALYSIS_SESSION_KEY}:${workOrderId}` : `${AI_ANALYSIS_SESSION_KEY}:draft`;
}

function normalizeAiAnalysisSession(value) {
  if (!value || typeof value !== "object") return null;
  const text = String(value.text || "");
  const draft = value.draft && typeof value.draft === "object" ? value.draft : null;
  const emailDraft = value.emailDraft && typeof value.emailDraft === "object" ? value.emailDraft : null;
  if (!text.trim() && !draft && !emailDraft) return null;
  return { text, draft, emailDraft };
}

function saveAiAnalysisSession(value, workOrderId) {
  const clean = normalizeAiAnalysisSession(value);
  if (typeof window === "undefined" || !clean) return;
  try {
    window.localStorage.setItem(aiAnalysisStorageKey(workOrderId), JSON.stringify(clean));
  } catch {}
}

function loadAiAnalysisSession(workOrderId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(aiAnalysisStorageKey(workOrderId));
    if (!raw) return null;
    return normalizeAiAnalysisSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clearAiAnalysisSession(workOrderId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(aiAnalysisStorageKey(workOrderId));
  } catch {}
}

function getNavigationType() {
  if (typeof window === "undefined") return "navigate";
  return window.performance?.getEntriesByType?.("navigation")?.[0]?.type || "navigate";
}

function shouldRestoreNewBonDraft({ freshDraft, resumeDraft }) {
  if (freshDraft) return false;
  if (resumeDraft) return true;
  return getNavigationType() === "reload";
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeTimeInput(value) {
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

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${pad2(hours)}:${pad2(minutes)}`;
  return {
    value,
    label: `${pad2(hours)}h${pad2(minutes)}`,
  };
});

const LABOR_HOUR_OPTIONS = Array.from({ length: 16 * 4 + 1 }, (_, index) => {
  const value = index / 4;
  return { value, label: formatLaborHours(value) };
});

function formatLaborHours(value) {
  const totalMinutes = Math.round(Number(value || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "0h";
  return `${hours > 0 ? `${hours}h` : ""}${minutes > 0 ? pad2(minutes) : ""}`;
}

function timeLabel(value) {
  const normalized = normalizeTimeInput(value);
  const found = TIME_OPTIONS.find((option) => option.value === normalized);
  if (found) return found.label;
  return normalized ? `${normalized} (heure existante)` : "";
}

function normalizeWorkItem(it) {
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

function TimeSelect({ label, value, onChange }) {
  const normalizedValue = normalizeTimeInput(value);
  const hasCustomValue = normalizedValue && !TIME_OPTIONS.some((option) => option.value === normalizedValue);

  return (
    <div>
      <label className="admin-text-muted text-xs mb-1 block">{label}</label>
      <select
        value={normalizedValue}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
      >
        <option value="">Aucune heure</option>
        {hasCustomValue && <option value={normalizedValue}>{timeLabel(normalizedValue)}</option>}
        {TIME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function LaborHoursSelect({ value, onChange }) {
  const normalized = Math.round(Number(value || 0) * 4) / 4;
  const hasCustomValue = normalized > 0 && !LABOR_HOUR_OPTIONS.some((option) => option.value === normalized);

  return (
    <select
      value={String(normalized)}
      onChange={(e) => onChange(Number(e.target.value))}
      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-36"
    >
      {hasCustomValue && <option value={String(normalized)}>{formatLaborHours(normalized)}</option>}
      {LABOR_HOUR_OPTIONS.map((option) => (
        <option key={option.value} value={String(option.value)}>{option.label}</option>
      ))}
    </select>
  );
}

function LaborRateInput({ value, onChange, onBlur }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="labor-rate" className="admin-text-muted text-xs font-bold whitespace-nowrap">Taux</label>
      <div className="relative">
        <input
          id="labor-rate"
          type="text"
          inputMode="decimal"
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input border rounded-lg pl-3 pr-10 py-2.5 text-sm w-28"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 admin-text-muted text-xs">$/h</span>
      </div>
    </div>
  );
}

function HelpBubble({ text }) {
  return (
    <span className="relative inline-flex items-center">
      <i className="fas fa-circle-question text-[11px] opacity-70"></i>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border admin-border bg-neutral-950 px-3 py-2 text-left text-[11px] font-normal leading-snug text-white shadow-xl group-hover:block group-focus-visible:block">
        {text}
      </span>
    </span>
  );
}

function MoneyLine({ label, value, muted = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${muted ? "text-xs" : "text-sm"}`}>
      <span className="admin-text-muted">{label}</span>
      <span className={muted ? "admin-text-muted" : "admin-text font-medium"}>{value}</span>
    </div>
  );
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function hasMeaningfulText(value) {
  return String(value || "").trim().length > 0;
}

function looksLikeProvinceOnly(value) {
  return /^(qc|quebec|québec)$/i.test(String(value || "").trim());
}

function looksLikeBusinessName(value) {
  return /\b(gestion|immobili|syndicat|condo|copropriete|copropriété|inc\.?|ltee|ltée|senc|s\.a\.|compagnie|corporation|groupe|proprietes|propriétés)\b/i
    .test(String(value || ""));
}

function draftBusinessName(draftClient = {}) {
  const company = String(draftClient.company || "").trim();
  if (company) return company;
  const name = String(draftClient.name || "").trim();
  return looksLikeBusinessName(name) ? name : "";
}

function clientMatchesDraft(client, draftClient = {}) {
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

const CLIENT_STOP_WORDS = new Set([
  "le", "la", "les", "l", "de", "du", "des", "d", "un", "une", "the",
  "gestion", "immobiliere", "immobilier", "syndicat", "copropriete", "condo",
  "inc", "ltee", "ltd", "compagnie", "corporation", "groupe",
]);

function normalizeClientLookupText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, " ")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripLeadingClientArticles(value) {
  return normalizeClientLookupText(value)
    .replace(/^(?:l |le |la |les |de |du |des |d |un |une |the )+/i, "")
    .trim();
}

function stripLeadingClientArticlesRaw(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:l['’]\s*|le\s+|la\s+|les\s+|de\s+|du\s+|des\s+|d['’]\s*|un\s+|une\s+|the\s+)/i, "")
    .trim();
}

function clientLookupTokens(value) {
  return Array.from(new Set(
    normalizeClientLookupText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !CLIENT_STOP_WORDS.has(token))
  ));
}

function textSimilarityScore(a, b) {
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

function wordSimilarityScore(a, b) {
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

function bestSimilarity(leftValues, rightValues) {
  let best = 0;
  for (const left of leftValues) {
    for (const right of rightValues) {
      best = Math.max(best, textSimilarityScore(left, right));
    }
  }
  return best;
}

function scoreClientForDraft(client, draftClient = {}) {
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

function clientSearchQueriesForDraft(draftClient = {}) {
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

function decorateClientSuggestion(client, score, reasons) {
  return {
    ...client,
    matchScore: score,
    matchReasons: reasons.length ? reasons : ["Client semblable"],
  };
}

async function findClientCandidatesForAiDraft(draftClient = {}) {
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

function formatDraftClientLine(draftClient = {}) {
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

function resolveAiEmailDraft(aiDraft = {}, client = null) {
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

function formatEmailDraftNote(emailDraft) {
  if (!emailDraft?.body) return "";
  return [
    "Email IA propose:",
    emailDraft.to ? `Destinataire: ${emailDraft.to}` : null,
    emailDraft.subject ? `Sujet: ${emailDraft.subject}` : null,
    "",
    emailDraft.body,
  ].filter((line) => line !== null).join("\n");
}

function appendUniqueNoteBlocks(current, blocks) {
  const existing = String(current || "").trim();
  const nextBlocks = blocks
    .map((block) => String(block || "").trim())
    .filter(Boolean)
    .filter((block) => !existing.includes(block.slice(0, Math.min(block.length, 220))));
  if (nextBlocks.length === 0) return existing;
  return [existing, nextBlocks.join("\n\n")].filter(Boolean).join("\n\n");
}

function draftItemsToWorkItems(items = []) {
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

function draftSectionsToWorkSections(sections = []) {
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

function draftSectionItems(sections = []) {
  return draftSectionsToWorkSections(sections).flatMap((section) => section.items);
}

function descriptionFromAiDraft(draft = {}) {
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

function emailDraftStorageKey(workOrderId) {
  return `vosthermos:document-email-draft:${workOrderId}`;
}

function followUpDateLabel(value) {
  const date = dateOnlyString(value);
  return date ? ` | ${date}` : "";
}

export default function NouveauBonPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8 admin-text-muted"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</div>}>
      <NouveauBonAdmin />
    </Suspense>
  );
}

function NouveauBonAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const invoiceMode = searchParams.get("mode") === "invoice";
  const quoteMode = searchParams.get("mode") === "quote";
  const freshDraft = searchParams.get("fresh") === "1";
  const resumeDraft = searchParams.get("draft") === "1";
  const presetClientId = searchParams.get("clientId");
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null);
  const [error, setError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(null); // verrou optimiste anti-ecrasement

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [quickClient, setQuickClient] = useState({
    name: "",
    phone: "",
    secondaryPhone: "",
    contactName: "",
    friendlyEmail: false,
    email: "",
    address: "",
    city: "",
    postalCode: "",
    type: "particulier",
  });
  const clientTimer = useRef(null);
  const draftReady = useRef(false);

  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");

  const [date, setDate] = useState(() => todayDateInput());
  const [heureArrivee, setHeureArrivee] = useState("");
  const [heureDepart, setHeureDepart] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [currentStatut, setCurrentStatut] = useState(null);
  const [followUpStatus, setFollowUpStatus] = useState(() => followUpStatusFromWorkOrderStatut("draft"));
  const [selectedFollowUpId, setSelectedFollowUpId] = useState("");
  const [linkedFollowUp, setLinkedFollowUp] = useState(null);
  const [followUpOptions, setFollowUpOptions] = useState([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [followUpColumns, setFollowUpColumns] = useState(DEFAULT_FOLLOW_UP_COLUMNS);
  const [interventionAddress, setInterventionAddress] = useState("");
  const [interventionCity, setInterventionCity] = useState("");
  const [interventionPostalCode, setInterventionPostalCode] = useState("");
  const [visibleAuClient, setVisibleAuClient] = useState(true);

  const [items, setItems] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogTarget, setCatalogTarget] = useState(null); // null = flat, number = section index
  const [thermosCalculatorActive, setThermosCalculatorActive] = useState(false);

  const [services, setServices] = useState([]);
  const [knownUnits, setKnownUnits] = useState([]);
  const [sections, setSections] = useState([]); // [{unitCode, items:[]}]
  const [newUnitCode, setNewUnitCode] = useState("");

  const [laborHours, setLaborHours] = useState(0);
  const [laborRate, setLaborRate] = useState(85);
  const [laborRateText, setLaborRateText] = useState("85.00");
  const [settings, setSettings] = useState({ labor_rate_per_hour: 85, tps_rate: 0.05, tvq_rate: 0.09975 });
  const [aiImportText, setAiImportText] = useState("");
  const [aiImportImages, setAiImportImages] = useState([]);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiDraftError, setAiDraftError] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftApplying, setAiDraftApplying] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState("");
  const [aiClientSuggestions, setAiClientSuggestions] = useState([]);
  const [aiClientSuggestionLoading, setAiClientSuggestionLoading] = useState(false);
  const [aiClientLookupComplete, setAiClientLookupComplete] = useState(false);
  const [aiEmailDraft, setAiEmailDraft] = useState(null);
  const [aiImagePreviewIndex, setAiImagePreviewIndex] = useState(null);
  const aiImageInputRef = useRef(null);

  const isB2B = selectedClient?.type === "gestionnaire" || sections.length > 0;

  function setLaborRateValue(value) {
    const parsedRate = Number(value);
    const nextRate = Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 85;
    setLaborRate(nextRate);
    setLaborRateText(nextRate.toFixed(2));
  }

  function handleLaborRateInput(rawValue) {
    const raw = rawValue.replace(/[^0-9.,]/g, "");
    setLaborRateText(raw);
    const nextRate = Number(raw.replace(",", "."));
    if (raw !== "" && Number.isFinite(nextRate) && nextRate > 0) {
      setLaborRate(nextRate);
    }
  }

  function commitLaborRateInput() {
    const nextRate = Number(String(laborRateText).replace(",", "."));
    setLaborRateValue(Number.isFinite(nextRate) && nextRate > 0 ? nextRate : laborRate);
  }

  useEffect(() => {
    fetch("/api/admin/technicians")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTechnicians(data.filter((t) => t.isActive)); })
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const nextLaborRate = parseFloat(data.labor_rate_per_hour || 85);
          const shouldRestoreDraft = shouldRestoreNewBonDraft({ freshDraft, resumeDraft });
          let shouldUseSettingsRate = !editId;
          if (!editId && shouldRestoreDraft) {
            try {
              const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "{}");
              if (draft.laborRate !== undefined) shouldUseSettingsRate = false;
            } catch {}
          }
          if (shouldUseSettingsRate) setLaborRateValue(nextLaborRate);
          setSettings({
            labor_rate_per_hour: nextLaborRate,
            tps_rate: parseFloat(data.tps_rate || 0.05),
            tvq_rate: parseFloat(data.tvq_rate || 0.09975),
          });
        }
      })
      .catch(() => {});
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setServices(d); })
      .catch(() => {});
    fetch(`/api/admin/settings?key=${FOLLOW_UP_COLUMNS_SETTINGS_KEY}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.value) return;
        setFollowUpColumns(normalizeFollowUpColumns(JSON.parse(data.value)));
      })
      .catch(() => {});
  }, [editId, freshDraft, resumeDraft]);

  useEffect(() => {
    if (editId) {
      draftReady.current = true;
      return;
    }
    if (freshDraft) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
        clearAiAnalysisSession();
      } catch {}
      draftReady.current = true;
      return;
    }
    if (!shouldRestoreNewBonDraft({ freshDraft, resumeDraft })) {
      draftReady.current = true;
      return;
    }

    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.selectedClient) setSelectedClient(draft.selectedClient);
      if (draft.technicianId !== undefined) setTechnicianId(draft.technicianId);
      if (draft.date) setDate(draft.date);
      if (draft.heureArrivee !== undefined) setHeureArrivee(draft.heureArrivee);
      if (draft.heureDepart !== undefined) setHeureDepart(draft.heureDepart);
      if (draft.description !== undefined) setDescription(draft.description);
      if (draft.notes !== undefined) setNotes(draft.notes);
      if (draft.followUpStatus) setFollowUpStatus(draft.followUpStatus);
      if (draft.selectedFollowUpId !== undefined) setSelectedFollowUpId(draft.selectedFollowUpId);
      if (draft.interventionAddress !== undefined) setInterventionAddress(draft.interventionAddress);
      if (draft.interventionCity !== undefined) setInterventionCity(draft.interventionCity);
      if (draft.interventionPostalCode !== undefined) setInterventionPostalCode(draft.interventionPostalCode);
      if (draft.visibleAuClient !== undefined) setVisibleAuClient(draft.visibleAuClient);
      if (Array.isArray(draft.items)) setItems(draft.items);
      if (Array.isArray(draft.sections)) setSections(draft.sections);
      if (draft.laborHours !== undefined) setLaborHours(draft.laborHours);
      if (draft.laborRate !== undefined) setLaborRateValue(Number(draft.laborRate) || 85);
      if (draft.aiImportText !== undefined) setAiImportText(draft.aiImportText);
      if (draft.aiDraft && typeof draft.aiDraft === "object") setAiDraft(draft.aiDraft);
      if (draft.aiEmailDraft && typeof draft.aiEmailDraft === "object") setAiEmailDraft(draft.aiEmailDraft);
      const savedAi = loadAiAnalysisSession();
      if (savedAi) {
        setAiImportText(savedAi.text || "");
        if (savedAi.draft) setAiDraft(savedAi.draft);
        if (savedAi.emailDraft) setAiEmailDraft(savedAi.emailDraft);
      }
      const savedImages = loadAiImagesSession();
      if (savedImages) setAiImportImages(savedImages);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      draftReady.current = true;
    }
  }, [editId, freshDraft, resumeDraft]);

  useEffect(() => {
    if (editId || !draftReady.current) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
          selectedClient,
          technicianId,
          date,
          heureArrivee,
          heureDepart,
          description,
          notes,
          followUpStatus,
          selectedFollowUpId,
          interventionAddress,
          interventionCity,
          interventionPostalCode,
          visibleAuClient,
          items,
          sections,
          laborHours,
          laborRate,
          aiImportText,
          aiDraft,
          aiEmailDraft,
        }));
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [
    editId,
    selectedClient,
    technicianId,
    date,
    heureArrivee,
    heureDepart,
    description,
    notes,
    followUpStatus,
    selectedFollowUpId,
    interventionAddress,
    interventionCity,
    interventionPostalCode,
    visibleAuClient,
    items,
    sections,
    laborHours,
    laborRate,
    aiImportText,
    aiDraft,
    aiEmailDraft,
  ]);

  useEffect(() => {
    if (!aiDraft?.client || selectedClient) {
      setAiClientSuggestions([]);
      setAiClientSuggestionLoading(false);
      setAiClientLookupComplete(false);
      return;
    }

    let cancelled = false;
    setAiClientSuggestionLoading(true);
    setAiClientLookupComplete(false);

    findClientCandidatesForAiDraft(aiDraft.client)
      .then(({ exact, suggestions }) => {
        if (cancelled) return;
        setAiClientSuggestions(exact ? [exact, ...suggestions] : suggestions);
      })
      .catch(() => {
        if (!cancelled) setAiClientSuggestions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setAiClientSuggestionLoading(false);
        setAiClientLookupComplete(true);
      });

    return () => {
      cancelled = true;
    };
  }, [aiDraft, selectedClient]);

  // Fetch known units when a gestionnaire client is selected
  useEffect(() => {
    if (!selectedClient?.id || selectedClient.type !== "gestionnaire") {
      setKnownUnits([]);
      return;
    }
    fetch(`/api/admin/clients/${selectedClient.id}/units`)
      .then((r) => r.json())
      .then((d) => setKnownUnits(Array.isArray(d) ? d.filter((u) => u.isActive) : []))
      .catch(() => setKnownUnits([]));
  }, [selectedClient, editId]);

  useEffect(() => {
    if (!selectedClient?.id) {
      setFollowUpOptions([]);
      setLoadingFollowUps(false);
      return;
    }

    let cancelled = false;
    setLoadingFollowUps(true);
    fetch(`/api/admin/follow-ups?clientId=${selectedClient.id}&status=active&activity=0&limit=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFollowUpOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFollowUpOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFollowUps(false);
      });

    return () => { cancelled = true; };
  }, [selectedClient?.id]);

  // Load existing bon when ?edit=<id>
  useEffect(() => {
    if (!editId) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/work-orders/${editId}`);
        if (!res.ok) throw new Error("Bon introuvable");
        const wo = await res.json();
        setLoadedUpdatedAt(wo.updatedAt || null);
        setSelectedClient(wo.client);
        setTechnicianId(wo.technicianId ? String(wo.technicianId) : "");
        setDate(dateOnlyString(wo.date) || todayDateInput());
        const fmtHM = (dt) => {
          if (!dt) return "";
          const d = new Date(dt);
          return isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        };
        setHeureArrivee(fmtHM(wo.arrivalAt));
        setHeureDepart(fmtHM(wo.departureAt));
        setDescription(wo.description || "");
        setNotes(wo.notes || "");
        setCurrentStatut(wo.statut || null);
        setFollowUpStatus(wo.followUpStatus || followUpStatusFromWorkOrderStatut(wo.statut || "draft"));
        setLinkedFollowUp(wo.followUp || null);
        setSelectedFollowUpId(wo.followUp?.id ? String(wo.followUp.id) : "");
        setInterventionAddress(wo.interventionAddress || "");
        setInterventionCity(wo.interventionCity || "");
        setInterventionPostalCode(wo.interventionPostalCode || "");
        setVisibleAuClient(wo.visibleAuClient ?? true);
        setItems(Array.isArray(wo.items) ? wo.items.filter((item) => !item.sectionId).map(normalizeWorkItem) : []);
        setSections(Array.isArray(wo.sections) ? wo.sections.map((s) => ({
          unitCode: s.unitCode,
          items: (s.items || []).map(normalizeWorkItem),
        })) : []);
        // Reverse-compute laborHours from the rate frozen on this work order.
        const rate = Number(wo.laborRate) || settings.labor_rate_per_hour || 85;
        setLaborRateValue(rate);
        setLaborHours(rate > 0 ? Math.round((Number(wo.totalLabor) / rate) * 100) / 100 : 0);
        const savedImages = loadAiImagesSession(editId);
        if (savedImages) setAiImportImages(savedImages);
        const savedAi = loadAiAnalysisSession(editId);
        if (savedAi) {
          setAiImportText(savedAi.text || "");
          if (savedAi.draft) setAiDraft(savedAi.draft);
          if (savedAi.emailDraft) setAiEmailDraft(savedAi.emailDraft);
        }
      } catch (err) {
        setError(err.message || "Erreur chargement");
      } finally {
        setLoadingEdit(false);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Pre-selection du client quand on arrive depuis la centrale (?clientId=).
  useEffect(() => {
    if (editId || !presetClientId) return;
    let cancelled = false;
    fetch(`/api/admin/clients/${presetClientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((client) => { if (!cancelled && client?.id) setSelectedClient(client); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [presetClientId, editId]);

  useEffect(() => {
    if (clientSearch.length < 2 || selectedClient) { setClientResults([]); return; }
    clearTimeout(clientTimer.current);
    clientTimer.current = setTimeout(() => {
      fetch(`/api/admin/clients?q=${encodeURIComponent(clientSearch)}`)
        .then((r) => r.json())
        .then((data) => setClientResults(data.clients || []))
        .catch(() => {});
    }, 300);
  }, [clientSearch, selectedClient]);

  function addProduct(p) {
    const item = {
      productId: p.id,
      description: `${p.sku} — ${p.name}`,
      quantity: 1,
      unitPrice: Number(p.price),
      itemType: "piece",
    };
    if (catalogTarget !== null) {
      setSections((prev) => prev.map((s, i) => i === catalogTarget ? { ...s, items: [...s.items, item] } : s));
    } else {
      setItems((prev) => [...prev, item]);
    }
    setCatalogOpen(false);
    setCatalogTarget(null);
  }

  function addCustomItem() {
    setItems((prev) => [...prev, { productId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }]);
  }

  function buildThermosItems(quote) {
    const optionLabels = {
      easy: "acces facile",
      medium: "acces moyen",
      hard: "acces difficile",
    };
    const thermosItems = quote.lines.map((line, index) => {
      const options = [
        line.lowE ? "Low-E" : null,
        line.argon ? "argon" : null,
        line.tempered ? "trempe" : null,
        line.grill ? "carrelage" : null,
        optionLabels[line.access] || null,
        line.note ? `note: ${line.note}` : null,
      ].filter(Boolean).join(", ") || "standard";

      return {
        productId: null,
        serviceId: null,
        description: `Thermos ${index + 1}: ${line.width}" x ${line.height}" (${line.sqftPerUnit} pi2/unite) - ${options}`,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitSubtotal) || 0,
        itemType: "piece",
      };
    });

    if (Number(quote.totals.tripFee) > 0) {
      thermosItems.push({
        productId: null,
        serviceId: null,
        description: "Frais deplacement thermos",
        quantity: 1,
        unitPrice: Number(quote.totals.tripFee),
        itemType: "piece",
      });
    }

    if (Number(quote.totals.margin) > 0) {
      thermosItems.push({
        productId: null,
        serviceId: null,
        description: "Marge/admin thermos",
        quantity: 1,
        unitPrice: Number(quote.totals.margin),
        itemType: "piece",
      });
    }

    return thermosItems;
  }

  function addThermosQuoteToBon(quote, destination = "flat") {
    const thermosItems = buildThermosItems(quote);
    const sectionMatch = String(destination).match(/^section:(\d+)$/);

    if (isB2B && sectionMatch) {
      const sectionIndex = Number(sectionMatch[1]);
      setSections((prev) => prev.map((section, index) => (
        index === sectionIndex ? { ...section, items: [...section.items, ...thermosItems] } : section
      )));
      return;
    }

    setItems((prev) => [...prev, ...thermosItems]);
  }

  // ─── Sections (B2B) ─────────────────────────────────────────
  function addSection() {
    const code = newUnitCode.trim().toUpperCase();
    if (!code || !selectedClient) return;

    // 1. Deja dans le bon courant ?
    if (sections.some((s) => s.unitCode === code)) {
      setError(`Unite ${code} deja ajoutee a ce bon.`);
      return;
    }

    // 2. Deja connue chez le client ? -> utiliser la version canonique
    const existing = knownUnits.find((u) => u.code === code);
    if (existing) {
      setSections((prev) => [...prev, { unitCode: existing.code, items: [] }]);
      setNewUnitCode("");
      setError("");
      return;
    }

    // Nouvelle unite: on l'ajoute seulement au bon. Elle sera creee en DB au moment d'enregistrer.
    setSections((prev) => [...prev, { unitCode: code, items: [] }]);
    setNewUnitCode("");
    setError("");
  }
  function addSectionFromKnown(u) {
    if (sections.some((s) => s.unitCode === u.code)) return;
    setSections((prev) => [...prev, { unitCode: u.code, items: [] }]);
  }
  function removeSection(idx) {
    if (!confirm("Retirer cette unite et ses items?")) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
  }
  function addServiceToSection(sectionIdx, service) {
    const item = {
      serviceId: service.id,
      description: service.name,
      quantity: 1,
      unitPrice: Number(service.price),
      itemType: "piece",
    };
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? { ...s, items: [...s.items, item] } : s));
  }
  function addCustomToSection(sectionIdx) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: [...s.items, { productId: null, serviceId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }],
    } : s));
  }
  function updateSectionItem(sectionIdx, itemIdx, field, value) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: s.items.map((it, j) => j === itemIdx ? { ...it, [field]: value } : it),
    } : s));
  }
  function removeSectionItem(sectionIdx, itemIdx) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: s.items.filter((_, j) => j !== itemIdx),
    } : s));
  }
  function openCatalogForSection(sectionIdx) {
    setCatalogTarget(sectionIdx);
    setCatalogOpen(true);
  }

  function addDiscount(mode) {
    setItems((prev) => [...prev, {
      productId: null,
      description: mode === "percent" ? "Escompte" : "Reduction",
      quantity: 1,
      unitPrice: 0,
      itemType: "discount",
      discountMode: mode, // "percent" or "amount"
      discountPercent: mode === "percent" ? 10 : 0,
      discountAmount: mode === "amount" ? 0 : 0,
    }]);
  }

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Base subtotal = pieces only (no labor, no discounts) — used as the denominator for % discounts
  const flatPiecesSubtotalBase = items
    .filter((it) => it.itemType !== "discount")
    .reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const sectionPiecesSubtotalBase = sections.reduce((s, sec) => (
    s + sec.items
      .filter((it) => it.itemType !== "discount")
      .reduce((ss, it) => ss + Number(it.quantity) * Number(it.unitPrice), 0)
  ), 0);
  const piecesSubtotalBase = flatPiecesSubtotalBase + sectionPiecesSubtotalBase;

  // Compute effective unitPrice for each discount line based on current base
  const itemsComputed = items.map((it) => {
    if (it.itemType !== "discount") return it;
    let amount = 0;
    if (it.discountMode === "percent") {
      amount = -((Number(it.discountPercent) || 0) / 100) * piecesSubtotalBase;
    } else {
      amount = -Math.abs(Number(it.discountAmount) || 0);
    }
    return { ...it, unitPrice: Math.round(amount * 100) / 100 };
  });

  const flatPieces = itemsComputed.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const sectionsPieces = sections.reduce((s, sec) => s + sec.items.reduce((ss, it) => ss + Number(it.quantity) * Number(it.unitPrice), 0), 0);
  const totalPieces = flatPieces + sectionsPieces;
  const totalLabor = Number(laborHours) * laborRate;
  const subtotal = totalPieces + totalLabor;
  const tps = subtotal * settings.tps_rate;
  const tvq = subtotal * settings.tvq_rate;
  const total = subtotal + tps + tvq;

  function fillInterventionFromClient(client, previousClient = null, force = false) {
    if (!client) return;
    const nextAddress = client.address || "";
    const nextCity = client.city || "";
    const nextPostal = client.postalCode || "";
    const previousAddress = previousClient?.address || "";
    const previousCity = previousClient?.city || "";
    const previousPostal = previousClient?.postalCode || "";

    setInterventionAddress((current) => (
      force || !current || (previousClient && current === previousAddress) ? nextAddress : current
    ));
    setInterventionCity((current) => (
      force || !current || (previousClient && current === previousCity) ? nextCity : current
    ));
    setInterventionPostalCode((current) => (
      force || !current || (previousClient && current === previousPostal) ? nextPostal : current
    ));
  }

  function selectClient(client) {
    const previousClient = selectedClient;
    setSelectedClient(client);
    if (previousClient?.id !== client?.id) {
      setSelectedFollowUpId("");
      setLinkedFollowUp(null);
    }
    fillInterventionFromClient(client, previousClient);
  }

  function clearSelectedClient() {
    const previousClient = selectedClient;
    if (previousClient) {
      setInterventionAddress((current) => current === (previousClient.address || "") ? "" : current);
      setInterventionCity((current) => current === (previousClient.city || "") ? "" : current);
      setInterventionPostalCode((current) => current === (previousClient.postalCode || "") ? "" : current);
    }
    setSelectedClient(null);
    setSelectedFollowUpId("");
    setLinkedFollowUp(null);
  }

  async function createQuickClient() {
    if (!quickClient.name.trim()) {
      setError("Nom du client requis");
      return;
    }

    setCreatingClient(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quickClient,
          name: quickClient.name.trim(),
          phone: quickClient.phone.trim() || null,
          secondaryPhone: quickClient.secondaryPhone.trim() || null,
          contactName: quickClient.contactName.trim() || null,
          friendlyEmail: quickClient.type === "gestionnaire" && quickClient.friendlyEmail === true,
          email: quickClient.email.trim() || null,
          address: quickClient.address.trim() || null,
          city: quickClient.city.trim() || null,
          postalCode: quickClient.postalCode.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur creation client");
      }
      const client = await res.json();
      selectClient(client);
      setClientSearch("");
      setClientResults([]);
      setQuickClientOpen(false);
      setQuickClient({
        name: "",
        phone: "",
        secondaryPhone: "",
        contactName: "",
        friendlyEmail: false,
        email: "",
        address: "",
        city: "",
        postalCode: "",
        type: "particulier",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingClient(false);
    }
  }

  function selectAiClientSuggestion(client) {
    if (!client?.id) return;
    selectClient(client);
    setClientSearch("");
    setClientResults([]);
    setQuickClientOpen(false);
    setAiClientSuggestions([]);
    setAiClientLookupComplete(false);
    const scoreLabel = client.matchScore ? ` (${Math.round(client.matchScore)}%)` : "";
    setAiDraftMessage(`Client selectionne: ${client.name}${scoreLabel}. Clique sur "Appliquer au formulaire" pour remplir le document.`);
  }

  async function createClientForAiDraft(draftClient = {}, options = {}) {
    const name = String(draftClient.name || draftClient.company || draftClient.email || draftClient.phone || "Client a verifier").trim();
    const type = options.forceGestionnaire || draftClient.type === "gestionnaire" ? "gestionnaire" : "particulier";
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        company: draftClient.company || (looksLikeBusinessName(name) ? name : null),
        phone: draftClient.phone || null,
        secondaryPhone: draftClient.secondaryPhone || null,
        contactName: draftClient.contactName || null,
        friendlyEmail: type === "gestionnaire",
        email: draftClient.email || null,
        address: draftClient.address || null,
        city: draftClient.city || null,
        postalCode: draftClient.postalCode || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erreur creation client IA");
    return data;
  }

  async function createAiDraftClientAndSelect() {
    if (!aiDraft || aiDraftApplying) return;
    setAiDraftApplying(true);
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const draftClient = aiDraft.client || {};
      const hasDraftSections = draftSectionsToWorkSections(aiDraft.sections).length > 0;
      const client = await createClientForAiDraft(draftClient, { forceGestionnaire: hasDraftSections });
      selectClient(client);
      setClientSearch("");
      setClientResults([]);
      setQuickClientOpen(false);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
      setAiDraftMessage(`Nouveau client ajoute: ${client.name}. Clique sur "Appliquer au formulaire" pour remplir le document.`);
    } catch (err) {
      setAiDraftError(err.message);
    } finally {
      setAiDraftApplying(false);
    }
  }

  async function updateClientFromAiDraft(client, draftClient = {}, options = {}) {
    if (!client?.id) return { client, changed: false, error: "" };
    const data = {};
    const typeShouldBeGestionnaire = options.forceGestionnaire || draftClient.type === "gestionnaire";
    const businessName = draftBusinessName(draftClient);
    const contactName = String(draftClient.contactName || "").trim();
    const email = String(draftClient.email || "").trim();
    const phone = String(draftClient.phone || "").trim();
    const secondaryPhone = String(draftClient.secondaryPhone || "").trim();

    if (typeShouldBeGestionnaire && client.type !== "gestionnaire") {
      data.type = "gestionnaire";
      data.friendlyEmail = true;
    }
    if (businessName && (!hasMeaningfulText(client.company) || looksLikeProvinceOnly(client.company))) {
      data.company = businessName;
    }
    if (contactName && !hasMeaningfulText(client.contactName)) data.contactName = contactName;
    if (email && !hasMeaningfulText(client.email)) data.email = email;
    if (phone && !hasMeaningfulText(client.phone)) data.phone = phone;
    if (
      secondaryPhone &&
      !hasMeaningfulText(client.secondaryPhone) &&
      onlyDigits(secondaryPhone) !== onlyDigits(client.phone || phone)
    ) {
      data.secondaryPhone = secondaryPhone;
    }
    if (draftClient.address && !hasMeaningfulText(client.address)) data.address = draftClient.address;
    if (draftClient.city && !hasMeaningfulText(client.city)) data.city = draftClient.city;
    if (draftClient.postalCode && !hasMeaningfulText(client.postalCode)) data.postalCode = draftClient.postalCode;

    if (Object.keys(data).length === 0) return { client, changed: false, error: "" };
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { client, changed: false, error: error.error || "Fiche client non mise a jour" };
    }
    const updated = await res.json().catch(() => null);
    return { client: updated?.id ? updated : { ...client, ...data }, changed: true, error: "" };
  }

  async function attachAiImportImages(filesInput) {
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const files = Array.from(filesInput || []).filter((file) => file?.type?.startsWith("image/"));
      if (files.length === 0) return;
      if (aiImportImages.length + files.length > AI_IMAGE_MAX_COUNT) {
        throw new Error(`Maximum ${AI_IMAGE_MAX_COUNT} images par analyse.`);
      }
      const images = await Promise.all(files.map(readAiImageFile));
      const nextImages = [...aiImportImages, ...images];
      if (aiImagesTotalSize(nextImages) > AI_IMAGE_TOTAL_MAX_BYTES) {
        throw new Error(`Images trop lourdes ensemble. Maximum ${formatBytes(AI_IMAGE_TOTAL_MAX_BYTES)} au total.`);
      }
      setAiImportImages(nextImages);
      setAiDraft(null);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
      saveAiImagesSession(nextImages, editId);
    } catch (err) {
      setAiDraftError(err.message || "Impossible d'ajouter les images");
    }
  }

  function handleAiPaste(event) {
    const itemsList = Array.from(event.clipboardData?.items || []);
    const files = itemsList
      .filter((item) => item.kind === "file" && item.type?.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (files.length === 0) return;
    event.preventDefault();
    attachAiImportImages(files);
  }

  const effectiveInvoiceMode = invoiceMode || isInvoiceStatus(currentStatut);
  const effectiveQuoteMode = quoteMode || isQuoteStatus(currentStatut);
  const showDocumentAssistant = effectiveInvoiceMode || effectiveQuoteMode;
  const isExistingInvoiceDocument = Boolean(editId && !invoiceMode && isInvoiceStatus(currentStatut));
  const isExistingQuoteDocument = Boolean(editId && !quoteMode && isQuoteStatus(currentStatut));
  const isExistingInvoiceSaved = Boolean(editId && isInvoiceStatus(currentStatut));
  const isExistingQuoteSaved = Boolean(editId && isQuoteStatus(currentStatut));
  const aiImagePreviewImage = Number.isInteger(aiImagePreviewIndex) ? aiImportImages[aiImagePreviewIndex] : null;
  const aiImagePreviewSrc = aiImageSrc(aiImagePreviewImage);
  const hasAiImages = aiImportImages.length > 0;

  async function analyzeAiDocumentDraft() {
    if ((!aiImportText.trim() && !hasAiImages) || aiDraftLoading) return;
    setAiDraftLoading(true);
    setAiDraftError("");
    setAiDraftMessage("");
    setAiClientSuggestions([]);
    setAiClientLookupComplete(false);
    try {
      const documentType = effectiveQuoteMode ? "quote" : "invoice";
      const res = await fetch("/api/admin/work-orders/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiImportText, images: aiImportImages, documentType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur analyse IA");
      const nextDraft = data.draft ? { ...data.draft, analysisCost: data.analysisCost || null } : null;
      const nextEmailDraft = nextDraft ? resolveAiEmailDraft(nextDraft, selectedClient) : null;
      setAiDraft(nextDraft);
      setAiEmailDraft(nextEmailDraft);
      saveAiAnalysisSession({ text: aiImportText, draft: nextDraft, emailDraft: nextEmailDraft }, editId);
    } catch (err) {
      setAiDraftError(err.message);
      setAiDraft(null);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
    } finally {
      setAiDraftLoading(false);
    }
  }

  async function applyAiDocumentDraft() {
    if (!aiDraft || aiDraftApplying) return;
    setAiDraftApplying(true);
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const draftClient = aiDraft.client || {};
      const draftSections = draftSectionsToWorkSections(aiDraft.sections);
      const hasDraftSections = draftSections.length > 0;
      let client = selectedClient;
      let clientAction = "Client conserve";
      if (!client) {
        const { exact, suggestions } = await findClientCandidatesForAiDraft(draftClient);
        if (exact) {
          client = exact;
          clientAction = "Client existant utilise";
        } else if (suggestions.length > 0) {
          setAiClientSuggestions(suggestions);
          setAiClientLookupComplete(true);
          setAiDraftMessage("Clients semblables trouves. Clique sur le bon client dans les choix proposes, ou cree un nouveau client si aucun ne correspond.");
          return;
        } else {
          const shouldCreateClient = window.confirm(
            `Nouveau client detecte.\n\nAucun client existant n'a ete trouve dans la base de donnees pour:\n\n${formatDraftClientLine(draftClient)}\n\nVoulez-vous l'ajouter a la base de donnees et appliquer au formulaire?`
          );
          if (!shouldCreateClient) {
            setAiDraftMessage("Application annulee. Aucun client cree.");
            return;
          }
          client = await createClientForAiDraft(draftClient, { forceGestionnaire: hasDraftSections });
          clientAction = "Nouveau client ajoute";
        }
        selectClient(client);
        setClientSearch("");
        setClientResults([]);
        setQuickClientOpen(false);
        setAiClientSuggestions([]);
        setAiClientLookupComplete(false);
      }
      const clientUpdate = await updateClientFromAiDraft(client, draftClient, { forceGestionnaire: hasDraftSections });
      let clientUpdateMessage = "";
      if (clientUpdate.changed) {
        client = clientUpdate.client;
        selectClient(client);
        clientUpdateMessage = " Fiche client enrichie.";
      } else if (clientUpdate.error) {
        clientUpdateMessage = ` Fiche client a verifier: ${clientUpdate.error}`;
      }

      setInterventionAddress(aiDraft.intervention?.address || draftClient.address || "");
      setInterventionCity(aiDraft.intervention?.city || draftClient.city || "");
      setInterventionPostalCode(aiDraft.intervention?.postalCode || draftClient.postalCode || "");
      const nextDescription = descriptionFromAiDraft(aiDraft);
      setDescription(nextDescription || description);
      setItems(draftItemsToWorkItems(aiDraft.items));
      setSections(draftSections);
      setLaborHours(0);

      const emailDraft = resolveAiEmailDraft(aiDraft, client);
      setAiEmailDraft(emailDraft);
      saveAiAnalysisSession({ text: aiImportText, draft: aiDraft, emailDraft }, editId);

      const noteParts = [];
      if (aiImportText.trim()) noteParts.push(`Texte analyse client:\n${aiImportText.trim()}`);
      if (emailDraft?.body) noteParts.push(formatEmailDraftNote(emailDraft));
      if (Array.isArray(aiDraft.warnings) && aiDraft.warnings.length > 0) {
        noteParts.push(`A verifier:\n- ${aiDraft.warnings.join("\n- ")}`);
      }
      if (noteParts.length > 0) {
        setNotes((current) => appendUniqueNoteBlocks(current, noteParts));
      }

      const sectionMessage = hasDraftSections ? ` ${draftSections.length} unite${draftSections.length > 1 ? "s" : ""} ajoutee${draftSections.length > 1 ? "s" : ""}.` : "";
      setAiDraftMessage(`${clientAction}.${clientUpdateMessage} Brouillon applique au formulaire.${sectionMessage}`);
    } catch (err) {
      setAiDraftError(err.message);
    } finally {
      setAiDraftApplying(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClient) { setError("Client requis"); return; }
    const submitAction = e.nativeEvent?.submitter?.value || (invoiceMode ? "invoice" : quoteMode ? "quote" : "save");
    const normalizedArrival = normalizeTimeInput(heureArrivee);
    const normalizedDeparture = normalizeTimeInput(heureDepart);
    if (heureArrivee && !normalizedArrival) { setError("Heure d'arrivee invalide"); return; }
    if (heureDepart && !normalizedDeparture) { setError("Heure de depart invalide"); return; }

    setSaving(true);
    setSavingAction(submitAction);
    setError("");
    try {
      const saveOnlyAction = submitAction === "save" || submitAction === "preview";
      const isExistingQuote = ["quote", "quote_sent", "quote_accepted"].includes(currentStatut);
      const isExistingInvoice = ["invoiced", "sent", "paid"].includes(currentStatut);
      const selectedFollowUpStatus = submitAction === "invoice"
        ? followUpStatusFromWorkOrderStatut("invoiced", followUpColumns)
        : submitAction === "quote"
          ? followUpStatusFromWorkOrderStatut("quote", followUpColumns)
          : (saveOnlyAction && (isExistingQuote || isExistingInvoice))
            ? followUpStatusFromWorkOrderStatut(currentStatut, followUpColumns)
        : followUpStatus;
      const finalStatut = submitAction === "quote"
        ? "quote"
        : (saveOnlyAction && (isExistingQuote || isExistingInvoice))
          ? currentStatut
        : workOrderStatutFromFollowUpStatus(selectedFollowUpStatus, followUpColumns);
      const payload = {
        clientId: selectedClient.id,
        technicianId: technicianId || null,
        date,
        heureArrivee: normalizedArrival || null,
        heureDepart: normalizedDeparture || null,
        interventionAddress: interventionAddress || null,
        interventionCity: interventionCity || null,
        interventionPostalCode: interventionPostalCode || null,
        visibleAuClient,
        description: description || null,
        notes: notes || null,
        statut: finalStatut,
        followUpStatus: selectedFollowUpStatus,
        laborHours,
        laborRate,
        // Flat items: always included. For B2B, only discount lines stay flat.
        items: itemsComputed.map((it) => ({
          productId: it.productId,
          serviceId: it.serviceId,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          itemType: it.itemType,
        })),
      };
      if (selectedFollowUpId) payload.followUpId = Number(selectedFollowUpId);
      if (isB2B) {
        payload.sections = sections.map((s) => ({
          unitCode: s.unitCode,
          items: s.items.map((it) => ({
            productId: it.productId,
            serviceId: it.serviceId,
            description: it.description,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            itemType: it.itemType,
          })),
        }));
      }
      const url = editId ? `/api/admin/work-orders/${editId}` : "/api/admin/work-orders";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { ...payload, expectedUpdatedAt: loadedUpdatedAt } : payload),
      });
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Ce bon a ete modifie par un collegue pendant ton edition. Recharge la page (F5) avant de sauvegarder, sinon tu ecrases ses changements.");
        setSaving(false);
        setSavingAction(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la creation");
      }
      const wo = await res.json();
      if (hasAiImages) {
        saveAiImagesSession(aiImportImages, wo.id);
      }
      if (aiImportText.trim() || aiDraft || aiEmailDraft) {
        saveAiAnalysisSession({
          text: aiImportText,
          draft: aiDraft,
          emailDraft: aiEmailDraft,
        }, wo.id);
      }
      if (!editId) {
        try {
          window.localStorage.removeItem(DRAFT_KEY);
          clearAiAnalysisSession();
          if (hasAiImages) clearAiImagesSession();
        } catch {}
      }
      if ((submitAction === "invoice" || submitAction === "quote") && aiEmailDraft?.body) {
        try {
          window.localStorage.setItem(emailDraftStorageKey(wo.id), JSON.stringify({
            to: aiEmailDraft.to || selectedClient?.email || "",
            subject: aiEmailDraft.subject || "",
            body: aiEmailDraft.body,
          }));
        } catch {}
      }
      const shouldPreview = submitAction === "invoice" || submitAction === "quote" || submitAction === "preview";
      router.push(shouldPreview ? `/admin/bons/${wo.id}` : `/admin/bons/nouveau?edit=${wo.id}`);
      if (!shouldPreview) {
        setSaving(false);
        setSavingAction(null);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setSavingAction(null);
    }
  }

  const visibleFollowUpColumns = followUpColumns.filter((column) => column.visible);
  const selectedStatusLabel = visibleFollowUpColumns.find((column) => column.key === followUpStatus)?.label || followUpStatus;
  const followUpSelectOptions = [...followUpOptions];
  if (linkedFollowUp?.id && !followUpSelectOptions.some((followUp) => followUp.id === linkedFollowUp.id)) {
    followUpSelectOptions.unshift(linkedFollowUp);
  }
  const selectedFollowUp = followUpSelectOptions.find((followUp) => String(followUp.id) === selectedFollowUpId);
  const flatPieceCount = items.filter((it) => it.itemType !== "discount").length;
  const sectionPieceCount = sections.reduce((sum, sec) => sum + sec.items.filter((it) => it.itemType !== "discount").length, 0);
  const discountCount = items.filter((it) => it.itemType === "discount").length;
  const pieceCount = flatPieceCount + sectionPieceCount;
  const isDirectInvoiceMode = invoiceMode && !editId;
  const isDirectQuoteMode = quoteMode && !editId;
  const documentFollowUpStatut = currentStatut || (effectiveInvoiceMode ? "invoiced" : effectiveQuoteMode ? "quote" : "draft");
  const documentFollowUpStatus = followUpStatusFromWorkOrderStatut(documentFollowUpStatut, followUpColumns);
  const documentFollowUpStatusLabel = visibleFollowUpColumns.find((column) => column.key === documentFollowUpStatus)?.label || documentFollowUpStatus;
  const currentModeLabel = effectiveInvoiceMode
    ? (isDirectInvoiceMode ? "Facture directe" : "Facturation")
    : effectiveQuoteMode
      ? "Soumission"
      : editId
        ? "Modification"
        : "Creation";
  const pageTitle = effectiveInvoiceMode
    ? (isDirectInvoiceMode ? "Nouvelle facture" : isExistingInvoiceDocument ? "Modifier la facture" : "Facturer le bon de travail")
    : effectiveQuoteMode
      ? (editId || isExistingQuoteDocument ? "Modifier la soumission" : "Nouvelle soumission")
      : (editId ? "Modifier le bon de travail" : "Nouveau bon de travail");
  const dateLabel = effectiveInvoiceMode ? "Date de facture" : effectiveQuoteMode ? "Date de soumission" : "Date prevue";
  const descriptionLabel = effectiveInvoiceMode
    ? "Description des travaux / frais"
    : effectiveQuoteMode
      ? "Description du projet"
      : "Description du travail";
  const summaryTitle = effectiveInvoiceMode ? "Resume de la facture" : effectiveQuoteMode ? "Resume de la soumission" : "Resume du bon";
  const totalTitle = effectiveInvoiceMode ? "Total de la facture" : effectiveQuoteMode ? "Total de la soumission" : "Total a facturer";
  const showAiClientSuggestionPanel = Boolean(
    aiDraft?.client &&
    !selectedClient &&
    (aiClientSuggestionLoading || aiClientLookupComplete || aiClientSuggestions.length > 0)
  );

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour aux documents
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="admin-text text-2xl font-bold">
              {pageTitle}
            </h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600">
              {currentModeLabel}
            </span>
            {editId && (
              <span className="rounded-full border admin-border px-3 py-1 text-xs font-medium admin-text-muted">
                {selectedStatusLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {(invoiceMode || quoteMode) && (
        <div className={`mb-5 max-w-[1500px] rounded-lg border p-4 ${
          invoiceMode ? "border-orange-500/40 bg-orange-500/10" : "border-sky-500/40 bg-sky-500/10"
        }`}>
          <div className="flex items-start gap-3">
            <i className={`fas ${invoiceMode ? "fa-file-invoice-dollar text-orange-500" : "fa-file-signature text-sky-500"} text-xl mt-0.5`}></i>
            <div className="flex-1">
              <h3 className={`font-bold mb-1 ${invoiceMode ? "text-orange-500" : "text-sky-500"}`}>
                {invoiceMode ? (isDirectInvoiceMode ? "Facture directe" : "Mode facturation") : "Mode soumission"}
              </h3>
              <p className="text-sm admin-text-muted">
                {invoiceMode
                  ? (isDirectInvoiceMode
                      ? "Choisissez un client normal ou gestionnaire, ajoutez les lignes, puis creez la facture sans passer par un bon de travail."
                      : "Ajoutez les heures et les pieces, puis utilisez le panneau de droite pour facturer ou enregistrer sans facturer.")
                  : "Choisissez le client, ajoutez les lignes, puis creez la soumission. Elle pourra etre acceptee et planifiee ensuite au besoin."}
              </p>
            </div>
          </div>
        </div>
      )}

      {showDocumentAssistant && (
        <div className="admin-card mb-5 max-w-[1500px] overflow-hidden rounded-xl border">
          <div className="border-b admin-border bg-cyan-500/10 px-4 py-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="admin-text text-sm font-black">
                  <i className="fas fa-wand-magic-sparkles mr-2 text-cyan-500"></i>
                  Assistant IA
                </h2>
                <p className="admin-text-muted mt-0.5 text-xs">
                  {effectiveInvoiceMode ? "Facture" : "Soumission"} a partir d&apos;un message client.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeAiDocumentDraft}
                disabled={aiDraftLoading || (!aiImportText.trim() && !hasAiImages)}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-40"
              >
                <i className={`fas ${aiDraftLoading ? "fa-spinner fa-spin" : "fa-bolt"} mr-2`}></i>
                {aiDraftLoading ? "Analyse..." : "Analyser"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">
              <textarea
                value={aiImportText}
                onChange={(e) => setAiImportText(e.target.value)}
                onPaste={handleAiPaste}
                rows={8}
                className="admin-input min-h-36 w-full resize-y rounded-lg border px-3 py-2.5 text-sm"
                placeholder="Coller ici le texto, courriel ou notes brutes..."
              />

              <div
                className={`rounded-lg border border-dashed p-3 transition-colors ${
                  hasAiImages ? "border-cyan-400/50 bg-cyan-500/10" : "admin-border bg-white/[0.02]"
                }`}
                onPaste={handleAiPaste}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer?.files || []).filter((item) => item.type?.startsWith("image/"));
                  if (files.length > 0) attachAiImportImages(files);
                }}
              >
                <input
                  ref={aiImageInputRef}
                  type="file"
                  accept={AI_IMAGE_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) attachAiImportImages(files);
                    e.target.value = "";
                  }}
                />
                {hasAiImages ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="admin-text text-sm font-bold">{aiImportImages.length} image{aiImportImages.length > 1 ? "s" : ""} jointe{aiImportImages.length > 1 ? "s" : ""}</p>
                        <p className="admin-text-muted text-xs">{formatBytes(aiImagesTotalSize(aiImportImages))} au total</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => aiImageInputRef.current?.click()}
                        disabled={aiImportImages.length >= AI_IMAGE_MAX_COUNT}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600 disabled:opacity-40"
                      >
                        <i className="fas fa-plus mr-2"></i>Ajouter
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {aiImportImages.map((image, index) => {
                        const src = aiImageSrc(image);
                        return (
                          <div key={`${image.name}-${index}`} className="rounded-lg border admin-border bg-black/20 p-2">
                            <button
                              type="button"
                              onClick={() => setAiImagePreviewIndex(index)}
                              className="group relative mb-2 h-24 w-full overflow-hidden rounded-md ring-1 ring-cyan-400/25"
                              title="Voir l'image"
                            >
                              <Image
                                src={src}
                                alt=""
                                fill
                                sizes="160px"
                                unoptimized
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                {index + 1}
                              </span>
                              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                                <i className="fas fa-up-right-and-down-left-from-center"></i>
                              </span>
                            </button>
                            <p className="admin-text truncate text-xs font-bold">{image.name}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="admin-text-muted text-[11px]">{formatBytes(image.size)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = aiImportImages.filter((_, imageIndex) => imageIndex !== index);
                                  setAiImportImages(nextImages);
                                  setAiImagePreviewIndex(null);
                                  setAiDraft(null);
                                  if (nextImages.length > 0) {
                                    saveAiImagesSession(nextImages, editId);
                                  } else {
                                    clearAiImagesSession(editId);
                                    if (!editId) clearAiImagesSession();
                                  }
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-700 text-xs text-white hover:bg-slate-600"
                                title="Retirer"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                        <i className="fas fa-image"></i>
                      </span>
                      <div>
                        <p className="admin-text text-sm font-bold">Images</p>
                        <p className="admin-text-muted text-xs">Jusqu&apos;a {AI_IMAGE_MAX_COUNT} images PNG, JPG, WEBP ou GIF</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => aiImageInputRef.current?.click()}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-paperclip mr-2"></i>Ajouter
                    </button>
                  </div>
                )}
              </div>

              {aiDraft?.warnings?.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase text-amber-500">
                      A verifier
                    </p>
                    <span className="admin-text-muted text-[11px]">
                      {aiDraft.warnings.length} point{aiDraft.warnings.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {aiDraft.warnings.map((warning, index) => (
                      <div
                        key={`${warning}-${index}`}
                        className="min-w-0 rounded-md border border-amber-500/20 bg-black/10 px-3 py-2"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-500">
                            {index + 1}
                          </span>
                          <p className="admin-text min-w-0 break-words text-xs leading-snug">
                            {warning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border admin-border bg-white/[0.02] p-3">
              {!aiDraft ? (
                <div className="flex h-full min-h-44 flex-col justify-center text-center">
                  <i className="fas fa-file-invoice-dollar mb-3 text-2xl text-cyan-500/70"></i>
                  <p className="admin-text text-sm font-bold">Aucun brouillon analyse</p>
                  <p className="admin-text-muted mt-1 text-xs">Le resultat apparaitra ici avant d&apos;appliquer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="admin-text text-sm font-bold">{aiDraft.client?.name || "Client a verifier"}</p>
                      {aiDraft.client?.company && <p className="admin-text-muted text-xs">Compagnie: {aiDraft.client.company}</p>}
                      {aiDraft.client?.contactName && <p className="admin-text-muted text-xs">Contact: {aiDraft.client.contactName}</p>}
                      <p className="admin-text-muted text-xs">Client: {aiDraft.client?.email || "Email client a verifier"}</p>
                      <p className="admin-text-muted text-xs">Destinataire email: {resolveAiEmailDraft(aiDraft, selectedClient)?.to || "A verifier"}</p>
                      <p className="admin-text-muted text-xs">{aiDraft.client?.phone || ""}{aiDraft.client?.secondaryPhone ? ` | ${aiDraft.client.secondaryPhone}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      effectiveInvoiceMode ? "bg-orange-500/15 text-orange-500" : "bg-sky-500/15 text-sky-500"
                    }`}>
                      {effectiveInvoiceMode ? "Facture" : "Soumission"}
                    </span>
                  </div>

                  {showAiClientSuggestionPanel && (
                    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase text-sky-500">
                          Clients similaires
                        </p>
                        {aiClientSuggestionLoading && (
                          <span className="admin-text-muted inline-flex items-center gap-1 text-[10px]">
                            <i className="fas fa-spinner fa-spin"></i>Recherche
                          </span>
                        )}
                      </div>

                      {!aiClientSuggestionLoading && aiClientSuggestions.length === 0 && (
                        <p className="admin-text-muted mb-2 text-xs">
                          Aucun client proche trouve dans la base.
                        </p>
                      )}

                      {aiClientSuggestions.length > 0 && (
                        <div className="space-y-2">
                          {aiClientSuggestions.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => selectAiClientSuggestion(client)}
                              className="w-full rounded-md border border-sky-500/25 bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-sky-400 hover:bg-sky-500/15"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="admin-text truncate text-xs font-black">{client.name || "Client sans nom"}</p>
                                  {client.company && (
                                    <p className="admin-text-muted truncate text-[11px]">Compagnie: {client.company}</p>
                                  )}
                                  {client.contactName && (
                                    <p className="admin-text-muted truncate text-[11px]">Contact: {client.contactName}</p>
                                  )}
                                </div>
                                <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-500">
                                  {Math.round(client.matchScore || 0)}%
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] admin-text-muted">
                                {client.email && <span>{client.email}</span>}
                                {client.phone && <span>{client.phone}</span>}
                                {client.city && <span>{client.city}</span>}
                                {client._count?.workOrders ? <span>{client._count.workOrders} bon{client._count.workOrders > 1 ? "s" : ""}</span> : null}
                              </div>
                              {client.matchReasons?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {client.matchReasons.slice(0, 3).map((reason) => (
                                    <span key={reason} className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-500">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={createAiDraftClientAndSelect}
                        disabled={aiDraftApplying || aiClientSuggestionLoading}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/15 disabled:opacity-40"
                      >
                        <i className={`fas ${aiDraftApplying ? "fa-spinner fa-spin" : "fa-user-plus"} mr-2`}></i>
                        Creer un nouveau client avec cette analyse
                      </button>
                    </div>
                  )}

                  {aiDraft?.client && selectedClient && (
                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-emerald-600">Client selectionne</p>
                      <p className="admin-text mt-0.5 text-xs font-bold">{selectedClient.name}</p>
                      <p className="admin-text-muted text-[11px]">
                        {[selectedClient.company, selectedClient.email, selectedClient.phone].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                  )}

                  {aiDraft.analysisCost && (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-2"
                      title={`${formatTokenCount(aiDraft.analysisCost.inputTokens)} tokens entree | ${formatTokenCount(aiDraft.analysisCost.outputTokens)} tokens sortie`}
                    >
                      <span className="text-[10px] font-bold uppercase text-cyan-500">Cout analyse IA</span>
                      <span className="admin-text text-xs font-black">
                        {formatUsdCost(aiDraft.analysisCost.estimatedUsd)}
                      </span>
                    </div>
                  )}

                  <div className="rounded-lg border admin-border p-2">
                    <p className="admin-text-muted mb-1 text-[10px] font-bold uppercase">Description</p>
                    <p className="admin-text mb-3 whitespace-pre-wrap text-xs">
                      {descriptionFromAiDraft(aiDraft) || "Aucune description detectee."}
                    </p>
                    <p className="admin-text-muted mb-1 text-[10px] font-bold uppercase">Lignes</p>
                    <div className="space-y-1">
                      {draftSectionsToWorkSections(aiDraft.sections).slice(0, 3).map((section) => (
                        <div key={section.unitCode} className="rounded border admin-border bg-white/[0.02] px-2 py-1">
                          <p className="admin-text-muted text-[10px] font-bold uppercase">{section.unitCode}</p>
                          {section.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-start justify-between gap-2 text-xs">
                              <span className="admin-text min-w-0 break-words">{item.description}</span>
                              <span className="font-bold text-cyan-600">{Number(item.unitPrice || 0).toFixed(2)}$</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      {(aiDraft.items || []).slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-start justify-between gap-2 text-xs">
                          <span className="admin-text min-w-0 break-words">{item.description}</span>
                          <span className="font-bold text-cyan-600">{Number(item.unitPrice || 0).toFixed(2)}$</span>
                        </div>
                      ))}
                      {(aiDraft.items || []).length === 0 && draftSectionsToWorkSections(aiDraft.sections).length === 0 && (
                        <p className="admin-text-muted text-xs">Aucune ligne avec prix clair.</p>
                      )}
                    </div>
                  </div>

                  {aiDraft.email?.body && (
                    <details className="rounded-lg border admin-border p-2">
                      <summary className="cursor-pointer admin-text text-xs font-bold">Email propose</summary>
                      {resolveAiEmailDraft(aiDraft, selectedClient)?.to && (
                        <p className="mt-2 text-[10px] font-bold uppercase text-cyan-600">
                          Destinataire: {resolveAiEmailDraft(aiDraft, selectedClient).to}
                        </p>
                      )}
                      {resolveAiEmailDraft(aiDraft, selectedClient)?.subject && (
                        <p className="admin-text-muted mt-1 text-xs">
                          Sujet: {resolveAiEmailDraft(aiDraft, selectedClient).subject}
                        </p>
                      )}
                      <p className="admin-text-muted mt-2 whitespace-pre-wrap text-xs">{aiDraft.email.body}</p>
                    </details>
                  )}

                  <button
                    type="button"
                    onClick={applyAiDocumentDraft}
                    disabled={aiDraftApplying}
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-40"
                  >
                    <i className={`fas ${aiDraftApplying ? "fa-spinner fa-spin" : "fa-check"} mr-2`}></i>
                    {aiDraftApplying ? "Application..." : "Appliquer au formulaire"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {(aiDraftError || aiDraftMessage) && (
            <div className={`border-t px-4 py-3 text-sm ${
              aiDraftError ? "border-red-500/30 bg-red-500/10 text-red-500" : "admin-border bg-green-500/10 text-green-600"
            }`}>
              {aiDraftError || aiDraftMessage}
            </div>
          )}
        </div>
      )}

      {loadingEdit && (
        <div className="admin-card mb-5 max-w-[1500px] rounded-lg border p-5">
          <p className="admin-text-muted text-sm text-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>Chargement du bon #{editId}...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px] ${loadingEdit ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="min-w-0 space-y-4">
        {/* Client */}
        <div className="admin-card border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="admin-text font-bold">Client</h2>
            {!selectedClient && (
              <div className="flex gap-2 flex-wrap justify-end">
                <button type="button" onClick={() => setQuickClientOpen((v) => !v)}
                  className="px-4 py-2 border admin-border rounded-lg text-sm font-medium admin-text admin-hover">
                  <i className="fas fa-user-plus mr-2"></i>Client rapide
                </button>
                <button type="button" onClick={() => setClientPickerOpen(true)}
                  className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">
                  <i className="fas fa-address-book mr-2"></i>Parcourir les clients
                </button>
              </div>
            )}
          </div>
          {!selectedClient ? (
            <>
              <input
                type="text"
                placeholder="Rechercher par nom, telephone, email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                autoFocus
              />
              {clientResults.length > 0 && (
                <div className="mt-3 border rounded-lg overflow-hidden admin-border max-h-64 overflow-y-auto">
                  {clientResults.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => { selectClient(c); setClientSearch(""); setClientResults([]); setQuickClientOpen(false); }}
                      className="w-full text-left px-4 py-3 border-b admin-border admin-hover last:border-b-0"
                    >
                      <p className="admin-text font-medium text-sm">{c.name}</p>
                      <p className="admin-text-muted text-xs">{c.phone || "-"} {c.city ? `| ${c.city}` : ""}</p>
                      {c.secondaryPhone && <p className="admin-text-muted text-xs">{c.secondaryPhone}</p>}
                    </button>
                  ))}
                </div>
              )}
              {quickClientOpen && (
                <div className="mt-4 border admin-border rounded-xl p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="admin-text text-sm font-bold">Creation rapide</p>
                    <Link href="/admin/clients" className="text-xs admin-text-muted hover:admin-text">
                      Fiche complete
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Nom du client *" value={quickClient.name}
                      onChange={(e) => setQuickClient((p) => ({ ...p, name: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="tel" placeholder="Telephone" value={quickClient.phone}
                      onChange={(e) => setQuickClient((p) => ({ ...p, phone: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="tel" placeholder="Autre telephone" value={quickClient.secondaryPhone}
                      onChange={(e) => setQuickClient((p) => ({ ...p, secondaryPhone: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="email" placeholder="Email" value={quickClient.email}
                      onChange={(e) => setQuickClient((p) => ({ ...p, email: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <select value={quickClient.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setQuickClient((p) => ({
                          ...p,
                          type,
                          friendlyEmail: type === "gestionnaire" ? (p.type === "gestionnaire" ? p.friendlyEmail : true) : false,
                        }));
                      }}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                      <option value="particulier">Particulier</option>
                      <option value="gestionnaire">Gestionnaire / B2B</option>
                    </select>
                    {quickClient.type === "gestionnaire" && (
                      <>
                        <input type="text" placeholder="Nom du contact courriel" value={quickClient.contactName}
                          onChange={(e) => setQuickClient((p) => ({ ...p, contactName: e.target.value }))}
                          className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                        <label className="admin-card border admin-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer">
                          <span className="admin-text text-sm font-medium">Courriel amical</span>
                          <input
                            type="checkbox"
                            checked={quickClient.friendlyEmail}
                            onChange={(e) => setQuickClient((p) => ({ ...p, friendlyEmail: e.target.checked }))}
                            className="h-5 w-5 accent-[var(--color-red)]"
                          />
                        </label>
                      </>
                    )}
                    <AddressAutocomplete
                      value={quickClient.address}
                      onChange={(address) => setQuickClient((p) => ({ ...p, address }))}
                      onSelect={(address) => setQuickClient((p) => ({ ...p, ...address }))}
                      placeholder="Adresse"
                      inputClassName="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Ville" value={quickClient.city}
                        onChange={(e) => setQuickClient((p) => ({ ...p, city: e.target.value }))}
                        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                      <input type="text" placeholder="Postal" value={quickClient.postalCode}
                        onChange={(e) => setQuickClient((p) => ({ ...p, postalCode: e.target.value }))}
                        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button type="button" onClick={createQuickClient} disabled={creatingClient || !quickClient.name.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold disabled:opacity-40">
                      {creatingClient ? "Creation..." : "Creer et utiliser"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="admin-text font-medium">{selectedClient.name}</p>
                {selectedClient.company && <p className="admin-text-muted text-sm">Compagnie: {selectedClient.company}</p>}
                {selectedClient.contactName && <p className="admin-text-muted text-sm">Contact: {selectedClient.contactName}</p>}
                {selectedClient.email && <p className="admin-text-muted text-sm">{selectedClient.email}</p>}
                <p className="admin-text-muted text-sm">{selectedClient.phone || "-"}</p>
                {selectedClient.secondaryPhone && <p className="admin-text-muted text-sm">{selectedClient.secondaryPhone}</p>}
                {selectedClient.address && <p className="admin-text-muted text-sm">{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}</p>}
              </div>
              <button type="button" onClick={clearSelectedClient} className="text-xs font-medium text-cyan-600 hover:text-cyan-500">
                Changer
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="admin-card border rounded-xl p-4 space-y-4">
          <h2 className="admin-text font-bold">Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="admin-text-muted text-xs mb-1 block">{dateLabel}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
            <TimeSelect label="Heure arrivee" value={heureArrivee} onChange={setHeureArrivee} />
            <TimeSelect label="Heure depart" value={heureDepart} onChange={setHeureDepart} />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">Technicien</label>
            <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
              <option value="">Aucun</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="admin-text-muted text-xs block">
                Adresse d&apos;intervention <span className="opacity-60">(si differente du client)</span>
              </label>
              {selectedClient && (selectedClient.address || selectedClient.city || selectedClient.postalCode) && (
                <button type="button" onClick={() => fillInterventionFromClient(selectedClient, null, true)}
                  className="text-[11px] admin-text-muted hover:admin-text">
                  Utiliser fiche client
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <AddressAutocomplete
                value={interventionAddress}
                onChange={setInterventionAddress}
                onSelect={(address) => {
                  setInterventionAddress(address.address || "");
                  setInterventionCity(address.city || "");
                  setInterventionPostalCode(address.postalCode || "");
                }}
                placeholder="Adresse"
                className="md:col-span-2"
                inputClassName="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
              />
              <input type="text" placeholder="Ville" value={interventionCity}
                onChange={(e) => setInterventionCity(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
            <input type="text" placeholder="Code postal" value={interventionPostalCode}
              onChange={(e) => setInterventionPostalCode(e.target.value)}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full mt-3 md:w-48" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">{descriptionLabel}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </div>
          <details className="rounded-lg border admin-border bg-white/[0.02] p-3">
            <summary className="cursor-pointer text-sm font-medium admin-text">
              Options avancees
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="admin-text-muted text-xs mb-1 block">Notes internes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
              </div>
              <label className="flex items-center gap-2 text-sm admin-text cursor-pointer">
                <input type="checkbox" checked={visibleAuClient}
                  onChange={(e) => setVisibleAuClient(e.target.checked)}
                  className="rounded" />
                Visible dans le portail client
              </label>
            </div>
          </details>
        </div>

        <ThermosQuoteInline
          active={thermosCalculatorActive}
          onActiveChange={setThermosCalculatorActive}
          city={interventionCity || selectedClient?.city || ""}
          isB2B={isB2B}
          sections={sections}
          onAddToBon={addThermosQuoteToBon}
        />

        {/* Sections par unite (B2B only) */}
        {isB2B && (
          <div className="admin-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="admin-text font-bold">
                <i className="fas fa-building mr-2 text-blue-400"></i>Unites visitees ({sections.length})
              </h2>
              <p className="admin-text-muted text-xs">Client B2B — organiser par unite</p>
            </div>

            {/* Known units quick-add */}
            {knownUnits.length > 0 && (
              <div>
                <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-2">
                  Unites connues ({knownUnits.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knownUnits.map((u) => {
                    const already = sections.some((s) => s.unitCode === u.code);
                    return (
                      <button type="button" key={u.id}
                        onClick={() => addSectionFromKnown(u)}
                        disabled={already}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                          already
                            ? "bg-green-500/20 text-green-500 border border-green-500/40 cursor-default"
                            : "admin-card border admin-border admin-text hover:bg-white/5"
                        }`}
                        title={u.description || ""}>
                        {already && <i className="fas fa-check text-[9px] mr-1"></i>}
                        {u.code}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add unit input */}
            <div className="flex gap-2">
              <input type="text" placeholder="Nouveau code d'unite (ex: F-0411)"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSection(); } }}
                className="admin-input border rounded-lg px-3 py-2 text-sm flex-1 font-mono" />
              <button type="button" onClick={addSection} disabled={!newUnitCode.trim()}
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 disabled:opacity-30">
                <i className="fas fa-plus mr-1"></i>Ajouter
              </button>
            </div>
            <p className="admin-text-muted text-[11px]">
              Une nouvelle unite est ajoutee au bon seulement. Elle sera enregistree dans la fiche client quand le bon sera sauvegarde.
            </p>

            {/* Sections list */}
            {sections.map((sec, sIdx) => {
              const secSubtotal = sec.items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
              return (
                <div key={sIdx} className="border admin-border rounded-xl p-4 space-y-3 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base admin-text bg-blue-500/10 px-3 py-1 rounded">{sec.unitCode}</span>
                      <span className="admin-text-muted text-xs">{sec.items.length} item{sec.items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-600">{secSubtotal.toFixed(2)}$</span>
                      <button type="button" onClick={() => removeSection(sIdx)} className="text-amber-500 text-sm hover:text-amber-400">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Services presets for this section */}
                  {services.filter((s) => s.isPreset).length > 0 && (
                    <div>
                      <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1.5">Raccourcis services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {services.filter((s) => s.isPreset).map((svc) => (
                          <button type="button" key={svc.id}
                            onClick={() => addServiceToSection(sIdx, svc)}
                            className="px-2.5 py-1 rounded text-xs admin-card border admin-border admin-text hover:bg-white/5">
                            {svc.name} <span className="text-cyan-600 font-bold ml-1">{Number(svc.price).toFixed(0)}$</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items in this section */}
                  {sec.items.map((it, iIdx) => {
                    const isLastSectionPiece = !sec.items.slice(iIdx + 1).some((next) => next.itemType !== "discount");
                    return (
                      <div key={iIdx} className="border admin-border rounded-lg p-2.5 bg-white/[0.02]">
                        <div className="flex items-start gap-2 mb-1.5">
                          <input
                            value={it.description}
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "description", e.target.value)}
                            placeholder="Description..."
                            className="admin-input border rounded px-2 py-1 text-sm flex-1" />
                          <button type="button" onClick={() => removeSectionItem(sIdx, iIdx)} className="text-amber-500 text-sm hover:text-amber-400">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <label className="admin-text-muted text-xs">Qte</label>
                          <input type="number" value={it.quantity} min="0" step="1"
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "quantity", parseFloat(e.target.value) || 0)}
                            className="admin-input border rounded px-2 py-0.5 text-sm w-16 text-center" />
                          <label className="admin-text-muted text-xs ml-1">Prix</label>
                          <input type="number" value={it.unitPrice} min="0" step="0.01"
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="admin-input border rounded px-2 py-0.5 text-sm w-20 text-right" />
                          <span className="admin-text-muted text-xs">$</span>
                          <span className="ml-auto font-bold text-cyan-600 text-sm">
                            {(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}$
                          </span>
                        </div>
                        {isLastSectionPiece && (
                          <div className="mt-3 flex justify-end">
                            <button type="button" onClick={() => addCustomToSection(sIdx)}
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                              <i className="fas fa-plus mr-1"></i>Rajouter une piece
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex gap-2">
                    <button type="button" onClick={() => openCatalogForSection(sIdx)}
                      className="flex-1 py-2 border-2 border-dashed admin-border rounded-lg admin-text-muted text-xs admin-hover">
                      <i className="fas fa-book-open mr-1"></i>Catalogue
                    </button>
                    <button type="button" onClick={() => addCustomToSection(sIdx)}
                      className="flex-1 py-2 border-2 border-dashed admin-border rounded-lg admin-text-muted text-xs admin-hover">
                      <i className="fas fa-plus mr-1"></i>Ajouter une piece
                    </button>
                  </div>
                </div>
              );
            })}

            {sections.length === 0 && (
              <p className="admin-text-muted text-xs italic text-center py-4">
                Aucune unite ajoutee. Tape sur une unite connue ci-dessus ou saisis un nouveau code.
              </p>
            )}
          </div>
        )}

        {/* Items (flat — for particulier OR discounts-only B2B) */}
        <div className="admin-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="admin-text font-bold">
              {isB2B ? "Escomptes / lignes globales" : "Pieces utilisees"}
            </h2>
            {!isB2B && (
              <button type="button" onClick={() => { setCatalogTarget(null); setCatalogOpen(true); }}
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">
                <i className="fas fa-book-open mr-2"></i>Parcourir le catalogue
              </button>
            )}
          </div>

          {items.map((it, i) => {
            if (it.itemType === "discount") {
              const computed = itemsComputed[i];
              return (
                <div key={i} className="border border-green-500/30 bg-green-500/5 rounded-lg p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <i className="fas fa-tag text-green-500 mt-1.5"></i>
                    <input
                      value={it.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description de l'escompte..."
                      className="admin-input border rounded px-2 py-1.5 text-sm flex-1"
                    />
                    <button type="button" onClick={() => removeItem(i)} className="text-amber-500 text-sm hover:text-amber-400">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <select
                      value={it.discountMode}
                      onChange={(e) => updateItem(i, "discountMode", e.target.value)}
                      className="admin-input border rounded px-2 py-1 text-xs"
                    >
                      <option value="percent">Pourcentage</option>
                      <option value="amount">Montant fixe</option>
                    </select>
                    {it.discountMode === "percent" ? (
                      <>
                        <input
                          type="number" value={it.discountPercent} min="0" max="100" step="0.5"
                          onChange={(e) => updateItem(i, "discountPercent", parseFloat(e.target.value) || 0)}
                          className="admin-input border rounded px-2 py-1 text-sm w-20 text-center"
                        />
                        <span className="admin-text-muted text-xs">%</span>
                        <span className="admin-text-muted text-xs">sur {piecesSubtotalBase.toFixed(2)}$</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number" value={it.discountAmount} min="0" step="0.01"
                          onChange={(e) => updateItem(i, "discountAmount", parseFloat(e.target.value) || 0)}
                          className="admin-input border rounded px-2 py-1 text-sm w-24 text-right"
                        />
                        <span className="admin-text-muted text-xs">$</span>
                      </>
                    )}
                    <span className="ml-auto font-bold text-green-600">
                      {computed.unitPrice.toFixed(2)}$
                    </span>
                  </div>
                </div>
              );
            }
            const isLastPiece = !items.slice(i + 1).some((next) => next.itemType !== "discount");
            return (
              <div key={i} className="border admin-border rounded-lg p-3">
                <div className="flex items-start gap-3 mb-2">
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Description..."
                    className="admin-input border rounded px-2 py-1.5 text-sm flex-1"
                  />
                  <button type="button" onClick={() => removeItem(i)} className="text-amber-500 text-sm hover:text-amber-400">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="admin-text-muted text-xs">Qte</label>
                  <input type="number" value={it.quantity} min="0" step="1"
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                    className="admin-input border rounded px-2 py-1 text-sm w-20 text-center" />
                  <label className="admin-text-muted text-xs ml-2">Prix</label>
                  <input type="number" value={it.unitPrice} min="0" step="0.01"
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="admin-input border rounded px-2 py-1 text-sm w-24 text-right" />
                  <span className="admin-text-muted text-xs">$</span>
                  <span className="ml-auto font-bold text-cyan-600">
                    {(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}$
                  </span>
                </div>
                {!isB2B && isLastPiece && (
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={addCustomItem}
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                      <i className="fas fa-plus mr-1"></i>Rajouter une piece
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className={`grid gap-2 ${isB2B ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
            {!isB2B && (
              <button type="button" onClick={addCustomItem}
                className="py-2.5 border-2 border-dashed admin-border rounded-lg admin-text-muted text-sm admin-hover">
                <i className="fas fa-plus mr-2"></i>Ajouter une piece
              </button>
            )}
            <button type="button" onClick={() => addDiscount("percent")}
              title="Enleve un pourcentage du total des pieces. Exemple: 10% sur 500$ enleve 50$."
              className="group relative py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <span className="inline-flex items-center justify-center gap-2">
                <i className="fas fa-percent"></i>
                <span>Escompte %</span>
                <HelpBubble text="Enleve un pourcentage du total des pieces. Exemple: 10% sur 500$ enleve 50$." />
              </span>
            </button>
            <button type="button" onClick={() => addDiscount("amount")}
              title="Enleve un montant fixe. Exemple: 25$ enleve exactement 25$."
              className="group relative py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <span className="inline-flex items-center justify-center gap-2">
                <i className="fas fa-dollar-sign"></i>
                <span>Reduction $</span>
                <HelpBubble text="Enleve un montant fixe. Exemple: 25$ enleve exactement 25$." />
              </span>
            </button>
          </div>
        </div>

        {/* Labor + Totals */}
        <div className="admin-card border rounded-xl p-4 space-y-4">
          <div>
            <h2 className="admin-text font-bold">Main d&apos;oeuvre</h2>
            <p className="admin-text-muted text-xs mt-1">
              Changer les parametres n&apos;affecte pas les anciens bons.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LaborHoursSelect value={laborHours} onChange={setLaborHours} />
            <span className="admin-text-muted text-sm">x</span>
            <LaborRateInput value={laborRateText} onChange={handleLaborRateInput} onBlur={commitLaborRateInput} />
            <Link href="/admin/parametres#bons-travail"
              className="px-3 py-2 border admin-border rounded-lg admin-text-muted text-xs admin-hover inline-flex items-center">
              <i className="fas fa-gear mr-1"></i>Ajuster le taux
            </Link>
            <span className="admin-text-muted text-sm">{formatLaborHours(laborHours)} x {laborRate.toFixed(2)}$/h</span>
            <span className="ml-auto font-bold text-cyan-600">{totalLabor.toFixed(2)}$</span>
          </div>

          <p className="admin-text-muted border-t admin-border pt-3 text-xs">
            Le taux inscrit ici est conserve sur ce document. Les changements dans Parametres ne modifient pas les anciens documents.
          </p>
        </div>

        </div>

        {/* Resume + actions */}
        <aside className="admin-card border rounded-xl p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="space-y-5">
            <div>
              <p className="admin-text-muted text-[11px] font-bold uppercase tracking-wider">{summaryTitle}</p>
              <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">{totalTitle}</p>
                <p className="mt-1 text-3xl font-black text-cyan-700">{total.toFixed(2)}$</p>
                <p className="admin-text-muted mt-1 text-xs">
                  {pieceCount} piece{pieceCount !== 1 ? "s" : ""} | {formatLaborHours(laborHours)} main d&apos;oeuvre
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t admin-border pt-4">
              <MoneyLine label="Pieces" value={`${totalPieces.toFixed(2)}$`} />
              <MoneyLine label="Main d'oeuvre" value={`${totalLabor.toFixed(2)}$`} />
              <MoneyLine label="Sous-total" value={`${subtotal.toFixed(2)}$`} />
              <MoneyLine label={`TPS (${(settings.tps_rate * 100).toFixed(1)}%)`} value={`${tps.toFixed(2)}$`} muted />
              <MoneyLine label={`TVQ (${(settings.tvq_rate * 100).toFixed(3)}%)`} value={`${tvq.toFixed(2)}$`} muted />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{pieceCount}</p>
                <p className="admin-text-muted text-[10px] uppercase">Pieces</p>
              </div>
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{sections.length}</p>
                <p className="admin-text-muted text-[10px] uppercase">Unites</p>
              </div>
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{discountCount}</p>
                <p className="admin-text-muted text-[10px] uppercase">Rabais</p>
              </div>
            </div>

            <div className="space-y-4 border-t admin-border pt-4">
            {selectedClient && !effectiveInvoiceMode && !effectiveQuoteMode && (
              <div>
                <label className="admin-text-muted text-xs mb-1 block">Rattacher au suivi client</label>
                <select
                  value={selectedFollowUpId}
                  onChange={(e) => setSelectedFollowUpId(e.target.value)}
                  className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
                >
                  <option value="">
                    {loadingFollowUps ? "Chargement des suivis..." : "Aucun rattachement manuel"}
                  </option>
                  {followUpSelectOptions.map((followUp) => {
                    const statusLabel = visibleFollowUpColumns.find((column) => column.key === followUp.status)?.label || followUp.status;
                    return (
                      <option key={followUp.id} value={followUp.id}>
                        {followUp.title || followUp.contactName || `Suivi #${followUp.id}`} | {statusLabel}{followUpDateLabel(followUp.nextActionDate || followUp.updatedAt)}
                      </option>
                    );
                  })}
                </select>
                <p className="admin-text-muted text-[10px] mt-1">
                  {selectedFollowUp
                    ? `Lie a: ${selectedFollowUp.title || `suivi #${selectedFollowUp.id}`}`
                    : followUpSelectOptions.length > 1
                      ? "Plusieurs dossiers actifs: choisis le bon suivi pour eviter les doublons."
                      : "Si aucun suivi n'est choisi, le systeme lie seulement quand c'est evident."}
                </p>
              </div>
            )}
            {selectedClient && (effectiveInvoiceMode || effectiveQuoteMode) && (
              <div className={`rounded-lg border px-3 py-2.5 ${
                effectiveInvoiceMode ? "border-orange-500/25 bg-orange-500/10" : "border-sky-500/25 bg-sky-500/10"
              }`}>
                <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Suivi clients
                </p>
                <p className="admin-text mt-1 text-sm font-bold">
                  {effectiveInvoiceMode ? "Facture" : "Soumission"} | {documentFollowUpStatusLabel}
                </p>
                <p className="admin-text-muted mt-1 text-[10px]">
                  Le suivi est mis a jour automatiquement avec ce document.
                </p>
                {selectedFollowUp && (
                  <p className="admin-text-muted mt-1 truncate text-[10px]">
                    Lie a: {selectedFollowUp.title || `suivi #${selectedFollowUp.id}`}
                  </p>
                )}
              </div>
            )}
            {!effectiveInvoiceMode && !effectiveQuoteMode && (
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Statut</label>
              <select value={followUpStatus} onChange={(e) => setFollowUpStatus(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                {visibleFollowUpColumns.map((column) => (
                  <option key={column.key} value={column.key}>{column.label}</option>
                ))}
              </select>
              <p className="admin-text-muted text-[10px] mt-1">Même statut que dans Suivi clients.</p>
            </div>
            )}
            {error && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">{error}</p>}
            {effectiveInvoiceMode ? (
              <div className="flex flex-col gap-2">
                {editId && !isExistingInvoiceSaved && (
                  <button
                    type="submit"
                    value="save"
                    disabled={saving || !selectedClient}
                    className="w-full rounded-lg border admin-border px-5 py-3 text-sm font-medium admin-text hover:bg-white/5 disabled:opacity-50"
                  >
                    {saving && savingAction === "save" ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                )}
                <button
                  type="submit"
                  value={isExistingInvoiceSaved ? "save" : "invoice"}
                  disabled={saving || !selectedClient}
                  className="w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <i className="fas fa-file-invoice-dollar mr-2"></i>
                  {saving && ["invoice", "save"].includes(savingAction)
                    ? "Enregistrement..."
                    : isExistingInvoiceSaved
                      ? "Enregistrer la facture"
                      : isDirectInvoiceMode
                        ? "Creer la facture"
                        : "Facturer ce bon"}
                </button>
              </div>
            ) : effectiveQuoteMode ? (
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  value={isExistingQuoteSaved ? "save" : "quote"}
                  disabled={saving || !selectedClient}
                  className="w-full rounded-lg border border-sky-500/40 px-5 py-3 text-sm font-bold text-sky-600 hover:bg-sky-500/10 disabled:opacity-50"
                >
                  <i className="fas fa-file-signature mr-2"></i>
                  {saving && ["quote", "save"].includes(savingAction)
                    ? "Enregistrement..."
                    : isExistingQuoteSaved
                      ? "Enregistrer la soumission"
                      : "Creer la soumission"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button type="submit" disabled={saving || !selectedClient}
                  value="save"
                  className="w-full rounded-lg bg-cyan-700 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50">
                  {saving ? (editId ? "Enregistrement..." : "Creation...") : (editId ? "Enregistrer les modifications" : "Creer le bon")}
                </button>
                <button type="submit" disabled={saving || !selectedClient}
                  value="quote"
                  className="w-full rounded-lg border border-sky-500/40 px-4 py-2.5 text-sm font-bold text-sky-600 hover:bg-sky-500/10 disabled:opacity-50">
                  <i className="fas fa-file-signature mr-2"></i>
                  {saving && savingAction === "quote" ? "Creation..." : (editId ? "Enregistrer comme soumission" : "Creer une soumission")}
                </button>
                {editId && (
                  <Link
                    href={`/admin/bons/nouveau?edit=${editId}&mode=invoice`}
                    className="flex w-full items-center justify-center rounded-lg border border-orange-500/40 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-500/10"
                  >
                    <i className="fas fa-file-invoice-dollar mr-2"></i>Passer en facturation
                  </Link>
                )}
              </div>
            )}
            {editId && (
              <button
                type="submit"
                value="preview"
                disabled={saving || !selectedClient}
                className="flex w-full items-center justify-center rounded-lg border admin-border px-4 py-2.5 text-sm font-medium admin-text hover:bg-white/5 disabled:opacity-50"
              >
                <i className="fas fa-file-lines mr-2"></i>
                {saving && savingAction === "preview" ? "Enregistrement..." : "Apercu / envoyer"}
              </button>
            )}
            </div>
          </div>
        </aside>
      </form>

      {Number.isInteger(aiImagePreviewIndex) && aiImagePreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setAiImagePreviewIndex(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border admin-border bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b admin-border px-4 py-3">
              <div className="min-w-0">
                <p className="admin-text truncate text-sm font-bold">{aiImagePreviewImage?.name || "Image importee"}</p>
                <p className="admin-text-muted text-xs">
                  Image {(aiImagePreviewIndex || 0) + 1} sur {aiImportImages.length} | {formatBytes(aiImagePreviewImage?.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiImagePreviewIndex(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 admin-text hover:bg-white/15"
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex min-h-0 justify-center overflow-auto bg-black p-3">
              <Image
                src={aiImagePreviewSrc}
                alt="Image importee pour l'analyse IA"
                width={1400}
                height={1000}
                unoptimized
                className="h-auto max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <CatalogPicker open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addProduct} />
      <ClientPicker
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        onPick={(c) => { selectClient(c); setClientPickerOpen(false); setQuickClientOpen(false); }}
      />
    </div>
  );
}
