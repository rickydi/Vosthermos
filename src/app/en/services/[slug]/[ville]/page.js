import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "@/lib/services-data";
import { CITIES, getCity } from "@/lib/cities";

export function generateStaticParams() {
  const params = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      params.push({ slug: service.slug, ville: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) return {};

  const title = `${service.shortTitle} in ${city.name} | Vosthermos`;
  const description = `${service.shortTitle} in ${city.name}, ${city.region}. Professional service with warranty. Free quote. 514-825-8411. Vosthermos serves ${city.name} and surrounding areas.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.vosthermos.com/en/services/${service.slug}/${city.slug}` },
    openGraph: {
      type: "website",
      url: `https://www.vosthermos.com/en/services/${service.slug}/${city.slug}`,
      title,
      description,
      images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "en_CA",
    },
  };
}

export default async function ServiceCityPage({ params }) {
  const { slug, ville } = await params;
  const service = getService(slug);
  const city = getCity(ville);
  if (!service || !city) notFound();

  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.shortTitle} in ${city.name}`,
    description: `Professional ${service.shortTitle.toLowerCase()} service in ${city.name}. Vosthermos offers fast and guaranteed service.`,
    url: `https://www.vosthermos.com/en/services/${service.slug}/${city.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      email: "info@vosthermos.com",
      url: "https://www.vosthermos.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "330 Ch. St-Francois-Xavier, Local 101",
        addressLocality: "Saint-Francois-Xavier",
        addressRegion: "QC",
        addressCountry: "CA",
      },
    },
    areaServed: { "@type": "City", name: city.name },
  };

  const faqItems = [
    {
      q: `How much does ${service.shortTitle.toLowerCase()} cost in ${city.name}?`,
      a: `The price varies depending on the scope of work. Contact us at 514-825-8411 for a free quote in ${city.name}. We service all neighborhoods${city.neighborhoods ? ` including ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}.`,
    },
    {
      q: `Do you serve ${city.name} for this service?`,
      a: `Yes, ${city.name} is part of our service area. We are only ${city.distance} from our workshop. We cover ${city.name} and the entire ${city.region} region.`,
    },
    {
      q: `What is the turnaround time for ${service.shortTitle.toLowerCase()} in ${city.name}?`,
      a: `Generally, we can provide a quote within 48 hours and complete the work within 1 to 2 weeks. For urgent cases in ${city.name}, contact us directly.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="pt-[65px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-white/40 text-sm mb-6">
            <Link href="/en/services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <Link href={`/en/services/${service.slug}`} className="hover:text-white transition-colors">{service.shortTitle}</Link>
            <span>/</span>
            <span className="text-white/70">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {service.shortTitle} in {city.name}
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mb-8">
            Professional {service.shortTitle.toLowerCase()} service in {city.name} and the {city.region} area.
            Our experts travel to {city.name} ({city.distance} from our workshop) for fast and guaranteed work.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:15148258411"
              className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors"
            >
              <i className="fas fa-phone"></i>
              514-825-8411
            </a>
            <Link
              href="/en/rendez-vous"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-file-alt"></i>
              Free quote
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* City context */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {service.shortTitle} in {city.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {city.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Vosthermos offers a complete {service.shortTitle.toLowerCase()} service to {city.name} residents.
                {city.neighborhoods && city.neighborhoods.length > 0 && (
                  <> We serve all neighborhoods including {city.neighborhoods.join(", ")}.</>
                )}
              </p>
            </div>

            {/* Common issues */}
            {city.commonIssues && city.commonIssues.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Common problems in {city.name}
                </h2>
                <div className="space-y-3">
                  {city.commonIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-exclamation-triangle text-xs"></i>
                      </div>
                      <p className="text-gray-700 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service details */}
            {service.sections && service.sections[0] && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.sections[0].heading}
                </h2>
                {service.sections[0].paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            )}

            {/* OPTI-FENETRE upsell */}
            <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-3">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                OPTI-FENETRE Program in {city.name}
              </h3>
              <p className="text-white/70 mb-4 text-sm">
                Need multiple repairs? The OPTI-FENETRE program bundles all our
                services into a turnkey package — complete restoration at a fraction of
                the replacement cost.
              </p>
              <Link
                href="/en/opti-fenetre"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                Discover OPTI-FENETRE
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently asked questions — {city.name}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900 pr-4 text-sm">{item.q}</span>
                      <i className="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* CTA card */}
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[100px]">
              <h3 className="font-bold text-gray-900 mb-2">Free quote</h3>
              <p className="text-gray-500 text-sm mb-4">
                Get a free evaluation for {service.shortTitle.toLowerCase()} in {city.name}.
              </p>
              <a
                href="tel:15148258411"
                className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-red-light)] transition-colors w-full mb-3"
              >
                <i className="fas fa-phone"></i>
                514-825-8411
              </a>
              <Link
                href="/en/rendez-vous"
                className="flex items-center justify-center gap-2 bg-[var(--color-teal)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors w-full"
              >
                <i className="fas fa-calendar-alt"></i>
                Book an appointment
              </Link>
            </div>

            {/* Other services in this city */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Other services in {city.name}</h3>
              <div className="space-y-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/en/services/${s.slug}/${city.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
                      <i className={`${s.icon} text-xs`}></i>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-[var(--color-teal)] transition-colors">
                      {s.shortTitle}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/en/secteurs/${city.slug}`}
                  className="block text-center text-[var(--color-teal)] text-sm font-medium mt-3 hover:underline"
                >
                  All our services in {city.name} &rarr;
                </Link>
              </div>
            </div>

            {/* Other cities for this service */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">{service.shortTitle} — Other cities</h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/en/services/${service.slug}/${c.slug}`}
                    className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-600 hover:text-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-colors border border-gray-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
