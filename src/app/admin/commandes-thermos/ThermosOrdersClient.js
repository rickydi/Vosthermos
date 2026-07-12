"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const STATUS = {
  draft: ["Brouillon", "text-slate-300 bg-slate-400/10 border-slate-400/25", "fa-pen-ruler"],
  sending: ["Envoi en cours", "text-blue-300 bg-blue-400/10 border-blue-400/25", "fa-spinner fa-spin"],
  sent: ["Commandée", "text-blue-300 bg-blue-400/10 border-blue-400/25", "fa-paper-plane"],
  awaiting_confirmation: ["Réponse fournisseur attendue", "text-amber-200 bg-amber-400/10 border-amber-400/25", "fa-hourglass-half"],
  delayed: ["Retardée", "text-orange-300 bg-orange-400/10 border-orange-400/25", "fa-triangle-exclamation"],
  ready: ["Prête chez le fournisseur", "text-emerald-300 bg-emerald-400/10 border-emerald-400/25", "fa-circle-check"],
  received: ["Reçue par VosThermos", "text-teal-300 bg-teal-400/10 border-teal-400/25", "fa-box-open"],
  send_failed: ["Échec d’envoi", "text-red-300 bg-red-400/10 border-red-400/25", "fa-circle-exclamation"],
  cancelled: ["Annulée", "text-red-300 bg-red-400/10 border-red-400/25", "fa-ban"],
};

const fmtDate = (value) => value ? new Date(value).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }) : "—";

function countdown(order) {
  if (!order.expectedReadyAt || ["ready", "received", "cancelled"].includes(order.status)) return null;
  const days = Number(order.daysRemaining);
  if (!Number.isFinite(days)) return null;
  if (days > 1) return `${days} jours restants`;
  if (days === 1) return "1 jour restant";
  if (days === 0) return "Prévue aujourd’hui";
  return `${Math.abs(days)} jour${Math.abs(days) > 1 ? "s" : ""} de retard`;
}

export default function ThermosOrdersClient() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(Number(searchParams.get("order")) || null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/thermos-orders?status=${filter}`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Chargement impossible.");
      const list = Array.isArray(body) ? body : body.orders || [];
      setOrders(list);
      if (!selectedId && list[0]) setSelectedId(list[0].id);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filter, selectedId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!selectedId) { setSelected(null); return; }
    fetch(`/api/admin/thermos-orders/${selectedId}`, { cache: "no-store" })
      .then(async (res) => { const body = await res.json().catch(() => ({})); if (!res.ok) throw new Error(body.error || "Commande introuvable."); setSelected(body.order || body); })
      .catch((err) => setError(err.message));
  }, [selectedId]);

  async function action(name, promptText) {
    if (promptText && !confirm(promptText)) return;
    setBusy(name); setError("");
    try {
      const res = await fetch(`/api/admin/thermos-orders/${selectedId}/${name}`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Action impossible.");
      setSelected(body.order || body); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  const filtered = useMemo(() => orders, [orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div><p className="text-cyan-400 text-xs uppercase font-bold tracking-[.18em]">Production</p><h1 className="admin-text text-2xl font-black mt-1">Commandes de thermos</h1><p className="admin-text-muted text-sm mt-1">Du dessin final jusqu’à la réception chez VosThermos.</p></div>
        <div className="flex rounded-xl border admin-border p-1 admin-card">
          {[['active','Actives'],['all','Toutes']].map(([key,label]) => <button key={key} onClick={() => { setFilter(key); setLoading(true); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${filter === key ? "bg-cyan-500/15 text-cyan-300" : "admin-text-muted"}`}>{label}</button>)}
        </div>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 p-3 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-5">
        <section className="space-y-3">
          {loading ? <div className="admin-card border admin-border rounded-xl p-6 admin-text-muted"><i className="fas fa-spinner fa-spin mr-2" />Chargement…</div> : filtered.length === 0 ? <div className="admin-card border admin-border rounded-xl p-8 text-center admin-text-muted"><i className="fas fa-boxes-stacked text-3xl opacity-40 mb-3" /><p>Aucune commande de thermos.</p><p className="text-xs mt-2">Une commande se prépare depuis une fiche de mesures technicien validée.</p></div> : filtered.map((order) => {
            const meta = STATUS[order.status] || [order.status, "admin-text-muted admin-border", "fa-box"];
            return <button key={order.id} onClick={() => setSelectedId(order.id)} className={`w-full text-left rounded-xl border p-4 transition-colors ${selectedId === order.id ? "border-cyan-400 bg-cyan-400/5" : "admin-card admin-border hover:border-cyan-400/30"}`}>
              <div className="flex items-start justify-between gap-3"><div><p className="admin-text font-bold">{order.clientNameSnapshot || order.client?.name}</p><p className="font-mono admin-text-muted text-xs mt-1">{order.number}</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${meta[1]}`}><i className={`fas ${meta[2]} mr-1`} />{meta[0]}</span></div>
              <div className="flex justify-between gap-3 mt-3 text-xs admin-text-muted"><span>{order.items?.length ?? order.itemCount ?? order._count?.items ?? 0} thermos</span><span className={countdown(order)?.includes("retard") ? "text-red-300 font-bold" : ""}>{countdown(order) || fmtDate(order.updatedAt)}</span></div>
            </button>;
          })}
        </section>

        <section className="admin-card border admin-border rounded-2xl min-h-96 overflow-hidden">
          {!selected ? <div className="p-12 text-center admin-text-muted">Choisissez une commande.</div> : (() => {
            const meta = STATUS[selected.status] || [selected.status, "admin-text-muted admin-border", "fa-box"];
            const items = selected.items || [];
            return <>
              <div className="p-5 sm:p-6 border-b admin-border bg-gradient-to-br from-cyan-500/10 to-transparent">
                <div className="flex flex-wrap justify-between gap-4"><div><p className="font-mono text-cyan-300 text-sm">{selected.number}</p><h2 className="admin-text text-2xl font-black mt-1">{selected.clientNameSnapshot}</h2><p className="admin-text-muted text-sm mt-1">{selected.supplierNameSnapshot} · {selected.supplierContactSnapshot || selected.supplierEmailSnapshot}</p></div><span className={`self-start rounded-full border px-3 py-2 text-xs font-bold ${meta[1]}`}><i className={`fas ${meta[2]} mr-2`} />{meta[0]}</span></div>
                {selected.expectedReadyAt && <div className="grid sm:grid-cols-3 gap-3 mt-5"><div className="rounded-xl border admin-border bg-black/10 p-3"><p className="admin-text-muted text-[10px] uppercase font-bold">Envoyée</p><p className="admin-text font-bold mt-1">{fmtDate(selected.sentAt)}</p></div><div className="rounded-xl border admin-border bg-black/10 p-3"><p className="admin-text-muted text-[10px] uppercase font-bold">Date prévue</p><p className="admin-text font-bold mt-1">{fmtDate(selected.expectedReadyAt)}</p></div><div className="rounded-xl border admin-border bg-black/10 p-3"><p className="admin-text-muted text-[10px] uppercase font-bold">Décompte</p><p className={`font-bold mt-1 ${countdown(selected)?.includes("retard") ? "text-red-300" : "text-cyan-300"}`}>{countdown(selected) || meta[0]}</p></div></div>}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-5">
                  {selected.status === "draft" && <button onClick={() => action("send", `Envoyer la commande ${selected.number} à ${selected.supplierEmailSnapshot}?`)} disabled={!!busy} className="rounded-xl bg-[var(--color-red)] text-white px-4 py-3 font-bold text-sm disabled:opacity-50"><i className={`fas ${busy === "send" ? "fa-spinner fa-spin" : "fa-paper-plane"} mr-2`} />Envoyer la commande</button>}
                  {["send_failed", "awaiting_confirmation"].includes(selected.status) && <button onClick={() => action("resend", "Renvoyer le courriel au fournisseur?")} disabled={!!busy} className="rounded-xl bg-amber-500 text-slate-950 px-4 py-3 font-bold text-sm disabled:opacity-50"><i className={`fas ${busy === "resend" ? "fa-spinner fa-spin" : "fa-envelope"} mr-2`} />Renvoyer au fournisseur</button>}
                  {selected.status === "ready" && <button onClick={() => action("mark-received", "Confirmer que VosThermos a physiquement reçu tous les thermos?")} disabled={!!busy} className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-bold text-sm disabled:opacity-50"><i className={`fas ${busy === "mark-received" ? "fa-spinner fa-spin" : "fa-box-open"} mr-2`} />Marquer reçue chez VosThermos</button>}
                  {selected.status === "draft" && <button onClick={() => action("cancel", "Annuler ce brouillon? L’historique sera conservé.")} disabled={!!busy} className="rounded-xl border border-red-400/30 text-red-300 px-4 py-3 font-bold text-sm disabled:opacity-50"><i className="fas fa-ban mr-2" />Annuler</button>}
                  {selected.measurementId && <Link href={`/admin/mesures/${selected.measurementId}`} className="rounded-xl border admin-border admin-text px-4 py-3 font-bold text-sm"><i className="fas fa-ruler-combined mr-2" />Voir les mesures</Link>}
                </div>

                <h3 className="admin-text font-bold mb-3">Thermos physiques ({items.length})</h3>
                <div className="overflow-x-auto rounded-xl border admin-border">
                  <table className="w-full text-sm"><thead className="bg-black/10 admin-text-muted text-[10px] uppercase"><tr><th className="text-left p-3">Identification</th><th className="text-left p-3">Dimensions</th><th className="text-left p-3">Options</th></tr></thead><tbody>{items.map((item) => <tr key={item.id || item.internalCode} className="border-t admin-border"><td className="p-3"><p className="admin-text font-semibold">{item.label}</p><p className="font-mono text-cyan-400 text-xs mt-1">{item.internalCode}</p></td><td className="p-3 admin-text whitespace-nowrap">{formatSixteenths(item.widthSixteenths)} × {formatSixteenths(item.heightSixteenths)} × {formatSixteenths(item.thicknessSixteenths)}</td><td className="p-3 admin-text-muted text-xs">{optionText(item.options, item.grille)}</td></tr>)}</tbody></table>
                </div>

                {selected.events?.length > 0 && <div className="mt-6"><h3 className="admin-text font-bold mb-3">Historique</h3><ol className="space-y-2">{selected.events.map((event) => <li key={event.id} className="flex gap-3 text-sm"><span className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shrink-0" /><div><p className="admin-text">{eventLabel(event.type)}</p><p className="admin-text-muted text-xs">{new Date(event.createdAt).toLocaleString("fr-CA")}{event.actorLabel ? ` · ${event.actorLabel}` : ""}</p></div></li>)}</ol></div>}
              </div>
            </>;
          })()}
        </section>
      </div>
    </div>
  );
}

function formatSixteenths(raw) {
  const value = Math.max(0, Math.round(Number(raw) || 0)); const whole = Math.floor(value / 16); const rem = value % 16;
  const div = (a, b) => { while (b) [a, b] = [b, a % b]; return a || 1; };
  const gcd = div(rem, 16); return `${whole}${rem ? ` ${rem / gcd}/${16 / gcd}` : ""} po`;
}

function optionText(options = {}, grille = {}) {
  const values = [options.glassType === "triple" ? "Triple" : "Double", options.lowE && "Low-E", options.argon && "Argon", options.tempered && "Trempé", options.laminated && "Laminé", grille.enabled && "Carrelage décoratif"].filter(Boolean);
  return values.join(" · ") || "Standard";
}

function eventLabel(type) {
  return ({ created: "Commande préparée", sent: "Commande envoyée", reminder_sent: "Demande de confirmation envoyée", supplier_ready: "Fournisseur: commande prête", supplier_delayed: "Fournisseur: nouvelle date fournie", received: "Commande reçue chez VosThermos", cancelled: "Commande annulée", send_failed: "Échec d’envoi" })[type] || String(type || "Mise à jour").replaceAll("_", " ");
}
