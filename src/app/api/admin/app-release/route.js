import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { requireAdmin } from "@/lib/admin-auth";
import { APK_PATH, getRelease, saveRelease } from "@/lib/app-release";

export const dynamic = "force-dynamic";

// GET  : metadonnees (version, taille, date) affichees dans /admin/app
// GET ?download=1 : sert l'APK a un admin connecte
// PUT  : televersement depuis GitHub Actions (secret partage, pas de session)

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wantsFile = searchParams.get("download") === "1";

  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const release = await getRelease();
  if (!release) {
    return NextResponse.json({ available: false }, { status: wantsFile ? 404 : 200 });
  }
  if (!wantsFile) return NextResponse.json({ available: true, ...release });

  const file = await fs.readFile(APK_PATH);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      // Nom versionne : on voit ce qu'on installe, et deux versions ne se
      // melangent pas dans les telechargements du telephone.
      "Content-Disposition": `attachment; filename="vosthermos-appels-${release.version}.apk"`,
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(req) {
  // Televersement machine : pas de session, un secret partage avec le workflow
  // GitHub. Sans secret configure sur le serveur, la route est fermee.
  const expected = process.env.APP_RELEASE_UPLOAD_SECRET;
  const provided = req.headers.get("x-upload-secret");
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const version = req.headers.get("x-app-version") || "inconnue";
  const notes = req.headers.get("x-app-notes") || "";
  const buffer = Buffer.from(await req.arrayBuffer());
  if (buffer.length < 100_000) {
    return NextResponse.json({ error: "Fichier trop petit pour etre un APK" }, { status: 400 });
  }

  await saveRelease(buffer, { version, notes });
  return NextResponse.json({ ok: true, version, sizeBytes: buffer.length });
}
