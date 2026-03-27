import { NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

export async function POST(request) {
  const { locale } = await request.json();
  const validLocale = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const response = NextResponse.json({ locale: validLocale });
  response.cookies.set("locale", validLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
