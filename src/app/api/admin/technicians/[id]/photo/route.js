import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { savePhotoFromFormData, deletePhotoFile } from "@/lib/upload-photo";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const techId = parseInt(id);
  const existing = await prisma.technician.findUnique({ where: { id: techId } });
  if (!existing) return NextResponse.json({ error: "Technicien introuvable" }, { status: 404 });

  try {
    const formData = await req.formData();
    const { photoUrl } = await savePhotoFromFormData(formData, "photo", "technicians");
    if (!photoUrl) return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 });

    if (existing.photoUrl) {
      await deletePhotoFile(existing.photoUrl);
    }

    const tech = await prisma.technician.update({
      where: { id: techId },
      data: { photoUrl },
    });
    return NextResponse.json(tech);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur upload" }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const techId = parseInt(id);
  const existing = await prisma.technician.findUnique({ where: { id: techId } });
  if (!existing) return NextResponse.json({ error: "Technicien introuvable" }, { status: 404 });

  if (existing.photoUrl) {
    await deletePhotoFile(existing.photoUrl);
  }
  const tech = await prisma.technician.update({
    where: { id: techId },
    data: { photoUrl: null },
  });
  return NextResponse.json(tech);
}
