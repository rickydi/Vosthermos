"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MeasurementEditor from "@/components/measurements/MeasurementEditor";

export default function MeasurementAdminClient({ id }) {
  const router = useRouter();
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    fetch(`/api/admin/measurements/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Fiche de mesures introuvable.");
        setMeasurement(body.measurement || body);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function createQuote() {
    setBusy("quote"); setError("");
    try {
      if (editorRef.current?.isPhotoPending?.()) {
        setError("Attendez la fin du téléversement et de l’analyse de la photo avant de créer ou d’actualiser la soumission.");
        return;
      }
      if (editorRef.current?.isDirty()) {
        const saved = await editorRef.current.save(false);
        if (!saved || editorRef.current?.isDirty()) {
          setError("La fiche a changé pendant l’enregistrement. Vérifiez les mesures, puis réessayez avant de créer la soumission.");
          return;
        }
        if (measurement.source === "technician") {
          setError("Les corrections sont enregistrées. Validez de nouveau les mesures finales avant d’actualiser la soumission.");
          return;
        }
      }
      if (editorRef.current?.isDirty()) {
        setError("Des changements ne sont pas encore enregistrés. La soumission n’a pas été créée.");
        return;
      }
      if (editorRef.current?.isPhotoPending?.()) {
        setError("Attendez la fin du téléversement et de l’analyse de la photo avant de créer ou d’actualiser la soumission.");
        return;
      }
      const res = await fetch(`/api/admin/measurements/${id}/create-quote`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Impossible de créer la soumission.");
      router.push(`/admin/soumissions/nouveau?edit=${body.workOrderId || body.workOrder?.id}`);
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  async function createOrder() {
    setBusy("order"); setError("");
    try {
      if (editorRef.current?.isPhotoPending?.()) {
        setError("Attendez la fin du téléversement et de l’analyse de la photo avant de préparer la commande.");
        return;
      }
      if (editorRef.current?.isDirty()) {
        const saved = await editorRef.current.save(false);
        if (!saved || editorRef.current?.isDirty()) {
          setError("La fiche a changé pendant l’enregistrement. Vérifiez les mesures, puis réessayez.");
        } else {
          setError("Les corrections sont enregistrées. Validez de nouveau les mesures finales avant de préparer la commande.");
        }
        return;
      }
      if (editorRef.current?.isPhotoPending?.()) {
        setError("Attendez la fin du téléversement et de l’analyse de la photo avant de préparer la commande.");
        return;
      }
      const res = await fetch("/api/admin/thermos-orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measurementId: Number(id) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Impossible de préparer la commande.");
      router.push(`/admin/commandes-thermos?order=${body.order?.id || body.id}`);
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  if (error && !measurement) return <div className="p-6"><div className="rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 p-4">{error}</div></div>;
  if (!measurement) return <div className="p-8 admin-text-muted"><i className="fas fa-spinner fa-spin mr-2" />Chargement de la fiche…</div>;

  const canOrder = measurement.source === "technician" && measurement.accuracy === "final" && measurement.status === "validated";
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Link href="/admin/suivi-clients" className="admin-text-muted hover:admin-text text-sm"><i className="fas fa-arrow-left mr-2" />Retour au suivi</Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={createQuote} disabled={!!busy} className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 px-4 py-2.5 font-bold text-sm disabled:opacity-50">
            <i className={`fas ${busy === "quote" ? "fa-spinner fa-spin" : "fa-file-signature"} mr-2`} />Créer / compléter la soumission
          </button>
          <button onClick={createOrder} disabled={!!busy || !canOrder} title={!canOrder ? "Une commande exige des mesures finales validées par un technicien." : "Préparer la commande fournisseur"} className="rounded-xl bg-cyan-600 text-white px-4 py-2.5 font-bold text-sm disabled:opacity-35">
            <i className={`fas ${busy === "order" ? "fa-spinner fa-spin" : "fa-boxes-stacked"} mr-2`} />Préparer la commande thermos
          </button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 p-3 text-sm">{error}</div>}
      {!canOrder && measurement.status === "validated" && measurement.source !== "technician" && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-100 p-3 text-sm">
          Ces mesures servent à la pré-soumission. Faites créer une fiche « Mesures technicien » avant de commander au fournisseur.
        </div>
      )}
      <MeasurementEditor
        ref={editorRef}
        initialMeasurement={measurement}
        apiBase={`/api/admin/measurements/${id}`}
        technicianMode={measurement.source === "technician"}
        interactionDisabled={Boolean(busy)}
        onSaved={(next) => setMeasurement((old) => ({ ...old, ...next }))}
        onFinalized={(next) => setMeasurement((old) => ({ ...old, ...next }))}
      />
    </div>
  );
}
