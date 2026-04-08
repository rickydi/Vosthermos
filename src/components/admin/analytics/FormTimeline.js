"use client";

import { useState, useEffect } from "react";

const FIELD_ORDER = ["name", "phone", "email", "service", "message"];
const FIELD_LABELS = { name: "Nom", phone: "Tel", email: "Email", service: "Service", message: "Message" };

export default function FormTimeline({ days }) {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [playStep, setPlayStep] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/forms?days=${days}`)
      .then((r) => r.json())
      .then((d) => setTimelines(d.timelines || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">SIMULATION FORMULAIRE</h2>
        <p className="admin-text-muted text-center py-4"><i className="fas fa-spinner fa-spin mr-2"></i></p>
      </div>
    );
  }

  if (!timelines || timelines.length === 0) {
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">SIMULATION FORMULAIRE</h2>
        <p className="admin-text-muted text-sm text-center py-4">Aucune donnee</p>
      </div>
    );
  }

  function playTimeline(idx) {
    const t = timelines[idx];
    if (!t || t.events.length === 0) return;
    setExpanded(idx);
    setPlaying(idx);
    setPlayStep(0);

    let step = 0;
    const events = t.events;
    function next() {
      if (step >= events.length - 1) {
        setPlaying(null);
        return;
      }
      const curr = new Date(events[step].createdAt).getTime();
      const nextTime = new Date(events[step + 1].createdAt).getTime();
      const delay = Math.min(Math.max(nextTime - curr, 300), 3000);
      step++;
      setPlayStep(step);
      setTimeout(next, delay);
    }
    setTimeout(next, 800);
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">SIMULATION FORMULAIRE</h2>
      <div className="space-y-2">
        {timelines.map((t, idx) => {
          const lastEvent = t.events[t.events.length - 1];
          const lastValues = lastEvent?.fieldValues || {};
          const isExpanded = expanded === idx;
          const isPlaying = playing === idx;
          const activeEvents = isPlaying ? t.events.slice(0, playStep + 1) : isExpanded ? t.events : [];

          // Build current form state from active events
          const currentValues = {};
          const focusedField = activeEvents.length > 0 ? activeEvents[activeEvents.length - 1]?.fieldName : null;
          for (const e of activeEvents) {
            if (e.fieldValues) Object.assign(currentValues, e.fieldValues);
          }

          return (
            <div key={idx} className="bg-white/[0.02] rounded-lg border border-white/5">
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpanded(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${t.outcome === "submit" ? "bg-green-500" : t.outcome === "abandon" ? "bg-red-500" : "bg-yellow-500"}`} />
                  <span className="admin-text text-xs font-mono">{t.visitorId?.substring(0, 10)}...</span>
                  <span className="admin-text-muted text-[10px]">{t.formType}</span>
                  <span className="admin-text-muted text-[10px]">
                    {new Date(t.startedAt).toLocaleDateString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${t.outcome === "submit" ? "text-green-400" : t.outcome === "abandon" ? "text-red-400" : "text-yellow-400"}`}>
                    {t.outcome === "submit" ? "SOUMIS" : t.outcome === "abandon" ? "ABANDON" : "EN COURS"}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); playTimeline(idx); }}
                    className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors text-[10px]"
                  >
                    <i className="fas fa-play" />
                  </button>
                </div>
              </div>

              {/* Simulation */}
              {isExpanded && (
                <div className="px-3 pb-4">
                  {/* Mini form simulation */}
                  <div className="bg-white/[0.03] rounded-lg p-4 mb-3 space-y-2">
                    {FIELD_ORDER.map((field) => {
                      const val = currentValues[field] || "";
                      const isFocused = focusedField === field;
                      const isFilled = val.length > 0;
                      return (
                        <div key={field} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all ${isFocused ? "bg-blue-500/10 ring-1 ring-blue-500/30" : "bg-white/[0.02]"}`}>
                          <span className="admin-text-muted w-14 text-[10px]">{FIELD_LABELS[field]}</span>
                          <span className={`flex-1 font-mono ${isFilled ? "admin-text" : "admin-text-muted"}`}>
                            {isFilled ? (field === "service" ? val : val) : "—"}
                          </span>
                          {isFilled && <span className="text-green-500 text-[10px]">&#10003;</span>}
                          {isFocused && isPlaying && <span className="w-[2px] h-3 bg-blue-400 animate-pulse" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Event timeline */}
                  <div className="space-y-1">
                    {t.events.map((e, i) => {
                      const isActive = isPlaying ? i <= playStep : true;
                      const prevTime = i > 0 ? new Date(t.events[i - 1].createdAt).getTime() : null;
                      const currTime = new Date(e.createdAt).getTime();
                      const delay = prevTime ? Math.round((currTime - prevTime) / 1000) : 0;

                      return (
                        <div key={i} className={`flex items-center gap-2 text-[10px] transition-opacity ${isActive ? "opacity-100" : "opacity-20"}`}>
                          <span className="admin-text-muted w-8 text-right">{delay > 0 ? `+${delay}s` : ""}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            e.action === "start" ? "bg-blue-400" :
                            e.action === "focus" ? "bg-yellow-400" :
                            e.action === "submit" ? "bg-green-400" :
                            e.action === "abandon" ? "bg-red-400" : "bg-gray-400"
                          }`} />
                          <span className="admin-text-muted">
                            {e.action === "start" && "Debut"}
                            {e.action === "focus" && `Clic sur ${FIELD_LABELS[e.fieldName] || e.fieldName}`}
                            {e.action === "submit" && "Soumission"}
                            {e.action === "abandon" && `Abandon (${FIELD_LABELS[e.fieldName] || e.fieldName})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
