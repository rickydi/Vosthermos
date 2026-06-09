#!/usr/bin/env node
// One-shot : reborne les images deja stockees sous public/uploads/ qui depassent 2048px.
// Le correctif memoire (src/lib/upload-photo.js) est "forward-only" ; ce script traite l'existant.
// Idempotent : une image deja <= 2048px est ignoree.
//
//   node scripts/bound-existing-uploads.mjs --dry-run   # liste sans rien modifier
//   node scripts/bound-existing-uploads.mjs             # redimensionne en place
//
// Note: redimensionne en place (ecrit un .tmp puis rename atomique). L'URL/extension du
// fichier ne change PAS (on garde le meme format de sortie), donc aucune reference en DB a mettre a jour.

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

sharp.cache(false);
sharp.concurrency(1);

const MAX_DIMENSION = 2048;
const SHARP_MAX_INPUT_PIXELS = 80_000_000;
const ROOT = path.join(process.cwd(), "public", "uploads");
const DRY = process.argv.includes("--dry-run");
const IMG_RE = /\.(jpe?g|png|webp|gif|avif|tiff?|heic|heif)$/i;

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, acc);
    else if (IMG_RE.test(e.name)) acc.push(p);
  }
  return acc;
}

const stats = { scanned: 0, resized: 0, skipped: 0, errors: 0, savedBytes: 0 };

async function processFile(p) {
  stats.scanned++;
  let meta;
  try {
    meta = await sharp(p, { limitInputPixels: SHARP_MAX_INPUT_PIXELS, animated: true }).metadata();
  } catch (e) {
    stats.errors++;
    console.warn(`  ! illisible (ignore): ${path.relative(ROOT, p)} — ${e.message}`);
    return;
  }
  const w = meta.width || 0;
  const h = meta.height || 0;
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
    stats.skipped++;
    return;
  }

  const before = (await fs.stat(p)).size;
  console.log(`  ${DRY ? "[dry]" : "→"} ${path.relative(ROOT, p)}  ${w}x${h} (${(before / 1024 / 1024).toFixed(1)} Mo)`);
  if (DRY) {
    stats.resized++;
    return;
  }

  const animated = (meta.pages || 1) > 1;
  try {
    let pipeline = sharp(p, { limitInputPixels: SHARP_MAX_INPUT_PIXELS, animated });
    if (!animated) pipeline = pipeline.rotate();
    const out = await pipeline
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    const tmp = `${p}.tmp-${Date.now()}`;
    await fs.writeFile(tmp, out);
    await fs.rename(tmp, p);
    stats.resized++;
    stats.savedBytes += before - out.length;
  } catch (e) {
    stats.errors++;
    console.warn(`  ! echec resize: ${path.relative(ROOT, p)} — ${e.message}`);
  }
}

(async () => {
  console.log(`Scan de ${ROOT}${DRY ? "  (DRY-RUN — aucune modification)" : ""}`);
  const files = await walk(ROOT);
  console.log(`${files.length} image(s) trouvee(s).\n`);
  // Sequentiel : le verrou implicite limite le pic memoire native.
  for (const f of files) await processFile(f);
  console.log(
    `\nTermine. scannees=${stats.scanned} redimensionnees=${stats.resized} ` +
      `deja_ok=${stats.skipped} erreurs=${stats.errors} ` +
      `espace_libere=${(stats.savedBytes / 1024 / 1024).toFixed(1)} Mo`,
  );
})();
