// Client-safe constant with default company NAP.
// No prisma import — can be imported from client components, page metadata, etc.
// Update here to change site-wide hardcoded fallbacks.
// For live DB values (settings), use getCompany() from @/lib/company in server components only.

export const COMPANY_INFO = {
  legalName: "Vosthermos",
  neq: "",
  address: "330 Ch. St-Francois-Xavier, Local 104",
  city: "Saint-Francois-Xavier-de-Brompton",
  cityShort: "Saint-Francois-Xavier",
  province: "QC",
  postalCode: "J5B 1C9",
  phone: "514-825-8411",
  phoneTel: "+15148258411",
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  url: "https://www.vosthermos.com",
  facebook: "https://www.facebook.com/profile.php?id=61562303553558",
  instagram: "https://instagram.com/vosthermos/",
  logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
};
