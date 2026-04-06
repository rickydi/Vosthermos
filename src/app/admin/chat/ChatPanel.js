"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatPhone } from "@/lib/phone";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "maintenant";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" });
}

export default function ChatPanel({ initialConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const messagesEnd = useRef(null);
  const selectedIdRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat");
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch {}
  }, []);

  const openConversation = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/admin/chat/${id}`);
      const data = await res.json();
      if (data && data.id) { setSelected(data); selectedIdRef.current = data.id; }
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations().then(() => {
      if (initialConversationId) openConversation(initialConversationId);
    });
  }, []);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [selected?.messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedIdRef.current) openConversation(selectedIdRef.current);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchConversations, openConversation]);

  async function sendMessage(imageUrl) {
    if (!newMsg.trim() && !imageUrl) return;
    if (!selected) return;
    setSending(true);
    try {
      await fetch(`/api/admin/chat/${selected.id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMsg, imageUrl: imageUrl || undefined }),
      });
      setNewMsg("");
      await openConversation(selected.id);
      await fetchConversations();
    } catch {}
    setSending(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !selected || uploading) return;
    e.target.value = "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/public/chat/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) { setUploading(false); return; }
      const { url } = await uploadRes.json();
      await sendMessage(url);
    } catch {}
    finally { setUploading(false); }
  }

  async function generateReply() {
    if (!selected || generating) return;
    setGenerating(true);
    try {
      const msgs = selected.messages?.slice(-10).map((m) => `${m.senderType === "CLIENT" ? selected.clientName : "Vosthermos"}: ${m.content}`).join("\n") || "";
      const res = await fetch("/api/admin/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", messages: msgs, clientName: selected.clientName }),
      });
      if (res.ok) {
        const { reply } = await res.json();
        setNewMsg(reply);
      }
    } catch {}
    setGenerating(false);
  }

  async function correctText() {
    if (!newMsg.trim() || correcting) return;
    setCorrecting(true);
    try {
      const res = await fetch("/api/admin/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "correct", text: newMsg }),
      });
      if (res.ok) {
        const { corrected } = await res.json();
        setNewMsg(corrected);
      }
    } catch {}
    setCorrecting(false);
  }

  async function toggleArchive() {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/chat/${selected.id}/archive`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isArchived: !selected.isArchived }),
      });
      if (res.ok) { setSelected({ ...selected, isArchived: !selected.isArchived }); await fetchConversations(); }
    } catch {}
  }

  async function deleteConversation() {
    if (!selected || !confirm("Supprimer cette conversation definitivement?")) return;
    try {
      const res = await fetch(`/api/admin/chat/${selected.id}/delete`, { method: "POST" });
      if (res.ok) { setSelected(null); selectedIdRef.current = null; await fetchConversations(); }
    } catch {}
  }

  const filtered = conversations.filter((c) => {
    if (filter === "unread" && c.unreadCount <= 0) return false;
    if (filter === "archived" && !c.isArchived) return false;
    if (filter === "all" && c.isArchived) return false;
    return true;
  });

  const filterTabs = [
    { key: "all", label: "Toutes" },
    { key: "unread", label: "Non-lues" },
    { key: "archived", label: "Archivees" },
  ];

  const showMobileMessages = selected !== null;

  return (
    <div className="flex gap-6 h-[calc(100dvh-8rem)] md:h-[calc(100vh-10rem)]">
      {/* Left: conversation list */}
      <div className={`w-full md:w-80 shrink-0 flex flex-col ${showMobileMessages ? "hidden md:flex" : "flex"}`}>
        <div className="flex gap-1 mb-4">
          {filterTabs.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === tab.key ? "bg-[var(--color-red)]/10 text-[var(--color-red)]" : "admin-text-muted admin-hover"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => openConversation(c.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selected?.id === c.id ? "bg-[var(--color-red)]/10 border border-[var(--color-red)]" : "admin-card border admin-hover"} ${c.isArchived ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="admin-text text-sm font-semibold truncate">{c.clientName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] admin-text-muted">{timeAgo(c.lastMessageAt)}</span>
                  {c.unreadCount > 0 && (
                    <span className="bg-[var(--color-red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{c.unreadCount}</span>
                  )}
                </div>
              </div>
              <p className="text-xs admin-text-muted truncate">{formatPhone(c.clientPhone)}</p>
              {c.messages?.[0] && (
                <p className="text-sm admin-text-muted truncate mt-1">
                  {c.messages[0].senderType === "ADMIN" && "Vous: "}{c.messages[0].content}
                </p>
              )}
            </button>
          ))}
          {filtered.length === 0 && <p className="admin-text-muted text-sm text-center py-8">Aucune conversation</p>}
        </div>
      </div>

      {/* Right: messages */}
      <div className={`flex-1 flex flex-col admin-card border rounded-xl overflow-hidden ${showMobileMessages ? "flex" : "hidden md:flex"}`}>
        {selected ? (
          <>
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b admin-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelected(null); selectedIdRef.current = null; }} className="md:hidden admin-text-muted hover:admin-text transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="admin-text text-lg md:text-base font-bold md:font-semibold">{selected.clientName}</h2>
                    <button onClick={() => navigator.clipboard.writeText(formatPhone(selected.clientPhone))}
                      className="text-sm md:text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium" title="Copier">
                      {formatPhone(selected.clientPhone)}
                    </button>
                    {selected.clientEmail && (
                      <button onClick={() => navigator.clipboard.writeText(selected.clientEmail)}
                        className="text-sm md:text-xs admin-text-muted hover:admin-text transition-colors" title="Copier">
                        {selected.clientEmail}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={toggleArchive} className="px-4 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg text-xs font-semibold transition-colors">
                  {selected.isArchived ? "Desarchiver" : "Archiver"}
                </button>
                <button onClick={deleteConversation} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition-colors">
                  Supprimer
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
              {selected.messages?.map((msg) => {
                const isAdmin = msg.senderType === "ADMIN";
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${isAdmin ? "bg-blue-500/20" : "bg-white/5"} rounded-2xl px-4 py-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="admin-text text-xs font-semibold">{isAdmin ? msg.senderName : selected.clientName}</span>
                        <span className="text-[10px] admin-text-muted">
                          {new Date(msg.createdAt).toLocaleString("fr-CA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="admin-text text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.imageUrl && <img src={msg.imageUrl} alt="" className="max-w-full rounded-lg mt-1" loading="lazy" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-t admin-border">
              <div className="flex gap-2 mb-2">
                <button onClick={generateReply} disabled={generating || !selected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 disabled:opacity-30">
                  <i className={`fas fa-magic ${generating ? "fa-spin" : ""}`}></i>
                  {generating ? "Generation..." : "Generer une reponse"}
                </button>
                <button onClick={correctText} disabled={correcting || !newMsg.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 disabled:opacity-30">
                  <i className={`fas fa-spell-check ${correcting ? "fa-spin" : ""}`}></i>
                  {correcting ? "Correction..." : "Corriger texte"}
                </button>
              </div>
              <div className="flex gap-2 items-end">
                <label className="shrink-0 cursor-pointer admin-text-muted hover:admin-text transition-colors p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <textarea value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ecrire un message..." rows={1}
                  className="flex-1 px-4 py-2.5 admin-input border rounded-xl text-sm focus:outline-none focus:border-[var(--color-red)] resize-none" />
                <button onClick={() => sendMessage()} disabled={(sending || !newMsg.trim()) && !uploading}
                  className="px-4 md:px-6 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors self-end py-2.5">
                  {sending || uploading ? "..." : "Envoyer"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center admin-text-muted text-sm">
            Selectionne une conversation pour voir les messages
          </div>
        )}
      </div>
    </div>
  );
}
