"use client";

import { useState } from "react";
import useFormTracking from "@/lib/useFormTracking";
import { formatPhoneInput } from "@/lib/phone";

const inputWrap = "relative";
const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[var(--color-red)] transition-colors pr-10";
const checkClass = "absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm pointer-events-none";

export default function QuoteForm({ compact = false }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("soumission");

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const serviceValid = service.length > 0;
  const messageValid = message.trim().length >= 3;

  function handlePhoneChange(e) {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
    trackFieldValue("phone", formatted);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, service, message }),
      });
      if (res.ok) {
        trackSubmit();
        setStatus("success");
        setName(""); setPhone(""); setEmail(""); setService(""); setMessage("");
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
      <div className={inputWrap}>
        <input type="text" placeholder="Nom complet" required value={name}
          onFocus={() => trackFieldFocus("name")}
          onChange={(e) => { setName(e.target.value); trackFieldValue("name", e.target.value); }}
          className={inputClass} />
        {nameValid && <span className={checkClass}>&#10003;</span>}
      </div>
      <div className={inputWrap}>
        <input type="tel" placeholder="514-555-5555" required value={phone}
          onFocus={() => trackFieldFocus("phone")}
          onChange={handlePhoneChange}
          maxLength={12}
          className={inputClass} />
        {phoneValid && <span className={checkClass}>&#10003;</span>}
      </div>
      <div className={inputWrap}>
        <input type="email" placeholder="Email" required value={email}
          onFocus={() => trackFieldFocus("email")}
          onChange={(e) => { setEmail(e.target.value); trackFieldValue("email", e.target.value); }}
          className={inputClass} />
        {emailValid && <span className={checkClass}>&#10003;</span>}
      </div>
      <div className={inputWrap}>
        <select required value={service}
          onFocus={() => trackFieldFocus("service")}
          onChange={(e) => { setService(e.target.value); trackFieldValue("service", e.target.value); }}
          className={`${inputClass} [&>option]:text-gray-800`}>
          <option value="">Selectionnez un service</option>
          <option value="quincaillerie">Quincaillerie</option>
          <option value="vitre-thermos">Vitre thermos</option>
          <option value="portes-bois">Portes en bois</option>
          <option value="moustiquaire">Moustiquaires</option>
          <option value="calfeutrage">Calfeutrage</option>
          <option value="coupe-froid">Coupe-froid</option>
          <option value="desembuage">Desembuage</option>
          <option value="insertion-porte">Insertion de porte</option>
          <option value="opti-fenetre">Programme OPTI-FENETRE</option>
          <option value="autre">Autre</option>
        </select>
        {serviceValid && <span className={checkClass}>&#10003;</span>}
      </div>
      <div className={inputWrap}>
        <textarea placeholder="Decrivez votre besoin..." rows={compact ? 2 : 3} value={message}
          onFocus={() => trackFieldFocus("message")}
          onChange={(e) => { setMessage(e.target.value); trackFieldValue("message", e.target.value); }}
          className={`${inputClass} resize-none ${compact ? "flex-1 min-h-[48px]" : ""}`} />
        {messageValid && <span className={`${checkClass} top-4`}>&#10003;</span>}
      </div>
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
