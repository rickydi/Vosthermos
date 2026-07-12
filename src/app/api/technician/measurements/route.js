import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  createMeasurement,
  measurementErrorResponse,
  MEASUREMENT_STATUSES,
  serializeMeasurementBundle,
} from "@/lib/thermos-measurements";

export async function GET(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const status = new URL(req.url).searchParams.get("status");
  const where = { technicianId: session.id };
  if (MEASUREMENT_STATUSES.includes(status)) where.status = status;

  const records = await prisma.thermosMeasurement.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, type: true, company: true, contactName: true, address: true, city: true, province: true, postalCode: true, phone: true, secondaryPhone: true, email: true } },
      followUp: { select: { id: true, title: true, status: true, service: true, contactName: true, phone: true, email: true } },
      technician: { select: { id: true, name: true, email: true, phone: true } },
      workOrder: { select: { id: true, number: true, statut: true, date: true, total: true } },
      thermosOrders: {
        select: { id: true, number: true, status: true, revision: true, sentAt: true, expectedReadyAt: true, readyAt: true, receivedAt: true, createdAt: true, supplier: { select: { id: true, name: true } }, _count: { select: { items: true } } },
        orderBy: [{ revision: "desc" }, { createdAt: "desc" }],
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });
  return NextResponse.json({ measurements: records.map((record) => serializeMeasurementBundle(record)) });
}

export async function POST(req) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  try {
    const body = await req.json();
    const measurement = await createMeasurement({ ...body, source: "technician", accuracy: "final" }, { technicianIdOverride: session.id });
    const actor = `tech:${session.id}`;
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor });
    if (measurement.followUpId) {
      publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: measurement.followUpId, clientId: measurement.clientId, actor });
    }
    return NextResponse.json(serializeMeasurementBundle(measurement), { status: 201 });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}
