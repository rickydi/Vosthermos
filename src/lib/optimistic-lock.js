import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nameFromEmail } from "@/lib/presence";

function toIso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Verrou optimiste anti-ecrasement.
// Le client renvoie `expected` = l'updatedAt qu'il a lu en ouvrant le dossier.
// Si l'updatedAt actuel en base differe, c'est qu'un collegue a sauvegarde entre
// temps -> on renvoie 409 (avec le nom du dernier modificateur si connu) au lieu
// d'ecraser silencieusement son travail.
//
// Retro-compatible: si le client n'envoie pas `expected`, on laisse passer.
// Retourne une NextResponse 409 a renvoyer telle quelle, ou null si OK.
export async function staleUpdateResponse({ expected, current, entityType, entityId }) {
  const expectedIso = toIso(expected);
  if (!expectedIso) return null; // client ne participe pas au verrou
  const currentIso = toIso(current);
  if (!currentIso || currentIso === expectedIso) return null; // a jour

  let by = null;
  try {
    const last = await prisma.adminActivityLog.findFirst({
      where: { entityType, entityId: String(entityId), action: "update" },
      orderBy: { id: "desc" },
      select: { adminEmail: true },
    });
    if (last?.adminEmail) by = nameFromEmail(last.adminEmail);
  } catch {
    /* best effort: le message reste utile sans le nom */
  }

  return NextResponse.json(
    {
      error: "conflict",
      code: "STALE_UPDATE",
      message: by
        ? `Modifie par ${by} pendant ton edition. Recharge le dossier avant de sauvegarder, sinon tu ecrases ses changements.`
        : "Ce dossier a ete modifie par quelqu'un d'autre pendant ton edition. Recharge avant de sauvegarder.",
      currentUpdatedAt: currentIso,
    },
    { status: 409 },
  );
}
