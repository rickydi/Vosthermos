import prisma from "@/lib/prisma";

export async function POST(_req, { params }) {
  try {
    const { id } = await params;
    await prisma.chatConversation.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("ok", { status: 200 });
  }
}
