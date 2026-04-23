import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDetail from "./ClientDetail";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: {
      buildings: {
        orderBy: { position: "asc" },
        include: { _count: { select: { units: true } } },
      },
      units: {
        where: { isActive: true },
        include: {
          openings: { orderBy: { position: "asc" } },
        },
        orderBy: [{ buildingId: "asc" }, { code: "asc" }],
      },
      managers: { include: { manager: { select: { id: true, firstName: true, lastName: true, email: true } } } },
    },
  });

  if (!client) notFound();

  return <ClientDetail client={JSON.parse(JSON.stringify(client))} />;
}
