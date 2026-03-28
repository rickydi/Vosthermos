"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function PanierPage() {
  const { items, updateQty, removeItem, total, loaded } = useCart();

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="pt-[80px]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <i className="fas fa-shopping-cart text-5xl text-[var(--color-muted)] mb-6"></i>
          <h1 className="text-3xl font-extrabold mb-4">Votre panier est vide</h1>
          <p className="text-[var(--color-muted)] mb-8">
            Parcourez notre boutique pour trouver les pieces dont vous avez besoin.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
          >
            Voir la boutique <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[80px]">
      <div className="bg-[var(--color-teal-dark)] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl font-extrabold text-white">Panier</h1>
          <p className="text-white/60 text-sm mt-1">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm"
            >
              <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/produit/${item.slug}`} className="font-semibold hover:text-[var(--color-teal)] line-clamp-1 transition-colors">
                  {item.name}
                </Link>
                <p className="text-sm text-[var(--color-muted)] font-mono">{item.sku}</p>
                <p className="text-sm font-semibold mt-1">{item.price.toFixed(2)} $ / unite</p>
              </div>

              <div className="flex items-center border border-[var(--color-border)] rounded-full overflow-hidden">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1.5 hover:bg-gray-100 transition-colors">-</button>
                <span className="px-3 py-1.5 min-w-[2.5rem] text-center font-semibold text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1.5 hover:bg-gray-100 transition-colors">+</button>
              </div>

              <p className="font-bold w-24 text-right text-[var(--color-teal)]">
                {(item.price * item.qty).toFixed(2)} $
              </p>

              <button
                onClick={() => removeItem(item.id)}
                className="text-[var(--color-muted)] hover:text-[var(--color-red)] p-2 transition-colors"
                aria-label="Retirer"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex justify-between items-center text-xl font-extrabold">
            <span>Sous-total</span>
            <span className="text-[var(--color-teal)]">{total.toFixed(2)} $</span>
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            Taxes et frais de livraison calcules au checkout.
          </p>

          <Link
            href="/checkout"
            className="block w-full mt-6 bg-[var(--color-red)] text-white text-center py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg text-lg"
          >
            Passer a la caisse
          </Link>
        </div>
      </div>
    </div>
  );
}
