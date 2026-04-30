"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const FIELD_LABELS = { name: "Nom complet", phone: "514-555-5555", email: "Email", service: "Selectionnez un service", message: "Decrivez votre besoin..." };
const SERVICE_LABELS = {
  quincaillerie: "Quincaillerie", "vitre-thermos": "Vitre thermos", "portes-bois": "Portes en bois",
  moustiquaire: "Moustiquaires", calfeutrage: "Calfeutrage", "coupe-froid": "Coupe-froid",
  desembuage: "Desembuage", "insertion-porte": "Insertion de porte", "opti-fenetre": "Programme OPTI-FENETRE", autre: "Autre",
};

export default function FormTimeline({ query }) {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReplay, setActiveReplay] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [formState, setFormState] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [hoveredOption, setHoveredOption] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/analytics/forms?${query || "days=7"}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setReplays(d.replays || []);
      })
      .catch(() => {
        if (!cancelled) setReplays([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

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
    setCurrentStep(0);

    setTimeout(() => playFromStep(replay, 0), 300);
  }

  function playFromStep(replay, startStep) {
    const interactions = replay.interactions;
    if (!interactions || interactions.length === 0) return;

    setPlaying(true);
    setCurrentStep(startStep);

    function executeStep(i) {
      if (i >= interactions.length) {
        setPlaying(false);
        setProgress(100);
        setCurrentStep(interactions.length);
        return;
      }

      const ev = interactions[i];
      setCurrentStep(i);
      setProgress(Math.round((i / interactions.length) * 100));

      if (ev.a === "f") {
        setFocusedField(ev.field);
        setHoveredOption(null);
      } else if (ev.a === "h") {
        setFocusedField(ev.field);
        setHoveredOption(ev.val);
      } else if (ev.a === "v") {
        setFocusedField(ev.field);
        setHoveredOption(null);
        setFormState((prev) => ({ ...prev, [ev.field]: ev.val }));
      }

      if (i + 1 < interactions.length) {
        const delay = Math.max((interactions[i + 1].t - ev.t) / speed, 50);
        timerRef.current = setTimeout(() => executeStep(i + 1), Math.min(delay, 2000));
      } else {
        setTimeout(() => {
          setPlaying(false);
          setProgress(100);
          setCurrentStep(interactions.length);
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
              <div className="flex items-center gap-1">
                {currentStep > 0 && (
                  <button onClick={() => playFromStep(activeReplay, currentStep)}
                    className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 text-xs" title="Reprendre">
                    <i className="fas fa-play" />
                  </button>
                )}
                <button onClick={() => { setFormState({}); setFocusedField(null); setHoveredOption(null); setCurrentStep(0); playFromStep(activeReplay, 0); }}
                  className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 text-xs" title="Rejouer">
                  <i className="fas fa-redo" />
                </button>
              </div>
            ) : (
              <button onClick={stopPlayback}
                className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 text-xs">
                <i className="fas fa-pause" />
              </button>
            )}
          </div>

          {/* Progress bar - clickable */}
          <div className="w-full bg-white/5 rounded-full h-2 mb-4 cursor-pointer relative"
            onClick={(e) => {
              if (!activeReplay?.interactions?.length) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const targetStep = Math.floor(pct * activeReplay.interactions.length);
              stopPlayback();
              // Apply all state up to targetStep
              const newState = {};
              let newFocus = null;
              for (let i = 0; i <= targetStep && i < activeReplay.interactions.length; i++) {
                const ev = activeReplay.interactions[i];
                if (ev.a === "f" || ev.a === "h") newFocus = ev.field;
                if (ev.a === "v") { newFocus = ev.field; newState[ev.field] = ev.val; }
              }
              setFormState(newState);
              setFocusedField(newFocus);
              setProgress(Math.round((targetStep / activeReplay.interactions.length) * 100));
              setCurrentStep(targetStep);
              setHoveredOption(null);
            }}>
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                {focusedField === "service" && !formState.service && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 py-1 animate-[fadeIn_0.2s_ease-out]">
                    {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                      <div key={val} className={`px-4 py-1.5 text-sm transition-colors ${hoveredOption === val ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}>
                        {hoveredOption === val && <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mr-2 align-middle" />}
                        {label}
                      </div>
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
