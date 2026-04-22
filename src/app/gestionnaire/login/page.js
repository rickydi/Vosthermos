"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function LoginForm() {
  const sp = useSearchParams();
  const urlError = sp.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(urlError || "");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/manager/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f6f8", padding: "24px", fontFamily: "Montserrat, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px", background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,32,0.08)" }}>
        <div style={{ background: "#002530", padding: "24px", color: "#fff" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            VOS<span style={{ color: "#e30718" }}>THERMOS</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
            Portail Gestionnaire
          </div>
        </div>

        <div style={{ padding: "32px 28px" }}>
          {!sent ? (
            <>
              <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>Se connecter</h1>
              <p style={{ fontSize: "13px", color: "#4a5568", margin: "0 0 24px", lineHeight: 1.5 }}>
                Entrez votre courriel pour recevoir un lien de connexion sécurisé.
              </p>

              {error && (
                <div style={{ background: "#fdf2f3", color: "#c10615", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: "6px" }}></i>
                  {error}
                </div>
              )}

              <form onSubmit={submit}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", display: "block" }}>
                  Courriel
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid rgba(15,23,32,0.14)", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e30718")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(15,23,32,0.14)")}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: "16px", padding: "12px", background: "#e30718", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Envoi..." : "Recevoir mon lien"}
                </button>
              </form>

              <div style={{ marginTop: "24px", padding: "12px", background: "#f5f6f8", borderRadius: "6px", fontSize: "11px", color: "#718096", lineHeight: 1.5 }}>
                <strong style={{ color: "#0f1720" }}>Connexion sans mot de passe</strong> — nous vous enverrons un lien sécurisé valide 15 minutes.
              </div>
            </>
          ) : (
            <>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px" }}>
                <i className="fas fa-envelope"></i>
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, textAlign: "center", margin: "0 0 8px" }}>Vérifiez votre boîte de réception</h1>
              <p style={{ fontSize: "13px", color: "#4a5568", textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>
                Si le compte <strong>{email}</strong> existe, un lien de connexion vous a été envoyé.
              </p>
              <div style={{ padding: "12px", background: "#f5f6f8", borderRadius: "6px", fontSize: "11px", color: "#718096", textAlign: "center" }}>
                Pensez à vérifier votre dossier <strong>courrier indésirable</strong> si vous ne voyez pas l'email.
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ width: "100%", marginTop: "16px", padding: "10px", background: "transparent", border: "1px solid rgba(15,23,32,0.14)", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Utiliser une autre adresse
              </button>
            </>
          )}
        </div>

        <div style={{ padding: "14px 28px", borderTop: "1px solid rgba(15,23,32,0.08)", fontSize: "10px", color: "#718096", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
          Hébergé au Canada · Conformité Loi 25
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
