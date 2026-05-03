import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const GOOGLE_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const GOOGLE_PLACE_URL = "https://places.googleapis.com/v1/places";

async function getApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY;
  if (process.env.GOOGLE_MAPS_API_KEY) return process.env.GOOGLE_MAPS_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'api_key_google_places' LIMIT 1`,
    );
    return rows[0]?.value || "";
  } catch {
    return "";
  }
}

function componentValue(components, type, field = "longText") {
  return components.find((component) => component.types?.includes(type))?.[field] || "";
}

function parsePlaceAddress(place) {
  const components = Array.isArray(place.addressComponents) ? place.addressComponents : [];
  const streetNumber = componentValue(components, "street_number");
  const route = componentValue(components, "route");
  const subpremise = componentValue(components, "subpremise");
  const city = componentValue(components, "locality") ||
    componentValue(components, "postal_town") ||
    componentValue(components, "administrative_area_level_3") ||
    componentValue(components, "sublocality");
  const province = componentValue(components, "administrative_area_level_1", "shortText") || "QC";
  const postalCode = componentValue(components, "postal_code");
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const address = subpremise && street ? `${street} #${subpremise}` : street;

  return {
    address: address || place.formattedAddress || "",
    city,
    province,
    postalCode,
    formattedAddress: place.formattedAddress || "",
  };
}

async function autocomplete({ input, sessionToken }) {
  const apiKey = await getApiKey();
  if (!apiKey) return NextResponse.json({ configured: false, predictions: [] });

  const cleanInput = String(input || "").trim();
  if (cleanInput.length < 3) return NextResponse.json({ configured: true, predictions: [] });

  const res = await fetch(GOOGLE_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
    },
    body: JSON.stringify({
      input: cleanInput,
      sessionToken: sessionToken || undefined,
      languageCode: "fr-CA",
      regionCode: "CA",
      includedRegionCodes: ["ca"],
      locationBias: {
        circle: {
          center: { latitude: 45.372, longitude: -73.55 },
          radius: 50000,
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: "Google Places autocomplete error", detail }, { status: 502 });
  }

  const data = await res.json();
  const predictions = (data.suggestions || [])
    .map((suggestion) => suggestion.placePrediction)
    .filter(Boolean)
    .slice(0, 5)
    .map((prediction) => ({
      placeId: prediction.placeId,
      label: prediction.text?.text || "",
    }))
    .filter((prediction) => prediction.placeId && prediction.label);

  return NextResponse.json({ configured: true, predictions });
}

async function details({ placeId, sessionToken }) {
  const apiKey = await getApiKey();
  if (!apiKey) return NextResponse.json({ configured: false, address: null });

  const cleanPlaceId = String(placeId || "").trim();
  if (!cleanPlaceId) return NextResponse.json({ error: "placeId required" }, { status: 400 });

  const url = new URL(`${GOOGLE_PLACE_URL}/${encodeURIComponent(cleanPlaceId)}`);
  if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,formattedAddress,addressComponents",
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: "Google Places details error", detail }, { status: 502 });
  }

  const place = await res.json();
  return NextResponse.json({ configured: true, address: parsePlaceAddress(place) });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.action === "details") return details(body);
    return autocomplete(body);
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Adresse indisponible" }, { status: 500 });
  }
}
