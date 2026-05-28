import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { FOLLOW_UP_TERMINAL_STATUSES, serializeFollowUp } from "@/lib/follow-up-utils";
import { parseDateOnly, todayDateInput } from "@/lib/date-only";

export const dynamic = "force-dynamic";

function startOfDate(value) {
  const date = parseDateOnly(value || todayDateInput(), new Date());
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfDate(value) {
  const date = parseDateOnly(value || todayDateInput(), new Date());
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

export async function GET(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const from = startOfDate(searchParams.get("from"));
  const to = endOfDate(searchParams.get("to") || searchParams.get("from"));

  const reminders = await prisma.clientFollowUp.findMany({
    where: {
      status: { notIn: FOLLOW_UP_TERMINAL_STATUSES },
      nextActionDate: { gte: from, lte: to },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          secondaryPhone: true,
          email: true,
          city: true,
          _count: { select: { workOrders: true } },
        },
      },
    },
    orderBy: [
      { nextActionDate: "asc" },
      { updatedAt: "desc" },
    ],
    take: 200,
  });

  return NextResponse.json(reminders.map(serializeFollowUp));
}
