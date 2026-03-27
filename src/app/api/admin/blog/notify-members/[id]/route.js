import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const member = await prisma.blogNotifyMember.update({
      where: { id: parseInt(id) },
      data: { isActive: body.isActive },
    });

    return NextResponse.json(member);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.blogNotifyMember.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
