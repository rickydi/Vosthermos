import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptees: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
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
    await requireAdmin();
    const { id } = await params;

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
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
