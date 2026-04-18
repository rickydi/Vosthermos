"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { COMPANY_INFO } from "@/lib/company";

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderId, setOrderId] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId || confirmed) return;
    setConfirmed(true);

    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orderId) setOrderId(data.orderId);
        if (data.email) setCustomerEmail(data.email);
      })
      .catch(() => {});
  }, [sessionId, confirmed]);

  return (
    <div className="pt-[80px]">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Merci pour votre commande!</h1>
        {orderId && (
          <p className="text-[var(--color-teal)] font-bold text-lg mb-2">
            Commande #{orderId}
          </p>
        )}
        <p className="text-[var(--color-muted)] text-lg mb-2">
          Votre paiement a ete traite avec succes.
        </p>
        {customerEmail && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-4 inline-block">
            <p className="text-green-700 text-sm">
              <i className="fas fa-envelope mr-2"></i>
              Confirmation et facture envoyees a <strong>{customerEmail}</strong>
            </p>
          </div>
        )}
        <p className="text-[var(--color-muted)] mb-8">
          Notre equipe vous contactera pour organiser la livraison ou le ramassage.
        </p>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm mb-8 text-left">
          <h2 className="font-bold mb-3">Des questions?</h2>
          <div className="space-y-2 text-sm text-[var(--color-muted)]">
            <p>
              <i className="fas fa-phone text-[var(--color-red)] mr-2"></i>
              <a href={`tel:${COMPANY_INFO.phoneTel}`} className="text-[var(--color-teal)] font-medium hover:underline">{COMPANY_INFO.phone}</a>
            </p>
            <p>
              <i className="fas fa-envelope text-[var(--color-red)] mr-2"></i>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-[var(--color-teal)] font-medium hover:underline">{COMPANY_INFO.email}</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Continuer les achats
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-[var(--color-teal)] text-[var(--color-teal)] px-8 py-4 rounded-full font-bold hover:bg-[var(--color-teal)] hover:text-white transition-all"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="pt-[80px] py-20 text-center"><i className="fas fa-spinner fa-spin text-2xl text-[var(--color-teal)]"></i></div>}>
      <SuccessContent />
    </Suspense>
  );
}
