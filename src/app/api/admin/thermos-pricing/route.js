import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  THERMOS_PRICING_DEFAULTS,
  THERMOS_PRICING_KEYS,
  normalizeThermosPricingSettings,
} from "@/lib/thermos-pricing";

export const dynamic = "force-dynamic";

async function readSettings() {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT key, value FROM site_settings WHERE key = ANY($1)`,
    THERMOS_PRICING_KEYS,
  );
  const result = { ...THERMOS_PRICING_DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  return normalizeThermosPricingSettings(result);
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ settings: await readSettings() });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const settings = normalizeThermosPricingSettings(body.settings || body);

    for (const key of THERMOS_PRICING_KEYS) {
      if (settings[key] === undefined) continue;
      await prisma.$executeRawUnsafe(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        key,
        String(settings[key]),
      );
    }

    return NextResponse.json({ ok: true, settings: await readSettings() });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
