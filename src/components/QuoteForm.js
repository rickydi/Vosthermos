"use client";

import { useState, useRef } from "react";
import useFormTracking from "@/lib/useFormTracking";
import { formatPhoneInput } from "@/lib/phone";

const inputWrap = "relative";
const inputClass = "w-full bg-white border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[var(--color-red)] transition-colors pr-10";
const checkClass = "absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none";

export default function QuoteForm({ compact = false }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("soumission");

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const serviceValid = service.length > 0;
  const messageValid = message.trim().length >= 3;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function handleMessageChange(e) {
    setMessage(e.target.value);
    trackFieldValue("message", e.target.value);
    autoResize();
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.size <= 25 * 1024 * 1024);
    if (valid.length < selected.length) alert("Certains fichiers depassent 25 MB et ont ete ignores.");
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

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
      // Upload files first
      const fileUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/public/chat/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          fileUrls.push(url);
        }
      }

      // Create chat conversation
      const cleanPhone = phone.replace(/\D/g, "");
      const chatRes = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name.trim(),
          clientPhone: cleanPhone,
          clientEmail: email.trim().toLowerCase(),
        }),
      });

      if (!chatRes.ok) throw new Error("Erreur conversation");
      const { id } = await chatRes.json();

      // Build message content
      const serviceLabels = {
        quincaillerie: "Quincaillerie", "vitre-thermos": "Vitre thermos", "portes-bois": "Portes en bois",
        moustiquaire: "Moustiquaires", calfeutrage: "Calfeutrage", "coupe-froid": "Coupe-froid",
        desembuage: "Désembuage", "insertion-porte": "Insertion de porte", "opti-fenetre": "Programme OPTI-FENÊTRE", autre: "Autre",
      };
      let content = `[Soumission] Service: ${serviceLabels[service] || service}`;
      if (message.trim()) content += `\n\n${message.trim()}`;

      // Send message (text)
      const msgRes = await fetch(`/api/public/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!msgRes.ok) throw new Error("Erreur message");

      // Send file attachments as separate messages
      for (const url of fileUrls) {
        await fetch(`/api/public/chat/${id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "", imageUrl: url }),
        });
      }

      trackSubmit();
      setStatus("success");
      setName(""); setPhone(""); setEmail(""); setService(""); setMessage(""); setFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch {
      setStatus("error");
    }
    setSending(false);
  }

  if (status === "success") {
    if (compact) {
      return (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center animate-[fadeIn_0.5s_ease-out]">
            <span className="text-green-400 text-2xl">&#10003;</span>
          </div>
          <p className="text-white/70 text-sm text-center">
            On s&apos;en occupe! Nous vous contacterons rapidement.
          </p>
          <a href="tel:15148258411" className="text-white/50 hover:text-white text-xs transition-colors">
            <i className="fas fa-phone text-[10px] mr-1"></i>514-825-8411
          </a>
          <button
            onClick={() => setStatus("")}
            className="text-white/30 hover:text-white/60 text-[11px] underline transition-colors"
          >
            Envoyer une autre demande
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-6 border border-green-500/20">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-[fadeIn_0.5s_ease-out]">
            <span className="text-green-400 text-3xl">&#10003;</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Demande envoyee!</h3>
          <p className="text-white/50 text-sm mb-4">
            Nous avons bien recu votre demande et vous contacterons rapidement.
          </p>
          <button
            onClick={() => setStatus("")}
            className="text-white/40 hover:text-white text-xs underline transition-colors"
          >
            Envoyer une autre demande
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-white/50 text-xs">ou appelez-nous </span>
          <a href="tel:15148258411" className="text-white font-semibold text-sm hover:text-[var(--color-red-light)]">
            <i className="fas fa-phone text-xs"></i> 514-825-8411
          </a>
        </div>
      </div>
    );
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
        <textarea ref={textareaRef} placeholder="Decrivez votre besoin..." rows={compact ? 2 : 3} value={message}
          onFocus={() => trackFieldFocus("message")}
          onChange={handleMessageChange}
          className={`${inputClass} resize-none overflow-hidden ${compact ? "min-h-[48px]" : "min-h-[72px]"}`}
          style={{ height: "auto" }} />
        {messageValid && <span className={`${checkClass} top-4`}>&#10003;</span>}
      </div>

      {/* File upload */}
      <div>
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors py-1">
          <i className="fas fa-paperclip"></i>
          Joindre photo ou video (max 25 MB)
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70">
                <i className={`fas ${f.type.startsWith("video") ? "fa-video" : "fa-image"} text-[10px]`}></i>
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 ml-1">
                  <i className="fas fa-times text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={sending}
        className="w-full bg-[var(--color-red)] text-white py-2.5 rounded-full font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50 shadow-lg">
        {sending ? "Envoi..." : "Envoyer la demande"}
      </button>
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
