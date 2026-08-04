import { NextResponse } from "next/server";
import { requireDevice } from "@/lib/app-device";
import { callerSummary, lookupCaller } from "@/lib/caller-lookup";

export const dynamic = "force-dynamic";

// « Qui appelle ? » pour l'app mobile. Renvoie de quoi afficher une bulle
// lisible pendant l'appel, sans ouvrir de navigateur ni de session admin.
export async function GET(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const result = await lookupCaller(searchParams.get("tel"));

  return NextResponse.json({
    digits: result.digits,
    known: result.known,
    // Titre et sous-titre prets a afficher : l'app n'a aucune mise en forme a
    // refaire, et le libelle reste coherent avec la page admin.
    title: result.known ? result.client.name : "Numéro inconnu",
    subtitle: result.known
      ? callerSummary(result)
      : result.conversation
        ? `Déjà vu dans le chat : ${result.conversation.name || "sans nom"}`
        : "Aucune fiche à ce numéro",
    client: result.client,
    conversation: result.conversation,
  }, { headers: { "Cache-Control": "no-store" } });
}
