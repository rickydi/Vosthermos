import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const members = await prisma.blogNotifyMember.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Nom et email requis" }, { status: 400 });
    }

    const member = await prisma.blogNotifyMember.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
