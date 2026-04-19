#!/usr/bin/env node
// Check Google Search Console indexation status for a list of URLs
// Uses service account auth + URL Inspection API

import { readFileSync } from "fs";
import { createSign } from "crypto";

const SITE_URL = "https://www.vosthermos.com/";
const SERVICE_ACCOUNT_PATH = "./config/google-service-account.json";

// Strategic URLs to check (limited to avoid quota exhaustion)
const URLS_TO_CHECK = [
  // Remaining guides (7)
  "https://www.vosthermos.com/guides/ajuster-porte-patio-qui-glisse-mal",
  "https://www.vosthermos.com/guides/reparer-moustiquaire-dechiree",
  "https://www.vosthermos.com/guides/calfeutrer-fenetre-exterieur",
  "https://www.vosthermos.com/guides/desembuer-vitre-thermos",
  "https://www.vosthermos.com/guides/changer-coupe-froid-porte-patio",
  "https://www.vosthermos.com/guides/changer-manivelle-fenetre",

  // Secondary cities (9)
  "https://www.vosthermos.com/reparation-portes-et-fenetres/saint-hyacinthe",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/granby",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/terrebonne",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/repentigny",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/chambly",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/boucherville",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/saint-jean-sur-richelieu",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/blainville",
  "https://www.vosthermos.com/reparation-portes-et-fenetres/chateauguay",

  // Service+ville sample
  "https://www.vosthermos.com/services/remplacement-vitre-thermos/montreal",
  "https://www.vosthermos.com/services/remplacement-vitre-thermos/laval",
  "https://www.vosthermos.com/services/remplacement-quincaillerie/montreal",

  // Remaining services
  "https://www.vosthermos.com/services/reparation-porte-fenetre",
  "https://www.vosthermos.com/services/reparation-portes-bois",
  "https://www.vosthermos.com/services/moustiquaires-sur-mesure",
  "https://www.vosthermos.com/services/calfeutrage",
  "https://www.vosthermos.com/services/insertion-porte",
  "https://www.vosthermos.com/services/coupe-froid",

  // Products (sample)
  "https://www.vosthermos.com/produit/charniere-de-fenetre-a-battant",
  "https://www.vosthermos.com/produit/roulette-avec-roulement-a-bille",

  // Problems pages
  "https://www.vosthermos.com/problemes",
  "https://www.vosthermos.com/faq",
  "https://www.vosthermos.com/realisations",

  // Calfeutrage + ville
  "https://www.vosthermos.com/calfeutrage/montreal",
];

// ----- JWT + OAuth2 -----

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const segments = [base64url(JSON.stringify(header)), base64url(JSON.stringify(claim))];
  const data = segments.join(".");
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  const signature = sign.sign(serviceAccount.private_key, "base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${data}.${signature}`;
}

async function getAccessToken(serviceAccount) {
  const jwt = createJWT(serviceAccount);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OAuth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function inspectUrl(accessToken, url) {
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      inspectionUrl: url,
      siteUrl: SITE_URL,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    return { url, error: `HTTP ${res.status}: ${t.slice(0, 150)}` };
  }
  const data = await res.json();
  const r = data.inspectionResult?.indexStatusResult;
  return {
    url,
    verdict: r?.verdict || "UNKNOWN",
    coverageState: r?.coverageState || "",
    indexingState: r?.indexingState || "",
    lastCrawlTime: r?.lastCrawlTime || null,
    robotsTxtState: r?.robotsTxtState || "",
    googleCanonical: r?.googleCanonical || "",
    userCanonical: r?.userCanonical || "",
    referringUrls: r?.referringUrls?.length || 0,
  };
}

async function main() {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  console.log(`Auth as: ${serviceAccount.client_email}`);

  const token = await getAccessToken(serviceAccount);
  console.log(`Token acquired. Checking ${URLS_TO_CHECK.length} URLs...\n`);

  const results = [];
  for (let i = 0; i < URLS_TO_CHECK.length; i++) {
    const url = URLS_TO_CHECK[i];
    process.stdout.write(`[${i + 1}/${URLS_TO_CHECK.length}] ${url.replace("https://www.vosthermos.com", "")}... `);
    const r = await inspectUrl(token, url);
    results.push(r);
    if (r.error) {
      console.log(`ERROR: ${r.error}`);
    } else {
      const icon = r.verdict === "PASS" ? "✓" : r.verdict === "NEUTRAL" ? "~" : "✗";
      console.log(`${icon} ${r.verdict} | ${r.coverageState}`);
    }
    // Rate limit: 600/min max
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n===== SUMMARY =====");
  const passed = results.filter((r) => r.verdict === "PASS").length;
  const neutral = results.filter((r) => r.verdict === "NEUTRAL").length;
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const errors = results.filter((r) => r.error).length;

  console.log(`✓ PASS (indexed): ${passed}/${results.length}`);
  console.log(`~ NEUTRAL: ${neutral}`);
  console.log(`✗ FAIL: ${failed}`);
  console.log(`! ERRORS: ${errors}\n`);

  // Detail non-passing
  const issues = results.filter((r) => !r.error && r.verdict !== "PASS");
  if (issues.length > 0) {
    console.log("===== PAGES WITH ISSUES =====");
    for (const r of issues) {
      console.log(`\n${r.url}`);
      console.log(`  Verdict: ${r.verdict}`);
      console.log(`  Coverage: ${r.coverageState}`);
      console.log(`  Indexing: ${r.indexingState}`);
      if (r.googleCanonical && r.googleCanonical !== r.url) {
        console.log(`  Google canonical: ${r.googleCanonical}`);
      }
      if (r.userCanonical && r.userCanonical !== r.url) {
        console.log(`  User canonical: ${r.userCanonical}`);
      }
    }
  }

  if (errors > 0) {
    console.log("\n===== ERRORS =====");
    for (const r of results.filter((r) => r.error)) {
      console.log(`${r.url}: ${r.error}`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
