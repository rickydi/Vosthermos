import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
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
import { parseDateOnly } from "@/lib/date-only";

function serializeWO(wo) {
  const serItem = (i) => ({
    ...i,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  });
  return {
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items?.map(serItem),
    sections: wo.sections?.map((s) => ({ ...s, items: s.items?.map(serItem) })),
  };
}

export async function GET(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const dateFilter = searchParams.get("date");

  const where = { technicianId: session.id };
  if (dateFilter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    where.date = { gte: today, lt: tomorrow };
  }

  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, type: true, address: true, city: true, phone: true } },
      items: { orderBy: { position: "asc" } },
      sections: {
        orderBy: { position: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(workOrders.map(serializeWO));
}

export async function POST(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const number = await generateWorkOrderNumber();
  const settings = await getWorkOrderSettings();

  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = body.laborHours || 0;
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
        clientId: body.clientId,
        technicianId: session.id,
        appointmentId: body.appointmentId ? parseInt(body.appointmentId) : null,
        date: woDate,
        arrivalAt,
        departureAt,
        durationMinutes: computeDurationMinutes(arrivalAt, departureAt),
        interventionAddress: body.interventionAddress || null,
        interventionCity: body.interventionCity || null,
        interventionPostalCode: body.interventionPostalCode || null,
        signatureUrl: body.signatureUrl || null,
        description: body.description || null,
        photos: body.photos || [],
        notes: body.notes || null,
        statut: body.statut || "draft",
        laborRate,
        ...totals,
      },
    });
    await attachSectionsAndItems(tx, created.id, body.clientId, flatItems, sections);
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

  return NextResponse.json(serializeWO(workOrder));
}
