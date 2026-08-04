import { NextResponse } from "next/server";
import { requireDevice } from "@/lib/app-device";
import { recordCall } from "@/lib/record-call";

export const dynamic = "force-dynamic";

// Enregistrement d'un appel depuis le telephone. Meme logique que la page admin
// (lib/record-call), pour que les deux chemins produisent le meme resultat.
export async function POST(req) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = await recordCall({
    ...body,
    // Trace de la provenance dans la note, utile quand on relit le dossier.
    note: [body.note, `[app ${device.name}]`].filter(Boolean).join(" "),
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }

  return NextResponse.json({
    ok: true,
    conversationId: result.conversationId,
    existing: result.existing,
    photoSms: result.photoSms,
    clientId: result.clientId,
    clientName: result.clientName,
  });
}
