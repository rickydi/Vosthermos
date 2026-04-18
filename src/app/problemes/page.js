import Link from "next/link";
import { PROBLEMS, PROBLEM_CATEGORIES } from "@/lib/problems-data";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Problemes courants de portes et fenetres — Solutions | Vosthermos",
  description:
    `Fenetre embuee, porte patio qui coince, courant d'air, moustiquaire dechiree? Trouvez les causes et solutions pour tous les problemes de portes et fenetres. Experts depuis 15 ans. ${COMPANY_INFO.phone}.`,
  alternates: { canonical: "https://www.vosthermos.com/problemes" },
};

export default function ProblemesPage() {
  return (
    <div className="pt-[80px]">
      <div className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Problemes de portes et fenetres
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Identifiez votre probleme, comprenez les causes et decouvrez les solutions.
            Nos experts sont la pour vous aider.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {PROBLEM_CATEGORIES.map((cat) => {
          const problems = PROBLEMS.filter((p) => p.category === cat.slug);
          if (problems.length === 0) return null;
          return (
            <div key={cat.slug} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 text-[var(--color-teal)] flex items-center justify-center">
                  <i className={`${cat.icon} text-sm`}></i>
                </div>
                {cat.label}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/problemes/${p.slug}`}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-teal)]/10 group-hover:text-[var(--color-teal)] transition-colors">
                      <i className={`${p.icon} text-sm`}></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-teal)] transition-colors">
                        {p.shortTitle}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description.substring(0, 80)}...</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
