import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

async function authorize(id, manager) {
  const wo = await prisma.workOrder.findUnique({
    where: { id: Number(id) },
    include: {
      sections: true,
      technician: { select: { id: true, name: true, phone: true, email: true } },
    },
  });
  if (!wo) return { error: "Demande introuvable", status: 404 };
  if (wo.visibleAuClient === false) return { error: "Demande introuvable", status: 404 };
  const mc = canAccessClient(manager, wo.clientId);
  if (!mc) return { error: "Permission refusée", status: 403 };
  // GET/DELETE exigent au minimum view_work_orders OU request_intervention (pour voir sa propre demande)
  if (!hasPermission(mc, "view_work_orders") && !hasPermission(mc, "request_intervention")) {
    return { error: "Permission refusée", status: 403 };
  }
  // Vérif: c'est bien une demande créée par un gestionnaire
  if (!wo.notes?.startsWith("Demande du gestionnaire")) {
    return { error: "Ce bon n'est pas une demande gestionnaire", status: 403 };
  }
  return { wo, mc };
}

export async function GET(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const wo = auth.wo;

  // Marquer comme vu la première fois que le gestionnaire ouvre le bon
  if (!wo.viewedByManagerAt && wo.statut !== "draft") {
    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { viewedByManagerAt: new Date() },
    });
  }

  return NextResponse.json({
    id: wo.id,
    number: wo.number,
    clientId: wo.clientId,
    date: wo.date?.toISOString() || null,
    description: wo.description,
    notes: wo.notes,
    statut: wo.statut,
    createdAt: wo.createdAt.toISOString(),
    sections: wo.sections.map((s) => ({ id: s.id, unitCode: s.unitCode, notes: s.notes })),
    technician: wo.technician ? {
      id: wo.technician.id,
      name: wo.technician.name,
      phone: wo.technician.phone || null,
      email: wo.technician.email || null,
    } : null,
  });
}

export async function DELETE(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // DELETE requiert request_intervention (le gestionnaire annule sa propre demande)
  if (!hasPermission(auth.mc, "request_intervention")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  if (auth.wo.statut !== "draft") {
    return NextResponse.json({ error: "Impossible d'annuler — l'intervention a déjà été planifiée ou traitée par Vosthermos" }, { status: 400 });
  }

  await prisma.workOrder.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
