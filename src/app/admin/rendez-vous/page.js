"use client";

import { useState, useEffect, useCallback } from "react";

const MONTHS_FR = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-400" },
  waiting_client: { label: "Attend retour client", color: "bg-orange-500/20 text-orange-400", dot: "bg-orange-400" },
  confirmed: { label: "Confirme", color: "bg-green-500/20 text-green-400", dot: "bg-green-400" },
  completed: { label: "Complete", color: "bg-blue-500/20 text-blue-400", dot: "bg-blue-400" },
  cancelled: { label: "Annule", color: "bg-red-500/20 text-red-400", dot: "bg-red-400" },
};

const SERVICE_LABELS = {
  quincaillerie: "Quincaillerie",
  thermos: "Vitre thermos",
  "portes-bois": "Portes en bois",
  moustiquaires: "Moustiquaires",
};

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDates(referenceDate) {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday of the week
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const days = [];
  for (let i = -startOffset; i <= lastDay.getDate() + (6 - (lastDay.getDay() + 6) % 7) - 1; i++) {
    const d = new Date(year, month, i + 1);
    days.push(d);
  }
  return days;
}

export default function AdminAppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [view, setView] = useState("week"); // "week" | "month"

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const monthDates = getMonthDates(currentDate.getFullYear(), currentDate.getMonth());
  const monthStart = monthDates[0];
  const monthEnd = monthDates[monthDates.length - 1];

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const from = formatDate(view === "week" ? weekStart : monthStart);
      const to = formatDate(view === "week" ? weekEnd : monthEnd);
      const res = await fetch(`/api/admin/appointments?from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
    setLoading(false);
  }, [view === "week" ? weekStart.getTime() : monthStart.getTime(), view === "week" ? weekEnd.getTime() : monthEnd.getTime(), view]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  function prevPeriod() {
    const d = new Date(currentDate);
    if (view === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }

  function nextPeriod() {
    const d = new Date(currentDate);
    if (view === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  async function updateStatus(id, newStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        );
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(updated);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
    setUpdating(false);
  }

  async function deleteAppointment(id) {
    if (!confirm("Supprimer ce rendez-vous?")) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        setSelectedAppointment(null);
      }
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  }

  function getAppointmentsForDate(dateStr) {
    return appointments.filter((a) => a.date.startsWith(dateStr));
  }

  // Stats
  const totalWeek = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;

  const todayStr = formatDate(new Date());

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-extrabold admin-text">Rendez-vous</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 mr-2">
            <button onClick={() => setView("week")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${view === "week" ? "bg-[var(--color-red)]/10 text-[var(--color-red)]" : "admin-text-muted admin-hover"}`}>
              Semaine
            </button>
            <button onClick={() => setView("month")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${view === "month" ? "bg-[var(--color-red)]/10 text-[var(--color-red)]" : "admin-text-muted admin-hover"}`}>
              Mois
            </button>
          </div>
          <button onClick={goToday}
            className="px-4 py-2 rounded-lg text-sm font-semibold admin-text-muted admin-hover admin-card transition-all">
            Aujourd&apos;hui
          </button>
          <button onClick={prevPeriod}
            className="w-9 h-9 rounded-lg flex items-center justify-center admin-text-muted admin-hover transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextPeriod}
            className="w-9 h-9 rounded-lg flex items-center justify-center admin-text-muted admin-hover transition-colors">
            <i className="fas fa-chevron-right"></i>
          </button>
          <span className="admin-text font-semibold text-sm ml-2">
            {view === "week"
              ? `${weekStart.getDate()} ${MONTHS_FR[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS_FR[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
              : `${MONTHS_FR[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="admin-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center">
              <i className="fas fa-calendar text-[var(--color-red)]"></i>
            </div>
            <div>
              <p className="admin-text-muted text-xs uppercase tracking-wider font-semibold">
                Cette semaine
              </p>
              <p className="admin-text text-xl font-extrabold">{totalWeek}</p>
            </div>
          </div>
        </div>
        <div className="admin-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <i className="fas fa-clock text-yellow-500"></i>
            </div>
            <div>
              <p className="admin-text-muted text-xs uppercase tracking-wider font-semibold">
                En attente
              </p>
              <p className="admin-text text-xl font-extrabold">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="admin-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-500"></i>
            </div>
            <div>
              <p className="admin-text-muted text-xs uppercase tracking-wider font-semibold">
                Confirmes
              </p>
              <p className="admin-text text-xl font-extrabold">{confirmedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner fa-spin text-2xl admin-text-muted"></i>
        </div>
      ) : view === "month" ? (
        /* Monthly view */
        <div>
          <div className="grid grid-cols-7 gap-px mb-px">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="admin-text-muted text-[10px] font-bold uppercase tracking-widest text-center py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((date) => {
              const dateStr = formatDate(date);
              const dayAppts = getAppointmentsForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();

              return (
                <div key={dateStr}
                  className={`admin-card rounded-lg min-h-[90px] p-1.5 ${isToday ? "ring-2 ring-[var(--color-red)]" : ""} ${!isCurrentMonth ? "opacity-30" : ""}`}>
                  <p className={`text-xs font-bold mb-1 ${isToday ? "text-[var(--color-red)]" : "admin-text-muted"}`}>
                    {date.getDate()}
                  </p>
                  {dayAppts.slice(0, 3).map((appt) => {
                    const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                    return (
                      <button key={appt.id} onClick={() => setSelectedAppointment(appt)}
                        className="w-full text-left mb-0.5 px-1.5 py-0.5 rounded text-[10px] truncate admin-hover flex items-center gap-1"
                        style={{ background: `${statusCfg.dot === "bg-yellow-400" ? "rgba(234,179,8,0.15)" : statusCfg.dot === "bg-green-400" ? "rgba(34,197,94,0.15)" : statusCfg.dot === "bg-blue-400" ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                        <span className={`w-1 h-1 rounded-full ${statusCfg.dot} shrink-0`}></span>
                        <span className="admin-text truncate">{appt.timeSlot} {appt.name}</span>
                      </button>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <p className="admin-text-muted text-[9px] text-center">+{dayAppts.length - 3} de plus</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly view */
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {weekDates.map((date, i) => {
            const dateStr = formatDate(date);
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isToday = dateStr === todayStr;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={dateStr}
                className={`admin-card rounded-xl overflow-hidden ${
                  isToday ? "ring-2 ring-[var(--color-red)]" : ""
                } ${isWeekend ? "opacity-50" : ""}`}
              >
                {/* Day header */}
                <div
                  className={`px-4 py-3 admin-border border-b ${
                    isToday ? "bg-[var(--color-red)]/10" : ""
                  }`}
                >
                  <p className="admin-text-muted text-[10px] uppercase tracking-widest font-bold">
                    {DAYS_SHORT[i]}
                  </p>
                  <p className={`text-lg font-extrabold ${isToday ? "text-[var(--color-red)]" : "admin-text"}`}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Appointments */}
                <div className="p-2 space-y-2 min-h-[120px]">
                  {dayAppointments.length === 0 && !isWeekend && (
                    <p className="text-center admin-text-muted text-[10px] py-4">Aucun</p>
                  )}
                  {dayAppointments.map((appt) => {
                    const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                    return (
                      <button
                        key={appt.id}
                        onClick={() => setSelectedAppointment(appt)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all group border ${statusCfg.color} border-current/20`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                            <span className="admin-text text-xs font-bold">{appt.timeSlot}</span>
                          </div>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="admin-text text-xs font-semibold">{appt.name}</p>
                        <p className="text-[var(--color-red)] text-[10px] font-medium">
                          {SERVICE_LABELS[appt.serviceType] || appt.serviceType}
                        </p>
                        {appt.phone && (
                          <p className="admin-text-muted text-[10px]">
                            <i className="fas fa-phone text-[8px] mr-1"></i>{appt.phone}
                          </p>
                        )}
                        {(appt.address || appt.city) && (
                          <p className="admin-text-muted text-[10px] truncate">
                            <i className="fas fa-map-pin text-[8px] mr-1"></i>
                            {[appt.address, appt.city].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setSelectedAppointment(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 dark-modal"
              style={{ background: "#1e2538" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 admin-border border-b">
                <h3 className="admin-text text-lg font-extrabold">Details du rendez-vous</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="admin-text-muted hover:text-[var(--color-red)] transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      STATUS_CONFIG[selectedAppointment.status]?.color
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selectedAppointment.status]?.dot}`}
                    ></span>
                    {STATUS_CONFIG[selectedAppointment.status]?.label}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-user admin-text-muted w-5 text-center mt-0.5"></i>
                    <div>
                      <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                        Client
                      </p>
                      <p className="admin-text font-semibold">{selectedAppointment.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="fas fa-phone admin-text-muted w-5 text-center mt-0.5"></i>
                    <div>
                      <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                        Telephone
                      </p>
                      <a
                        href={`tel:${selectedAppointment.phone}`}
                        className="text-[var(--color-red)] font-semibold hover:underline"
                      >
                        {selectedAppointment.phone}
                      </a>
                    </div>
                  </div>

                  {selectedAppointment.email && (
                    <div className="flex items-start gap-3">
                      <i className="fas fa-envelope admin-text-muted w-5 text-center mt-0.5"></i>
                      <div>
                        <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                          Courriel
                        </p>
                        <p className="admin-text text-sm">{selectedAppointment.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <i className="fas fa-wrench admin-text-muted w-5 text-center mt-0.5"></i>
                    <div>
                      <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                        Service
                      </p>
                      <p className="admin-text font-semibold">
                        {SERVICE_LABELS[selectedAppointment.serviceType] ||
                          selectedAppointment.serviceType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="fas fa-calendar admin-text-muted w-5 text-center mt-0.5"></i>
                    <div>
                      <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                        Date et heure
                      </p>
                      <p className="admin-text font-semibold">
                        {new Date(selectedAppointment.date).toLocaleDateString("fr-CA", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        a {selectedAppointment.timeSlot}
                      </p>
                    </div>
                  </div>

                  {(selectedAppointment.address || selectedAppointment.city) && (
                    <div className="flex items-start gap-3">
                      <i className="fas fa-map-marker-alt admin-text-muted w-5 text-center mt-0.5"></i>
                      <div>
                        <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                          Adresse
                        </p>
                        <p className="admin-text text-sm">
                          {[selectedAppointment.address, selectedAppointment.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.notes && (
                    <div className="flex items-start gap-3">
                      <i className="fas fa-sticky-note admin-text-muted w-5 text-center mt-0.5"></i>
                      <div>
                        <p className="admin-text-muted text-[10px] uppercase tracking-wider font-semibold">
                          Notes
                        </p>
                        <p className="admin-text text-sm whitespace-pre-wrap">
                          {selectedAppointment.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status actions */}
                <div className="admin-border border-t pt-5">
                  <p className="admin-text-muted text-[10px] uppercase tracking-wider font-bold mb-3">
                    Changer le statut
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                      <button
                        key={status}
                        disabled={updating || selectedAppointment.status === status}
                        onClick={() => updateStatus(selectedAppointment.id, status)}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                          selectedAppointment.status === status
                            ? cfg.color + " ring-2 ring-white/20"
                            : cfg.color + " opacity-50 hover:opacity-100"
                        } disabled:cursor-default`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Jason + Delete */}
                <div className="admin-border border-t pt-5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const a = selectedAppointment;
                      const dateStr = new Date(a.date).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
                      const text = `*RDV Vosthermos*\n${a.name}\nTel: ${a.phone}\n${a.email ? `Email: ${a.email}\n` : ""}Service: ${SERVICE_LABELS[a.serviceType] || a.serviceType}\nDate: ${dateStr} a ${a.timeSlot}\n${a.address || ""}${a.city ? `, ${a.city}` : ""}\n${a.notes ? `\nNotes: ${a.notes}` : ""}`;
                      window.open(`https://wa.me/15148258411?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex items-center gap-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <i className="fab fa-whatsapp"></i> Jason
                  </button>
                  <button
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i> Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
