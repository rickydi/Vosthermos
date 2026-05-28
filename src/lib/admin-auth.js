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
  return verifyToken(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export { COOKIE_NAME };
