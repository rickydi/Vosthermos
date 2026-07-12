import { createHash, randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { publishAdminEvent } from "@/lib/event-bus";
import { generateThermosOrderPdf } from "@/lib/thermos-order-pdf";
import { sendThermosOrderEmail, sendThermosOrderReminderEmail } from "@/lib/thermos-order-mail";

export const THERMOS_ORDER_STATUS = Object.freeze({
  DRAFT: "draft",
  SENT: "sent",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  DELAYED: "delayed",
  READY: "ready",
  RECEIVED: "received",
  CANCELLED: "cancelled",
});

export const THERMOS_ORDER_STATUS_LABELS = Object.freeze({
  draft: "Brouillon",
  sent: "Commande envoyée",
  awaiting_confirmation: "Confirmation fournisseur attendue",
  delayed: "Retardée",
  ready: "Prête chez le fournisseur",
  received: "Reçue par Vosthermos",
  cancelled: "Annulée",
});

const ACTIVE_RESPONSE_STATUSES = new Set([
  THERMOS_ORDER_STATUS.SENT,
  THERMOS_ORDER_STATUS.AWAITING_CONFIRMATION,
  THERMOS_ORDER_STATUS.DELAYED,
]);
const ORDER_INCLUDE = {
  supplier: {
    select: {
      id: true,
      name: true,
      contactName: true,
      email: true,
      phone: true,
      leadTimeDays: true,
      autoFollowUpEnabled: true,
      isActive: true,
      isDefault: true,
    },
  },
  measurement: {
    select: {
      id: true,
      source: true,
      status: true,
      accuracy: true,
      revision: true,
      validatedAt: true,
      windowCount: true,
      paneCount: true,
      data: true,
    },
  },
  client: {
    select: { id: true, name: true, phone: true, email: true },
  },
  followUp: {
    select: { id: true, title: true, status: true },
  },
  workOrder: {
    select: { id: true, number: true, statut: true },
  },
  items: { orderBy: [{ position: "asc" }, { id: "asc" }] },
  events: { orderBy: { createdAt: "desc" }, take: 100 },
};

export class ThermosOrderError extends Error {
  constructor(message, { code = "THERMOS_ORDER_ERROR", status = 400, details = null } = {}) {
    super(message);
    this.name = "ThermosOrderError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function thermosOrderErrorPayload(error) {
  return {
    error: error?.message || "Erreur serveur",
    code: error?.code || "INTERNAL_ERROR",
    ...(error?.details ? { details: error.details } : {}),
  };
}

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function toId(value, label = "Identifiant") {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ThermosOrderError(`${label} invalide`, { code: "INVALID_ID" });
  }
  return id;
}

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + Math.max(0, Number.parseInt(days, 10) || 0));
  return result;
}

function dateOnly(value) {
  const text = cleanText(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ThermosOrderError("Nouvelle date prévue invalide", { code: "INVALID_EXPECTED_DATE" });
  }
  const date = new Date(`${text}T12:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new ThermosOrderError("Nouvelle date prévue invalide", { code: "INVALID_EXPECTED_DATE" });
  }
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Toronto",
  }).formatToParts(new Date());
  const part = (type) => todayParts.find((entry) => entry.type === type)?.value || "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  if (text < today) {
    throw new ThermosOrderError("La nouvelle date prévue ne peut pas être dans le passé", {
      code: "EXPECTED_DATE_IN_PAST",
    });
  }
  return date;
}

function cloneJson(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function normalizeJsonObject(value) {
  const normalized = cloneJson(value, {});
  return normalized && typeof normalized === "object" && !Array.isArray(normalized) ? normalized : {};
}

function hashToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

function newOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

function orderNumberCandidate() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `VT-CMD-${stamp}-${suffix}`;
}

function daysRemaining(expectedReadyAt, now = new Date()) {
  if (!expectedReadyAt) return null;
  const expected = expectedReadyAt instanceof Date ? expectedReadyAt : new Date(expectedReadyAt);
  if (!Number.isFinite(expected.getTime())) return null;
  return Math.ceil((expected.getTime() - now.getTime()) / 86_400_000);
}

export function serializeThermosOrder(order, { compact = false } = {}) {
  if (!order) return null;
  const serialized = {
    id: order.id,
    number: order.number,
    supplierId: order.supplierId,
    measurementId: order.measurementId,
    clientId: order.clientId,
    followUpId: order.followUpId,
    workOrderId: order.workOrderId,
    status: order.status,
    statusLabel: THERMOS_ORDER_STATUS_LABELS[order.status] || order.status,
    revision: order.revision,
    supplierNameSnapshot: order.supplierNameSnapshot,
    supplierContactSnapshot: order.supplierContactSnapshot,
    supplierEmailSnapshot: order.supplierEmailSnapshot,
    clientNameSnapshot: order.clientNameSnapshot,
    leadTimeDaysSnapshot: order.leadTimeDaysSnapshot,
    sentAt: toIso(order.sentAt),
    expectedReadyAt: toIso(order.expectedReadyAt),
    nextReminderAt: toIso(order.nextReminderAt),
    lastReminderAt: toIso(order.lastReminderAt),
    reminderCount: order.reminderCount,
    lastReminderError: order.lastReminderError || null,
    lastSupplierResponseAt: toIso(order.lastSupplierResponseAt),
    readyAt: toIso(order.readyAt),
    receivedAt: toIso(order.receivedAt),
    cancelledAt: toIso(order.cancelledAt),
    createdAt: toIso(order.createdAt),
    updatedAt: toIso(order.updatedAt),
    daysRemaining: daysRemaining(order.expectedReadyAt),
    itemCount: order._count?.items ?? order.items?.length ?? 0,
    supplier: order.supplier || null,
    measurement: order.measurement
      ? (() => {
          const { data: _data, ...safeMeasurement } = order.measurement;
          return { ...safeMeasurement, validatedAt: toIso(order.measurement.validatedAt) };
        })()
      : null,
    client: order.client || null,
    followUp: order.followUp || null,
    workOrder: order.workOrder || null,
  };
  if (!compact) {
    serialized.items = (order.items || []).map((item) => ({ ...item }));
    serialized.events = (order.events || []).map((event) => ({
      ...event,
      createdAt: toIso(event.createdAt),
    }));
  }
  return serialized;
}

export async function getThermosOrder(id) {
  const orderId = toId(id, "Commande");
  const order = await prisma.thermosOrder.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
  if (!order) {
    throw new ThermosOrderError("Commande de thermos introuvable", {
      code: "ORDER_NOT_FOUND",
      status: 404,
    });
  }
  return order;
}

function sixteenthsFromValue(item, field) {
  const direct = Number.parseInt(item?.[`${field}Sixteenths`], 10);
  if (Number.isInteger(direct) && direct > 0) return direct;

  const measurement = item?.measurements?.[field] ?? item?.dimensions?.[field];
  if (measurement && typeof measurement === "object") {
    const whole = Number.parseInt(measurement.whole ?? measurement.inches, 10) || 0;
    const numerator = Number.parseInt(measurement.numerator, 10) || 0;
    const denominator = Number.parseInt(measurement.denominator, 10) || 16;
    const converted = whole * 16 + Math.round((numerator / Math.max(1, denominator)) * 16);
    if (converted > 0) return converted;
  }

  const inches = Number(item?.[`${field}Inches`] ?? item?.dimensions?.[`${field}Inches`]);
  if (Number.isFinite(inches) && inches > 0) return Math.round(inches * 16);
  return 0;
}

function measurementWindows(data) {
  if (!data || typeof data !== "object") return [];
  const candidates = [data.windows, data.openings, data.fenetres];
  return candidates.find(Array.isArray) || [];
}

function windowThermos(window) {
  const candidates = [window?.thermoses, window?.panes, window?.thermos, window?.glassUnits, window?.vitres];
  return candidates.find(Array.isArray) || [];
}

function draftItemsFromMeasurement(measurement) {
  const windows = measurementWindows(measurement.data);
  const items = [];
  const missing = [];

  windows.forEach((window, windowIndex) => {
    const windowNumber = Number.parseInt(window?.number, 10) || windowIndex + 1;
    let physicalThermosNumber = 0;
    windowThermos(window).forEach((thermos, thermosIndex) => {
      if (thermos?.deleted === true || thermos?.isDeleted === true || thermos?.active === false) return;
      const quantity = Math.min(50, Math.max(1, Number.parseInt(thermos?.quantity, 10) || 1));
      const widthSixteenths = sixteenthsFromValue(thermos, "width");
      const heightSixteenths = sixteenthsFromValue(thermos, "height");
      const thicknessSixteenths = sixteenthsFromValue(thermos, "thickness");
      if (!widthSixteenths || !heightSixteenths || !thicknessSixteenths) {
        missing.push({
          windowNumber,
          thermosNumber: thermosIndex + 1,
          widthSixteenths,
          heightSixteenths,
          thicknessSixteenths,
        });
        return;
      }

      for (let copy = 0; copy < quantity; copy += 1) {
        physicalThermosNumber += 1;
        items.push({
          sourceThermosId: cleanText(thermos?.id || thermos?.code, 100) || null,
          windowNumber,
          thermosNumber: physicalThermosNumber,
          widthSixteenths,
          heightSixteenths,
          thicknessSixteenths,
          options: normalizeJsonObject(thermos?.options),
          grille: normalizeJsonObject(thermos?.grille || thermos?.decorativeGrille),
          geometry: normalizeJsonObject(
            thermos?.geometry || {
              x: thermos?.x,
              y: thermos?.y,
              width: thermos?.width,
              height: thermos?.height,
            },
          ),
          photoUrl: cleanText(thermos?.photoUrl || window?.photoUrl, 1000) || null,
          notes: cleanText(thermos?.notes || thermos?.options?.notes, 4000) || null,
        });
      }
    });
  });

  if (missing.length) {
    throw new ThermosOrderError(
      "Toutes les dimensions finales, incluant l'épaisseur, sont requises avant la commande",
      { code: "INCOMPLETE_FINAL_MEASUREMENTS", details: { missing } },
    );
  }
  if (!items.length) {
    throw new ThermosOrderError("Aucun thermos physique valide dans cette fiche de mesures", {
      code: "NO_THERMOS_ITEMS",
    });
  }
  return items;
}

function assertFinalTechnicianMeasurement(measurement) {
  const source = cleanText(measurement?.source, 30).toLowerCase();
  const accuracy = cleanText(measurement?.accuracy, 30).toLowerCase();
  const status = cleanText(measurement?.status, 40).toLowerCase();
  const validated = Boolean(measurement?.validatedAt) || ["validated", "final", "completed"].includes(status);
  if (source !== "technician" || accuracy !== "final" || !validated) {
    throw new ThermosOrderError(
      "Une commande fournisseur exige des mesures finales validées par un technicien",
      {
        code: "FINAL_TECHNICIAN_MEASUREMENTS_REQUIRED",
        details: { source, accuracy, status, validatedAt: toIso(measurement?.validatedAt) },
      },
    );
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

function comparableOrderItems(items) {
  return (items || []).map((item) => ({
    sourceThermosId: item.sourceThermosId || null,
    windowNumber: Number(item.windowNumber),
    thermosNumber: Number(item.thermosNumber),
    widthSixteenths: Number(item.widthSixteenths),
    heightSixteenths: Number(item.heightSixteenths),
    thicknessSixteenths: Number(item.thicknessSixteenths),
    options: normalizeJsonObject(item.options),
    grille: normalizeJsonObject(item.grille),
    geometry: normalizeJsonObject(item.geometry),
    photoUrl: item.photoUrl || null,
    notes: item.notes || null,
  }));
}

async function makeUniqueInternalCodes(clientId, measurementId, revision, items) {
  const prefix = `VT-${String(clientId).padStart(5, "0")}`;
  const proposed = items.map((item) =>
    `${prefix}-F${String(item.windowNumber).padStart(2, "0")}-T${String(item.thermosNumber).padStart(2, "0")}`,
  );
  const existing = await prisma.thermosOrderItem.findMany({
    where: { internalCode: { in: proposed } },
    select: { internalCode: true },
  });
  const used = new Set(existing.map((item) => item.internalCode));
  return items.map((item, index) => {
    let code = proposed[index];
    if (used.has(code)) code = `${code}-M${String(measurementId).padStart(4, "0")}`;
    if (revision > 1) code = `${code}-R${revision}`;
    used.add(code);
    return code;
  });
}

export async function createThermosOrder({ measurementId, supplierId = null, actorLabel = null } = {}) {
  const parsedMeasurementId = toId(measurementId, "Fiche de mesures");
  const measurement = await prisma.thermosMeasurement.findUnique({
    where: { id: parsedMeasurementId },
    include: {
      client: { select: { id: true, name: true } },
      thermosOrders: {
        select: { id: true, number: true, status: true, revision: true },
        orderBy: { revision: "desc" },
      },
    },
  });
  if (!measurement) {
    throw new ThermosOrderError("Fiche de mesures introuvable", {
      code: "MEASUREMENT_NOT_FOUND",
      status: 404,
    });
  }
  assertFinalTechnicianMeasurement(measurement);
  if (!measurement.client) {
    throw new ThermosOrderError("La fiche de mesures doit être liée à un client", {
      code: "MEASUREMENT_CLIENT_REQUIRED",
    });
  }

  const activeOrder = measurement.thermosOrders.find((order) => ![THERMOS_ORDER_STATUS.CANCELLED, THERMOS_ORDER_STATUS.RECEIVED].includes(order.status));
  if (activeOrder) {
    throw new ThermosOrderError(`Une commande active existe déjà (${activeOrder.number})`, {
      code: "ORDER_ALREADY_EXISTS",
      status: 409,
      details: { orderId: activeOrder.id, number: activeOrder.number },
    });
  }

  const supplier = supplierId
    ? await prisma.thermosSupplier.findUnique({ where: { id: toId(supplierId, "Fournisseur") } })
    : await prisma.thermosSupplier.findFirst({
        where: { isActive: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      });
  if (!supplier || !supplier.isActive) {
    throw new ThermosOrderError("Aucun fournisseur de thermos actif n'est configuré", {
      code: "ACTIVE_SUPPLIER_REQUIRED",
    });
  }

  const rawItems = draftItemsFromMeasurement(measurement);
  const revision = Math.max(0, ...measurement.thermosOrders.map((order) => order.revision || 0)) + 1;
  let created = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const internalCodes = await makeUniqueInternalCodes(measurement.clientId, measurement.id, revision, rawItems);
    const itemRows = rawItems.map((item, index) => ({
      ...item,
      label: `${measurement.client.name} — Fenêtre ${item.windowNumber} — Thermos ${item.thermosNumber}`,
      internalCode: internalCodes[index],
      position: index,
    }));
    try {
      created = await prisma.thermosOrder.create({
        data: {
          number: orderNumberCandidate(),
          supplierId: supplier.id,
          measurementId: measurement.id,
          clientId: measurement.clientId,
          followUpId: measurement.followUpId,
          workOrderId: measurement.workOrderId,
          status: THERMOS_ORDER_STATUS.DRAFT,
          revision,
          supplierNameSnapshot: supplier.name,
          supplierContactSnapshot: supplier.contactName,
          supplierEmailSnapshot: supplier.email,
          clientNameSnapshot: measurement.client.name,
          leadTimeDaysSnapshot: supplier.leadTimeDays,
          items: { create: itemRows },
          events: {
            create: {
              type: "created",
              actorType: "admin",
              actorLabel: cleanText(actorLabel, 200) || null,
              metadata: { measurementId: measurement.id, revision, itemCount: itemRows.length },
            },
          },
        },
        include: ORDER_INCLUDE,
      });
      break;
    } catch (error) {
      if (error?.code !== "P2002") throw error;
      const concurrentOrder = await prisma.thermosOrder.findFirst({
        where: { measurementId: measurement.id, status: { notIn: [THERMOS_ORDER_STATUS.CANCELLED, THERMOS_ORDER_STATUS.RECEIVED] } },
        select: { id: true, number: true },
      });
      if (concurrentOrder) {
        throw new ThermosOrderError(`Une commande active existe déjà (${concurrentOrder.number})`, {
          code: "ORDER_ALREADY_EXISTS",
          status: 409,
          details: { orderId: concurrentOrder.id, number: concurrentOrder.number },
        });
      }
      if (attempt === 4) throw error;
    }
  }
  publishAdminEvent({
    type: "thermos_order.changed",
    entityType: "thermos_order",
    entityId: created.id,
    clientId: created.clientId,
  });
  return created;
}

export async function sendThermosOrder(orderId, { actorLabel = null } = {}) {
  const order = await getThermosOrder(orderId);
  if (order.status !== THERMOS_ORDER_STATUS.DRAFT) {
    throw new ThermosOrderError("Cette commande a déjà été envoyée", {
      code: "ORDER_ALREADY_SENT",
      status: 409,
    });
  }
  // Le brouillon est un snapshot. Toute correction de la fiche invalide son
  // statut final; on refuse donc d'envoyer un ancien snapshot par mégarde.
  assertFinalTechnicianMeasurement(order.measurement);
  const liveItems = draftItemsFromMeasurement(order.measurement);
  if (stableJson(comparableOrderItems(liveItems)) !== stableJson(comparableOrderItems(order.items))) {
    throw new ThermosOrderError("Les mesures ont changé depuis la préparation de cette commande. Annulez ce brouillon et préparez une nouvelle révision.", {
      code: "ORDER_SNAPSHOT_STALE",
      status: 409,
    });
  }

  const claimTime = new Date();
  const claimed = await prisma.thermosOrder.updateMany({
    where: {
      id: order.id,
      status: THERMOS_ORDER_STATUS.DRAFT,
      OR: [{ reminderLeaseUntil: null }, { reminderLeaseUntil: { lt: claimTime } }],
    },
    data: { reminderLeaseUntil: new Date(claimTime.getTime() + 10 * 60_000) },
  });
  if (!claimed.count) {
    throw new ThermosOrderError("L'envoi de cette commande est déjà en cours", {
      code: "ORDER_SEND_IN_PROGRESS",
      status: 409,
    });
  }

  try {
    const company = await getCompany();
    const pdfBuffer = await generateThermosOrderPdf(order, company);
    const delivery = await sendThermosOrderEmail(order, pdfBuffer);
    const now = new Date();
    const expectedReadyAt = addDays(now, order.leadTimeDaysSnapshot);
    const updated = await prisma.thermosOrder.update({
      where: { id: order.id },
      data: {
        status: THERMOS_ORDER_STATUS.SENT,
        sentAt: now,
        expectedReadyAt,
        nextReminderAt: order.supplier?.autoFollowUpEnabled ? expectedReadyAt : null,
        reminderLeaseUntil: null,
        lastReminderError: null,
        events: {
          create: {
            type: "sent",
            actorType: "admin",
            actorLabel: cleanText(actorLabel, 200) || null,
            metadata: { to: delivery.to, expectedReadyAt: expectedReadyAt.toISOString() },
          },
        },
      },
      include: ORDER_INCLUDE,
    });
    publishAdminEvent({
      type: "thermos_order.changed",
      entityType: "thermos_order",
      entityId: updated.id,
      clientId: updated.clientId,
    });
    return { order: updated, delivery };
  } catch (error) {
    await prisma.thermosOrder.updateMany({
      where: { id: order.id, status: THERMOS_ORDER_STATUS.DRAFT },
      data: {
        reminderLeaseUntil: null,
        lastReminderError: cleanText(error?.message, 4000) || "Erreur d'envoi",
      },
    }).catch(() => {});
    await prisma.thermosOrderEvent.create({
      data: {
        orderId: order.id,
        type: "send_failed",
        actorType: "system",
        actorLabel: cleanText(actorLabel, 200) || null,
        metadata: { error: cleanText(error?.message, 1000) || "Erreur d'envoi" },
      },
    }).catch(() => {});
    throw error;
  }
}

async function sendReminderForOrder(order, { actorType = "system", actorLabel = null } = {}) {
  if (!ACTIVE_RESPONSE_STATUSES.has(order.status)) {
    throw new ThermosOrderError("Cette commande n'attend pas de confirmation fournisseur", {
      code: "ORDER_NOT_AWAITING_SUPPLIER",
      status: 409,
    });
  }
  const token = newOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = addDays(new Date(), 30);
  const tokenRow = await prisma.thermosOrderResponseToken.create({
    data: { orderId: order.id, tokenHash, expiresAt },
  });
  try {
    const delivery = await sendThermosOrderReminderEmail(order, token);
    const now = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      await tx.thermosOrderResponseToken.updateMany({
        where: {
          orderId: order.id,
          id: { not: tokenRow.id },
          usedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });
      return tx.thermosOrder.update({
        where: { id: order.id },
        data: {
          status: THERMOS_ORDER_STATUS.AWAITING_CONFIRMATION,
          nextReminderAt: null,
          lastReminderAt: now,
          reminderCount: { increment: 1 },
          reminderLeaseUntil: null,
          lastReminderError: null,
          events: {
            create: {
              type: "reminder_sent",
              actorType,
              actorLabel: cleanText(actorLabel, 200) || null,
              metadata: { to: delivery.to, tokenExpiresAt: expiresAt.toISOString() },
            },
          },
        },
        include: ORDER_INCLUDE,
      });
    });
    publishAdminEvent({
      type: "thermos_order.changed",
      entityType: "thermos_order",
      entityId: updated.id,
      clientId: updated.clientId,
    });
    return { order: updated, delivery };
  } catch (error) {
    await prisma.thermosOrderResponseToken.updateMany({
      where: { id: tokenRow.id, usedAt: null },
      data: { revokedAt: new Date() },
    }).catch(() => {});
    throw error;
  }
}

export async function resendThermosOrder(orderId, { actorLabel = null } = {}) {
  const order = await getThermosOrder(orderId);
  if (order.status === THERMOS_ORDER_STATUS.DRAFT) return sendThermosOrder(order.id, { actorLabel });
  if (order.status === THERMOS_ORDER_STATUS.AWAITING_CONFIRMATION) {
    return sendReminderForOrder(order, { actorType: "admin", actorLabel });
  }
  if ([THERMOS_ORDER_STATUS.RECEIVED, THERMOS_ORDER_STATUS.CANCELLED].includes(order.status)) {
    throw new ThermosOrderError("Cette commande est fermée et ne peut pas être renvoyée", {
      code: "ORDER_CLOSED",
      status: 409,
    });
  }

  const company = await getCompany();
  const pdfBuffer = await generateThermosOrderPdf(order, company);
  const delivery = await sendThermosOrderEmail(order, pdfBuffer);
  const updated = await prisma.thermosOrder.update({
    where: { id: order.id },
    data: {
      events: {
        create: {
          type: "order_resent",
          actorType: "admin",
          actorLabel: cleanText(actorLabel, 200) || null,
          metadata: { to: delivery.to },
        },
      },
    },
    include: ORDER_INCLUDE,
  });
  publishAdminEvent({
    type: "thermos_order.changed",
    entityType: "thermos_order",
    entityId: updated.id,
    clientId: updated.clientId,
  });
  return { order: updated, delivery };
}

export async function processThermosOrderReminders({ now = new Date(), limit = 25 } = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 25));
  const candidates = await prisma.thermosOrder.findMany({
    where: {
      status: { in: [THERMOS_ORDER_STATUS.SENT, THERMOS_ORDER_STATUS.DELAYED] },
      nextReminderAt: { lte: now },
      supplier: { autoFollowUpEnabled: true, isActive: true },
      OR: [{ reminderLeaseUntil: null }, { reminderLeaseUntil: { lt: now } }],
    },
    orderBy: { nextReminderAt: "asc" },
    take: safeLimit,
    include: ORDER_INCLUDE,
  });
  const results = [];

  for (const order of candidates) {
    const leaseUntil = new Date(now.getTime() + 10 * 60_000);
    const claimed = await prisma.thermosOrder.updateMany({
      where: {
        id: order.id,
        status: { in: [THERMOS_ORDER_STATUS.SENT, THERMOS_ORDER_STATUS.DELAYED] },
        nextReminderAt: { lte: now },
        OR: [{ reminderLeaseUntil: null }, { reminderLeaseUntil: { lt: now } }],
      },
      data: { reminderLeaseUntil: leaseUntil },
    });
    if (!claimed.count) continue;

    try {
      const fresh = await getThermosOrder(order.id);
      await sendReminderForOrder(fresh, { actorType: "system", actorLabel: "Relance automatique" });
      results.push({ id: order.id, number: order.number, sent: true });
    } catch (error) {
      const retryAt = addDays(now, 1);
      await prisma.thermosOrder.update({
        where: { id: order.id },
        data: {
          reminderLeaseUntil: null,
          lastReminderError: cleanText(error?.message || "Erreur d'envoi", 4000),
          nextReminderAt: retryAt,
          events: {
            create: {
              type: "send_failed",
              actorType: "system",
              actorLabel: "Relance automatique",
              metadata: { error: cleanText(error?.message || "Erreur d'envoi", 1000), retryAt: retryAt.toISOString() },
            },
          },
        },
      });
      results.push({ id: order.id, number: order.number, sent: false, error: error?.message || "Erreur" });
    }
  }
  return {
    checked: candidates.length,
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
    results,
  };
}

export async function markThermosOrderReceived(orderId, { actorLabel = null } = {}) {
  const order = await getThermosOrder(orderId);
  if (order.status === THERMOS_ORDER_STATUS.RECEIVED) return order;
  if ([THERMOS_ORDER_STATUS.DRAFT, THERMOS_ORDER_STATUS.CANCELLED].includes(order.status)) {
    throw new ThermosOrderError("Cette commande ne peut pas être marquée reçue", {
      code: "ORDER_CANNOT_BE_RECEIVED",
      status: 409,
    });
  }
  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    await tx.thermosOrderResponseToken.updateMany({
      where: { orderId: order.id, usedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    return tx.thermosOrder.update({
      where: { id: order.id },
      data: {
        status: THERMOS_ORDER_STATUS.RECEIVED,
        receivedAt: now,
        nextReminderAt: null,
        reminderLeaseUntil: null,
        events: {
          create: {
            type: "received",
            actorType: "admin",
            actorLabel: cleanText(actorLabel, 200) || null,
          },
        },
      },
      include: ORDER_INCLUDE,
    });
  });
  publishAdminEvent({
    type: "thermos_order.changed",
    entityType: "thermos_order",
    entityId: updated.id,
    clientId: updated.clientId,
  });
  return updated;
}

export async function cancelThermosOrder(orderId, { actorLabel = null, reason = null } = {}) {
  const order = await getThermosOrder(orderId);
  if (order.status === THERMOS_ORDER_STATUS.CANCELLED) return order;
  if (order.status !== THERMOS_ORDER_STATUS.DRAFT) {
    throw new ThermosOrderError("Une commande déjà envoyée doit être annulée directement avec le fournisseur", {
      code: "SENT_ORDER_REQUIRES_SUPPLIER_CANCELLATION",
      status: 409,
    });
  }
  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    await tx.thermosOrderResponseToken.updateMany({
      where: { orderId: order.id, usedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    return tx.thermosOrder.update({
      where: { id: order.id },
      data: {
        status: THERMOS_ORDER_STATUS.CANCELLED,
        cancelledAt: now,
        nextReminderAt: null,
        reminderLeaseUntil: null,
        events: {
          create: {
            type: "cancelled",
            actorType: "admin",
            actorLabel: cleanText(actorLabel, 200) || null,
            metadata: reason ? { reason: cleanText(reason, 1000) } : undefined,
          },
        },
      },
      include: ORDER_INCLUDE,
    });
  });
  publishAdminEvent({
    type: "thermos_order.changed",
    entityType: "thermos_order",
    entityId: updated.id,
    clientId: updated.clientId,
  });
  return updated;
}

export async function resolveThermosOrderResponseToken(rawToken) {
  const token = cleanText(rawToken, 300);
  if (!token) {
    throw new ThermosOrderError("Lien de confirmation invalide", {
      code: "INVALID_RESPONSE_TOKEN",
      status: 404,
    });
  }
  const tokenRow = await prisma.thermosOrderResponseToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      order: {
        include: {
          supplier: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      },
    },
  });
  if (!tokenRow) {
    throw new ThermosOrderError("Lien de confirmation invalide", {
      code: "INVALID_RESPONSE_TOKEN",
      status: 404,
    });
  }
  const now = new Date();
  if (tokenRow.revokedAt || tokenRow.expiresAt <= now) {
    throw new ThermosOrderError("Ce lien de confirmation est expiré", {
      code: "RESPONSE_TOKEN_EXPIRED",
      status: 410,
    });
  }
  return tokenRow;
}

export function publicThermosOrderResponseView(tokenRow) {
  const order = tokenRow.order;
  return {
    valid: true,
    used: Boolean(tokenRow.usedAt),
    expiresAt: toIso(tokenRow.expiresAt),
    order: {
      number: order.number,
      status: order.status,
      statusLabel: THERMOS_ORDER_STATUS_LABELS[order.status] || order.status,
      itemCount: order._count?.items || 0,
      expectedReadyAt: toIso(order.expectedReadyAt),
      lastSupplierResponseAt: toIso(order.lastSupplierResponseAt),
    },
  };
}

export async function respondToThermosOrder(rawToken, payload = {}) {
  const tokenRow = await resolveThermosOrderResponseToken(rawToken);
  if (tokenRow.usedAt) {
    throw new ThermosOrderError("Une réponse a déjà été enregistrée avec ce lien", {
      code: "RESPONSE_TOKEN_ALREADY_USED",
      status: 409,
    });
  }
  if (!ACTIVE_RESPONSE_STATUSES.has(tokenRow.order.status)) {
    throw new ThermosOrderError("Cette commande n'attend plus de réponse", {
      code: "ORDER_RESPONSE_NOT_REQUIRED",
      status: 409,
    });
  }
  const answer = cleanText(payload.answer, 10).toLowerCase();
  if (!new Set(["yes", "no"]).has(answer)) {
    throw new ThermosOrderError("Réponse invalide", { code: "INVALID_SUPPLIER_RESPONSE" });
  }
  const expectedReadyAt = answer === "no" ? dateOnly(payload.expectedReadyAt) : null;
  const note = cleanText(payload.note, 1000) || null;
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const consumed = await tx.thermosOrderResponseToken.updateMany({
      where: {
        id: tokenRow.id,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });
    if (!consumed.count) {
      throw new ThermosOrderError("Ce lien a déjà été utilisé ou a expiré", {
        code: "RESPONSE_TOKEN_UNAVAILABLE",
        status: 409,
      });
    }
    await tx.thermosOrderResponseToken.updateMany({
      where: {
        orderId: tokenRow.orderId,
        id: { not: tokenRow.id },
        usedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: now },
    });
    const orderData = answer === "yes"
      ? {
          status: THERMOS_ORDER_STATUS.READY,
          readyAt: now,
          lastSupplierResponseAt: now,
          nextReminderAt: null,
          reminderLeaseUntil: null,
        }
      : {
          status: THERMOS_ORDER_STATUS.DELAYED,
          expectedReadyAt,
          nextReminderAt: expectedReadyAt,
          readyAt: null,
          lastSupplierResponseAt: now,
          reminderLeaseUntil: null,
        };
    const changed = await tx.thermosOrder.updateMany({
      where: { id: tokenRow.orderId, status: { in: [...ACTIVE_RESPONSE_STATUSES] } },
      data: orderData,
    });
    if (!changed.count) {
      throw new ThermosOrderError("Cette commande n'attend plus de réponse fournisseur", {
        code: "ORDER_RESPONSE_NOT_REQUIRED",
        status: 409,
      });
    }
    await tx.thermosOrderEvent.create({
      data: {
        orderId: tokenRow.orderId,
        type: answer === "yes" ? "supplier_ready" : "supplier_delayed",
        actorType: "supplier",
        actorLabel: tokenRow.order.supplierContactSnapshot || tokenRow.order.supplierNameSnapshot,
        metadata: answer === "yes"
          ? (note ? { note } : undefined)
          : { expectedReadyAt: expectedReadyAt.toISOString(), ...(note ? { note } : {}) },
      },
    });
    return tx.thermosOrder.findUnique({ where: { id: tokenRow.orderId }, include: ORDER_INCLUDE });
  });
  publishAdminEvent({
    type: "thermos_order.changed",
    entityType: "thermos_order",
    entityId: updated.id,
    clientId: updated.clientId,
    actor: "supplier",
  });
  return updated;
}
