import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  return NextResponse.json({
    id: manager.id,
    email: manager.email,
    firstName: manager.firstName,
    lastName: manager.lastName,
    phone: manager.phone || "",
    notifyNewInvoice: manager.notifyNewInvoice ?? true,
    notifyWorkOrderScheduled: manager.notifyWorkOrderScheduled ?? true,
    notifyInvoiceOverdue: manager.notifyInvoiceOverdue ?? true,
  });
}

export async function PUT(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const data = {};
  if (typeof body.firstName === "string" && body.firstName.trim()) data.firstName = body.firstName.trim();
  if (typeof body.lastName === "string" && body.lastName.trim()) data.lastName = body.lastName.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body.notifyNewInvoice === "boolean") data.notifyNewInvoice = body.notifyNewInvoice;
  if (typeof body.notifyWorkOrderScheduled === "boolean") data.notifyWorkOrderScheduled = body.notifyWorkOrderScheduled;
  if (typeof body.notifyInvoiceOverdue === "boolean") data.notifyInvoiceOverdue = body.notifyInvoiceOverdue;

  const updated = await prisma.managerUser.update({ where: { id: manager.id }, data });
  return NextResponse.json({ ok: true, profile: {
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone || "",
    notifyNewInvoice: updated.notifyNewInvoice,
    notifyWorkOrderScheduled: updated.notifyWorkOrderScheduled,
    notifyInvoiceOverdue: updated.notifyInvoiceOverdue,
  } });
}
