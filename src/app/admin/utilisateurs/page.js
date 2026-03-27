import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import UserList from "@/components/admin/UserList";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true },
    orderBy: { id: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <UserList users={users} />
    </div>
  );
}
