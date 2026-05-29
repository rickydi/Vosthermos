import prisma from "./prisma";
import { COMPANY_INFO } from "./company-info";
import { dateOnlyString } from "./date-only";
import { buildDocumentNumber, sanitizeDocumentPrefix } from "./vosthermos-document";

export const DEFAULT_LABOR_RATE = 85;

export async function generateWorkOrderNumber(db = prisma) {
  let prefix = "VOS";
  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'work_order_prefix'`
    );
    if (rows[0]?.value) prefix = sanitizeDocumentPrefix(rows[0].value);
  } catch {}

  const now = new Date();

  for (let offset = 0; offset < 60; offset++) {
    const candidate = buildDocumentNumber(new Date(now.getTime() + offset * 60000), prefix);
    const existing = await db.workOrder.findUnique({
      where: { number: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return buildDocumentNumber(new Date(now.getTime() + 60 * 60000), prefix);
}

export function isWorkOrderNumberCollision(err) {
  if (err?.code !== "P2002") return false;
  const target = Array.isArray(err?.meta?.target)
    ? err.meta.target.join(",")
    : String(err?.meta?.target || "");
  return target.includes("number") || target.includes("work_orders_number");
}

export async function withWorkOrderNumberRetry(factory, attempts = 5) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await factory(attempt);
    } catch (err) {
      if (!isWorkOrderNumberCollision(err) || attempt === attempts - 1) throw err;
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 50 + attempt * 25));
    }
  }
  throw lastError;
}

// Compose a full DateTime from a base date + "HH:mm" string.
// Returns null if either is missing/invalid.
export function composeDateTime(baseDate, hhmm) {
  if (!baseDate || !hhmm || typeof hhmm !== "string") return null;
  const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h > 23 || m > 59) return null;
  const datePart = dateOnlyString(baseDate);
  const d = datePart
    ? new Date(Number(datePart.slice(0, 4)), Number(datePart.slice(5, 7)) - 1, Number(datePart.slice(8, 10)))
    : (baseDate instanceof Date ? new Date(baseDate) : new Date(baseDate));
  d.setHours(h, m, 0, 0);
  return d;
}

export function computeDurationMinutes(arrivalAt, departureAt) {
  if (!arrivalAt || !departureAt) return null;
  const a = arrivalAt instanceof Date ? arrivalAt : new Date(arrivalAt);
  const d = departureAt instanceof Date ? departureAt : new Date(departureAt);
  const mins = Math.floor((d.getTime() - a.getTime()) / 60000);
  return mins > 0 ? mins : null;
}

// Format a DateTime as "HH:mm" in local time. Null-safe.
export function formatHHmm(dt) {
  if (!dt) return null;
  const d = dt instanceof Date ? dt : new Date(dt);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Normalize an item from body to its DB shape (without FKs).
export function normalizeItem(it, position) {
  const quantity = Number(it.quantity) || 0;
  const unitPrice = Number(it.unitPrice) || 0;
  const totalPrice = Math.round(quantity * unitPrice * 100) / 100;
  return {
    productId: it.productId || null,
    serviceId: it.serviceId || null,
    description: it.description || "",
    quantity,
    unitPrice,
    totalPrice,
    itemType: it.itemType || "piece",
    position,
  };
}

// Given a body with optional `items` (flat) and `sections` ([{unitCode, items}]),
// return the full flattened list for totals calc and metadata to rebuild after insert.
export function flattenSectionsBody(body) {
  const flatItems = Array.isArray(body.items) ? body.items : [];
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const allForCalc = [...flatItems];
  for (const s of sections) {
    for (const it of (s.items || [])) allForCalc.push(it);
  }
  return { flatItems, sections, allForCalc };
}

function normalizePlainText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function inferBuildingCode(unitCode) {
  const normalized = normalizePlainText(unitCode).trim().toUpperCase();
  if (!normalized) return null;

  const labeled = normalized.match(/\b(?:APPARTEMENT|APP|APT|UNITE|UNIT|LOCAL|BUREAU)\s+([A-Z])[-\s]?\d{1,5}\b/);
  if (labeled?.[1]) return labeled[1];

  const compact = normalized.match(/^([A-Z])[-\s]?\d{1,5}\b/);
  if (compact?.[1]) return compact[1];

  return null;
}

async function buildingIdForSectionUnit(tx, clientId, unitCode) {
  if (!clientId) return null;
  const buildingCode = inferBuildingCode(unitCode);
  if (!buildingCode) return null;

  const client = await tx.client.findUnique({
    where: { id: clientId },
    select: { type: true, address: true },
  });
  if (client?.type !== "gestionnaire") return null;

  const building = await tx.building.upsert({
    where: { clientId_code: { clientId, code: buildingCode } },
    create: {
      clientId,
      code: buildingCode,
      name: `Batiment ${buildingCode}`,
      address: client.address || null,
    },
    update: {},
    select: { id: true },
  });
  return building.id;
}

// Create sections + their items + flat items in a transaction.
// Also upserts a ClientUnit for each unitCode (auto-learn from usage).
// Returns the full WorkOrder with nested sections.items loaded.
export async function attachSectionsAndItems(tx, workOrderId, clientId, flatItems, sections) {
  // Flat (no section) items
  if (flatItems.length > 0) {
    await tx.workOrderItem.createMany({
      data: flatItems.map((it, i) => ({
        workOrderId,
        sectionId: null,
        ...normalizeItem(it, i),
      })),
    });
  }

  // Sections + their items + auto-learn ClientUnit
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const s = sections[sIdx];
    const unitCode = (s.unitCode || `Unite ${sIdx + 1}`).trim();

    if (clientId) {
      const buildingId = await buildingIdForSectionUnit(tx, clientId, unitCode);
      const existingUnit = await tx.clientUnit.findUnique({
        where: { clientId_code: { clientId, code: unitCode } },
        select: { id: true, buildingId: true },
      });
      if (existingUnit) {
        if (buildingId && !existingUnit.buildingId) {
          await tx.clientUnit.update({ where: { id: existingUnit.id }, data: { buildingId } });
        }
      } else {
        await tx.clientUnit.create({
          data: { clientId, code: unitCode, buildingId },
        });
      }
    }

    const section = await tx.workOrderSection.create({
      data: {
        workOrderId,
        unitCode,
        notes: s.notes || null,
        position: sIdx,
      },
    });
    if (Array.isArray(s.items) && s.items.length > 0) {
      await tx.workOrderItem.createMany({
        data: s.items.map((it, i) => ({
          workOrderId,
          sectionId: section.id,
          ...normalizeItem(it, i),
        })),
      });
    }
  }
}

export function calcTotals(items, laborHours, laborRate, tpsRate, tvqRate) {
  const totalPieces = items
    .filter((i) => i.itemType !== "labor")
    .reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);

  const totalLabor = Number(laborHours) * Number(laborRate);

  const subtotal = totalPieces + totalLabor;
  const tps = subtotal * Number(tpsRate);
  const tvq = subtotal * Number(tvqRate);
  const total = subtotal + tps + tvq;

  return {
    totalPieces: Math.round(totalPieces * 100) / 100,
    totalLabor: Math.round(totalLabor * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    tps: Math.round(tps * 100) / 100,
    tvq: Math.round(tvq * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calcTotalsFromPieces(totalPieces, laborHours, laborRate, tpsRate, tvqRate) {
  const roundedPieces = Math.round(Number(totalPieces || 0) * 100) / 100;
  const totalLabor = Math.round(Number(laborHours || 0) * Number(laborRate || 0) * 100) / 100;
  const subtotal = roundedPieces + totalLabor;
  const tps = subtotal * Number(tpsRate);
  const tvq = subtotal * Number(tvqRate);
  const total = subtotal + tps + tvq;

  return {
    totalPieces: roundedPieces,
    totalLabor,
    subtotal: Math.round(subtotal * 100) / 100,
    tps: Math.round(tps * 100) / 100,
    tvq: Math.round(tvq * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export async function getWorkOrderSettings() {
  const keys = [
    "labor_rate_per_hour",
    "tps_number",
    "tvq_number",
    "rbq_number",
    "tps_rate",
    "tvq_rate",
    "work_order_prefix",
    "work_order_conditions",
  ];

  const defaults = {
    labor_rate_per_hour: "85.00",
    tps_number: "",
    tvq_number: "",
    rbq_number: COMPANY_INFO.rbqNumber,
    tps_rate: "0.05",
    tvq_rate: "0.09975",
    work_order_prefix: "VOS",
    work_order_conditions: "",
  };

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT key, value FROM site_settings WHERE key = ANY($1)`,
      keys
    );
    const result = { ...defaults };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  } catch {
    return defaults;
  }
}
