"use client";

import { useState, useEffect, useCallback } from "react";

const SERVICES = [
  {
    id: "quincaillerie",
    icon: "fa-cogs",
    title: "Remplacement de quincaillerie",
    desc: "Poignees, roulettes, mecanismes et coupe-froid pour vos portes et fenetres.",
  },
  {
    id: "thermos",
    icon: "fa-snowflake",
    title: "Remplacement de vitre thermos",
    desc: "Vitres embuees ou brisees? Remplacement professionnel avec service garanti.",
  },
  {
    id: "portes-bois",
    icon: "fa-door-open",
    title: "Reparation de portes en bois",
    desc: "Restauration et reparation de portes et fenetres en bois, estimation gratuite.",
  },
  {
    id: "moustiquaires",
    icon: "fa-border-all",
    title: "Moustiquaires sur mesure",
    desc: "Fabrication sur mesure et reparation de tous types de moustiquaires.",
  },
];

const TIME_SLOTS = ["9h", "10h", "11h", "13h", "14h", "15h", "16h"];

const CITIES = [
  "Montreal",
  "Laval",
  "Longueuil",
  "Brossard",
  "Boucherville",
  "Saint-Hyacinthe",
  "Granby",
  "Saint-Jean-sur-Richelieu",
  "Chambly",
  "Terrebonne",
  "Repentigny",
  "Blainville",
  "Chateauguay",
  "La Prairie",
  "Sainte-Julie",
  "Varennes",
  "Delson",
  "Candiac",
  "Saint-Bruno",
  "Mascouche",
];

const MONTHS_FR = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateFR(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`;
}

export default function BookingCalendar() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("next");

  // Step 1
  const [selectedService, setSelectedService] = useState(null);

  // Step 2
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  // Step 4
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch booked slots when date changes
  const fetchSlots = useCallback(async (dateStr) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments?date=${dateStr}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
    } catch {
      setBookedSlots([]);
    }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
      setSelectedTime(null);
    }
  }, [selectedDate, fetchSlots]);

  function goNext() {
    setDirection("next");
    setStep((s) => s + 1);
  }

  function goPrev() {
    setDirection("prev");
    setStep((s) => s - 1);
  }

  function canGoNext() {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return form.name.trim() && form.phone.trim();
    return false;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          serviceType: selectedService,
          date: selectedDate,
          timeSlot: selectedTime,
          address: form.address || undefined,
          city: form.city || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la reservation");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  // Calendar generation
  function getCalendarDays() {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // getDay: 0=Sun, we want Mon=0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    // Padding days from previous month
    for (let i = 0; i < startDow; i++) {
      days.push({ day: null, disabled: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dow = date.getDay(); // 0=Sun, 6=Sat
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isWeekend = dow === 0 || dow === 6;
      // Check if within 30 days
      const diffMs = date - new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const isTooFar = diffDays > 30;

      days.push({
        day: d,
        dateStr: formatDate(date),
        disabled: isPast || isWeekend || isTooFar,
        isWeekend,
        isPast,
        isTooFar,
        isToday:
          d === today.getDate() &&
          viewMonth === today.getMonth() &&
          viewYear === today.getFullYear(),
      });
    }

    return days;
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // Can we go to prev month? Only if it has any selectable days
  const canGoPrevMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const canGoNextMonth = viewYear < maxDate.getFullYear() || (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const serviceName = SERVICES.find((s) => s.id === selectedService)?.title || "";

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h2 className="text-2xl font-extrabold mb-3">Votre rendez-vous est confirme!</h2>
        <p className="text-[var(--color-muted)] mb-8 leading-relaxed">
          Nous vous contacterons sous peu pour confirmer les details de votre rendez-vous.
          <br />
          Merci de faire confiance a Vosthermos!
        </p>
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] text-left inline-block min-w-[320px]">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Service</span>
              <span className="font-semibold">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Date</span>
              <span className="font-semibold">{formatDateFR(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Heure</span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Nom</span>
              <span className="font-semibold">{form.name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? "bg-[var(--color-red)] text-white shadow-lg"
                  : s < step
                  ? "bg-[var(--color-teal)] text-white"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              {s < step ? <i className="fas fa-check text-xs"></i> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 sm:w-20 h-0.5 transition-colors ${
                  s < step ? "bg-[var(--color-teal)]" : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <p className="text-sm text-[var(--color-muted)]">
          {step === 1 && "Choisissez votre service"}
          {step === 2 && "Choisissez une date et une heure"}
          {step === 3 && "Vos coordonnees"}
          {step === 4 && "Confirmation de votre rendez-vous"}
        </p>
      </div>

      {/* Steps content */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          animation: `${direction === "next" ? "slideInRight" : "slideInLeft"} 0.3s ease-out`,
        }}
        key={step}
      >
        {/* Step 1: Service selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`text-left rounded-xl p-6 border-2 transition-all ${
                  selectedService === service.id
                    ? "border-[var(--color-red)] bg-white shadow-lg"
                    : "border-[var(--color-border)] bg-white hover:border-[var(--color-teal)]/30 hover:shadow-md"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    selectedService === service.id
                      ? "bg-[var(--color-red)] text-white"
                      : "bg-[var(--color-teal)]/10 text-[var(--color-teal)]"
                  }`}
                >
                  <i className={`fas ${service.icon} text-lg`}></i>
                </div>
                <h3 className="font-bold mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{service.desc}</p>
                {selectedService === service.id && (
                  <div className="mt-3 flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold">
                    <i className="fas fa-check-circle"></i> Selectionne
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-teal-dark)]">
              <button
                onClick={prevMonth}
                disabled={!canGoPrevMonth}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  canGoPrevMonth
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-white/20 cursor-not-allowed"
                }`}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <h3 className="text-white font-bold text-lg">
                {MONTHS_FR[viewMonth]} {viewYear}
              </h3>
              <button
                onClick={nextMonth}
                disabled={!canGoNextMonth}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  canGoNextMonth
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-white/20 cursor-not-allowed"
                }`}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
              {DAYS_FR.map((day) => (
                <div
                  key={day}
                  className="text-center py-3 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 p-2 gap-1">
              {getCalendarDays().map((item, i) => (
                <button
                  key={i}
                  disabled={item.disabled || !item.day}
                  onClick={() => item.day && !item.disabled && setSelectedDate(item.dateStr)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    !item.day
                      ? ""
                      : item.disabled
                      ? "text-[var(--color-muted)]/30 cursor-not-allowed"
                      : selectedDate === item.dateStr
                      ? "bg-[var(--color-red)] text-white shadow-lg font-bold"
                      : item.isToday
                      ? "bg-[var(--color-teal)]/10 text-[var(--color-teal)] font-bold hover:bg-[var(--color-red)]/10"
                      : "hover:bg-[var(--color-red)]/10 text-[var(--color-foreground)]"
                  }`}
                >
                  {item.day}
                </button>
              ))}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="border-t border-[var(--color-border)] px-6 py-6">
                <h4 className="text-sm font-bold mb-4">
                  <i className="fas fa-clock text-[var(--color-red)] mr-2"></i>
                  Plages horaires disponibles le {formatDateFR(selectedDate)}
                </h4>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-[var(--color-muted)] text-sm">
                    <i className="fas fa-spinner fa-spin"></i> Chargement...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isBooked
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                              : selectedTime === slot
                              ? "bg-[var(--color-red)] text-white shadow-lg"
                              : "bg-[var(--color-background)] text-[var(--color-foreground)] hover:bg-[var(--color-red)]/10 border border-[var(--color-border)]"
                          }`}
                        >
                          {slot}
                          {isBooked && (
                            <span className="ml-1 text-[10px] no-underline"> reserve</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact info */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 sm:p-8">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nom <span className="text-[var(--color-red)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Telephone <span className="text-[var(--color-red)]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="514-000-0000"
                    className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Courriel</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@courriel.com"
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 rue Exemple"
                    className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ville</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all bg-white"
                  >
                    <option value="">Selectionnez une ville</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Notes ou details supplementaires
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Decrivez brievement votre besoin (type de fenetre, probleme, etc.)"
                  rows={4}
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)]/30 focus:border-[var(--color-red)] transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-check text-2xl text-[var(--color-teal)]"></i>
              </div>
              <h3 className="text-xl font-extrabold">Verifiez votre rendez-vous</h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Assurez-vous que toutes les informations sont correctes avant de confirmer.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-start gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-wrench text-[var(--color-red)]"></i>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Service</p>
                  <p className="font-bold">{serviceName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-calendar text-[var(--color-red)]"></i>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Date et heure</p>
                  <p className="font-bold">{formatDateFR(selectedDate)} a {selectedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-[var(--color-red)]"></i>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Contact</p>
                  <p className="font-bold">{form.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{form.phone}</p>
                  {form.email && <p className="text-sm text-[var(--color-muted)]">{form.email}</p>}
                </div>
              </div>

              {(form.address || form.city) && (
                <div className="flex items-start gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-map-marker-alt text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Adresse</p>
                    {form.address && <p className="font-bold">{form.address}</p>}
                    {form.city && <p className="text-sm text-[var(--color-muted)]">{form.city}</p>}
                  </div>
                </div>
              )}

              {form.notes && (
                <div className="flex items-start gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-sticky-note text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Notes</p>
                    <p className="text-sm">{form.notes}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={goPrev}
            className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] font-semibold text-sm transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Precedent
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all ${
              canGoNext()
                ? "bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                : "bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed"
            }`}
          >
            Suivant <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Envoi...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Confirmer le rendez-vous
              </>
            )}
          </button>
        )}
      </div>

      {/* Inline keyframes for animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
