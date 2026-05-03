import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ACTION_LABELS = {
  login: "Connexion",
  logout: "Deconnexion",
  create: "Creation",
  update: "Modification",
  delete: "Suppression",
  send: "Envoi",
  archive: "Archivage",
  unarchive: "Desarchivage",
};

const ENTITY_LABELS = {
  auth: "Session",
  admin_user: "Utilisateur",
  client: "Client",
  follow_up: "Suivi client",
  work_order: "Bon de travail",
  appointment: "Rendez-vous",
  chat: "Chat",
  client_photo: "Photo client",
};

const ENTITY_ICONS = {
  auth: "fa-user-shield",
  admin_user: "fa-user-cog",
  client: "fa-address-book",
  follow_up: "fa-list-check",
  work_order: "fa-clipboard-list",
  appointment: "fa-calendar-check",
  chat: "fa-comments",
  client_photo: "fa-image",
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(value);
}

function activityHref(activity) {
  if (!activity.entityId) return null;
  if (activity.entityType === "client") return `/admin/clients/${activity.entityId}`;
  if (activity.entityType === "work_order") return `/admin/bons/${activity.entityId}`;
  if (activity.entityType === "chat") return `/admin/chat/${activity.entityId}`;
  if (activity.entityType === "follow_up") return "/admin/suivi-clients";
  if (activity.entityType === "appointment") return "/admin/rendez-vous";
  if (activity.entityType === "admin_user") return "/admin/utilisateurs";
  return null;
}

function detailText(metadata) {
  if (!metadata || typeof metadata !== "object") return null;
  if (Array.isArray(metadata.changedFields) && metadata.changedFields.length) {
    return `Champs modifies: ${metadata.changedFields.join(", ")}`;
  }
  if (metadata.statusFrom && metadata.statusTo) {
    return `Statut: ${metadata.statusFrom} -> ${metadata.statusTo}`;
  }
  if (metadata.email) return metadata.email;
  if (metadata.number) return metadata.number;
  return null;
}

export default async function AdminActivityPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const userId = params?.userId || "";
  const entityType = params?.entityType || "";
  const action = params?.action || "";

  const where = {
    ...(userId ? { adminUserId: Number(userId) } : {}),
    ...(entityType ? { entityType } : {}),
    ...(action ? { action } : {}),
  };

  const [activities, users] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      include: { adminUser: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.adminUser.findMany({
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Activite admin</h1>
          <p className="admin-text-muted text-sm mt-1">
            Journal des connexions et des changements faits par les utilisateurs admin.
          </p>
        </div>
        <Link href="/admin/utilisateurs" className="admin-card admin-hover border rounded-lg px-4 py-2 text-sm admin-text font-semibold">
          <i className="fas fa-users mr-2"></i>Utilisateurs
        </Link>
      </div>

      <form className="admin-card border rounded-xl p-4 mb-5 grid md:grid-cols-4 gap-3">
        <select name="userId" defaultValue={userId} className="admin-input border rounded-lg px-3 py-2.5 text-sm">
          <option value="">Tous les utilisateurs</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
        <select name="entityType" defaultValue={entityType} className="admin-input border rounded-lg px-3 py-2.5 text-sm">
          <option value="">Tous les modules</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="action" defaultValue={action} className="admin-input border rounded-lg px-3 py-2.5 text-sm">
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg px-4 py-2.5 text-sm font-bold">
          Filtrer
        </button>
      </form>

      <div className="admin-card border rounded-xl overflow-hidden">
        {activities.length === 0 ? (
          <div className="text-center admin-text-muted py-12">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p>Aucune activite</p>
          </div>
        ) : (
          <div className="divide-y admin-border">
            {activities.map((activity) => {
              const href = activityHref(activity);
              const content = (
                <div className="p-4 flex items-start gap-4 admin-hover">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0">
                    <i className={`fas ${ENTITY_ICONS[activity.entityType] || "fa-history"} text-sm`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="admin-text font-bold text-sm">{ACTION_LABELS[activity.action] || activity.action}</span>
                      <span className="admin-text-muted text-xs">|</span>
                      <span className="admin-text-muted text-sm">{ENTITY_LABELS[activity.entityType] || activity.entityType}</span>
                    </div>
                    <p className="admin-text text-sm truncate">{activity.label || "Action admin"}</p>
                    {detailText(activity.metadata) && (
                      <p className="admin-text-muted text-xs mt-1 truncate">{detailText(activity.metadata)}</p>
                    )}
                    <div className="admin-text-muted text-xs mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      <span><i className="fas fa-user mr-1"></i>{activity.adminUser?.email || activity.adminEmail || "Utilisateur supprime"}</span>
                      <span><i className="fas fa-clock mr-1"></i>{formatDate(activity.createdAt)}</span>
                      {activity.ipAddress && <span><i className="fas fa-location-dot mr-1"></i>{activity.ipAddress}</span>}
                    </div>
                  </div>
                  {href && <i className="fas fa-chevron-right admin-text-muted mt-3"></i>}
                </div>
              );
              return href ? (
                <Link key={activity.id} href={href} className="block">{content}</Link>
              ) : (
                <div key={activity.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
