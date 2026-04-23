import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const count = await prisma.workOrder.count({
    where: {
      statut: "draft",
      notes: { startsWith: "Demande du gestionnaire" },
    },
  });

  return NextResponse.json({ count });
}
