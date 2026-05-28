import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getWorkOrderSettings } from "@/lib/work-order-utils";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { getCompany } from "@/lib/company";
import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
import { documentFilename } from "@/lib/vosthermos-document";

export const dynamic = "force-dynamic";

function serializeWorkOrder(wo) {
  const serItem = (item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  });

  return {
    ...wo,
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    payments: (wo.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: wo.items.map(serItem),
    sections: (wo.sections || []).map((section) => ({
      ...section,
      items: (section.items || []).map(serItem),
    })),
  };
}

export async function GET(req, { params }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const wo = await prisma.workOrder.findUnique({
    where: { id: Number(id) },
    include: {
      client: true,
      technician: { select: { name: true } },
      items: {
        orderBy: { position: "asc" },
        include: { product: { select: { sku: true, name: true } } },
      },
      sections: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
            include: { product: { select: { sku: true, name: true } } },
          },
        },
      },
      payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
    },
  });

  if (!wo) return NextResponse.json({ error: "Bon introuvable" }, { status: 404 });

  const documentMeta = getWorkOrderDocumentMeta(wo.statut, searchParams.get("documentType"));
  const [settings, company] = await Promise.all([
    getWorkOrderSettings(),
    getCompany(),
  ]);

  const serializedWo = serializeWorkOrder(wo);
  let pdfBuffer;
  try {
    pdfBuffer = await generateInvoicePdf(serializedWo, { ...settings, company, documentType: documentMeta.type });
  } catch (err) {
    return NextResponse.json({ error: `Erreur generation PDF: ${err.message}` }, { status: 500 });
  }

  const filename = documentFilename(serializedWo, documentMeta);
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
