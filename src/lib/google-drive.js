import fs from "fs";
import path from "path";
import { Readable } from "stream";
import prisma from "@/lib/prisma";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function clean(value) {
  return String(value || "").trim();
}

function decodeJsonEnv(value) {
  const text = clean(value);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  try {
    return JSON.parse(Buffer.from(text, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function candidateKeyPaths() {
  return [
    process.env.GOOGLE_DRIVE_SA_KEY_PATH,
    process.env.GOOGLE_SA_KEY_PATH,
    process.env.GMAIL_API_SERVICE_ACCOUNT_KEY_PATH,
    path.join(process.cwd(), "config", "google-drive-service-account.json"),
    path.join(process.cwd(), "config", "gmail-service-account.json"),
  ].map(clean).filter(Boolean);
}

function loadServiceAccountKey() {
  const envKey = decodeJsonEnv(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON);
  if (envKey?.client_email && envKey?.private_key) return envKey;

  for (const keyPath of candidateKeyPaths()) {
    if (!fs.existsSync(keyPath)) continue;
    const parsed = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    if (parsed?.client_email && parsed?.private_key) return parsed;
  }

  throw new Error("Cle Google Drive service account introuvable");
}

async function getDriveClient() {
  const { google } = await import("googleapis");
  const key = loadServiceAccountKey();
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: DRIVE_SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

export async function getReportDriveFolderId() {
  const row = await prisma.siteSetting.findUnique({ where: { key: "drive_report_folder_id" } });
  const value = clean(row?.value);
  return value || null;
}

export async function getReportDriveConfigStatus() {
  const folderId = await getReportDriveFolderId();
  let serviceAccountEmail = null;
  let keyConfigured = false;

  try {
    const key = loadServiceAccountKey();
    serviceAccountEmail = key.client_email || null;
    keyConfigured = Boolean(key.client_email && key.private_key);
  } catch {}

  return {
    configured: Boolean(folderId && keyConfigured),
    folderId,
    keyConfigured,
    serviceAccountEmail,
  };
}

export async function uploadToDriveFolder(folderId, files) {
  const drive = await getDriveClient();
  const uploaded = [];

  for (const file of files) {
    const content = Buffer.isBuffer(file.content)
      ? file.content
      : Buffer.from(String(file.content || ""), "utf8");
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimeType,
        body: Readable.from(content),
      },
      fields: "id,name,webViewLink",
      supportsAllDrives: true,
    });
    uploaded.push({
      id: response.data.id || "",
      name: response.data.name || file.name,
      link: response.data.webViewLink || null,
    });
  }

  return uploaded;
}

export async function uploadMonthlyInvoiceReportToDrive(yearMonth, { pdfBuffer, csv }) {
  const folderId = await getReportDriveFolderId();
  if (!folderId) return { uploaded: false, skipped: "no_drive_folder" };

  const files = await uploadToDriveFolder(folderId, [
    {
      name: `rapport-factures-vosthermos-${yearMonth}.pdf`,
      mimeType: "application/pdf",
      content: pdfBuffer,
    },
    {
      name: `rapport-factures-vosthermos-${yearMonth}.csv`,
      mimeType: "text/csv",
      content: csv,
    },
  ]);

  return { uploaded: true, folderId, files };
}
