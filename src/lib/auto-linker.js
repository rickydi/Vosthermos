import { GLOSSARY } from "./glossary-data";
import { PROBLEMS } from "./problems-data";

// Build keyword-to-link map (sorted by length desc so longer matches are tried first)
const LINK_MAP = [];

// Glossary terms
for (const g of GLOSSARY) {
  LINK_MAP.push({ keyword: g.term.toLowerCase(), url: `/glossaire/${g.slug}`, title: g.term });
  for (const aka of g.aka) {
    if (aka.length >= 4) {
      LINK_MAP.push({ keyword: aka.toLowerCase(), url: `/glossaire/${g.slug}`, title: g.term });
    }
  }
}

// Problem short titles
for (const p of PROBLEMS) {
  if (p.shortTitle.length >= 8) {
    LINK_MAP.push({ keyword: p.shortTitle.toLowerCase(), url: `/problemes/${p.slug}`, title: p.shortTitle });
  }
}

// Service keywords
const SERVICE_KEYWORDS = [
  { keywords: ["reparation porte patio montreal", "reparation de porte patio a montreal", "porte patio montreal", "portes patio montreal"], url: "/services/reparation-porte-patio/montreal", title: "Reparation porte patio a Montreal" },
  { keywords: ["vitre thermos embuee montreal", "vitre thermos embuee a montreal", "thermos embue montreal", "fenetre embuee montreal", "desembuage montreal"], url: "/services/desembuage/montreal", title: "Vitre thermos embuee a Montreal" },
  { keywords: ["remplacement de thermos", "remplacer le thermos", "remplacer un thermos"], url: "/services/remplacement-vitre-thermos", title: "Remplacement de thermos" },
  { keywords: ["remplacement de quincaillerie", "quincaillerie de porte", "quincaillerie de fenetre"], url: "/services/remplacement-quincaillerie", title: "Remplacement de quincaillerie" },
  { keywords: ["reparation de porte en bois", "porte en bois", "fenetre en bois", "fenetres en bois", "restauration de porte en bois", "restauration de fenetre en bois", "restauration de portes en bois", "restauration de fenetres en bois", "restauration porte bois", "restauration fenetre bois", "bois pourri", "greffe de bois", "reparation fenetre en bois"], url: "/services/reparation-portes-bois", title: "Restauration et reparation de portes et fenetres en bois" },
  { keywords: ["restauration patrimoine", "fenetre patrimoniale", "fenetres patrimoniales", "fenetre bois ancienne", "restauration fenetre ancienne", "restauration fenetre historique", "re-vitrage", "revitrage"], url: "/services/restauration-fenetres-bois-patrimoine", title: "Restauration de fenetres en bois patrimoniales" },
  { keywords: ["reparation de porte-patio", "reparation porte patio", "porte patio coincee", "roulette de porte patio", "vitre de porte patio"], url: "/services/reparation-porte-patio", title: "Reparation de porte-patio" },
  { keywords: ["reparation de porte-fenetre", "reparation porte fenetre", "porte francaise", "mecanisme multipoint"], url: "/services/reparation-porte-fenetre", title: "Reparation de porte-fenetre" },
  { keywords: ["moustiquaire sur mesure", "moustiquaires sur mesure"], url: "/services/moustiquaires-sur-mesure", title: "Moustiquaires sur mesure" },
  { keywords: ["calfeutrage de fenetre", "calfeutrage exterieur", "refaire le calfeutrage"], url: "/services/calfeutrage", title: "Calfeutrage" },
  { keywords: ["programme opti-fenetre", "opti-fenetre"], url: "/opti-fenetre", title: "Programme OPTI-FENETRE" },
];

for (const s of SERVICE_KEYWORDS) {
  for (const kw of s.keywords) {
    LINK_MAP.push({ keyword: kw, url: s.url, title: s.title });
  }
}

// Sort by keyword length (longest first) to match longer phrases before shorter ones
LINK_MAP.sort((a, b) => b.keyword.length - a.keyword.length);

/**
 * Auto-link keywords in HTML blog content.
 * Only links the first occurrence of each URL to avoid over-linking.
 * Does not link inside existing <a> tags or headings.
 */
export function autoLinkContent(html, maxLinks = 8) {
  if (!html) return html;

  const usedUrls = new Set();
  let linkCount = 0;
  let result = html;

  for (const entry of LINK_MAP) {
    if (linkCount >= maxLinks) break;
    if (usedUrls.has(entry.url)) continue;

    // Create a regex that matches the keyword but NOT inside existing tags
    const escaped = entry.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![<\\/a-zA-Z"=])\\b(${escaped})\\b(?![^<]*>|[^<]*<\\/a>)`, "i");

    const match = result.match(regex);
    if (match) {
      const linked = `<a href="${entry.url}" class="text-[var(--color-teal)] font-medium hover:underline" title="${entry.title}">${match[0]}</a>`;
      result = result.replace(match[0], linked);
      usedUrls.add(entry.url);
      linkCount++;
    }
  }

  return result;
}
