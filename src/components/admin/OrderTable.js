"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "pending", label: "En attente", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "confirmed", label: "Confirmee", color: "bg-blue-500/20 text-blue-400" },
  { value: "shipped", label: "Expediee", color: "bg-purple-500/20 text-purple-400" },
  { value: "delivered", label: "Livree", color: "bg-green-500/20 text-green-400" },
  { value: "cancelled", label: "Annulee", color: "bg-red-500/20 text-red-400" },
];

export default function OrderTable({ orders }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function updateStatus(orderId, newStatus) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === "all" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Toutes ({orders.length})
        </button>
        {statuses.map((s) => {
          const count = orders.filter((o) => o.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === s.value ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-white/40 text-center">Aucune commande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/5">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} onStatusChange={updateStatus} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const currentStatus = statuses.find((s) => s.value === order.status) || statuses[0];

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="p-4 text-white/70 font-mono text-sm">#{order.id}</td>
        <td className="p-4">
          <p className="text-white text-sm font-medium">{order.name}</p>
          {order.address && (
            <p className="text-white/30 text-xs">{order.city}, {order.province}</p>
          )}
        </td>
        <td className="p-4">
          <p className="text-white/70 text-sm">{order.email}</p>
          {order.phone && <p className="text-white/40 text-xs">{order.phone}</p>}
        </td>
        <td className="p-4 text-white font-bold text-sm">{order.total.toFixed(2)} $</td>
        <td className="p-4">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${currentStatus.color} bg-opacity-100`}
            style={{ appearance: "auto" }}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </td>
        <td className="p-4 text-white/40 text-sm whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString("fr-CA")}
        </td>
        <td className="p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <i className={`fas ${expanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-white/[0.02]">
          <td colSpan={7} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white/50 text-xs uppercase mb-2">Adresse de livraison</h4>
                <p className="text-white/80 text-sm">
                  {order.address}<br />
                  {order.city}, {order.province} {order.postalCode}
                </p>
              </div>
              <div>
                <h4 className="text-white/50 text-xs uppercase mb-2">Articles ({Array.isArray(items) ? items.length : 0})</h4>
                <div className="space-y-1">
                  {Array.isArray(items) && items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white/70">{item.sku || item.name} x{item.qty}</span>
                      <span className="text-white/50">{(item.price * item.qty).toFixed(2)} $</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
