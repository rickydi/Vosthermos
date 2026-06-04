import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const GMAIL_TRANSPORT_VALUES = new Set(["gmail", "gmail-api"]);

let gmailClientPromise;

function clean(value) {
  return String(value || "").trim();
}

function enabled(value) {
  return TRUE_VALUES.has(clean(value).toLowerCase());
}

function normalizePrivateKey(value) {
  const raw = clean(value);
  if (!raw) return "";
  return raw.replace(/\\n/g, "\n");
}

function privateKeyFromEnv() {
  if (process.env.GMAIL_API_PRIVATE_KEY_BASE64) {
    return normalizePrivateKey(Buffer.from(process.env.GMAIL_API_PRIVATE_KEY_BASE64, "base64").toString("utf8"));
  }
  return normalizePrivateKey(process.env.GMAIL_API_PRIVATE_KEY);
}

function serviceAccountFromFile() {
  const file = clean(process.env.GMAIL_API_SERVICE_ACCOUNT_FILE);
  if (!file) return null;

  const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return {
    clientEmail: clean(process.env.GMAIL_API_SERVICE_ACCOUNT_EMAIL) || clean(json.client_email),
    privateKey: privateKeyFromEnv() || normalizePrivateKey(json.private_key),
  };
}

function getServiceAccountCredentials() {
  const fileCredentials = serviceAccountFromFile();
  if (fileCredentials) return fileCredentials;

  return {
    clientEmail: clean(process.env.GMAIL_API_SERVICE_ACCOUNT_EMAIL),
    privateKey: privateKeyFromEnv(),
  };
}

function hasOAuthCredentials() {
  return Boolean(
    clean(process.env.GMAIL_API_CLIENT_ID) &&
    clean(process.env.GMAIL_API_CLIENT_SECRET) &&
    clean(process.env.GMAIL_API_REFRESH_TOKEN)
  );
}

function getRequestedDriver() {
  return clean(process.env.MAIL_TRANSPORT || process.env.EMAIL_TRANSPORT).toLowerCase();
}

export function isGmailApiRequested() {
  return GMAIL_TRANSPORT_VALUES.has(getRequestedDriver()) || enabled(process.env.GMAIL_API_ENABLED);
}

export function getGmailApiConfigStatus() {
  const requested = isGmailApiRequested();
  if (!requested) {
    return { requested: false, configured: false, mode: null, missing: [] };
  }

  if (hasOAuthCredentials()) {
    return { requested: true, configured: true, mode: "oauth2", missing: [] };
  }

  let serviceCredentials = { clientEmail: "", privateKey: "" };
  let serviceFileError = "";
  try {
    serviceCredentials = getServiceAccountCredentials();
  } catch (err) {
    serviceFileError = err?.message || "lecture GMAIL_API_SERVICE_ACCOUNT_FILE";
  }

  if (serviceCredentials.clientEmail && serviceCredentials.privateKey && clean(process.env.GMAIL_API_USER)) {
    return { requested: true, configured: true, mode: "service-account", missing: [] };
  }

  const missing = [];
  if (serviceFileError) missing.push(`GMAIL_API_SERVICE_ACCOUNT_FILE lisible (${serviceFileError})`);
  if (!serviceCredentials.clientEmail) missing.push("GMAIL_API_SERVICE_ACCOUNT_EMAIL");
  if (!serviceCredentials.privateKey) missing.push("GMAIL_API_PRIVATE_KEY ou GMAIL_API_PRIVATE_KEY_BASE64");
  if (!clean(process.env.GMAIL_API_USER)) missing.push("GMAIL_API_USER");
  if (!hasOAuthCredentials()) {
    missing.push("ou GMAIL_API_CLIENT_ID + GMAIL_API_CLIENT_SECRET + GMAIL_API_REFRESH_TOKEN");
  }

  return { requested: true, configured: false, mode: null, missing };
}

function getGmailUserId(mode) {
  const configuredUser = clean(process.env.GMAIL_API_USER);
  if (configuredUser) return configuredUser;
  return mode === "oauth2" ? "me" : "";
}

async function createGmailClient() {
  if (hasOAuthCredentials()) {
    const auth = new google.auth.OAuth2(
      clean(process.env.GMAIL_API_CLIENT_ID),
      clean(process.env.GMAIL_API_CLIENT_SECRET),
    );
    auth.setCredentials({ refresh_token: clean(process.env.GMAIL_API_REFRESH_TOKEN) });
    return {
      gmail: google.gmail({ version: "v1", auth }),
      userId: getGmailUserId("oauth2"),
      mode: "oauth2",
    };
  }

  const { clientEmail, privateKey } = getServiceAccountCredentials();
  const subject = getGmailUserId("service-account");
  if (!clientEmail || !privateKey || !subject) {
    const status = getGmailApiConfigStatus();
    throw new Error(`Gmail API incomplet: ${status.missing.join(", ")}`);
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [GMAIL_SEND_SCOPE],
    subject,
  });

  return {
    gmail: google.gmail({ version: "v1", auth }),
    userId: subject,
    mode: "service-account",
  };
}

async function getGmailClient() {
  if (!gmailClientPromise) {
    gmailClientPromise = createGmailClient();
  }
  return gmailClientPromise;
}

function base64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function compileRawMessage(mailOptions) {
  const streamTransport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "unix",
  });

  const { envelope, ...messageOptions } = mailOptions || {};
  const info = await streamTransport.sendMail(messageOptions);
  const message = Buffer.isBuffer(info.message) ? info.message : Buffer.from(info.message);
  return base64Url(message);
}

function recipientList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => clean(item)).filter(Boolean);
  return clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function sendMailWithGmailApi(mailOptions) {
  const status = getGmailApiConfigStatus();
  if (!status.configured) {
    throw new Error(`Gmail API non configure: ${status.missing.join(", ")}`);
  }

  const raw = await compileRawMessage(mailOptions);
  const { gmail, userId, mode } = await getGmailClient();
  const response = await gmail.users.messages.send({
    userId,
    requestBody: { raw },
  });

  return {
    accepted: recipientList(mailOptions?.to),
    rejected: [],
    envelope: mailOptions?.envelope || null,
    messageId: response.data?.id || null,
    response: `gmail-api:${response.status}`,
    gmail: {
      id: response.data?.id || null,
      threadId: response.data?.threadId || null,
      userId,
      mode,
    },
  };
}

export { GMAIL_SEND_SCOPE };
