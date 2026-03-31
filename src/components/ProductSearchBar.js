"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

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

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(val.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];
          setResults(items);
          setOpen(items.length > 0);
        }
      } catch {}
      setLoading(false);
    }, 300);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher par SKU ou nom de piece..."
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
        />
        {loading && <i className="fas fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/produit/${p.slug}`}
              onClick={() => { setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              {p.images?.[0]?.url ? (
                <Image src={p.images[0].url} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-box text-gray-300 text-xs"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.sku} — {Number(p.price).toFixed(2)} $</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
