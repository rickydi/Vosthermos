"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function BonDetailPage() {
  const { id } = useParams();
  const [wo, setWo] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/work-orders/${id}`)
      .then((r) => r.json())
      .then((data) => setWo(data))
      .catch(() => {});
  }, [id]);

  if (!wo) return <div className="text-center py-12 admin-text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="admin-text text-2xl font-bold">Bon {wo.number}</h1>
          <p className="admin-text-muted text-sm">{new Date(wo.date).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--color-teal)] text-white rounded-lg text-sm font-medium">
          <i className="fas fa-print mr-2"></i>Imprimer
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client + Tech info */}
        <div className="admin-card border rounded-xl p-6">
          <h3 className="admin-text-muted text-xs font-bold uppercase mb-3">Client</h3>
          <p className="admin-text font-bold text-lg">{wo.client?.name}</p>
          {wo.client?.company && <p className="admin-text-muted text-sm">{wo.client.company}</p>}
          <p className="admin-text-muted text-sm">{wo.client?.address}{wo.client?.city ? `, ${wo.client.city}` : ""}</p>
          <p className="admin-text-muted text-sm">{wo.client?.phone}</p>
          {wo.client?.email && <p className="admin-text-muted text-sm">{wo.client.email}</p>}

          <h3 className="admin-text-muted text-xs font-bold uppercase mt-6 mb-2">Technicien</h3>
          <p className="admin-text">{wo.technician?.name || "Non assigne"}</p>

          <h3 className="admin-text-muted text-xs font-bold uppercase mt-6 mb-2">Horaire</h3>
          <p className="admin-text">{wo.heureArrivee || "—"} — {wo.heureDepart || "—"}</p>
        </div>

        {/* Items */}
        <div className="lg:col-span-2 admin-card border rounded-xl p-6">
          <h3 className="admin-text-muted text-xs font-bold uppercase mb-4">Pieces et services</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b admin-border admin-text-muted text-xs text-left">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qte</th>
                <th className="pb-2 text-right">Prix unit.</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {wo.items?.map((item) => (
                <tr key={item.id} className="border-b admin-border">
                  <td className="py-2 admin-text">
                    {item.description}
                    {item.product && <span className="admin-text-muted text-xs ml-2">({item.product.sku})</span>}
                  </td>
                  <td className="py-2 text-right admin-text-muted">{item.quantity}</td>
                  <td className="py-2 text-right admin-text-muted">{item.unitPrice.toFixed(2)}$</td>
                  <td className="py-2 text-right admin-text font-medium">{item.totalPrice.toFixed(2)}$</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t admin-border pt-4 space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between"><span className="admin-text-muted">Pieces</span><span>{wo.totalPieces.toFixed(2)}$</span></div>
            <div className="flex justify-between"><span className="admin-text-muted">Main d&apos;oeuvre</span><span>{wo.totalLabor.toFixed(2)}$</span></div>
            <div className="flex justify-between border-t admin-border pt-1"><span className="admin-text-muted">Sous-total</span><span>{wo.subtotal.toFixed(2)}$</span></div>
            <div className="flex justify-between text-xs"><span className="admin-text-muted">TPS</span><span>{wo.tps.toFixed(2)}$</span></div>
            <div className="flex justify-between text-xs"><span className="admin-text-muted">TVQ</span><span>{wo.tvq.toFixed(2)}$</span></div>
            <div className="flex justify-between text-lg font-bold border-t admin-border pt-2">
              <span>Total</span><span className="text-[var(--color-red)]">{wo.total.toFixed(2)}$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photos + Signature */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {wo.photos?.length > 0 && (
          <div className="admin-card border rounded-xl p-6">
            <h3 className="admin-text-muted text-xs font-bold uppercase mb-3">Photos ({wo.photos.length})</h3>
            <div className="grid grid-cols-3 gap-2">
              {wo.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                </a>
              ))}
            </div>
          </div>
        )}

        {wo.signatureUrl && (
          <div className="admin-card border rounded-xl p-6">
            <h3 className="admin-text-muted text-xs font-bold uppercase mb-3">Signature du client</h3>
            <img src={wo.signatureUrl} alt="Signature" className="max-h-32 rounded-lg border admin-border" />
          </div>
        )}
      </div>

      {wo.description && (
        <div className="admin-card border rounded-xl p-6 mt-6">
          <h3 className="admin-text-muted text-xs font-bold uppercase mb-3">Description du travail</h3>
          <p className="admin-text text-sm whitespace-pre-wrap">{wo.description}</p>
        </div>
      )}
    </div>
  );
}
