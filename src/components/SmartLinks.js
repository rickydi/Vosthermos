import Link from "next/link";

export function ProblemsLinksBlock({ problems, title, cityName }) {
  if (!problems || problems.length === 0) return null;
  return (
    <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100/50">
      <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
        <i className="fas fa-exclamation-circle text-[var(--color-red)]"></i>
        {title || "Problemes que nous reglons"}
      </h3>
      <div className="grid sm:grid-cols-2 gap-2">
        {problems.map((p) => (
          <Link
            key={p.slug}
            href={`/problemes/${p.slug}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--color-red)] transition-colors py-1"
          >
            <i className={`${p.icon} text-xs text-gray-400`}></i>
            {p.shortTitle}
          </Link>
        ))}
      </div>
      {cityName && (
        <p className="text-xs text-gray-400 mt-3">Service disponible a {cityName} et dans un rayon de 100km</p>
      )}
    </div>
  );
}

export function PricingLinkBlock({ pricing }) {
  if (!pricing) return null;
  return (
    <Link
      href={`/prix/${pricing.slug}`}
      className="block bg-green-50/50 rounded-2xl p-6 border border-green-100/50 hover:shadow-md transition-all group"
    >
      <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
        <i className="fas fa-dollar-sign text-green-600"></i>
        Combien ca coute?
      </h3>
      <p className="text-2xl font-black text-green-700 mb-1">
        {pricing.priceRange.min}$ — {pricing.priceRange.max}$
      </p>
      <p className="text-xs text-gray-500">{pricing.priceRange.unit}</p>
      <span className="inline-block mt-3 text-xs font-semibold text-green-600 group-hover:underline">
        Voir la grille tarifaire complete &rarr;
      </span>
    </Link>
  );
}

export function CitiesLinksBlock({ cities, serviceSlug, serviceName }) {
  if (!cities || cities.length === 0 || !serviceSlug) return null;
  return (
    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
      <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
        <i className="fas fa-map-marker-alt text-blue-600"></i>
        {serviceName ? `${serviceName} par ville` : "Nos secteurs"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={serviceSlug ? `/services/${serviceSlug}/${c.slug}` : `/reparation-portes-et-fenetres/${c.slug}`}
            className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100/50"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OptiFenetreBlock({ cityName }) {
  return (
    <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-6 text-white">
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <i className="fas fa-star text-yellow-400"></i>
        Programme OPTI-FENETRE{cityName ? ` a ${cityName}` : ""}
      </h3>
      <p className="text-white/70 text-sm mb-4">
        Plusieurs problemes? Regroupez tout en un forfait cle en main — jusqu'a 70% d'economie.
      </p>
      <Link
        href="/opti-fenetre"
        className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
      >
        Decouvrir <i className="fas fa-arrow-right"></i>
      </Link>
    </div>
  );
}

export function DiagnosticBlock() {
  return (
    <Link
      href="/diagnostic"
      className="block bg-purple-50/50 rounded-2xl p-6 border border-purple-100/50 hover:shadow-md transition-all group"
    >
      <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
        <i className="fas fa-stethoscope text-purple-600"></i>
        Pas sur de votre probleme?
      </h3>
      <p className="text-gray-500 text-xs mb-3">
        Repondez a quelques questions et on vous guide vers la bonne solution.
      </p>
      <span className="inline-block text-xs font-semibold text-purple-600 group-hover:underline">
        Faire le diagnostic &rarr;
      </span>
    </Link>
  );
}

export function FullSmartLinksSection({ problems, pricing, cities, serviceSlug, serviceName, cityName }) {
  const hasContent = (problems?.length > 0) || pricing || (cities?.length > 0);
  if (!hasContent) return null;

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          Ressources connexes
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricing && <PricingLinkBlock pricing={pricing} />}
          {problems?.length > 0 && <ProblemsLinksBlock problems={problems} cityName={cityName} />}
          {cities?.length > 0 && serviceSlug && (
            <CitiesLinksBlock cities={cities} serviceSlug={serviceSlug} serviceName={serviceName} />
          )}
          <OptiFenetreBlock cityName={cityName} />
          <DiagnosticBlock />
        </div>
      </div>
    </div>
  );
}
