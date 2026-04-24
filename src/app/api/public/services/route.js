import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services-data";
import { CITIES } from "@/lib/cities";
import { COMPANY_INFO } from "@/lib/company-info";

export async function GET() {
  const data = {
    business: {
      name: "Vosthermos",
      legalName: "Vosthermos",
      description: "Experts quebecois en reparation et restauration de portes et fenetres depuis 2010. Remplacement de vitres thermos, quincaillerie, portes-patio, portes-fenetres, portes en bois, moustiquaires et plus.",
      url: "https://www.vosthermos.com",
      telephone: "+15148258411",
      email: COMPANY_INFO.email,
      foundingDate: "2010",
      yearsOfExperience: 15,
      address: {
        streetAddress: COMPANY_INFO.address,
        addressLocality: COMPANY_INFO.city,
        addressRegion: "QC",
        postalCode: COMPANY_INFO.postalCode,
        addressCountry: "CA",
      },
      openingHours: {
        weekdays: "08:00-17:00",
        saturday: "closed",
        sunday: "closed",
      },
      priceRange: "$$",
      currenciesAccepted: "CAD",
      warranty: {
        thermos: "10 years transferable",
        labor: "5 years",
      },
      languages: ["fr-CA", "en-CA"],
      social: {
        facebook: "https://www.facebook.com/profile.php?id=61562303553558",
        instagram: "https://instagram.com/vosthermos/",
      },
    },
    services: SERVICES.map((s) => ({
      slug: s.slug,
      title: s.title,
      shortTitle: s.shortTitle,
      url: `https://www.vosthermos.com/services/${s.slug}`,
      description: s.heroDescription,
      startingPrice: s.startingPrice,
      whatWeRepair: s.whatWeRepair || [],
      faq: (s.faq || []).map((f) => ({ question: f.question, answer: f.answer })),
      cityUrls: CITIES.slice(0, 10).map((c) => ({
        city: c.name,
        url: `https://www.vosthermos.com/services/${s.slug}/${c.slug}`,
      })),
    })),
    serviceArea: {
      cities: CITIES.map((c) => c.name),
      count: CITIES.length,
      radius_km: 100,
      center: `${COMPANY_INFO.city}, ${COMPANY_INFO.province}`,
    },
    brands: [
      "Novatech", "Lepage Millwork", "Fenplast", "Jeld-Wen", "Kohltech",
      "Verreault", "Les Industries Bonneville", "Vinyltech", "Polarwin",
    ],
    updated: new Date().toISOString(),
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
