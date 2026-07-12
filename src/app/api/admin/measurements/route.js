import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  createMeasurement,
  measurementErrorResponse,
  MEASUREMENT_SOURCES,
  MEASUREMENT_STATUSES,
  parseMeasurementId,
  serializeMeasurementBundle,
} from "@/lib/thermos-measurements";

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
  const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get("limit"), 10) || 50));
  const where = {};
  const clientId = parseMeasurementId(searchParams.get("clientId"));
  const followUpId = parseMeasurementId(searchParams.get("followUpId"));
  const technicianId = parseMeasurementId(searchParams.get("technicianId"));
  const source = searchParams.get("source");
  const status = searchParams.get("status");
  if (clientId) where.clientId = clientId;
  if (followUpId) where.followUpId = followUpId;
  if (technicianId) where.technicianId = technicianId;
  if (MEASUREMENT_SOURCES.includes(source)) where.source = source;
  if (MEASUREMENT_STATUSES.includes(status)) where.status = status;

  const [records, total] = await Promise.all([
    prisma.thermosMeasurement.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, type: true, company: true, contactName: true, phone: true, secondaryPhone: true, email: true, address: true, city: true, province: true, postalCode: true } },
        followUp: { select: { id: true, title: true, status: true, service: true, contactName: true, phone: true, email: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        workOrder: { select: { id: true, number: true, statut: true, date: true, total: true } },
        thermosOrders: {
          select: { id: true, number: true, status: true, revision: true, sentAt: true, expectedReadyAt: true, readyAt: true, receivedAt: true, createdAt: true, supplier: { select: { id: true, name: true } }, _count: { select: { items: true } } },
          orderBy: [{ revision: "desc" }, { createdAt: "desc" }],
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.thermosMeasurement.count({ where }),
  ]);

  return NextResponse.json({
    measurements: records.map((record) => serializeMeasurementBundle(record)),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }

  try {
    const body = await req.json();
    const measurement = await createMeasurement(body);
    publishAdminEvent({
      type: "thermos_measurement.changed",
      entityType: "thermos_measurement",
      entityId: measurement.id,
      clientId: measurement.clientId,
      actor: `admin:${session.id}`,
    });
    if (measurement.followUpId) {
      publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: measurement.followUpId, clientId: measurement.clientId, actor: `admin:${session.id}` });
    }
    await logAdminActivity(req, session, {
      action: "create",
      entityType: "thermos_measurement",
      entityId: measurement.id,
      label: `Fiche de mesures créée pour ${measurement.client?.name || "client"}`,
      metadata: { source: measurement.source, clientId: measurement.clientId, followUpId: measurement.followUpId },
    });
    return NextResponse.json(serializeMeasurementBundle(measurement), { status: 201 });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}
