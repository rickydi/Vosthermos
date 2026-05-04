import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, canAccessClient, hasPermission } from "@/lib/manager-auth";
import { getCompany } from "@/lib/company";
import FactureView from "./FactureView";

export const dynamic = "force-dynamic";

export default async function FacturePage({ params }) {
  const { id } = await params;
  const manager = await getManagerFromCookie();
  if (!manager) redirect("/gestionnaire/login");

  const wo = await prisma.workOrder.findUnique({
    where: { id: Number(id) },
    include: {
      client: true,
      technician: { select: { id: true, name: true, phone: true, photoUrl: true } },
      items: { orderBy: { position: "asc" } },
      sections: {
        orderBy: { position: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!wo || wo.visibleAuClient === false) notFound();

  const mc = canAccessClient(manager, wo.clientId);
  if (!mc || !hasPermission(mc, "view_invoices")) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Accès refusé</h1>
        <p style={{ color: "#718096" }}>Vous n&apos;avez pas la permission de voir les factures de cette copropriété.</p>
      </div>
    );
  }

  const company = await getCompany();
  const termsDays = wo.client?.paymentTermsDays ?? 30;
  const invoiceDate = wo.date ? new Date(wo.date) : null;
  const dueDate = invoiceDate ? new Date(invoiceDate.getTime() + termsDays * 24 * 60 * 60 * 1000) : null;

  const serialized = {
    ...wo,
    date: wo.date?.toISOString() || null,
    arrivalAt: wo.arrivalAt?.toISOString() || null,
    departureAt: wo.departureAt?.toISOString() || null,
    createdAt: wo.createdAt.toISOString(),
    updatedAt: wo.updatedAt.toISOString(),
    totalPieces: Number(wo.totalPieces),
    totalLabor: Number(wo.totalLabor),
    laborRate: Number(wo.laborRate),
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
    paymentTermsDays: termsDays,
    dueDate: dueDate?.toISOString() || null,
    items: wo.items.map((i) => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    sections: wo.sections.map((s) => ({
      ...s,
      items: s.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    })),
  };

  const coProp = {
    legal: company?.legalName || "",
    address: company?.address || "",
    city: company?.city || "",
    postalCode: company?.postalCode || "",
    phone: company?.phone || "",
    email: company?.email || "",
    web: company?.web || "",
    tps: company?.tpsNumber || "",
    tvq: company?.tvqNumber || "",
    rbq: company?.rbqNumber || "",
  };

  return <FactureView wo={serialized} company={coProp} />;
}
