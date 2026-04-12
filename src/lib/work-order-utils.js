import prisma from "./prisma";

export async function generateWorkOrderNumber() {
  const year = new Date().getFullYear();

  // Get prefix from settings (default VOT)
  let prefix = "VOT";
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'work_order_prefix'`
    );
    if (rows[0]?.value) prefix = rows[0].value;
  } catch {}

  // Find the last number for this year
  const pattern = `${prefix}-${year}-%`;
  const rows = await prisma.$queryRawUnsafe(
    `SELECT number FROM work_orders WHERE number LIKE $1 ORDER BY number DESC LIMIT 1`,
    pattern
  );

  let nextNum = 1;
  if (rows[0]?.number) {
    const parts = rows[0].number.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
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
    "tps_rate",
    "tvq_rate",
    "work_order_prefix",
    "work_order_conditions",
  ];

  const defaults = {
    labor_rate_per_hour: "85.00",
    tps_number: "",
    tvq_number: "",
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
