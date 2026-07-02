"use client";

// Petits composants de presentation de l'editeur de documents.
import { LABOR_HOUR_OPTIONS, formatLaborHours } from "./editor-utils";

export function LaborHoursSelect({ value, onChange }) {
  const normalized = Math.round(Number(value || 0) * 4) / 4;
  const hasCustomValue = normalized > 0 && !LABOR_HOUR_OPTIONS.some((option) => option.value === normalized);

  return (
    <select
      value={String(normalized)}
      onChange={(e) => onChange(Number(e.target.value))}
      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-36"
    >
      {hasCustomValue && <option value={String(normalized)}>{formatLaborHours(normalized)}</option>}
      {LABOR_HOUR_OPTIONS.map((option) => (
        <option key={option.value} value={String(option.value)}>{option.label}</option>
      ))}
    </select>
  );
}

export function LaborRateInput({ value, onChange, onBlur }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="labor-rate" className="admin-text-muted text-xs font-bold whitespace-nowrap">Taux</label>
      <div className="relative">
        <input
          id="labor-rate"
          type="text"
          inputMode="decimal"
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input border rounded-lg pl-3 pr-10 py-2.5 text-sm w-28"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 admin-text-muted text-xs">$/h</span>
      </div>
    </div>
  );
}

export function HelpBubble({ text }) {
  return (
    <span className="relative inline-flex items-center">
      <i className="fas fa-circle-question text-[11px] opacity-70"></i>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border admin-border bg-neutral-950 px-3 py-2 text-left text-[11px] font-normal leading-snug text-white shadow-xl group-hover:block group-focus-visible:block">
        {text}
      </span>
    </span>
  );
}

export function MoneyLine({ label, value, muted = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${muted ? "text-xs" : "text-sm"}`}>
      <span className="admin-text-muted">{label}</span>
      <span className={muted ? "admin-text-muted" : "admin-text font-medium"}>{value}</span>
    </div>
  );
}
