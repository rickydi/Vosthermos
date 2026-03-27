import Link from "next/link";

export const metadata = {
  title: "Services - Vosthermos",
  description: "Pièces de remplacement, verre thermo, moustiquaires sur mesure et plus.",
};

const services = [
  {
    title: "Des milliers de pièces de remplacement",
    description:
      "Avec un vaste choix de plus de 700 pièces pour vos portes et fenêtres, Vosthermos est le leader dans la grande région de Montréal. Avec un service à la clientèle hors pair, vous n'avez qu'à communiquer avec nous et laissez nos conseillers vous guider vers la bonne pièce.",
  },
  {
    title: "Verre thermo, miroir et plexiglass",
    description:
      "Vente de thermo, miroir, verre clair, verre trempé, verre texturé et plexiglass sur mesure. Nous offrons un service de remplacement et de réparation personnalisé pour vous aider à faire le bon choix selon vos besoins.",
  },
  {
    title: "Moustiquaires sur mesure",
    description:
      "Que ce soit pour remplacer un moustiquaire endommagé, pour faire installer un matériel différent ou pour en faire fabriquer sur mesure, nous avons la solution pour tous vos besoins. On peut aussi vous fournir le matériel pour que vous puissiez le faire vous-même.",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Services offerts</h1>
      <p className="text-[var(--color-muted)] mb-12">
        Tout ce dont vous avez besoin pour vos portes et fenêtres.
      </p>

      <div className="space-y-8">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]"
          >
            <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">
              {service.title}
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg mb-4">Besoin d&apos;aide?</p>
        <Link
          href="/contact"
          className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-light)] transition"
        >
          Contactez-nous
        </Link>
      </div>
    </div>
  );
}
