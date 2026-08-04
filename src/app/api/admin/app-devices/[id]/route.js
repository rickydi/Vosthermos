import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export const dynamic = "force-dynamic";

// Revocation d'un telephone (perdu, vendu, associe qui part). On REVOQUE au lieu
// de supprimer : la ligne garde la trace de l'appareil et de sa derniere
// activite. Le jeton devient inutilisable immediatement, sans toucher au compte
// admin de la personne.
export async function DELETE(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const deviceId = Number.parseInt(id, 10);
  if (!Number.isFinite(deviceId)) return NextResponse.json({ error: "Appareil invalide" }, { status: 400 });

  const device = await prisma.appDevice.findUnique({ where: { id: deviceId } });
  if (!device) return NextResponse.json({ error: "Appareil introuvable" }, { status: 404 });

  const updated = await prisma.appDevice.update({
    where: { id: deviceId },
    data: {
      revokedAt: new Date(),
      // Le jeton est neutralise : meme s'il traine sur le telephone, il ne
      // correspondra plus a aucune empreinte valide.
      tokenHash: `revoked:${deviceId}:${Date.now()}`,
      activationCode: null,
      activationExpiresAt: null,
    },
  });

  await logAdminActivity(req, session, {
    action: "delete",
    entityType: "app_device",
    entityId: deviceId,
    label: `Appareil app revoque: ${device.name}`,
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
