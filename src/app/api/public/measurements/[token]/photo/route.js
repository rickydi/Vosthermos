import { NextResponse } from "next/server";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  measurementErrorResponse,
  resolvePublicMeasurement,
  saveMeasurementPhoto,
  updateMeasurementRecord,
} from "@/lib/thermos-measurements";

export const runtime = "nodejs";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function POST(req, { params }) {
  const { token } = await params;
  const existing = await resolvePublicMeasurement(token);
  if (!existing) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404, headers: PRIVATE_HEADERS });
  if (["received", "validated"].includes(existing.status)) {
    return NextResponse.json({ error: "Ces mesures ont déjà été envoyées" }, { status: 409, headers: PRIVATE_HEADERS });
  }

  try {
    const formData = await req.formData();
    const result = await saveMeasurementPhoto(formData, existing, "client_measurement");
    const measurement = await updateMeasurementRecord(existing, { status: "in_progress" }, { actor: "public" });
    publishAdminEvent({ type: "client_photo.added", entityType: "client_photo", entityId: result.photo.id, clientId: measurement.clientId, actor: "client:measurement_link" });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor: "client:measurement_link" });
    return NextResponse.json({ photoUrl: result.photoUrl }, { status: 201, headers: PRIVATE_HEADERS });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status, headers: PRIVATE_HEADERS });
  }
}
