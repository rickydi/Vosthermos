import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeMagicToken, createSession, MANAGER_COOKIE, SESSION_DAYS } from "@/lib/manager-auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/gestionnaire/login?error=missing", req.url));
  }

  const { manager, error } = await consumeMagicToken(token);
  if (error) {
    return NextResponse.redirect(new URL(`/gestionnaire/login?error=${encodeURIComponent(error)}`, req.url));
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

  return NextResponse.redirect(new URL("/gestionnaire", req.url));
}
