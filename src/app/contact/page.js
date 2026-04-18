"use client";

import { useState } from "react";
import { formatPhoneInput } from "@/lib/phone";
import useFormTracking from "@/lib/useFormTracking";
import { COMPANY_INFO } from "@/lib/company";

const hours = [
  { day: "Lundi", time: "FERMÉ" },
  { day: "Mardi", time: "10h00 à 17h00" },
  { day: "Mercredi", time: "10h00 à 17h00" },
  { day: "Jeudi", time: "10h00 à 17h00" },
  { day: "Vendredi", time: "10h00 à 17h00" },
  { day: "Samedi", time: "10h00 à 13h00" },
  { day: "Dimanche", time: "FERMÉ" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("contact");

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Veuillez entrer un numéro de téléphone valide (10 chiffres).");
      return;
    }

    setSending(true);
    setError("");

    try {
      // Create chat conversation
      const chatRes = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name.trim(),
          clientPhone: cleanPhone,
          clientEmail: email.trim().toLowerCase(),
        }),
      });

      if (!chatRes.ok) {
        const err = await chatRes.json();
        throw new Error(err.error || "Erreur lors de la création de la conversation");
      }

      const { id } = await chatRes.json();

      // Send the message
      const msgRes = await fetch(`/api/public/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[Formulaire contact]\n\n${message.trim()}`,
        }),
      });

      if (!msgRes.ok) throw new Error("Erreur lors de l'envoi du message");

      trackSubmit();
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
            <h2 className="text-xl font-bold mb-4">Pour nous joindre</h2>
            <ul className="space-y-3 text-[var(--color-muted)]">
              <li>{COMPANY_INFO.address}, Saint-François-Xavier, QC {COMPANY_INFO.postalCode}</li>
              <li>
                Téléphone:{" "}
                <a href={`tel:${COMPANY_INFO.phoneTel}`} className="text-[var(--color-primary)] font-medium hover:underline">
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li>
                Courriel:{" "}
                <a href={`mailto:${COMPANY_INFO.email}`} className="text-[var(--color-primary)] font-medium hover:underline">
                  {COMPANY_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-xl font-bold mb-4">Heures d&apos;ouverture</h2>
            <ul className="space-y-2">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between">
                  <span className="font-medium">{h.day}</span>
                  <span className={h.time === "FERMÉ" ? "text-red-500" : "text-[var(--color-muted)]"}>
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2 className="text-xl font-bold mb-6">Écrivez-nous</h2>

          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Message envoyé!</h3>
              <p className="text-[var(--color-muted)]">
                Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => trackFieldFocus("name")}
                  onBlur={() => trackFieldValue("name", name)}
                  required
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Courriel</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => trackFieldFocus("email")}
                  onBlur={() => trackFieldValue("email", email)}
                  required
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  onFocus={() => trackFieldFocus("phone")}
                  onBlur={() => trackFieldValue("phone", phone)}
                  required
                  placeholder="514-555-1234"
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => trackFieldFocus("message")}
                  onBlur={() => trackFieldValue("message", message)}
                  rows={5}
                  required
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-light)] transition disabled:opacity-50"
              >
                {sending ? "Envoi en cours..." : "Envoyer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
