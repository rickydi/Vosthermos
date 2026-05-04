"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADMIN_MENU_ITEMS,
  ADMIN_MENU_SECTIONS,
  ADMIN_MENU_SETTINGS_KEY,
  menuItemWithLabel,
  normalizeAdminMenuLayout,
} from "@/lib/admin-menu";

export default function MenuAdminClient() {
  const [layout, setLayout] = useState(() => normalizeAdminMenuLayout(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const dragCounters = useRef({});

  useEffect(() => {
    fetch(`/api/admin/settings?key=${ADMIN_MENU_SETTINGS_KEY}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const next = data?.value ? normalizeAdminMenuLayout(JSON.parse(data.value)) : normalizeAdminMenuLayout(null);
        setLayout(next);
        try {
          localStorage.setItem(ADMIN_MENU_SETTINGS_KEY, JSON.stringify(next));
        } catch {}
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem(ADMIN_MENU_SETTINGS_KEY);
          if (cached) setLayout(normalizeAdminMenuLayout(JSON.parse(cached)));
        } catch {}
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveLayout() {
    setSaving(true);
    try {
      const normalized = normalizeAdminMenuLayout(layout);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: ADMIN_MENU_SETTINGS_KEY,
          value: JSON.stringify(normalized),
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      setLayout(normalized);
      localStorage.setItem(ADMIN_MENU_SETTINGS_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent("admin-menu-updated", { detail: normalized }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch {
      alert("Erreur pendant la sauvegarde du menu.");
    } finally {
      setSaving(false);
    }
  }

  function resetLayout() {
    setLayout(normalizeAdminMenuLayout(null));
  }

  function updateSectionLabel(sectionKey, value) {
    setLayout((current) => ({
      ...current,
      labels: { ...current.labels, [sectionKey]: value },
    }));
  }

  function updateItemLabel(itemKey, value) {
    setLayout((current) => ({
      ...current,
      itemLabels: { ...current.itemLabels, [itemKey]: value },
    }));
  }

  function onDragStart(event, itemKey, sectionKey) {
    setDragItem({ key: itemKey, fromSection: sectionKey });
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemKey);
  }

  function onDragEnd() {
    setDragItem(null);
    setDropIndicator(null);
    dragCounters.current = {};
  }

  function onItemDragOver(event, sectionKey, itemKey) {
    event.preventDefault();
    event.stopPropagation();
    if (!dragItem || dragItem.key === itemKey) return;
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDropIndicator({ section: sectionKey, key: itemKey, position });
  }

  function onSectionDragOver(event) {
    event.preventDefault();
    if (dragItem) event.dataTransfer.dropEffect = "move";
  }

  function onSectionDragEnter(sectionKey) {
    dragCounters.current[sectionKey] = (dragCounters.current[sectionKey] || 0) + 1;
    if (!dropIndicator || dropIndicator.section !== sectionKey) {
      setDropIndicator({ section: sectionKey, atEnd: true });
    }
  }

  function onSectionDragLeave(sectionKey) {
    dragCounters.current[sectionKey] = (dragCounters.current[sectionKey] || 0) - 1;
    if (dragCounters.current[sectionKey] <= 0) {
      dragCounters.current[sectionKey] = 0;
      if (dropIndicator?.section === sectionKey) setDropIndicator(null);
    }
  }

  function onDrop(event, sectionKey) {
    event.preventDefault();
    if (!dragItem) return;
    const { key, fromSection } = dragItem;

    setLayout((current) => {
      const fromItems = (current[fromSection] || []).filter((itemKey) => itemKey !== key);
      const toItems = fromSection === sectionKey ? fromItems : [...(current[sectionKey] || [])];
      let insertIndex = toItems.length;
      if (dropIndicator?.key && dropIndicator.section === sectionKey) {
        const targetIndex = toItems.indexOf(dropIndicator.key);
        if (targetIndex >= 0) {
          insertIndex = dropIndicator.position === "before" ? targetIndex : targetIndex + 1;
        }
      }
      toItems.splice(insertIndex, 0, key);
      return { ...current, [fromSection]: fromItems, [sectionKey]: toItems };
    });

    onDragEnd();
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="admin-card border rounded-xl p-8 text-center admin-text-muted">
          <i className="fas fa-spinner fa-spin text-2xl"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Menu admin</h1>
          <p className="admin-text-muted text-sm mt-1">
            Glisse les onglets entre les sections. Clique un nom pour le renommer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-2 rounded-lg border admin-border admin-card px-4 py-2 text-sm font-bold admin-text-muted hover:admin-text"
          >
            <i className="fas fa-undo"></i>
            Reinitialiser
          </button>
          <button
            type="button"
            onClick={saveLayout}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200">
              <i className="fas fa-check"></i>
              Sauvegarde
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {ADMIN_MENU_SECTIONS.map((section) => {
          const sectionLabel = layout.labels?.[section.key] || section.label;
          const sectionItems = layout[section.key] || [];
          const isDragTarget = dragItem && dropIndicator?.section === section.key;

          return (
            <section
              key={section.key}
              className={`admin-card rounded-xl border-2 overflow-hidden transition-all ${
                isDragTarget ? "border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]" : "admin-border"
              }`}
              onDragOver={onSectionDragOver}
              onDragEnter={() => onSectionDragEnter(section.key)}
              onDragLeave={() => onSectionDragLeave(section.key)}
              onDrop={(event) => onDrop(event, section.key)}
            >
              <div className="border-b admin-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${section.dotClass}`}></span>
                  <i className={`fas ${section.icon} ${section.accentClass}`}></i>
                  {editingSection === section.key ? (
                    <input
                      value={sectionLabel}
                      onChange={(event) => updateSectionLabel(section.key, event.target.value)}
                      onBlur={() => setEditingSection(null)}
                      onKeyDown={(event) => { if (event.key === "Enter") setEditingSection(null); }}
                      autoFocus
                      className="admin-input min-w-0 flex-1 rounded border px-2 py-1 text-sm font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingSection(section.key)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate admin-text text-sm font-extrabold">{sectionLabel}</span>
                      <span className="block truncate admin-text-muted text-[10px]">{section.summary}</span>
                    </button>
                  )}
                  <span className="admin-text-muted text-xs font-bold">{sectionItems.length}</span>
                </div>
              </div>

              <div className="min-h-[190px] p-2">
                {sectionItems.map((itemKey) => {
                  const item = menuItemWithLabel(itemKey, layout);
                  if (!item || !ADMIN_MENU_ITEMS[itemKey]) return null;
                  const isDragging = dragItem?.key === itemKey;
                  const showBefore = dropIndicator?.section === section.key && dropIndicator?.key === itemKey && dropIndicator?.position === "before";
                  const showAfter = dropIndicator?.section === section.key && dropIndicator?.key === itemKey && dropIndicator?.position === "after";

                  return (
                    <div key={itemKey}>
                      {showBefore && <div className="mx-2 my-1 h-0.5 rounded-full bg-cyan-400"></div>}
                      <div
                        draggable
                        onDragStart={(event) => onDragStart(event, itemKey, section.key)}
                        onDragEnd={onDragEnd}
                        onDragOver={(event) => onItemDragOver(event, section.key, itemKey)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                          isDragging ? "opacity-35" : "admin-bg hover:bg-white/5 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        <i className="fas fa-grip-vertical admin-text-muted text-xs"></i>
                        <i className={`fas ${item.icon} admin-text-muted w-4 text-center`}></i>
                        {editingItem === itemKey ? (
                          <input
                            value={item.label}
                            onChange={(event) => updateItemLabel(itemKey, event.target.value)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(event) => { if (event.key === "Enter") setEditingItem(null); }}
                            onClick={(event) => event.stopPropagation()}
                            draggable={false}
                            autoFocus
                            className="admin-input min-w-0 flex-1 rounded border px-2 py-1 text-sm"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingItem(itemKey)}
                            className="min-w-0 flex-1 text-left admin-text text-sm hover:text-cyan-300"
                          >
                            <span className="block truncate">{item.label}</span>
                          </button>
                        )}
                      </div>
                      {showAfter && <div className="mx-2 my-1 h-0.5 rounded-full bg-cyan-400"></div>}
                    </div>
                  );
                })}

                {sectionItems.length === 0 && (
                  <div className={`rounded-lg border-2 border-dashed py-8 text-center text-xs ${
                    isDragTarget ? "border-cyan-300 text-cyan-200" : "admin-border admin-text-muted"
                  }`}>
                    {dragItem ? "Deposer ici" : "Aucun onglet"}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
