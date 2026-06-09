import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireTech } from "@/lib/technician-auth";
import { boundImageBuffer } from "@/lib/upload-photo";

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"];
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req) {
  try { await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (max 25 MB)" }, { status: 400 });

    const rawExt = (file.name.split(".").pop() || "").toLowerCase();
    const isImage = file.type.startsWith("image/") || ALLOWED_EXTS.includes(rawExt);
    if (!isImage) return NextResponse.json({ error: "Images seulement" }, { status: 400 });

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const relDir = path.posix.join("uploads", "work-orders", yyyy, mm);
    const absDir = path.join(process.cwd(), "public", relDir);
    await mkdir(absDir, { recursive: true });

    const original = Buffer.from(await file.arrayBuffer());
    // Borne l'image (2048px, format reel) avant stockage — meme protection memoire que les openings.
    const { buffer, ext } = await boundImageBuffer(original, { fallbackExt: rawExt || "bin" });

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    await writeFile(path.join(absDir, filename), buffer);

    return NextResponse.json({ url: `/${relDir}/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
