"use client";

import { useEffect, useState } from "react";

export default function SupplierConfirmationClient({ token, initialAnswer = "" }) {
  const [order, setOrder] = useState(null);
  const [answer, setAnswer] = useState(["yes", "no"].includes(initialAnswer) ? initialAnswer : "");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/public/thermos-order-response/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Ce lien n’est plus valide.");
        setOrder(body.order || body);
        if (body.used) setDone(true);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (!answer) { setError("Choisissez Oui ou Non."); return; }
    if (answer === "no" && !date) { setError("Indiquez la nouvelle date prévue."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch(`/api/public/thermos-order-response/${encodeURIComponent(token)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, expectedReadyAt: answer === "no" ? date : undefined, note: answer === "no" ? note : undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Réponse impossible.");
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  return (
    <main className="min-h-dvh bg-[#08111f] text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center gap-3 mb-8"><div className="w-12 h-12 bg-[var(--color-red)] rounded-xl flex items-center justify-center font-black">VT</div><div><p className="font-bold text-xl">VosThermos</p><p className="text-white/45 text-xs">Confirmation fournisseur sécurisée</p></div></header>
        {error && !order ? <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-red-100"><h1 className="font-bold text-xl mb-2">Lien non disponible</h1><p>{error}</p></div> : !order ? <div className="text-white/50 text-center py-16"><i className="fas fa-spinner fa-spin text-2xl" /></div> : done ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center text-emerald-100"><i className="fas fa-circle-check text-4xl mb-4" /><h1 className="font-bold text-2xl">Réponse enregistrée</h1><p className="mt-2 opacity-70">Merci. Le suivi VosThermos a été ajusté automatiquement.</p></div> : (
          <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10"><p className="text-cyan-300 font-mono text-sm">{order.number}</p><h1 className="font-black text-2xl mt-2">Avez-vous reçu cette commande de thermos?</h1><p className="text-white/50 text-sm mt-2">Pour éviter les clics automatiques des systèmes de courriel, la réponse est enregistrée seulement après le bouton de confirmation ci-dessous.</p></div>
            <div className="p-6 space-y-4">
              <button type="button" onClick={() => setAnswer("yes")} className={`w-full rounded-xl border p-5 text-left transition-colors ${answer === "yes" ? "border-emerald-400 bg-emerald-400/15" : "border-white/10 bg-white/5"}`}><span className="flex gap-3 items-center"><i className="fas fa-circle-check text-emerald-400 text-2xl" /><span><strong className="block">Oui, la commande est arrivée</strong><span className="text-white/50 text-sm">Elle sera marquée prête chez le fournisseur.</span></span></span></button>
              <button type="button" onClick={() => setAnswer("no")} className={`w-full rounded-xl border p-5 text-left transition-colors ${answer === "no" ? "border-amber-400 bg-amber-400/15" : "border-white/10 bg-white/5"}`}><span className="flex gap-3 items-center"><i className="fas fa-clock text-amber-300 text-2xl" /><span><strong className="block">Non, elle n’est pas encore arrivée</strong><span className="text-white/50 text-sm">Une nouvelle date ajustera le décompte.</span></span></span></button>
              {answer === "no" && <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 space-y-3"><label className="block"><span className="text-sm font-bold block mb-1">Nouvelle date prévue *</span><input type="date" required value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-3 text-white" /></label><label className="block"><span className="text-sm font-bold block mb-1">Note (facultative)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-3 text-white" placeholder="Raison ou précision…" /></label></div>}
              {error && <p className="rounded-lg bg-red-400/10 border border-red-400/25 text-red-200 p-3 text-sm">{error}</p>}
              <button type="submit" disabled={sending || !answer} className="w-full rounded-xl bg-[var(--color-red)] py-4 font-black text-white disabled:opacity-40"><i className={`fas ${sending ? "fa-spinner fa-spin" : "fa-paper-plane"} mr-2`} />Confirmer ma réponse</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
