import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signTechToken, TECH_COOKIE_NAME } from "@/lib/technician-auth";

export async function POST(req) {
  try {
    const { pin } = await req.json();
    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: "PIN invalide" }, { status: 400 });
    }

    const techs = await prisma.technician.findMany({ where: { isActive: true } });

    for (const tech of techs) {
      const match = await bcrypt.compare(pin, tech.pin);
      if (match) {
        const token = signTechToken({ id: tech.id, name: tech.name });
        const cookieStore = await cookies();
        cookieStore.set(TECH_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 12, // 12h
          path: "/",
        });
        return NextResponse.json({ ok: true, name: tech.name });
      }
    }

    return NextResponse.json({ error: "PIN incorrect" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TECH_COOKIE_NAME);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
