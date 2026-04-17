import prisma from "./prisma";
import crypto from "crypto";

const TTL_SECONDS = 60 * 60; // 1h

function hashKey(parts) {
  return crypto.createHash("sha1").update(JSON.stringify(parts)).digest("hex").slice(0, 16);
}

export function cacheKey(scope, params) {
  return `gsc_cache:${scope}:${hashKey(params)}`;
}

export async function readCache(key) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = $1`,
      key
    );
    if (!rows[0]?.value) return null;
    const parsed = JSON.parse(rows[0].value);
    if (!parsed.ts || Date.now() - parsed.ts > TTL_SECONDS * 1000) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export async function writeCache(key, data) {
  try {
    const value = JSON.stringify({ ts: Date.now(), data });
    await prisma.$executeRawUnsafe(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      key, value
    );
  } catch (err) {
    console.error("gsc-cache write failed:", err.message);
  }
}

export async function withCache(scope, params, fetcher) {
  const key = cacheKey(scope, params);
  const cached = await readCache(key);
  if (cached !== null) return { fromCache: true, data: cached };
  const data = await fetcher();
  await writeCache(key, data);
  return { fromCache: false, data };
}
