import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { analyzeMeasurementPhoto, getMeasurementById, measurementErrorResponse } from "@/lib/thermos-measurements";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getMeasurementById(id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });

  try {
    const body = await req.json();
    const result = await analyzeMeasurementPhoto({ measurement, photoUrl: body.photoUrl, windowId: body.windowId });
    return NextResponse.json(result);
  } catch (error) {
    const failure = measurementErrorResponse(error);
    console.error("[admin measurement analyze]", error?.detail || error?.message || error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
