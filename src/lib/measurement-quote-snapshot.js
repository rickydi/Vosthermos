import { createHash } from "crypto";

export const MEASUREMENT_QUOTE_SNAPSHOT_VERSION = 1;

const SNAPSHOT_LINE_PATTERN = /^\[VT-MEASUREMENT-SNAPSHOT:v1:(\d+):([a-f0-9]{64})\]\r?$/gim;

function cleanText(value) {
  return String(value ?? "").trim();
}

function integerOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) ? number : null;
}

function finiteOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function dateOnly(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

function dateTime(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function jsonValue(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function stripMeasurementQuoteSnapshot(notes) {
  SNAPSHOT_LINE_PATTERN.lastIndex = 0;
  return String(notes || "")
    .replace(SNAPSHOT_LINE_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractMeasurementQuoteSnapshot(notes) {
  SNAPSHOT_LINE_PATTERN.lastIndex = 0;
  const matches = [...String(notes || "").matchAll(SNAPSHOT_LINE_PATTERN)];
  if (matches.length !== 1) return null;
  const measurementId = Number.parseInt(matches[0][1], 10);
  if (!Number.isInteger(measurementId) || measurementId <= 0) return null;
  return { version: MEASUREMENT_QUOTE_SNAPSHOT_VERSION, measurementId, hash: matches[0][2].toLowerCase() };
}

export function withMeasurementQuoteSnapshot(notes, measurementId, hash) {
  const id = Number.parseInt(measurementId, 10);
  const normalizedHash = cleanText(hash).toLowerCase();
  if (!Number.isInteger(id) || id <= 0 || !/^[a-f0-9]{64}$/.test(normalizedHash)) {
    throw new Error("Empreinte de soumission invalide");
  }
  const content = stripMeasurementQuoteSnapshot(notes);
  const marker = `[VT-MEASUREMENT-SNAPSHOT:v1:${id}:${normalizedHash}]`;
  return [content, marker].filter(Boolean).join("\n");
}

function normalizedItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      productId: integerOrNull(item?.productId),
      serviceId: integerOrNull(item?.serviceId),
      sectionId: integerOrNull(item?.sectionId),
      description: String(item?.description || ""),
      quantity: finiteOrNull(item?.quantity) ?? 0,
      unitPrice: money(item?.unitPrice),
      totalPrice: money(item?.totalPrice),
      itemType: cleanText(item?.itemType) || "piece",
      position: Number.parseInt(item?.position, 10) || 0,
    }))
    .sort((first, second) => first.position - second.position
      || first.description.localeCompare(second.description)
      || first.itemType.localeCompare(second.itemType));
}

function normalizedSections(sections) {
  return (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      unitCode: String(section?.unitCode || ""),
      notes: String(section?.notes || ""),
      position: Number.parseInt(section?.position, 10) || 0,
    }))
    .sort((first, second) => first.position - second.position || first.unitCode.localeCompare(second.unitCode));
}

export function measurementQuoteSnapshotPayload(workOrder, measurementId) {
  const order = workOrder && typeof workOrder === "object" ? workOrder : {};
  return {
    version: MEASUREMENT_QUOTE_SNAPSHOT_VERSION,
    measurementId: Number.parseInt(measurementId, 10) || 0,
    workOrder: {
      number: String(order.number || ""),
      clientId: integerOrNull(order.clientId),
      technicianId: integerOrNull(order.technicianId),
      followUpId: integerOrNull(order.followUpId),
      appointmentId: integerOrNull(order.appointmentId),
      date: dateOnly(order.date),
      arrivalAt: dateTime(order.arrivalAt),
      arrivalLat: finiteOrNull(order.arrivalLat),
      arrivalLng: finiteOrNull(order.arrivalLng),
      departureAt: dateTime(order.departureAt),
      durationMinutes: integerOrNull(order.durationMinutes),
      interventionAddress: order.interventionAddress ?? null,
      interventionCity: order.interventionCity ?? null,
      interventionPostalCode: order.interventionPostalCode ?? null,
      description: order.description ?? null,
      photos: (Array.isArray(order.photos) ? order.photos : []).map(String),
      signatureUrl: order.signatureUrl ?? null,
      statut: String(order.statut || "draft"),
      notes: stripMeasurementQuoteSnapshot(order.notes),
      visibleAuClient: Boolean(order.visibleAuClient),
      totalPieces: money(order.totalPieces),
      totalLabor: money(order.totalLabor),
      laborRate: money(order.laborRate),
      subtotal: money(order.subtotal),
      tps: money(order.tps),
      tvq: money(order.tvq),
      total: money(order.total),
      quoteDepositPercent: finiteOrNull(order.quoteDepositPercent),
      quotePaymentSchedule: jsonValue(order.quotePaymentSchedule),
      invoiceIssuedAt: dateTime(order.invoiceIssuedAt),
      invoiceSentAt: dateTime(order.invoiceSentAt),
      paymentDueAt: dateTime(order.paymentDueAt),
      paidAt: dateTime(order.paidAt),
      paymentMethod: order.paymentMethod ?? null,
      paymentNotes: order.paymentNotes ?? null,
      viewedByManagerAt: dateTime(order.viewedByManagerAt),
    },
    items: normalizedItems(order.items),
    sections: normalizedSections(order.sections),
    related: {
      paymentCount: Number(order._count?.payments ?? order.payments?.length ?? 0),
      creditNoteCount: Number(order._count?.creditNotes ?? order.creditNotes?.length ?? 0),
    },
  };
}

export function createMeasurementQuoteSnapshotHash(workOrder, measurementId) {
  const payload = measurementQuoteSnapshotPayload(workOrder, measurementId);
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

export function createMeasurementCalculationHash(measurement) {
  const record = measurement && typeof measurement === "object" ? measurement : {};
  const payload = {
    id: integerOrNull(record.id),
    updatedAt: dateTime(record.updatedAt),
    status: String(record.status || ""),
    source: String(record.source || ""),
    accuracy: String(record.accuracy || ""),
    revision: Number.parseInt(record.revision, 10) || 0,
    data: jsonValue(record.data),
  };
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}
