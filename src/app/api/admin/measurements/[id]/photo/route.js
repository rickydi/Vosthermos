import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { publishAdminEvent } from "@/lib/event-bus";
import { getMeasurementById, measurementErrorResponse, saveMeasurementPhoto } from "@/lib/thermos-measurements";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getMeasurementById(id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });

  try {
    const formData = await req.formData();
    const result = await saveMeasurementPhoto(formData, measurement, "admin_measurement");
    publishAdminEvent({ type: "client_photo.added", entityType: "client_photo", entityId: result.photo.id, clientId: measurement.clientId, actor: `admin:${session.id}` });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor: `admin:${session.id}` });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
