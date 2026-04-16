import { NextResponse } from "next/server";
import {
  calculateThermosReplacement,
  calculateEnergySavings,
  diagnoseProblem,
  compareRepairVsReplace,
  checkWarranty,
  getServicePricing,
} from "@/lib/calc-engine";

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
  return NextResponse.json({ error: message, brand: "Vosthermos" }, { status });
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
      case "thermos":
        return jsonOk(calculateThermosReplacement({
          widthInches: input.width || input.widthInches,
          heightInches: input.height || input.heightInches,
          quantity: input.qty || input.quantity || 1,
        }));
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
          framStatus: input.framStatus || input.frame,
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
    return jsonErr(err.message || "Erreur de calcul", 500);
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
