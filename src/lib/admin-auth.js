import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "vosthermos-admin-token";
const INSECURE_DEFAULT = "change-this-to-a-random-secret";

// Resolution paresseuse: on ne throw qu'a l'usage (pas au build) si la cle manque
// en production. Evite qu'un secret par defaut signe des tokens admin valides.
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== INSECURE_DEFAULT) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET non configure: definir une vraie cle secrete dans .env avant de demarrer en production.",
    );
  }
  // Developpement uniquement: cle factice pour ne pas bloquer le travail local.
  return INSECURE_DEFAULT;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

// Token temporaire emis APRES le mot de passe mais AVANT la validation du code
// 2FA. Ne doit jamais donner d'acces admin: il porte un "purpose" que
// getAdminSession refuse explicitement (voir ci-dessous).
export function signPendingToken(payload) {
  return jwt.sign({ ...payload, purpose: "admin_2fa_pending" }, getSecret(), { expiresIn: "10m" });
}

export function verifyPendingToken(token) {
  try {
    const decoded = jwt.verify(String(token || ""), getSecret());
    if (decoded?.purpose !== "admin_2fa_pending") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  // Securite: un vrai token de session ne porte pas de "purpose". On refuse donc
  // les tokens specialises (2FA en attente, approbation blogue, etc.) meme s'ils
  // sont signes avec la meme cle et glisses dans le cookie de session.
  if (!decoded || decoded.purpose) return null;
  return decoded;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export { COOKIE_NAME };
