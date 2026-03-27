"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-[var(--color-border)] rounded-full overflow-hidden">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="px-4 py-3 hover:bg-gray-100 transition font-semibold"
        >
          -
        </button>
        <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{qty}</span>
        <button
          onClick={() => setQty(qty + 1)}
          className="px-4 py-3 hover:bg-gray-100 transition font-semibold"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg ${
          added
            ? "bg-green-600 text-white"
            : "bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] hover:-translate-y-0.5"
        }`}
      >
        {added ? (
          <><i className="fas fa-check mr-2"></i>Ajoute!</>
        ) : (
          <><i className="fas fa-shopping-cart mr-2"></i>Ajouter au panier</>
        )}
      </button>
    </div>
  );
}
