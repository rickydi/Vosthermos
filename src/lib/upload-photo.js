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
      return { buffer: input, ext: fallbackExt };
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
      return { buffer: input, ext };
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
    return { buffer, ext: outExt };
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
