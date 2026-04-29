import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeMagicToken, createSession, MANAGER_COOKIE } from "@/lib/manager-auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

function redirectTo(path) {
  return NextResponse.redirect(new URL(path, SITE_URL));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return redirectTo("/gestionnaire/login?error=missing");
  }

  const { manager, error } = await consumeMagicToken(token);
  if (error) {
    return redirectTo(`/gestionnaire/login?error=${encodeURIComponent(error)}`);
  }

  const { token: sessionToken, expiresAt } = await createSession(manager.id, req);
  const store = await cookies();
  store.set(MANAGER_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return redirectTo("/gestionnaire");
}
