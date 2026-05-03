import prisma from "./prisma";
import { COMPANY_INFO } from "./company-info";
import { dateOnlyString } from "./date-only";

const MIN_INVOICE_NUMBER = 150;

export async function generateWorkOrderNumber() {
  const year = new Date().getFullYear();

  let prefix = "VOT";
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'work_order_prefix'`
    );
    if (rows[0]?.value) prefix = rows[0].value;
  } catch {}

  const key = `workorder:${prefix}:${year}`;

  // Atomic increment via ON CONFLICT — safe under concurrent inserts.
  // Floor à MIN_INVOICE_NUMBER : si compteur < 150, passe à 150, sinon +1.
  const rows = await prisma.$queryRawUnsafe(
    `INSERT INTO counters ("key", "value") VALUES ($1, ${MIN_INVOICE_NUMBER})
     ON CONFLICT ("key") DO UPDATE SET "value" = GREATEST(counters."value" + 1, ${MIN_INVOICE_NUMBER})
     RETURNING "value"`,
    key
  );

  const nextNum = rows[0]?.value ?? MIN_INVOICE_NUMBER;
  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
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
      await tx.clientUnit.upsert({
        where: { clientId_code: { clientId, code: unitCode } },
        create: { clientId, code: unitCode },
        update: {}, // no-op: just ensure it exists
      });
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
    work_order_prefix: "VOT",
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
