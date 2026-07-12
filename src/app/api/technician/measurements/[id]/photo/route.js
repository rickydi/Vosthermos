import { NextResponse } from "next/server";
import { requireTech } from "@/lib/technician-auth";
import { publishAdminEvent } from "@/lib/event-bus";
import { getTechnicianMeasurement, measurementErrorResponse, saveMeasurementPhoto } from "@/lib/thermos-measurements";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getTechnicianMeasurement(id, session.id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });

  try {
    const formData = await req.formData();
    const result = await saveMeasurementPhoto(formData, measurement, "technician_measurement");
    publishAdminEvent({ type: "client_photo.added", entityType: "client_photo", entityId: result.photo.id, clientId: measurement.clientId, actor: `tech:${session.id}` });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor: `tech:${session.id}` });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
