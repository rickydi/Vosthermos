"use client";

import { useState, useEffect, useRef } from "react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  function load(q = "") {
    setLoading(true);
    fetch(`/api/admin/clients?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => { setClients(data.clients || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search), 300);
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-text text-2xl font-bold">Clients</h1>
        <p className="admin-text-muted text-sm">{clients.length} clients</p>
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom, telephone, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="admin-input border rounded-xl px-4 py-3 text-sm w-full mb-6"
      />

      {loading ? (
        <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 admin-text-muted">
          <i className="fas fa-address-book text-4xl mb-3"></i>
          <p>Aucun client trouve</p>
        </div>
      ) : (
        <div className="admin-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b admin-border admin-text-muted text-xs text-left">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Bons</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b admin-border admin-hover">
                  <td className="px-4 py-3">
                    <p className="admin-text font-medium">{c.name}</p>
                    {c.email && <p className="admin-text-muted text-xs">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 admin-text-muted">{c.company || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">{c.phone || "—"}</td>
                  <td className="px-4 py-3 admin-text-muted">{c.city || "—"}</td>
                  <td className="px-4 py-3 admin-text">{c._count?.workOrders || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
