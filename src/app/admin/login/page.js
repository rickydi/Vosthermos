"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function safeAdminCallbackUrl(value) {
  if (!value || typeof value !== "string") return "/admin";
  if (value.startsWith("//")) return "/admin";

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/admin";
    if (!(url.pathname === "/admin" || url.pathname.startsWith("/admin/")) || url.pathname.startsWith("/admin/login")) return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("password"); // "password" | "code"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.step === "verify_code") {
        setPendingToken(data.pendingToken);
        setSentTo(data.sentTo || "");
        setCode("");
        setResendMsg("");
        setStep("code");
      } else if (data.success) {
        // Retro-compatibilite (ne devrait plus arriver avec le 2FA actif).
        router.push(safeAdminCallbackUrl(searchParams.get("callbackUrl")));
        return;
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(safeAdminCallbackUrl(searchParams.get("callbackUrl")));
        return;
      }
      setError(data.error || "Code invalide");
    } catch {
      setError("Erreur de verification");
    }
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setResendMsg("");
    try {
      const res = await fetch("/api/admin/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMsg("Nouveau code envoye.");
        if (data.sentTo) setSentTo(data.sentTo);
      } else {
        setError(data.error || "Impossible de renvoyer le code");
      }
    } catch {
      setError("Impossible de renvoyer le code");
    }
    setResending(false);
  }

  function backToPassword() {
    setStep("password");
    setCode("");
    setError("");
    setResendMsg("");
    setPendingToken("");
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/Vos-Thermos-Logo_Blanc.png"
            alt="Vosthermos"
            width={200}
            height={56}
            className="mx-auto mb-4"
          />
          <p className="text-white/50 text-sm">Panneau d&apos;administration</p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === "password" ? (
            <form key="password" onSubmit={handlePasswordSubmit} className="transition-opacity duration-500">
              <h1 className="text-xl font-bold text-white mb-6">Connexion</h1>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Courriel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-red)]"
                    placeholder="admin@vosthermos.com"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-red)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[var(--color-red)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50"
              >
                {loading ? "Verification..." : "Se connecter"}
              </button>
            </form>
          ) : (
            <form key="code" onSubmit={handleCodeSubmit} className="transition-opacity duration-500">
              <h1 className="text-xl font-bold text-white mb-2">Verification</h1>
              <p className="text-white/60 text-sm mb-6">
                Un code a 5 chiffres a ete envoye a{" "}
                <span className="text-white font-semibold">{sentTo || "ton courriel"}</span>. Saisis-le pour continuer.
              </p>

              <div>
                <label className="block text-white/70 text-sm mb-1">Code de connexion</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{5}"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  required
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder-white/30 focus:outline-none focus:border-[var(--color-red)]"
                  placeholder="12345"
                />
              </div>

              {resendMsg && <p className="text-green-400 text-xs mt-2">{resendMsg}</p>}

              <button
                type="submit"
                disabled={loading || code.length !== 5}
                className="w-full mt-6 bg-[var(--color-red)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50"
              >
                {loading ? "Verification..." : "Verifier et se connecter"}
              </button>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={backToPassword}
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[var(--color-red)] hover:underline disabled:opacity-50"
                >
                  {resending ? "Envoi..." : "Renvoyer le code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center"><div className="text-white/50">Chargement...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
