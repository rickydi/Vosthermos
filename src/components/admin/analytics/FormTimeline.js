"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const FIELD_LABELS = { name: "Nom complet", phone: "514-555-5555", email: "Email", service: "Selectionnez un service", message: "Decrivez votre besoin..." };
const SERVICE_LABELS = {
  quincaillerie: "Quincaillerie", "vitre-thermos": "Vitre thermos", "portes-bois": "Portes en bois",
  moustiquaire: "Moustiquaires", calfeutrage: "Calfeutrage", "coupe-froid": "Coupe-froid",
  desembuage: "Desembuage", "insertion-porte": "Insertion de porte", "opti-fenetre": "Programme OPTI-FENETRE", autre: "Autre",
};

export default function FormTimeline({ days: initialDays }) {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReplay, setActiveReplay] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [formState, setFormState] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [replayDays, setReplayDays] = useState(7);
  const [customDate, setCustomDate] = useState("");
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/forms?days=${replayDays}`)
      .then((r) => r.json())
      .then((d) => setReplays(d.replays || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [replayDays]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
  }, []);

  function startReplay(replay) {
    stopPlayback();
    setActiveReplay(replay);
    setFormState({});
    setFocusedField(null);
    setProgress(0);
    stepRef.current = 0;

    setTimeout(() => playFromStep(replay, 0), 300);
  }

  function playFromStep(replay, startStep) {
    const interactions = replay.interactions;
    if (!interactions || interactions.length === 0) return;

    setPlaying(true);
    stepRef.current = startStep;

    function executeStep(i) {
      if (i >= interactions.length) {
        setPlaying(false);
        setProgress(100);
        return;
      }

      const ev = interactions[i];
      stepRef.current = i;
      setProgress(Math.round((i / interactions.length) * 100));

      if (ev.a === "f") {
        setFocusedField(ev.field);
      } else if (ev.a === "v") {
        setFocusedField(ev.field);
        setFormState((prev) => ({ ...prev, [ev.field]: ev.val }));
      }

      if (i + 1 < interactions.length) {
        const delay = Math.max((interactions[i + 1].t - ev.t) / speed, 50);
        timerRef.current = setTimeout(() => executeStep(i + 1), Math.min(delay, 2000));
      } else {
        setTimeout(() => {
          setPlaying(false);
          setProgress(100);
        }, 500);
      }
    }

    executeStep(startStep);
  }

  if (loading) {
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">REPLAY FORMULAIRE</h2>
        <p className="admin-text-muted text-center py-4"><i className="fas fa-spinner fa-spin mr-2"></i></p>
      </div>
    );
  }

  if (replays.length === 0) {
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">REPLAY FORMULAIRE</h2>
        <p className="admin-text-muted text-sm text-center py-4">Aucune donnee (les replays commencent a partir de maintenant)</p>
      </div>
    );
  }

  const inputBase = "w-full bg-white border rounded-lg px-4 py-2.5 text-sm transition-all";
  const inputNormal = `${inputBase} border-gray-200 text-gray-900`;
  const inputFocused = `${inputBase} border-red-500 ring-2 ring-red-500/20 text-gray-900`;

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">REPLAY FORMULAIRE</h2>
        {!activeReplay && (
          <div className="flex items-center gap-1">
            {[{ k: 0, l: "Auj" }, { k: 7, l: "7j" }, { k: 30, l: "30j" }, { k: 90, l: "90j" }].map((d) => (
              <button key={d.k} onClick={() => setReplayDays(d.k)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${replayDays === d.k ? "bg-[var(--color-red)] text-white" : "admin-text-muted hover:bg-white/5"}`}>
                {d.l}
              </button>
            ))}
            <input type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); if (e.target.value) setReplayDays(1); }}
              className="admin-input rounded text-[10px] px-1 py-0.5 w-28" />
          </div>
        )}
      </div>

      {/* Replay list */}
      {!activeReplay && (
        <div className="space-y-2">
          {replays.map((r) => (
            <div
              key={r.id}
              onClick={() => startReplay(r)}
              className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${r.outcome === "submit" ? "bg-green-500" : "bg-red-500"}`} />
                <span className="admin-text text-xs font-mono">{r.visitorId?.substring(0, 10)}...</span>
                <span className="admin-text-muted text-[10px]">{r.formType}</span>
                <span className="admin-text-muted text-[10px]">{r.interactions?.length || 0} actions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold ${r.outcome === "submit" ? "text-green-400" : "text-red-400"}`}>
                  {r.outcome === "submit" ? "SOUMIS" : "ABANDON"}
                </span>
                <span className="admin-text-muted text-[10px]">
                  {new Date(r.createdAt).toLocaleDateString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <i className="fas fa-play text-blue-400 text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active replay */}
      {activeReplay && (
        <div>
          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => { stopPlayback(); setActiveReplay(null); }} className="text-xs admin-text-muted hover:admin-text transition-colors">
              <i className="fas fa-arrow-left mr-1" /> Retour
            </button>
            <div className="flex-1" />
            <span className={`text-[10px] font-bold ${activeReplay.outcome === "submit" ? "text-green-400" : "text-red-400"}`}>
              {activeReplay.outcome === "submit" ? "SOUMIS" : `ABANDON a ${FIELD_LABELS[activeReplay.fieldName] || activeReplay.fieldName}`}
            </span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2, 4].map((s) => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${speed === s ? "bg-blue-500 text-white" : "admin-text-muted hover:bg-white/5"}`}>
                  {s}x
                </button>
              ))}
            </div>
            {!playing ? (
              <button onClick={() => { setFormState({}); setFocusedField(null); playFromStep(activeReplay, 0); }}
                className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 text-xs">
                <i className="fas fa-play" />
              </button>
            ) : (
              <button onClick={stopPlayback}
                className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 text-xs">
                <i className="fas fa-pause" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-1 mb-4">
            <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Simulated form */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-white/10 max-w-md mx-auto">
            <h3 className="text-white font-bold text-base mb-3">Soumission gratuite</h3>
            <div className="space-y-2.5">
              {/* Nom */}
              <div className="relative">
                <div className={focusedField === "name" ? inputFocused : inputNormal}>
                  {formState.name || <span className="text-gray-400">{FIELD_LABELS.name}</span>}
                  {focusedField === "name" && playing && <span className="inline-block w-[2px] h-4 bg-black ml-0.5 animate-pulse align-middle" />}
                </div>
                {formState.name?.length >= 2 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">&#10003;</span>}
              </div>

              {/* Tel */}
              <div className="relative">
                <div className={focusedField === "phone" ? inputFocused : inputNormal}>
                  {formState.phone || <span className="text-gray-400">{FIELD_LABELS.phone}</span>}
                  {focusedField === "phone" && playing && <span className="inline-block w-[2px] h-4 bg-black ml-0.5 animate-pulse align-middle" />}
                </div>
                {formState.phone?.replace(/\D/g, "").length >= 10 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">&#10003;</span>}
              </div>

              {/* Email */}
              <div className="relative">
                <div className={focusedField === "email" ? inputFocused : inputNormal}>
                  {formState.email || <span className="text-gray-400">{FIELD_LABELS.email}</span>}
                  {focusedField === "email" && playing && <span className="inline-block w-[2px] h-4 bg-black ml-0.5 animate-pulse align-middle" />}
                </div>
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email || "") && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">&#10003;</span>}
              </div>

              {/* Service */}
              <div className="relative">
                <div className={focusedField === "service" ? inputFocused : inputNormal}>
                  {formState.service ? (
                    <span className="text-gray-900">{SERVICE_LABELS[formState.service] || formState.service}</span>
                  ) : (
                    <span className="text-gray-400">{FIELD_LABELS.service}</span>
                  )}
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs transition-transform ${focusedField === "service" && !formState.service ? "rotate-180" : ""}`}><i className="fas fa-chevron-down" /></span>
                </div>
                {formState.service && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500 text-sm">&#10003;</span>}
                {/* Dropdown simulation */}
                {focusedField === "service" && !formState.service && playing && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 py-1 animate-[fadeIn_0.2s_ease-out]">
                    {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                      <div key={val} className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">{label}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                <div className={`${focusedField === "message" ? inputFocused : inputNormal} min-h-[72px]`}>
                  {formState.message || <span className="text-gray-400">{FIELD_LABELS.message}</span>}
                  {focusedField === "message" && playing && <span className="inline-block w-[2px] h-4 bg-black ml-0.5 animate-pulse align-middle" />}
                </div>
                {formState.message?.length >= 3 && <span className="absolute right-3 top-4 text-green-500 text-sm">&#10003;</span>}
              </div>

              {/* Submit button */}
              <div className={`w-full py-2.5 rounded-full font-bold text-sm text-center text-white ${activeReplay.outcome === "submit" ? "bg-green-500" : "bg-[#c41e3a]"}`}>
                {activeReplay.outcome === "submit" ? "Envoye!" : "Envoyer la demande"}
              </div>
            </div>
          </div>

          {/* Outcome indicator */}
          {!playing && progress === 100 && (
            <div className={`text-center mt-4 text-sm font-bold ${activeReplay.outcome === "submit" ? "text-green-400" : "text-red-400"}`}>
              {activeReplay.outcome === "submit" ? "Formulaire soumis avec succes" : `Le visiteur a abandonne le formulaire`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
