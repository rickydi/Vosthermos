import { NextResponse } from "next/server";
import { publishAdminEvent } from "@/lib/event-bus";
import { clientMeasurementCompletenessErrors, normalizeMeasurementData } from "@/lib/thermos-layout";
import {
  measurementErrorResponse,
  resolvePublicMeasurement,
  serializeMeasurementBundle,
  updateMeasurementRecord,
} from "@/lib/thermos-measurements";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function response(body, init = {}) {
  return NextResponse.json(body, { ...init, headers: { ...PRIVATE_HEADERS, ...(init.headers || {}) } });
}

function notify(measurement) {
  publishAdminEvent({
    type: "thermos_measurement.changed",
    entityType: "thermos_measurement",
    entityId: measurement.id,
    clientId: measurement.clientId,
    actor: "client:measurement_link",
  });
  if (measurement.followUpId) {
    publishAdminEvent({ type: "follow_up.changed", entityType: "follow_up", entityId: measurement.followUpId, clientId: measurement.clientId, actor: "client:measurement_link" });
  }
}

// Lecture pure: aucun horodatage, compteur ou statut n'est modifié ici. Cela
// évite notamment qu'un préchargement de navigateur soit pris pour une action.
export async function GET(_req, { params }) {
  const { token } = await params;
  const measurement = await resolvePublicMeasurement(token);
  if (!measurement) return response({ error: "Lien invalide ou expiré" }, { status: 404 });
  return response(serializeMeasurementBundle(measurement, { publicView: true }));
}

export async function PUT(req, { params }) {
  const { token } = await params;
  const existing = await resolvePublicMeasurement(token);
  if (!existing) return response({ error: "Lien invalide ou expiré" }, { status: 404 });
  if (["received", "validated"].includes(existing.status)) {
    return response({ error: "Ces mesures ont déjà été envoyées à Vosthermos" }, { status: 409 });
  }

  try {
    const body = await req.json();
    if (!Object.prototype.hasOwnProperty.call(body, "data")) {
      return response({ error: "Données de mesure requises" }, { status: 400 });
    }
    const measurement = await updateMeasurementRecord(existing, { data: body.data, status: "in_progress" }, { actor: "public" });
    notify(measurement);
    return response(serializeMeasurementBundle(measurement, { publicView: true }));
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return response({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}

export async function POST(req, { params }) {
  const { token } = await params;
  const existing = await resolvePublicMeasurement(token);
  if (!existing) return response({ error: "Lien invalide ou expiré" }, { status: 404 });
  if (["received", "validated"].includes(existing.status)) {
    return response(serializeMeasurementBundle(existing, { publicView: true }));
  }

  try {
    const body = await req.json().catch(() => ({}));
    const data = normalizeMeasurementData(Object.prototype.hasOwnProperty.call(body, "data") ? body.data : existing.data);
    const errors = clientMeasurementCompletenessErrors(data);
    if (errors.length) {
      return response({ error: "Ajoutez la largeur et la hauteur de chaque thermos avant d'envoyer.", details: errors }, { status: 400 });
    }
    const measurement = await updateMeasurementRecord(existing, { data, status: "received" }, { actor: "public" });
    notify(measurement);
    return response(serializeMeasurementBundle(measurement, { publicView: true }));
  } catch (error) {
    const failure = measurementErrorResponse(error);
    return response({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}
