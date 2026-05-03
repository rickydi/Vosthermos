"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { formatPhoneInput } from "@/lib/phone";
import useFormTracking from "@/lib/useFormTracking";

export default function ChatBubble() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/terrain") ||
    pathname.startsWith("/gestionnaire")
  ) return null;
  return <ChatBubbleInner />;
}

function ChatBubbleInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaModal, setMediaModal] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [formError, setFormError] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("chat");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("vosthermos-chat-id");
    if (storedId) {
      setConversationId(storedId);
      const storedPhone = localStorage.getItem("vosthermos-chat-phone");
      const storedEmail = localStorage.getItem("vosthermos-chat-email");
      if (storedPhone) setClientPhone(storedPhone);
      if (storedEmail) setClientEmail(storedEmail);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/public/chat/${conversationId}`);
      if (res.status === 404) {
        localStorage.removeItem("vosthermos-chat-id");
        localStorage.removeItem("vosthermos-chat-phone");
        localStorage.removeItem("vosthermos-chat-email");
        setConversationId(null);
        setMessages([]);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      if (!isOpen && data.messages.length > lastMessageCountRef.current) {
        const newMsgs = data.messages.slice(lastMessageCountRef.current);
        if (newMsgs.some((m) => m.senderType === "ADMIN")) setHasUnread(true);
      }
      lastMessageCountRef.current = data.messages.length;
    } catch {}
  }, [conversationId, isOpen]);

  const pingPresence = useCallback(() => {
    if (!conversationId || document.hidden) return;
    fetch(`/api/public/chat/${conversationId}/ping`, { method: "POST" }).catch(() => {});
  }, [conversationId]);

  useEffect(() => { if (conversationId) fetchMessages(); }, [conversationId, fetchMessages]);
  useEffect(() => {
    if (!conversationId) return;
    pingPresence();
    const interval = setInterval(pingPresence, 30000);
    return () => clearInterval(interval);
  }, [conversationId, pingPresence]);
  useEffect(() => {
    if (!isOpen || !conversationId) return;
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [isOpen, conversationId, fetchMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) setHasUnread(false); }, [isOpen]);

  const handleTextareaInput = (e) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 72) + "px";
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setFormError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: clientName.trim(), clientPhone: clientPhone.trim(), clientEmail: clientEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Erreur."); return; }
      trackSubmit();
      localStorage.setItem("vosthermos-chat-id", data.id);
      localStorage.setItem("vosthermos-chat-phone", clientPhone.trim());
      localStorage.setItem("vosthermos-chat-email", clientEmail.trim());
      setConversationId(data.id);
    } catch { setFormError("Erreur de connexion."); }
    finally { setLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || sending) return;
    const content = inputValue.trim();
    setInputValue("");
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const tempMsg = { id: "temp-" + Date.now(), senderType: "CLIENT", content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const res = await fetch(`/api/public/chat/${conversationId}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }),
      });
      if (!res.ok) setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      else await fetchMessages();
    } catch { setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id)); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || uploading) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 25 MB)");
      e.target.value = "";
      return;
    }
    e.target.value = "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/public/chat/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) { setUploading(false); return; }
      const { url } = await uploadRes.json();
      const res = await fetch(`/api/public/chat/${conversationId}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue.trim() || "", imageUrl: url }),
      });
      if (res.ok) { setInputValue(""); if (textareaRef.current) textareaRef.current.style.height = "auto"; await fetchMessages(); }
    } catch {}
    finally { setUploading(false); }
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop — grayscale overlay when chat is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
          style={{ backdropFilter: "grayscale(100%) brightness(0.7)" }}
        />
      )}

    <div
      className="fixed z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{
        transition: "all 600ms cubic-bezier(0.32, 0.72, 0, 1)",
        right: isOpen ? "50%" : "16px",
        bottom: isOpen ? "10vh" : "16px",
        transform: isOpen ? "translateX(50%) scale(1)" : "translateX(0) scale(1)",
        width: isOpen ? "min(95vw, 600px)" : "280px",
        maxHeight: isOpen ? "80vh" : "500px",
      }}
    >
      <style jsx global>{`
        @keyframes chatAppear { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 md:px-5 md:py-3 bg-[var(--color-red)] shrink-0 cursor-pointer hover:bg-[var(--color-red-dark)] transition-colors ${!isOpen ? "animate-[wiggle_3s_ease-in-out_infinite_2s]" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <span className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div>
            <span className="text-white text-xs md:text-sm font-bold block">Discuter avec nous</span>
            <span className="text-white/70 text-[10px] md:text-xs hidden md:block">Nous sommes en ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {hasUnread && <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className={`bg-[var(--color-teal-dark)] transition-all duration-1000 ease-in-out overflow-hidden ${isOpen ? "max-h-[500px] md:max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        {/* Auto greeting */}
        {isOpen && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-start gap-2.5">
              <span className="w-8 h-8 bg-[var(--color-red)] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div className="space-y-2">
                <span className="text-white/50 text-[10px] font-medium block mb-1">Vosthermos</span>
                <div className="bg-white/[0.08] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-white/90 leading-relaxed">
                  Bonjour! Comment puis-je vous aider? 😊
                </div>
                <div className="bg-white/[0.08] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-white/90 leading-relaxed">
                  Vous pouvez nous envoyer une photo de votre piece pour qu&apos;on vous aide plus vite! Cliquez sur le bouton <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-text-bottom text-white/60"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> en bas a gauche.
                </div>
              </div>
            </div>
          </div>
        )}
        {!conversationId ? (
          <form onSubmit={handleStartConversation} className="flex flex-col gap-3 px-4 pb-4 pt-2">
            <p className="text-white/50 text-xs">Entrez vos coordonnees pour demarrer la conversation.</p>
            <div className="relative">
              <input type="text" placeholder="Votre nom" value={clientName}
                onChange={(e) => { setClientName(e.target.value); if (e.target.value) trackFieldValue("name", e.target.value); }}
                onFocus={() => trackFieldFocus("name")} required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-8 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-red)]/50 transition-colors" />
              {clientName.trim().length >= 2 && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-sm">&#10003;</span>}
            </div>
            <div className="relative">
              <input type="tel" placeholder="555-555-5555" value={clientPhone}
                onChange={(e) => { setClientPhone(formatPhoneInput(e.target.value)); if (e.target.value) trackFieldValue("phone", formatPhoneInput(e.target.value)); }}
                onFocus={() => trackFieldFocus("phone")} required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-8 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-red)]/50 transition-colors" />
              {clientPhone.replace(/\D/g, "").length >= 10 && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-sm">&#10003;</span>}
            </div>
            <div className="relative">
              <input type="email" placeholder="Votre email" value={clientEmail}
                onChange={(e) => { setClientEmail(e.target.value); if (e.target.value) trackFieldValue("email", e.target.value); }}
                onFocus={() => trackFieldFocus("email")} required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-8 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-red)]/50 transition-colors" />
              {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-sm">&#10003;</span>}
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] text-white font-semibold rounded-xl py-2 text-sm transition-colors disabled:opacity-50">
              {loading ? "Connexion..." : "Commencer"}
            </button>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[400px]">
              {messages.length === 0 && <p className="text-white/40 text-sm text-center py-4">Envoyez votre premier message!</p>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderType === "CLIENT" ? "items-end" : "items-start"}`}>
                  {msg.senderType === "ADMIN" && <span className="text-xs text-white/40 mb-1 font-medium">Vosthermos</span>}
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${msg.senderType === "CLIENT" ? "bg-[var(--color-red)]/15 text-white" : "bg-white/8 text-white"}`}>
                    {msg.content}
                    {msg.imageUrl && (msg.imageUrl.match(/\.(mp4|mov|webm|avi|m4v)$/i) ? (
                      <button onClick={() => setMediaModal({ type: "video", url: msg.imageUrl })} className="block mt-1 w-full text-left">
                        <div className="relative bg-black/30 rounded-lg overflow-hidden">
                          <video src={msg.imageUrl} preload="metadata" className="max-w-full rounded-lg" style={{ maxHeight: "150px" }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <i className="fas fa-play text-[var(--color-teal-dark)] ml-0.5 text-sm"></i>
                            </div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <button onClick={() => setMediaModal({ type: "image", url: msg.imageUrl })} className="block mt-1"><img src={msg.imageUrl} alt="" className="max-w-full rounded-lg cursor-pointer" loading="lazy" /></button>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/30 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-white/10 p-3 shrink-0">
              <div className="flex items-end gap-2">
                <label className="shrink-0 cursor-pointer text-white/40 hover:text-white transition-colors p-2 animate-[pulse_2s_ease-in-out_3]" title="Photo ou video (max 25 MB)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
                  </svg>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <textarea ref={textareaRef} rows={1} value={inputValue} onChange={handleTextareaInput} onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  className="flex-1 resize-none rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-red)] transition-colors"
                  style={{ maxHeight: "72px" }} />
                <button onClick={handleSendMessage} disabled={(!inputValue.trim() || sending) && !uploading}
                  className="shrink-0 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] text-white rounded-xl p-2 transition-colors disabled:opacity-50" aria-label="Envoyer">
                  {uploading ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Media Modal */}
      {mediaModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setMediaModal(null)}>
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMediaModal(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg z-10 hover:bg-gray-100">
              <i className="fas fa-times text-sm"></i>
            </button>
            {mediaModal.type === "video" ? (
              <video src={mediaModal.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
            ) : (
              <img src={mediaModal.url} alt="" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
