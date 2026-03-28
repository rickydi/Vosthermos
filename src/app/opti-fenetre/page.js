import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";

export const metadata = {
  title: "Programme OPTI-FENETRE | Remise a neuf complete | Vosthermos",
  description:
    "Le programme OPTI-FENETRE de Vosthermos : remise a neuf complete de vos portes et fenetres a une fraction du prix du remplacement. Evaluation gratuite, plan personnalise, garantie. Montreal, Rive-Sud, Laval. 514-825-8411.",
  alternates: { canonical: "https://www.vosthermos.com/opti-fenetre" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/opti-fenetre",
    title: "Programme OPTI-FENETRE | Vosthermos",
    description:
      "Remise a neuf complete de vos portes et fenetres. Memes avantages que le remplacement, fraction du prix.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
};

const steps = [
  {
    num: "1",
    icon: "fas fa-clipboard-check",
    title: "Evaluation gratuite",
    desc: "Un expert se deplace chez vous pour inspecter toutes vos portes et fenetres. Il identifie chaque probleme et evalue l'etat general.",
  },
  {
    num: "2",
    icon: "fas fa-file-alt",
    title: "Plan personnalise",
    desc: "Nous preparons un plan detaille des interventions necessaires avec un prix fixe garanti. Pas de surprises, tout est transparent.",
  },
  {
    num: "3",
    icon: "fas fa-tools",
    title: "Execution complete",
    desc: "Notre equipe realise tous les travaux en un minimum de visites : thermos, quincaillerie, coupe-froid, calfeutrage, moustiquaires.",
  },
  {
    num: "4",
    icon: "fas fa-shield-alt",
    title: "Garantie et suivi",
    desc: "Tous les travaux sont couverts par notre garantie. Nous effectuons un suivi pour nous assurer de votre entiere satisfaction.",
  },
];

const included = [
  { icon: "fas fa-snowflake", title: "Remplacement de thermos", desc: "Vitres embuees ou fissurees" },
  { icon: "fas fa-cogs", title: "Quincaillerie", desc: "Poignees, serrures, roulettes" },
  { icon: "fas fa-wind", title: "Coupe-froid", desc: "Joints d'etancheite neufs" },
  { icon: "fas fa-fill-drip", title: "Calfeutrage", desc: "Scellant exterieur et interieur" },
  { icon: "fas fa-border-all", title: "Moustiquaires", desc: "Reparation ou remplacement" },
  { icon: "fas fa-door-open", title: "Portes en bois", desc: "Restauration et ajustement" },
  { icon: "fas fa-eye-slash", title: "Desembuage", desc: "Traitement des vitres embuees" },
  { icon: "fas fa-th-large", title: "Insertion de porte", desc: "Remplacement du vitrage de porte" },
];

const advantages = [
  { icon: "fas fa-piggy-bank", title: "Economisez jusqu'a 70%", desc: "Fraction du cout d'un remplacement complet de fenetres" },
  { icon: "fas fa-clock", title: "Rapide et efficace", desc: "Tous les travaux coordonnes pour un minimum de derangement" },
  { icon: "fas fa-leaf", title: "Ecologique", desc: "Remettre a neuf plutot que jeter — bon pour l'environnement" },
  { icon: "fas fa-certificate", title: "Garantie complete", desc: "Tous les travaux sont couverts par notre garantie Vosthermos" },
  { icon: "fas fa-home", title: "Confort ameliore", desc: "Meilleure isolation thermique et acoustique des votre maison" },
  { icon: "fas fa-dollar-sign", title: "Valeur de revente", desc: "Des portes et fenetres en parfait etat augmentent la valeur de votre propriete" },
];

export default function OptiFenetrePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Programme OPTI-FENETRE",
    description:
      "Programme cle en main de remise a neuf complete de portes et fenetres residentielles. Remplacement de thermos, quincaillerie, coupe-froid, calfeutrage et moustiquaires.",
    url: "https://www.vosthermos.com/opti-fenetre",
    provider: {
      "@type": "LocalBusiness",
      name: "Vosthermos",
      telephone: "+15148258411",
      url: "https://www.vosthermos.com",
    },
    areaServed: [
      { "@type": "City", name: "Montreal" },
      { "@type": "City", name: "Laval" },
      { "@type": "City", name: "Longueuil" },
      { "@type": "City", name: "Brossard" },
      { "@type": "City", name: "Saint-Hyacinthe" },
      { "@type": "City", name: "Granby" },
    ],
  };

  return (
    <div className="pt-[75px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-teal-dark)] via-[#0a6e66] to-[var(--color-teal)] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <i className="fas fa-star text-yellow-400 text-sm"></i>
              <span className="text-white/90 text-sm font-medium">Programme exclusif Vosthermos</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 tracking-tight">
              OPTI-<span className="text-[var(--color-red)]">FENETRE</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 font-light mb-4">
              Remise a neuf complete de vos portes et fenetres
            </p>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10">
              Pourquoi remplacer vos fenetres au complet quand vous pouvez les remettre a neuf
              et profiter des memes avantages a une fraction du prix?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:15148258411"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg"
              >
                <i className="fas fa-phone"></i>
                514-825-8411
              </a>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg"
              >
                <i className="fas fa-file-alt"></i>
                Soumission gratuite
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <div className="bg-white py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Comparez et economisez
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Exemple reel : maison avec 12 fenetres et 2 portes-patio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            {/* Remplacement */}
            <div className="relative rounded-2xl border-2 border-gray-200 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm font-semibold">
                Remplacement complet
              </div>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-black text-gray-400 line-through">18 000$</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Fenetres et portes neuves</p>
              <ul className="text-left space-y-3 text-gray-500 text-sm">
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Cout eleve</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Delais de 4 a 8 semaines</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Travaux majeurs et debris</li>
                <li className="flex items-center gap-2"><i className="fas fa-times text-red-400"></i> Impact environnemental</li>
              </ul>
            </div>

            {/* OPTI-FENETRE */}
            <div className="relative rounded-2xl border-2 border-[var(--color-teal)] p-8 text-center shadow-xl shadow-[var(--color-teal)]/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-teal)] text-white px-4 py-1 rounded-full text-sm font-bold">
                Programme OPTI-FENETRE
              </div>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-black text-[var(--color-teal)]">5 500$</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Remise a neuf complete</p>
              <ul className="text-left space-y-3 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> <strong>Economie de 70%</strong></li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> Execution en 1-2 jours</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> Aucun debris, travaux propres</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[var(--color-teal)]"></i> Ecologique — on remet a neuf</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            * Prix a titre indicatif. Chaque projet est evalue individuellement. Soumission gratuite et sans engagement.
          </p>
        </div>
      </div>

      {/* Interactive Calculator */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Calculez vos economies
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Entrez le nombre de portes et fenetres de votre maison pour voir combien vous pourriez economiser.
            </p>
          </div>
          <SavingsCalculator lang="fr" />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Comment ca fonctionne
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Un processus simple en 4 etapes pour des fenetres comme neuves
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal)] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg shadow-[var(--color-teal)]/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tout est inclus
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Le programme OPTI-FENETRE couvre l'ensemble de vos besoins en un seul forfait
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {included.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-teal)] group-hover:text-white transition-colors">
                  <i className={`${item.icon} text-xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="bg-[var(--color-teal-dark)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Pourquoi choisir OPTI-FENETRE?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((a) => (
              <div key={a.title} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/20 text-[var(--color-red)] flex items-center justify-center mb-4">
                  <i className={`${a.icon} text-lg`}></i>
                </div>
                <h3 className="text-white font-bold mb-2">{a.title}</h3>
                <p className="text-white/50 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Questions frequentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "En quoi consiste exactement le programme OPTI-FENETRE?",
                a: "C'est un programme cle en main qui regroupe tous nos services de reparation en un seul forfait : remplacement de thermos, quincaillerie, coupe-froid, calfeutrage, moustiquaires et restauration de portes. Au lieu de remplacer vos fenetres au complet, on les remet a neuf pour une fraction du prix.",
              },
              {
                q: "Combien est-ce que je peux economiser?",
                a: "En moyenne, le programme OPTI-FENETRE coute 60 a 70% moins cher qu'un remplacement complet. Pour une maison typique avec 12 fenetres et 2 portes, on parle d'une economie d'environ 12 000$.",
              },
              {
                q: "Est-ce que le resultat est aussi bon qu'un remplacement?",
                a: "Dans la majorite des cas, oui. Nous remplacons les elements defectueux (thermos, joints, quincaillerie) tout en conservant les cadres qui sont encore en bon etat. Le resultat : une isolation thermique et acoustique optimale, des mecanismes qui fonctionnent comme du neuf.",
              },
              {
                q: "Combien de temps durent les travaux?",
                a: "Pour une maison standard, les travaux sont generalement completes en 1 a 2 jours. C'est beaucoup plus rapide qu'un remplacement complet qui peut prendre 4 a 8 semaines.",
              },
              {
                q: "Quelles villes desservez-vous?",
                a: "Nous couvrons Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby et tout le territoire dans un rayon de 100 km de notre atelier.",
              },
              {
                q: "Y a-t-il une garantie?",
                a: "Oui, tous les travaux effectues dans le cadre du programme OPTI-FENETRE sont couverts par notre garantie Vosthermos. Les vitres thermos sont garanties 10 ans.",
              },
            ].map((item, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                  <i className="fas fa-chevron-down text-gray-400 text-sm group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-light)] py-16">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pret a remettre vos fenetres a neuf?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Evaluation gratuite et sans engagement. Decouvrez combien vous pouvez economiser
            avec le programme OPTI-FENETRE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-red)] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              <i className="fas fa-phone"></i>
              514-825-8411
            </a>
            <Link
              href="/rendez-vous"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors text-lg"
            >
              <i className="fas fa-calendar-alt"></i>
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
