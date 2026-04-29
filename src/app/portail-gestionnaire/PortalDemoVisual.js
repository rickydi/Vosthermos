import Image from "next/image";

const captures = [
  {
    title: "Tableau de bord",
    text: "Le client voit ses copropriétés, bâtiments, unités et dossiers actifs.",
    src: "/portail-gestionnaire/tutoriel-assets/capture-dashboard.png",
    alt: "Capture réelle du tableau de bord du portail gestionnaire Vosthermos",
  },
  {
    title: "Fiche unité",
    text: "Chaque unité peut garder ses notes, photos et demandes au même endroit.",
    src: "/portail-gestionnaire/tutoriel-assets/capture-unit-detail.png",
    alt: "Capture réelle d'une fiche unité du portail gestionnaire Vosthermos",
  },
  {
    title: "Interventions",
    text: "Les demandes et interventions restent classées par copropriété et unité.",
    src: "/portail-gestionnaire/tutoriel-assets/capture-interventions.png",
    alt: "Capture réelle de la section interventions du portail gestionnaire Vosthermos",
  },
  {
    title: "Factures",
    text: "Les factures et documents PDF sont retrouvables dans le dossier client.",
    src: "/portail-gestionnaire/tutoriel-assets/capture-factures.png",
    alt: "Capture réelle de la section factures du portail gestionnaire Vosthermos",
  },
];

export default function PortalDemoVisual() {
  const [main, ...secondary] = captures;

  return (
    <div className="pg-demo-visual pg-demo-visual-real" aria-label="Captures réelles du portail gestionnaire">
      <article className="pg-demo-real-main">
        <div className="pg-demo-real-copy">
          <span>Portail réel</span>
          <h3>{main.title}</h3>
          <p>{main.text}</p>
        </div>
        <Image
          src={main.src}
          alt={main.alt}
          width={1280}
          height={900}
          sizes="(max-width: 980px) 100vw, 760px"
        />
      </article>

      <div className="pg-demo-real-stack">
        {secondary.map((capture) => (
          <article className="pg-demo-real-card" key={capture.src}>
            <div>
              <span>{capture.title}</span>
              <p>{capture.text}</p>
            </div>
            <Image
              src={capture.src}
              alt={capture.alt}
              width={1280}
              height={900}
              sizes="(max-width: 980px) 100vw, 320px"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
