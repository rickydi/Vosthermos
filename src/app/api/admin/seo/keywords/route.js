import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const DEFAULT_KEYWORDS = ["remplacement vitre thermos"];

// GET: return saved keywords
export async function GET() {
  try {
    await requireAdmin();
    let keywords = DEFAULT_KEYWORDS;
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT value FROM site_settings WHERE key = 'seo_keywords'`
      );
      if (rows[0]?.value) keywords = JSON.parse(rows[0].value);
    } catch {}
    return NextResponse.json({ keywords });
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }
}

// POST: save keywords list
export async function POST(request) {
  try {
    await requireAdmin();
    const { keywords } = await request.json();
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "Au moins un mot cle requis" }, { status: 400 });
    }
    const clean = keywords.map((k) => k.trim()).filter(Boolean);
    await prisma.$executeRawUnsafe(
      `INSERT INTO site_settings (key, value) VALUES ('seo_keywords', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      JSON.stringify(clean)
    );
    return NextResponse.json({ keywords: clean });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
