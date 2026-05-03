import prisma from "@/lib/prisma";

function clientIp(req) {
  if (!req?.headers?.get) return null;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

function userAgent(req) {
  return req?.headers?.get?.("user-agent") || null;
}

function cleanMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return metadata || null;
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  );
}

export async function logAdminActivity(req, session, {
  action,
  entityType,
  entityId,
  label,
  metadata,
} = {}) {
  if (!action || !entityType) return null;

  try {
    return await prisma.adminActivityLog.create({
      data: {
        adminUserId: session?.id ? Number(session.id) : null,
        adminEmail: session?.email || null,
        action,
        entityType,
        entityId: entityId === undefined || entityId === null ? null : String(entityId),
        label: label || null,
        metadata: cleanMetadata(metadata),
        ipAddress: clientIp(req),
        userAgent: userAgent(req),
      },
    });
  } catch (err) {
    console.error("[admin activity] log error:", err?.message || err);
    return null;
  }
}

export function changedFields(before = {}, after = {}, fields = []) {
  return fields.filter((field) => before?.[field] !== after?.[field]);
}
