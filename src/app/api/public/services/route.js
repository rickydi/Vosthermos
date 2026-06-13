import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services-data";
import { CITIES } from "@/lib/cities";
import { getCompany } from "@/lib/company";

export async function GET() {
  const company = await getCompany();
  const data = {
    business: {
      name: "Vosthermos",
      legalName: "Vosthermos",
      description: "Experts quebecois en reparation et restauration de portes et fenetres depuis 2010. Remplacement de vitres thermos, quincaillerie, portes-patio, portes-fenetres, portes en bois, moustiquaires et plus.",
      url: "https://www.vosthermos.com",
      telephone: company.phoneTel,
      email: company.email,
      foundingDate: "2010",
      yearsOfExperience: new Date().getFullYear() - 2010,
      address: {
        streetAddress: company.address,
        addressLocality: company.city,
        addressRegion: company.province,
        postalCode: company.postalCode,
        addressCountry: "CA",
      },
      openingHours: {
        weekdays: "08:00-17:00",
        saturday: "09:00-13:00",
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
      center: `${company.city}, ${company.province}`,
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
