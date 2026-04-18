"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BATCH_SIZE = 10;

export default function TranslateProductsPage() {
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, currentBatch: [] });
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/products/translate");
      const d = await res.json();
      setStats(d);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadStats(); }, []);

  function appendLog(msg, kind = "info") {
    setLog((l) => [{ ts: new Date(), msg, kind }, ...l].slice(0, 100));
  }

  async function runOnce() {
    const res = await fetch("/api/admin/products/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: BATCH_SIZE }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
    return d;
  }

  async function startBatch() {
    if (!confirm(`Traduire ${stats?.missing || 0} produits manquants?\n\nCecoutera environ $${((stats?.missing || 0) * 0.003).toFixed(2)} USD en API Claude.\nDuree estimee: ~${Math.ceil((stats?.missing || 0) / BATCH_SIZE)} batchs x 15s = ${Math.ceil((stats?.missing || 0) / BATCH_SIZE * 15 / 60)} min.`)) return;

    setRunning(true);
    setError("");
    setLog([]);
    setProgress({ done: 0, total: stats?.missing || 0, currentBatch: [] });

    let totalDone = 0;
    let keepGoing = true;

    while (keepGoing) {
      try {
        appendLog(`Lancement batch de ${BATCH_SIZE}...`, "info");
        const result = await runOnce();
        totalDone += result.processed;
        setProgress({ done: totalDone, total: stats?.missing || 0, currentBatch: result.translations || [] });

        if (result.processed > 0) {
          appendLog(`${result.processed} produits traduits (reste: ${result.remaining})`, "success");
          result.translations?.slice(0, 3).forEach((t) => {
            appendLog(`  #${t.id}: ${t.nameEn}`, "detail");
          });
        }

        if (result.errors?.length) {
          result.errors.forEach((e) => appendLog(`Erreur #${e.id}: ${e.error}`, "error"));
        }

        if (result.done || result.remaining === 0 || result.processed === 0) {
          appendLog("Traduction terminee.", "success");
          keepGoing = false;
        } else {
          // small delay to avoid rate limits
          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (e) {
        appendLog(`Erreur batch: ${e.message}`, "error");
        setError(e.message);
        keepGoing = false;
      }
    }

    setRunning(false);
    loadStats();
  }

  async function retranslateOne(id) {
    if (!confirm(`Re-traduire le produit #${id}?`)) return;
    try {
      const res = await fetch("/api/admin/products/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      appendLog(`#${id} re-traduit: ${d.translations?.[0]?.nameEn}`, "success");
    } catch (e) {
      appendLog(`Erreur: ${e.message}`, "error");
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin/produits" className="admin-text-muted hover:admin-text text-sm transition-colors mb-2 inline-block">
            <i className="fas fa-arrow-left mr-1"></i> Retour aux produits
          </Link>
          <h1 className="admin-text text-2xl font-extrabold">
            <i className="fas fa-language mr-2 text-blue-400"></i>
            Traduction automatique EN
          </h1>
          <p className="admin-text-muted text-sm mt-1">
            Traduit nameEn, descriptionEn et detailedDescriptionEn via Claude API.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="admin-card border rounded-xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider">Total produits</p>
          <p className="admin-text text-3xl font-extrabold mt-1">{stats?.total ?? "—"}</p>
        </div>
        <div className="admin-card border rounded-xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider">Deja traduits</p>
          <p className="text-3xl font-extrabold mt-1 text-green-400">{stats?.translated ?? "—"}</p>
        </div>
        <div className="admin-card border rounded-xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider">Manquants</p>
          <p className="text-3xl font-extrabold mt-1 text-orange-400">{stats?.missing ?? "—"}</p>
        </div>
      </div>

      {/* Action */}
      <div className="admin-card border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="admin-text font-bold">Traduire tous les produits manquants</p>
            <p className="admin-text-muted text-sm mt-1">
              Batch de {BATCH_SIZE} produits par appel API. Cout estime: ~${((stats?.missing || 0) * 0.003).toFixed(2)} USD.
            </p>
          </div>
          <button
            onClick={startBatch}
            disabled={running || !stats?.missing}
            className="px-6 py-3 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {running ? (
              <><i className="fas fa-spinner fa-spin"></i> En cours... {progress.done}/{progress.total}</>
            ) : (
              <><i className="fas fa-magic"></i> Demarrer la traduction</>
            )}
          </button>
        </div>

        {running && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="admin-text text-sm font-bold">{progress.done} / {progress.total}</span>
              <span className="admin-text-muted text-xs">{pct}%</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 mb-6">
          <i className="fas fa-exclamation-triangle mr-2"></i>{error}
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="admin-card border rounded-xl p-5">
          <p className="admin-text font-bold mb-3">
            <i className="fas fa-terminal mr-2"></i>Journal
          </p>
          <div className="max-h-96 overflow-y-auto space-y-1 font-mono text-xs">
            {log.map((e, i) => (
              <div
                key={i}
                className={
                  e.kind === "error" ? "text-red-400" :
                  e.kind === "success" ? "text-green-400" :
                  e.kind === "detail" ? "admin-text-muted pl-4" :
                  "admin-text"
                }
              >
                <span className="admin-text-muted opacity-50">[{new Date(e.ts).toLocaleTimeString()}]</span> {e.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
