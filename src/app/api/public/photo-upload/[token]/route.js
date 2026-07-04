import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/admin-auth";
import { boundImageBuffer } from "@/lib/upload-photo";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB par photo
const MAX_FILES = 10; // par envoi

// Valide le token du lien texté au client et retourne le client ciblé.
// Le token est un JWT signé côté serveur (purpose dédié, expire en 7 jours) :
// il ne donne accès qu'à CE dépôt de photos, jamais à l'admin.
async function resolveClient(token) {
  const decoded = verifyToken(String(token || ""));
  if (!decoded || decoded.purpose !== "client_photo_upload" || !decoded.clientId) return null;
  return prisma.client.findUnique({
    where: { id: Number(decoded.clientId) },
    select: { id: true, name: true, contactName: true },
  });
}

export async function GET(req, { params }) {
  const { token } = await params;
  const client = await resolveClient(token);
  if (!client) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }
  // Même logique que le texto/courriel : nom de contact en priorité.
  return NextResponse.json({ clientName: (client.contactName || client.name || "").trim() });
}

export async function POST(req, { params }) {
  const { token } = await params;
  const client = await resolveClient(token);
  if (!client) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const files = formData.getAll("photos").filter((f) => f && typeof f !== "string");
  if (!files.length) return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} photos par envoi` }, { status: 400 });
  }

  const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "clients");
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  let saved = 0;
  for (const file of files) {
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté — envoyez des photos JPEG, PNG, WebP ou GIF" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Une photo dépasse 8 MB — réessayez avec une photo plus légère" }, { status: 400 });
    }
    const original = Buffer.from(await file.arrayBuffer());
    const fallbackExt = file.type.split("/")[1].replace("jpeg", "jpg");
    let bounded;
    try {
      bounded = await boundImageBuffer(original, { fallbackExt });
    } catch {
      return NextResponse.json({ error: "Une des photos est invalide ou trop volumineuse" }, { status: 400 });
    }
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${bounded.ext}`;
    await fs.writeFile(path.join(UPLOAD_ROOT, filename), bounded.buffer);
    await prisma.clientPhoto.create({
      data: { clientId: client.id, url: `/uploads/clients/${filename}`, source: "client" },
    });
    saved += 1;
  }

  return NextResponse.json({ saved }, { status: 201 });
}
