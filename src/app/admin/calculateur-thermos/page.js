"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ClientPicker from "@/components/admin/ClientPicker";
import {
  ACCESS_OPTIONS,
  THERMOS_PRICING_DEFAULTS,
  calculateThermosQuote,
  emptyThermosLine,
  normalizeThermosPricingSettings,
} from "@/lib/thermos-pricing";

function money(value) {
  return `${Number(value || 0).toFixed(2)}$`;
}

function LineInput({ label, children }) {
  return (
    <label className="block">
      <span className="admin-text-muted mb-1 block text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

export default function AdminThermosCalculatorPage() {
  const [settings, setSettings] = useState(THERMOS_PRICING_DEFAULTS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [city, setCity] = useState("");
  const [lines, setLines] = useState([emptyThermosLine()]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/thermos-pricing", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled) setSettings(normalizeThermosPricingSettings(body.settings));
      })
      .catch(() => {
        if (!cancelled) setError("Prix thermos non charges. Les valeurs par defaut sont utilisees.");
      })
      .finally(() => {
        if (!cancelled) setSettingsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const quote = useMemo(() => calculateThermosQuote(lines, settings), [lines, settings]);
  const workingCity = city || selectedClient?.city || "";

  function updateLine(index, patch) {
    setCopied(false);
    setLines((current) => current.map((line, lineIndex) => (
      lineIndex === index ? { ...line, ...patch } : line
    )));
  }

  function addLine() {
    setLines((current) => [...current, emptyThermosLine()]);
  }

  function removeLine(index) {
    if (lines.length <= 1) return;
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function pickClient(client) {
    setSelectedClient(client);
    setCity(client.city || "");
    setClientPickerOpen(false);
  }

  function buildSummary() {
    const clientName = selectedClient?.name || "Client non selectionne";
    const phone = selectedClient?.phone || selectedClient?.secondaryPhone || "-";
    const address = selectedClient?.address || "-";
    const lineText = quote.lines.map((line, index) => {
      const options = [
        line.lowE ? "Low-E" : null,
        line.argon ? "argon" : null,
        line.tempered ? "trempe" : null,
        line.grill ? "carrelage" : null,
        line.access !== "easy" ? `acces ${line.access}` : null,
      ].filter(Boolean).join(", ") || "standard";
      return `${index + 1}. ${line.quantity} x ${line.width}" x ${line.height}" (${line.sqftPerUnit} pi2) - ${options} - ${money(line.lineSubtotal)}`;
    });

    return [
      "Estimation thermos Vosthermos",
      `Client: ${clientName}`,
      `Telephone: ${phone}`,
      `Adresse: ${address}`,
      `Ville: ${workingCity || "-"}`,
      "",
      ...lineText,
      "",
      `Sous-total recommande: ${money(quote.totals.subtotal)}`,
      `TPS: ${money(quote.totals.tps)}`,
      `TVQ: ${money(quote.totals.tvq)}`,
      `Total recommande: ${money(quote.totals.total)}`,
      `Fourchette taxes incluses: ${money(quote.totals.totalMinWithTaxes)} - ${money(quote.totals.totalMaxWithTaxes)}`,
      "",
      "A confirmer apres mesure exacte et validation des options.",
    ].join("\n");
  }

  async function copySummary() {
    setError("");
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setError("Copie automatique bloquee par le navigateur.");
    }
  }

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Calculateur thermos</h1>
          <p className="admin-text-muted mt-1 max-w-3xl text-sm">
            Calcul interne pour donner une fourchette rapide au client avant la soumission finale.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/parametres#thermos-pricing"
            className="rounded-lg border admin-border px-4 py-2 text-sm font-bold admin-text hover:bg-white/5"
          >
            <i className="fas fa-gear mr-2"></i>Parametres de prix
          </Link>
          <Link
            href="/outils/cout-thermos"
            className="rounded-lg border admin-border px-4 py-2 text-sm font-bold admin-text hover:bg-white/5"
          >
            <i className="fas fa-globe mr-2"></i>Version publique
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
          {error}
        </div>
      )}

      <div className="grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="admin-card rounded-xl border p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="admin-text font-bold">Client</h2>
                <p className="admin-text-muted text-xs">Optionnel, mais pratique pour copier une estimation complete.</p>
              </div>
              <button
                type="button"
                onClick={() => setClientPickerOpen(true)}
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600"
              >
                <i className="fas fa-address-book mr-2"></i>Choisir client
              </button>
            </div>

            {selectedClient ? (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border admin-border bg-white/[0.02] p-3">
                <div>
                  <p className="admin-text font-bold">{selectedClient.name}</p>
                  <p className="admin-text-muted text-sm">{selectedClient.phone || "-"}</p>
                  {selectedClient.secondaryPhone && <p className="admin-text-muted text-sm">{selectedClient.secondaryPhone}</p>}
                  {selectedClient.address && (
                    <p className="admin-text-muted text-sm">
                      {selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-500"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <p className="admin-text-muted rounded-lg border admin-border bg-white/[0.02] p-3 text-sm">
                Aucun client selectionne. Le calcul peut quand meme etre fait.
              </p>
            )}

            <div className="mt-4">
              <LineInput label="Ville / secteur">
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ex: Montreal, Rosemont, Verdun"
                  className="admin-input w-full rounded-lg border px-3 py-2.5 text-sm"
                />
              </LineInput>
            </div>
          </div>

          <div className="admin-card rounded-xl border p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="admin-text font-bold">Thermos a estimer</h2>
                <p className="admin-text-muted text-xs">Mesures en pouces. Chaque ligne peut avoir ses propres options.</p>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
              >
                <i className="fas fa-plus mr-2"></i>Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => {
                const computed = quote.lines[index];
                return (
                  <div key={index} className="rounded-xl border admin-border bg-white/[0.02] p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="admin-text text-sm font-bold">Thermos #{index + 1}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-cyan-600">{money(computed?.lineSubtotal)}</span>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-sm text-amber-500 hover:text-amber-400"
                            title="Retirer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <LineInput label="Largeur">
                        <input
                          type="number"
                          min="1"
                          step="0.125"
                          value={line.width}
                          onChange={(event) => updateLine(index, { width: event.target.value })}
                          className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </LineInput>
                      <LineInput label="Hauteur">
                        <input
                          type="number"
                          min="1"
                          step="0.125"
                          value={line.height}
                          onChange={(event) => updateLine(index, { height: event.target.value })}
                          className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </LineInput>
                      <LineInput label="Quantite">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(event) => updateLine(index, { quantity: event.target.value })}
                          className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </LineInput>
                      <LineInput label="Acces">
                        <select
                          value={line.access}
                          onChange={(event) => updateLine(index, { access: event.target.value })}
                          className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                        >
                          {ACCESS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </LineInput>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ["lowE", "Low-E"],
                        ["argon", "Argon"],
                        ["tempered", "Trempe"],
                        ["grill", "Carrelage"],
                      ].map(([key, label]) => (
                        <label key={key} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border admin-border px-3 py-2 text-xs font-bold admin-text">
                          <input
                            type="checkbox"
                            checked={Boolean(line[key])}
                            onChange={(event) => updateLine(index, { [key]: event.target.checked })}
                            className="rounded"
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 grid gap-2 text-xs md:grid-cols-4">
                      <p className="admin-text-muted">Surface: <span className="admin-text font-bold">{computed?.sqftPerUnit || 0} pi2</span></p>
                      <p className="admin-text-muted">Verre: <span className="admin-text font-bold">{money(computed?.baseGlassUnit)}</span></p>
                      <p className="admin-text-muted">Pose: <span className="admin-text font-bold">{money(computed?.installUnit)}</span></p>
                      <p className="admin-text-muted">Options: <span className="admin-text font-bold">{money((computed?.lowEUnit || 0) + (computed?.argonUnit || 0) + (computed?.temperedUnit || 0) + (computed?.grillUnit || 0) + (computed?.accessUnit || 0))}</span></p>
                    </div>

                    <input
                      type="text"
                      value={line.note}
                      onChange={(event) => updateLine(index, { note: event.target.value })}
                      placeholder="Note interne optionnelle"
                      className="admin-input mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="admin-card rounded-xl border p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="space-y-5">
            <div>
              <p className="admin-text-muted text-[11px] font-bold uppercase tracking-wider">Prix conseille</p>
              <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Total taxes incluses</p>
                <p className="mt-1 text-3xl font-black text-cyan-700">{money(quote.totals.total)}</p>
                <p className="admin-text-muted mt-1 text-xs">
                  Fourchette: {money(quote.totals.totalMinWithTaxes)} - {money(quote.totals.totalMaxWithTaxes)}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t admin-border pt-4 text-sm">
              <div className="flex justify-between"><span className="admin-text-muted">Thermos</span><span className="admin-text">{quote.totals.quantity}</span></div>
              <div className="flex justify-between"><span className="admin-text-muted">Surface</span><span className="admin-text">{quote.totals.sqft} pi2</span></div>
              <div className="flex justify-between"><span className="admin-text-muted">Sous-total lignes</span><span className="admin-text">{money(quote.totals.piecesSubtotal)}</span></div>
              <div className="flex justify-between"><span className="admin-text-muted">Frais fixes</span><span className="admin-text">{money(quote.totals.tripFee)}</span></div>
              <div className="flex justify-between"><span className="admin-text-muted">Marge/admin</span><span className="admin-text">{money(quote.totals.margin)}</span></div>
              <div className="flex justify-between border-t admin-border pt-2"><span className="admin-text-muted">Sous-total</span><span className="admin-text">{money(quote.totals.subtotal)}</span></div>
              <div className="flex justify-between text-xs"><span className="admin-text-muted">TPS</span><span className="admin-text-muted">{money(quote.totals.tps)}</span></div>
              <div className="flex justify-between text-xs"><span className="admin-text-muted">TVQ</span><span className="admin-text-muted">{money(quote.totals.tvq)}</span></div>
            </div>

            {settingsLoading && (
              <p className="admin-text-muted text-xs"><i className="fas fa-spinner fa-spin mr-2"></i>Prix en chargement...</p>
            )}

            <div className="space-y-2 border-t admin-border pt-4">
              <button
                type="button"
                onClick={copySummary}
                className="w-full rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-600"
              >
                <i className="fas fa-copy mr-2"></i>{copied ? "Copie" : "Copier estimation"}
              </button>
              <Link
                href="/admin/bons/nouveau"
                className="flex w-full items-center justify-center rounded-lg border admin-border px-4 py-3 text-sm font-bold admin-text hover:bg-white/5"
              >
                <i className="fas fa-clipboard-list mr-2"></i>Ouvrir un bon
              </Link>
            </div>

            <p className="admin-text-muted text-xs">
              Estimation interne. Le prix final doit etre confirme apres mesure exacte, type de verre et acces au chantier.
            </p>
          </div>
        </aside>
      </div>

      <ClientPicker open={clientPickerOpen} onClose={() => setClientPickerOpen(false)} onPick={pickClient} />
    </div>
  );
}
