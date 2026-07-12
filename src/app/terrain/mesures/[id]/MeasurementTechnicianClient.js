"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MeasurementEditor from "@/components/measurements/MeasurementEditor";

export default function MeasurementTechnicianClient({ id }) {
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/technician/measurements/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Fiche inaccessible.");
        setMeasurement(body.measurement || body);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <main className="min-h-dvh bg-[#0a0f1a] text-white p-4"><div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">{error}</div></main>;
  if (!measurement) return <main className="min-h-dvh bg-[#0a0f1a] text-white p-8"><i className="fas fa-spinner fa-spin mr-2" />Chargement…</main>;
  return (
    <main className="min-h-dvh bg-[#0a0f1a] text-white px-3 py-4 sm:p-6">
      <div className="max-w-[1500px] mx-auto">
        <Link href="/terrain" className="inline-flex items-center text-white/60 mb-4"><i className="fas fa-arrow-left mr-2" />Retour aux tâches</Link>
        <MeasurementEditor
          initialMeasurement={measurement}
          apiBase={`/api/technician/measurements/${id}`}
          technicianMode
          onSaved={(next) => setMeasurement((old) => ({ ...old, ...next }))}
          onFinalized={(next) => setMeasurement((old) => ({ ...old, ...next }))}
        />
      </div>
    </main>
  );
}
