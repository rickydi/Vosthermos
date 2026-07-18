import { NextResponse } from "next/server";
import { calculateThermosQuote } from "@/lib/thermos-pricing";
import { THERMOS_SPACER_COLORS } from "@/lib/thermos-estimate-input";
import { getThermosPricingSettings } from "@/lib/thermos-pricing-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_LINES = 20;
const MAX_TOTAL_QUANTITY = 50;
const GLASS_TYPES = new Set(["simple", "double", "triple"]);
const ACCESS_TYPES = new Set(["easy", "medium", "hard"]);
const SPACER_TYPES = new Set(THERMOS_SPACER_COLORS);

class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
  }
}

function readNumber(value, { field, min, max, fallback, integer = false }) {
  if ((value === undefined || value === null || value === "") && fallback !== undefined) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    throw new InputError(`${field} doit être ${integer ? "un nombre entier" : "un nombre"} entre ${min} et ${max}.`);
  }
  return number;
}

function readBoolean(value, field) {
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw new InputError(`${field} doit être vrai ou faux.`);
  return value;
}

function readEnum(value, { field, allowed, fallback }) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized && fallback !== undefined) return fallback;
  if (!allowed.has(normalized)) throw new InputError(`${field} contient une option invalide.`);
  return normalized;
}

function normalizeLine(line = {}, index) {
  if (!line || typeof line !== "object" || Array.isArray(line)) {
    throw new InputError(`Le thermos ${index + 1} est invalide.`);
  }
  const width = readNumber(line.width, { field: `Largeur du thermos ${index + 1}`, min: 1, max: 240 });
  const height = readNumber(line.height, { field: `Hauteur du thermos ${index + 1}`, min: 1, max: 240 });
  const glassType = readEnum(line.glassType, { field: "Type de vitrage", allowed: GLASS_TYPES, fallback: "double" });
  const spacerColor = readEnum(line.spacerColor, {
    field: "Couleur de l'intercalaire",
    allowed: SPACER_TYPES,
    fallback: "noir",
  });
  const access = readEnum(line.access, { field: "Type d'accès", allowed: ACCESS_TYPES, fallback: "easy" });

  return {
    width,
    height,
    quantity: readNumber(line.quantity, { field: "Quantité", min: 1, max: 20, fallback: 1, integer: true }),
    lowE: readBoolean(line.lowE, "Low-E"),
    argon: readBoolean(line.argon, "Argon"),
    tempered: readBoolean(line.tempered, "Verre trempé"),
    laminated: readBoolean(line.laminated, "Verre laminé"),
    glassType,
    spacerColor,
    thicknessSixteenths: readNumber(line.thicknessSixteenths, {
      field: "Épaisseur",
      min: 4,
      max: 32,
      fallback: 13,
      integer: true,
    }),
    grill: readBoolean(line.grill, "Carreaux décoratifs"),
    access,
  };
}

function publicLine(line, totals) {
  const ratio = totals.piecesSubtotal > 0 ? line.lineSubtotal / totals.piecesSubtotal : 0;
  const clientLineTotal = Math.round((totals.total * ratio) * 100) / 100;
  return {
    sqftPerUnit: line.sqftPerUnit,
    totalSqft: line.totalSqft,
    lineSubtotal: clientLineTotal,
  };
}

export async function POST(request) {
  try {
    const limited = rateLimit(`thermos-estimate:${clientIp(request)}`, { max: 60, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de calculs rapprochés. Réessayez dans un instant." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await request.json().catch(() => ({}));
    if (!Array.isArray(body.lines) || !body.lines.length) {
      throw new InputError("Ajoutez au moins un thermos mesuré.");
    }
    if (body.lines.length > MAX_LINES) {
      throw new InputError(`Maximum de ${MAX_LINES} thermos par estimation.`);
    }

    const lines = body.lines.map(normalizeLine);
    const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    if (totalQuantity > MAX_TOTAL_QUANTITY) {
      throw new InputError(`Maximum de ${MAX_TOTAL_QUANTITY} thermos par estimation.`);
    }
    const quote = calculateThermosQuote(lines, await getThermosPricingSettings());

    return NextResponse.json({
      lines: quote.lines.map((line) => publicLine(line, quote.totals)),
      totals: {
        quantity: quote.totals.quantity,
        sqft: quote.totals.sqft,
        total: quote.totals.total,
        totalMinWithTaxes: quote.totals.totalMinWithTaxes,
        totalMaxWithTaxes: quote.totals.totalMaxWithTaxes,
      },
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Public thermos estimate failed", error);
    return NextResponse.json({
      error: "L'estimation est temporairement indisponible. Réessayez dans un instant.",
    }, { status: 503 });
  }
}
