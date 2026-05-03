import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(req, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const conversation = await prisma.chatConversation.findUnique({ where: { id } });
    await prisma.chatConversation.delete({ where: { id } });
    await logAdminActivity(req, session, {
      action: "delete",
      entityType: "chat",
      entityId: id,
      label: `Chat supprime: ${conversation?.clientName || id}`,
      metadata: { clientPhone: conversation?.clientPhone, clientEmail: conversation?.clientEmail },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
