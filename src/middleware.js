import { NextResponse } from "next/server";
import { verifyJwtAtEdge } from "@/lib/edge-jwt";

// Legacy 404 cleanup: d'anciennes URLs anglaises ont ete generees avec le slug
// FRANCAIS du service (ex: /en/services/desembuage) au lieu du slug anglais.
// Google les recrawle encore et tombe sur des 404. On redirige en 301 vers la
// bonne page pour recuperer le signal et arreter le gaspillage de budget crawl.
const EN_SERVICE_FR_TO_EN = {
  "remplacement-quincaillerie": "hardware-replacement",
  "remplacement-vitre-thermos": "sealed-glass-replacement",
  "reparation-portes-bois": "wooden-door-repair",
  "moustiquaires-sur-mesure": "custom-screen-doors",
  "calfeutrage": "caulking",
  "desembuage": "defogging",
  "insertion-porte": "door-insert",
  "coupe-froid": "weatherstripping",
};
// Services FR sans equivalent anglais -> rediriger vers la version francaise.
const FR_ONLY_SERVICES = new Set([
  "reparation-porte-patio",
  "reparation-porte-fenetre",
]);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];

  // Canonical host for SEO: avoid serving duplicate content on vosthermos.com and www.vosthermos.com.
  if (host === "vosthermos.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "www.vosthermos.com";
    return NextResponse.redirect(url, 308);
  }

  // 301 cleanup des anciennes URLs /en/services/{slug-FR}[/ville]
  if (pathname.startsWith("/en/services/")) {
    const parts = pathname.split("/").filter(Boolean); // ["en","services",slug,ville?]
    const slug = parts[2];
    const rest = parts.slice(3).join("/");
    const suffix = rest ? `/${rest}` : "";
    if (slug && EN_SERVICE_FR_TO_EN[slug]) {
      const url = request.nextUrl.clone();
      url.pathname = `/en/services/${EN_SERVICE_FR_TO_EN[slug]}${suffix}`;
      return NextResponse.redirect(url, 301);
    }
    if (slug && FR_ONLY_SERVICES.has(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = `/services/${slug}${suffix}`;
      return NextResponse.redirect(url, 301);
    }
  }

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/suivi-clients";
    return NextResponse.redirect(url);
  }

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("vosthermos-admin-token")?.value;
    const session = token ? await verifyJwtAtEdge(token) : null;
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search || ""}`);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("vosthermos-admin-token", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // Protect terrain routes (except login)
  if (pathname.startsWith("/terrain") && !pathname.startsWith("/terrain/login")) {
    const token = request.cookies.get("vosthermos-tech-token")?.value;
    if (!token) {
      const loginUrl = new URL("/terrain/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
