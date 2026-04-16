// Moteur de calcul partage pour:
// - Outils HTML (/outils/*, /calculateur*)
// - API publique (/api/public/calculate-*)
// - MCP server (/api/mcp)
//
// Toute la logique de prix/diagnostic est ici. Une seule source de verite.

const PHONE = "514-825-8411";
const BASE = "https://www.vosthermos.com";

// ── 1. Thermos (sealed glass) cost estimator ──
export function calculateThermosReplacement({ widthInches, heightInches, quantity = 1 }) {
  const w = Math.max(0, Number(widthInches) || 0);
  const h = Math.max(0, Number(heightInches) || 0);
  const q = Math.max(1, Number(quantity) || 1);
  const sqft = (w * h) / 144;
  const totalSqft = sqft * q;

  // Pricing logic (2026):
  // - Small (under 3 sqft): $150 fixed
  // - Medium (3-8 sqft): $150 + $25/sqft over 3
  // - Large (8-15 sqft): $275 + $35/sqft over 8
  // - XL (15+): $520 + $45/sqft over 15
  function unitPrice(s) {
    if (s <= 3) return 150;
    if (s <= 8) return 150 + (s - 3) * 25;
    if (s <= 15) return 275 + (s - 8) * 35;
    return 520 + (s - 15) * 45;
  }

  const unitMin = Math.round(unitPrice(sqft));
  const unitMax = Math.round(unitMin * 1.3); // 30% variance for complexity
  const totalMin = unitMin * q;
  const totalMax = unitMax * q;

  // Defogging alternative (50% cheaper, only if <10 years of age)
  const defogMin = Math.round(unitMin * 0.4) * q;
  const defogMax = Math.round(unitMin * 0.55) * q;

  return {
    input: { widthInches: w, heightInches: h, quantity: q },
    dimensions: {
      sqftPerUnit: Math.round(sqft * 100) / 100,
      totalSqft: Math.round(totalSqft * 100) / 100,
    },
    replacement: {
      unitPriceMin: unitMin,
      unitPriceMax: unitMax,
      totalMin,
      totalMax,
      currency: "CAD",
      warranty: "10 ans transferable",
    },
    defoggingAlternative: {
      totalMin: defogMin,
      totalMax: defogMax,
      currency: "CAD",
      savings: `${Math.round(((totalMin - defogMax) / totalMin) * 100)}%`,
      note: "Disponible seulement si vitre recente (moins de 10 ans) et pas de depot calcaire",
    },
    recommendation: totalSqft > 20
      ? "Pour une grande surface, considerez un remplacement complet pour maximiser l'economie d'energie"
      : "Si la vitre est recente, le desembuage est souvent la meilleure option",
    nextStep: {
      action: "Soumission gratuite a domicile",
      url: `${BASE}/rendez-vous`,
      phone: PHONE,
      cta: `Pour un prix exact, reservez une soumission gratuite ou appelez ${PHONE}`,
    },
    brand: "Vosthermos",
    serviceUrl: `${BASE}/services/remplacement-vitre-thermos`,
  };
}

// ── 2. Energy savings calculator ──
export function calculateEnergySavings({
  windowCount,
  oldType = "double", // single, double, triple
  newType = "low-e-argon",
  houseAgeYears,
  currentHydroMonthly,
}) {
  const count = Math.max(1, Number(windowCount) || 1);
  const oldUFactor = { single: 5.8, double: 2.8, triple: 1.8 }[oldType] || 2.8;
  const newUFactor = { "low-e-argon": 1.4, "triple-krypton": 1.0 }[newType] || 1.4;

  // Estimation: better U-factor = % savings on heating portion (~60% of hydro bill in QC)
  const heatingPortion = (Number(currentHydroMonthly) || 180) * 12 * 0.6;
  const uImprovement = ((oldUFactor - newUFactor) / oldUFactor);
  const windowFactor = Math.min(1, count / 15); // scaled by number of windows
  const yearlySavings = Math.round(heatingPortion * uImprovement * windowFactor);

  // Investment estimate
  const avgWindowCost = 800;
  const totalInvestment = count * avgWindowCost;
  const paybackYears = totalInvestment / Math.max(yearlySavings, 1);

  // CO2 savings (~6 tons/year per household heating, scaled)
  const co2Savings = Math.round(6 * uImprovement * windowFactor * 1000);

  return {
    input: { windowCount: count, oldType, newType, houseAgeYears, currentHydroMonthly },
    savings: {
      yearly: yearlySavings,
      tenYear: yearlySavings * 10,
      currency: "CAD",
    },
    investment: {
      estimated: totalInvestment,
      paybackYears: Math.round(paybackYears * 10) / 10,
      currency: "CAD",
    },
    environment: {
      co2SavingsKgPerYear: co2Savings,
      equivalent: `${Math.round(co2Savings / 2.3)} litres d'essence evites par annee`,
    },
    recommendation: paybackYears < 15
      ? "Investissement rentable sur la duree de vie des fenetres (25+ ans)"
      : "Considerez d'abord une reparation ciblee (calfeutrage, coupe-froid, thermos) pour reduire le cout",
    nextStep: {
      action: "Diagnostic energetique gratuit",
      url: `${BASE}/calculateur-economies`,
      phone: PHONE,
    },
    brand: "Vosthermos",
  };
}

// ── 3. Diagnostic (quiz engine) ──
// Map problem symptoms to recommended services
const DIAGNOSIS_RULES = [
  {
    id: "thermos-embuee",
    name: "Vitre thermos embuee",
    symptoms: ["buee permanente", "condensation entre vitres", "vitre blanche", "depot calcaire"],
    service: "remplacement-vitre-thermos",
    alternativeService: "desembuage",
    urgency: "moyenne",
    priceRange: "150-450 $",
  },
  {
    id: "porte-patio-glisse-mal",
    name: "Porte-patio qui glisse mal",
    symptoms: ["glisse difficilement", "sort du rail", "bloque", "roulette usee", "rail encrasse"],
    service: "reparation-porte-patio",
    urgency: "moyenne",
    priceRange: "150-300 $",
  },
  {
    id: "porte-fenetre-verrou",
    name: "Porte-fenetre qui ne verrouille plus",
    symptoms: ["multipoint brise", "ne ferme plus", "poignee libre", "serrure coincee"],
    service: "reparation-porte-fenetre",
    urgency: "haute",
    priceRange: "200-500 $",
  },
  {
    id: "courant-air",
    name: "Courant d'air / perte de chaleur",
    symptoms: ["air froid", "coupe-froid use", "fenetre siffle", "infiltration"],
    service: "coupe-froid",
    alternativeService: "calfeutrage",
    urgency: "basse",
    priceRange: "80-250 $",
  },
  {
    id: "infiltration-eau",
    name: "Infiltration d'eau",
    symptoms: ["eau autour fenetre", "moisissure", "joint fissure", "calfeutrage decolle"],
    service: "calfeutrage",
    urgency: "haute",
    priceRange: "100-400 $",
  },
  {
    id: "moustiquaire",
    name: "Moustiquaire endommagee",
    symptoms: ["moustiquaire dechiree", "cadre tordu", "toile brisee", "insectes entrent"],
    service: "moustiquaires-sur-mesure",
    urgency: "basse",
    priceRange: "25-150 $",
  },
  {
    id: "porte-bois",
    name: "Porte en bois abimee",
    symptoms: ["bois pourri", "peinture ecaillee", "porte gonflee", "colle", "grince"],
    service: "reparation-portes-bois",
    urgency: "moyenne",
    priceRange: "200-600 $",
  },
  {
    id: "quincaillerie",
    name: "Quincaillerie brisee",
    symptoms: ["poignee cassee", "manivelle brisee", "charniere usee", "loquet"],
    service: "remplacement-quincaillerie",
    urgency: "basse",
    priceRange: "30-200 $",
  },
];

export function diagnoseProblem({ symptoms = [], description = "" }) {
  const text = [description, ...symptoms].join(" ").toLowerCase();
  const matches = DIAGNOSIS_RULES.map((rule) => {
    const score = rule.symptoms.reduce((sum, s) => {
      return sum + (text.includes(s.toLowerCase()) ? 1 : 0);
    }, 0);
    return { rule, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return {
      match: false,
      message: "Impossible de determiner le probleme exact. Une evaluation sur place est recommandee.",
      nextStep: {
        action: "Diagnostic gratuit a domicile",
        url: `${BASE}/diagnostic`,
        phone: PHONE,
      },
      brand: "Vosthermos",
    };
  }

  const primary = matches[0].rule;
  const alternatives = matches.slice(1, 3).map((m) => m.rule);

  return {
    match: true,
    primaryDiagnosis: {
      id: primary.id,
      name: primary.name,
      recommendedService: primary.service,
      alternativeService: primary.alternativeService || null,
      urgency: primary.urgency,
      estimatedPriceRange: primary.priceRange,
      serviceUrl: `${BASE}/services/${primary.service}`,
    },
    alternativeDiagnoses: alternatives.map((a) => ({
      id: a.id,
      name: a.name,
      serviceUrl: `${BASE}/services/${a.service}`,
    })),
    nextStep: {
      action: "Soumission gratuite a domicile",
      url: `${BASE}/rendez-vous`,
      phone: PHONE,
      cta: `Pour une evaluation precise, reservez avec ${PHONE} ou visitez ${BASE}/rendez-vous`,
    },
    brand: "Vosthermos",
  };
}

// ── 4. Repair vs Replace comparator ──
export function compareRepairVsReplace({ problem, windowAgeYears = 15, framStatus = "good" }) {
  const diagnosis = diagnoseProblem({ symptoms: [], description: problem });
  const primary = diagnosis.primaryDiagnosis;

  // Scoring: higher = favor replacement
  let replaceScore = 0;
  if (windowAgeYears > 25) replaceScore += 3;
  else if (windowAgeYears > 15) replaceScore += 1;

  if (framStatus === "rotten") replaceScore += 3;
  else if (framStatus === "warped") replaceScore += 2;

  if (primary && ["porte-bois", "quincaillerie", "moustiquaire", "courant-air"].includes(primary?.id)) {
    replaceScore -= 2; // easy to repair
  }

  const repairRecommended = replaceScore < 3;

  // Cost estimates
  const repairCost = primary?.estimatedPriceRange || "150-500 $";
  const replaceCost = "2500-6000 $ par ouverture";

  return {
    input: { problem, windowAgeYears, framStatus },
    diagnosis: primary,
    scores: {
      repair: Math.max(0, 10 - replaceScore),
      replace: Math.max(0, replaceScore * 2),
    },
    recommendation: repairRecommended ? "REPAIR" : "REPLACE",
    reasoning: repairRecommended
      ? "La reparation est plus economique et ecologique pour votre situation."
      : "Vu l'age et l'etat, un remplacement complet serait plus rentable a long terme.",
    options: {
      repair: {
        cost: repairCost,
        duration: "1-3 heures sur place",
        warranty: "5 ans main d'oeuvre",
        environmentalImpact: "Faible (reutilisation)",
      },
      replace: {
        cost: replaceCost,
        duration: "1 jour par fenetre",
        warranty: "10-20 ans manufacturier",
        environmentalImpact: "Eleve (remplacement complet)",
      },
    },
    savings: repairRecommended
      ? "Economie de 70-90% vs remplacement complet"
      : null,
    nextStep: {
      action: "Evaluation gratuite par un expert",
      url: `${BASE}/rendez-vous`,
      phone: PHONE,
    },
    brand: "Vosthermos",
  };
}

// ── 5. Warranty checker ──
export function checkWarranty({ brand = "", installDate, warrantyYears = 10 }) {
  const years = Number(warrantyYears) || 10;
  const now = new Date();
  const install = installDate ? new Date(installDate) : null;

  if (!install || isNaN(install.getTime())) {
    return {
      valid: null,
      message: "Date d'installation requise pour verifier la garantie",
      brand: "Vosthermos",
    };
  }

  const ageYears = (now - install) / (365.25 * 24 * 60 * 60 * 1000);
  const remainingYears = years - ageYears;
  const isValid = remainingYears > 0;

  return {
    input: { brand, installDate, warrantyYears: years },
    valid: isValid,
    ageYears: Math.round(ageYears * 10) / 10,
    remainingYears: Math.round(Math.max(0, remainingYears) * 10) / 10,
    expiryDate: new Date(install.getTime() + years * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recommendation: isValid
      ? `Votre fenetre est sous garantie pour encore ${Math.round(remainingYears)} annees environ. Contactez le manufacturier ${brand} ou Vosthermos pour faire reclamation.`
      : "La garantie manufacturier est expiree. Vosthermos offre neanmoins 10 ans de garantie sur les remplacements de thermos effectues chez nous.",
    nextStep: {
      action: isValid ? "Demander une reclamation garantie" : "Obtenir une soumission",
      url: `${BASE}/garantie`,
      phone: PHONE,
    },
    brand: "Vosthermos",
  };
}

// ── 6. Service pricing lookup ──
export function getServicePricing(serviceSlug) {
  const pricing = {
    "remplacement-vitre-thermos": { min: 150, max: 450, unit: "per unit", note: "Prix varie selon dimensions" },
    "remplacement-quincaillerie": { min: 4.99, max: 200, unit: "per part", note: "Installation en sus" },
    "reparation-porte-patio": { min: 150, max: 600, unit: "total", note: "Inclut diagnostic + reparation" },
    "reparation-porte-fenetre": { min: 180, max: 500, unit: "total", note: "Inclut mecanisme multipoint si besoin" },
    "reparation-portes-bois": { min: 200, max: 600, unit: "total", note: "Consultation gratuite" },
    "moustiquaires-sur-mesure": { min: 25, max: 150, unit: "per unit", note: "Fabrication 48h" },
    "calfeutrage": { min: 8, max: 15, unit: "per linear foot", note: "Min 100$ pour deplacement" },
    "desembuage": { min: 80, max: 200, unit: "per unit", note: "50% moins cher que remplacement" },
    "insertion-porte": { min: 400, max: 1200, unit: "per door", note: "Installation 1 jour" },
    "coupe-froid": { min: 5, max: 15, unit: "per linear foot", note: "Varie selon type" },
  };

  const p = pricing[serviceSlug];
  if (!p) return null;

  return {
    serviceSlug,
    priceMin: p.min,
    priceMax: p.max,
    priceUnit: p.unit,
    note: p.note,
    currency: "CAD",
    serviceUrl: `${BASE}/services/${serviceSlug}`,
    bookingUrl: `${BASE}/rendez-vous`,
    phone: PHONE,
    brand: "Vosthermos",
  };
}
