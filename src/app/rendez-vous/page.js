import BookingCalendar from "@/components/BookingCalendar";
import { COMPANY_INFO } from "@/lib/company";

export const metadata = {
  title: "Prendre rendez-vous - Vosthermos",
  description:
    "Prenez rendez-vous en ligne pour vos reparations de portes et fenetres. Service rapide, soumission gratuite.",
};

export default function RendezVousPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
          <span className="section-tag">Rendez-vous</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
            Prendre <span className="text-[var(--color-red)]">rendez-vous</span>
          </h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Planifiez votre rendez-vous en quelques etapes simples. Choisissez votre service,
            une date qui vous convient, et nous vous contacterons pour confirmer.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-[var(--color-red-light)]"></i>
              <span>Reponse rapide</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-[var(--color-red-light)]"></i>
              <span>Soumission gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-[var(--color-red-light)]"></i>
              <span>Service garanti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <BookingCalendar />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-white/60 mb-3">Vous preferez nous appeler directement?</p>
          <a
            href={`tel:${COMPANY_INFO.phoneTel}`}
            className="inline-flex items-center gap-2 text-white font-bold text-xl hover:text-[var(--color-red-light)] transition-colors"
          >
            <i className="fas fa-phone"></i>
            {COMPANY_INFO.phone}
          </a>
        </div>
      </section>
    </>
  );
}
