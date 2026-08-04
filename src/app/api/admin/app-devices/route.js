import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { createPendingDevice } from "@/lib/app-device";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  APP_CALL_DEFAULTS,
  APP_CALL_DELAY_KEY,
  APP_CALL_ENABLED_KEY,
  APP_CALL_IGNORED_KEY,
} from "@/lib/settings-keys";

export const dynamic = "force-dynamic";

// Liste des telephones + reglages de l'app. Le jeton n'est jamais renvoye : il
// n'existe en clair qu'une seule fois, au moment de l'activation sur l'appareil.
export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const [devices, rows] = await Promise.all([
    prisma.appDevice.findMany({
      orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, name: true, platform: true, model: true, appVersion: true,
        activationCode: true, activationExpiresAt: true,
        activatedAt: true, lastSeenAt: true, revokedAt: true, createdAt: true,
      },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: [APP_CALL_ENABLED_KEY, APP_CALL_DELAY_KEY, APP_CALL_IGNORED_KEY] } },
      select: { key: true, value: true },
    }),
  ]);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const delay = Number(map[APP_CALL_DELAY_KEY]);

  return NextResponse.json({
    devices,
    settings: {
      enabled: map[APP_CALL_ENABLED_KEY] !== "0",
      delaySeconds: Number.isFinite(delay) ? delay : APP_CALL_DEFAULTS.delaySeconds,
      ignoredNumbers: map[APP_CALL_IGNORED_KEY] || "",
    },
  });
}

// Nouveau telephone : cree un appareil en attente et rend son code d'activation.
export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const device = await createPendingDevice(body.name);

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "app_device",
    entityId: device.id,
    label: `Appareil app cree: ${device.name}`,
  });

  return NextResponse.json({
    id: device.id,
    name: device.name,
    activationCode: device.activationCode,
    activationExpiresAt: device.activationExpiresAt,
  });
}

// Reglages de l'app (delai, numeros ignores, interrupteur general). Ce sont eux
// qui evitent de redistribuer un APK pour un simple changement de comportement.
export async function PUT(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const updates = [];

  if (body.enabled === true || body.enabled === false) {
    updates.push([APP_CALL_ENABLED_KEY, body.enabled ? "1" : "0"]);
  }
  if (body.delaySeconds !== undefined) {
    const n = Number(body.delaySeconds);
    if (!Number.isFinite(n) || n < 0 || n > 120) {
      return NextResponse.json({ error: "Le delai doit etre entre 0 et 120 secondes." }, { status: 400 });
    }
    updates.push([APP_CALL_DELAY_KEY, String(Math.round(n))]);
  }
  if (body.ignoredNumbers !== undefined) {
    updates.push([APP_CALL_IGNORED_KEY, String(body.ignoredNumbers || "").slice(0, 2000)]);
  }

  for (const [key, value] of updates) {
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "app_settings",
    label: "Reglages de l'app Appels modifies",
    metadata: Object.fromEntries(updates),
  });

  return NextResponse.json({ ok: true });
}
