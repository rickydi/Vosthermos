import crypto from "node:crypto";
import prisma from "@/lib/prisma";

// Authentification de l'app mobile « Appels » (telephones des associes).
//
// Choix de conception : le jeton d'appareil n'est PAS une session admin. Il ne
// porte aucun role, n'est jamais accepte par getAdminSession(), et n'ouvre que
// les routes /api/app/* (savoir qui appelle, enregistrer un appel). Un telephone
// perdu se revoque sans toucher au compte de la personne.
//
// Le jeton n'est stocke qu'en empreinte SHA-256 : meme avec un acces lecture a
// la base, on ne peut pas rejouer un appareil.

const TOKEN_BYTES = 32;
const ACTIVATION_TTL_MINUTES = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

/** Code d'activation lisible a voix haute : 8 caracteres sans 0/O ni 1/I/L. */
function makeActivationCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
    if (i === 3) code += "-"; // ABCD-EFGH, plus facile a recopier
  }
  return code;
}

/**
 * Cree un appareil en attente et rend son code d'activation.
 * Le jeton definitif n'existe qu'au moment ou l'app consomme ce code.
 */
export async function createPendingDevice(name) {
  const label = String(name || "").trim() || "Appareil sans nom";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const activationCode = makeActivationCode();
    try {
      return await prisma.appDevice.create({
        data: {
          name: label,
          // Valeur unique et inutilisable tant que l'appareil n'est pas active :
          // tokenHash est NOT NULL + UNIQUE au schema.
          tokenHash: `pending:${crypto.randomUUID()}`,
          activationCode,
          activationExpiresAt: new Date(Date.now() + ACTIVATION_TTL_MINUTES * 60_000),
        },
      });
    } catch (err) {
      if (err?.code === "P2002") continue; // collision de code, on retente
      throw err;
    }
  }
  throw new Error("Impossible de generer un code d'activation");
}

/**
 * Echange un code d'activation contre un jeton d'appareil (usage unique).
 * Renvoie { token, device } ou null si le code est inconnu/expire/deja utilise.
 */
export async function activateDevice(code, { model, appVersion } = {}) {
  const cleaned = String(code || "").trim().toUpperCase().replace(/\s/g, "");
  if (!cleaned) return null;

  const device = await prisma.appDevice.findUnique({ where: { activationCode: cleaned } });
  if (!device) return null;
  if (device.activatedAt) return null;
  if (device.revokedAt) return null;
  if (device.activationExpiresAt && device.activationExpiresAt < new Date()) return null;

  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const updated = await prisma.appDevice.update({
    where: { id: device.id },
    data: {
      tokenHash: hashToken(token),
      activationCode: null, // le code ne resservira pas
      activationExpiresAt: null,
      activatedAt: new Date(),
      lastSeenAt: new Date(),
      model: model ? String(model).slice(0, 80) : null,
      appVersion: appVersion ? String(appVersion).slice(0, 20) : null,
    },
  });
  return { token, device: updated };
}

/**
 * Verifie l'en-tete Authorization: Bearer <jeton> d'une requete de l'app.
 * Renvoie l'appareil, ou null. Met a jour lastSeenAt sans bloquer la reponse.
 */
export async function requireDevice(req, { appVersion } = {}) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const device = await prisma.appDevice.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!device || device.revokedAt || !device.activatedAt) return null;

  // Trace de vie : utile pour reperer un telephone qui ne repond plus (batterie
  // optimisee par Android, app desinstallee...). Volontairement non attendu.
  prisma.appDevice
    .update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        ...(appVersion ? { appVersion: String(appVersion).slice(0, 20) } : {}),
      },
    })
    .catch(() => {});

  return device;
}
