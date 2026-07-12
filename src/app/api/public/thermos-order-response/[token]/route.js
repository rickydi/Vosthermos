import { NextResponse } from "next/server";
import {
  THERMOS_ORDER_STATUS_LABELS,
  publicThermosOrderResponseView,
  resolveThermosOrderResponseToken,
  respondToThermosOrder,
  thermosOrderErrorPayload,
} from "@/lib/thermos-orders";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

// Lecture seulement. Les scanners de liens des fournisseurs peuvent ouvrir ce
// GET sans jamais modifier la commande ni consommer le jeton.
export async function GET(_request, { params }) {
  try {
    const { token } = await params;
    const tokenRow = await resolveThermosOrderResponseToken(token);
    return NextResponse.json(publicThermosOrderResponseView(tokenRow), { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), {
      status: error?.status || 500,
      headers: NO_STORE_HEADERS,
    });
  }
}

export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const body = await request.json().catch(() => ({}));
    const order = await respondToThermosOrder(token, body);
    return NextResponse.json({
      ok: true,
      order: {
        number: order.number,
        status: order.status,
        statusLabel: THERMOS_ORDER_STATUS_LABELS[order.status] || order.status,
        expectedReadyAt: order.expectedReadyAt?.toISOString?.() || order.expectedReadyAt || null,
        readyAt: order.readyAt?.toISOString?.() || order.readyAt || null,
        lastSupplierResponseAt: order.lastSupplierResponseAt?.toISOString?.() || order.lastSupplierResponseAt || null,
      },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), {
      status: error?.status || 500,
      headers: NO_STORE_HEADERS,
    });
  }
}
