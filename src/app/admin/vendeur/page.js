import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import SalesShareActions from "./SalesShareActions";

const CLIENT_PDF_PATH = "/documents/presentation-client-portail-gestionnaires-vosthermos.pdf";
const SELLER_PDF_PATH = "/documents/pitch-vente-portail-gestionnaires-vosthermos.pdf";
const CLIENT_PDF_URL = `https://www.vosthermos.com${CLIENT_PDF_PATH}`;
const SELLER_PDF_URL = `https://www.vosthermos.com${SELLER_PDF_PATH}`;

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
            PDF client partageable et pitch interne pour présenter Vosthermos, le portail
            gestionnaire et les liens de démonstration.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={CLIENT_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
          >
            <i className="fas fa-external-link-alt text-[var(--color-red)]"></i>
            Ouvrir le PDF client
          </a>
          <a
            href={CLIENT_PDF_PATH}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-red)] text-white font-bold text-sm hover:opacity-90"
          >
            <i className="fas fa-download"></i>
            Télécharger client
          </a>
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="admin-card rounded-xl border admin-border overflow-hidden">
          <div className="p-4 sm:p-5 admin-border border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="admin-text font-bold">PDF client - portail gestionnaire</h2>
              <p className="admin-text-muted text-sm">
                Aperçu du document que le vendeur peut envoyer directement au client.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-[var(--color-red)] w-fit">
              <i className="fas fa-file-pdf"></i>
              PDF public
            </span>
          </div>
          <div className="bg-slate-950/20 p-3 sm:p-5">
            <iframe
              src={`${CLIENT_PDF_PATH}#view=FitH`}
              title="Aperçu du PDF client Vosthermos"
              className="w-full h-[72vh] min-h-[520px] rounded-lg border admin-border bg-white"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="admin-card rounded-xl border admin-border p-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center mb-4">
              <i className="fas fa-share-alt text-lg"></i>
            </div>
            <h2 className="admin-text font-bold mb-2">PDF client à partager</h2>
            <p className="admin-text-muted text-sm mb-4">
              Envoie ce lien par courriel, texto, Messenger ou LinkedIn. La personne n&apos;a pas
              besoin d&apos;accès admin.
            </p>
            <div className="admin-card border admin-border rounded-lg p-3 mb-4 break-all text-sm admin-text">
              {CLIENT_PDF_URL}
            </div>
            <SalesShareActions shareUrl={CLIENT_PDF_URL} />
          </div>

          <div className="admin-card rounded-xl border admin-border p-5">
            <h2 className="admin-text font-bold mb-2">Pitch interne vendeur</h2>
            <p className="admin-text-muted text-sm mb-4">
              Document plus complet pour le représentant : arguments, objections et script de vente.
            </p>
            <div className="admin-card border admin-border rounded-lg p-3 mb-4 break-all text-sm admin-text">
              {SELLER_PDF_URL}
            </div>
            <div className="flex flex-col gap-3">
              <SalesShareActions shareUrl={SELLER_PDF_URL} />
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={SELLER_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
                >
                  <i className="fas fa-external-link-alt text-[var(--color-red)]"></i>
                  Ouvrir
                </a>
                <a
                  href={SELLER_PDF_PATH}
                  download
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
                >
                  <i className="fas fa-download text-[var(--color-red)]"></i>
                  Télécharger
                </a>
              </div>
            </div>
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
