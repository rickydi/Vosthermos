import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Verification 2FA par code email a la connexion admin.
const CODE_TTL_MS = 30 * 60 * 1000; // 30 minutes (marge pour le delai de livraison Gmail)
const MAX_ATTEMPTS = 5; // tentatives de saisie par code
const RESEND_COOLDOWN_MS = 30 * 1000; // anti-spam sur le bouton "renvoyer"
const BCRYPT_COST = 10;

// Adresse qui recoit les codes. Fixe par defaut (info@vosthermos.com) mais
// surchargeable par variable d'environnement sans toucher au code.
export function getTwoFactorEmail() {
  return (process.env.ADMIN_2FA_EMAIL || "info@vosthermos.com").trim();
}

// Masque l'adresse pour l'afficher dans l'UI sans la reveler entierement.
export function maskEmail(email) {
  const value = String(email || "");
  const at = value.indexOf("@");
  if (at <= 0) return value;
  const local = value.slice(0, at);
  const domain = value.slice(at);
  const visible = local.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(2, local.length - 1))}${domain}`;
}

// Code a 5 chiffres (00000-99999) genere avec un PRNG cryptographique.
export function generateLoginCode() {
  return String(crypto.randomInt(0, 100000)).padStart(5, "0");
}

// Persiste le code (hache) et purge les codes precedents de cet utilisateur en
// UNE SEULE transaction: garantit un seul code valide a la fois (anti-bruteforce)
// et evite l'accumulation de lignes expirees. A appeler APRES l'envoi reussi de
// l'email, pour ne jamais laisser en base un code valide qui n'a pas ete transmis.
export async function storeLoginCode(adminUserId, code, ipAddress) {
  const codeHash = await bcrypt.hash(code, BCRYPT_COST);
  await prisma.$transaction([
    prisma.adminLoginCode.deleteMany({ where: { adminUserId } }),
    prisma.adminLoginCode.create({
      data: {
        adminUserId,
        codeHash,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
        ipAddress: ipAddress || null,
      },
    }),
  ]);
}

// Respecte un delai minimal entre deux envois de code. On ne regarde que le
// code actif (non utilise) pour rester correct meme si la purge changeait.
export async function canResend(adminUserId) {
  const last = await prisma.adminLoginCode.findFirst({
    where: { adminUserId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!last) return true;
  return Date.now() - new Date(last.createdAt).getTime() >= RESEND_COOLDOWN_MS;
}

// Valide un code saisi. Consomme le code en cas de succes, incremente le
// compteur de tentatives sinon, et bloque apres MAX_ATTEMPTS.
export async function verifyLoginCode(adminUserId, code) {
  const row = await prisma.adminLoginCode.findFirst({
    where: { adminUserId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row) {
    return { ok: false, error: "Code introuvable ou deja utilise. Demande un nouveau code." };
  }
  if (row.expiresAt < new Date()) {
    return { ok: false, error: "Code expire. Demande un nouveau code." };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await prisma.adminLoginCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return { ok: false, error: "Trop de tentatives. Demande un nouveau code." };
  }

  const match = await bcrypt.compare(String(code || ""), row.codeHash);
  if (!match) {
    const used = row.attempts + 1;
    await prisma.adminLoginCode.update({
      where: { id: row.id },
      data: {
        attempts: { increment: 1 },
        ...(used >= MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
      },
    });
    const left = MAX_ATTEMPTS - used;
    return {
      ok: false,
      error: left > 0
        ? `Code invalide. ${left} essai${left > 1 ? "s" : ""} restant${left > 1 ? "s" : ""}.`
        : "Trop de tentatives. Demande un nouveau code.",
    };
  }

  await prisma.adminLoginCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return { ok: true };
}
