import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import prisma from "@/lib/prisma";
import { boundImageBuffer } from "@/lib/upload-photo";
import { callAnthropicAdmin } from "@/lib/anthropic-admin";
import {
  countMeasurementData,
  createEmptyMeasurementData,
  createEmptyWindow,
  measurementCompletenessErrors,
  normalizeMeasurementData,
} from "@/lib/thermos-layout";

export const MEASUREMENT_SOURCES = ["technician", "client", "phone"];
export const MEASUREMENT_STATUSES = ["draft", "requested", "in_progress", "received", "validated", "cancelled"];
export const MEASUREMENT_ACCURACIES = ["final", "client", "approximate"];
export const PUBLIC_MEASUREMENT_AI_LIMIT = 5;
export const PUBLIC_MEASUREMENT_LINK_DAYS = 14;

function withMeasurementSharpLock(fn) {
  const previous = globalThis.__vosthermosMeasurementSharpChain || Promise.resolve();
  const run = previous.then(fn, fn);
  globalThis.__vosthermosMeasurementSharpChain = run.then(() => {}, () => {});
  return run;
}

const measurementInclude = {
  client: {
    select: {
      id: true,
      name: true,
      type: true,
      company: true,
      contactName: true,
      address: true,
      city: true,
      province: true,
      postalCode: true,
      phone: true,
      secondaryPhone: true,
      email: true,
    },
  },
  followUp: {
    select: {
      id: true,
      title: true,
      status: true,
      service: true,
      contactName: true,
      phone: true,
      email: true,
    },
  },
  technician: { select: { id: true, name: true, email: true, phone: true } },
  workOrder: { select: { id: true, number: true, statut: true, date: true, total: true } },
  thermosOrders: {
    select: {
      id: true,
      number: true,
      status: true,
      revision: true,
      sentAt: true,
      expectedReadyAt: true,
      readyAt: true,
      receivedAt: true,
      createdAt: true,
      supplier: { select: { id: true, name: true } },
      _count: { select: { items: true } },
    },
    orderBy: [{ revision: "desc" }, { createdAt: "desc" }],
  },
};

function integerId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

export function resolveMeasurementClientName(client, followUp = null) {
  const isManager = client?.type === "gestionnaire";
  const currentName = isManager
    ? client?.contactName || client?.name
    : client?.name || client?.contactName;
  return cleanText(currentName || followUp?.contactName || followUp?.title, 160);
}

function safeSource(value) {
  return MEASUREMENT_SOURCES.includes(value) ? value : null;
}

function safeStatus(value) {
  return MEASUREMENT_STATUSES.includes(value) ? value : null;
}

function safeAccuracy(value) {
  return MEASUREMENT_ACCURACIES.includes(value) ? value : null;
}

export function defaultAccuracyForSource(source) {
  if (source === "technician") return "final";
  if (source === "client") return "client";
  return "approximate";
}

export function generatePublicMeasurementToken(measurementId, version = 1) {
  const id = integerId(measurementId);
  if (!id) return crypto.randomBytes(32).toString("base64url");
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "vosthermos-dev-measurement-secret");
  if (!secret) throw new Error("JWT_SECRET requis pour générer un lien de mesures");
  const safeVersion = Math.max(1, Number.parseInt(version, 10) || 1);
  return crypto.createHmac("sha256", `${secret}:thermos-measurement:v1`).update(`${id}:${safeVersion}`).digest("base64url");
}

export function hashPublicMeasurementToken(token) {
  return crypto.createHash("sha256").update(String(token || ""), "utf8").digest("hex");
}

export function publicMeasurementExpiry(from = new Date()) {
  return new Date(from.getTime() + PUBLIC_MEASUREMENT_LINK_DAYS * 24 * 60 * 60 * 1000);
}

export function publicMeasurementUrl(token) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com").replace(/\/$/, "");
  return `${siteUrl}/prendre-mesures/${token}`;
}

export function serializeMeasurementBundle(record, { publicView = false } = {}) {
  if (!record) return null;
  const {
    publicTokenHash: _publicTokenHash,
    publicTokenVersion: _publicTokenVersion,
    idempotencyKey: _idempotencyKey,
    client,
    followUp,
    technician,
    workOrder,
    thermosOrders,
    ...measurement
  } = record;
  const normalizedMeasurement = {
    ...measurement,
    data: normalizeMeasurementData(measurement.data),
  };

  if (publicView) {
    const {
      clientId: _clientId,
      followUpId: _followUpId,
      workOrderId: _workOrderId,
      technicianId: _technicianId,
      parentId: _parentId,
      publicTokenExpiresAt: _publicTokenExpiresAt,
      aiAnalysisCount: _aiAnalysisCount,
      ...publicMeasurement
    } = normalizedMeasurement;
    const displayName = resolveMeasurementClientName(client, followUp);
    return {
      measurement: { ...publicMeasurement, clientName: displayName },
      client: { displayName },
    };
  }

  return {
    measurement: {
      ...normalizedMeasurement,
      client: client || null,
      clientName: resolveMeasurementClientName(client, followUp),
    },
    client: client || null,
    followUp: followUp || null,
    technician: technician || null,
    workOrder: workOrder || null,
    orders: thermosOrders || [],
  };
}

export async function getMeasurementById(id) {
  const measurementId = integerId(id);
  if (!measurementId) return null;
  return prisma.thermosMeasurement.findUnique({
    where: { id: measurementId },
    include: measurementInclude,
  });
}

export async function getTechnicianMeasurement(id, technicianId) {
  const measurementId = integerId(id);
  const techId = integerId(technicianId);
  if (!measurementId || !techId) return null;
  return prisma.thermosMeasurement.findFirst({
    where: { id: measurementId, technicianId: techId },
    include: measurementInclude,
  });
}

export async function resolvePublicMeasurement(token) {
  const rawToken = String(token || "");
  if (rawToken.length < 32 || rawToken.length > 200 || !/^[A-Za-z0-9_-]+$/.test(rawToken)) return null;
  return prisma.thermosMeasurement.findFirst({
    where: {
      publicTokenHash: hashPublicMeasurementToken(rawToken),
      publicTokenExpiresAt: { gt: new Date() },
      status: { not: "cancelled" },
    },
    include: measurementInclude,
  });
}

async function validateRelations({ clientId, followUpId, workOrderId, technicianId }) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) throw Object.assign(new Error("Client introuvable"), { status: 404 });

  if (followUpId) {
    const followUp = await prisma.clientFollowUp.findFirst({
      where: { id: followUpId, clientId },
      select: { id: true },
    });
    if (!followUp) throw Object.assign(new Error("Le suivi n'appartient pas à ce client"), { status: 400 });
  }

  if (workOrderId) {
    const workOrder = await prisma.workOrder.findFirst({
      where: { id: workOrderId, clientId },
      select: { id: true },
    });
    if (!workOrder) throw Object.assign(new Error("La soumission n'appartient pas à ce client"), { status: 400 });
  }

  if (technicianId) {
    const technician = await prisma.technician.findFirst({
      where: { id: technicianId, isActive: true },
      select: { id: true },
    });
    if (!technician) throw Object.assign(new Error("Technicien introuvable ou inactif"), { status: 400 });
  }
}

export async function createMeasurement(input, { technicianIdOverride = null } = {}) {
  const clientId = integerId(input?.clientId);
  if (!clientId) throw Object.assign(new Error("Client requis"), { status: 400 });
  const source = safeSource(input?.source);
  if (!source) throw Object.assign(new Error("Type de mesure invalide"), { status: 400 });
  const idempotencyKey = cleanText(input?.idempotencyKey, 100) || null;
  if (idempotencyKey && !/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw Object.assign(new Error("Clé de création invalide"), { status: 400 });
  }
  const parentId = integerId(input?.parentId);
  if (parentId && source !== "technician") {
    throw Object.assign(new Error("Seule une fiche technicien peut reprendre une mesure précédente"), { status: 400 });
  }
  const parent = parentId ? await prisma.thermosMeasurement.findUnique({
    where: { id: parentId },
    select: { id: true, clientId: true, followUpId: true, workOrderId: true, revision: true, data: true },
  }) : null;
  if (parentId && (!parent || parent.clientId !== clientId)) {
    throw Object.assign(new Error("La mesure précédente n'appartient pas à ce client"), { status: 400 });
  }
  const followUpId = integerId(input?.followUpId) || parent?.followUpId || null;
  const workOrderId = integerId(input?.workOrderId) || parent?.workOrderId || null;
  const technicianId = integerId(technicianIdOverride || input?.technicianId);
  if (idempotencyKey) {
    const previous = await prisma.thermosMeasurement.findUnique({ where: { idempotencyKey }, include: measurementInclude });
    if (previous) {
      const sameRequest = previous.clientId === clientId
        && previous.source === source
        && previous.followUpId === followUpId
        && previous.parentId === (parent?.id || null)
        && previous.workOrderId === workOrderId
        && previous.technicianId === technicianId;
      if (!sameRequest) throw Object.assign(new Error("Cette clé de création appartient à une autre demande"), { status: 409 });
      return previous;
    }
  }
  await validateRelations({ clientId, followUpId, workOrderId, technicianId });

  const data = normalizeMeasurementData(input?.data || parent?.data || createEmptyMeasurementData());
  const { windowCount, paneCount } = countMeasurementData(data);
  const accuracy = safeAccuracy(input?.accuracy) || defaultAccuracyForSource(source);
  try {
    return await prisma.thermosMeasurement.create({
      data: {
        clientId,
        followUpId,
        workOrderId,
        technicianId,
        parentId: parent?.id || null,
        source,
        status: "draft",
        accuracy,
        revision: parent ? Math.max(1, Number(parent.revision) || 1) + 1 : 1,
        idempotencyKey,
        data,
        windowCount,
        paneCount,
      },
      include: measurementInclude,
    });
  } catch (error) {
    if (idempotencyKey && error?.code === "P2002") {
      const previous = await prisma.thermosMeasurement.findUnique({ where: { idempotencyKey }, include: measurementInclude });
      const sameRequest = previous
        && previous.clientId === clientId
        && previous.source === source
        && previous.followUpId === followUpId
        && previous.parentId === (parent?.id || null)
        && previous.workOrderId === workOrderId
        && previous.technicianId === technicianId;
      if (sameRequest) return previous;
      if (previous) throw Object.assign(new Error("Cette clé de création appartient à une autre demande"), { status: 409 });
    }
    throw error;
  }
}

export async function updateMeasurementRecord(existing, input, { actor = "admin" } = {}) {
  if (!existing?.id) throw Object.assign(new Error("Mesure introuvable"), { status: 404 });
  const update = {};

  if (Object.prototype.hasOwnProperty.call(input || {}, "data")) {
    const data = normalizeMeasurementData(input.data);
    const counts = countMeasurementData(data);
    update.data = data;
    update.windowCount = counts.windowCount;
    update.paneCount = counts.paneCount;
  }

  if (actor === "admin") {
    if (Object.prototype.hasOwnProperty.call(input || {}, "accuracy")) {
      const accuracy = safeAccuracy(input.accuracy);
      if (!accuracy) throw Object.assign(new Error("Précision invalide"), { status: 400 });
      update.accuracy = accuracy;
    }
    if (Object.prototype.hasOwnProperty.call(input || {}, "technicianId")) {
      const technicianId = input.technicianId ? integerId(input.technicianId) : null;
      if (input.technicianId && !technicianId) throw Object.assign(new Error("Technicien invalide"), { status: 400 });
      if (technicianId) {
        await validateRelations({ clientId: existing.clientId, technicianId });
      }
      update.technicianId = technicianId;
    }
    if (Object.prototype.hasOwnProperty.call(input || {}, "workOrderId")) {
      const workOrderId = input.workOrderId ? integerId(input.workOrderId) : null;
      if (input.workOrderId && !workOrderId) throw Object.assign(new Error("Soumission invalide"), { status: 400 });
      if (workOrderId) {
        await validateRelations({ clientId: existing.clientId, workOrderId });
      }
      update.workOrderId = workOrderId;
    }
  }

  if (actor === "technician") update.accuracy = "final";
  if (actor === "public") update.accuracy = "client";

  if (Object.prototype.hasOwnProperty.call(input || {}, "status")) {
    let status = safeStatus(input.status);
    if (!status) throw Object.assign(new Error("Statut invalide"), { status: 400 });
    // Une mesure client/téléphone reste une donnée de présoumission. Même si
    // l'admin clique « mesures reçues », elle ne devient jamais une mesure
    // finale commandable sans passage d'un technicien.
    if (actor === "admin" && status === "validated" && existing.source !== "technician") status = "received";
    if (actor === "public" && !["in_progress", "received"].includes(status)) {
      throw Object.assign(new Error("Statut non permis"), { status: 403 });
    }
    if (actor === "technician" && !["draft", "in_progress", "received", "validated"].includes(status)) {
      throw Object.assign(new Error("Statut non permis"), { status: 403 });
    }

    const nextData = update.data || normalizeMeasurementData(existing.data);
    if (status === "validated" && actor !== "public") {
      const errors = measurementCompletenessErrors(nextData);
      if (errors.length) {
        throw Object.assign(new Error("Mesures finales incomplètes"), { status: 400, details: errors });
      }
      update.validatedAt = new Date();
      update.receivedAt = existing.receivedAt || new Date();
      update.accuracy = "final";
    }
    if (status !== "validated") update.validatedAt = null;
    if (status === "requested") update.requestedAt = existing.requestedAt || new Date();
    if (status === "in_progress") update.startedAt = existing.startedAt || new Date();
    if (status === "received") {
      update.startedAt = existing.startedAt || new Date();
      update.receivedAt = existing.receivedAt || new Date();
    }
    update.status = status;
  } else if (update.data && existing.status === "validated") {
    // Toute correction des dimensions invalide l'approbation précédente tant
    // qu'un technicien n'a pas explicitement revalidé la fiche.
    update.status = "in_progress";
    update.validatedAt = null;
  }

  if (!Object.keys(update).length) return getMeasurementById(existing.id);
  return prisma.thermosMeasurement.update({
    where: { id: existing.id },
    data: update,
    include: measurementInclude,
  });
}

export async function issuePublicMeasurementLink(measurementId) {
  const id = integerId(measurementId);
  if (!id) throw Object.assign(new Error("ID invalide"), { status: 400 });
  const current = await prisma.thermosMeasurement.findUnique({
    where: { id },
    select: { id: true, status: true, requestedAt: true, publicTokenHash: true, publicTokenVersion: true, publicTokenExpiresAt: true },
  });
  if (!current) throw Object.assign(new Error("Mesure introuvable"), { status: 404 });
  const now = new Date();
  let version = Math.max(0, Number(current.publicTokenVersion) || 0);
  let token = version > 0 ? generatePublicMeasurementToken(id, version) : "";
  const currentTokenIsReusable = Boolean(
    token
    && current.publicTokenHash === hashPublicMeasurementToken(token)
    && current.publicTokenExpiresAt
    && new Date(current.publicTokenExpiresAt) > now,
  );
  if (!currentTokenIsReusable) {
    version += 1;
    token = generatePublicMeasurementToken(id, version);
  }
  const expiresAt = currentTokenIsReusable ? new Date(current.publicTokenExpiresAt) : publicMeasurementExpiry(now);
  const measurement = await prisma.thermosMeasurement.update({
    where: { id },
    data: {
      publicTokenHash: hashPublicMeasurementToken(token),
      publicTokenVersion: version,
      publicTokenExpiresAt: expiresAt,
      requestedAt: current.requestedAt || now,
      status: ["draft", "requested"].includes(current.status) ? "requested" : current.status,
    },
    include: measurementInclude,
  });
  return { measurement, token, url: publicMeasurementUrl(token), expiresAt };
}

export async function saveMeasurementPhoto(formData, measurement, source) {
  if (!measurement?.id || !measurement?.clientId) {
    throw Object.assign(new Error("Mesure introuvable"), { status: 404 });
  }
  const photo = formData.get("photo") || formData.get("file");
  if (!photo || typeof photo === "string") {
    throw Object.assign(new Error("Photo requise"), { status: 400 });
  }
  const rawExtension = cleanText(photo.name?.split(".").pop(), 10).toLowerCase();
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
  const acceptedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
  if (!acceptedTypes.has(photo.type) && !acceptedExtensions.has(rawExtension)) {
    throw Object.assign(new Error("Format non supporté — utilisez JPEG, PNG, WebP, GIF ou HEIC"), { status: 400 });
  }
  if (photo.size > 25 * 1024 * 1024) {
    throw Object.assign(new Error("Photo trop volumineuse (maximum 25 MB)"), { status: 400 });
  }

  const uploadRoot = path.join(process.cwd(), "public", "uploads", "measurements");
  await fs.mkdir(uploadRoot, { recursive: true });
  const original = Buffer.from(await photo.arrayBuffer());
  const fallbackExt = rawExtension || photo.type?.split("/")[1]?.replace("jpeg", "jpg") || "bin";
  let bounded;
  try {
    bounded = await boundImageBuffer(original, { fallbackExt });
  } catch (error) {
    throw Object.assign(new Error(error.message || "Photo invalide"), { status: 400 });
  }

  // Les API de vision et la plupart des navigateurs n'acceptent pas directement
  // HEIC. Si libvips sait le lire, on le convertit ici une seule fois en JPEG.
  if (!["jpg", "jpeg", "png", "webp", "gif"].includes(bounded.ext)) {
    try {
      bounded = {
        buffer: await withMeasurementSharpLock(() => sharp(bounded.buffer).rotate().jpeg({ quality: 86 }).toBuffer()),
        ext: "jpg",
      };
    } catch {
      throw Object.assign(new Error("Cette photo HEIC ne peut pas être lue. Choisissez JPEG dans les réglages de l'appareil photo."), { status: 400 });
    }
  }

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${bounded.ext === "jpeg" ? "jpg" : bounded.ext}`;
  await fs.writeFile(path.join(uploadRoot, filename), bounded.buffer);
  const photoUrl = `/uploads/measurements/${filename}`;
  const clientPhoto = await prisma.clientPhoto.create({
    data: {
      clientId: measurement.clientId,
      followUpId: measurement.followUpId || null,
      title: "Mesures de thermos",
      url: photoUrl,
      source: cleanText(source, 40) || "measurement",
    },
  });
  const currentData = normalizeMeasurementData(measurement.data);
  const requestedWindowId = cleanText(formData.get("windowId"), 100);
  let windows = [...currentData.windows];
  let targetIndex = windows.findIndex((windowValue) => windowValue.id === requestedWindowId);
  if (targetIndex < 0 && requestedWindowId && windows.length < 50) {
    windows.push(createEmptyWindow({
      id: requestedWindowId,
      number: windows.length + 1,
      label: `Fenêtre ${windows.length + 1}`,
      photoUrl,
    }));
    targetIndex = windows.length - 1;
  }
  if (targetIndex < 0) targetIndex = 0;
  windows = windows.map((windowValue, index) => (
    index === targetIndex ? { ...windowValue, photoUrl } : windowValue
  ));
  const updatedData = normalizeMeasurementData({ ...currentData, windows });
  targetIndex = Math.max(0, updatedData.windows.findIndex((windowValue) => windowValue.id === requestedWindowId));
  await prisma.thermosMeasurement.update({
    where: { id: measurement.id },
    data: { data: updatedData },
  });
  return { photoUrl, photo: clientPhoto, windowId: updatedData.windows[targetIndex]?.id || null };
}

function parseAiJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch {}
  }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1));
  throw new Error("Réponse d'analyse illisible");
}

function scaledGeometry(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  if (number >= 0 && number <= 1) return Math.round(number * 10000);
  if (number >= 0 && number <= 100) return Math.round(number * 100);
  return Math.round(number);
}

function cleanAiAnalysis(value) {
  const analysis = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawPanes = Array.isArray(analysis.panes)
    ? analysis.panes
    : Array.isArray(analysis.structuralPanes)
      ? analysis.structuralPanes
      : [];
  const panes = rawPanes.slice(0, 100).map((pane) => ({
    x: scaledGeometry(pane?.x, 0),
    y: scaledGeometry(pane?.y, 0),
    width: scaledGeometry(pane?.width, 10000),
    height: scaledGeometry(pane?.height, 10000),
    grille: {
      enabled: Boolean(pane?.grille?.vertical?.length || pane?.grille?.horizontal?.length),
      type: "decorative",
      vertical: (Array.isArray(pane?.grille?.vertical) ? pane.grille.vertical : []).map((line) => scaledGeometry(line, 5000)),
      horizontal: (Array.isArray(pane?.grille?.horizontal) ? pane.grille.horizontal : []).map((line) => scaledGeometry(line, 5000)),
      color: cleanText(pane?.grille?.color, 40),
      profile: cleanText(pane?.grille?.profile, 60),
    },
  }));
  if (!panes.length) throw new Error("Aucune division de fenêtre détectée");
  return {
    confidence: Math.min(1, Math.max(0, Number(analysis.confidence) || 0)),
    panes,
    warnings: (Array.isArray(analysis.warnings) ? analysis.warnings : []).map((item) => cleanText(item, 240)).filter(Boolean).slice(0, 8),
  };
}

async function localPhotoAsAnthropicSource(photoUrl) {
  const url = cleanText(photoUrl, 500);
  if (!url.startsWith("/uploads/measurements/")) {
    throw Object.assign(new Error("Photo de mesure invalide"), { status: 400 });
  }
  const relative = url.replace(/^\/+/, "").replace(/\\/g, "/");
  const publicRoot = path.resolve(process.cwd(), "public");
  const fullPath = path.resolve(publicRoot, relative);
  if (!fullPath.startsWith(`${publicRoot}${path.sep}`)) {
    throw Object.assign(new Error("Chemin de photo invalide"), { status: 400 });
  }
  const stats = await fs.stat(fullPath).catch(() => null);
  if (!stats?.isFile()) throw Object.assign(new Error("Photo introuvable"), { status: 404 });
  let buffer = await fs.readFile(fullPath);
  const extension = path.extname(fullPath).toLowerCase();
  let mediaType = extension === ".png"
    ? "image/png"
    : extension === ".webp"
      ? "image/webp"
      : extension === ".gif"
        ? "image/gif"
        : "image/jpeg";
  if (buffer.length > 8 * 1024 * 1024) {
    try {
      buffer = await withMeasurementSharpLock(() => sharp(buffer, { animated: false }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer());
      mediaType = "image/jpeg";
    } catch {
      throw Object.assign(new Error("Photo trop volumineuse pour l'analyse automatique"), { status: 400 });
    }
  }
  if (buffer.length > 8 * 1024 * 1024) {
    throw Object.assign(new Error("Photo trop volumineuse pour l'analyse automatique"), { status: 400 });
  }
  return { type: "base64", media_type: mediaType, data: buffer.toString("base64") };
}

export async function analyzeMeasurementPhoto({ measurement, photoUrl, windowId, publicRequest = false }) {
  if (!measurement?.id) throw Object.assign(new Error("Mesure introuvable"), { status: 404 });

  const currentData = normalizeMeasurementData(measurement.data);
  const requestedWindowIndex = currentData.windows.findIndex((windowValue) => windowValue.id === windowId);
  const targetIndex = requestedWindowIndex >= 0 ? requestedWindowIndex : 0;
  const resolvedPhotoUrl = cleanText(photoUrl, 500) || currentData.windows[targetIndex]?.photoUrl || "";

  const knownPhoto = await prisma.clientPhoto.findFirst({
    where: { clientId: measurement.clientId, url: resolvedPhotoUrl },
    select: { id: true },
  });
  if (!knownPhoto) {
    throw Object.assign(new Error("Cette photo n'appartient pas au dossier client"), { status: 403 });
  }

  if (publicRequest) {
    const claimed = await prisma.thermosMeasurement.updateMany({
      where: { id: measurement.id, aiAnalysisCount: { lt: PUBLIC_MEASUREMENT_AI_LIMIT } },
      data: { aiAnalysisCount: { increment: 1 } },
    });
    if (!claimed.count) {
      throw Object.assign(new Error("Limite d'analyses automatiques atteinte. Vous pouvez corriger le dessin manuellement."), { status: 429 });
    }
  }

  try {
    const source = await localPhotoAsAnthropicSource(resolvedPhotoUrl);
    const ai = await callAnthropicAdmin({
      maxTokens: 1400,
      system: `Tu analyses une photo prise de face d'une fenêtre pour préparer un dessin de thermos.
Réponds uniquement avec un objet JSON valide, sans markdown.
Sépare strictement:
- les divisions STRUCTURELLES (cadres/meneaux qui créent des thermos physiques séparés), dans panes;
- les croisillons/grilles DÉCORATIFS à l'intérieur d'un même thermos, dans pane.grille.
Les coordonnées x, y, width, height sont normalisées de 0 à 10000 dans le rectangle extérieur de la fenêtre.
Les positions de grille sont normalisées de 0 à 10000 dans leur thermos.
N'invente jamais de dimensions réelles: la photo ne permet pas de mesurer des pouces.
Format: {"confidence":0.0,"panes":[{"x":0,"y":0,"width":10000,"height":10000,"grille":{"vertical":[],"horizontal":[],"color":"","profile":""}}],"warnings":[]}.`,
      messages: [{
        role: "user",
        content: [
          { type: "image", source },
          { type: "text", text: "Détecte le contour, les thermos physiques et les grilles décoratives visibles. Le dessin doit rester corrigible manuellement." },
        ],
      }],
    });
    const text = ai.data.content?.find((block) => block.type === "text")?.text || "";
    const analysis = cleanAiAnalysis(parseAiJson(text));
    const data = currentData;
    const existingWindow = data.windows[targetIndex] || data.windows[0];
    const suggestedWindow = {
      ...existingWindow,
      photoUrl: resolvedPhotoUrl,
      panes: analysis.panes.map((pane) => ({
        ...pane,
        widthSixteenths: null,
        heightSixteenths: null,
        thicknessSixteenths: null,
        options: {},
      })),
    };
    const windows = [...data.windows];
    windows[targetIndex] = suggestedWindow;
    const suggestedData = normalizeMeasurementData({ ...data, windows });

    if (!publicRequest) {
      await prisma.thermosMeasurement.update({
        where: { id: measurement.id },
        data: { aiAnalysisCount: { increment: 1 } },
      });
    }
    return {
      analysis: { confidence: analysis.confidence, warnings: analysis.warnings },
      suggestedWindow: suggestedData.windows[targetIndex],
      data: suggestedData,
      analysisCost: ai.analysisCost,
    };
  } catch (error) {
    if (publicRequest) {
      await prisma.thermosMeasurement.update({
        where: { id: measurement.id },
        data: { aiAnalysisCount: { decrement: 1 } },
      }).catch(() => {});
    }
    throw error;
  }
}

export function measurementErrorResponse(error) {
  return {
    message: error?.message || "Erreur serveur",
    status: Number(error?.status) || 500,
    details: Array.isArray(error?.details) ? error.details : undefined,
  };
}

export { integerId as parseMeasurementId, measurementInclude };
