import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { boundImageBuffer } from "@/lib/upload-photo";
import { logAdminActivity } from "@/lib/admin-activity";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB par photo
const MAX_FILES = 10; // par envoi

// Upload direct de photos par l'équipe dans la fiche client (onglet Photos).
// Chaque image est bornée via boundImageBuffer (jamais d'original pleine
// résolution sur disque — voir upload-photo.js) puis enregistrée en ClientPhoto
// source "admin".
export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const clientId = Number(id);
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, name: true } });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const files = formData.getAll("photos").filter((f) => f && typeof f !== "string");
  if (!files.length) return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} photos par envoi` }, { status: 400 });
  }

  const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "clients");
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  const created = [];
  for (const file of files) {
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: `Format non supporté (${file.name || "photo"}) — JPEG, PNG, WebP ou GIF` }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Photo trop lourde (${file.name || "photo"}) — max 8 MB` }, { status: 400 });
    }
    const original = Buffer.from(await file.arrayBuffer());
    const fallbackExt = file.type.split("/")[1].replace("jpeg", "jpg");
    let bounded;
    try {
      bounded = await boundImageBuffer(original, { fallbackExt });
    } catch (err) {
      return NextResponse.json({ error: err.message || "Image invalide" }, { status: 400 });
    }
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${bounded.ext}`;
    await fs.writeFile(path.join(UPLOAD_ROOT, filename), bounded.buffer);
    const photo = await prisma.clientPhoto.create({
      data: { clientId, url: `/uploads/clients/${filename}`, source: "admin" },
    });
    created.push({ id: photo.id, url: photo.url });
  }

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "client_photo",
    entityId: clientId,
    label: `${created.length} photo${created.length > 1 ? "s" : ""} ajoutée${created.length > 1 ? "s" : ""} au client ${client.name}`,
    metadata: { clientId, count: created.length },
  });

  return NextResponse.json({ photos: created }, { status: 201 });
}
