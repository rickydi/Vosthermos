import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export const dynamic = "force-dynamic";

function clean(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function supplierId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validEmail(value) {
  const email = clean(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function leadTime(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? Math.min(365, Math.max(1, parsed)) : null;
}

function view(supplier) {
  return {
    ...supplier,
    orderCount: supplier._count?.orders ?? 0,
    createdAt: supplier.createdAt?.toISOString?.() || supplier.createdAt,
    updatedAt: supplier.updatedAt?.toISOString?.() || supplier.updatedAt,
  };
}

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = supplierId(rawId);
  if (!id) return NextResponse.json({ error: "Fournisseur invalide" }, { status: 400 });
  const supplier = await prisma.thermosSupplier.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!supplier) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
  return NextResponse.json({ supplier: view(supplier) });
}

export async function PUT(request, { params }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = supplierId(rawId);
  if (!id) return NextResponse.json({ error: "Fournisseur invalide" }, { status: 400 });

  try {
    const current = await prisma.thermosSupplier.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    const data = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      data.name = clean(body.name, 160);
      if (!data.name) return NextResponse.json({ error: "Nom du fournisseur requis" }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(body, "contactName")) data.contactName = clean(body.contactName, 160) || null;
    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      data.email = validEmail(body.email);
      if (!data.email) return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(body, "phone")) data.phone = clean(body.phone, 60) || null;
    if (Object.prototype.hasOwnProperty.call(body, "leadTimeDays")) {
      data.leadTimeDays = leadTime(body.leadTimeDays);
      if (!data.leadTimeDays) return NextResponse.json({ error: "Délai invalide (1 à 365 jours)" }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(body, "autoFollowUpEnabled")) data.autoFollowUpEnabled = body.autoFollowUpEnabled === true;
    if (Object.prototype.hasOwnProperty.call(body, "isActive")) data.isActive = body.isActive === true;
    const wantsDefault = body.isDefault === true;
    const removesDefault = current.isDefault && body.isDefault === false;
    if (wantsDefault && (data.isActive ?? current.isActive) === false) {
      return NextResponse.json({ error: "Un fournisseur inactif ne peut pas être défini par défaut" }, { status: 409 });
    }

    const supplier = await prisma.$transaction(async (tx) => {
      if (wantsDefault) await tx.thermosSupplier.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
      const updated = await tx.thermosSupplier.update({
        where: { id },
        data: { ...data, ...(wantsDefault ? { isDefault: true } : {}) },
      });
      if ((current.isDefault && data.isActive === false) || removesDefault) {
        await tx.thermosSupplier.update({ where: { id }, data: { isDefault: false } });
        const replacement = await tx.thermosSupplier.findFirst({
          where: { id: { not: id }, isActive: true },
          orderBy: { createdAt: "asc" },
        });
        if (replacement) await tx.thermosSupplier.update({ where: { id: replacement.id }, data: { isDefault: true } });
      }
      return tx.thermosSupplier.findUnique({
        where: { id: updated.id },
        include: { _count: { select: { orders: true } } },
      });
    });
    await logAdminActivity(request, session, {
      action: "update",
      entityType: "thermos_supplier",
      entityId: supplier.id,
      label: supplier.name,
      metadata: { fields: Object.keys(data) },
    });
    return NextResponse.json({ supplier: view(supplier) });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Un fournisseur utilise déjà cette adresse email" }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = supplierId(rawId);
  if (!id) return NextResponse.json({ error: "Fournisseur invalide" }, { status: 400 });

  const supplier = await prisma.thermosSupplier.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!supplier) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const deactivated = await tx.thermosSupplier.update({
      where: { id },
      data: { isActive: false, isDefault: false },
      include: { _count: { select: { orders: true } } },
    });
    if (supplier.isDefault) {
      const replacement = await tx.thermosSupplier.findFirst({
        where: { id: { not: id }, isActive: true },
        orderBy: { createdAt: "asc" },
      });
      if (replacement) await tx.thermosSupplier.update({ where: { id: replacement.id }, data: { isDefault: true } });
    }
    return deactivated;
  });
  await logAdminActivity(request, session, {
    action: "deactivate",
    entityType: "thermos_supplier",
    entityId: id,
    label: supplier.name,
  });
  return NextResponse.json({ ok: true, supplier: view(updated) });
}
