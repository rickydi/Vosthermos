import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const problems = [
  {
    icon: "fa-cloud",
    title: "Buee entre les vitres",
    description:
      "Vous voyez de la condensation ou un voile blanchatre entre vos vitres? C'est le signe que le scellant de votre thermos est brise. L'argon s'est echappe et l'humidite s'infiltre.",
    solution: "Remplacement du thermos avec service garanti",
    link: "/services/remplacement-vitre-thermos",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: "fa-lock-open",
    title: "Fenetre ou porte difficile a ouvrir",
    description:
      "Votre porte-patio colle ou votre fenetre ne glisse plus? Les roulettes, mecanismes ou balances sont probablement uses. Un simple remplacement de pieces regle le probleme.",
    solution: "Remplacement de quincaillerie adapte",
    link: "/services/remplacement-quincaillerie",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: "fa-wind",
    title: "Courants d'air et infiltrations",
    description:
      "Vous sentez l'air froid pres de vos fenetres ou portes? Les coupe-froid uses ou le calfeutrage deteriore laissent passer l'air et augmentent votre facture de chauffage.",
    solution: "Remplacement de coupe-froid et calfeutrage",
    link: "/services/remplacement-quincaillerie",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: "fa-bug",
    title: "Moustiquaire dechiree ou manquante",
    description:
      "Une moustiquaire endommagee laisse entrer les insectes et compromet votre confort. Nous fabriquons des moustiquaires sur mesure pour tous types de fenetres et portes.",
    solution: "Fabrication sur mesure rapide",
    link: "/services/moustiquaires-sur-mesure",
    color: "bg-green-50 text-green-600",
  },
];

export default function ProblemsSection() {
  return (
    <section className="bg-white py-20 border-t border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="section-tag">Problemes courants</span>
          <h2 className="text-3xl font-extrabold">
            Reconnaissez-vous <span className="text-[var(--color-red)]">ces symptomes?</span>
          </h2>
          <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
            Voici les problemes les plus frequents que nos clients rencontrent. La bonne nouvelle? Ils sont tous reparables sans remplacer vos fenetres au complet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p) => (
            <Link
              key={p.title}
              href={p.link}
              className="group bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)] hover:border-[var(--color-red)]/30 hover:shadow-lg transition-all"
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center shrink-0`}>
                  <i className={`fas ${p.icon} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--color-red)] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">{p.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span className="font-medium text-[var(--color-teal)]">{p.solution}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-[var(--color-muted)] mb-4">
            Vous ne trouvez pas votre probleme? Contactez-nous, on a probablement la solution.
          </p>
          <a
            href={`tel:${COMPANY_INFO.phoneTel}`}
            className="inline-flex items-center gap-2 bg-[var(--color-teal)] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[var(--color-teal-dark)] transition-all shadow-lg"
          >
            <i className="fas fa-phone text-xs"></i> {COMPANY_INFO.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
