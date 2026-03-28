import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center mx-auto mb-8">
          <i className="fas fa-search text-4xl text-[var(--color-red)]"></i>
        </div>
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <p className="text-xl text-[var(--color-muted)] mb-8">
          Oups! Cette page n&apos;existe pas ou a ete deplacee.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link href="/boutique" className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all text-center">
            <i className="fas fa-shopping-bag text-2xl text-[var(--color-teal)] mb-3"></i>
            <p className="font-bold">Boutique</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">740+ pieces en stock</p>
          </Link>
          <Link href="/services/remplacement-vitre-thermos" className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all text-center">
            <i className="fas fa-snowflake text-2xl text-[var(--color-teal)] mb-3"></i>
            <p className="font-bold">Thermos</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Remplacement garanti</p>
          </Link>
          <Link href="/diagnostic" className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all text-center">
            <i className="fas fa-stethoscope text-2xl text-[var(--color-teal)] mb-3"></i>
            <p className="font-bold">Diagnostic</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Test gratuit en 2 min</p>
          </Link>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg">
          <i className="fas fa-home"></i> Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
