"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminStream, ADMIN_TAB_ID } from "@/components/admin/adminStream";
import { FOLLOW_UP_MILESTONES } from "@/lib/follow-up-columns";

// Header envoye avec chaque mutation: le serveur le rejoue dans l'evenement SSE
// (origin), ce qui permet d'ignorer l'echo de nos propres clics (deja appliques
// en optimiste) au lieu de recharger 344 Ko de liste a chaque coche.
const MUTATION_HEADERS = { "Content-Type": "application/json", "X-Admin-Tab": ADMIN_TAB_ID };

const fmtMoney = (n) => (n === null || n === undefined ? null : new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n));
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
  if (fu.visitStatus === "todo" && !fu.visitDoneAt) return { stage: "visit", overdue: overdue("visit", fu.contactedAt) };
  if (!fu.estimateSentAt) return { stage: "soumission", overdue: overdue("soumission", fu.visitDoneAt || fu.contactedAt) };
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
    if (!["connected", "follow_up.changed", "work_order.changed", "appointment.changed", "client_photo.added"].includes(e?.type)) return;
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
      if (!res.ok) throw new Error();
      const updated = await res.json();
      patchLocal(fu.id, updated);
    } catch {
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {fu.clientId ? (
                        <Link href={`/admin/clients/${fu.clientId}`} className="admin-text font-bold hover:text-[var(--color-red)] transition-colors">{name}</Link>
                      ) : (
                        <span className="admin-text font-bold">{name}</span>
                      )}
                      {fu.clientId && (
                        <Link href={`/admin/clients/${fu.clientId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--color-red)] text-white shadow-sm hover:opacity-90 transition-opacity">
                          <i className="fas fa-folder-open"></i>Ouvrir client
                        </Link>
                      )}
                    </div>
                    <div className="admin-text-muted text-xs mt-0.5 flex flex-wrap gap-x-3">
                      {fu.service && <span>{fu.service}</span>}
                      {fu.phone && <span><i className="fas fa-phone mr-1 opacity-60"></i>{fu.phone}</span>}
                      {fmtMoney(fu.estimateAmount) && <span className="admin-text font-semibold">{fmtMoney(fu.estimateAmount)}</span>}
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
                      return <SoumissionMenu key={m.key} fu={fu} onPick={(k) => setSoumission(fu, k === "none" ? null : k)} overdue={overdueStage === "soumission"} />;
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
    </div>
  );
}

// Menu déroulant compact pour l'état de contact (remplace les 2 boutons "Contacté"
// + "Sans réponse"). 4 choix : rejoint / 1-2 tentatives sans réponse / à contacter.
const CONTACT_STATES = {
  none: { label: "À contacter", icon: "fa-circle", cls: "admin-bg admin-border admin-text-muted" },
  a1: { label: "1 tentative", icon: "fa-phone-slash", cls: "border-amber-400/50 text-amber-300 bg-amber-500/10" },
  a2: { label: "2 tentatives", icon: "fa-phone-slash", cls: "border-rose-400/50 text-rose-300 bg-rose-500/10" },
  reached: { label: "Contacté", icon: "fa-circle-check", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" },
};
const CONTACT_OPTIONS = [
  { key: "reached", label: "Contacté (rejoint)", icon: "fa-circle-check", tone: "text-emerald-400" },
  { key: "a1", label: "1 tentative — sans réponse", icon: "fa-phone-slash", tone: "text-amber-400" },
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
  lost: { label: "Refusé", icon: "fa-thumbs-down", cls: "bg-slate-500/15 border-slate-400/50 text-slate-300" },
};
const APPROVAL_OPTIONS = [
  { key: "won", label: "Approuvé (gagné)", icon: "fa-thumbs-up", tone: "text-emerald-400" },
  { key: "lost", label: "Refusé (perdu)", icon: "fa-thumbs-down", tone: "text-slate-400" },
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
  { key: "written", label: "Soumission écrite", icon: "fa-file-lines", tone: "text-emerald-400" },
  { key: "phone", label: "Soumission par téléphone", icon: "fa-phone", tone: "text-sky-400" },
  { key: "none", label: "Pas de soumission (réinitialiser)", icon: "fa-rotate-left", tone: "admin-text-muted" },
];

function SoumissionMenu({ fu, onPick, overdue }) {
  const [open, setOpen] = useState(false);
  const has = !!fu.estimateSentAt;
  const type = fu.estimateType;
  const current = !has ? "none" : type === "phone" ? "phone" : type === "written" ? "written" : null;
  const cur = !has
    ? { label: "Soumission", icon: "fa-file-lines", cls: "admin-bg admin-border admin-text-muted" }
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
          <div className="absolute left-0 top-full mt-1 z-50 w-60 admin-bg border admin-border rounded-lg shadow-xl py-1">
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
          </div>
        </>
      )}
    </div>
  );
}

// Menu déroulant compact pour la visite : faite / à faire / avec RDV / passage
// libre / sans visite. "rdv" ouvre le modal de planification (RdvModal).
const VISITE_OPTIONS = [
  { key: "done", label: "Visite faite", icon: "fa-circle-check", tone: "text-emerald-400" },
  { key: "todo", label: "Visite à faire", icon: "fa-clock", tone: "text-amber-400" },
  { key: "rdv", label: "Visite avec RDV — choisir la date…", icon: "fa-calendar-check", tone: "text-violet-400" },
  { key: "anytime", label: "Passage libre — client toujours sur place", icon: "fa-door-open", tone: "text-sky-400" },
  { key: "none", label: "Sans visite", icon: "fa-ban", tone: "admin-text-muted" },
];

function VisiteMenu({ fu, onPick, overdue }) {
  const [open, setOpen] = useState(false);
  const done = !!fu.visitDoneAt || fu.visitStatus === "done";
  const status = fu.visitStatus;
  const current = done ? "done" : ["todo", "rdv", "anytime", "none"].includes(status) ? status : null;
  const cur = done
    ? { label: "Visite faite", icon: "fa-location-dot", cls: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" }
    : status === "todo"
      ? { label: "Visite à faire", icon: "fa-clock", cls: "border-amber-400/50 text-amber-300 bg-amber-500/10" }
      : status === "rdv"
        ? {
            label: fu.visitScheduledAt ? `RDV ${fmtDate(fu.visitScheduledAt)}${fu.visitTimeSlot ? ` · ${fu.visitTimeSlot}` : ""}` : "Visite avec RDV",
            icon: "fa-calendar-check",
            cls: "border-violet-400/50 text-violet-300 bg-violet-500/10",
          }
        : status === "anytime"
          ? { label: "Passage libre", icon: "fa-door-open", cls: "border-sky-400/50 text-sky-300 bg-sky-500/10" }
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
                  ? "bg-violet-600 text-white"
                  : past
                    ? "admin-text-muted opacity-30 cursor-not-allowed"
                    : isToday
                      ? "border border-violet-400/60 admin-text"
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
            <i className="fas fa-calendar-check mr-2 text-violet-400"></i>Visite avec RDV
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
                <i className="fas fa-calendar mr-1 text-violet-400"></i>
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
                        ? "bg-violet-500/25 border-violet-400 text-violet-200"
                        : taken
                          ? "admin-bg admin-border admin-text-muted opacity-35 cursor-not-allowed line-through"
                          : "admin-card admin-border admin-text hover:border-violet-400/60"
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
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-bold disabled:opacity-40">
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
