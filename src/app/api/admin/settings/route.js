import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function maskKey(value) {
  if (!value || value.length <= 8) return value ? "••••••••" : "";
  return "••••••••" + value.slice(-8);
}

const COMPANY_KEYS = [
  "company_legal_name",
  "company_address",
  "company_city",
  "company_province",
  "company_postal_code",
  "company_phone",
  "company_email",
  "company_web",
  "company_neq",
  "tps_number",
  "tvq_number",
];

const COMPANY_DEFAULTS = {
  company_legal_name: "",
  company_address: "330 Ch. St-Francois-Xavier, Local 104",
  company_city: "Saint-Francois-Xavier-de-Brompton",
  company_province: "QC",
  company_postal_code: "J5B 1C9",
  company_phone: "514-825-8411",
  company_email: "info@vosthermos.com",
  company_web: "vosthermos.com",
  company_neq: "",
  tps_number: "",
  tvq_number: "",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  // API keys section (admin only, returns masked values)
  if (section === "api-keys") {
    try {
      await requireAdmin();
      const rows = await prisma.$queryRawUnsafe(
        `SELECT key, value FROM site_settings WHERE key IN ('api_key_anthropic', 'api_key_serper')`
      );
      const map = {};
      for (const r of rows) map[r.key] = r.value;
      return NextResponse.json({
        anthropic: maskKey(map.api_key_anthropic || ""),
        serper: maskKey(map.api_key_serper || ""),
      });
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Company section (infos de facturation — lisible par admin et par bon preview)
  if (section === "company") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT key, value FROM site_settings WHERE key = ANY($1)`,
        COMPANY_KEYS,
      );
      const result = { ...COMPANY_DEFAULTS };
      for (const row of rows) result[row.key] = row.value;
      return NextResponse.json(result);
    } catch {
      return NextResponse.json(COMPANY_DEFAULTS);
    }
  }

  // Default: single key lookup
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const result = await prisma.$queryRawUnsafe(
    `SELECT value FROM site_settings WHERE key = $1`,
    key
  );
  return NextResponse.json({ value: result[0]?.value || null });
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();

    // API keys section
    if (body.section === "api-keys") {
      if (body.anthropic) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO site_settings (key, value) VALUES ('api_key_anthropic', $1) ON CONFLICT (key) DO UPDATE SET value = $1`,
          body.anthropic
        );
      }
      if (body.serper) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO site_settings (key, value) VALUES ('api_key_serper', $1) ON CONFLICT (key) DO UPDATE SET value = $1`,
          body.serper
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Company section — save all provided company_* + tax fields
    if (body.section === "company") {
      for (const key of COMPANY_KEYS) {
        if (body[key] === undefined) continue;
        await prisma.$executeRawUnsafe(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
          key, String(body[key] || ""),
        );
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "section required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

    await prisma.$executeRawUnsafe(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
      key, String(value)
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
