import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCompany } from "@/lib/company";
import { generateThermosOrderPdf } from "@/lib/thermos-order-pdf";
import { getThermosOrder, thermosOrderErrorPayload } from "@/lib/thermos-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const [order, company] = await Promise.all([getThermosOrder(id), getCompany()]);
    const pdf = await generateThermosOrderPdf(order, company);
    const filename = `${order.number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`;
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(thermosOrderErrorPayload(error), { status: error?.status || 500 });
  }
}
