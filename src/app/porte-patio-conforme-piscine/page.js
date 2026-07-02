import Link from "next/link";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Porte-patio conforme à la loi piscine (sans clôture) | Vosthermos",
  description:
    `Piscine accessible par une porte-patio? La loi du Québec exige un verrou automatique à 1,5 m. Vosthermos rend votre porte-patio conforme — bien moins cher qu'une clôture. Soumission gratuite ${COMPANY_INFO.phone}`,
  keywords:
    "loi piscine porte patio, clôture piscine porte patio, verrou porte patio piscine, conformité piscine 2027, dispositif sécurité porte patio piscine, loquet porte patio, mise aux normes piscine, sécurité piscine Québec, Rive-Sud, Montréal, Laval",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/porte-patio-conforme-piscine",
  },
  openGraph: {
    type: "website",
    siteName: "Vosthermos",
    url: "https://www.vosthermos.com/porte-patio-conforme-piscine",
    title: "Porte-patio conforme à la loi piscine — sans clôture",
    description:
      "La loi exige un verrou automatique à 1,5 m sur la porte-patio qui donne accès à la piscine. On rend la vôtre conforme pour une fraction du prix d'une clôture.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
};

const faqs = [
  {
    q: "Ma porte-patio doit-elle vraiment être conforme?",
    a: "Si votre piscine est accessible directement par une porte-patio, oui. Le Règlement sur la sécurité des piscines résidentielles du Québec exige que cette porte se ferme et se verrouille automatiquement, avec un dispositif installé à 1,5 m du sol. Ça s'applique aux piscines creusées, hors terre et démontables. Vérifiez toujours auprès de votre municipalité pour votre cas précis.",
  },
  {
    q: "Est-ce moins cher qu'une clôture?",
    a: "Beaucoup. Une clôture de piscine conforme coûte des milliers de dollars et demande de l'espace. Rendre votre porte-patio existante conforme avec un dispositif de verrouillage automatique coûte une fraction de ce montant, et se fait en une seule visite.",
  },
  {
    q: "Quelles sont les amendes si je ne fais rien?",
    a: "Une installation non conforme peut entraîner des amendes de 500 $ à 1 000 $ par jour jusqu'à la mise aux normes. La date limite pour les piscines existantes est le 30 septembre 2027 — mieux vaut s'y prendre avant la ruée.",
  },
  {
    q: "Ça fonctionne sur une porte-patio coulissante?",
    a: "Oui. Selon votre type de porte (coulissante ou battante), on installe le dispositif de fermeture et de verrouillage automatique approprié, en hauteur, qui se déverrouille de l'intérieur comme de l'extérieur.",
  },
];

export default function PortePatioConformePiscine() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Mise aux normes de porte-patio pour piscine résidentielle",
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
      telephone: COMPANY_INFO.phoneTel,
    },
    areaServed: "Rive-Sud, Montréal, Laval",
    description:
      "Installation d'un dispositif de fermeture et de verrouillage automatique conforme au Règlement sur la sécurité des piscines résidentielles du Québec, sur porte-patio coulissante ou battante.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Porte-patio conforme piscine</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                <i className="fas fa-shield-halved mr-1"></i> Loi sur la sécurité des piscines
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                Piscine + porte-patio :{" "}
                <span className="text-[var(--color-red)]">conforme à la loi, sans clôture.</span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Votre piscine est accessible par une porte-patio? La loi du Québec exige un
                verrou qui se ferme et se verrouille automatiquement, à 1,5 m du sol. On rend
                votre porte-patio conforme en une visite — pour une fraction du prix d&apos;une clôture.
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div>
                  <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">1,5 m</strong>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">verrou en hauteur exigé</span>
                </div>
                <div>
                  <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">500-1000$</strong>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">amende par jour</span>
                </div>
                <div>
                  <strong className="block text-2xl font-extrabold text-[var(--color-red-light)]">30 sept. 2027</strong>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">date limite</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`tel:${COMPANY_INFO.phoneTel}`}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
                >
                  <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
                </a>
                <Link
                  href="/#soumission"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
                >
                  Soumission gratuite
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src="/images/realisations/porte-patio-quincaillerie-remplacement.jpg"
                alt="Technicien Vosthermos ajustant la quincaillerie d'une porte-patio coulissante"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Le problème / la loi */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <span className="section-tag text-[var(--color-red)] text-xs font-bold uppercase tracking-widest">Ce que la loi exige</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 mb-6">
            Une porte-patio qui donne sur la piscine doit se verrouiller seule
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
              <i className="fas fa-lock text-[var(--color-red)] text-xl mb-3"></i>
              <h3 className="font-extrabold mb-2">Verrouillage automatique</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                Un dispositif installé à 1,5 m du sol, hors de portée des jeunes enfants,
                qui se déverrouille de l&apos;intérieur comme de l&apos;extérieur.
              </p>
            </article>
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
              <i className="fas fa-door-closed text-[var(--color-red)] text-xl mb-3"></i>
              <h3 className="font-extrabold mb-2">Fermeture automatique</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                La porte doit se refermer d&apos;elle-même — impossible de la laisser
                ouverte par mégarde et de donner un accès libre au bassin.
              </p>
            </article>
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
              <i className="fas fa-triangle-exclamation text-[var(--color-red)] text-xl mb-3"></i>
              <h3 className="font-extrabold mb-2">Amendes salées</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                De 500 $ à 1 000 $ par jour de non-conformité. La date limite de mise
                aux normes des piscines existantes est le 30 septembre 2027.
              </p>
            </article>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-6 max-w-3xl">
            Référence : Règlement sur la sécurité des piscines résidentielles (Québec).
            Les exigences peuvent varier selon votre municipalité — on valide votre cas lors de la visite.
          </p>
        </div>
      </section>

      {/* Bande visuelle — le dispositif */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 pb-14">
          <div className="grid md:grid-cols-2 items-stretch rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="relative min-h-[260px] aspect-[4/3] md:aspect-auto">
              <Image
                src="/images/quincaillerie/detail-roulette-porte-patio.jpg"
                alt="Mécanisme et quincaillerie d'une porte-patio coulissante"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl font-extrabold mb-3">
                Le dispositif s&apos;installe sur votre porte existante
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                Pas besoin de remplacer la porte-patio. On pose un verrou à fermeture et
                verrouillage automatique en hauteur, conçu autant pour les portes
                coulissantes que battantes. Le même passage nous permet d&apos;ajuster
                les roulettes, le rail et la serrure au besoin.
              </p>
              <Link
                href="/#soumission"
                className="inline-flex items-center gap-2 text-[var(--color-red)] font-bold hover:underline"
              >
                Demander une évaluation <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparaison clôture vs porte-patio */}
      <section className="bg-[var(--color-background)]">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            Pas besoin de clôturer entre la maison et la piscine
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-3xl">
            Quand la porte-patio devient conforme, elle fait partie de l&apos;enceinte
            sécuritaire. Vous économisez le prix et l&apos;espace d&apos;une clôture.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <article className="rounded-2xl border border-[var(--color-border)] bg-white p-8">
              <span className="inline-block bg-red-100 text-red-800 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Clôture entre maison et piscine
              </span>
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-4">
                Des milliers de $
              </p>
              <ul className="space-y-3 text-[var(--color-muted)]">
                <li className="flex gap-3"><i className="fas fa-xmark text-[var(--color-red)] mt-1"></i> Coûteuse à fournir et installer</li>
                <li className="flex gap-3"><i className="fas fa-xmark text-[var(--color-red)] mt-1"></i> Gruge votre espace de terrasse</li>
                <li className="flex gap-3"><i className="fas fa-xmark text-[var(--color-red)] mt-1"></i> Bloque l&apos;accès et la vue vers la cour</li>
              </ul>
            </article>

            <article className="rounded-2xl border-2 border-[var(--color-teal-dark)] bg-white p-8">
              <span className="inline-block bg-[var(--color-teal-dark)] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Porte-patio conforme — notre solution
              </span>
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-4">
                Une fraction du prix
              </p>
              <ul className="space-y-3 text-[var(--color-muted)]">
                <li className="flex gap-3"><i className="fas fa-check text-teal-600 mt-1"></i> Dispositif conforme installé en une visite</li>
                <li className="flex gap-3"><i className="fas fa-check text-teal-600 mt-1"></i> Vous gardez votre porte, votre espace et votre vue</li>
                <li className="flex gap-3"><i className="fas fa-check text-teal-600 mt-1"></i> Posé par le spécialiste nº1 de la porte-patio de la région</li>
                <li className="flex gap-3"><i className="fas fa-check text-teal-600 mt-1"></i> On en profite pour ajuster roulettes, rail et serrure si besoin</li>
              </ul>
              <Link
                href="/#soumission"
                className="inline-flex items-center justify-center gap-2 mt-6 bg-[var(--color-red)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all"
              >
                Obtenir ma soumission gratuite
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-teal-dark)]">
        <div className="max-w-[1200px] mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Rendez votre porte-patio conforme avant l&apos;été
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Envoyez-nous une photo de votre porte-patio par le formulaire — on vous dit
            exactement quel dispositif il faut et combien ça coûte. Soumission gratuite en 24 h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${COMPANY_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg"
            >
              <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
            </a>
            <Link
              href="/#soumission"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
            >
              Remplir le formulaire
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6"
              >
                <h3 className="font-extrabold mb-2">{faq.q}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{faq.a}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/services/remplacement-quincaillerie" className="text-[var(--color-red)] font-bold hover:underline">
              Réparation de quincaillerie de porte-patio
            </Link>
            <Link href="/prix" className="text-[var(--color-red)] font-bold hover:underline">
              Grille de prix
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
