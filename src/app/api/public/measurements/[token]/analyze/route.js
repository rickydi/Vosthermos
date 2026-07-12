import { NextResponse } from "next/server";
import { analyzeMeasurementPhoto, measurementErrorResponse, resolvePublicMeasurement } from "@/lib/thermos-measurements";

export const runtime = "nodejs";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function POST(req, { params }) {
  const { token } = await params;
  const measurement = await resolvePublicMeasurement(token);
  if (!measurement) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404, headers: PRIVATE_HEADERS });
  if (["received", "validated"].includes(measurement.status)) {
    return NextResponse.json({ error: "Ces mesures ont déjà été envoyées" }, { status: 409, headers: PRIVATE_HEADERS });
  }

  try {
    const body = await req.json();
    const result = await analyzeMeasurementPhoto({ measurement, photoUrl: body.photoUrl, windowId: body.windowId, publicRequest: true });
    const { analysisCost: _analysisCost, ...publicResult } = result;
    return NextResponse.json(publicResult, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    console.error("[public measurement analyze]", error?.detail || error?.message || error);
    return NextResponse.json({ error: failure.message }, { status: failure.status, headers: PRIVATE_HEADERS });
  }
}
