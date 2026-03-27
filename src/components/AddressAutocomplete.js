"use client";

import { useState, useRef, useEffect } from "react";

export default function AddressAutocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (val.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ca&addressdetails=1&limit=5&q=${encodeURIComponent(val)}`,
          { headers: { "Accept-Language": "fr" } }
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  }

  function handleSelect(result) {
    const addr = result.address || {};
    const streetNumber = addr.house_number || "";
    const street = addr.road || "";
    const fullStreet = streetNumber ? `${streetNumber} ${street}` : street;
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    const province = mapProvince(addr.state || "Quebec");
    const postalCode = addr.postcode || "";

    setQuery(fullStreet);
    setOpen(false);
    setResults([]);

    onSelect({
      address: fullStreet,
      city,
      province,
      postalCode,
    });
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Commencez a taper votre adresse..."
        className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <i className="fas fa-spinner fa-spin text-[var(--color-muted)]"></i>
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--color-background)] transition-colors text-sm border-b border-[var(--color-border)] last:border-0"
              >
                <i className="fas fa-map-marker-alt text-[var(--color-red)] mr-2"></i>
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mapProvince(state) {
  const map = {
    "quebec": "QC", "québec": "QC",
    "ontario": "ON",
    "nouveau-brunswick": "NB", "new brunswick": "NB",
    "nouvelle-écosse": "NS", "nova scotia": "NS",
    "île-du-prince-édouard": "PE", "prince edward island": "PE",
    "terre-neuve-et-labrador": "NL", "newfoundland and labrador": "NL",
    "manitoba": "MB",
    "saskatchewan": "SK",
    "alberta": "AB",
    "colombie-britannique": "BC", "british columbia": "BC",
  };
  return map[state.toLowerCase()] || "QC";
}
