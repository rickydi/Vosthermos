import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { isArchived: !!body.isArchived },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
