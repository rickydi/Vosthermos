import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { savePhotoFromFormData, deletePhotoFile } from "@/lib/upload-photo";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";
  const update = {};
  let newPhotoUrl = null;
  let body;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    body = {
      type: formData.get("type"),
      location: formData.get("location"),
      description: formData.get("description"),
      year: formData.get("year"),
      brand: formData.get("brand"),
      status: formData.get("status"),
      removePhoto: formData.get("removePhoto") === "true",
    };
    const file = formData.get("photo");
    if (file && typeof file !== "string") {
      const up = await savePhotoFromFormData(formData).catch((e) => ({ error: e.message }));
      if (up.error) return NextResponse.json({ error: up.error }, { status: 400 });
      newPhotoUrl = up.photoUrl;
    }
  } else {
    body = await req.json();
  }

  if (body.type !== undefined) update.type = String(body.type);
  if (body.location !== undefined) update.location = String(body.location).trim();
  if (body.description !== undefined) update.description = body.description ? String(body.description).trim() : null;
  if (body.year !== undefined) update.year = body.year ? Number(body.year) : null;
  if (body.brand !== undefined) update.brand = body.brand ? String(body.brand).trim() : null;
  if (body.status !== undefined) update.status = String(body.status);

  const current = await prisma.unitOpening.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  if (newPhotoUrl) {
    if (current.photoUrl) await deletePhotoFile(current.photoUrl);
    update.photoUrl = newPhotoUrl;
  } else if (body.removePhoto && current.photoUrl) {
    await deletePhotoFile(current.photoUrl);
    update.photoUrl = null;
  }

  const opening = await prisma.unitOpening.update({
    where: { id: Number(id) },
    data: update,
  });
  return NextResponse.json({ ok: true, opening });
}

export async function DELETE(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const current = await prisma.unitOpening.findUnique({ where: { id: Number(id) } });
  if (current?.photoUrl) await deletePhotoFile(current.photoUrl);

  await prisma.unitOpening.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
