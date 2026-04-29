"use client";

import { useEffect, useMemo, useState } from "react";

const desktopTemplate = [
  { key: "name", label: "Nom", value: "Copro Saint-François" },
  { key: "city", label: "Ville", value: "Delson" },
  { key: "postal", label: "Code postal", value: "J5B 1Y1" },
  { key: "address", label: "Adresse", value: "330 Chem. Saint-François-Xavier, local 104" },
];

const mobileTemplate = [
  { key: "unit", label: "Unité", value: "B-412" },
  { key: "priority", label: "Priorité", value: "Normale" },
  { key: "note", label: "Description", value: "Thermos embué, poignée difficile à fermer." },
];

function emptyValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

export default function PortalDemoVisual() {
  const desktopFields = useMemo(() => desktopTemplate, []);
  const mobileFields = useMemo(() => mobileTemplate, []);
  const [desktopValues, setDesktopValues] = useState(() => emptyValues(desktopFields));
  const [mobileValues, setMobileValues] = useState(() => emptyValues(mobileFields));
  const [activeField, setActiveField] = useState(null);
  const [desktopClicking, setDesktopClicking] = useState(false);
  const [mobileClicking, setMobileClicking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    const wait = (ms) =>
      new Promise((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const typeField = async (group, field) => {
      setActiveField(`${group}:${field.key}`);
      const setter = group === "desktop" ? setDesktopValues : setMobileValues;

      for (let i = 1; i <= field.value.length; i += 1) {
        if (cancelled) return;
        setter((current) => ({ ...current, [field.key]: field.value.slice(0, i) }));
        await wait(18);
      }

      await wait(120);
      if (!cancelled) setActiveField(null);
    };

    const run = async () => {
      while (!cancelled) {
        setDesktopValues(emptyValues(desktopFields));
        setMobileValues(emptyValues(mobileFields));
        setDesktopClicking(false);
        setMobileClicking(false);
        await wait(260);

        for (const field of desktopFields) {
          await typeField("desktop", field);
          await wait(80);
        }
        setDesktopClicking(true);
        await wait(720);
        setDesktopClicking(false);
        await wait(340);

        for (const field of mobileFields) {
          await typeField("mobile", field);
          await wait(80);
        }
        setMobileClicking(true);
        await wait(720);
        setMobileClicking(false);
        await wait(1700);
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [desktopFields, mobileFields]);

  return (
    <div className="pg-demo-visual" aria-label="Démonstration interactive desktop et mobile du portail">
      <div className="pg-demo-device pg-demo-desktop">
        <div className="pg-demo-chrome">
          <span></span>
          <span></span>
          <span></span>
          <b>Desktop</b>
        </div>
        <div className="pg-demo-panel">
          <div className="pg-demo-panel-head">
            <div>
              <span>Étape 1</span>
              <h3>Ajouter une copropriété</h3>
            </div>
            <em>Client gestionnaire</em>
          </div>
          <div className="pg-demo-form">
            {desktopFields.map((field) => (
              <label className={field.key === "address" ? "wide" : ""} key={field.key}>
                <span>{field.label}</span>
                <b className={activeField === `desktop:${field.key}` ? "typing" : ""}>
                  {desktopValues[field.key]}
                </b>
              </label>
            ))}
          </div>
          <div className="pg-demo-actions">
            <button type="button" className="ghost">
              Annuler
            </button>
            <button type="button" className={desktopClicking ? "primary is-clicking" : "primary"}>
              Créer la copropriété
            </button>
          </div>
        </div>
      </div>

      <div className="pg-demo-device pg-demo-mobile">
        <div className="pg-demo-phone">
          <div className="pg-demo-phone-top">
            <span>9 h 41</span>
            <i></i>
          </div>
          <div className="pg-demo-phone-card">
            <div className="pg-demo-mobile-app-head">
              <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" />
              <div>
                <b>Nouvelle demande</b>
                <span>Copro Saint-François</span>
              </div>
            </div>

            <div className="pg-demo-mobile-status">
              <span>Fiche ouverte</span>
              <b>Unité B-412</b>
              <small>Bâtiment B · 5 ouvertures</small>
            </div>

            <div className="pg-demo-mobile-form">
              {mobileFields.map((field) => (
                <label key={field.key}>
                  <small>{field.label}</small>
                  <b className={activeField === `mobile:${field.key}` ? "typing" : ""}>
                    {mobileValues[field.key]}
                  </b>
                </label>
              ))}
              <button type="button" className={mobileClicking ? "is-clicking" : ""}>
                Envoyer la demande
              </button>
            </div>

            <div className="pg-demo-mobile-list">
              <span>Suivi visible</span>
              <div>
                <b>Fenêtre salon</b>
                <small>Thermos embué · photos rattachées</small>
              </div>
              <div>
                <b>Porte-patio</b>
                <small>Poignée difficile à fermer</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
