import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ManagerEdit from "./ManagerEdit";

export const dynamic = "force-dynamic";

export default async function ManagerEditPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const [manager, clients] = await Promise.all([
    prisma.managerUser.findUnique({
      where: { id: Number(id) },
      include: {
        clients: { include: { client: { select: { id: true, name: true, city: true, paymentTermsDays: true } } } },
        sessions: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
    prisma.client.findMany({
      where: { type: "gestionnaire" },
      select: { id: true, name: true, city: true, paymentTermsDays: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!manager) notFound();

  const serialized = {
    id: manager.id,
    email: manager.email,
    firstName: manager.firstName,
    lastName: manager.lastName,
    phone: manager.phone,
    isActive: manager.isActive,
    lastLoginAt: manager.lastLoginAt?.toISOString() || null,
    createdAt: manager.createdAt.toISOString(),
    clients: manager.clients.map((mc) => ({
      clientId: mc.clientId,
      clientName: mc.client.name,
      clientCity: mc.client.city,
      paymentTermsDays: mc.client.paymentTermsDays ?? 30,
      permissions: mc.permissions,
    })),
    sessions: manager.sessions.map((s) => ({
      token: s.token.slice(0, 8) + "...",
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      userAgent: s.userAgent,
      ip: s.ip,
    })),
  };

  return <ManagerEdit manager={serialized} allClients={clients} />;
}
