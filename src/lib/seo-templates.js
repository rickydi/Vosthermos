import { COMPANY_INFO } from "@/lib/company-info";
// SEO templates optimises pour le CTR (Click-Through-Rate)
// Objectif: convertir les impressions en clics avec des titres et descriptions accrocheurs
//
// Principes:
// - Poser le probleme du client dans la description
// - Inclure un chiffre (prix, annees, pourcentage)
// - Ajouter des points differenciateurs (garantie, rapidite, experience)
// - Call-to-action avec telephone
// - Max 60 chars pour title, 160 chars pour description

export const CITY_SERVICE_SEO = {
  "remplacement-vitre-thermos": {
    title: (c) => `Remplacement Thermos ${c.name} Dès 150$ • Vosthermos`,
    description: (c) => `Thermos embué à ${c.name}? Vosthermos remplace vos vitres dès 150$. ✓ Garantie 10 ans ✓ Soumission gratuite 24h ✓ 15 ans d'expérience ☎ ${COMPANY_INFO.phone}`,
  },
  "remplacement-quincaillerie": {
    title: (c) => `Quincaillerie Portes/Fenêtres ${c.name} Dès 4,99$`,
    description: (c) => `Poignée, serrure, roulette brisée à ${c.name}? Vosthermos a 700+ pièces en stock. Installation pro, service rapide, garantie. ☎ ${COMPANY_INFO.phone}`,
  },
  "reparation-portes-bois": {
    title: (c) => `Réparation & Restauration Portes en Bois ${c.name}`,
    description: (c) => `Porte en bois abîmée à ${c.name}? Sablage, vernissage, peinture et réparation. Économisez 50%+. 15 ans d'expérience ☎ ${COMPANY_INFO.phone}`,
  },
  "reparation-porte-patio": {
    title: (c) => `Réparation Porte-Patio ${c.name} • Roulettes, Vitre`,
    description: (c) => `Porte-patio bloquée à ${c.name}? Roulettes, rails, vitre thermos, coupe-froid. Service à domicile dès 150$ ☎ ${COMPANY_INFO.phone}`,
  },
  "reparation-porte-fenetre": {
    title: (c) => `Réparation Porte-Fenêtre ${c.name} • Multipoint, Vitre`,
    description: (c) => `Porte-fenêtre qui ferme mal à ${c.name}? Mécanisme multipoint, charnières, vitre. Réparation dès 180$. 15 ans d'exp. ☎ ${COMPANY_INFO.phone}`,
  },
  "moustiquaires-sur-mesure": {
    title: (c) => `Moustiquaires sur Mesure ${c.name} • Fabrication 48h`,
    description: (c) => `Moustiquaire déchirée à ${c.name}? Vosthermos fabrique sur mesure en 48h. Toutes dimensions, tous modèles. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  },
  "calfeutrage": {
    title: (c) => `Calfeutrage Fenêtres ${c.name} • Étanchéité Garantie`,
    description: (c) => `Courants d'air à ${c.name}? Vosthermos calfeutre vos fenêtres et portes. Moins de chauffage, plus de confort. 15 ans d'expérience ☎ ${COMPANY_INFO.phone}`,
  },
  "desembuage": {
    title: (c) => `Désembuage Vitres ${c.name} • 50% Moins Cher`,
    description: (c) => `Vitres thermos embuées à ${c.name}? Alternative au remplacement: désembuage dès 80$. Résultat durable et garanti ☎ ${COMPANY_INFO.phone}`,
  },
  "insertion-porte": {
    title: (c) => `Insertion de Porte ${c.name} • Nouvelle Porte 1 Jour`,
    description: (c) => `Nouvelle porte sans refaire le cadre à ${c.name}? Vosthermos installe l'insertion en 1 jour. Économies de 40% vs remplacement ☎ ${COMPANY_INFO.phone}`,
  },
  "coupe-froid": {
    title: (c) => `Coupe-froid Fenêtres ${c.name} • Fin des Courants d'air`,
    description: (c) => `Courants d'air, perte de chaleur à ${c.name}? Vosthermos remplace vos coupe-froids usés. Économisez sur le chauffage ☎ ${COMPANY_INFO.phone}`,
  },
};

// Fallback pour services sans template specifique
export function getServiceSeo(serviceSlug, city, fallbackShortTitle) {
  const tpl = CITY_SERVICE_SEO[serviceSlug];
  if (tpl) {
    return {
      title: tpl.title(city),
      description: tpl.description(city),
    };
  }
  // Fallback generic mais quand meme ameliore
  return {
    title: `${fallbackShortTitle} ${city.name} • Vosthermos`,
    description: `${fallbackShortTitle} à ${city.name}, ${city.region}. Service professionnel Vosthermos. 15 ans d'expérience, soumission gratuite 24h ☎ ${COMPANY_INFO.phone}`,
  };
}

// Pour les pages generalistes (non-service specifique)
export const CITY_PAGE_SEO = {
  "reparation-portes-et-fenetres": {
    title: (c) => `Réparation Portes et Fenêtres ${c.name} • Dès 150$`,
    description: (c) => `Thermos embué, porte bois, quincaillerie à ${c.name}? Vosthermos répare tout en 24-48h. 740+ pièces en stock, 15 ans d'expérience ☎ ${COMPANY_INFO.phone}`,
  },
  "calfeutrage": {
    title: (c) => `Calfeutrage ${c.name} • Infiltrations Éliminées`,
    description: (c) => `Courants d'air, pluie, infiltrations à ${c.name}? Calfeutrage pro par Vosthermos. Intérieur/extérieur, tous matériaux. Soumission gratuite ☎ ${COMPANY_INFO.phone}`,
  },
};
