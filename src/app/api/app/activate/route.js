import { NextResponse } from "next/server";
import { activateDevice } from "@/lib/app-device";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Echange un code d'activation (genere dans /admin/app) contre un jeton
// d'appareil permanent. Seule route /api/app/* ouverte sans jeton : elle est
// donc limitee en frequence, sinon on pourrait tenter les codes au hasard.
export async function POST(req) {
  const limited = rateLimit(`app-activate:${clientIp(req)}`, { max: 10, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessaie dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const result = await activateDevice(body.code, { model: body.model, appVersion: body.appVersion });
  if (!result) {
    // Message volontairement identique pour « inconnu », « expire » et « deja
    // utilise » : inutile d'aider a deviner un code valide.
    return NextResponse.json({ error: "Code invalide, expire ou deja utilise." }, { status: 400 });
  }

  return NextResponse.json({
    token: result.token,
    device: { id: result.device.id, name: result.device.name },
  });
}
