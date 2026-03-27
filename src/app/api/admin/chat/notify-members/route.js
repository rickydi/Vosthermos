import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
  try {
    await requireAdmin();
    const members = await prisma.chatNotifyMember.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Nom et telephone requis" }, { status: 400 });
    }

    const member = await prisma.chatNotifyMember.create({
      data: {
        name: body.name.trim(),
        phone: normalizePhone(body.phone),
        schedule: { lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
