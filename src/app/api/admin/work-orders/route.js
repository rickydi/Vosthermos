import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  generateWorkOrderNumber,
  calcTotals,
  getWorkOrderSettings,
  DEFAULT_LABOR_RATE,
  composeDateTime,
  computeDurationMinutes,
  flattenSectionsBody,
  attachSectionsAndItems,
} from "@/lib/work-order-utils";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import { parseDateOnly } from "@/lib/date-only";

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut");
  const techId = searchParams.get("technicianId");
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = {};
  if (statut) where.statut = statut;
  if (techId) where.technicianId = parseInt(techId);
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q } } },
    ];
  }

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true, address: true, city: true } },
        technician: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({
    workOrders: workOrders.map((wo) => ({
      ...wo,
      total: Number(wo.total),
      subtotal: Number(wo.subtotal),
      totalPieces: Number(wo.totalPieces),
      totalLabor: Number(wo.totalLabor),
      laborRate: Number(wo.laborRate),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.clientId) return NextResponse.json({ error: "Client requis" }, { status: 400 });

  const number = await generateWorkOrderNumber();
  const settings = await getWorkOrderSettings();

  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = Number(body.laborHours) || 0;
  const laborRate = Number(body.laborRate ?? settings.labor_rate_per_hour) || DEFAULT_LABOR_RATE;
  const totals = calcTotals(
    allForCalc,
    laborHours,
    laborRate,
    settings.tps_rate,
    settings.tvq_rate
  );

  const woDate = body.date ? parseDateOnly(body.date) : new Date();
  const arrivalAt = composeDateTime(woDate, body.heureArrivee);
  const departureAt = composeDateTime(woDate, body.heureDepart);

  const workOrder = await prisma.$transaction(async (tx) => {
    const created = await tx.workOrder.create({
      data: {
        number,
        clientId: parseInt(body.clientId),
        technicianId: body.technicianId ? parseInt(body.technicianId) : null,
        appointmentId: body.appointmentId ? parseInt(body.appointmentId) : null,
        date: woDate,
        arrivalAt,
        departureAt,
        durationMinutes: computeDurationMinutes(arrivalAt, departureAt),
        interventionAddress: body.interventionAddress || null,
        interventionCity: body.interventionCity || null,
        interventionPostalCode: body.interventionPostalCode || null,
        description: body.description || null,
        photos: body.photos || [],
        notes: body.notes || null,
        statut: body.statut || "draft",
        visibleAuClient: body.visibleAuClient ?? true,
        laborRate,
        ...totals,
      },
    });
    await attachSectionsAndItems(tx, created.id, parseInt(body.clientId), flatItems, sections);
    return tx.workOrder.findUnique({
      where: { id: created.id },
      include: {
        client: true,
        items: { orderBy: { position: "asc" } },
        sections: {
          orderBy: { position: "asc" },
          include: { items: { orderBy: { position: "asc" } } },
        },
      },
    });
  });

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder, client: workOrder.client });
  } catch (err) {
    console.error("[work-orders] follow-up sync error:", err?.message || err);
  }

  return NextResponse.json({
    ...workOrder,
    total: Number(workOrder.total),
    subtotal: Number(workOrder.subtotal),
    totalPieces: Number(workOrder.totalPieces),
    totalLabor: Number(workOrder.totalLabor),
    laborRate: Number(workOrder.laborRate),
  });
}
