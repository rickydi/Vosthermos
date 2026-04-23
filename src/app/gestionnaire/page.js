import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, canAccessClient, hasPermission } from "@/lib/manager-auth";
import GestionnaireDashboard from "./GestionnaireDashboard";

export const dynamic = "force-dynamic";

export default async function GestionnairePage({ searchParams }) {
  const sp = await searchParams;
  const manager = await getManagerFromCookie();
  if (!manager) redirect("/gestionnaire/login");

  if (!manager.clients || manager.clients.length === 0) {
    return (
      <div className="gm-root">
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", marginBottom: "12px" }}>Aucune copropriété associée</h1>
          <p style={{ color: "#718096" }}>Contactez Vosthermos pour activer votre accès.</p>
        </div>
      </div>
    );
  }

  const cParam = sp?.c || "";
  const isGlobal = cParam === "global";
  const clientIdParam = !isGlobal && cParam ? Number(cParam) : null;
  const activeClient = isGlobal
    ? null
    : clientIdParam
      ? manager.clients.find((c) => c.clientId === clientIdParam)
      : manager.clients[0];

  if (!isGlobal && !activeClient) redirect(`/gestionnaire?c=${manager.clients[0].clientId}`);

  const allClientIds = manager.clients.map((c) => c.clientId);
  const clientIdsFilter = isGlobal ? allClientIds : [activeClient.clientId];

  // Permission-scoped client IDs: only clients where manager has the specific permission
  const woClientIds = clientIdsFilter.filter((cid) => {
    const mc = manager.clients.find((c) => c.clientId === cid);
    return mc && hasPermission(mc, "view_work_orders");
  });
  const invoiceClientIds = clientIdsFilter.filter((cid) => {
    const mc = manager.clients.find((c) => c.clientId === cid);
    return mc && hasPermission(mc, "view_invoices");
  });

  // Fetch data scoped to selected client(s) + permissions + visibleAuClient
  const [buildings, unitsRaw, activeWOs, recentWOs, pendingInvoicesCount, invoicedWOs] = await Promise.all([
    prisma.building.findMany({
      where: { clientId: { in: clientIdsFilter } },
      include: { client: { select: { name: true } } },
      orderBy: [{ clientId: "asc" }, { position: "asc" }],
    }),
    prisma.clientUnit.findMany({
      where: { clientId: { in: clientIdsFilter }, isActive: true },
      include: {
        openings: { orderBy: { position: "asc" } },
      },
      orderBy: [{ clientId: "asc" }, { buildingId: "asc" }, { code: "asc" }],
    }),
    woClientIds.length === 0 ? Promise.resolve([]) : prisma.workOrder.findMany({
      where: {
        clientId: { in: woClientIds },
        visibleAuClient: true,
        statut: { in: ["draft", "scheduled", "in_progress"] },
      },
      include: {
        sections: true,
        technician: { select: { id: true, name: true, phone: true, photoUrl: true } },
        client: { select: { name: true } },
      },
      orderBy: { date: "asc" },
      take: 10,
    }),
    woClientIds.length === 0 ? Promise.resolve([]) : prisma.workOrder.findMany({
      where: {
        clientId: { in: woClientIds },
        visibleAuClient: true,
        statut: { in: ["completed", "invoiced", "paid"] },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
    invoiceClientIds.length === 0 ? Promise.resolve(0) : prisma.workOrder.count({
      where: {
        clientId: { in: invoiceClientIds },
        visibleAuClient: true,
        statut: "invoiced",
      },
    }),
    invoiceClientIds.length === 0 ? Promise.resolve([]) : prisma.workOrder.findMany({
      where: {
        clientId: { in: invoiceClientIds },
        visibleAuClient: true,
        statut: { in: ["invoiced", "paid"] },
      },
      include: { client: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  // Group units by building
  const unitsByBuilding = {};
  for (const b of buildings) unitsByBuilding[b.id] = { building: b, units: [] };
  const orphanUnits = [];
  for (const u of unitsRaw) {
    if (u.buildingId && unitsByBuilding[u.buildingId]) {
      unitsByBuilding[u.buildingId].units.push(u);
    } else {
      orphanUnits.push(u);
    }
  }

  // Build unit status map from active WOs sections
  const unitStatusMap = {};
  for (const wo of activeWOs) {
    for (const sec of wo.sections || []) {
      unitStatusMap[sec.unitCode] = {
        status: "active",
        wo,
        dateLabel: wo.date ? new Date(wo.date).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" }).toUpperCase() : "À VENIR",
      };
    }
  }
  for (const wo of recentWOs) {
    for (const sec of wo.sections || []) {
      if (!unitStatusMap[sec.unitCode]) {
        unitStatusMap[sec.unitCode] = { status: "done", dateLabel: "TERMINÉ" };
      }
    }
  }

  const stats = {
    totalUnits: unitsRaw.length,
    buildingsCount: buildings.length,
    activeWOsCount: activeWOs.length,
    invoicedCount: pendingInvoicesCount,
    completedCount: recentWOs.length,
  };

  // Pre-serialize interventions for client
  const interventions = {
    active: activeWOs.map((wo) => ({
      id: wo.id,
      number: wo.number,
      date: wo.date?.toISOString() || null,
      createdAt: wo.createdAt?.toISOString() || null,
      statut: wo.statut,
      description: wo.description,
      technicianName: wo.technician?.name || null,
      technicianPhone: wo.technician?.phone || null,
      technicianPhotoUrl: wo.technician?.photoUrl || null,
      clientName: wo.client?.name || "",
      sections: wo.sections?.map((s) => s.unitCode) || [],
      total: Number(wo.total),
      isManagerRequest: (wo.notes || "").startsWith("Demande du gestionnaire"),
      notes: wo.notes,
      isUnread: !wo.viewedByManagerAt && wo.statut !== "draft",
    })),
    recent: recentWOs.map((wo) => ({
      id: wo.id,
      number: wo.number,
      date: wo.date?.toISOString() || null,
      statut: wo.statut,
      description: wo.description,
      total: Number(wo.total),
    })),
  };

  const invoices = invoicedWOs.map((wo) => ({
    id: wo.id,
    number: wo.number,
    date: wo.date?.toISOString() || null,
    statut: wo.statut,
    description: wo.description,
    clientName: wo.client?.name || "",
    subtotal: Number(wo.subtotal),
    tps: Number(wo.tps),
    tvq: Number(wo.tvq),
    total: Number(wo.total),
  }));

  const toPayTotal = invoices.filter((i) => i.statut === "invoiced").reduce((s, i) => s + i.total, 0);
  const paidTotal = invoices.filter((i) => i.statut === "paid").reduce((s, i) => s + i.total, 0);

  // Notifications (derived from WOs + invoices) — only urgent/info, not per-WO
  const notifs = [];
  if (pendingInvoicesCount > 0) {
    notifs.push({
      kind: "urgent",
      icon: "fa-file-invoice-dollar",
      name: "Facture à régler",
      time: "Récent",
      text: `${pendingInvoicesCount} facture${pendingInvoicesCount > 1 ? "s" : ""} en attente de paiement`,
    });
  }

  return (
    <GestionnaireDashboard
      manager={{
        id: manager.id,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email,
      }}
      clients={manager.clients.map((c) => ({
        clientId: c.clientId,
        clientName: c.client.name,
        city: c.client.city,
        permissions: c.permissions,
      }))}
      isGlobal={isGlobal}
      activeClient={activeClient ? {
        id: activeClient.client.id,
        name: activeClient.client.name,
        city: activeClient.client.city,
        address: activeClient.client.address,
        permissions: activeClient.permissions || [],
      } : null}
      buildings={buildings.map((b) => {
        const bUnits = unitsByBuilding[b.id]?.units || [];
        const done = bUnits.filter((u) => unitStatusMap[u.code]?.status === "done").length;
        const active = bUnits.filter((u) => unitStatusMap[u.code]?.status === "active").length;
        return {
          id: b.id,
          code: b.code,
          name: b.name,
          clientName: b.client?.name || "",
          metaLine: `${bUnits.length} unité${bUnits.length > 1 ? "s" : ""} · ${done} terminée${done > 1 ? "s" : ""}${active > 0 ? ` · ${active} actif${active > 1 ? "s" : ""}` : ""}`,
          units: bUnits.map((u) => ({
            id: u.id,
            code: u.code,
            status: unitStatusMap[u.code]?.status || "none",
            statusLabel: unitStatusMap[u.code]?.dateLabel || "—",
            openings: u.openings,
          })),
        };
      })}
      orphanUnits={orphanUnits.map((u) => ({
        id: u.id,
        code: u.code,
        status: unitStatusMap[u.code]?.status || "none",
        statusLabel: unitStatusMap[u.code]?.dateLabel || "—",
        openings: u.openings,
      }))}
      stats={stats}
      notifs={notifs}
      interventions={interventions}
      invoices={invoices}
      invoicesTotals={{ toPay: toPayTotal, paid: paidTotal }}
    />
  );
}
