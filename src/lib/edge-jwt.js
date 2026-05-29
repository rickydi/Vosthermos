const INSECURE_DEFAULT = "change-this-to-a-random-secret";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== INSECURE_DEFAULT) return secret;
  if (process.env.NODE_ENV === "production") return null;
  return INSECURE_DEFAULT;
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64UrlToJson(value) {
  const bytes = base64UrlToBytes(value);
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function sign(input, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input)));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyJwtAtEdge(token) {
  try {
    const secret = getSecret();
    if (!secret || !token) return null;
    const parts = String(token).split(".");
    if (parts.length !== 3) return null;

    const header = base64UrlToJson(parts[0]);
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const payload = base64UrlToJson(parts[1]);
    if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) return null;

    const expected = await sign(`${parts[0]}.${parts[1]}`, secret);
    const actual = base64UrlToBytes(parts[2]);
    if (!timingSafeEqual(expected, actual)) return null;

    return payload;
  } catch {
    return null;
  }
}
