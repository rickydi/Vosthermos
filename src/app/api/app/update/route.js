import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { requireDevice } from "@/lib/app-device";
import { APK_PATH, getRelease } from "@/lib/app-release";

export const dynamic = "force-dynamic";

// Mise a jour de l'app depuis l'app elle-meme.
//
//   GET                 -> version disponible (l'app compare avec la sienne)
//   GET ?download=1     -> l'APK
//
// Authentifie par le JETON D'APPAREIL et non par une session admin : les
// associes ne sont pas connectes a l'admin sur leur telephone, et c'est
// justement ce qu'on voulait eviter.
export async function GET(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const release = await getRelease();
  if (!release) return NextResponse.json({ available: false }, { status: 200 });

  const { searchParams } = new URL(req.url);
  if (searchParams.get("download") !== "1") {
    return NextResponse.json({
      available: true,
      version: release.version,
      notes: release.notes,
      sizeBytes: release.sizeBytes,
      // Reverifiee par le telephone apres telechargement : une mise a jour
      // corrompue ne doit jamais atteindre l'installateur.
      sha256: release.sha256,
      uploadedAt: release.uploadedAt,
    }, { headers: { "Cache-Control": "no-store" } });
  }

  const file = await fs.readFile(APK_PATH);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="vosthermos-appels-${release.version}.apk"`,
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
    },
  });
}
