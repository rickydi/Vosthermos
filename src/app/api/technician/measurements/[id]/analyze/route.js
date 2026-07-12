import { NextResponse } from "next/server";
import { requireTech } from "@/lib/technician-auth";
import { analyzeMeasurementPhoto, getTechnicianMeasurement, measurementErrorResponse } from "@/lib/thermos-measurements";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  let session;
  try { session = await requireTech(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getTechnicianMeasurement(id, session.id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });

  try {
    const body = await req.json();
    const result = await analyzeMeasurementPhoto({ measurement, photoUrl: body.photoUrl, windowId: body.windowId });
    return NextResponse.json(result);
  } catch (error) {
    const failure = measurementErrorResponse(error);
    console.error("[technician measurement analyze]", error?.detail || error?.message || error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
