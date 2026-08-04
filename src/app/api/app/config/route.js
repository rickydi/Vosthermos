import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDevice } from "@/lib/app-device";
import {
  APP_CALL_DEFAULTS,
  APP_CALL_DELAY_KEY,
  APP_CALL_ENABLED_KEY,
  APP_CALL_IGNORED_KEY,
} from "@/lib/settings-keys";

export const dynamic = "force-dynamic";

// Configuration relue par le telephone. C'est ce qui evite de redistribuer un
// APK pour la moindre modification : le delai, les numeros a ignorer et
// l'interrupteur general vivent dans /admin/app, pas dans le code de l'app.
export async function GET(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [APP_CALL_ENABLED_KEY, APP_CALL_DELAY_KEY, APP_CALL_IGNORED_KEY] } },
    select: { key: true, value: true },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const rawDelay = Number(map[APP_CALL_DELAY_KEY]);
  const delaySeconds = Number.isFinite(rawDelay)
    ? Math.min(120, Math.max(0, Math.round(rawDelay)))
    : APP_CALL_DEFAULTS.delaySeconds;

  // Numeros a ignorer, compares sur les 10 derniers chiffres pour rester
  // insensibles au format de saisie.
  const ignoredNumbers = String(map[APP_CALL_IGNORED_KEY] || "")
    .split(/[,;\n]/)
    .map((n) => n.replace(/\D/g, "").slice(-10))
    .filter((n) => n.length === 10);

  return NextResponse.json({
    enabled: map[APP_CALL_ENABLED_KEY] !== "0",
    delaySeconds,
    ignoredNumbers,
    device: { id: device.id, name: device.name },
  }, { headers: { "Cache-Control": "no-store" } });
}
