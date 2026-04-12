import prisma from "@/lib/prisma";

export async function POST(_req, { params }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(
      `UPDATE chat_conversations SET "lastSeenAt" = NOW() WHERE id = $1`,
      id
    );
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("ok", { status: 200 });
  }
}
