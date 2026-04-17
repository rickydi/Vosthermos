"use client";

import { Fragment, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function BonDetailPage() {
  const { id } = useParams();
  const [wo, setWo] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState("");

  useEffect(() => {
    fetch(`/api/admin/work-orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setWo(data); setEmailTo(data?.client?.email || ""); })
      .catch(() => {});
  }, [id]);

  async function sendEmail() {
    if (!emailTo.trim()) { setMsg("Adresse email requise"); return; }
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/work-orders/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setMsg(`Envoye a ${data.to}`);
      setShowEmail(false);
      // Refresh to show new statut
      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
    } catch (err) {
      setMsg(err.message);
    }
    setSending(false);
  }

  if (!wo) return (
    <div className="p-6 lg:p-8 text-center py-12 admin-text-muted">
      <i className="fas fa-spinner fa-spin text-2xl"></i>
    </div>
  );

  const fmt = (n) => `${Number(n || 0).toFixed(2)} $`;
  const dateLabel = new Date(wo.date).toLocaleDateString("fr-CA", {
    day: "numeric", month: "long", year: "numeric",
  });
  const fmtHM = (dt) => {
    if (!dt) return null;
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const arriveLabel = fmtHM(wo.arrivalAt);
  const departLabel = fmtHM(wo.departureAt);
  const durationLabel = wo.durationMinutes
    ? `${Math.floor(wo.durationMinutes / 60)}h${(wo.durationMinutes % 60) ? String(wo.durationMinutes % 60).padStart(2, "0") : ""}`
    : null;
  const intervAddr = wo.interventionAddress || wo.client?.address;
  const intervCity = wo.interventionCity || wo.client?.city;
  const intervPostal = wo.interventionPostalCode || wo.client?.postalCode;

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = { draft: "Brouillon", completed: "Complete", sent: "Envoye" };

  return (
    <div className="p-6 lg:p-8 invoice-wrapper">
      <style jsx global>{`
        @media print {
          @page { size: letter; margin: 0; }
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, .admin-header, .no-print { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          .lg\\:ml-64 { margin-left: 0 !important; }
          .invoice-wrapper { padding: 0 !important; }
          .invoice-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .invoice-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour
          </Link>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>
            {statusLabels[wo.statut] || wo.statut}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/bons/nouveau?edit=${id}`}
            className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <i className="fas fa-pen mr-2"></i>Modifier
          </Link>
          <button onClick={() => setShowEmail(true)}
            className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
            <i className="fas fa-envelope mr-2"></i>Envoyer par email
          </button>
          <button onClick={() => window.print()}
            className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium">
            <i className="fas fa-print mr-2"></i>Imprimer
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 admin-card border admin-border rounded-lg text-sm admin-text print:hidden">
          {msg}
        </div>
      )}

      {/* Email modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden"
          onClick={() => setShowEmail(false)}>
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl dark:bg-gray-900 dark:text-white dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Envoyer la facture par email</h3>
            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400">Destinataire</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEmail(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">
                Annuler
              </button>
              <button onClick={sendEmail} disabled={sending}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice preview — letter-size paper look */}
      <div className="invoice-sheet bg-white text-black mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-sm overflow-hidden"
        style={{ width: "8.5in", maxWidth: "100%", minHeight: "11in" }}>
        {/* Header — simple red band with logo + invoice # */}
        <div
          className="text-white px-12 py-10"
          style={{ background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)" }}
        >
          <div className="flex items-center justify-between gap-6">
            <img
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos"
              className="h-24 w-auto"
            />
            <div className="text-right">
              <p className="text-[11px] uppercase opacity-75 font-semibold tracking-[0.2em]">Facture</p>
              <p className="text-3xl font-extrabold mt-2">{wo.number}</p>
              <p className="text-xs opacity-80 mt-1">{dateLabel}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Facturer a</p>
              <p className="font-bold text-base text-gray-900 mt-1">{wo.client?.name}</p>
              {wo.client?.company && <p className="text-sm text-gray-600">{wo.client.company}</p>}
              {wo.client?.address && (
                <p className="text-sm text-gray-600">{wo.client.address}{wo.client?.city ? `, ${wo.client.city}` : ""}</p>
              )}
              {wo.client?.postalCode && <p className="text-sm text-gray-600">{wo.client.postalCode}</p>}
              {wo.client?.phone && <p className="text-sm text-gray-600">{wo.client.phone}</p>}
              {wo.client?.email && <p className="text-sm text-gray-600">{wo.client.email}</p>}
            </div>
            <div className="md:text-right">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Details</p>
              {wo.technician?.name && (
                <p className="text-sm text-gray-700 mt-1">Technicien: <span className="font-medium">{wo.technician.name}</span></p>
              )}
              {(arriveLabel || departLabel) && (
                <p className="text-sm text-gray-600">
                  Horaire: {arriveLabel || "—"} à {departLabel || "—"}
                  {durationLabel ? ` (${durationLabel})` : ""}
                </p>
              )}
              {(wo.interventionAddress || wo.interventionCity) && (
                <p className="text-sm text-gray-600 mt-1">
                  Lieu: {intervAddr}{intervCity ? `, ${intervCity}` : ""}{intervPostal ? ` ${intervPostal}` : ""}
                </p>
              )}
            </div>
          </div>

          {wo.description && (
            <div className="bg-gray-50 border-l-4 border-[var(--color-red)] px-4 py-3 mb-6 rounded-r">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Description du travail</p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{wo.description}</p>
            </div>
          )}

          {/* Items table */}
          {(() => {
            const renderItemRow = (item) => {
              const isDiscount = item.itemType === "discount" || Number(item.unitPrice) < 0;
              const color = isDiscount ? "text-green-600" : "text-gray-900";
              return (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className={`py-2 px-2 ${color}`}>
                    {item.description}
                    {item.product?.sku && <span className="text-gray-400 text-xs ml-2">({item.product.sku})</span>}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">{Number(item.quantity).toFixed(0)}</td>
                  <td className={`py-2 px-2 text-right ${color}`}>{fmt(item.unitPrice)}</td>
                  <td className={`py-2 px-2 text-right font-medium ${color}`}>{fmt(item.totalPrice)}</td>
                </tr>
              );
            };
            const hasSections = wo.sections && wo.sections.length > 0;
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm mb-4 min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase font-semibold border-b-2 border-gray-900">
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-right py-2 px-2 w-16">Qte</th>
                      <th className="text-right py-2 px-2 w-24">Prix</th>
                      <th className="text-right py-2 px-2 w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wo.items?.map(renderItemRow)}
                    {hasSections && wo.sections.map((sec) => {
                      const secSub = (sec.items || []).reduce((sum, i) => sum + Number(i.totalPrice), 0);
                      return (
                        <Fragment key={`sec-${sec.id}`}>
                          <tr className="bg-gray-50">
                            <td colSpan={3} className="py-2 px-2 font-bold text-gray-800 text-xs uppercase tracking-wider">
                              Unite {sec.unitCode}
                            </td>
                            <td className="py-2 px-2 text-right text-gray-700 text-xs font-bold">{fmt(secSub)}</td>
                          </tr>
                          {sec.items?.map(renderItemRow)}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-72 text-sm">
              <div className="flex justify-between py-1 text-gray-600">
                <span>Pieces</span><span>{fmt(wo.totalPieces)}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600">
                <span>Main d&apos;oeuvre</span><span>{fmt(wo.totalLabor)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 text-gray-700">
                <span>Sous-total</span><span>{fmt(wo.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs text-gray-500">
                <span>TPS</span><span>{fmt(wo.tps)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs text-gray-500">
                <span>TVQ</span><span>{fmt(wo.tvq)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-900 text-lg font-bold">
                <span>Total</span><span className="text-[var(--color-red)]">{fmt(wo.total)}</span>
              </div>
            </div>
          </div>

          {/* Signature */}
          {wo.signatureUrl && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Signature du client</p>
              <img src={wo.signatureUrl} alt="Signature" className="max-h-20 mt-2" />
            </div>
          )}

          {/* Photos (admin view only, not in print) */}
          {wo.photos?.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200 print:hidden">
              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Photos ({wo.photos.length})</p>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {wo.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-400 border-t border-gray-200">
          Merci de faire affaire avec Vosthermos
        </div>
      </div>
    </div>
  );
}
