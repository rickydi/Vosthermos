"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminStream, ADMIN_TAB_ID } from "@/components/admin/adminStream";
import { FOLLOW_UP_MILESTONES } from "@/lib/follow-up-columns";

// Header envoye avec chaque mutation: le serveur le rejoue dans l'evenement SSE
// (origin), ce qui permet d'ignorer l'echo de nos propres clics (deja appliques
// en optimiste) au lieu de recharger 344 Ko de liste a chaque coche.
const MUTATION_HEADERS = { "Content-Type": "application/json", "X-Admin-Tab": ADMIN_TAB_ID };

// null aussi pour 0 : un montant vide n'apporte rien sur la carte (le 0 $
// venait des soumissions creees en brouillon avant d'etre chiffrees).
const fmtMoney = (n) => (n === null || n === undefined || !(Number(n) > 0) ? null : new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n));
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" }) : "");

const FILTERS = [
  { key: "open", label: "En cours" },
  { key: "won", label: "Gagnés" },
  { key: "lost", label: "Perdus" },
  { key: "all", label: "Tous" },
];

// Seuils par défaut (heures) avant qu'une étape clignote en rouge. Réglables dans
// Paramètres (clé site_settings "admin_follow_up_sla").
export const DEFAULT_SLA = { to_contact: 5, visit: 24, soumission: 48, approval: 48 };

// Étape courante d'un suivi ouvert + si elle a dépassé son délai (clignote alors).
function computeSla(fu, sla, now) {
  if (!sla || !now) return null;
  if (fu.outcome === "won" || fu.outcome === "lost") return null;
  const overdue = (stage, since) => {
    const t = Number(sla[stage]);
    if (!(t > 0) || !since) return false;
    return (now - new Date(since).getTime()) / 3600000 > t;
  };
  if (!fu.contactedAt) return { stage: "to_contact", overdue: overdue("to_contact", fu.lastAttemptAt || fu.createdAt) };
  // Visite planifiée (RDV) : en retard seulement si le jour du RDV est passé sans
  // que la visite soit marquée faite. Passage libre : le client est toujours sur
  // place, aucun délai ne presse.
  if (fu.visitStatus === "rdv" && !fu.visitDoneAt) {
    const missed = fu.visitScheduledAt && now > new Date(fu.visitScheduledAt).getTime() + 24 * 3600000;
    return { stage: "visit", overdue: !!missed };
  }
  if (fu.visitStatus === "anytime" && !fu.visitDoneAt) return { stage: "visit", overdue: false };
  // Le chrono repart de la COCHE de l'étape (règle d'Erik), pas du vieux
  // contactedAt : cocher « Visite à faire » sur un dossier contacté il y a
  // 3 jours ne doit pas clignoter tout de suite.
  if (fu.visitStatus === "todo" && !fu.visitDoneAt) return { stage: "visit", overdue: overdue("visit", fu.visitStatusAt || fu.contactedAt) };
  if (!fu.estimateSentAt) {
    const measurement = fu.latestMeasurement;
    // Pendant que le client complète ses mesures, la soumission n'est pas en
    // retard. Le chrono repart seulement quand les mesures reviennent.
    if (measurement?.source === "client" && ["requested", "in_progress"].includes(measurement.status)) {
      return { stage: "soumission", overdue: false };
    }
    const measurementReadyAt = measurement?.receivedAt || measurement?.validatedAt;
    return { stage: "soumission", overdue: overdue("soumission", measurementReadyAt || fu.visitDoneAt || fu.visitStatusAt || fu.contactedAt) };
  }
  if (!fu.acceptedAt) return { stage: "approval", overdue: overdue("approval", fu.estimateSentAt) };
  return null;
}

export default function SuiviSimple() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [rdvFor, setRdvFor] = useState(null); // suivi pour lequel on planifie une visite avec RDV
  const [deleting, setDeleting] = useState(null); // suivi à supprimer (modal de confirmation)
  const [measureFor, setMeasureFor] = useState(null); // { fu, source }
  const [sla, setSla] = useState(null);
  const [now, setNow] = useState(0); // 0 au SSR, posé au montage (évite tout mismatch d'hydratation)
  const searchRef = useRef("");
  searchRef.current = search;
  const seq = useRef(0);

  // Seuils SLA (réglés dans Paramètres) + horloge qui avance chaque minute pour que
  // les étapes en retard se mettent à clignoter sans recharger.
  useEffect(() => {
    fetch("/api/admin/settings?key=admin_follow_up_sla", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { try { setSla(d?.value ? JSON.parse(d.value) : DEFAULT_SLA); } catch { setSla(DEFAULT_SLA); } })
      .catch(() => setSla(DEFAULT_SLA));
  }, []);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async (q = searchRef.current) => {
    const my = ++seq.current;
    try {
      const res = await fetch(`/api/admin/follow-ups?status=all&activity=0&limit=500${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      if (my === seq.current) { setItems(Array.isArray(data) ? data : []); setLoading(false); }
    } catch { if (my === seq.current) setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // recherche debouncée
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search, load]);

  // temps réel : un collègue (ou le terrain) coche un jalon -> on rafraîchit.
  // On ignore l'écho de nos propres mutations (origin = cet onglet, l'optimiste a
  // déjà appliqué la réponse serveur) et on coalesce les rafales en un seul reload.
  const streamReloadTimer = useRef(null);
  useAdminStream((e) => {
    if (!["connected", "follow_up.changed", "work_order.changed", "appointment.changed", "client_photo.added", "thermos_measurement.changed", "thermos_order.changed"].includes(e?.type)) return;
    if (e?.origin && e.origin === ADMIN_TAB_ID) return;
    clearTimeout(streamReloadTimer.current);
    streamReloadTimer.current = setTimeout(() => load(), 600);
  });
  useEffect(() => () => clearTimeout(streamReloadTimer.current), []);

  // mise à jour optimiste locale
  const patchLocal = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  async function toggleMilestone(fu, key) {
    const on = !fu[key];
    patchLocal(fu.id, { [key]: on ? new Date().toISOString() : null });
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify({ toggleMilestone: key, on }),
      });
      if (!res.ok) {
        // Ex.: « Facturé » refusé quand aucune facture n'existe pour ce dossier.
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "");
      }
      const updated = await res.json();
      patchLocal(fu.id, updated);
    } catch (e) {
      if (e.message) alert(e.message);
      load(); // revert via reload
    }
  }

  // Approbation via le menu déroulant (remplace Gagné/Perdu) : approuvé = gagné +
  // jalon coché, refusé = perdu, en attente = ouvert. Un seul appel cohérent.
  async function setApproval(fu, state) {
    const now = new Date().toISOString();
    const optimistic =
      state === "won" ? { outcome: "won", acceptedAt: fu.acceptedAt || now }
      : state === "lost" ? { outcome: "lost", acceptedAt: null }
      : { outcome: "open", acceptedAt: null };
    patchLocal(fu.id, optimistic);
    const body =
      state === "won" ? { outcome: "won", toggleMilestone: "acceptedAt", on: true }
      : state === "lost" ? { outcome: "lost", toggleMilestone: "acceptedAt", on: false }
      : { outcome: "open", toggleMilestone: "acceptedAt", on: false };
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      patchLocal(fu.id, await res.json());
    } catch {
      load();
    }
  }

  // Type de soumission via le menu déroulant : écrite / téléphone / aucune.
  // "written" peut aussi être posé tout seul par le système (bon de travail).
  async function setSoumission(fu, type) {
    const now = new Date().toISOString();
    const optimistic = type
      ? { estimateSentAt: fu.estimateSentAt || now, estimateType: type }
      : { estimateSentAt: null, estimateType: null };
    patchLocal(fu.id, optimistic);
    const body = type
      ? { toggleMilestone: "estimateSentAt", on: true, estimateType: type }
      : { toggleMilestone: "estimateSentAt", on: false, estimateType: null };
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      patchLocal(fu.id, await res.json());
    } catch {
      load();
    }
  }

  // État de la visite via le menu : faite / à faire / passage libre / sans visite.
  // (le choix "Visite avec RDV" passe par le modal RdvModal, pas par ici)
  async function setVisite(fu, state) {
    const stamp = new Date().toISOString();
    const optimistic =
      state === "done" ? { visitDoneAt: fu.visitDoneAt || stamp, visitStatus: "done" }
      : state === "todo" ? { visitDoneAt: null, visitStatus: "todo", visitScheduledAt: null, visitTimeSlot: null }
      : state === "anytime" ? { visitDoneAt: null, visitStatus: "anytime", visitScheduledAt: null, visitTimeSlot: null }
      : { visitDoneAt: null, visitStatus: "none", visitScheduledAt: null, visitTimeSlot: null };
    patchLocal(fu.id, optimistic);
    const body =
      state === "done" ? { toggleMilestone: "visitDoneAt", on: true, visitStatus: "done" }
      : state === "todo" ? { toggleMilestone: "visitDoneAt", on: false, visitStatus: "todo" }
      : state === "anytime" ? { toggleMilestone: "visitDoneAt", on: false, visitStatus: "anytime" }
      : { toggleMilestone: "visitDoneAt", on: false, visitStatus: "none" };
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      patchLocal(fu.id, await res.json());
    } catch {
      load();
    }
  }

  // État de contact via le menu déroulant : rejoint / 1-2 tentatives sans réponse / réinit.
  // Un seul appel : pose contactedAt et/ou contactAttempts de façon cohérente.
  async function setContactState(fu, state) {
    const now = new Date().toISOString();
    const optimistic =
      state === "reached" ? { contactedAt: fu.contactedAt || now }
      : state === "a1" ? { contactAttempts: 1, contactedAt: null, lastAttemptAt: now }
      : state === "a2" ? { contactAttempts: 2, contactedAt: null, lastAttemptAt: now }
      : { contactAttempts: 0, contactedAt: null, lastAttemptAt: null };
    patchLocal(fu.id, optimistic);
    const body =
      state === "reached" ? { toggleMilestone: "contactedAt", on: true }
      : state === "a1" ? { contactAttempts: 1, toggleMilestone: "contactedAt", on: false }
      : state === "a2" ? { contactAttempts: 2, toggleMilestone: "contactedAt", on: false }
      : { resetAttempts: true, toggleMilestone: "contactedAt", on: false };
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      patchLocal(fu.id, await res.json());
    } catch {
      load();
    }
  }

  const visible = items.filter((fu) => {
    if (filter === "all") return true;
    if (filter === "won") return fu.outcome === "won";
    if (filter === "lost") return fu.outcome === "lost";
    return fu.outcome !== "won" && fu.outcome !== "lost"; // open
  });

  const counts = {
    open: items.filter((f) => f.outcome !== "won" && f.outcome !== "lost").length,
    won: items.filter((f) => f.outcome === "won").length,
    lost: items.filter((f) => f.outcome === "lost").length,
    all: items.length,
  };

  return (
    <div className="p-4 lg:p-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vtFlashRed { 0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } 50% { box-shadow: 0 0 0 3px rgba(244,63,94,0.55); } }
        .vt-flash-red { animation: vtFlashRed 1s ease-in-out infinite; border-color: rgba(244,63,94,0.9) !important; }
      ` }} />
      {/* Pas de titre répété (déjà dans la barre admin). Recherche centrée et
          mise en valeur en haut, puis la rangée compacte bouton + filtres. */}
      <div className="relative max-w-xl mx-auto mb-3">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 admin-text-muted"></i>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, tél, service…"
          className="admin-input border rounded-2xl pl-11 pr-4 py-3 text-base w-full focus:outline-none focus:border-[var(--color-red)] shadow-sm" />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full admin-text-muted hover:admin-text inline-flex items-center justify-center">
            <i className="fas fa-times text-sm"></i>
          </button>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
        <button onClick={() => setCreating(true)} className="px-3 py-1.5 bg-[var(--color-red)] text-white rounded-full text-xs font-bold">
          <i className="fas fa-plus mr-1.5"></i>Nouveau suivi
        </button>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f.key ? "bg-[var(--color-red)] text-white" : "admin-card border admin-border admin-text-muted hover:admin-text"}`}>
            {f.label} <span className="opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-text-muted text-sm py-16 text-center"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="admin-card border rounded-xl p-12 text-center admin-text-muted">
          <i className="fas fa-list-check text-3xl opacity-30 mb-3 block"></i>
          {search ? "Aucun résultat." : "Aucun suivi dans cette vue."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((fu) => {
            const name = fu.client?.name || fu.contactName || fu.title || "Sans nom";
            const isLost = fu.outcome === "lost";
            const isWon = fu.outcome === "won";
            const attempts = fu.contactAttempts || 0;
            const reached = !!fu.contactedAt;
            // "À relancer" : 2 tentatives sans réponse, pas encore rejoint, dossier ouvert.
            const flagged = attempts >= 2 && !reached && !isWon && !isLost;
            // Étape en retard selon les seuils SLA -> elle clignote en rouge.
            const slaState = computeSla(fu, sla, now);
            const overdueStage = slaState?.overdue ? slaState.stage : null;
            return (
              <div key={fu.id} className={`admin-card border rounded-xl p-3.5 transition-opacity ${isLost ? "opacity-55" : ""} ${flagged ? "ring-1 ring-rose-400/50 border-rose-400/40" : ""}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-x-2 gap-y-1.5 flex-wrap">
                      {fu.clientId ? (
                        <Link href={`/admin/clients/${fu.clientId}`} className="admin-text font-bold hover:text-[var(--color-red)] transition-colors">{name}</Link>
                      ) : (
                        <span className="admin-text font-bold">{name}</span>
                      )}
                      {/* Client récurrent : « #3 » = son 3e dossier chez nous (rien au 1er). */}
                      {fu.followUpRank > 1 && (
                        <span title={`${fu.followUpRank}e dossier de ce client`}
                          className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                          #{fu.followUpRank}
                        </span>
                      )}
                      {fu.clientId && (
                        <Link href={`/admin/clients/${fu.clientId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--color-red)] text-white shadow-sm hover:opacity-90 transition-opacity">
                          <i className="fas fa-folder-open"></i>Ouvrir client
                        </Link>
                      )}
                    </div>
                    <div className="admin-text-muted text-xs mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {fu.service && <span>{fu.service}</span>}
                      {fu.phone && <span className="whitespace-nowrap"><i className="fas fa-phone mr-1 opacity-60"></i>{fu.phone}</span>}
                      {fmtMoney(fu.estimateAmount) && (
                        <span className="whitespace-nowrap rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-300">
                          {fmtMoney(fu.estimateAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Coin notifications : icônes seulement quand il y a quelque chose. */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {fu.clientPhotos?.count > 0 && fu.clientId && (
                      <Link
                        href={`/admin/clients/${fu.clientId}?tab=photos`}
                        title={`${fu.clientPhotos.count} photo${fu.clientPhotos.count > 1 ? "s" : ""} envoyée${fu.clientPhotos.count > 1 ? "s" : ""} par le client`}
                        className={`h-8 px-2 rounded-lg inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                          now && fu.clientPhotos.lastAt && now - new Date(fu.clientPhotos.lastAt).getTime() < 48 * 3600000
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-white/5 admin-text-muted hover:admin-text border border-transparent"
                        }`}
                      >
                        <i className="fas fa-camera text-[11px]"></i>{fu.clientPhotos.count}
                      </Link>
                    )}
                    {fu.unreadChat?.count > 0 && (
                      <Link
                        href={`/admin/chat/${fu.unreadChat.conversationId}`}
                        title={`${fu.unreadChat.count} message${fu.unreadChat.count > 1 ? "s" : ""} non lu${fu.unreadChat.count > 1 ? "s" : ""}`}
                        className="h-8 px-2 rounded-lg inline-flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40"
                      >
                        <i className="fas fa-comment text-[11px]"></i>{fu.unreadChat.count}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <ContactMenu fu={fu} onPick={(state) => setContactState(fu, state)} overdue={overdueStage === "to_contact"} />
                  {FOLLOW_UP_MILESTONES.filter((m) => m.key !== "contactedAt").map((m) => {
                    if (m.key === "visitDoneAt") {
                      return <VisiteMenu key={m.key} fu={fu} onPick={(state) => (state === "rdv" ? setRdvFor(fu) : setVisite(fu, state))} overdue={overdueStage === "visit"} />;
                    }
                    if (m.key === "estimateSentAt") {
                      return <SoumissionMenu key={m.key} fu={fu} onPick={(k) => setSoumission(fu, k === "none" ? null : k)} onMeasure={(source) => {
                        if (fu.latestMeasurement?.source === source && fu.latestMeasurement?.id) {
                          window.location.href = `/admin/mesures/${fu.latestMeasurement.id}`;
                        } else {
                          setMeasureFor({ fu, source });
                        }
                      }} overdue={overdueStage === "soumission"} />;
                    }
                    if (m.key === "acceptedAt") {
                      return <ApprovalMenu key={m.key} fu={fu} onPick={(state) => setApproval(fu, state)} overdue={overdueStage === "approval"} />;
                    }
                    const on = !!fu[m.key];
                    return (
                      <button key={m.key} onClick={() => toggleMilestone(fu, m.key)} title={on ? `${m.label} · ${fmtDate(fu[m.key])}` : m.label}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${on ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "admin-bg admin-border admin-text-muted hover:admin-text"}`}>
                        <i className={`fas ${on ? "fa-circle-check" : "fa-circle"} ${on ? "" : "opacity-40"}`}></i>
                        {m.label}
                        {on && <span className="opacity-60 hidden sm:inline">{fmtDate(fu[m.key])}</span>}
                      </button>
                    );
                  })}
                  {/* Poubelle en bas à droite de la carte (choix d'Erik). */}
                  <button
                    onClick={() => setDeleting(fu)}
                    title="Supprimer ce suivi"
                    className="ml-auto w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors inline-flex items-center justify-center shrink-0"
                  >
                    <i className="fas fa-trash-can text-sm"></i>
                  </button>
                </div>

                {flagged && (
                  <div className="mt-2 text-xs text-rose-300 font-semibold">
                    <i className="fas fa-triangle-exclamation mr-1"></i>2 tentatives sans réponse — relancer ou marquer refusé
                  </div>
                )}

                {fu.latestThermosOrder && <ThermosOrderStrip order={fu.latestThermosOrder} now={now} />}

                {/* Pas de ligne « prochaine étape » sur les cartes (choix d'Erik
                    2026-07-05) : les états des boutons suffisent. Le champ
                    nextAction reste visible dans la fiche client. */}
              </div>
            );
          })}
        </div>
      )}

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
      {rdvFor && (
        <RdvModal
          fu={rdvFor}
          onClose={() => setRdvFor(null)}
          onSaved={(updated) => { patchLocal(rdvFor.id, updated); setRdvFor(null); }}
        />
      )}
      {deleting && (
        <DeleteModal
          fu={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => { setItems((list) => list.filter((it) => it.id !== deleting.id)); setDeleting(null); }}
        />
      )}
      {measureFor && (
        <MeasurementModal
          fu={measureFor.fu}
          source={measureFor.source}
          onClose={() => setMeasureFor(null)}
          onCreated={() => { setMeasureFor(null); load(); }}
        />
      )}
    </div>
  );
}

// Menu déroulant compact pour l'état de contact (remplace les 2 boutons "Contacté"
// + "Sans réponse"). 4 choix : rejoint / 1-2 tentatives sans réponse / à contacter.
// Code couleur voulu par Erik : DEUX couleurs seulement — vert = fait,
// rouge = à faire / pas réussi. Gris = aucun état choisi.
const CONTACT_STATES = {
  none: { label: "À contacter", icon: "fa-circle", cls: "admin-bg admin-border admin-text-muted" },
  a1: { label: "1 tentative", icon: "fa-phone-slash", cls: "border-rose-400/50 text-rose-300 bg-rose-500/10" },
  a2: { label: "2 tentatives", icon: "fa-phone-slash", cls: "border-rose-400/50 text-rose-300 bg-rose-500/10" },
  reached: { label: "Contacté", icon: "fa-circle-check", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" },
};
const CONTACT_OPTIONS = [
  { key: "reached", label: "Contacté (rejoint)", icon: "fa-circle-check", tone: "text-emerald-400" },
  { key: "a1", label: "1 tentative — sans réponse", icon: "fa-phone-slash", tone: "text-rose-400" },
  { key: "a2", label: "2 tentatives — sans réponse", icon: "fa-phone-slash", tone: "text-rose-400" },
  { key: "none", label: "À contacter (réinitialiser)", icon: "fa-rotate-left", tone: "admin-text-muted" },
];

function ContactMenu({ fu, onPick, overdue }) {
  const [open, setOpen] = useState(false);
  const attempts = fu.contactAttempts || 0;
  const reached = !!fu.contactedAt;
  const current = reached ? "reached" : attempts >= 2 ? "a2" : attempts === 1 ? "a1" : "none";
  const cur = CONTACT_STATES[current];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={attempts > 0 && !reached ? `${attempts} tentative${attempts > 1 ? "s" : ""} sans réponse · dernière ${fmtDate(fu.lastAttemptAt)}` : "Statut de contact"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${cur.cls} ${overdue ? "vt-flash-red" : ""}`}
      >
        <i className={`fas ${cur.icon}`}></i>
        {cur.label}
        <i className="fas fa-chevron-down text-[9px] opacity-60 ml-0.5"></i>
      </button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default"></button>
          <div className="absolute left-0 top-full mt-1 z-50 w-60 admin-bg border admin-border rounded-lg shadow-xl py-1">
            {CONTACT_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOpen(false); onPick(o.key); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/5 flex items-center gap-2 transition-colors ${current === o.key ? "bg-white/5" : ""}`}
              >
                <i className={`fas ${o.icon} w-4 text-center ${o.tone}`}></i>
                <span className="admin-text">{o.label}</span>
                {current === o.key && <i className="fas fa-check ml-auto text-emerald-400 text-[10px]"></i>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Menu déroulant compact pour l'approbation (remplace les boutons Gagné/Perdu).
// Approuvé = gagné, Refusé = perdu, En attente = ouvert.
const APPROVAL_STATES = {
  open: { label: "À approuver", icon: "fa-thumbs-up", cls: "admin-bg admin-border admin-text-muted" },
  won: { label: "Approuvé", icon: "fa-thumbs-up", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" },
  lost: { label: "Refusé", icon: "fa-thumbs-down", cls: "bg-rose-500/10 border-rose-400/50 text-rose-300" },
};
const APPROVAL_OPTIONS = [
  { key: "won", label: "Approuvé (gagné)", icon: "fa-thumbs-up", tone: "text-emerald-400" },
  { key: "lost", label: "Refusé (perdu)", icon: "fa-thumbs-down", tone: "text-rose-400" },
  { key: "open", label: "En attente (réinitialiser)", icon: "fa-rotate-left", tone: "admin-text-muted" },
];

function ApprovalMenu({ fu, onPick, overdue }) {
  const [open, setOpen] = useState(false);
  const current = fu.outcome === "won" ? "won" : fu.outcome === "lost" ? "lost" : "open";
  const cur = APPROVAL_STATES[current];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Approbation de la soumission"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${cur.cls} ${overdue ? "vt-flash-red" : ""}`}
      >
        <i className={`fas ${cur.icon}`}></i>
        {cur.label}
        <i className="fas fa-chevron-down text-[9px] opacity-60 ml-0.5"></i>
      </button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default"></button>
          <div className="absolute left-0 top-full mt-1 z-50 w-56 admin-bg border admin-border rounded-lg shadow-xl py-1">
            {APPROVAL_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOpen(false); onPick(o.key); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/5 flex items-center gap-2 transition-colors ${current === o.key ? "bg-white/5" : ""}`}
              >
                <i className={`fas ${o.icon} w-4 text-center ${o.tone}`}></i>
                <span className="admin-text">{o.label}</span>
                {current === o.key && <i className="fas fa-check ml-auto text-emerald-400 text-[10px]"></i>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Menu déroulant compact pour la soumission : écrite (auto via le système) ou par
// téléphone (verbale, manuelle). "Tu sais pourquoi" : l'écrite = un vrai document.
const SOUMISSION_OPTIONS = [
  { key: "written", label: "Soumission écrite envoyée", icon: "fa-file-lines", tone: "text-emerald-400" },
  { key: "phone", label: "Soumission donnée par téléphone", icon: "fa-phone", tone: "text-emerald-400" },
  { key: "none", label: "Pas de soumission (réinitialiser)", icon: "fa-rotate-left", tone: "admin-text-muted" },
];

const MEASUREMENT_OPTIONS = [
  { key: "technician", label: "Mesures technicien", detail: "Mesures finales avec épaisseur", icon: "fa-ruler-combined" },
  { key: "client", label: "Mesures client", detail: "Envoyer un lien par texto ou courriel", icon: "fa-mobile-screen-button" },
  { key: "phone", label: "Mesures reçues par téléphone", detail: "Mesures approximatives pour pré-soumission", icon: "fa-headset" },
];

function SoumissionMenu({ fu, onPick, onMeasure, overdue }) {
  const [open, setOpen] = useState(false);
  const has = !!fu.estimateSentAt;
  const type = fu.estimateType;
  const measurement = fu.latestMeasurement;
  const current = !has ? "none" : type === "phone" ? "phone" : type === "written" ? "written" : null;
  const cur = !has
    ? measurement
      ? { label: measurementLabel(measurement), icon: "fa-ruler-combined", cls: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" }
      : { label: "Soumission", icon: "fa-file-lines", cls: "admin-bg admin-border admin-text-muted" }
    : type === "phone"
      ? { label: "Soum. téléphone", icon: "fa-phone", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" }
      : { label: "Soum. écrite", icon: "fa-file-lines", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={has ? (type === "phone" ? "Soumission verbale (téléphone)" : "Soumission écrite") : "Soumission"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${cur.cls} ${overdue ? "vt-flash-red" : ""}`}
      >
        <i className={`fas ${cur.icon}`}></i>
        {cur.label}
        <i className="fas fa-chevron-down text-[9px] opacity-60 ml-0.5"></i>
      </button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default"></button>
          <div className="absolute left-0 top-full mt-1 z-50 w-72 admin-bg border admin-border rounded-lg shadow-xl py-1 overflow-hidden">
            {measurement?.id && (
              <>
                <Link href={`/admin/mesures/${measurement.id}`} onClick={() => setOpen(false)} className="mx-2 mb-1 flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5 text-xs font-bold text-cyan-300">
                  <i className="fas fa-folder-open" />Ouvrir la fiche actuelle
                  <i className="fas fa-arrow-right ml-auto text-[9px]" />
                </Link>
                <div className="border-t admin-border my-1" />
              </>
            )}
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold admin-text-muted">Demander ou saisir les mesures</p>
            {MEASUREMENT_OPTIONS.map((o) => (
              <button
                key={`measure-${o.key}`}
                onClick={() => { setOpen(false); onMeasure(o.key); }}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-cyan-400/5 flex items-start gap-2 transition-colors"
              >
                <i className={`fas ${o.icon} w-4 mt-0.5 text-center text-cyan-400`}></i>
                <span><span className="admin-text font-semibold block">{o.label}</span><span className="admin-text-muted text-[10px] block mt-0.5">{o.detail}</span></span>
              </button>
            ))}
            <div className="border-t admin-border my-1" />
            <p className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-bold admin-text-muted">Soumission réellement transmise</p>
            {SOUMISSION_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOpen(false); onPick(o.key); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/5 flex items-center gap-2 transition-colors ${current === o.key ? "bg-white/5" : ""}`}
              >
                <i className={`fas ${o.icon} w-4 text-center ${o.tone}`}></i>
                <span className="admin-text">{o.label}</span>
                {current === o.key && <i className="fas fa-check ml-auto text-emerald-400 text-[10px]"></i>}
              </button>
            ))}
            <p className="px-3 py-2 text-[10px] admin-text-muted bg-black/5">Une option de mesure ne coche jamais « Soumission envoyée ».</p>
          </div>
        </>
      )}
    </div>
  );
}

function measurementLabel(measurement) {
  const source = measurement.source === "technician" ? "Mesures technicien" : measurement.source === "client" ? "Mesures client" : "Mesures téléphone";
  if (["received", "validated", "final", "completed"].includes(measurement.status)) return `${source} reçues`;
  if (measurement.status === "requested") return `${source} demandées`;
  return source;
}

// Menu déroulant compact pour la visite : faite / à faire / avec RDV / passage
// libre / sans visite. "rdv" ouvre le modal de planification (RdvModal).
const VISITE_OPTIONS = [
  { key: "done", label: "Visite faite", icon: "fa-circle-check", tone: "text-emerald-400" },
  { key: "todo", label: "Visite à faire", icon: "fa-clock", tone: "text-emerald-400" },
  { key: "rdv", label: "Visite avec RDV — choisir la date…", icon: "fa-calendar-check", tone: "text-emerald-400" },
  { key: "anytime", label: "Passage libre — client toujours sur place", icon: "fa-door-open", tone: "text-emerald-400" },
  { key: "none", label: "Sans visite", icon: "fa-ban", tone: "admin-text-muted" },
];

function VisiteMenu({ fu, onPick, overdue }) {
  const [open, setOpen] = useState(false);
  const done = !!fu.visitDoneAt || fu.visitStatus === "done";
  const status = fu.visitStatus;
  const current = done ? "done" : ["todo", "rdv", "anytime", "none"].includes(status) ? status : null;
  // Deux couleurs seulement (regle d'Erik) : un etat de visite CHOISI = vert
  // (a faire, RDV, passage libre, faite). Gris = sans visite / aucun etat.
  // Le rouge est reserve au negatif (sans reponse, refuse, retard SLA).
  const greenCls = "bg-emerald-500/15 border-emerald-400/40 text-emerald-300";
  const cur = done
    ? { label: "Visite faite", icon: "fa-location-dot", cls: greenCls }
    : status === "todo"
      ? { label: "Visite à faire", icon: "fa-clock", cls: greenCls }
      : status === "rdv"
        ? {
            label: fu.visitScheduledAt ? `RDV ${fmtDate(fu.visitScheduledAt)}${fu.visitTimeSlot ? ` · ${fu.visitTimeSlot}` : ""}` : "Visite avec RDV",
            icon: "fa-calendar-check",
            cls: greenCls,
          }
        : status === "anytime"
          ? { label: "Passage libre", icon: "fa-door-open", cls: greenCls }
          : status === "none"
            ? { label: "Sans visite", icon: "fa-ban", cls: "admin-bg admin-border admin-text-muted" }
            : { label: "Visite", icon: "fa-location-dot", cls: "admin-bg admin-border admin-text-muted" };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={done && fu.visitDoneAt ? `Visite faite · ${fmtDate(fu.visitDoneAt)}` : "État de la visite"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${cur.cls} ${overdue ? "vt-flash-red" : ""}`}
      >
        <i className={`fas ${cur.icon}`}></i>
        {cur.label}
        <i className="fas fa-chevron-down text-[9px] opacity-60 ml-0.5"></i>
      </button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default"></button>
          <div className="absolute left-0 top-full mt-1 z-50 w-56 admin-bg border admin-border rounded-lg shadow-xl py-1">
            {VISITE_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOpen(false); onPick(o.key); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/5 flex items-center gap-2 transition-colors ${current === o.key ? "bg-white/5" : ""}`}
              >
                <i className={`fas ${o.icon} w-4 text-center ${o.tone}`}></i>
                <span className="admin-text">{o.label}</span>
                {current === o.key && <i className="fas fa-check ml-auto text-emerald-400 text-[10px]"></i>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Modal « Visite avec RDV » : date + créneau (un RDV par créneau). Plages
// admin plus larges que le calendrier public : 6h à 20h. Crée le rendez-vous
// côté serveur via le PUT follow-ups { visitRdv } — il apparaît aussi dans
// l'onglet RDV du client.
const RDV_SLOTS = ["6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h"];

// Date locale -> "YYYY-MM-DD" sans passer par l'UTC (évite le décalage de fuseau).
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const MONTH_LABELS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// Mini-calendrier intégré au modal (remplace le sélecteur de date natif du
// téléphone, trop lourd sur Android) : un tap sur le jour = choisi.
function MiniCalendar({ value, onPick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const initial = value ? new Date(`${value}T12:00:00`) : today;
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const firstDay = month.getDay(); // 0 = dimanche
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="admin-card border admin-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canGoBack}
          className="w-9 h-9 rounded-lg admin-bg border admin-border admin-text disabled:opacity-25">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <span className="admin-text text-sm font-bold capitalize">{MONTH_LABELS[month.getMonth()]} {month.getFullYear()}</span>
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="w-9 h-9 rounded-lg admin-bg border admin-border admin-text">
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <span key={`${d}${i}`} className="admin-text-muted text-[11px] font-bold py-1">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const iso = ymd(date);
          const past = date < today;
          const selected = value === iso;
          const isToday = ymd(today) === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onPick(iso)}
              className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                selected
                  ? "bg-emerald-600 text-white"
                  : past
                    ? "admin-text-muted opacity-30 cursor-not-allowed"
                    : isToday
                      ? "border border-emerald-400/60 admin-text"
                      : "admin-text hover:bg-white/10"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThermosOrderStrip({ order, now }) {
  const statuses = {
    draft: ["Commande thermos à préparer", "fa-pen-ruler", "border-slate-400/25 bg-slate-400/5 admin-text-muted"],
    sent: ["Thermos commandés", "fa-paper-plane", "border-cyan-400/30 bg-cyan-400/8 text-cyan-300"],
    awaiting_confirmation: ["Réponse fournisseur attendue", "fa-hourglass-half", "border-amber-400/30 bg-amber-400/10 text-amber-200"],
    delayed: ["Commande thermos retardée", "fa-triangle-exclamation", "border-orange-400/30 bg-orange-400/10 text-orange-300"],
    ready: ["Thermos prêts chez le fournisseur", "fa-circle-check", "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"],
    received: ["Thermos reçus chez VosThermos", "fa-box-open", "border-teal-400/30 bg-teal-400/10 text-teal-300"],
    send_failed: ["Échec d'envoi au fournisseur", "fa-circle-exclamation", "border-rose-400/30 bg-rose-400/10 text-rose-300"],
  };
  const [label, icon, cls] = statuses[order.status] || [order.status, "fa-box", "admin-border admin-text-muted"];
  let remaining = "";
  if (order.expectedReadyAt && !["ready", "received"].includes(order.status)) {
    const days = Math.ceil((new Date(order.expectedReadyAt).getTime() - now) / 86400000);
    remaining = days > 0 ? `${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}` : days === 0 ? "prévue aujourd'hui" : `${Math.abs(days)} jour${Math.abs(days) > 1 ? "s" : ""} de retard`;
  }
  return (
    <Link href={`/admin/commandes-thermos?order=${order.id}`} className={`mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${cls}`}>
      <i className={`fas ${icon}`} />
      <span>{label}</span>
      {remaining && <span className="opacity-65">· {remaining}</span>}
      <span className="ml-auto font-mono opacity-60">{order.number}</span>
      <i className="fas fa-arrow-right text-[9px] opacity-50" />
    </Link>
  );
}

function uniqueDeliveryOptions(entries, normalize) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (!entry?.value) return false;
    const key = normalize(entry.value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deliveryStatus(result) {
  return typeof result === "string" ? result : result?.status || "not_requested";
}

function deliverySucceeded(result) {
  return ["sent", "accepted", "delivered"].includes(deliveryStatus(result));
}

function MeasurementModal({ fu, source, onClose, onCreated }) {
  const phoneOptions = uniqueDeliveryOptions([
    { value: fu.client?.phone, label: "Client actuel" },
    { value: fu.client?.secondaryPhone, label: "Client · numéro secondaire" },
    { value: fu.phone, label: "Numéro conservé dans ce suivi" },
  ], (value) => String(value).replace(/\D/g, "").slice(-10));
  const emailOptions = uniqueDeliveryOptions([
    { value: fu.client?.email, label: "Client actuel" },
    { value: fu.email, label: "Courriel conservé dans ce suivi" },
  ], (value) => String(value).trim().toLowerCase());
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");
  const [channels, setChannels] = useState({ sms: phoneOptions.length > 0, email: emailOptions.length > 0 });
  const [selectedPhone, setSelectedPhone] = useState(phoneOptions[0]?.value || "");
  const [selectedEmail, setSelectedEmail] = useState(emailOptions[0]?.value || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdMeasurement, setCreatedMeasurement] = useState(null);
  const [reuseUrl, setReuseUrl] = useState("");
  const [delivery, setDelivery] = useState(null);
  const creationKeyRef = useRef("");
  const creationStorageKey = `thermos-measurement-create:${fu.id}:${source}`;
  const sourceMeta = {
    technician: { title: "Mesures technicien", icon: "fa-ruler-combined", text: "Crée une fiche de mesures finales avec épaisseur et options. Elle pourra ensuite générer la commande fournisseur." },
    client: { title: "Demander les mesures au client", icon: "fa-mobile-screen-button", text: "Un lien privé permet au client de photographier ses fenêtres, corriger les divisions et entrer ses mesures pour la pré-soumission." },
    phone: { title: "Mesures reçues par téléphone", icon: "fa-headset", text: "Crée une fiche rapide et approximative pour préparer la pré-soumission. Un technicien devra confirmer avant la commande." },
  }[source];

  function closeModal() {
    if (busy) return;
    if (createdMeasurement) onCreated();
    else onClose();
  }

  useEffect(() => {
    if (source !== "technician") return;
    fetch("/api/admin/technicians", { cache: "no-store" }).then((r) => r.json()).then((data) => {
      const list = Array.isArray(data) ? data.filter((tech) => tech.isActive !== false) : [];
      setTechnicians(list);
      if (list.length === 1) setTechnicianId(String(list[0].id));
    }).catch(() => {});
  }, [source]);

  async function create() {
    if (source === "client" && !channels.sms && !channels.email) { setError("Choisissez au moins le texto ou le courriel."); return; }
    setBusy(true); setError("");
    try {
      let measurement = createdMeasurement;
      if (!measurement) {
        if (!creationKeyRef.current) {
          try { creationKeyRef.current = globalThis.sessionStorage?.getItem(creationStorageKey) || ""; } catch {}
          if (!creationKeyRef.current) creationKeyRef.current = globalThis.crypto?.randomUUID?.() || `measurement-${fu.id}-${source}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
          try { globalThis.sessionStorage?.setItem(creationStorageKey, creationKeyRef.current); } catch {}
        }
        const res = await fetch("/api/admin/measurements", {
          method: "POST", headers: MUTATION_HEADERS,
          body: JSON.stringify({
            clientId: fu.clientId,
            followUpId: fu.id,
            source,
            idempotencyKey: creationKeyRef.current,
            technicianId: technicianId ? Number(technicianId) : null,
            parentId: source === "technician" ? fu.latestMeasurement?.id || null : null,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Impossible de créer la fiche de mesures.");
        measurement = body.measurement || body;
        setCreatedMeasurement(measurement);
      }
      if (source === "client") {
        const requestedChannels = Object.entries(channels).filter(([, on]) => on).map(([key]) => key);
        const requestRes = await fetch(`/api/admin/measurements/${measurement.id}/request`, {
          method: "POST", headers: MUTATION_HEADERS,
          body: JSON.stringify({
            channels: requestedChannels,
            phone: channels.sms ? selectedPhone : undefined,
            email: channels.email ? selectedEmail : undefined,
            reuseUrl: reuseUrl || undefined,
          }),
        });
        const requestBody = await requestRes.json().catch(() => ({}));
        if (!requestRes.ok) throw new Error(requestBody.error || "La fiche existe, mais le lien n'a pas pu être envoyé.");
        const nextDelivery = requestBody.delivery || {};
        setDelivery(nextDelivery);
        if (requestBody.url) setReuseUrl(requestBody.url);
        const failedChannels = requestedChannels.filter((channel) => !deliverySucceeded(nextDelivery[channel]));
        if (!failedChannels.length) {
          try { globalThis.sessionStorage?.removeItem(creationStorageKey); } catch {}
          onCreated();
          return;
        }
        setChannels({ sms: failedChannels.includes("sms"), email: failedChannels.includes("email") });
        if (requestBody.url && requestedChannels.every((channel) => !deliverySucceeded(nextDelivery[channel]))) {
          await navigator.clipboard?.writeText(requestBody.url).catch(() => {});
        }
        return;
      }
      try { globalThis.sessionStorage?.removeItem(creationStorageKey); } catch {}
      onCreated();
      window.location.href = `/admin/mesures/${measurement.id}`;
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="admin-card border admin-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b admin-border flex gap-4 items-start"><div className="w-11 h-11 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center text-lg"><i className={`fas ${sourceMeta.icon}`} /></div><div className="min-w-0 flex-1"><h2 className="admin-text text-lg font-bold">{sourceMeta.title}</h2><p className="admin-text-muted text-sm mt-1">{fu.client?.name || fu.contactName}</p></div><button onClick={closeModal} disabled={busy} className="admin-text-muted p-2 disabled:opacity-40"><i className="fas fa-xmark" /></button></div>
        <div className="p-5 space-y-4">
          <p className="admin-text-muted text-sm leading-relaxed">{sourceMeta.text}</p>
          {source === "technician" && (
            <label className="block"><span className="block admin-text text-sm font-bold mb-1.5">Assigner au technicien</span><select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} className="w-full admin-input border admin-border rounded-xl px-3 py-3"><option value="">Non assignée — consultation admin</option>{technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}</select><span className="block admin-text-muted text-xs mt-1.5">Une fiche assignée apparaît automatiquement dans son écran Terrain.</span></label>
          )}
          {source === "client" && (
            <div className="space-y-3">
              <div>
                <p className="admin-text text-sm font-bold mb-2">Envoyer le lien par</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`rounded-xl border p-3 flex gap-2 items-center cursor-pointer ${channels.sms ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "admin-border admin-text-muted"}`}><input type="checkbox" checked={channels.sms} disabled={!phoneOptions.length} onChange={(e) => setChannels((current) => ({ ...current, sms: e.target.checked }))} /><i className="fas fa-comment-sms" /><span className="text-sm font-bold">Texto</span></label>
                  <label className={`rounded-xl border p-3 flex gap-2 items-center cursor-pointer ${channels.email ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "admin-border admin-text-muted"}`}><input type="checkbox" checked={channels.email} disabled={!emailOptions.length} onChange={(e) => setChannels((current) => ({ ...current, email: e.target.checked }))} /><i className="fas fa-envelope" /><span className="text-sm font-bold">Courriel</span></label>
                </div>
              </div>
              {channels.sms && (
                <label className="block"><span className="block admin-text text-sm font-bold mb-1.5">Numéro qui recevra le texto</span><select value={selectedPhone} onChange={(event) => setSelectedPhone(event.target.value)} className="w-full admin-input border admin-border rounded-xl px-3 py-3">{phoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.value}</option>)}</select></label>
              )}
              {channels.email && (
                <label className="block"><span className="block admin-text text-sm font-bold mb-1.5">Courriel destinataire</span><select value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)} className="w-full admin-input border admin-border rounded-xl px-3 py-3">{emailOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.value}</option>)}</select></label>
              )}
            </div>
          )}
          {delivery && (
            <div className="rounded-xl border admin-border p-3 space-y-2">
              {[['sms', 'Texto', 'fa-comment-sms'], ['email', 'Courriel', 'fa-envelope']].map(([key, label, icon]) => {
                const result = delivery[key];
                const status = deliveryStatus(result);
                if (status === "not_requested") return null;
                const succeeded = deliverySucceeded(result);
                const successLabel = status === "accepted" ? "accepté par Twilio" : "envoyé";
                return <div key={key} className={`flex items-start gap-2 text-sm ${succeeded ? "text-emerald-300" : "text-rose-300"}`}><i className={`fas ${succeeded ? "fa-circle-check" : "fa-circle-xmark"} mt-0.5`} /><div><span className="font-bold"><i className={`fas ${icon} mr-1.5 opacity-70`} />{label}: {succeeded ? successLabel : "échec"}</span>{result?.message && <p className="text-xs mt-0.5 opacity-90">{result.message}</p>}</div></div>;
              })}
              {reuseUrl && Object.values(delivery).some((result) => !deliverySucceeded(result) && deliveryStatus(result) !== "not_requested") && (
                <button type="button" onClick={async () => { await navigator.clipboard?.writeText(reuseUrl).catch(() => {}); }} className="rounded-lg border admin-border px-3 py-2 text-xs font-bold admin-text"><i className="fas fa-copy mr-2" />Copier le lien manuellement</button>
              )}
            </div>
          )}
          <div className="rounded-lg border border-amber-400/25 bg-amber-400/8 text-amber-100 p-3 text-xs"><i className="fas fa-circle-info mr-2" />Cette action ne marque pas la soumission comme envoyée.</div>
          {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 text-red-200 p-3 text-sm">{error}</p>}
        </div>
        <div className="p-4 border-t admin-border flex justify-end gap-2"><button onClick={closeModal} disabled={busy} className="rounded-xl border admin-border px-4 py-2.5 admin-text disabled:opacity-40">{createdMeasurement ? "Fermer" : "Annuler"}</button><button onClick={create} disabled={busy} className="rounded-xl bg-[var(--color-red)] text-white px-5 py-2.5 font-bold disabled:opacity-50"><i className={`fas ${busy ? "fa-spinner fa-spin" : source === "client" ? "fa-paper-plane" : "fa-arrow-right"} mr-2`} />{busy ? "Préparation…" : source === "client" ? (createdMeasurement ? "Réessayer l’envoi" : "Créer et envoyer") : "Créer la fiche"}</button></div>
      </div>
    </div>
  );
}

function RdvModal({ fu, onClose, onSaved }) {
  const currentDay = fu.visitScheduledAt ? String(fu.visitScheduledAt).slice(0, 10) : "";
  const [date, setDate] = useState(currentDay || new Date().toLocaleDateString("fr-CA"));
  const [slot, setSlot] = useState(fu.visitTimeSlot || "");
  const [booked, setBooked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const name = fu.client?.name || fu.contactName || fu.title || "Sans nom";

  // Créneaux déjà réservés ce jour-là (route publique du calendrier de RDV).
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { setBooked([]); return; }
    let alive = true;
    fetch(`/api/appointments?date=${date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setBooked(Array.isArray(d?.bookedSlots) ? d.bookedSlots : []); })
      .catch(() => { if (alive) setBooked([]); });
    return () => { alive = false; };
  }, [date]);

  async function submit() {
    if (!date || !slot || saving) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: MUTATION_HEADERS,
        body: JSON.stringify({ visitRdv: { date, timeSlot: slot } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur — réessayez");
      onSaved(data);
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-bg border admin-border rounded-xl w-full max-w-md shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">
            <i className="fas fa-calendar-check mr-2 text-emerald-400"></i>Visite avec RDV
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center"><i className="fas fa-times admin-text-muted"></i></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="admin-text text-sm font-semibold">{name}</p>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Date du rendez-vous</label>
            <MiniCalendar value={date} onPick={(iso) => { setDate(iso); setSlot(""); setErr(""); }} />
            {date && (
              <p className="admin-text text-xs font-semibold mt-1.5">
                <i className="fas fa-calendar mr-1 text-emerald-400"></i>
                {new Date(`${date}T12:00:00`).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            )}
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Heure</label>
            <div className="grid grid-cols-5 gap-2">
              {RDV_SLOTS.map((s) => {
                // Le créneau déjà occupé par CE suivi reste sélectionnable (on modifie son propre RDV).
                const isMine = date === currentDay && s === fu.visitTimeSlot;
                const taken = booked.includes(s) && !isMine;
                return (
                  <button key={s} type="button" disabled={taken}
                    onClick={() => { setSlot(s); setErr(""); }}
                    className={`h-11 rounded-lg border text-sm font-bold transition-colors ${
                      slot === s
                        ? "bg-emerald-500/25 border-emerald-400 text-emerald-200"
                        : taken
                          ? "admin-bg admin-border admin-text-muted opacity-35 cursor-not-allowed line-through"
                          : "admin-card admin-border admin-text hover:border-emerald-400/60"
                    }`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="admin-text-muted text-[11px] mt-1.5">Les heures barrées sont déjà réservées ce jour-là.</p>
          </div>
          {err && (
            <p className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-semibold">{err}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
            <button type="button" onClick={submit} disabled={!date || !slot || saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold disabled:opacity-40">
              {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Planification…</> : <><i className="fas fa-check mr-2"></i>Confirmer le RDV</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation de suppression d'une carte du suivi. Par défaut on ne supprime
// que le suivi ; une case permet de supprimer AUSSI la fiche client (l'API
// refuse si des bons de travail y sont liés — on affiche alors l'erreur).
function DeleteModal({ fu, onClose, onDeleted }) {
  const [alsoClient, setAlsoClient] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const name = fu.client?.name || fu.contactName || fu.title || "Sans nom";

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      if (alsoClient && fu.clientId) {
        const resC = await fetch(`/api/admin/clients/${fu.clientId}`, { method: "DELETE" });
        if (!resC.ok) {
          const d = await resC.json().catch(() => ({}));
          throw new Error(d.error || "Impossible de supprimer la fiche client");
        }
      }
      const res = await fetch(`/api/admin/follow-ups/${fu.id}`, { method: "DELETE", headers: MUTATION_HEADERS });
      if (!res.ok) throw new Error("Erreur — réessayez");
      onDeleted();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-bg border admin-border rounded-xl w-full max-w-md shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg"><i className="fas fa-trash-can mr-2 text-rose-400"></i>Supprimer ce suivi?</h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center"><i className="fas fa-times admin-text-muted"></i></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="admin-text text-sm">
            <span className="font-bold">{name}</span> — la carte disparaît du suivi. Cette action est définitive.
          </p>
          {fu.clientId && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={alsoClient} onChange={(e) => { setAlsoClient(e.target.checked); setErr(""); }}
                className="mt-0.5 w-4 h-4 accent-rose-500" />
              <span className="text-sm">
                <span className="admin-text font-semibold block">Supprimer aussi la fiche client</span>
                <span className="admin-text-muted text-xs">Dossier, notes, photos, chat et appels du client. Refusé si des bons de travail y sont liés.</span>
              </span>
            </label>
          )}
          {err && (
            <p className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-semibold">{err}</p>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
            <button onClick={confirm} disabled={busy}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {busy ? <><i className="fas fa-spinner fa-spin mr-2"></i>Suppression…</> : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ contactName: "", phone: "", email: "", service: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!form.contactName.trim()) { setErr("Le nom est requis"); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/follow-ups", {
        method: "POST",
        headers: MUTATION_HEADERS,
        body: JSON.stringify({ title: form.contactName, contactName: form.contactName, phone: form.phone, email: form.email, service: form.service }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Erreur"); }
      onCreated();
    } catch (e2) { setErr(e2.message); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-bg border admin-border rounded-xl w-full max-w-md shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">Nouveau suivi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center"><i className="fas fa-times admin-text-muted"></i></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Nom du client *</label>
            <input autoFocus value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Service / besoin</label>
            <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Ex: Remplacement thermos" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">{saving ? "Création…" : "Créer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
