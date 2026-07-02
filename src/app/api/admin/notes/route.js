import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const KEY = "admin_bloc_notes";

function parseValue(value) {
  try {
    const parsed = JSON.parse(value);
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      updatedAt: parsed.updatedAt || null,
      updatedBy: parsed.updatedBy || null,
    };
  } catch {
    return { text: String(value || ""), updatedAt: null, updatedBy: null };
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    return NextResponse.json(row ? parseValue(row.value) : { text: "", updatedAt: null, updatedBy: null });
  } catch (error) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[notes] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const text = String(body.text ?? "");
    // Garde-fou contre un payload demesure (le bloc-notes n'est pas un roman).
    if (text.length > 100_000) {
      return NextResponse.json({ error: "Note trop longue" }, { status: 400 });
    }

    const payload = {
      text,
      updatedAt: new Date().toISOString(),
      updatedBy: session?.name || session?.email || "admin",
    };

    await prisma.siteSetting.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(payload) },
      create: { key: KEY, value: JSON.stringify(payload) },
    });

    return NextResponse.json({ ok: true, updatedAt: payload.updatedAt, updatedBy: payload.updatedBy });
  } catch (error) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[notes] PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
