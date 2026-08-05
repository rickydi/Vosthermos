import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { lookupCaller } from "@/lib/caller-lookup";

export const dynamic = "force-dynamic";

// « Qui appelle ? » pour la page /admin/appel — MEME implementation que l'app
// mobile (lib/caller-lookup) : rapprochement sur les chiffres du numero, repli
// sur les conversations de chat pour les numeros sans fiche.
export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const result = await lookupCaller(searchParams.get("tel"));
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
