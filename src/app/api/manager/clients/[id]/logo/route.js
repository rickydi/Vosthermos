import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, canAccessClient } from "@/lib/manager-auth";
import { savePhotoFromFormData, deletePhotoFile } from "@/lib/upload-photo";

export const dynamic = "force-dynamic";

function clientLogoKey(clientId) {
  return `manager_client_logo_${Number(clientId)}`;
}

async function authorizeClient(clientId) {
  const manager = await getManagerFromCookie();
  if (!manager) return { error: NextResponse.json({ error: "Non authentifie" }, { status: 401 }) };

  const mc = canAccessClient(manager, clientId);
  if (!mc) return { error: NextResponse.json({ error: "Acces refuse" }, { status: 403 }) };

  return { manager, mc };
}

export async function POST(req, { params }) {
  const { id } = await params;
  const clientId = Number(id);
  if (!clientId) return NextResponse.json({ error: "Client invalide" }, { status: 400 });

  const auth = await authorizeClient(clientId);
  if (auth.error) return auth.error;

  const formData = await req.formData();
  const up = await savePhotoFromFormData(formData, "logo", "client-logos").catch((err) => ({ error: err.message }));
  if (up.error) return NextResponse.json({ error: up.error }, { status: 400 });
  if (!up.photoUrl) return NextResponse.json({ error: "Aucun logo fourni" }, { status: 400 });

  const key = clientLogoKey(clientId);
  const existing = await prisma.siteSetting.findUnique({ where: { key } });
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: up.photoUrl },
    create: { key, value: up.photoUrl },
  });

  if (existing?.value && existing.value !== up.photoUrl) {
    await deletePhotoFile(existing.value);
  }

  return NextResponse.json({ ok: true, logoUrl: up.photoUrl });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const clientId = Number(id);
  if (!clientId) return NextResponse.json({ error: "Client invalide" }, { status: 400 });

  const auth = await authorizeClient(clientId);
  if (auth.error) return auth.error;

  const key = clientLogoKey(clientId);
  const existing = await prisma.siteSetting.findUnique({ where: { key } });
  if (existing?.value) {
    await deletePhotoFile(existing.value);
    await prisma.siteSetting.delete({ where: { key } }).catch(() => {});
  }

  return NextResponse.json({ ok: true, logoUrl: null });
}
