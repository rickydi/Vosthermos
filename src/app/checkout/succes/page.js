"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="pt-[65px]">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Merci pour votre commande!</h1>
        <p className="text-[var(--color-muted)] text-lg mb-2">
          Votre paiement a ete traite avec succes.
        </p>
        <p className="text-[var(--color-muted)] mb-8">
          Vous recevrez un courriel de confirmation sous peu.
          Notre equipe vous contactera pour organiser la livraison ou le ramassage.
        </p>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm mb-8 text-left">
          <h2 className="font-bold mb-3">Des questions?</h2>
          <div className="space-y-2 text-sm text-[var(--color-muted)]">
            <p>
              <i className="fas fa-phone text-[var(--color-red)] mr-2"></i>
              <a href="tel:15148258411" className="text-[var(--color-teal)] font-medium hover:underline">514-825-8411</a>
            </p>
            <p>
              <i className="fas fa-envelope text-[var(--color-red)] mr-2"></i>
              <a href="mailto:info@vosthermos.com" className="text-[var(--color-teal)] font-medium hover:underline">info@vosthermos.com</a>
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
