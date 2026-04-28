"use client";

import { useState } from "react";
import { formatPhoneInput } from "@/lib/phone";
import useFormTracking from "@/lib/useFormTracking";
import { useCompany } from "@/lib/useCompany";
import "../../contact/contact.css";

const hours = [
  { day: "Monday", time: "CLOSED", closed: true },
  { day: "Tuesday", time: "10am - 5pm" },
  { day: "Wednesday", time: "10am - 5pm" },
  { day: "Thursday", time: "10am - 5pm" },
  { day: "Friday", time: "10am - 5pm" },
  { day: "Saturday", time: "10am - 1pm" },
  { day: "Sunday", time: "CLOSED", closed: true },
];

export default function ContactEnPage() {
  const company = useCompany();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { trackFieldFocus, trackFieldValue, trackSubmit } = useFormTracking("contact_en");

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSending(true);
    setError("");

    try {
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
        throw new Error(err.error || "Could not create the conversation");
      }

      const { id } = await chatRes.json();
      const msgRes = await fetch(`/api/public/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[English contact form]\n\n${message.trim()}`,
        }),
      });

      if (!msgRes.ok) throw new Error("Could not send the message");

      trackSubmit();
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-container contact-hero-grid">
          <div className="contact-hero-copy">
            <span className="contact-eyebrow">Contact - Free quote</span>
            <h1 className="contact-h1">Tell us about your project</h1>
            <p className="contact-lede">
              Free quote within 24 hours. RBQ-certified technicians for door, window,
              patio door and sealed glass repairs across Greater Montreal and the South Shore.
            </p>

            <div className="contact-hero-ctas">
              <a href={`tel:${company.phoneTel}`} className="contact-btn contact-btn-primary">
                <i className="fas fa-phone"></i> {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="contact-btn contact-btn-outline">
                <i className="fas fa-envelope"></i> {company.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-container contact-grid">
          <div className="contact-left">
            <div className="contact-card">
              <h2 className="contact-card-title">Contact details</h2>
              <ul className="contact-list">
                <li>
                  <i className="fas fa-phone contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Phone</span>
                    <a href={`tel:${company.phoneTel}`} className="contact-list-value">
                      {company.phone}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-envelope contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Email</span>
                    <a href={`mailto:${company.email}`} className="contact-list-value">
                      {company.email}
                    </a>
                  </div>
                </li>
                <li>
                  <i className="fas fa-location-dot contact-icon"></i>
                  <div>
                    <span className="contact-list-label">Address</span>
                    <span className="contact-list-value">
                      {company.address}
                      <br />
                      {company.city}, {company.province} {company.postalCode}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="contact-card">
              <h2 className="contact-card-title">Business hours</h2>
              <ul className="contact-hours">
                {hours.map((h) => (
                  <li key={h.day}>
                    <span className="contact-hours-day">{h.day}</span>
                    <span className={h.closed ? "contact-hours-closed" : "contact-hours-time"}>
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-card contact-form-card">
              <span className="contact-form-kicker">Contact</span>
              <h2 className="contact-card-title">Write to us</h2>
              <p className="contact-card-sub">We usually respond within one business day.</p>

              {sent ? (
                <div className="contact-sent">
                  <div className="contact-sent-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <h3>Message sent</h3>
                  <p>
                    Thank you {name.split(" ")[0] || ""}. We will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-row">
                    <div className="contact-field">
                      <label htmlFor="name">Full name</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => trackFieldFocus("name")}
                        onBlur={() => trackFieldValue("name", name)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                        onFocus={() => trackFieldFocus("phone")}
                        onBlur={() => trackFieldValue("phone", phone)}
                        required
                        placeholder="514-555-1234"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => trackFieldFocus("email")}
                      onBlur={() => trackFieldValue("email", email)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => trackFieldFocus("message")}
                      onBlur={() => trackFieldValue("message", message)}
                      rows={5}
                      required
                      placeholder="Describe your project in a few words..."
                    />
                  </div>

                  {error && <p className="contact-error">{error}</p>}

                  <button type="submit" disabled={sending} className="contact-btn contact-btn-primary contact-btn-full">
                    {sending ? "Sending..." : "Send message"}
                  </button>

                  <p className="contact-disclaimer">
                    By submitting this form, you agree to be contacted by Vosthermos about your request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
