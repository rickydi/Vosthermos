"use client";

import { useState } from "react";

export default function IndexNowPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [customUrls, setCustomUrls] = useState("");

  async function pingAll() {
    if (!confirm("Soumettre TOUTES les URLs du sitemap a IndexNow (Bing + Yandex)?\n\nCela peut prendre 30-60s selon le nombre d'URLs.")) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur");
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function pingCustom() {
    const urls = customUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      setError("Ajoutez au moins une URL");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "custom", urls }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur");
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="admin-card border rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="admin-text font-extrabold text-lg mb-1">
            <i className="fas fa-bolt mr-2 text-[var(--color-red)]"></i>
            IndexNow — Bing + Yandex
          </h2>
          <p className="admin-text-muted text-sm max-w-2xl">
            Notifie Bing, Yandex, Seznam et DuckDuckGo qu&apos;une page a ete modifiee.
            <strong className="admin-text"> ChatGPT, Copilot et Perplexity utilisent Bing</strong> pour leurs recherches en temps reel.
            Sans indexation Bing, aucun LLM ne trouvera le site.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="admin-bg border admin-border rounded-xl p-4">
          <h3 className="admin-text font-bold text-sm mb-2">
            <i className="fas fa-rocket mr-2 text-blue-400"></i>Ping toutes les URLs
          </h3>
          <p className="admin-text-muted text-xs mb-3">
            Soumet toutes les pages du sitemap (~1000 URLs) a IndexNow en batchs de 100.
            Recommande apres un gros changement ou un nouveau deploiement.
          </p>
          <button
            onClick={pingAll}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Soumission...</> :
              <><i className="fas fa-globe"></i> Soumettre toutes les URLs</>}
          </button>
        </div>

        <div className="admin-bg border admin-border rounded-xl p-4">
          <h3 className="admin-text font-bold text-sm mb-2">
            <i className="fas fa-pen mr-2 text-orange-400"></i>Ping URLs specifiques
          </h3>
          <textarea
            value={customUrls}
            onChange={(e) => setCustomUrls(e.target.value)}
            placeholder={"Une URL par ligne\nhttps://www.vosthermos.com/guides/remplacer-roulette-porte-patio\n/boutique/..."}
            className="admin-input border rounded-lg px-3 py-2 text-xs w-full h-20 font-mono mb-2"
          />
          <button
            onClick={pingCustom}
            disabled={loading || !customUrls.trim()}
            className="w-full px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium hover:bg-white/5 disabled:opacity-50"
          >
            <i className="fas fa-paper-plane mr-2"></i>Soumettre ces URLs
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
          <i className="fas fa-exclamation-triangle mr-2"></i>{error}
        </div>
      )}

      {result && (
        <div className="admin-bg border admin-border rounded-xl p-4 mt-2">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="admin-text font-bold text-sm">
              <i className={`fas ${result.failCount === 0 ? "fa-check-circle text-green-400" : "fa-exclamation-circle text-orange-400"} mr-2`}></i>
              {result.message}
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">OK: {result.okCount}</span>
              {result.failCount > 0 && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-bold">Fail: {result.failCount}</span>}
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full font-bold">Total: {result.totalSubmitted}</span>
            </div>
          </div>
          <details className="mt-2">
            <summary className="admin-text-muted text-xs cursor-pointer hover:admin-text">
              Details par batch ({result.batches?.length || 0})
            </summary>
            <div className="mt-2 space-y-1">
              {result.batches?.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded ${b.ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {b.status || "?"}
                  </span>
                  <span className="admin-text-muted">Batch {i + 1}: {b.count} URLs</span>
                  {b.body && <span className="admin-text-muted truncate max-w-md">{b.body}</span>}
                </div>
              ))}
            </div>
          </details>
          <p className="admin-text-muted text-xs mt-3">
            <i className="fas fa-info-circle mr-1"></i>
            Code 200/202 = accepte. Bing/Yandex vont crawler les URLs dans les prochaines heures.
            Verifier sur <a className="text-blue-400 hover:underline" href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">Bing Webmaster Tools</a> dans 24-48h.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[var(--admin-border)]">
        <p className="admin-text-muted text-xs">
          <i className="fas fa-key mr-2"></i>
          Cle IndexNow: <code className="admin-text font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded">vosthermos-indexnow-key-2026</code>
          <a
            href="https://www.vosthermos.com/vosthermos-indexnow-key-2026.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-400 hover:underline text-[11px]"
          >
            verifier la cle
          </a>
        </p>
      </div>
    </div>
  );
}
