import { NextResponse } from "next/server";
import { requireTech } from "@/lib/technician-auth";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  getTechnicianMeasurement,
  measurementErrorResponse,
  serializeMeasurementBundle,
  updateMeasurementRecord,
} from "@/lib/thermos-measurements";

export async function GET(_req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getTechnicianMeasurement(id, session.id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
  return NextResponse.json(serializeMeasurementBundle(measurement));
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const existing = await getTechnicianMeasurement(id, session.id);
  if (!existing) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });

  try {
    const body = await req.json();
    const measurement = await updateMeasurementRecord(existing, body, { actor: "technician" });
    const actor = `tech:${session.id}`;
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor });
    if (measurement.followUpId) {
      publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: measurement.followUpId, clientId: measurement.clientId, actor });
    }
    return NextResponse.json(serializeMeasurementBundle(measurement));
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}
