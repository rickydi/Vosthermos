import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import SalesShareActions from "./SalesShareActions";

const PDF_PATH = "/documents/pitch-vente-portail-gestionnaires-vosthermos.pdf";
const PDF_URL = `https://www.vosthermos.com${PDF_PATH}`;

export const metadata = {
  title: "Vendeur | Admin Vosthermos",
};

export default async function AdminVendeurPage() {
  await requireAdmin();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <p className="admin-text-muted text-xs font-bold uppercase tracking-widest mb-2">
            Outils de vente
          </p>
          <h1 className="text-2xl lg:text-3xl font-extrabold admin-text">
            Vendeur
          </h1>
          <p className="admin-text-muted mt-2 max-w-2xl">
            PDF de pitch pour présenter Vosthermos et le portail gestionnaire aux représentants,
            manufacturiers de fenêtres et gestionnaires de copropriétés.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
          >
            <i className="fas fa-external-link-alt text-[var(--color-red)]"></i>
            Ouvrir le PDF
          </a>
          <a
            href={PDF_PATH}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-red)] text-white font-bold text-sm hover:opacity-90"
          >
            <i className="fas fa-download"></i>
            Télécharger
          </a>
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="admin-card rounded-xl border admin-border overflow-hidden">
          <div className="p-4 sm:p-5 admin-border border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="admin-text font-bold">Pitch PDF gestionnaires</h2>
              <p className="admin-text-muted text-sm">
                Aperçu du document partageable.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-[var(--color-red)] w-fit">
              <i className="fas fa-file-pdf"></i>
              PDF public
            </span>
          </div>
          <div className="bg-slate-950/20 p-3 sm:p-5">
            <iframe
              src={`${PDF_PATH}#view=FitH`}
              title="Aperçu du PDF de pitch vendeur Vosthermos"
              className="w-full h-[72vh] min-h-[520px] rounded-lg border admin-border bg-white"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="admin-card rounded-xl border admin-border p-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center mb-4">
              <i className="fas fa-share-alt text-lg"></i>
            </div>
            <h2 className="admin-text font-bold mb-2">Lien à partager</h2>
            <p className="admin-text-muted text-sm mb-4">
              Envoie ce lien par courriel, texto, Messenger ou LinkedIn. La personne n&apos;a pas
              besoin d&apos;accès admin.
            </p>
            <div className="admin-card border admin-border rounded-lg p-3 mb-4 break-all text-sm admin-text">
              {PDF_URL}
            </div>
            <SalesShareActions shareUrl={PDF_URL} />
          </div>

          <div className="admin-card rounded-xl border admin-border p-5">
            <h2 className="admin-text font-bold mb-3">Liens utiles</h2>
            <div className="space-y-2">
              <Link
                href="/portail-gestionnaire"
                target="_blank"
                className="flex items-center justify-between gap-3 rounded-lg border admin-border p-3 admin-hover"
              >
                <span className="admin-text text-sm font-bold">Page portail gestionnaire</span>
                <i className="fas fa-external-link-alt admin-text-muted"></i>
              </Link>
              <Link
                href="/portail-gestionnaire/tutoriel.html"
                target="_blank"
                className="flex items-center justify-between gap-3 rounded-lg border admin-border p-3 admin-hover"
              >
                <span className="admin-text text-sm font-bold">Tutoriel animé</span>
                <i className="fas fa-external-link-alt admin-text-muted"></i>
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
