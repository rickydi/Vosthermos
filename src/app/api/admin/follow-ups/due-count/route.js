import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES } from "@/lib/follow-up-utils";
import { todayDateInput, parseDateOnly } from "@/lib/date-only";

export const dynamic = "force-dynamic";

function endOfDate(value) {
  const date = parseDateOnly(value, new Date());
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const todayEnd = endOfDate(todayDateInput());
  const count = await prisma.clientFollowUp.count({
    where: {
      status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
      nextActionDate: { lte: todayEnd },
    },
  });

  return NextResponse.json({ count });
}
