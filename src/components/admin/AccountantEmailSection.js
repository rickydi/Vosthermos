"use client";

import { useEffect, useState } from "react";

function lastMonthYm() {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AccountantEmailSection() {
  const [email, setEmail] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings?key=accountant_email", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/admin/settings?key=drive_report_folder_id", { cache: "no-store" }).then((res) => res.json()),
    ])
      .then(([emailData, driveData]) => {
        setEmail(String(emailData.value || ""));
        setDriveFolderId(String(driveData.value || ""));
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "accountant_email", value: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      const driveRes = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "drive_report_folder_id", value: driveFolderId.trim() }),
      });
      const driveData = await driveRes.json().catch(() => ({}));
      if (!driveRes.ok) throw new Error(driveData.error || "Erreur Drive");
      setStatus({ type: "success", message: "Parametres du rapport comptable sauvegardes." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  }

  async function testSend() {
    const month = lastMonthYm();
    if (!email.trim()) {
      setStatus({ type: "error", message: "Entre le courriel du comptable avant le test." });
      return;
    }
    if (!window.confirm(`Envoyer le rapport de ${month} au comptable maintenant?`)) return;
    setSending(true);
    setStatus(null);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "accountant_email", value: email.trim() }),
      });
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "drive_report_folder_id", value: driveFolderId.trim() }),
      });
      const res = await fetch("/api/admin/factures/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      const driveMsg = data.drive?.uploaded
        ? " Depot Drive complete."
        : data.drive?.error
          ? ` Drive non depose: ${data.drive.error}.`
          : "";
      setStatus({ type: "success", message: `Rapport ${month} envoye a ${data.to} (${data.count} facture${data.count > 1 ? "s" : ""}).${driveMsg}` });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Erreur" });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-card rounded-xl p-6 border admin-border">
        <p className="admin-text-muted text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</p>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="admin-card rounded-xl p-6 border admin-border">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="admin-text font-bold text-lg">
            <i className="fas fa-envelope-open-text mr-2 text-cyan-300"></i>
            Rapport comptable
          </h2>
          <p className="admin-text-muted text-xs mt-1">
            Adresse courriel et dossier Drive utilises pour le PDF et le CSV mensuels.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Sauvegarde...</> : <><i className="fas fa-save mr-2"></i>Sauvegarder</>}
          </button>
          <button
            type="button"
            onClick={testSend}
            disabled={sending || !email.trim()}
            className="px-4 py-2.5 border admin-border admin-text rounded-lg text-sm font-bold hover:bg-white/5 disabled:opacity-50"
          >
            {sending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi...</> : <><i className="fas fa-paper-plane mr-2"></i>Tester mois dernier</>}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label className="admin-text-muted text-xs mb-1 block font-medium">Courriel du comptable</label>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setStatus(null);
          }}
          placeholder="comptable@exemple.com"
          className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
        />
      </div>

      <div className="mt-4">
        <label className="admin-text-muted text-xs mb-1 block font-medium">ID du dossier Google Drive</label>
        <input
          value={driveFolderId}
          onChange={(event) => {
            setDriveFolderId(event.target.value);
            setStatus(null);
          }}
          placeholder="1AbCDeFg..."
          className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
        />
        <p className="admin-text-muted text-xs mt-2">
          Optionnel. Partage ce dossier avec le service account Google Drive en editeur.
        </p>
      </div>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm border ${
          status.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
