import { NextResponse } from "next/server";

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
  matcher: ["/admin/:path*", "/terrain/:path*"],
};
