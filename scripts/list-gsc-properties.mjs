import { readFileSync } from "fs";
import { createSign } from "crypto";

const SERVICE_ACCOUNT_PATH = "./config/google-service-account.json";

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createJWT(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = { iss: sa.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now };
  const segments = [base64url(JSON.stringify(header)), base64url(JSON.stringify(claim))];
  const data = segments.join(".");
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  const signature = sign.sign(sa.private_key, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${data}.${signature}`;
}

const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
console.log(`Service account: ${sa.client_email}\n`);

const jwt = createJWT(sa);
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }).toString(),
});
const tokenData = await tokenRes.json();
console.log("Token OK");

const listRes = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
  headers: { "Authorization": `Bearer ${tokenData.access_token}` },
});
const listData = await listRes.json();
console.log("\nSites accessible au service account:");
if (listData.siteEntry) {
  for (const s of listData.siteEntry) {
    console.log(`  ${s.permissionLevel} -> ${s.siteUrl}`);
  }
} else {
  console.log("AUCUN SITE ACCESSIBLE");
  console.log(JSON.stringify(listData, null, 2));
}
