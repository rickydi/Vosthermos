import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePhotoFile } from "@/lib/upload-photo";
import { logAdminActivity } from "@/lib/admin-activity";

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const photoId = Number(id);
  const photo = await prisma.clientPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });

  await prisma.clientPhoto.delete({ where: { id: photoId } });
  await deletePhotoFile(photo.url);
  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "client_photo",
    entityId: photoId,
    label: `Photo supprimee: ${photo.title || photoId}`,
    metadata: { clientId: photo.clientId, followUpId: photo.followUpId, url: photo.url },
  });

  return NextResponse.json({ ok: true });
}
