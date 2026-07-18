import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  THERMOS_PRICING_KEYS,
  normalizeThermosPricingSettings,
} from "@/lib/thermos-pricing";
import { getThermosPricingSettings } from "@/lib/thermos-pricing-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ settings: await getThermosPricingSettings() });
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

    return NextResponse.json({ ok: true, settings: await getThermosPricingSettings() });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
