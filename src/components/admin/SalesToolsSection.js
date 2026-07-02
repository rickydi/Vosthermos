import Link from "next/link";
import SalesShareActions from "@/components/admin/SalesShareActions";

const CLIENT_PDF_PATH = "/documents/presentation-client-portail-gestionnaires-vosthermos.pdf";
const SELLER_PDF_PATH = "/documents/pitch-vente-portail-gestionnaires-vosthermos.pdf";
const CLIENT_PDF_URL = `https://www.vosthermos.com${CLIENT_PDF_PATH}`;
const SELLER_PDF_URL = `https://www.vosthermos.com${SELLER_PDF_PATH}`;

// Materiel de vente du portail gestionnaire (ancienne page /admin/vendeur,
// fusionnee ici sans l'apercu iframe pleine page).
export default function SalesToolsSection() {
  return (
    <div className="mt-10">
      <div className="mb-4">
        <h2 className="admin-text text-lg font-extrabold">
          <i className="fas fa-handshake mr-2 text-[var(--color-red)]"></i>
          Matériel de vente du portail
        </h2>
        <p className="admin-text-muted text-sm mt-1">
          PDF client partageable et pitch interne pour présenter le portail gestionnaire.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="admin-card rounded-xl border admin-border p-5">
          <h3 className="admin-text font-bold mb-2">PDF client à partager</h3>
          <p className="admin-text-muted text-sm mb-4">
            Envoie ce lien par courriel, texto, Messenger ou LinkedIn. Aucun accès admin requis.
          </p>
          <div className="admin-card border admin-border rounded-lg p-3 mb-4 break-all text-xs admin-text">
            {CLIENT_PDF_URL}
          </div>
          <SalesShareActions shareUrl={CLIENT_PDF_URL} />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <a
              href={CLIENT_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
            >
              <i className="fas fa-external-link-alt text-[var(--color-red)]"></i>
              Ouvrir
            </a>
            <a
              href={CLIENT_PDF_PATH}
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
            >
              <i className="fas fa-download text-[var(--color-red)]"></i>
              Télécharger
            </a>
          </div>
        </div>

        <div className="admin-card rounded-xl border admin-border p-5">
          <h3 className="admin-text font-bold mb-2">Pitch interne vendeur</h3>
          <p className="admin-text-muted text-sm mb-4">
            Document plus complet pour le représentant : arguments, objections et script de vente.
          </p>
          <div className="admin-card border admin-border rounded-lg p-3 mb-4 break-all text-xs admin-text">
            {SELLER_PDF_URL}
          </div>
          <SalesShareActions shareUrl={SELLER_PDF_URL} />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
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

        <div className="admin-card rounded-xl border admin-border p-5">
          <h3 className="admin-text font-bold mb-3">Liens utiles</h3>
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
      </div>
    </div>
  );
}
