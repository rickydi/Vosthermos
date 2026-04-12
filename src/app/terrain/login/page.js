"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PinPad() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(fullPin) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/technician/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      });
      if (res.ok) {
        const callback = searchParams.get("callbackUrl") || "/terrain";
        router.push(callback);
      } else {
        setError("PIN incorrect");
        setPin("");
      }
    } catch {
      setError("Erreur de connexion");
      setPin("");
    }
    setLoading(false);
  }

  function handleDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) submit(next);
  }

  function handleDelete() {
    setPin(pin.slice(0, -1));
    setError("");
  }

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"];

  return (
    <div className="min-h-dvh bg-[#0a0f1a] flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-[var(--color-red)] rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white text-2xl font-black">V</span>
      </div>
      <h1 className="text-white text-xl font-bold mb-2">Vosthermos Terrain</h1>
      <p className="text-white/40 text-sm mb-8">Entrez votre PIN pour commencer</p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < pin.length ? "bg-[var(--color-red)] scale-110" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 animate-[fadeIn_0.3s]">{error}</p>
      )}

      {loading && (
        <p className="text-white/50 text-sm mb-4">
          <i className="fas fa-spinner fa-spin mr-2"></i>Connexion...
        </p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {digits.map((d, i) => {
          if (d === null) return <div key={i} />;
          if (d === "del") {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-white/5 text-white/60 text-xl flex items-center justify-center active:bg-white/10 transition-colors"
              >
                <i className="fas fa-delete-left"></i>
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(String(d))}
              disabled={loading}
              className="h-16 rounded-2xl bg-white/10 text-white text-2xl font-bold flex items-center justify-center active:bg-[var(--color-red)]/30 transition-colors disabled:opacity-30"
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TerrainLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0a0f1a]" />}>
      <PinPad />
    </Suspense>
  );
}
