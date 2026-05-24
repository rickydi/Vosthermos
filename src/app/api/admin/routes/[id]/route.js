import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { dateOnlyString, parseDateOnly } from "@/lib/date-only";
import { logAdminActivity } from "@/lib/admin-activity";
import { ROUTE_PLAN_INCLUDE, serializeRoutePlan } from "@/lib/route-plan-utils";

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function moneyOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function loadRoute(id) {
  return prisma.routePlan.findUnique({
    where: { id },
    include: ROUTE_PLAN_INCLUDE,
  });
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const routeId = parseInt(id, 10);
  const existing = await prisma.routePlan.findUnique({ where: { id: routeId } });
  if (!existing) return NextResponse.json({ error: "Route non trouvee" }, { status: 404 });

  const body = await req.json();
  const data = {};
  if (body.name !== undefined) data.name = cleanText(body.name) || existing.name;
  if (body.date !== undefined) data.date = parseDateOnly(body.date, existing.date);
  if (body.technicianId !== undefined) data.technicianId = body.technicianId ? parseInt(body.technicianId, 10) : null;
  if (body.area !== undefined) data.area = cleanText(body.area);
  if (body.startCity !== undefined) data.startCity = cleanText(body.startCity);
  if (body.status !== undefined) data.status = cleanText(body.status) || "planned";
  if (body.targetRevenue !== undefined) data.targetRevenue = moneyOrNull(body.targetRevenue);
  if (body.notes !== undefined) data.notes = cleanText(body.notes);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.routePlan.update({
      where: { id: routeId },
      data,
    });

    if (body.syncWorkOrders !== false) {
      const workOrderData = {};
      if (data.date !== undefined) workOrderData.date = updated.date;
      if (body.technicianId !== undefined) workOrderData.technicianId = updated.technicianId;
      if (Object.keys(workOrderData).length) {
        await tx.workOrder.updateMany({
          where: { routeId },
          data: workOrderData,
        });
      }
    }
  });

  const route = await loadRoute(routeId);
  await logAdminActivity(req, session, {
    action: "update",
    entityType: "route_plan",
    entityId: route.id,
    label: `Route modifiee: ${route.name}`,
    metadata: {
      date: dateOnlyString(route.date),
      technicianId: route.technicianId,
      area: route.area,
    },
  });

  return NextResponse.json(serializeRoutePlan(route));
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const routeId = parseInt(id, 10);
  const existing = await prisma.routePlan.findUnique({
    where: { id: routeId },
    include: { _count: { select: { workOrders: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Route non trouvee" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.workOrder.updateMany({
      where: { routeId },
      data: { routeId: null, routePosition: null },
    });
    await tx.routePlan.delete({ where: { id: routeId } });
  });

  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "route_plan",
    entityId: routeId,
    label: `Route supprimee: ${existing.name}`,
    metadata: {
      date: dateOnlyString(existing.date),
      workOrders: existing._count.workOrders,
    },
  });

  return NextResponse.json({ ok: true });
}
