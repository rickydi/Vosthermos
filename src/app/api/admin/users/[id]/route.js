import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const count = await prisma.adminUser.count();
    if (count <= 1) {
      return NextResponse.json({ error: "Impossible de supprimer le dernier administrateur" }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, email: true },
    });
    await prisma.adminUser.delete({ where: { id: parseInt(id) } });
    await logAdminActivity(request, session, {
      action: "delete",
      entityType: "admin_user",
      entityId: id,
      label: `Admin supprime: ${user?.email || id}`,
      metadata: { email: user?.email },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
