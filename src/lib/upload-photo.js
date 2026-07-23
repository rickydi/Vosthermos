import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

// sharp/libvips decode les images en memoire NATIVE hors-tas (non bornee par Node).
// On bride le cache + la concurrence au minimum pour eviter qu'un upload fasse exploser
// la RAM du conteneur (16 Go, sans swap) et provoque un hard-reset par l'hote.
sharp.cache(false);
sharp.concurrency(1);

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB (taille fichier, voie openings/logos)
const MAX_DIMENSION = 2048; // cote le plus long stocke sur disque
const SHARP_MAX_INPUT_PIXELS = 80_000_000; // ~80 MP par frame : rejette les images-bombes
const MAX_TOTAL_PIXELS = 100_000_000; // budget w*h*frames : borne aussi les GIF/WebP animes (canvas petit, milliers de frames)

// Format REEL detecte par magic bytes (sharp) -> extension coherente avec le contenu.
const FORMAT_TO_EXT = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  avif: "avif",
  heif: "heic",
  tiff: "tiff",
  svg: "svg",
};

// Identifie les formats autorises a partir du contenu reel du fichier.
// Le nom et le Content-Type viennent du navigateur et peuvent etre absents ou
// faux (certains telephones nomment notamment un JPEG avec l'extension .heic).
export function detectImageFormat(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input || []);

  if (
    buffer.length >= 3
    && buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff
  ) {
    return { format: "jpeg", ext: "jpg", mime: "image/jpeg" };
  }

  if (
    buffer.length >= 8
    && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { format: "png", ext: "png", mime: "image/png" };
  }

  const firstSix = buffer.length >= 6 ? buffer.subarray(0, 6).toString("ascii") : "";
  if (firstSix === "GIF87a" || firstSix === "GIF89a") {
    return { format: "gif", ext: "gif", mime: "image/gif" };
  }

  if (
    buffer.length >= 12
    && buffer.subarray(0, 4).toString("ascii") === "RIFF"
    && buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { format: "webp", ext: "webp", mime: "image/webp" };
  }

  // HEIC/HEIF et AVIF utilisent tous le conteneur ISO-BMFF "ftyp".
  if (buffer.length >= 16 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const declaredSize = buffer.readUInt32BE(0);
    const end = Math.min(buffer.length, declaredSize >= 16 ? declaredSize : buffer.length, 128);
    const brands = [buffer.subarray(8, 12).toString("ascii")];
    for (let offset = 16; offset + 4 <= end; offset += 4) {
      brands.push(buffer.subarray(offset, offset + 4).toString("ascii"));
    }

    if (brands.some((brand) => brand === "avif" || brand === "avis")) {
      return { format: "avif", ext: "avif", mime: "image/avif" };
    }

    const heifBrands = new Set([
      "heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1",
    ]);
    if (brands.some((brand) => heifBrands.has(brand))) {
      return { format: "heic", ext: "heic", mime: "image/heic" };
    }
  }

  return null;
}
// Formats dont sharp preserve la sortie via toBuffer() sans encodeur special.
// (heif/svg/inconnu -> reencodes en JPEG ; gif preserve transparence/animation.)
const PASSTHROUGH = new Set(["jpeg", "png", "webp", "gif", "tiff", "avif"]);

// Verrou applicatif : serialise les decodages sharp pour que N uploads concurrents ne
// cumulent pas N pics de memoire native simultanes. sharp.concurrency(1) ne limite que les
// threads PAR operation, pas le nombre d'operations en parallele (sinon le threadpool libuv
// laisse passer jusqu'a 4 decodages simultanes).
let _chain = Promise.resolve();
function withDecodeLock(fn) {
  const run = _chain.then(fn, fn);
  _chain = run.then(() => {}, () => {});
  return run;
}

// Borne un buffer image AVANT stockage : on ne garde JAMAIS d'original pleine resolution.
// Sinon un re-decodage ulterieur (optimiseur next/image, miniature, PDF) ferait exploser la
// memoire native -> plafond conteneur -> reset. C'est le coeur du correctif memoire, partage
// par TOUTES les voies d'upload (openings, logos, techniciens, chat, bons de travail).
//
// - Detecte le format REEL par magic bytes (sharp), jamais le Content-Type client (falsifiable).
// - Rejette les images-bombes (limitInputPixels par frame + budget total de pixels).
// - Redimensionne stills ET animes a MAX_DIMENSION ; applique l'orientation EXIF sur les stills.
// - Si sharp ne sait pas decoder (ex. HEIC sans codec HEVC), stocke l'original tel quel : un
//   format que libvips ne decode pas ne peut pas non plus exploser via l'optimiseur (meme moteur).
//
// Retourne { buffer, ext }.
export async function boundImageBuffer(input, { fallbackExt = "bin" } = {}) {
  return withDecodeLock(async () => {
    let meta;
    try {
      // Lecture d'en-tete uniquement (pas de decodage des pixels), donc limitInputPixels:false est
      // sans risque ici et garantit qu'on lit toujours les dimensions reelles AVANT de juger.
      // Un throw ici = format vraiment indecodable (ex. HEIC sans codec) -> stockage raw inoffensif.
      meta = await sharp(input, { animated: true, limitInputPixels: false }).metadata();
    } catch {
      // Indecodable par sharp -> non re-decodable par l'optimiseur -> aucun risque memoire serveur.
      return { buffer: input, ext: fallbackExt, decoded: false };
    }

    const width = meta.width || 0;
    const height = meta.height || 0;
    const frames = meta.pages || 1;
    const animated = frames > 1;
    const ext = FORMAT_TO_EXT[meta.format] || fallbackExt;

    // Garde-fous explicites contre les images-bombes. On NE depend PAS du limitInputPixels interne
    // de sharp : passer { animated: true } a metadata() en neutralise l'enforcement. On verifie
    // donc nous-memes, par frame (decodage natif) ET en total (GIF anime = petit canvas x N frames).
    if (width * height > SHARP_MAX_INPUT_PIXELS) {
      throw new Error("Image trop volumineuse (trop de pixels)");
    }
    if (width * height * frames > MAX_TOTAL_PIXELS) {
      throw new Error("Image trop volumineuse (trop de pixels)");
    }

    // Deja sous la borne -> on garde l'original tel quel (zero re-encodage).
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
      return { buffer: input, ext, decoded: true };
    }

    let pipeline = sharp(input, { limitInputPixels: SHARP_MAX_INPUT_PIXELS, animated });
    let outExt = ext;
    if (animated) {
      // garde l'animation (gif/webp anime) ; pas de rotate EXIF sur un anime
    } else {
      pipeline = pipeline.rotate(); // applique l'orientation EXIF
      if (!PASSTHROUGH.has(meta.format)) {
        pipeline = pipeline.jpeg({ quality: 82 }); // heif/svg/inconnu -> JPEG sur (re-)encodage
        outExt = "jpg";
      }
    }
    const buffer = await pipeline
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    return { buffer, ext: outExt, decoded: true };
  });
}

export async function savePhotoFromFormData(formData, fieldName = "photo", subdir = "openings") {
  const file = formData.get(fieldName);
  if (!file || typeof file === "string") return { photoUrl: null };

  if (!ALLOWED_MIMES.includes(file.type)) {
    throw new Error("Format image non supporté (JPEG, PNG, WebP ou GIF uniquement)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Fichier trop lourd (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)`);
  }

  const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  const original = Buffer.from(await file.arrayBuffer());
  const fallbackExt = file.type.split("/")[1].replace("jpeg", "jpg");
  // Extension derivee du format REEL (magic bytes), pas du Content-Type client.
  const { buffer, ext } = await boundImageBuffer(original, { fallbackExt });

  const hash = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${hash}.${ext}`;
  const fullPath = path.join(UPLOAD_ROOT, filename);
  await fs.writeFile(fullPath, buffer);

  return { photoUrl: `/uploads/${subdir}/${filename}` };
}

export async function deletePhotoFile(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/")) return;
  const fullPath = path.join(process.cwd(), "public", photoUrl);
  try {
    await fs.unlink(fullPath);
  } catch {}
}
