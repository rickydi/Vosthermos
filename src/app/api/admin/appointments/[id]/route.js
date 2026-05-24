import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { ensureWorkOrderForAppointment, serializeAppointment } from "@/lib/appointment-work-order";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: { workOrder: { select: { id: true, number: true, statut: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    return NextResponse.json(serializeAppointment(appointment));
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    console.error("GET /api/admin/appointments/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "waiting_client", "confirmed", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptees: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    let appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { workOrder: { select: { id: true, number: true, statut: true } } },
    });

    if ((status === "confirmed" || status === "completed") && !appointment.workOrder) {
      const workOrder = await ensureWorkOrderForAppointment(appointment.id);
      if (workOrder) {
        appointment = await prisma.appointment.findUnique({
          where: { id: appointment.id },
          include: { workOrder: { select: { id: true, number: true, statut: true } } },
        });
      }
    }
    await logAdminActivity(request, session, {
      action: "update",
      entityType: "appointment",
      entityId: appointment.id,
      label: `Rendez-vous modifie: ${appointment.name}`,
      metadata: {
        statusFrom: existing?.status,
        statusTo: appointment.status,
        phone: appointment.phone,
        email: appointment.email,
      },
    });

    return NextResponse.json(serializeAppointment(appointment));
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }
    console.error("PUT /api/admin/appointments/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const appointmentId = parseInt(id);

    let appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { workOrder: { select: { id: true, number: true, statut: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    if (appointment.status === "pending" || appointment.status === "waiting_client") {
      appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "confirmed" },
        include: { workOrder: { select: { id: true, number: true, statut: true } } },
      });
    }

    if (!appointment.workOrder) {
      await ensureWorkOrderForAppointment(appointmentId);
    }

    const refreshed = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { workOrder: { select: { id: true, number: true, statut: true } } },
    });

    await logAdminActivity(request, session, {
      action: "create",
      entityType: "work_order",
      entityId: refreshed?.workOrder?.id || appointmentId,
      label: `Bon cree depuis RDV: ${refreshed?.name || appointmentId}`,
      metadata: {
        appointmentId,
        workOrderId: refreshed?.workOrder?.id,
        workOrderNumber: refreshed?.workOrder?.number,
        phone: refreshed?.phone,
        email: refreshed?.email,
      },
    });

    return NextResponse.json(serializeAppointment(refreshed));
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    console.error("POST /api/admin/appointments/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const existing = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });
    await logAdminActivity(request, session, {
      action: "delete",
      entityType: "appointment",
      entityId: id,
      label: `Rendez-vous supprime: ${existing?.name || id}`,
      metadata: {
        status: existing?.status,
        phone: existing?.phone,
        email: existing?.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }
    console.error("DELETE /api/admin/appointments/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
