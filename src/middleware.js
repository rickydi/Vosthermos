import { NextResponse } from "next/server";

const DEFAULT_LOCALE = "fr";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("vosthermos-admin-token")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Determine locale from URL path prefix
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const locale = isEnglish ? "en" : DEFAULT_LOCALE;

  // Set locale cookie for server components
  const response = NextResponse.next();
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/en/:path*", "/"],
};
