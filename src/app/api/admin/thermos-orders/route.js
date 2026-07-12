import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  THERMOS_ORDER_STATUS,
  createThermosOrder,
  serializeThermosOrder,
  thermosOrderErrorPayload,
} from "@/lib/thermos-orders";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(Object.values(THERMOS_ORDER_STATUS));

function integer(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const page = integer(params.get("page")) || 1;
  const limit = Math.min(100, integer(params.get("limit")) || 25);
  const status = params.get("status");
  const supplierId = integer(params.get("supplierId"));
  const clientId = integer(params.get("clientId"));
  const followUpId = integer(params.get("followUpId"));
  const measurementId = integer(params.get("measurementId"));
  const search = String(params.get("search") || "").trim().slice(0, 160);
  const statusWhere = status === "active"
    ? { status: { notIn: [THERMOS_ORDER_STATUS.RECEIVED, THERMOS_ORDER_STATUS.CANCELLED] } }
    : status && status !== "all" && VALID_STATUSES.has(status)
      ? { status }
      : {};
  const where = {
    ...statusWhere,
    ...(supplierId ? { supplierId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(followUpId ? { followUpId } : {}),
    ...(measurementId ? { measurementId } : {}),
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: "insensitive" } },
            { clientNameSnapshot: { contains: search, mode: "insensitive" } },
            { supplierNameSnapshot: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [orders, total] = await Promise.all([
      prisma.thermosOrder.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          supplier: { select: { id: true, name: true, isActive: true, autoFollowUpEnabled: true } },
          client: { select: { id: true, name: true } },
          measurement: { select: { id: true, source: true, accuracy: true, status: true, revision: true, validatedAt: true } },
          followUp: { select: { id: true, title: true, status: true } },
          workOrder: { select: { id: true, number: true, statut: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.thermosOrder.count({ where }),
    ]);
    return NextResponse.json({
      orders: orders.map((order) => serializeThermosOrder(order, { compact: true })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const order = await createThermosOrder({
      measurementId: body.measurementId,
      supplierId: body.supplierId,
      actorLabel: session.email || session.name || `Admin ${session.id}`,
    });
    await logAdminActivity(request, session, {
      action: "create",
      entityType: "thermos_order",
      entityId: order.id,
      label: order.number,
      metadata: { measurementId: order.measurementId, supplierId: order.supplierId, itemCount: order.items.length },
    });
    return NextResponse.json({ order: serializeThermosOrder(order) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
