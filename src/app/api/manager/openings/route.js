import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";
import { savePhotoFromFormData } from "@/lib/upload-photo";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

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
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // Permission: le gestionnaire peut gérer les ouvertures du client qu'il gère
  const unit = await prisma.clientUnit.findUnique({
    where: { id: Number(data.unitId) },
    select: { clientId: true },
  });
  if (!unit) return NextResponse.json({ error: "Unité introuvable" }, { status: 404 });

  const mc = canAccessClient(manager, unit.clientId);
  if (!mc || !hasPermission(mc, "manage_openings")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
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
