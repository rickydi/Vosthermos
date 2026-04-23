import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "openings");
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function savePhotoFromFormData(formData, fieldName = "photo") {
  const file = formData.get(fieldName);
  if (!file || typeof file === "string") return { photoUrl: null };

  if (!ALLOWED_MIMES.includes(file.type)) {
    throw new Error("Format image non supporté (JPEG, PNG, WebP ou GIF uniquement)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Fichier trop lourd (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)`);
  }

  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const hash = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${hash}.${ext}`;
  const fullPath = path.join(UPLOAD_ROOT, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return { photoUrl: `/uploads/openings/${filename}` };
}

export async function deletePhotoFile(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/openings/")) return;
  const fullPath = path.join(process.cwd(), "public", photoUrl);
  try {
    await fs.unlink(fullPath);
  } catch {}
}
