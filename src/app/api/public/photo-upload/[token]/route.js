import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/admin-auth";
import { boundImageBuffer, detectImageFormat } from "@/lib/upload-photo";
import { publishAdminEvent } from "@/lib/event-bus";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB par photo (les cellulaires récents dépassent 8 MB)
const MAX_REQUEST_BYTES = MAX_BYTES + 1024 * 1024; // marge pour l'enveloppe multipart

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

  const limited = rateLimit(`client-photo-upload:${client.id}:${clientIp(req)}`, {
    max: 15,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop d'envois rapprochés — réessayez dans un instant." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "La photo dépasse 25 MB — réessayez avec une photo plus légère" },
      { status: 413 },
    );
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const files = formData.getAll("photos").filter((f) => f && typeof f !== "string");
  if (!files.length) return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });
  if (files.length !== 1) {
    return NextResponse.json({ error: "Envoyez une photo à la fois" }, { status: 400 });
  }

  const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "clients");
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  let saved = 0;
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La photo dépasse 25 MB — réessayez avec une photo plus légère" },
        { status: 413 },
      );
    }

    const original = Buffer.from(await file.arrayBuffer());
    const detected = detectImageFormat(original);
    if (!detected) {
      return NextResponse.json(
        { error: "Format non supporté — envoyez une photo JPEG, PNG, WebP ou GIF" },
        { status: 400 },
      );
    }
    if (detected.format === "heic") {
      return NextResponse.json(
        { error: "Ce fichier est un vrai HEIC non lisible. Choisissez « Le plus compatible » (JPEG) dans les réglages de l'appareil photo." },
        { status: 400 },
      );
    }
    if (detected.format === "avif") {
      return NextResponse.json(
        { error: "Format AVIF non supporté — choisissez JPEG, PNG, WebP ou GIF" },
        { status: 400 },
      );
    }

    let bounded;
    try {
      bounded = await boundImageBuffer(original, { fallbackExt: detected.ext });
    } catch {
      return NextResponse.json({ error: "La photo est invalide ou trop volumineuse" }, { status: 400 });
    }
    if (!bounded.decoded) {
      return NextResponse.json({ error: "La photo est invalide ou illisible" }, { status: 400 });
    }

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${bounded.ext}`;
    await fs.writeFile(path.join(UPLOAD_ROOT, filename), bounded.buffer);
    await prisma.clientPhoto.create({
      data: { clientId: client.id, url: `/uploads/clients/${filename}`, source: "client" },
    });
    saved += 1;
  }

  // La pastille 📷 des cartes du suivi se met à jour en direct.
  if (saved > 0) {
    publishAdminEvent({ type: "client_photo.added", entityType: "client_photo", clientId: client.id });
  }

  return NextResponse.json({ saved }, { status: 201 });
}
