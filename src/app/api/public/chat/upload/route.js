import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { boundImageBuffer } from "@/lib/upload-photo";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_BYTES = 25 * 1024 * 1024;
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"];
const VIDEO_EXTS = ["mp4", "mov", "webm", "avi", "m4v", "mkv"];

export async function POST(req) {
  try {
    // Route PUBLIQUE (widget de chat visiteur) : pas d'auth possible, donc rate-limit par IP
    // contre le remplissage disque et l'amplification du decodage /_next/image.
    const limited = rateLimit(`chat-upload:${clientIp(req)}`, { max: 12, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop d'envois, réessaie dans un instant." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 25 MB)" }, { status: 400 });
    }

    const rawExt = (file.name.split(".").pop() || "").toLowerCase();
    const isImage = file.type.startsWith("image/") || IMAGE_EXTS.includes(rawExt);
    const isVideo = file.type.startsWith("video/") || VIDEO_EXTS.includes(rawExt);
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Images et videos seulement" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
    await mkdir(uploadDir, { recursive: true });

    const original = Buffer.from(await file.arrayBuffer());
    let outBuffer = original;
    let ext = rawExt || "bin";

    if (isImage) {
      // Borne l'image (2048px max, format reel par magic bytes) AVANT stockage, sinon
      // /_next/image pourrait la re-decoder pleine resolution -> explosion memoire native.
      const bounded = await boundImageBuffer(original, { fallbackExt: rawExt || "bin" });
      outBuffer = bounded.buffer;
      ext = bounded.ext;
    }
    // Les videos sont stockees telles quelles : non decodees par sharp / l'optimiseur d'images.

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), outBuffer);

    return NextResponse.json({ url: `/uploads/chat/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
