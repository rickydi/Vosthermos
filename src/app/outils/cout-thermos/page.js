import Link from "next/link";
import ThermosCalculatorClient from "@/components/thermos/ThermosCalculatorClient";

const WEBAPP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculateur cout remplacement thermos - Vosthermos",
  description: "Calculateur gratuit pour estimer le cout de remplacement d'une vitre thermos selon sa forme, ses dimensions et ses options.",
  url: "https://www.vosthermos.com/outils/cout-thermos",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  provider: { "@type": "Organization", name: "Vosthermos", url: "https://www.vosthermos.com" },
};

export default function CoutThermosPage() {
  return (
    <main className="min-h-screen bg-[#eaf2f2] pt-[80px] text-[#132127]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSON_LD) }} />

      <ThermosCalculatorClient mode="public" />

      <div className="mx-auto max-w-[1180px] px-6 pb-20">
        <section className="grid overflow-hidden rounded-[28px] border border-[#003845]/15 bg-white shadow-[0_24px_70px_rgba(0,56,69,0.1)] lg:grid-cols-[1.25fr_0.75fr]">
          <article className="p-7 md:p-10">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087484]">Une estimation qui suit vos choix</p>
            <h2 className="max-w-2xl font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">
              Le prix évolue avec chaque thermos dessiné
            </h2>
            <p className="mt-5 max-w-3xl leading-7 text-[#65737b]">
              La forme, les dimensions, le vitrage, le Low-E, l&apos;argon, le verre trempé, les carreaux décoratifs et l&apos;accès influencent tous l&apos;estimation. Les tarifs proviennent du même système que celui utilisé par notre équipe.
            </p>
            <p className="mt-4 max-w-3xl leading-7 text-[#65737b]">
              Le résultat demeure indicatif jusqu&apos;à la validation des mesures sur place. Vous pouvez ensuite demander une soumission gratuite pour obtenir un prix confirmé avant les travaux.
            </p>
          </article>

          <aside className="bg-[#003845] p-7 text-white md:p-10" aria-label="Conseils de mesure">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8edee7]">Avant de mesurer</p>
            <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.02em]">Mesurez le verre visible</h2>
            <ul className="mt-6 space-y-5 text-sm leading-6 text-white/70">
              <li className="border-l-2 border-[#e30718] pl-4"><strong className="block text-white">Largeur puis hauteur</strong>Inscrivez les dimensions en pouces, au seizième près si possible.</li>
              <li className="border-l-2 border-white/20 pl-4"><strong className="block text-white">Un thermos à la fois</strong>Chaque section vitrée du dessin possède ses propres mesures et options.</li>
              <li className="border-l-2 border-white/20 pl-4"><strong className="block text-white">Pas certain d&apos;une option?</strong>Complétez ce que vous connaissez; notre équipe validera le reste avec vous.</li>
            </ul>
          </aside>
        </section>

        <section className="mt-8 flex flex-col gap-5 rounded-[24px] border border-[#003845]/15 bg-[#fffaf2] p-7 md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e30718]">Service local</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.025em]">Remplacement de vitre thermos à Montréal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#65737b]">Prise de mesures, fabrication sur mesure et installation professionnelle dans le Grand Montréal et sur la Rive-Sud.</p>
          </div>
          <Link href="/services/remplacement-vitre-thermos/montreal" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#003845]/20 px-5 text-sm font-bold text-[#003845] transition hover:border-[#003845] hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e30718]/40">
            Voir le service <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </section>

        <section className="mx-auto mt-14 max-w-4xl">
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.03em]">Comment le coût d&apos;un thermos est estimé</h2>
          <div className="mt-5 space-y-4 leading-7 text-[#65737b]">
            <p>Le calcul tient compte de la surface en pieds carrés, mais aussi de la configuration réelle du vitrage et de son installation. Deux fenêtres de même dimension peuvent donc produire des estimations différentes lorsque leurs options ou leur accès ne sont pas identiques.</p>
            <p>Si votre vitre est embuée mais encore récente, le <Link href="/services/desembuage" className="font-semibold text-[#087484] underline decoration-[#087484]/30 underline-offset-4 hover:decoration-[#087484]">désembuage</Link> peut parfois être envisagé. Un technicien pourra confirmer si cette solution convient ou si le remplacement du thermos est préférable.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
