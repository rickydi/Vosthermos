"use client";

// Modal « Apercu de l'article » — partage entre Nouvel article et Modifier
// (avant: copie-colle dans les deux, iframe sandbox identique au caractere pres).
export default function BlogPreviewModal({ form, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold text-gray-900">Apercu de l&apos;article</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            {form.title || "Titre de l'article"}
          </h1>
          <p className="text-gray-500 italic mb-8">
            {form.excerpt || "Extrait..."}
          </p>
          <iframe
            title="Apercu securise"
            sandbox=""
            className="h-[420px] w-full rounded-xl border border-gray-200 bg-white"
            srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#374151;line-height:1.7;padding:20px;margin:0}h2{font-size:24px;margin:28px 0 12px;color:#111827}h3{font-size:20px;margin:22px 0 10px;color:#111827}p{margin:0 0 16px}ul,ol{padding-left:22px}strong{color:#111827}a{color:#0d9488}</style></head><body>${form.content || "<p>Aucun contenu...</p>"}</body></html>`}
          />
        </div>
      </div>
    </div>
  );
}
