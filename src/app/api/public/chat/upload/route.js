import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 25 MB)" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowedImageExts = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"];
    const allowedVideoExts = ["mp4", "mov", "webm", "avi", "m4v", "mkv"];
    const isImage = file.type.startsWith("image/") || allowedImageExts.includes(ext);
    const isVideo = file.type.startsWith("video/") || allowedVideoExts.includes(ext);

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Images et videos seulement" }, { status: 400 });
    }
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/chat/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
