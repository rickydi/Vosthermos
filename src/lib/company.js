// SERVER-ONLY: reads company settings from DB.
// For client-safe constant, use @/lib/company-info instead.

import prisma from "./prisma";
import { COMPANY_INFO } from "./company-info";

export { COMPANY_INFO };

// Alias for backward compat; merged with DB values by getCompany().
export const DEFAULT_COMPANY = {
  legalName: COMPANY_INFO.legalName || "Vosthermos",
  neq: "",
  address: COMPANY_INFO.address,
  city: COMPANY_INFO.city,
  province: COMPANY_INFO.province,
  postalCode: COMPANY_INFO.postalCode,
  phone: COMPANY_INFO.phone,
  phoneTel: COMPANY_INFO.phoneTel, // canonical format for tel: links + schema.org
  email: COMPANY_INFO.email,
  web: COMPANY_INFO.web,
  url: COMPANY_INFO.url,
  tpsNumber: "",
  tvqNumber: "",
  rbqNumber: COMPANY_INFO.rbqNumber,
  // Static / brand:
  logo: COMPANY_INFO.logo,
  facebook: COMPANY_INFO.facebook,
  instagram: COMPANY_INFO.instagram,
};

const KEY_MAP = {
  company_legal_name: "legalName",
  company_neq: "neq",
  company_address: "address",
  company_city: "city",
  company_province: "province",
  company_postal_code: "postalCode",
  company_phone: "phone",
  company_email: "email",
  company_web: "web",
  tps_number: "tpsNumber",
  tvq_number: "tvqNumber",
  rbq_number: "rbqNumber",
};

// Convert a Quebec phone like "514-825-8411" to canonical tel/schema format.
function toTelFormat(phone) {
  if (!phone) return DEFAULT_COMPANY.phoneTel;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone; // fallback unchanged
}

/**
 * Read company settings from DB and merge with defaults.
 * Call from server components / API routes (not client components).
 * Returns merged object (always has all fields).
 */
export async function getCompany() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT key, value FROM site_settings WHERE key = ANY($1)`,
      Object.keys(KEY_MAP),
    );
    const result = { ...DEFAULT_COMPANY };
    for (const row of rows) {
      const k = KEY_MAP[row.key];
      if (k && row.value) result[k] = row.value;
    }
    result.phoneTel = toTelFormat(result.phone);
    return result;
  } catch {
    return DEFAULT_COMPANY;
  }
}
