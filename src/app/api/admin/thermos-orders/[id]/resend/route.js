import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import {
  resendThermosOrder,
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
    const result = await resendThermosOrder(id, {
      actorLabel: session.email || session.name || `Admin ${session.id}`,
    });
    await logAdminActivity(request, session, {
      action: "resend",
      entityType: "thermos_order",
      entityId: result.order.id,
      label: result.order.number,
      metadata: { to: result.delivery.to },
    });
    return NextResponse.json({ order: serializeThermosOrder(result.order), delivery: result.delivery });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
