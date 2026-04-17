import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import {
  calcTotals,
  getWorkOrderSettings,
  composeDateTime,
  computeDurationMinutes,
  flattenSectionsBody,
  attachSectionsAndItems,
} from "@/lib/work-order-utils";

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
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    items: wo.items?.map(serItem),
    sections: wo.sections?.map((s) => ({ ...s, items: s.items?.map(serItem) })),
  };
}

export async function GET(_req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const wo = await prisma.workOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: true,
      technician: { select: { id: true, name: true } },
      items: { orderBy: { position: "asc" }, include: { product: { select: { id: true, sku: true, name: true } } } },
      sections: {
        orderBy: { position: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!wo || wo.technicianId !== session.id) {
    return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  }

  return NextResponse.json(serializeWO(wo));
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const existing = await prisma.workOrder.findUnique({ where: { id: parseInt(id) } });
  if (!existing || existing.technicianId !== session.id) {
    return NextResponse.json({ error: "Non trouve" }, { status: 404 });
  }
  if (existing.statut === "sent") {
    return NextResponse.json({ error: "Ce bon a deja ete envoye" }, { status: 400 });
  }

  const body = await req.json();
  const settings = await getWorkOrderSettings();

  const { flatItems, sections, allForCalc } = flattenSectionsBody(body);
  const laborHours = body.laborHours || 0;
  const totals = calcTotals(allForCalc, laborHours, settings.labor_rate_per_hour, settings.tps_rate, settings.tvq_rate);

  const newDate = body.date ? new Date(body.date) : existing.date;
  const arrivalAt =
    body.heureArrivee !== undefined
      ? composeDateTime(newDate, body.heureArrivee)
      : existing.arrivalAt;
  const departureAt =
    body.heureDepart !== undefined
      ? composeDateTime(newDate, body.heureDepart)
      : existing.departureAt;

  const woId = parseInt(id);

  const wo = await prisma.$transaction(async (tx) => {
    // Wipe previous items + sections (cascade deletes section items)
    await tx.workOrderItem.deleteMany({ where: { workOrderId: woId } });
    await tx.workOrderSection.deleteMany({ where: { workOrderId: woId } });

    const updated = await tx.workOrder.update({
      where: { id: woId },
      data: {
        clientId: body.clientId || existing.clientId,
        appointmentId:
          body.appointmentId !== undefined
            ? body.appointmentId
              ? parseInt(body.appointmentId)
              : null
            : existing.appointmentId,
        date: newDate,
        arrivalAt,
        departureAt,
        durationMinutes: computeDurationMinutes(arrivalAt, departureAt),
        interventionAddress: body.interventionAddress ?? existing.interventionAddress,
        interventionCity: body.interventionCity ?? existing.interventionCity,
        interventionPostalCode: body.interventionPostalCode ?? existing.interventionPostalCode,
        description: body.description ?? existing.description,
        photos: body.photos ?? existing.photos,
        signatureUrl: body.signatureUrl ?? existing.signatureUrl,
        notes: body.notes ?? existing.notes,
        statut: body.statut || existing.statut,
        ...totals,
      },
    });

    await attachSectionsAndItems(tx, updated.id, flatItems, sections);

    return tx.workOrder.findUnique({
      where: { id: woId },
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

  return NextResponse.json(serializeWO(wo));
}
