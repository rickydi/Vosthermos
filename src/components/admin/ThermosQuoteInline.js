"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

function LineField({ label, children }) {
  return (
    <label className="block">
      <span className="admin-text-muted mb-1 block text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

export default function ThermosQuoteInline({
  active,
  onActiveChange,
  city = "",
  isB2B = false,
  sections = [],
  onAddToBon,
}) {
  const [settings, setSettings] = useState(THERMOS_PRICING_DEFAULTS);
  const [settingsError, setSettingsError] = useState("");
  const [lines, setLines] = useState([emptyThermosLine()]);
  const [destination, setDestination] = useState("flat");
  const [lastAdded, setLastAdded] = useState("");

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetch("/api/admin/thermos-pricing", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled) {
          setSettings(normalizeThermosPricingSettings(body.settings));
          setSettingsError("");
        }
      })
      .catch(() => {
        if (!cancelled) setSettingsError("Prix thermos non charges. Les valeurs par defaut sont utilisees.");
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  const quote = useMemo(() => calculateThermosQuote(lines, settings), [lines, settings]);
  const destinationMatch = destination.match(/^section:(\d+)$/);
  const effectiveDestination = (
    isB2B
    && destinationMatch
    && Number(destinationMatch[1]) < sections.length
  ) ? destination : "flat";

  function updateLine(index, patch) {
    setLastAdded("");
    setLines((current) => current.map((line, lineIndex) => (
      lineIndex === index ? { ...line, ...patch } : line
    )));
  }

  function addLine() {
    setLastAdded("");
    setLines((current) => [...current, emptyThermosLine()]);
  }

  function removeLine(index) {
    if (lines.length <= 1) return;
    setLastAdded("");
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function destinationLabel(value) {
    const sectionMatch = value.match(/^section:(\d+)$/);
    if (!sectionMatch) return "lignes globales";
    const section = sections[Number(sectionMatch[1])];
    return section ? `unite ${section.unitCode}` : "unite";
  }

  function addQuoteToBon() {
    if (!onAddToBon || quote.totals.subtotal <= 0) return;
    onAddToBon(quote, effectiveDestination);
    setLastAdded(`Ajoute au bon dans ${destinationLabel(effectiveDestination)}.`);
  }

  return (
    <div className="admin-card rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-text font-bold">Calculateur thermos</h2>
          <p className="admin-text-muted mt-1 text-xs">
            Active seulement quand tu veux calculer un thermos et l&apos;ajouter au bon.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border admin-border px-3 py-2 text-sm font-bold admin-text hover:bg-white/5">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => onActiveChange?.(event.target.checked)}
            className="rounded"
          />
          Activer
        </label>
      </div>

      {!active ? (
        <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-sm admin-text-muted">
          Le bon reste plus simple. Coche &quot;Activer&quot; pour ouvrir le calculateur ici.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="admin-text-muted text-xs">
                Mesures en pouces{city ? ` - secteur: ${city}` : ""}. Les lignes ajoutees au bon sont avant taxes.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addLine}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                >
                  <i className="fas fa-plus mr-1"></i>Ajouter thermos
                </button>
                <Link
                  href="/admin/parametres#thermos-pricing"
                  className="rounded-lg border admin-border px-3 py-2 text-xs font-bold admin-text hover:bg-white/5"
                >
                  <i className="fas fa-gear mr-1"></i>Prix
                </Link>
              </div>
            </div>

            {settingsError && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                {settingsError}
              </p>
            )}

            {lines.map((line, index) => {
              const computed = quote.lines[index];
              return (
                <div key={index} className="rounded-xl border admin-border bg-white/[0.02] p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="admin-text text-sm font-bold">Thermos #{index + 1}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-cyan-600">{money(computed?.lineSubtotal)}</span>
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
                    <LineField label="Largeur">
                      <input
                        type="number"
                        min="1"
                        step="0.125"
                        value={line.width}
                        onChange={(event) => updateLine(index, { width: event.target.value })}
                        className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </LineField>
                    <LineField label="Hauteur">
                      <input
                        type="number"
                        min="1"
                        step="0.125"
                        value={line.height}
                        onChange={(event) => updateLine(index, { height: event.target.value })}
                        className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </LineField>
                    <LineField label="Quantite">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(event) => updateLine(index, { quantity: event.target.value })}
                        className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </LineField>
                    <LineField label="Acces">
                      <select
                        value={line.access}
                        onChange={(event) => updateLine(index, { access: event.target.value })}
                        className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                      >
                        {ACCESS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </LineField>
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
                    placeholder="Note optionnelle pour cette ligne"
                    className="admin-input mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              );
            })}
          </div>

          <aside className="rounded-xl border admin-border bg-white/[0.02] p-4">
            <div className="space-y-4">
              <div>
                <p className="admin-text-muted text-[11px] font-bold uppercase tracking-wider">Prix calcule</p>
                <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Sous-total avant taxes</p>
                  <p className="mt-1 text-2xl font-black text-cyan-700">{money(quote.totals.subtotal)}</p>
                  <p className="admin-text-muted mt-1 text-xs">
                    Total avec taxes: {money(quote.totals.total)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t admin-border pt-3 text-sm">
                <div className="flex justify-between"><span className="admin-text-muted">Thermos</span><span className="admin-text">{quote.totals.quantity}</span></div>
                <div className="flex justify-between"><span className="admin-text-muted">Surface</span><span className="admin-text">{quote.totals.sqft} pi2</span></div>
                <div className="flex justify-between"><span className="admin-text-muted">Lignes</span><span className="admin-text">{money(quote.totals.piecesSubtotal)}</span></div>
                <div className="flex justify-between"><span className="admin-text-muted">Frais fixes</span><span className="admin-text">{money(quote.totals.tripFee)}</span></div>
                <div className="flex justify-between"><span className="admin-text-muted">Marge/admin</span><span className="admin-text">{money(quote.totals.margin)}</span></div>
              </div>

              {isB2B && (
                <label className="block border-t admin-border pt-3">
                  <span className="admin-text-muted mb-1 block text-xs font-medium">Destination</span>
                  <select
                    value={effectiveDestination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="admin-input w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="flat">Lignes globales du bon</option>
                    {sections.map((section, index) => (
                      <option key={`${section.unitCode}-${index}`} value={`section:${index}`}>
                        Unite {section.unitCode}
                      </option>
                    ))}
                  </select>
                  {sections.length === 0 && (
                    <p className="admin-text-muted mt-1 text-[11px]">Ajoute une unite avant si ce thermos doit aller dans une unite precise.</p>
                  )}
                </label>
              )}

              {lastAdded && (
                <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-700">
                  {lastAdded}
                </p>
              )}

              <button
                type="button"
                onClick={addQuoteToBon}
                disabled={quote.totals.subtotal <= 0}
                className="w-full rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
              >
                <i className="fas fa-plus mr-2"></i>Ajouter au bon
              </button>

              <p className="admin-text-muted text-xs">
                Le bon calcule les taxes ensuite. N&apos;ajoute pas le total avec taxes ici.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
