import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      ...appointment,
      date: appointment.date.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
    });
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
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
    });
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

    return NextResponse.json({
      ...appointment,
      date: appointment.date.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
    });
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
