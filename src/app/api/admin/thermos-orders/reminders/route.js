import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { processThermosOrderReminders } from "@/lib/thermos-orders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function equalSecret(actual, expected) {
  const a = Buffer.from(String(actual || ""));
  const b = Buffer.from(String(expected || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

async function authorized(request) {
  const expected = process.env.THERMOS_ORDER_CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (expected && equalSecret(bearer, expected)) return true;
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const result = await processThermosOrderReminders({ limit: body.limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}
