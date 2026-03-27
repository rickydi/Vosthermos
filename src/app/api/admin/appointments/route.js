import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

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
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });

    const serialized = appointments.map((a) => ({
      ...a,
      date: a.date.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    console.error("GET /api/admin/appointments error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
