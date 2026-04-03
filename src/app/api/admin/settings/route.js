import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const result = await prisma.$queryRawUnsafe(
    `SELECT value FROM site_settings WHERE key = $1`,
    key
  );
  return NextResponse.json({ value: result[0]?.value || null });
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
