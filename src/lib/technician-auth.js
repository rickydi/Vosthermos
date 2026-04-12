import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-random-secret";
const TECH_COOKIE_NAME = "vosthermos-tech-token";

export function signTechToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyTechToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getTechSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TECH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyTechToken(token);
}

export async function requireTech() {
  const session = await getTechSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export { TECH_COOKIE_NAME };
