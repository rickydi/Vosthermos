import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { savePhotoFromFormData, deletePhotoFile } from "@/lib/upload-photo";

function clean(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function fileTitle(file) {
  if (!file || typeof file === "string" || !file.name) return null;
  return file.name.replace(/\.[^.]+$/, "").slice(0, 80) || null;
}

function serializePhoto(photo) {
  return {
    id: `client-photo-${photo.id}`,
    photoId: photo.id,
    type: "client_photo",
    source: photo.source === "admin" ? "Ajout admin" : photo.source,
    title: photo.title || "Photo client",
    subtitle: photo.notes || photo.client?.name || "",
    url: photo.url,
    date: photo.createdAt?.toISOString?.() || null,
    canDelete: true,
  };
}

export async function POST(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const followUpId = Number(id);
  const followUp = await prisma.clientFollowUp.findUnique({
    where: { id: followUpId },
    include: { client: { select: { id: true, name: true } } },
  });
  if (!followUp) return NextResponse.json({ error: "Suivi introuvable" }, { status: 404 });

  let photoUrl = null;
  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    const up = await savePhotoFromFormData(formData, "photo", "client-photos");
    photoUrl = up.photoUrl;
    if (!photoUrl) return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 });

    const photo = await prisma.clientPhoto.create({
      data: {
        clientId: followUp.clientId || null,
        followUpId: followUp.id,
        title: clean(formData.get("title")) || fileTitle(file),
        notes: clean(formData.get("notes")),
        url: photoUrl,
        source: "admin",
      },
      include: { client: { select: { name: true } } },
    });

    return NextResponse.json(serializePhoto(photo));
  } catch (err) {
    if (photoUrl) await deletePhotoFile(photoUrl);
    return NextResponse.json({ error: err.message || "Erreur upload" }, { status: 400 });
  }
}
