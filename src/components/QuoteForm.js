"use client";

import { useState } from "react";
import useFormTracking from "@/lib/useFormTracking";

const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[var(--color-red)] transition-colors";

export default function QuoteForm({ compact = false }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("soumission");

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus("");
    const form = e.target;
    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      service: form.service.value,
      message: form.message.value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        trackSubmit();
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setSending(false);
  }

  const formContent = (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2.5 flex flex-col flex-1" : "space-y-3"}>
      <input type="text" name="name" placeholder="Nom complet" required
        onFocus={() => trackFieldFocus("name")} onChange={(e) => trackFieldValue("name", e.target.value)}
        className={inputClass} />
      <input type="tel" name="phone" placeholder="Telephone" required
        onFocus={() => trackFieldFocus("phone")} onChange={(e) => trackFieldValue("phone", e.target.value)}
        className={inputClass} />
      <input type="email" name="email" placeholder="Email" required
        onFocus={() => trackFieldFocus("email")} onChange={(e) => trackFieldValue("email", e.target.value)}
        className={inputClass} />
      <select name="service" required
        onFocus={() => trackFieldFocus("service")} onChange={(e) => trackFieldValue("service", e.target.value)}
        className={`${inputClass} [&>option]:text-gray-800`}>
        <option value="">Type de service</option>
        <option value="quincaillerie">Quincaillerie</option>
        <option value="vitre-thermos">Vitre thermos</option>
        <option value="portes-bois">Portes en bois</option>
        <option value="moustiquaire">Moustiquaires</option>
        <option value="autre">Autre</option>
      </select>
      <textarea name="message" placeholder="Decrivez votre besoin..." rows={compact ? 2 : 3}
        onFocus={() => trackFieldFocus("message")} onChange={(e) => trackFieldValue("message", e.target.value)}
        className={`${inputClass} resize-none ${compact ? "flex-1 min-h-[48px]" : ""}`} />
      <button type="submit" disabled={sending}
        className="w-full bg-[var(--color-red)] text-white py-2.5 rounded-full font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50 shadow-lg">
        {sending ? "Envoi..." : "Envoyer la demande"}
      </button>
      {status === "success" && (
        <p className="text-green-400 text-xs text-center">Merci! Nous vous contacterons bientot.</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-xs text-center">Erreur. Appelez-nous au 514-825-8411.</p>
      )}
    </form>
  );

  if (compact) return formContent;

  return (
    <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-white/[0.08]">
      <h2 className="text-white font-bold text-lg mb-4">Soumission gratuite</h2>
      {formContent}
      <div className="text-center mt-3">
        <span className="text-white/50 text-xs">ou appelez-nous </span>
        <a href="tel:15148258411" className="text-white font-semibold text-sm hover:text-[var(--color-red-light)]">
          <i className="fas fa-phone text-xs"></i> 514-825-8411
        </a>
      </div>
    </div>
  );
}
