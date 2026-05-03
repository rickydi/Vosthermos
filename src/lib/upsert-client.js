import prisma from "@/lib/prisma";
import { createOrTouchFollowUpFromLead } from "@/lib/follow-up-utils";

function normalizePhoneDigits(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? digits : null;
}

function normalizeEmail(email) {
  if (!email) return null;
  const trimmed = String(email).trim().toLowerCase();
  return trimmed || null;
}

function pickFilled(existingValue, newValue) {
  if (newValue === undefined || newValue === null) return existingValue;
  const trimmed = typeof newValue === "string" ? newValue.trim() : newValue;
  if (trimmed === "" || trimmed === null) return existingValue;
  return existingValue && String(existingValue).trim() ? existingValue : trimmed;
}

async function tryCreateFollowUpFromLead(args) {
  try {
    await createOrTouchFollowUpFromLead(args);
  } catch (err) {
    console.error("[upsertClientFromLead] follow-up error:", err?.message || err);
  }
}

export async function upsertClientFromLead({
  name,
  phone,
  email,
  company,
  address,
  city,
  province,
  postalCode,
  notes,
  source,
  service,
} = {}) {
  try {
    const cleanName = name?.trim() || null;
    const cleanEmail = normalizeEmail(email);
    const phoneDigits = normalizePhoneDigits(phone);
    const cleanPhone = phoneDigits ? `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}` : null;

    if (!cleanName && !cleanEmail && !cleanPhone) return null;

    let existing = null;
    if (cleanEmail) {
      existing = await prisma.client.findUnique({ where: { email: cleanEmail } });
    }
    if (!existing && phoneDigits) {
      existing = await prisma.client.findFirst({
        where: {
          OR: [
            { phone: { contains: phoneDigits.slice(-7) } },
            { secondaryPhone: { contains: phoneDigits.slice(-7) } },
          ],
        },
      });
    }

    const sourceNote = source ? `[auto: ${source} ${new Date().toISOString().slice(0, 10)}]` : null;

    if (existing) {
      const mergedNotes = (() => {
        if (!notes && !sourceNote) return existing.notes;
        const parts = [existing.notes, sourceNote, notes].filter(Boolean);
        const joined = parts.join("\n");
        if (existing.notes && joined.includes(existing.notes)) return joined;
        return joined || existing.notes;
      })();

      const existingPhoneDigits = normalizePhoneDigits(existing.phone);
      const existingSecondaryDigits = normalizePhoneDigits(existing.secondaryPhone);
      const shouldStoreSecondaryPhone =
        cleanPhone &&
        existing.phone &&
        existingPhoneDigits !== phoneDigits &&
        existingSecondaryDigits !== phoneDigits;

      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: {
          name: pickFilled(existing.name, cleanName) || existing.name,
          email: existing.email || cleanEmail,
          phone: pickFilled(existing.phone, cleanPhone),
          secondaryPhone: shouldStoreSecondaryPhone
            ? pickFilled(existing.secondaryPhone, cleanPhone)
            : existing.secondaryPhone,
          company: pickFilled(existing.company, company),
          address: pickFilled(existing.address, address),
          city: pickFilled(existing.city, city),
          province: existing.province || province || "QC",
          postalCode: pickFilled(existing.postalCode, postalCode),
          notes: mergedNotes,
        },
      });
      await tryCreateFollowUpFromLead({ client: updated, source, notes, service });
      return updated;
    }

    const created = await prisma.client.create({
      data: {
        name: cleanName || "Sans nom",
        email: cleanEmail,
        phone: cleanPhone,
        company: company?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        province: province?.trim() || "QC",
        postalCode: postalCode?.trim() || null,
        notes: [sourceNote, notes].filter(Boolean).join("\n") || null,
      },
    });
    await tryCreateFollowUpFromLead({ client: created, source, notes, service });
    return created;
  } catch (err) {
    console.error("[upsertClientFromLead] error:", err?.message || err);
    return null;
  }
}
