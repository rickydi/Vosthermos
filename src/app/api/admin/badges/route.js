import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES } from "@/lib/follow-up-utils";
import { todayDateInput, parseDateOnly } from "@/lib/date-only";

export const dynamic = "force-dynamic";

function endOfToday() {
  const date = parseDateOnly(todayDateInput(), new Date());
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

// Compteurs de la sidebar admin en une seule requete: remplace le polling de
// 4 endpoints separes (dont /api/admin/chat qui chargeait toutes les
// conversations juste pour compter les non-lues).
export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const [unreadChat, pendingRdv, pendingRequests, dueFollowUps] = await Promise.all([
    prisma.chatConversation.count({ where: { unreadCount: { gt: 0 } } }),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.workOrder.count({
      where: { statut: "draft", notes: { startsWith: "Demande du gestionnaire" } },
    }),
    prisma.clientFollowUp.count({
      where: {
        status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
        nextActionDate: { lte: endOfToday() },
      },
    }),
  ]);

  return NextResponse.json({ unreadChat, pendingRdv, pendingRequests, dueFollowUps });
}
