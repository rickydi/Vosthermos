import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDevice } from "@/lib/app-device";
import { clientIdsByPhoneDigits } from "@/lib/search";

export const dynamic = "force-dynamic";

// Consigne un appel RECU (repondu) — envoye par l'app apres le delai d'attente,
// une fois par appel, que l'appel soit ensuite note ou non. C'est la matiere
// premiere de la section APPELS de l'ecran client.
export async function POST(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const digits = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Numero invalide" }, { status: 400 });
  }

  // Rattache a la fiche si le numero en identifie UNE seule (sinon null : le
  // rapprochement par chiffres a l'affichage fera le reste).
  const ids = await clientIdsByPhoneDigits([digits]);
  const clientId = ids.length === 1 ? ids[0] : null;

  const event = await prisma.callEvent.create({
    data: { phoneDigits: digits, clientId, deviceId: device.id },
  });

  return NextResponse.json({ ok: true, id: event.id });
}
