"use client";

import { useState } from "react";
import { moneyInputValue, parseMoney } from "@/lib/money";

// Champ de montant (ou de quantite). Remplace les <input type="number"> dont la
// valeur etait recalculee a chaque frappe par `parseFloat(e.target.value) || 0` :
//   * effacer le champ redonnait 0, que React reecrivait aussitot — il fallait
//     double-cliquer pour selectionner ce 0 et l'ecraser ;
//   * type="number" rejette la virgule (value devient ""), donc « 20,00 »
//     s'inscrivait comme 0.
//
// Ici la frappe est conservee telle quelle tant que le champ a le focus, et
// seule la valeur numerique remonte au parent. Le contenu se selectionne a
// l'arrivee dans le champ : un simple clic suffit pour tout remplacer.
export default function MoneyInput({
  value,
  onChange,
  onBlur,
  onFocus,
  // Reprend l'intention des anciens min/max du type="number", mais en bornant la
  // valeur remontee : l'attribut HTML, lui, ne bloquait jamais la frappe.
  min,
  max,
  selectOnFocus = true,
  className = "",
  ...rest
}) {
  // null tant qu'on n'edite pas : le champ suit alors la valeur du parent.
  const [draft, setDraft] = useState(null);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft !== null ? draft : moneyInputValue(value)}
      onFocus={(event) => {
        setDraft(moneyInputValue(value));
        if (selectOnFocus) event.currentTarget.select();
        onFocus?.(event);
      }}
      onChange={(event) => {
        const typed = event.target.value;
        setDraft(typed);
        let amount = parseMoney(typed);
        if (min !== undefined) amount = Math.max(min, amount);
        if (max !== undefined) amount = Math.min(max, amount);
        // Le parent ne recoit qu'un nombre : les totaux se recalculent en
        // direct sans jamais reecrire ce que la personne est en train de taper.
        onChange?.(amount);
      }}
      onBlur={(event) => {
        setDraft(null); // on repasse a l'affichage normalise
        onBlur?.(event);
      }}
      className={className}
      {...rest}
    />
  );
}
