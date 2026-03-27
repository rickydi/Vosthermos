export const metadata = {
  title: "Contact - Vosthermos",
  description: "Contactez-nous pour vos besoins en pièces de portes et fenêtres.",
};

const hours = [
  { day: "Lundi", time: "FERMÉ" },
  { day: "Mardi", time: "10h00 à 17h00" },
  { day: "Mercredi", time: "10h00 à 17h00" },
  { day: "Jeudi", time: "10h00 à 17h00" },
  { day: "Vendredi", time: "10h00 à 17h00" },
  { day: "Samedi", time: "10h00 à 13h00" },
  { day: "Dimanche", time: "FERMÉ" },
];

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
            <h2 className="text-xl font-bold mb-4">Pour nous joindre</h2>
            <ul className="space-y-3 text-[var(--color-muted)]">
              <li>4319 Bélanger Est, Montréal, QC H1T 1A8</li>
              <li>
                Téléphone:{" "}
                <a href="tel:5145257111" className="text-[var(--color-primary)] font-medium hover:underline">
                  (514) 525-7111
                </a>
              </li>
              <li>
                Courriel:{" "}
                <a href="mailto:info@vosthermos.com" className="text-[var(--color-primary)] font-medium hover:underline">
                  info@vosthermos.com
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-xl font-bold mb-4">Heures d&apos;ouverture</h2>
            <ul className="space-y-2">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between">
                  <span className="font-medium">{h.day}</span>
                  <span className={h.time === "FERMÉ" ? "text-red-500" : "text-[var(--color-muted)]"}>
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2 className="text-xl font-bold mb-6">Écrivez-nous</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Courriel</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-light)] transition"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
