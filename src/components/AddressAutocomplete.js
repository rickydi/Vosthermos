"use client";

import { useEffect, useRef, useState } from "react";

function newSessionToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_INPUT_CLASS = "w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]";

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Commencez à taper votre adresse...",
  className = "",
  inputClassName = DEFAULT_INPUT_CLASS,
  name,
  id,
  required = false,
  disabled = false,
}) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => newSessionToken());
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);
  const displayValue = isControlled ? value : innerValue;

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function setInputValue(nextValue) {
    if (!isControlled) setInnerValue(nextValue);
    onChange?.(nextValue);
  }

  function handleChange(e) {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    clearTimeout(timeoutRef.current);

    if (nextValue.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/places/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: nextValue,
            sessionToken,
          }),
        });
        const data = await res.json().catch(() => ({}));
        const predictions = Array.isArray(data.predictions) ? data.predictions : [];
        setResults(predictions);
        setOpen(predictions.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  async function handleSelect(prediction) {
    setInputValue(prediction.label);
    setOpen(false);
    setResults([]);
    setLoading(true);
    try {
      const res = await fetch("/api/places/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "details",
          placeId: prediction.placeId,
          sessionToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const address = data.address || {};
      const nextAddress = address.address || prediction.label;
      setInputValue(nextAddress);
      onSelect?.({
        address: nextAddress,
        city: address.city || "",
        province: address.province || "QC",
        postalCode: address.postalCode || "",
        formattedAddress: address.formattedAddress || prediction.label,
      });
      setSessionToken(newSessionToken());
    } catch {
      onSelect?.({ address: prediction.label });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        required={required}
        disabled={disabled}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <i className="fas fa-spinner fa-spin text-[var(--color-muted)]"></i>
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-lg">
          <ul className="max-h-[260px] overflow-y-auto">
            {results.map((result) => (
              <li key={result.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left text-sm text-gray-800 transition-colors last:border-0 hover:bg-[var(--color-background)]"
                >
                  <i className="fas fa-map-marker-alt text-[var(--color-teal)] mr-2"></i>
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--color-border)] px-4 py-1.5 text-right text-[10px] font-semibold text-gray-400">
            Propulsé par Google
          </div>
        </div>
      )}
    </div>
  );
}
