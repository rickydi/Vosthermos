import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Désembuage ou remplacement de vitre thermos? Le comparatif honnête | Vosthermos",
  description:
    `Buée entre les vitres? Désembuage à partir de 80$ ou remplacement de thermos garanti 10 ans : on offre les deux et on vous recommande la moins chère qui règle vraiment votre problème. ${COMPANY_INFO.phone}`,
  keywords:
    "désembuage thermos, désembuage ou remplacement, vitre embuée, buée entre les vitres, remplacement vitre thermos, prix désembuage, prix thermos, Rive-Sud, Montréal, Laval",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/desembuage-ou-remplacement",
  },
  openGraph: {
    type: "website",
    siteName: "Vosthermos",
    url: "https://www.vosthermos.com/desembuage-ou-remplacement",
    title: "Désembuage ou remplacement de thermos? Le comparatif honnête",
    description:
      "On offre les deux services — alors on vous dit franchement lequel choisir selon votre vitre, et on recommande toujours la solution la moins chère qui règle le problème.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
};

const faqs = [
  {
    q: "Combien coûte chaque option?",
    a: "Le désembuage commence à partir de 80$ par unité et le remplacement de vitre thermos à partir de 150$ par unité installée. Le prix exact dépend des dimensions et du type de verre — la soumission est gratuite et vous pouvez joindre des photos.",
  },
  {
    q: "Le désembuage redonne-t-il l'isolation d'origine?",
    a: "Non. Le désembuage élimine la buée et redonne la clarté du vitrage, mais le gaz isolant qui s'est échappé du thermos ne revient pas. Pour retrouver la performance isolante d'origine, il faut un thermos neuf.",
  },
  {
    q: "Comment savoir laquelle choisir?",
    a: "Envoyez une photo de votre vitre via le formulaire de soumission ou appelez-nous. On vérifie si le thermos est récupérable, puis on vous recommande la moins chère des deux options qui règle vraiment votre problème.",
  },
];

const compareRows = [
  {
    situation: "Buée légère et récente, verre intact",
    reco: "Désembuage",
    tone: "teal",
    why: "Le thermos est encore récupérable : on l'assèche et il redevient clair, pour une fraction du prix.",
  },
  {
    situation: "Voile blanchâtre permanent ou dépôts de minéraux",
    reco: "Remplacement",
    tone: "red",
    why: "Les minéraux fusionnés au verre ne partent plus : seul un thermos neuf redonne la clarté.",
  },
  {
    situation: "Verre fissuré, cassé ou scellant très dégradé",
    reco: "Remplacement",
    tone: "red",
    why: "Le désembuage est impossible sur une unité endommagée.",
  },
  {
    situation: "Fenêtre froide, condensation qui revient partout",
    reco: "Remplacement",
    tone: "red",
    why: "C'est un problème d'isolation : un thermos neuf (gaz et scellant neufs) règle la cause.",
  },
  {
    situation: "Budget serré, objectif purement esthétique",
    reco: "Désembuage",
    tone: "teal",
    why: "Si la vitre est récupérable, c'est l'option la plus économique pour retrouver une vue claire.",
  },
];

export default function DesembuageOuRemplacement() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Désembuage ou remplacement</span>
          </div>

          <span className="inline-block bg-white/10 text-[var(--color-red-light)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <i className="fas fa-scale-balanced mr-1"></i> Comparatif honnête
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Vitre embuée : désembuage ou{" "}
            <span className="text-[var(--color-red)]">remplacement de thermos?</span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Vosthermos offre les deux services. On n&apos;a donc aucune raison de vous
            pousser vers l&apos;un ou l&apos;autre : après évaluation, on vous recommande
            la moins chère des deux options qui règle vraiment votre problème.
          </p>

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
              Soumission gratuite avec photos
            </Link>
          </div>
        </div>
      </section>

      {/* Les deux solutions */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <div className="grid md:grid-cols-2 gap-6">
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8">
              <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Option économique
              </span>
              <h2 className="text-2xl font-extrabold mb-1">Désembuage</h2>
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-4">
                à partir de 80$<span className="text-base font-semibold text-[var(--color-muted)]"> / unité</span>
              </p>
              <ul className="space-y-3 text-[var(--color-muted)]">
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  Élimine la buée et redonne la clarté du vitrage
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  Intervention rapide, sans changer la vitre
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  La solution la moins chère quand la vitre est récupérable
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-xmark text-[var(--color-red)] mt-1"></i>
                  Ne redonne pas le gaz isolant perdu ni la performance d&apos;origine
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-xmark text-[var(--color-red)] mt-1"></i>
                  Impossible si minéraux fusionnés, verre fissuré ou scellant fini
                </li>
              </ul>
              <Link
                href="/services/desembuage"
                className="inline-flex items-center gap-2 mt-6 text-[var(--color-red)] font-bold hover:underline"
              >
                Le service de désembuage <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </article>

            <article className="rounded-2xl border-2 border-[var(--color-teal-dark)] bg-white p-8">
              <span className="inline-block bg-[var(--color-teal-dark)] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Règle la cause — garanti 10 ans
              </span>
              <h2 className="text-2xl font-extrabold mb-1">Remplacement de vitre thermos</h2>
              <p className="text-3xl font-extrabold text-[var(--color-red)] mb-4">
                à partir de 150$<span className="text-base font-semibold text-[var(--color-muted)]"> / unité installée</span>
              </p>
              <ul className="space-y-3 text-[var(--color-muted)]">
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  Unité scellée neuve : verre, gaz et scellant neufs
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  Performance isolante restaurée — la buée ne revient pas
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  On garde votre cadre : bien moins cher qu&apos;une fenêtre neuve
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-check text-teal-600 mt-1"></i>
                  Garantie 10 ans, <strong>transférable au prochain propriétaire</strong>
                </li>
                <li className="flex gap-3">
                  <i className="fas fa-xmark text-[var(--color-red)] mt-1"></i>
                  Plus cher que le désembuage quand la vitre était récupérable
                </li>
              </ul>
              <Link
                href="/services/remplacement-vitre-thermos"
                className="inline-flex items-center gap-2 mt-6 text-[var(--color-red)] font-bold hover:underline"
              >
                Le service de remplacement <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Tableau de décision */}
      <section className="bg-[var(--color-background)]">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            Quelle option pour VOTRE vitre?
          </h2>
          <p className="text-[var(--color-muted)] mb-8 max-w-3xl">
            Le bon choix dépend de l&apos;état du thermos, pas du vendeur. Voici la grille
            qu&apos;on applique nous-mêmes lors de l&apos;évaluation à domicile.
          </p>
          <div className="space-y-4">
            {compareRows.map((row) => (
              <div
                key={row.situation}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6 md:flex md:items-center md:gap-6"
              >
                <div className="md:w-2/5">
                  <strong className="block text-[15px]">{row.situation}</strong>
                </div>
                <div className="my-3 md:my-0 md:w-[170px] flex-shrink-0">
                  <span
                    className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      row.tone === "teal"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.reco}
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm md:flex-1">{row.why}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-[var(--color-teal-dark)] p-8 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                Pas certain? Envoyez une photo, on tranche pour vous.
              </h3>
              <p className="text-white/70 max-w-2xl">
                Un technicien vérifie si votre thermos est récupérable avant de recommander
                quoi que ce soit. Si le désembuage suffit, c&apos;est ce qu&apos;on vous proposera.
              </p>
            </div>
            <div className="mt-5 md:mt-0 flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/#soumission"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-6 py-3.5 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all"
              >
                Soumission gratuite
              </Link>
              <a
                href={`tel:${COMPANY_INFO.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 text-white border-2 border-white/30 px-6 py-3.5 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all"
              >
                <i className="fas fa-phone"></i> {COMPANY_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Questions fréquentes</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
            <Link href="/prix" className="text-[var(--color-red)] font-bold hover:underline">
              Voir la grille de prix complète
            </Link>
            <Link href="/garantie" className="text-[var(--color-red)] font-bold hover:underline">
              Notre garantie 10 ans transférable
            </Link>
            <Link href="/outils/reparer-vs-remplacer" className="text-[var(--color-red)] font-bold hover:underline">
              Réparer ou remplacer la fenêtre au complet?
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
