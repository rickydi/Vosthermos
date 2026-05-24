import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { dateOnlyString, parseDateOnly } from "@/lib/date-only";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  ROUTABLE_WORK_ORDER_STATUSES,
  ROUTE_PLAN_INCLUDE,
  ROUTE_WORK_ORDER_INCLUDE,
  serializeRoutePlan,
  serializeRouteWorkOrder,
} from "@/lib/route-plan-utils";

function dateInputFromToday(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return dateOnlyString(date);
}

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function moneyOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function defaultRouteName(date, area) {
  return ["Route", dateOnlyString(date), area].filter(Boolean).join(" - ");
}

async function findRoute(id) {
  return prisma.routePlan.findUnique({
    where: { id },
    include: ROUTE_PLAN_INCLUDE,
  });
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const from = parseDateOnly(searchParams.get("from") || dateInputFromToday(0));
  const to = parseDateOnly(searchParams.get("to") || dateInputFromToday(14));

  const [routes, unassignedWorkOrders] = await Promise.all([
    prisma.routePlan.findMany({
      where: { date: { gte: from, lte: to } },
      include: ROUTE_PLAN_INCLUDE,
      orderBy: [{ date: "asc" }, { technicianId: "asc" }, { id: "asc" }],
    }),
    prisma.workOrder.findMany({
      where: {
        routeId: null,
        statut: { in: ROUTABLE_WORK_ORDER_STATUSES },
      },
      include: ROUTE_WORK_ORDER_INCLUDE,
      orderBy: [{ date: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
  ]);

  return NextResponse.json({
    routes: routes.map(serializeRoutePlan),
    unassignedWorkOrders: unassignedWorkOrders.map(serializeRouteWorkOrder),
  });
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const routeDate = body.date ? parseDateOnly(body.date) : parseDateOnly(dateInputFromToday(0));
  const area = cleanText(body.area);
  const data = {
    name: cleanText(body.name) || defaultRouteName(routeDate, area),
    date: routeDate,
    technicianId: body.technicianId ? parseInt(body.technicianId, 10) : null,
    area,
    startCity: cleanText(body.startCity),
    status: cleanText(body.status) || "planned",
    targetRevenue: moneyOrNull(body.targetRevenue),
    notes: cleanText(body.notes),
  };

  const created = await prisma.routePlan.create({ data });
  const route = await findRoute(created.id);

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "route_plan",
    entityId: route.id,
    label: `Route creee: ${route.name}`,
    metadata: {
      date: dateOnlyString(route.date),
      technicianId: route.technicianId,
      area: route.area,
    },
  });

  return NextResponse.json(serializeRoutePlan(route));
}
