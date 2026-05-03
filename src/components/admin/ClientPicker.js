"use client";

import { useState, useEffect, useRef } from "react";

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recemment modifie" },
  { value: "created_desc", label: "Date d'ajout (recent)" },
  { value: "name_asc", label: "Nom (A-Z)" },
  { value: "name_desc", label: "Nom (Z-A)" },
  { value: "city_asc", label: "Ville (A-Z)" },
];

export default function ClientPicker({ open, onClose, onPick }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated_desc");
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("sort", sort);
    params.set("limit", "100");
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return fetch(`/api/admin/clients?${params}`);
      })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setClients(data.clients || []);
      })
      .catch(() => {
        if (!cancelled) setClients([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, search, sort]);

  function handleSearchChange(v) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(v), 250);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-bg admin-border border rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">Parcourir les clients</h2>
          <button onClick={onClose} className="admin-text-muted hover:admin-text text-xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-4 border-b admin-border flex gap-3">
          <input
            type="text"
            placeholder="Rechercher par nom, telephone principal ou autre, email, ville..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="admin-input border rounded-lg px-4 py-2.5 text-sm flex-1"
            autoFocus
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="admin-input border rounded-lg px-3 py-2.5 text-sm w-52"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center admin-text-muted py-12">
              <i className="fas fa-spinner fa-spin text-2xl"></i>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center admin-text-muted py-12">
              <i className="fas fa-user-slash text-3xl mb-2"></i>
              <p>Aucun client</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 admin-card">
                <tr className="border-b admin-border admin-text-muted text-xs text-left">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Telephone</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3">Bons</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onPick(c)}
                    className="border-b admin-border admin-hover cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="admin-text font-medium">{c.name}</p>
                      {c.email && <p className="admin-text-muted text-xs">{c.email}</p>}
                    </td>
                    <td className="px-4 py-3 admin-text-muted">
                      <p>{c.phone || "-"}</p>
                      {c.secondaryPhone && <p className="text-xs">{c.secondaryPhone}</p>}
                    </td>
                    <td className="px-4 py-3 admin-text-muted">{c.city || "-"}</td>
                    <td className="px-4 py-3 admin-text">{c._count?.workOrders || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
