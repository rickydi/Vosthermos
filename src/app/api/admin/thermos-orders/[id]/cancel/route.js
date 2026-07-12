import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  cancelThermosOrder,
  serializeThermosOrder,
  thermosOrderErrorPayload,
} from "@/lib/thermos-orders";

export async function POST(request, { params }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const order = await cancelThermosOrder(id, {
      actorLabel: session.email || session.name || `Admin ${session.id}`,
      reason: body.reason,
    });
    await logAdminActivity(request, session, {
      action: "cancel",
      entityType: "thermos_order",
      entityId: order.id,
      label: order.number,
      metadata: body.reason ? { reason: String(body.reason).slice(0, 1000) } : null,
    });
    return NextResponse.json({ order: serializeThermosOrder(order) });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
