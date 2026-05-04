import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];

  // Canonical host for SEO: avoid serving duplicate content on vosthermos.com and www.vosthermos.com.
  if (host === "vosthermos.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "www.vosthermos.com";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/suivi-clients";
    return NextResponse.redirect(url);
  }

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("vosthermos-admin-token")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
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
