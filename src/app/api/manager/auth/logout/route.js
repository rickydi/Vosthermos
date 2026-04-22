import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MANAGER_COOKIE, destroySession } from "@/lib/manager-auth";

export async function POST() {
  const store = await cookies();
  const token = store.get(MANAGER_COOKIE)?.value;
  await destroySession(token);
  store.delete(MANAGER_COOKIE);
  return NextResponse.json({ ok: true });
}
