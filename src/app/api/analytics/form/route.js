import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, visitorId, formType, action, fieldName, fieldsCompleted, fieldValues, interactions, page } = body;

    if (!formType || !action) {
      return NextResponse.json({ error: "formType et action requis" }, { status: 400 });
    }

    // Only store interactions on abandon/submit (the full session log)
    const data = {
      sessionId: sessionId || null,
      visitorId: visitorId || null,
      formType,
      action,
      fieldName: fieldName || null,
      fieldsCompleted: fieldsCompleted || null,
      fieldValues: fieldValues || null,
      page: page || null,
    };

    // Store interactions in fieldValues as _interactions key for abandon/submit
    if ((action === "abandon" || action === "submit") && interactions && interactions.length > 0) {
      data.fieldValues = { ...(fieldValues || {}), _interactions: interactions };
    }

    const event = await prisma.analyticsFormEvent.create({ data });
    return NextResponse.json({ id: event.id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
