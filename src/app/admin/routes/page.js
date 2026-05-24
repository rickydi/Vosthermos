"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDateOnly } from "@/lib/date-only";
import { workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";

const ROUTE_STATUSES = {
  planned: { label: "Planifiee", className: "bg-blue-500/20 text-blue-300" },
  ready: { label: "Prete", className: "bg-emerald-500/20 text-emerald-300" },
  done: { label: "Terminee", className: "bg-slate-500/20 text-slate-300" },
  cancelled: { label: "Annulee", className: "bg-red-500/20 text-red-300" },
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function dateInputFromToday(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function money(value) {
  return `${Number(value || 0).toFixed(2)}$`;
}

function routeDate(value) {
  return formatDateOnly(value, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function timeOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

function addressLine(wo) {
  const parts = [
    wo.interventionAddress || wo.client?.address,
    wo.interventionCity || wo.client?.city,
    wo.interventionPostalCode || wo.client?.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
}

function routeLabel(route) {
  if (!route) return "Choisir une route";
  const tech = route.technician?.name || "Sans tech";
  return `${routeDate(route.date)} - ${route.area || route.name} - ${tech}`;
}

function WorkOrderLine({ wo, actionLabel, onAction, disabled }) {
  const stopTime = timeOnly(wo.arrivalAt);
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)_auto] gap-3 rounded-lg border admin-border p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-300">
        {wo.routePosition || "-"}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/bons/nouveau?edit=${wo.id}`} className="admin-text truncate text-sm font-bold hover:underline">
            {wo.number}
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${workOrderStatusClass(wo.statut)}`}>
            {workOrderStatusLabel(wo.statut)}
          </span>
        </div>
        <p className="admin-text text-sm truncate">{wo.client?.name || "Client sans nom"}</p>
        <p className="admin-text-muted text-xs truncate">{addressLine(wo) || "Adresse a confirmer"}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] admin-text-muted">
          {stopTime ? <span><i className="fas fa-clock mr-1"></i>{stopTime}</span> : null}
          {wo.technician?.name ? <span><i className="fas fa-hard-hat mr-1"></i>{wo.technician.name}</span> : null}
          <span><i className="fas fa-dollar-sign mr-1"></i>{money(wo.total)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAction?.(wo)}
        disabled={disabled}
        className="self-start rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function AdminRoutesPage() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [routes, setRoutes] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    technicianId: "",
    area: "",
    startCity: "",
    targetRevenue: "",
    notes: "",
  });

  const totals = useMemo(() => {
    const routeJobs = routes.reduce((sum, route) => sum + (route.workOrders?.length || 0), 0);
    const routeRevenue = routes.reduce((sum, route) => sum + Number(route.revenueTotal || 0), 0);
    const targetRevenue = routes.reduce((sum, route) => sum + Number(route.targetRevenue || 0), 0);
    return { routeJobs, routeRevenue, targetRevenue };
  }, [routes]);

  async function load(showSpinner = true) {
    if (!range.from || !range.to) return;
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/routes?from=${range.from}&to=${range.to}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur routes");
      setRoutes(data.routes || []);
      setUnassigned(data.unassignedWorkOrders || []);
      if (!selectedRouteId && data.routes?.[0]) setSelectedRouteId(String(data.routes[0].id));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const from = dateInputFromToday(0);
    const to = dateInputFromToday(14);
    setRange({ from, to });
    setForm((current) => ({ ...current, date: from }));
  }, []);

  useEffect(() => {
    fetch("/api/admin/technicians", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTechnicians(Array.isArray(data) ? data.filter((tech) => tech.isActive !== false) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [range.from, range.to]);

  async function createRoute(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur creation route");
      setSelectedRouteId(String(data.id));
      setForm({
        name: "",
        date: form.date,
        technicianId: form.technicianId,
        area: "",
        startCity: form.startCity,
        targetRevenue: form.targetRevenue,
        notes: "",
      });
      await load(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateRoute(route, patch) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/routes/${route.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur modification route");
      setRoutes((current) => current.map((item) => (item.id === data.id ? data : item)));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoute(route) {
    if (!confirm(`Supprimer la route ${route.name}? Les bons seront seulement retires de la route.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/routes/${route.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur suppression route");
      if (selectedRouteId === String(route.id)) setSelectedRouteId("");
      await load(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function assignWorkOrder(wo, routeId = selectedRouteId) {
    if (!routeId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/routes/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workOrderId: wo.id, routeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur assignation route");
      await load(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function unassignWorkOrder(wo) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/routes/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workOrderId: wo.id, routeId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur retrait route");
      await load(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedRoute = routes.find((route) => String(route.id) === selectedRouteId);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="admin-text text-2xl font-bold">Routes</h1>
          <p className="admin-text-muted text-sm">Planifier les jobs par secteur, technicien et date pour reduire les deplacements inutiles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={range.from}
            onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))}
            className="admin-input rounded-lg border px-3 py-2 text-sm"
          />
          <span className="admin-text-muted text-xs">a</span>
          <input
            type="date"
            value={range.to}
            onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))}
            className="admin-input rounded-lg border px-3 py-2 text-sm"
          />
          <button onClick={() => load()} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600">
            <i className="fas fa-rotate mr-2"></i>Rafraichir
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="admin-card rounded-xl border p-4">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-widest">Routes</p>
          <p className="admin-text mt-1 text-2xl font-extrabold">{routes.length}</p>
        </div>
        <div className="admin-card rounded-xl border p-4">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-widest">Jobs routes</p>
          <p className="admin-text mt-1 text-2xl font-extrabold">{totals.routeJobs}</p>
        </div>
        <div className="admin-card rounded-xl border p-4">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-widest">A placer</p>
          <p className="admin-text mt-1 text-2xl font-extrabold">{unassigned.length}</p>
        </div>
        <div className="admin-card rounded-xl border p-4">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-widest">Total routes</p>
          <p className="admin-text mt-1 text-2xl font-extrabold">{money(totals.routeRevenue)}</p>
          {totals.targetRevenue ? <p className="admin-text-muted text-xs">Objectif {money(totals.targetRevenue)}</p> : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <form onSubmit={createRoute} className="admin-card rounded-xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="admin-text text-lg font-bold">Nouvelle route</h2>
              <span className="admin-text-muted text-xs">Ex: Laval AM, Rive-Sud apres-midi</span>
            </div>
            <div className="grid gap-3 md:grid-cols-6">
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm md:col-span-1"
              />
              <select
                value={form.technicianId}
                onChange={(event) => setForm((current) => ({ ...current, technicianId: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm md:col-span-1"
              >
                <option value="">Technicien</option>
                {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
              </select>
              <input
                placeholder="Secteur"
                value={form.area}
                onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm md:col-span-1"
              />
              <input
                placeholder="Depart"
                value={form.startCity}
                onChange={(event) => setForm((current) => ({ ...current, startCity: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm md:col-span-1"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Objectif $"
                value={form.targetRevenue}
                onChange={(event) => setForm((current) => ({ ...current, targetRevenue: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm md:col-span-1"
              />
              <button disabled={saving} className="rounded-lg bg-[var(--color-red)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                <i className="fas fa-plus mr-2"></i>Creer
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                placeholder="Nom optionnel"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm"
              />
              <input
                placeholder="Notes de route"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="admin-input rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </form>

          {loading ? (
            <div className="py-16 text-center admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
          ) : routes.length === 0 ? (
            <div className="admin-card rounded-xl border p-10 text-center">
              <i className="fas fa-route mb-3 text-4xl admin-text-muted"></i>
              <p className="admin-text font-bold">Aucune route pour cette periode</p>
              <p className="admin-text-muted text-sm">Cree une route, puis ajoute les jobs acceptes ou deja planifies.</p>
            </div>
          ) : (
            routes.map((route) => {
              const status = ROUTE_STATUSES[route.status] || ROUTE_STATUSES.planned;
              const goal = Number(route.targetRevenue || 0);
              const percent = goal ? Math.min(100, Math.round((Number(route.revenueTotal || 0) / goal) * 100)) : 0;
              return (
                <section key={route.id} className="admin-card overflow-hidden rounded-xl border">
                  <div className="border-b admin-border p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="admin-text truncate text-lg font-extrabold">{route.name}</h2>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${status.className}`}>{status.label}</span>
                        </div>
                        <p className="admin-text-muted text-sm">
                          {routeDate(route.date)} | {route.technician?.name || "Technicien a assigner"} | {route.area || "Secteur a definir"}
                        </p>
                        {route.startCity ? <p className="admin-text-muted text-xs">Depart: {route.startCity}</p> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={route.status || "planned"}
                          onChange={(event) => updateRoute(route, { status: event.target.value })}
                          className="admin-input rounded-lg border px-3 py-2 text-xs font-bold"
                        >
                          {Object.entries(ROUTE_STATUSES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                        </select>
                        <button onClick={() => deleteRoute(route)} className="rounded-lg px-3 py-2 text-xs font-bold text-red-400 admin-hover">
                          <i className="fas fa-trash mr-1"></i>Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="admin-text-muted text-[10px] font-bold uppercase tracking-widest">Jobs</p>
                        <p className="admin-text text-xl font-extrabold">{route.workOrders?.length || 0}</p>
                      </div>
                      <div>
                        <p className="admin-text-muted text-[10px] font-bold uppercase tracking-widest">Valeur</p>
                        <p className="admin-text text-xl font-extrabold">{money(route.revenueTotal)}</p>
                      </div>
                      <div>
                        <p className="admin-text-muted text-[10px] font-bold uppercase tracking-widest">Objectif</p>
                        <p className="admin-text text-xl font-extrabold">{goal ? money(goal) : "-"}</p>
                        {goal ? (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {route.workOrders?.length ? (
                      route.workOrders.map((wo) => (
                        <WorkOrderLine key={wo.id} wo={wo} actionLabel="Retirer" onAction={unassignWorkOrder} disabled={saving} />
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed admin-border p-6 text-center admin-text-muted">
                        Aucun bon dans cette route.
                      </div>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <aside className="space-y-4">
          <div className="admin-card rounded-xl border p-4">
            <h2 className="admin-text text-lg font-bold">Jobs a placer</h2>
            <p className="admin-text-muted text-sm">Soumissions acceptees et jobs planifies sans route.</p>
            <select
              value={selectedRouteId}
              onChange={(event) => setSelectedRouteId(event.target.value)}
              className="admin-input mt-4 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Choisir une route</option>
              {routes.map((route) => <option key={route.id} value={route.id}>{routeLabel(route)}</option>)}
            </select>
            {selectedRoute ? (
              <p className="admin-text-muted mt-2 text-xs">
                Ajouter ici va mettre le bon a la date de la route et au technicien de la route.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            {unassigned.length === 0 ? (
              <div className="admin-card rounded-xl border p-8 text-center admin-text-muted">
                <i className="fas fa-check-circle mb-2 text-2xl"></i>
                <p>Aucun job a placer.</p>
              </div>
            ) : (
              unassigned.map((wo) => (
                <WorkOrderLine
                  key={wo.id}
                  wo={wo}
                  actionLabel="Ajouter"
                  onAction={(item) => assignWorkOrder(item)}
                  disabled={saving || !selectedRouteId}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
