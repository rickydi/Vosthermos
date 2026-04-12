import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const techs = await prisma.technician.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(techs);
}

export async function POST(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.name || !body.pin || body.pin.length !== 4 || !/^\d{4}$/.test(body.pin)) {
    return NextResponse.json({ error: "Nom et PIN 4 chiffres requis" }, { status: 400 });
  }

  const hashedPin = await bcrypt.hash(body.pin, 10);
  const tech = await prisma.technician.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      pin: hashedPin,
    },
  });

  return NextResponse.json(tech);
}
