import fs from "node:fs/promises";
import path from "node:path";

// L'APK de l'app « Appels ». Volontairement HORS de public/ : c'est une app
// interne, elle ne doit pas etre telechargeable par quiconque devine l'URL.
// Elle est servie par une route qui exige une session admin.
//
// Le dossier survit aux deploiements (deploy-safe.sh ne touche qu'a .next et au
// code suivi par git).
const RELEASE_DIR = path.join(process.cwd(), "storage", "app-release");
const APK_NAME = "vosthermos-appels.apk";
const META_NAME = "release.json";

export const APK_PATH = path.join(RELEASE_DIR, APK_NAME);
const META_PATH = path.join(RELEASE_DIR, META_NAME);

export async function ensureReleaseDir() {
  await fs.mkdir(RELEASE_DIR, { recursive: true });
}

/** Metadonnees de la version en ligne, ou null s'il n'y a pas encore d'APK. */
export async function getRelease() {
  try {
    const [meta, stat] = await Promise.all([
      fs.readFile(META_PATH, "utf8").then(JSON.parse).catch(() => ({})),
      fs.stat(APK_PATH),
    ]);
    return {
      version: meta.version || "inconnue",
      notes: meta.notes || "",
      sha256: meta.sha256 || null,
      sizeBytes: stat.size,
      uploadedAt: (meta.uploadedAt ? new Date(meta.uploadedAt) : stat.mtime).toISOString(),
    };
  } catch {
    return null; // aucun APK televerse pour l'instant
  }
}

export async function saveRelease(buffer, { version, notes, sha256 } = {}) {
  await ensureReleaseDir();
  await fs.writeFile(APK_PATH, buffer);
  await fs.writeFile(
    META_PATH,
    JSON.stringify(
      {
        version: version || "inconnue",
        notes: notes || "",
        // Rendu aux telephones : ils reverifient l'empreinte apres
        // telechargement avant de lancer l'installation.
        sha256: sha256 || null,
        uploadedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}
