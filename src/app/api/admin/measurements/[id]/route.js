import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  getMeasurementById,
  measurementErrorResponse,
  serializeMeasurementBundle,
  updateMeasurementRecord,
} from "@/lib/thermos-measurements";

function notFound() {
  return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
}

export async function GET(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getMeasurementById(id);
  if (!measurement) return notFound();
  return NextResponse.json(serializeMeasurementBundle(measurement));
}

export async function PUT(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const existing = await getMeasurementById(id);
  if (!existing) return notFound();

  try {
    const body = await req.json();
    const measurement = await updateMeasurementRecord(existing, body, { actor: "admin" });
    const actor = `admin:${session.id}`;
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor });
    if (measurement.followUpId) {
      publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: measurement.followUpId, clientId: measurement.clientId, actor });
    }
    await logAdminActivity(req, session, {
      action: "update",
      entityType: "thermos_measurement",
      entityId: measurement.id,
      label: `Fiche de mesures mise à jour (${measurement.status})`,
      metadata: { status: measurement.status, accuracy: measurement.accuracy, paneCount: measurement.paneCount },
    });
    return NextResponse.json(serializeMeasurementBundle(measurement));
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}

export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const existing = await getMeasurementById(id);
  if (!existing) return notFound();

  try {
    const measurement = await updateMeasurementRecord(existing, { status: "cancelled" }, { actor: "admin" });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor: `admin:${session.id}` });
    await logAdminActivity(req, session, { action: "cancel", entityType: "thermos_measurement", entityId: measurement.id, label: "Fiche de mesures annulée" });
    return NextResponse.json(serializeMeasurementBundle(measurement));
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
