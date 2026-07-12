import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  markThermosOrderReceived,
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
    const order = await markThermosOrderReceived(id, {
      actorLabel: session.email || session.name || `Admin ${session.id}`,
    });
    await logAdminActivity(request, session, {
      action: "mark_received",
      entityType: "thermos_order",
      entityId: order.id,
      label: order.number,
    });
    return NextResponse.json({ order: serializeThermosOrder(order) });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
