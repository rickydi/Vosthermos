import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Le parametre date est requis (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date + "T00:00:00.000Z");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        date: dateObj,
        status: { not: "cancelled" },
      },
      select: { timeSlot: true },
    });

    const bookedSlots = appointments.map((a) => a.timeSlot);
    return NextResponse.json({ bookedSlots });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, serviceType, date, timeSlot, address, city, notes } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Le telephone est requis" }, { status: 400 });
    }
    if (!serviceType || !serviceType.trim()) {
      return NextResponse.json({ error: "Le type de service est requis" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "La date est requise" }, { status: 400 });
    }
    if (!timeSlot || !timeSlot.trim()) {
      return NextResponse.json({ error: "La plage horaire est requise" }, { status: 400 });
    }

    const dateObj = new Date(date + "T00:00:00.000Z");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
    }

    // Check if slot is still available
    const existing = await prisma.appointment.findFirst({
      where: {
        date: dateObj,
        timeSlot,
        status: { not: "cancelled" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cette plage horaire est deja reservee. Veuillez en choisir une autre." },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        serviceType: serviceType.trim(),
        date: dateObj,
        timeSlot,
        address: address?.trim() || null,
        city: city?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Cette plage horaire est deja reservee. Veuillez en choisir une autre." },
        { status: 409 }
      );
    }
    console.error("POST /api/appointments error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
