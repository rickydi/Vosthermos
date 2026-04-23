import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { savePhotoFromFormData } from "@/lib/upload-photo";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const contentType = req.headers.get("content-type") || "";
  let data;
  let photoUrl = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    data = {
      unitId: formData.get("unitId"),
      type: formData.get("type"),
      location: formData.get("location"),
      description: formData.get("description") || null,
      year: formData.get("year") || null,
      brand: formData.get("brand") || null,
      status: formData.get("status") || "ok",
    };
    const up = await savePhotoFromFormData(formData).catch((e) => ({ error: e.message }));
    if (up.error) return NextResponse.json({ error: up.error }, { status: 400 });
    photoUrl = up.photoUrl;
  } else {
    data = await req.json();
  }

  if (!data.unitId || !data.type || !data.location) {
    return NextResponse.json({ error: "unitId, type et location requis" }, { status: 400 });
  }

  const opening = await prisma.unitOpening.create({
    data: {
      unitId: Number(data.unitId),
      type: String(data.type),
      location: String(data.location).trim(),
      description: data.description ? String(data.description).trim() : null,
      year: data.year ? Number(data.year) : null,
      brand: data.brand ? String(data.brand).trim() : null,
      status: data.status || "ok",
      photoUrl,
    },
  });
  return NextResponse.json({ ok: true, opening });
}
