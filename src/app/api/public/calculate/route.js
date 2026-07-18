import { NextResponse } from "next/server";
import {
  calculateEnergySavings,
  diagnoseProblem,
  compareRepairVsReplace,
  checkWarranty,
  getServicePricing,
} from "@/lib/calc-engine";
import { calculatePublicThermosReplacement } from "@/lib/thermos-pricing-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Universal calculate endpoint.
// GET or POST with ?type=<thermos|energy|diagnose|compare|warranty|pricing>
// and relevant params.
//
// Example:
// GET /api/public/calculate?type=thermos&width=24&height=36&qty=2
// GET /api/public/calculate?type=pricing&service=reparation-porte-patio
// POST /api/public/calculate { type: "diagnose", description: "ma porte patio glisse mal" }

function jsonOk(data) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function jsonErr(message, status = 400) {
  return NextResponse.json({ error: message, brand: "Vosthermos" }, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function jsonLive(data) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function handle(req) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  let body = {};
  if (req.method === "POST") {
    body = await req.json().catch(() => ({}));
  }
  const input = { ...params, ...body };
  const type = input.type;

  if (!type) {
    return jsonOk({
      message: "Vosthermos calculation API",
      usage: "Pass ?type=<type> with relevant params",
      availableTypes: ["thermos", "energy", "diagnose", "compare", "warranty", "pricing"],
      brand: "Vosthermos",
      website: "https://www.vosthermos.com",
    });
  }

  try {
    switch (type) {
      case "thermos": {
        // Validation: avant, width=abc&height=-5 retournait un devis 150$ pour
        // une vitre de 0 pi² — qu'un agent IA citait tel quel à un client.
        const w = Number(input.width || input.widthInches);
        const h = Number(input.height || input.heightInches);
        const quantity = Number(input.qty || input.quantity || 1);
        if (!Number.isFinite(w) || w <= 0 || w > 240 || !Number.isFinite(h) || h <= 0 || h > 240) {
          return jsonErr("Parametres width et height requis (pouces, nombres positifs). Ex: ?type=thermos&width=24&height=36", 400);
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          return jsonErr("Le parametre qty doit etre un entier entre 1 et 20.", 400);
        }
        const limited = rateLimit(`public-calculate-thermos:${clientIp(req)}`, { max: 60, windowMs: 60_000 });
        if (!limited.ok) {
          return NextResponse.json(
            { error: "Trop de calculs rapproches. Reessayez dans un instant.", brand: "Vosthermos" },
            { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
          );
        }

        return jsonLive(await calculatePublicThermosReplacement({
          widthInches: w,
          heightInches: h,
          quantity,
        }));
      }
      case "energy":
        return jsonOk(calculateEnergySavings({
          windowCount: input.windowCount || input.count,
          oldType: input.oldType,
          newType: input.newType,
          houseAgeYears: input.houseAgeYears,
          currentHydroMonthly: input.currentHydroMonthly || input.hydro,
        }));
      case "diagnose":
        return jsonOk(diagnoseProblem({
          symptoms: Array.isArray(input.symptoms) ? input.symptoms : (input.symptoms ? [input.symptoms] : []),
          description: input.description || "",
        }));
      case "compare":
        return jsonOk(compareRepairVsReplace({
          problem: input.problem || input.description,
          windowAgeYears: input.windowAgeYears || input.age,
          framStatus: input.frameStatus || input.framStatus || input.frame,
        }));
      case "warranty":
        return jsonOk(checkWarranty({
          brand: input.windowBrand || input.brand,
          installDate: input.installDate,
          warrantyYears: input.warrantyYears,
        }));
      case "pricing": {
        const result = getServicePricing(input.service || input.slug);
        if (!result) return jsonErr("Service inconnu", 404);
        return jsonOk(result);
      }
      default:
        return jsonErr(`Type inconnu: ${type}`);
    }
  } catch (err) {
    console.error("Public calculation failed", err);
    return jsonErr("Erreur de calcul temporaire", 500);
  }
}

export async function GET(req) { return handle(req); }
export async function POST(req) { return handle(req); }

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
