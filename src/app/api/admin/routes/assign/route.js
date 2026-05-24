import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { ROUTE_WORK_ORDER_INCLUDE, serializeRouteWorkOrder } from "@/lib/route-plan-utils";

function parseNullableId(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const workOrderId = parseNullableId(body.workOrderId);
  const routeId = parseNullableId(body.routeId);
  if (!workOrderId) return NextResponse.json({ error: "Bon de travail requis" }, { status: 400 });

  const existing = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { client: true },
  });
  if (!existing) return NextResponse.json({ error: "Bon de travail non trouve" }, { status: 404 });

  let changedToScheduled = false;
  let updated;

  if (routeId) {
    const route = await prisma.routePlan.findUnique({
      where: { id: routeId },
      include: { _count: { select: { workOrders: true } } },
    });
    if (!route) return NextResponse.json({ error: "Route non trouvee" }, { status: 404 });

    const requestedPosition = parseNullableId(body.position);
    const nextStatut = existing.statut === "quote_accepted" ? "scheduled" : existing.statut;
    changedToScheduled = existing.statut !== nextStatut;

    updated = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        routeId,
        routePosition: requestedPosition || route._count.workOrders + 1,
        date: route.date,
        technicianId: route.technicianId || existing.technicianId,
        statut: nextStatut,
      },
      include: ROUTE_WORK_ORDER_INCLUDE,
    });

    await logAdminActivity(req, session, {
      action: "assign",
      entityType: "route_plan",
      entityId: routeId,
      label: `Bon ajoute a la route: ${updated.number}`,
      metadata: {
        workOrderId,
        workOrderNumber: updated.number,
        routeName: route.name,
      },
    });
  } else {
    updated = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { routeId: null, routePosition: null },
      include: ROUTE_WORK_ORDER_INCLUDE,
    });

    await logAdminActivity(req, session, {
      action: "unassign",
      entityType: "work_order",
      entityId: workOrderId,
      label: `Bon retire de la route: ${updated.number}`,
      metadata: {
        workOrderNumber: updated.number,
        previousRouteId: existing.routeId,
      },
    });
  }

  if (changedToScheduled) {
    try {
      await createOrTouchFollowUpFromWorkOrder({
        workOrder: { ...updated, client: existing.client },
        client: existing.client,
        followUpStatus: "scheduled",
      });
    } catch (err) {
      console.error("[routes] follow-up sync error:", err?.message || err);
    }
  }

  return NextResponse.json(serializeRouteWorkOrder(updated));
}
