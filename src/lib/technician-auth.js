import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-random-secret";
const TECH_COOKIE_NAME = "vosthermos-tech-token";

export function signTechToken(payload) {
  // role:"technician" fige la nature du jeton : getAdminSession (qui exige
  // role:"admin") ne peut plus l'accepter s'il est glisse dans le cookie admin.
  return jwt.sign({ ...payload, role: "technician" }, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyTechToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Symetrie du cloisonnement: un jeton admin ne doit pas non plus servir de
    // jeton technicien.
    if (decoded?.role !== "technician") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getTechSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TECH_COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifyTechToken(token);
  if (!decoded) return null;
  // Revocation immediate: un technicien desactive (isActive=false) ou supprime ne
  // doit plus passer, sans attendre l'expiration du JWT (12h).
  const tech = await prisma.technician.findUnique({
    where: { id: decoded.id },
    select: { isActive: true },
  });
  if (!tech || !tech.isActive) return null;
  return decoded;
}

export async function requireTech() {
  const session = await getTechSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export { TECH_COOKIE_NAME };
