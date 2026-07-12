import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getThermosOrder,
  serializeThermosOrder,
  thermosOrderErrorPayload,
} from "@/lib/thermos-orders";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const order = await getThermosOrder(id);
    return NextResponse.json({ order: serializeThermosOrder(order) });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
