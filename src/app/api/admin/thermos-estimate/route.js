import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { calculateThermosQuote } from "@/lib/thermos-pricing";
import { getThermosPricingSettings } from "@/lib/thermos-pricing-server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    if (!Array.isArray(body.lines) || body.lines.length > 100) {
      return NextResponse.json({ error: "Liste de thermos invalide." }, { status: 400 });
    }

    const quote = calculateThermosQuote(body.lines, await getThermosPricingSettings());
    return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unauthorized = /unauthorized|non autoris/i.test(error.message || "");
    return NextResponse.json(
      { error: unauthorized ? "Unauthorized" : "Impossible de calculer l'estimation." },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
