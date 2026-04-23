import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import GestionnairesList from "./GestionnairesList";

export const dynamic = "force-dynamic";

export default async function AdminGestionnairesPage() {
  await requireAdmin();

  const [managers, clients] = await Promise.all([
    prisma.managerUser.findMany({
      include: {
        clients: { include: { client: { select: { id: true, name: true, city: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { type: "gestionnaire" },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = managers.map((m) => ({
    id: m.id,
    email: m.email,
    firstName: m.firstName,
    lastName: m.lastName,
    phone: m.phone,
    isActive: m.isActive,
    lastLoginAt: m.lastLoginAt?.toISOString() || null,
    createdAt: m.createdAt.toISOString(),
    clients: m.clients.map((mc) => ({
      clientId: mc.clientId,
      clientName: mc.client.name,
      clientCity: mc.client.city,
      permissions: mc.permissions,
    })),
  }));

  return <GestionnairesList initialManagers={serialized} clients={clients} />;
}
