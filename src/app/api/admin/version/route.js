import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Identifiant du build courant, lu une fois au demarrage du process. Apres un
// deploiement (pm2 reload), le process redemarre et relit le nouveau BUILD_ID.
// Sert au detecteur de version cote client pour reperer qu'une nouvelle version
// est en ligne et proposer un rechargement.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let BUILD_ID = "development";
try {
  BUILD_ID = readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim() || "development";
} catch {
  // .next/BUILD_ID absent (dev): on garde "development"
}

export async function GET() {
  return NextResponse.json({ buildId: BUILD_ID });
}
