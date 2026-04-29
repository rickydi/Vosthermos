import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePhotoFile } from "@/lib/upload-photo";

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const photoId = Number(id);
  const photo = await prisma.clientPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });

  await prisma.clientPhoto.delete({ where: { id: photoId } });
  await deletePhotoFile(photo.url);

  return NextResponse.json({ ok: true });
}
