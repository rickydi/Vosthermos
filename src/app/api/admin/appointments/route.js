import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeAppointment } from "@/lib/appointment-work-order";

export async function GET(request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");

    const where = {};

    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from + "T00:00:00.000Z");
      }
      if (to) {
        where.date.lte = new Date(to + "T00:00:00.000Z");
      }
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { workOrder: { select: { id: true, number: true, statut: true } } },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      // Garde-fou: la page calendrier passe toujours from/to; borne le cas
      // sans filtre pour ne jamais charger toute la table.
      take: 1000,
    });

    const serialized = appointments.map(serializeAppointment);

    return NextResponse.json(serialized);
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    console.error("GET /api/admin/appointments error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
