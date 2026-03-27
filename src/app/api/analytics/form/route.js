import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, visitorId, formType, action, fieldName, fieldsCompleted, fieldValues, page } = body;

    if (!formType || !action) {
      return NextResponse.json({ error: "formType et action requis" }, { status: 400 });
    }

    const event = await prisma.analyticsFormEvent.create({
      data: {
        sessionId: sessionId || null,
        visitorId: visitorId || null,
        formType,
        action,
        fieldName: fieldName || null,
        fieldsCompleted: fieldsCompleted || null,
        fieldValues: fieldValues || null,
        page: page || null,
      },
    });

    return NextResponse.json({ id: event.id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
