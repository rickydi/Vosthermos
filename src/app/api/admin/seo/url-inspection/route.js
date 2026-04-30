import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";

async function getAuthClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("Fichier config/google-service-account.json introuvable");
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  return auth.getClient();
}

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://www.vosthermos.com${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export async function POST(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  let body = {};
  try { body = await request.json(); } catch {}

  const inspectionUrl = normalizeUrl(body.url);
  if (!inspectionUrl) {
    return NextResponse.json({ error: "URL requise" }, { status: 400 });
  }

  try {
    const authClient = await getAuthClient();
    const response = await authClient.request({
      url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      method: "POST",
      data: {
        inspectionUrl,
        siteUrl: SITE_URL,
        languageCode: "fr-CA",
      },
    });

    return NextResponse.json({
      source: "google-url-inspection-api",
      inspectedUrl: inspectionUrl,
      siteUrl: SITE_URL,
      result: response.data?.inspectionResult || null,
    });
  } catch (err) {
    const message = err.response?.data?.error?.message || err.message || "Erreur inspection URL";
    console.error("URL inspection error:", message);
    return NextResponse.json({ error: message }, { status: err.response?.status || 500 });
  }
}
