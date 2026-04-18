// SERVER-ONLY: reads company settings from DB.
// For client-safe constant, use @/lib/company-info instead.

import prisma from "./prisma";
import { COMPANY_INFO } from "./company-info";

export { COMPANY_INFO };

// Alias for backward compat; merged with DB values by getCompany().
export const DEFAULT_COMPANY = {
  legalName: "Vosthermos",
  neq: "",
  address: "330 Ch. St-Francois-Xavier, Local 101",
  city: "Saint-Francois-Xavier-de-Brompton",
  province: "QC",
  postalCode: "J0H 1S0",
  phone: "514-825-8411",
  phoneTel: "+15148258411", // canonical format for tel: links + schema.org
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  url: "https://www.vosthermos.com",
  tpsNumber: "",
  tvqNumber: "",
  // Static / brand:
  logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  facebook: "https://www.facebook.com/profile.php?id=61562303553558",
  instagram: "https://instagram.com/vosthermos/",
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
};

// Convert a Quebec phone "514-825-8411" -> "+15148258411"
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
