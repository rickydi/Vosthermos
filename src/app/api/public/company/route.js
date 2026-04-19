// Public endpoint: exposes company NAP from DB settings.
// Safe to call from client components (no auth required).
// Used to keep phone/address/email in sync with admin changes.

import { NextResponse } from "next/server";
import { getCompany } from "@/lib/company";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min cache hint for clients

export async function GET() {
  try {
    const company = await getCompany();
    // Strip any sensitive / internal fields
    const safe = {
      legalName: company.legalName,
      phone: company.phone,
      phoneTel: company.phoneTel,
      email: company.email,
      address: company.address,
      city: company.city,
      cityShort: company.city,
      province: company.province,
      postalCode: company.postalCode,
      web: company.web,
      url: company.url,
      logo: company.logo,
      facebook: company.facebook,
      instagram: company.instagram,
    };
    return NextResponse.json(safe, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to load company" }, { status: 500 });
  }
}
