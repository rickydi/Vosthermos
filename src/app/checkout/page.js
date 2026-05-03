"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import Image from "next/image";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export default function CheckoutPage() {
  const { items, total, loaded, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "QC",
    postalCode: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur lors de la creation de la session de paiement.");
        setLoading(false);
      }
    } catch {
      setError("Erreur de connexion. Veuillez reessayer.");
      setLoading(false);
    }
  }

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="pt-[80px]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <i className="fas fa-shopping-cart text-5xl text-[var(--color-muted)] mb-6"></i>
          <h1 className="text-3xl font-extrabold mb-4">Votre panier est vide</h1>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    );
  }

  const tps = total * 0.05;
  const tvq = total * 0.09975;
  const grandTotal = total + tps + tvq;

  return (
    <div className="pt-[80px]">
      <div className="bg-[var(--color-teal-dark)] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
            <Link href="/panier" className="hover:text-white transition-colors">Panier</Link>
            <span>/</span>
            <span className="text-white">Paiement</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Passer la commande</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                <h2 className="font-bold text-lg mb-4">
                  <i className="fas fa-user text-[var(--color-red)] mr-2"></i>
                  Informations de contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Nom complet *</label>
                    <input
                      type="text" id="name" name="name" required
                      value={form.name} onChange={handleChange}
                      className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Courriel *</label>
                    <input
                      type="email" id="email" name="email" required
                      value={form.email} onChange={handleChange}
                      className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Telephone *</label>
                    <input
                      type="tel" id="phone" name="phone" required
                      value={form.phone} onChange={handleChange}
                      className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                <h2 className="font-bold text-lg mb-4">
                  <i className="fas fa-map-marker-alt text-[var(--color-red)] mr-2"></i>
                  Adresse de livraison
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Adresse *</label>
                    <AddressAutocomplete
                      value={form.address}
                      onChange={(address) => setForm((prev) => ({ ...prev, address }))}
                      onSelect={(addr) => setForm((prev) => ({ ...prev, ...addr }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">Ville *</label>
                      <input
                        type="text" id="city" name="city" required
                        value={form.city} onChange={handleChange}
                        className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium mb-1">Province</label>
                      <select
                        id="province" name="province"
                        value={form.province} onChange={handleChange}
                        className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                      >
                        <option value="QC">Quebec</option>
                        <option value="ON">Ontario</option>
                        <option value="NB">Nouveau-Brunswick</option>
                        <option value="NS">Nouvelle-Ecosse</option>
                        <option value="PE">Ile-du-Prince-Edouard</option>
                        <option value="NL">Terre-Neuve</option>
                        <option value="MB">Manitoba</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="AB">Alberta</option>
                        <option value="BC">Colombie-Britannique</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-1">Code postal *</label>
                      <input
                        type="text" id="postalCode" name="postalCode" required
                        value={form.postalCode} onChange={handleChange}
                        placeholder={COMPANY_INFO.postalCode}
                        className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-red)] text-white py-4 rounded-full font-bold text-lg hover:bg-[var(--color-red-dark)] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Redirection vers le paiement...</>
                ) : (
                  <><i className="fas fa-lock"></i> Payer {grandTotal.toFixed(2)} $ <i className="fas fa-arrow-right ml-1"></i></>
                )}
              </button>

              <p className="text-center text-xs text-[var(--color-muted)]">
                <i className="fas fa-shield-alt mr-1"></i>
                Paiement securise par Stripe. Vos informations bancaires ne sont jamais stockees sur notre site.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm sticky top-[100px]">
              <h2 className="font-bold text-lg mb-4">Sommaire de la commande</h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">x{item.qty}</p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">{(item.price * item.qty).toFixed(2)} $</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted)]">Sous-total</span>
                  <span>{total.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted)]">TPS (5%)</span>
                  <span>{tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted)]">TVQ (9.975%)</span>
                  <span>{tvq.toFixed(2)} $</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2 flex justify-between font-extrabold text-lg">
                  <span>Total</span>
                  <span className="text-[var(--color-teal)]">{grandTotal.toFixed(2)} $</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
