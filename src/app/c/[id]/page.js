"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

export default function PublicChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [clientName, setClientName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    if (id) {
      localStorage.setItem("vosthermos-chat-id", id);
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [id]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/public/chat/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setClientName(data.clientName);
    } catch {}
  }

  async function handleSend() {
    if (!inputValue.trim() || sending) return;
    const content = inputValue.trim();
    setInputValue("");
    setSending(true);
    const temp = { id: "t-" + Date.now(), senderType: "CLIENT", content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    try {
      const res = await fetch(`/api/public/chat/${id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }),
      });
      if (res.ok) await fetchMessages();
      else setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } catch { setMessages((prev) => prev.filter((m) => m.id !== temp.id)); }
    finally { setSending(false); }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[var(--color-teal-dark)] flex items-center justify-center">
        <p className="text-white/60">Conversation introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-teal-dark)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-red)] px-6 py-4 flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <div>
          <h1 className="text-white font-bold">Vosthermos</h1>
          <p className="text-white/60 text-xs">Conversation avec notre equipe</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-white/40 text-sm text-center py-8">Envoyez votre premier message!</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderType === "CLIENT" ? "items-end" : "items-start"}`}>
            {msg.senderType === "ADMIN" && <span className="text-xs text-white/40 mb-1 font-medium">Vosthermos</span>}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${msg.senderType === "CLIENT" ? "bg-[var(--color-red)]/15 text-white" : "bg-white/8 text-white"}`}>
              {msg.content}
              {msg.imageUrl && <img src={msg.imageUrl} alt="" className="max-w-full rounded-lg mt-1" loading="lazy" />}
            </div>
            <span className="text-[10px] text-white/30 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Votre message..."
            className="flex-1 resize-none rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-red)] transition-colors"
            style={{ maxHeight: "96px" }} />
          <button onClick={handleSend} disabled={!inputValue.trim() || sending}
            className="bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
