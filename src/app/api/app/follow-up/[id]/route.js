import { NextResponse } from "next/server";
import { requireDevice } from "@/lib/app-device";
import { logAdminActivity } from "@/lib/admin-activity";
import { applyFollowUpUpdate } from "@/lib/follow-up-update";

export const dynamic = "force-dynamic";

// Commandes de suivi depuis l'app mobile — MEME logique serveur que la page
// Suivi clients (lib/follow-up-update), donc memes cascades, memes gardes,
// memes evenements temps reel vers les onglets admin ouverts.
//
// Surface volontairement REDUITE : seuls les menus de la carte (contact,
// visite avec ou sans RDV, soumission, approbation) passent. Pas d'edition
// libre des champs — ces gestes restent sur l'admin web.
const ALLOWED_KEYS = new Set(["contactState", "toggleMilestone", "on", "visitStatus", "estimateType", "outcome", "visitRdv"]);
const ALLOWED_MILESTONES = new Set(["contactedAt", "visitDoneAt", "estimateSentAt", "acceptedAt"]);

export async function PUT(req, { params }) {
  const device = await requireDevice(req, { appVersion: req.headers.get("x-app-version") });
  if (!device) return NextResponse.json({ error: "Appareil non autorise" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const unknownKeys = Object.keys(body).filter((key) => !ALLOWED_KEYS.has(key));
  if (unknownKeys.length) {
    return NextResponse.json({ error: `Champs non permis depuis l'app: ${unknownKeys.join(", ")}` }, { status: 400 });
  }
  if (body.toggleMilestone !== undefined && !ALLOWED_MILESTONES.has(body.toggleMilestone)) {
    return NextResponse.json({ error: "Jalon non permis depuis l'app" }, { status: 400 });
  }

  const result = await applyFollowUpUpdate({
    followUpId: Number(id),
    body,
    actor: `app-device:${device.id}`,
    origin: undefined, // pas d'onglet admin a exclure : tous doivent se rafraichir
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }

  await logAdminActivity(req, { email: `app:${device.name}` }, {
    action: "update",
    entityType: "follow_up",
    entityId: result.raw.id,
    label: `Suivi modifie depuis l'app: ${result.raw.title}`,
    metadata: { device: device.name, clientId: result.raw.clientId, command: body },
  });

  return NextResponse.json(result.followUp);
}
