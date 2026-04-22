import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const MANAGER_COOKIE = "vos_mgr_session";
export const SESSION_DAYS = 30;
export const MAGIC_MINUTES = 15;

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export async function createMagicToken(manager) {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + MAGIC_MINUTES * 60 * 1000);
  await prisma.managerMagicToken.create({
    data: { token, managerId: manager.id, email: manager.email, expiresAt },
  });
  return token;
}

export async function consumeMagicToken(token) {
  const row = await prisma.managerMagicToken.findUnique({ where: { token } });
  if (!row) return { error: "Lien invalide" };
  if (row.usedAt) return { error: "Ce lien a déjà été utilisé" };
  if (row.expiresAt < new Date()) return { error: "Ce lien a expiré" };
  await prisma.managerMagicToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
  const manager = await prisma.managerUser.findUnique({
    where: { id: row.managerId },
    include: { clients: { include: { client: true } } },
  });
  if (!manager || !manager.isActive) return { error: "Compte désactivé" };
  return { manager };
}

export async function createSession(managerId, req) {
  const token = generateToken(48);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const userAgent = req?.headers?.get?.("user-agent") || null;
  const ip = req?.headers?.get?.("x-forwarded-for")?.split(",")[0] || null;
  await prisma.managerSession.create({
    data: { token, managerId, expiresAt, userAgent, ip },
  });
  await prisma.managerUser.update({
    where: { id: managerId },
    data: { lastLoginAt: new Date() },
  });
  return { token, expiresAt };
}

export async function getManagerFromCookie() {
  const store = await cookies();
  const token = store.get(MANAGER_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.managerSession.findUnique({
    where: { token },
    include: {
      manager: {
        include: { clients: { include: { client: true } } },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.managerSession.delete({ where: { token } }).catch(() => {});
    return null;
  }
  if (!session.manager?.isActive) return null;
  return session.manager;
}

export async function requireManager() {
  const manager = await getManagerFromCookie();
  if (!manager) throw new Error("Non authentifié");
  return manager;
}

export async function destroySession(token) {
  if (!token) return;
  await prisma.managerSession.delete({ where: { token } }).catch(() => {});
}

export function hasPermission(managerClient, permission) {
  if (!managerClient) return false;
  return (managerClient.permissions || []).includes(permission);
}

export function canAccessClient(manager, clientId) {
  if (!manager) return null;
  const mc = manager.clients?.find((c) => c.clientId === Number(clientId));
  return mc || null;
}
