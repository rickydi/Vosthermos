"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function createThermosLine(id) {
  return { ...emptyThermosLine(), _lineId: id };
}

const EMPTY_PENDING_QUOTE = {
  lines: [],
  totals: {
    quantity: 0,
    sqft: 0,
    piecesSubtotal: 0,
    tripFee: 0,
    margin: 0,
    subtotal: 0,
    total: 0,
  },
};

export default function ThermosQuoteInline({
  active,
  onActiveChange,
  city = "",
  isB2B = false,
  sections = [],
  onAddToBon,
}) {
  const nextLineId = useRef(1);
  const [settings, setSettings] = useState(THERMOS_PRICING_DEFAULTS);
  const [settingsError, setSettingsError] = useState("");
  const [lines, setLines] = useState(() => [createThermosLine(0)]);
  const [addedLineIds, setAddedLineIds] = useState(() => new Set());
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
  const pendingInputLines = useMemo(
    () => lines.filter((line) => !addedLineIds.has(line._lineId)),
    [addedLineIds, lines]
  );
  const pendingQuote = useMemo(() => (
    pendingInputLines.length ? calculateThermosQuote(pendingInputLines, settings) : EMPTY_PENDING_QUOTE
  ), [pendingInputLines, settings]);
  const destinationMatch = destination.match(/^section:(\d+)$/);
  const effectiveDestination = (
    isB2B
    && destinationMatch
    && Number(destinationMatch[1]) < sections.length
  ) ? destination : "flat";

  function updateLine(index, patch) {
    setLastAdded("");
    const lineId = lines[index]?._lineId;
    if (lineId !== undefined) {
      setAddedLineIds((current) => {
        if (!current.has(lineId)) return current;
        const next = new Set(current);
        next.delete(lineId);
        return next;
      });
    }
    setLines((current) => current.map((line, lineIndex) => (
      lineIndex === index ? { ...line, ...patch } : line
    )));
  }

  function addLine() {
    setLastAdded("");
    setLines((current) => [...current, createThermosLine(nextLineId.current++)]);
  }

  function removeLine(index) {
    if (lines.length <= 1) return;
    setLastAdded("");
    const lineId = lines[index]?._lineId;
    if (lineId !== undefined) {
      setAddedLineIds((current) => {
        if (!current.has(lineId)) return current;
        const next = new Set(current);
        next.delete(lineId);
        return next;
      });
    }
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function destinationLabel(value) {
    const sectionMatch = value.match(/^section:(\d+)$/);
    if (!sectionMatch) return "lignes globales";
    const section = sections[Number(sectionMatch[1])];
    return section ? `unite ${section.unitCode}` : "unite";
  }

  function addQuoteToBon() {
    if (!onAddToBon || pendingQuote.totals.subtotal <= 0) {
      setLastAdded("Aucun nouveau thermos a ajouter.");
      return;
    }
    onAddToBon(pendingQuote, effectiveDestination);
    setAddedLineIds((current) => {
      const next = new Set(current);
      pendingQuote.lines.forEach((line) => next.add(line._lineId));
      return next;
    });
    setLastAdded(`Ajoute au bon dans ${destinationLabel(effectiveDestination)}. Les lignes deja ajoutees ne seront pas renvoyees.`);
  }

  return (
    <div className={`admin-card rounded-xl border transition-colors ${active ? "border-cyan-500/40" : ""}`}>
      <button
        type="button"
        onClick={() => onActiveChange?.(!active)}
        aria-expanded={active}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
      >
        <div>
          <h2 className="admin-text flex items-center gap-2 font-bold">
            <i className="fas fa-calculator text-cyan-600"></i>
            Calculateur thermos
          </h2>
          <p className="admin-text-muted mt-1 text-xs">
            Ouvre le calculateur seulement quand tu veux ajouter des thermos au bon.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border admin-border px-3 py-2 text-sm font-bold admin-text hover:bg-white/5">
          {active ? "Fermer" : "Ouvrir"}
          <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${active ? "rotate-180" : ""}`}></i>
        </span>
      </button>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 border-t admin-border p-4 pt-4">
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
              const lineAlreadyAdded = addedLineIds.has(line._lineId);
              return (
                <div key={line._lineId} className="rounded-xl border admin-border bg-white/[0.02] p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="admin-text text-sm font-bold">Thermos #{index + 1}</p>
                      {lineAlreadyAdded && (
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                          Deja ajoute
                        </span>
                      )}
                    </div>
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

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border admin-border bg-white/[0.02] p-3">
              {isB2B && (
                <label className="block min-w-56 flex-1">
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

              <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                <div className="text-right">
                  <p className="admin-text-muted text-[11px] uppercase tracking-wider">Nouveau a ajouter</p>
                  <p className="text-lg font-black text-cyan-700">{money(pendingQuote.totals.subtotal)}</p>
                </div>

                <button
                  type="button"
                  onClick={addQuoteToBon}
                  disabled={pendingQuote.totals.subtotal <= 0}
                  className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
                >
                  <i className="fas fa-plus mr-2"></i>Ajouter au bon
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {lastAdded ? (
                <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-700">
                  {lastAdded}
                </p>
              ) : (
                <p className="admin-text-muted text-xs">
                  Le bon calcule les taxes ensuite. N&apos;ajoute pas le total avec taxes ici.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
