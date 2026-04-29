const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs");
const outPath = path.join(outDir, "pitch-vente-portail-gestionnaires-vosthermos.pdf");
const logoDark = path.join(root, "public", "images", "Vos-Thermos-Logo.png");
const logoWhite = path.join(root, "public", "images", "Vos-Thermos-Logo_Blanc.png");

fs.mkdirSync(outDir, { recursive: true });

const C = {
  red: "#e30718",
  redDark: "#b00613",
  teal: "#003845",
  teal2: "#0a5664",
  ink: "#10252e",
  muted: "#5f6f78",
  light: "#f4f8fa",
  line: "#d8e1e5",
  softRed: "#fff1f2",
  softTeal: "#e8f5f7",
  white: "#ffffff",
};

function readCompanyInfo() {
  const file = path.join(root, "src", "lib", "company-info.js");
  const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const pick = (key) => {
    const match = source.match(new RegExp(`${key}:\\s*"([^"]*)"`));
    return match?.[1] || "";
  };
  const rbqNumber = pick("rbqNumber");
  return {
    name: pick("legalName") || "Vosthermos",
    phone: pick("phone") || "514-825-8411",
    email: pick("email") || "info@vosthermos.com",
    web: pick("web") || "vosthermos.com",
    address: [pick("address"), pick("city"), pick("province"), pick("postalCode")].filter(Boolean).join(", "),
    rbq: rbqNumber ? `RBQ ${rbqNumber}` : "RBQ 5820-0684-01",
  };
}

const company = readCompanyInfo();

const doc = new PDFDocument({
  size: "LETTER",
  margin: 0,
  info: {
    Title: "Pitch de vente - Portail gestionnaires Vosthermos",
    Author: "Vosthermos",
    Subject: "Argumentaire de vente pour représentants",
  },
});

doc.pipe(fs.createWriteStream(outPath));

let pageNo = 0;

function page() {
  pageNo += 1;
  if (pageNo > 1) doc.addPage({ margin: 0 });
  doc.rect(0, 0, 612, 792).fill(C.white);
}

function footer() {
  doc.save();
  doc.moveTo(48, 742).lineTo(564, 742).strokeColor(C.line).lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(C.muted)
    .text(`${company.name} | ${company.phone} | ${company.email}`, 48, 754, { width: 350 });
  doc.text(`${pageNo}`, 534, 754, { width: 30, align: "right" });
  doc.restore();
}

function logo(x, y, w, white = false) {
  const file = white ? logoWhite : logoDark;
  if (fs.existsSync(file)) {
    doc.image(file, x, y, { width: w });
  } else {
    doc.font("Helvetica-Bold").fontSize(18).fillColor(white ? C.white : C.ink).text("VOSTHERMOS", x, y);
  }
}

function text(t, x, y, options = {}) {
  doc.font(options.font || "Helvetica")
    .fontSize(options.size || 10)
    .fillColor(options.color || C.ink)
    .text(t, x, y, {
      width: options.width || 250,
      align: options.align || "left",
      lineGap: options.lineGap ?? 2,
      continued: options.continued || false,
    });
}

function h1(t, x, y, width = 500, color = C.ink) {
  doc.font("Helvetica-Bold").fontSize(34).fillColor(color).text(t, x, y, {
    width,
    lineGap: -1,
  });
}

function h2(t, x, y, width = 500) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.ink).text(t, x, y, { width });
}

function eyebrow(t, x, y, color = C.red) {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(color).text(t.toUpperCase(), x, y, {
    width: 500,
    characterSpacing: 1.2,
  });
}

function bullet(t, x, y, width = 225, color = C.red) {
  doc.circle(x + 4, y + 6, 3).fill(color);
  doc.font("Helvetica").fontSize(9.5).fillColor(C.ink).text(t, x + 16, y, {
    width,
    lineGap: 2,
  });
  return doc.y + 7;
}

function pill(t, x, y, w, color = C.red, bg = C.softRed) {
  doc.roundedRect(x, y, w, 22, 11).fill(bg);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(color).text(t, x, y + 7, {
    width: w,
    align: "center",
  });
}

function card(x, y, w, h, title, body, opts = {}) {
  doc.roundedRect(x, y, w, h, 10).fill(opts.bg || C.white);
  doc.roundedRect(x, y, w, h, 10).strokeColor(opts.border || C.line).lineWidth(1).stroke();
  if (opts.num) {
    doc.circle(x + 20, y + 22, 12).fill(opts.accent || C.red);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white).text(String(opts.num), x + 13, y + 18, {
      width: 14,
      align: "center",
    });
  }
  const tx = opts.num ? x + 42 : x + 18;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.ink).text(title, tx, y + 16, { width: w - (tx - x) - 14 });
  doc.font("Helvetica").fontSize(9.2).fillColor(C.muted).text(body, tx, y + 38, {
    width: w - (tx - x) - 14,
    lineGap: 2,
  });
}

function stat(x, y, value, label, sub) {
  doc.roundedRect(x, y, 120, 76, 10).fill(C.light);
  doc.font("Helvetica-Bold").fontSize(22).fillColor(C.red).text(value, x + 14, y + 12, { width: 92 });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.ink).text(label.toUpperCase(), x + 14, y + 39, { width: 92 });
  doc.font("Helvetica").fontSize(8).fillColor(C.muted).text(sub, x + 14, y + 54, { width: 92 });
}

// Page 1
page();
doc.rect(0, 0, 612, 792).fill(C.teal);
doc.circle(565, 85, 150).fill("#0b4e5a");
doc.circle(520, 180, 95).fill("#164f5b");
doc.rect(0, 0, 612, 792).fillOpacity(1);
logo(48, 46, 155, true);
pill("DOCUMENT REPRÉSENTANTS", 382, 52, 160, C.white, C.red);
eyebrow("Pitch de vente B2B", 48, 142, C.white);
h1("Portail gestionnaires de copropriétés", 48, 166, 500, C.white);
text(
  "Transformer chaque intervention Vosthermos en outil de suivi clair pour les bâtiments, les unités, les ouvertures, les demandes, les photos et les factures.",
  50,
  275,
  { width: 470, size: 14, color: "#dcebee", lineGap: 5 }
);
doc.roundedRect(48, 390, 516, 152, 16).fill("#0f4a55");
text("POSITIONNEMENT À DIRE AU CLIENT", 76, 420, { width: 430, size: 8, color: "#c4dadd", font: "Helvetica-Bold" });
doc.font("Helvetica-Bold").fontSize(22).fillColor(C.white).text(
  "« On ne vous vend pas seulement une réparation. On vous donne un portail pour gérer le parc de fenêtres de vos copropriétés. »",
  76,
  444,
  { width: 460, lineGap: 3 }
);
stat(64, 600, "1", "Registre vivant", "bâtiments, unités, ouvertures");
stat(198, 600, "0", "Mot de passe", "accès par lien magique sécurisé");
stat(332, 600, "PDF", "Résumé CA", "rapport imprimable pour réunions");
doc.font("Helvetica").fontSize(9).fillColor("#dcebee").text(`${company.address} | ${company.rbq}`, 48, 736, { width: 516, align: "center" });

// Page 2
page();
logo(48, 44, 140);
eyebrow("Pourquoi ça accroche", 48, 108);
h1("Le problème des gestionnaires n'est pas la vitre. C'est le suivi.", 48, 132, 500);
text(
  "Un gestionnaire reçoit des courriels, des photos, des appels de copropriétaires, des questions du CA, des factures et des suivis de fournisseurs. Notre portail centralise ce qui est normalement éparpillé.",
  50,
  228,
  { width: 500, size: 12, color: C.muted, lineGap: 4 }
);
card(48, 310, 160, 130, "Avant Vosthermos", "Photos dans les courriels, demandes imprécises, suivi manuel, historique difficile à retrouver.", { num: 1, bg: "#fff7f7" });
card(226, 310, 160, 130, "Avec le portail", "La demande est liée à la copropriété, au bâtiment, à l'unité et aux ouvertures concernées.", { num: 2, bg: "#f8fbfc", accent: C.teal });
card(404, 310, 160, 130, "Résultat", "Moins d'aller-retour, meilleur suivi, historique clair pour le CA et meilleure perception du service.", { num: 3, bg: "#f6fbf7", accent: "#15935b" });
h2("Phrase de vente simple", 48, 492);
doc.roundedRect(48, 528, 516, 86, 12).fill(C.softTeal).strokeColor("#c9e4e8").stroke();
text(
  "« Votre équipe garde le contrôle : vous voyez ce qui est demandé, ce qui est planifié, ce qui est terminé, les photos et les factures. Tout est classé par copropriété, bâtiment et unité. »",
  74,
  552,
  { width: 460, size: 13, color: C.ink, font: "Helvetica-Bold", lineGap: 4 }
);
h2("Ce que le représentant doit faire comprendre", 48, 654);
let by = 692;
by = bullet("Le portail réduit le temps de gestion et les suivis manuels.", 54, by, 490);
by = bullet("Vosthermos devient un partenaire de gestion, pas seulement un fournisseur.", 54, by, 490);
by = bullet("Le CA reçoit une information plus propre, plus facile à justifier.", 54, by, 490);
footer();

// Page 3
page();
logo(48, 44, 140);
eyebrow("Ce que le portail permet déjà", 48, 108);
h1("Fonctions à démontrer en rendez-vous", 48, 132, 500);
const features = [
  ["Registre de copropriété", "Bâtiments, unités, ouvertures, types, localisation, photos et état."],
  ["Demandes structurées", "Sélection des unités et ouvertures concernées, priorité, date souhaitée et description."],
  ["Suivi des interventions", "Bons actifs, historique récent, timeline, technicien assigné et photos de dossier."],
  ["Factures centralisées", "Montants à payer, payé, échéances, retard, consultation et impression PDF."],
  ["Résumé CA", "Rapport imprimable pour présenter l'état des dossiers et des travaux au conseil."],
  ["Logo du client", "Le portail peut afficher le logo du gestionnaire ou de la copropriété."],
];
let x = 48;
let y = 238;
features.forEach((f, i) => {
  card(x, y, 248, 104, f[0], f[1], { num: i + 1, bg: i % 2 ? C.light : C.white, accent: i % 2 ? C.teal : C.red });
  x += 268;
  if (x > 350) {
    x = 48;
    y += 122;
  }
});
doc.roundedRect(48, 636, 516, 76, 12).fill(C.softRed);
text("Angle de démonstration", 72, 657, { width: 200, size: 9, color: C.red, font: "Helvetica-Bold" });
text(
  "Montrez une unité, ouvrez ses photos et son historique, puis créez une demande d'intervention. C'est là que le client comprend la valeur.",
  72,
  678,
  { width: 460, size: 11.5, color: C.ink, lineGap: 3 }
);
footer();

// Page 4
page();
logo(48, 44, 140);
eyebrow("Script de vente", 48, 108);
h1("Déroulé recommandé pour les représentants", 48, 132, 500);
h2("Accroche 30 secondes", 48, 226);
doc.roundedRect(48, 260, 516, 86, 12).fill(C.light).strokeColor(C.line).stroke();
text(
  "« On sait que gérer les fenêtres d'une copropriété devient vite lourd : courriels, photos, unités, suivis, factures. Avec Vosthermos, vous avez un portail pour tout centraliser et garder un historique propre pour votre CA. »",
  72,
  284,
  { width: 460, size: 12.5, color: C.ink, font: "Helvetica-Bold", lineGap: 4 }
);
h2("Questions de découverte", 48, 386);
let qy = 428;
[
  "Combien de copropriétés gérez-vous actuellement?",
  "Comment vos copropriétaires vous envoient-ils les photos et demandes?",
  "Est-ce facile pour vous de retrouver l'historique d'une unité?",
  "Quand le CA demande un suivi, combien de temps ça prend à préparer?",
  "Avez-vous souvent des demandes incomplètes ou mal localisées?",
].forEach((q) => { qy = bullet(q, 54, qy, 490, C.teal); });
h2("Démonstration en 4 étapes", 48, 578);
card(48, 612, 120, 82, "1. Parc", "Montrer bâtiments, unités, ouvertures.", { num: 1, bg: C.white });
card(180, 612, 120, 82, "2. Photos", "Ouvrir une unité et ses photos.", { num: 2, bg: C.white });
card(312, 612, 120, 82, "3. Demande", "Créer une demande liée à une ouverture.", { num: 3, bg: C.white });
card(444, 612, 120, 82, "4. Rapport", "Afficher Résumé CA / PDF.", { num: 4, bg: C.white });
footer();

// Page 5
page();
logo(48, 44, 140);
eyebrow("Objections et réponses", 48, 108);
h1("Réponses courtes pour conclure", 48, 132, 500);
const objections = [
  ["« On a déjà nos courriels. »", "Justement : le portail évite que l'information reste dispersée dans les courriels. Les photos, unités, bons et factures restent classés au même endroit."],
  ["« On ne veut pas apprendre un logiciel. »", "Il n'y a rien à installer. Le gestionnaire reçoit un lien, ouvre le portail et fait une demande en quelques clics."],
  ["« Est-ce seulement pour les gros immeubles? »", "Non. Même une petite copropriété gagne à garder un historique clair des ouvertures, photos et interventions."],
  ["« Quel est l'avantage face à un autre fournisseur? »", "La plupart font le travail et envoient une facture. Vosthermos ajoute un outil de suivi qui simplifie la gestion."],
];
let oy = 232;
objections.forEach((o) => {
  doc.roundedRect(48, oy, 516, 88, 10).fill(C.white).strokeColor(C.line).stroke();
  text(o[0], 68, oy + 16, { width: 205, size: 11.5, color: C.red, font: "Helvetica-Bold" });
  text(o[1], 290, oy + 16, { width: 250, size: 9.8, color: C.ink, lineGap: 2 });
  oy += 104;
});
h2("Prochaine étape à proposer", 48, 660);
text(
  "« Donnez-nous une première copropriété pilote. On structure le portail avec vos bâtiments et unités, puis vous l'utilisez pour vos prochaines demandes. »",
  50,
  694,
  { width: 500, size: 13, color: C.ink, font: "Helvetica-Bold", lineGap: 4 }
);
footer();

// Page 6
page();
doc.rect(0, 0, 612, 792).fill(C.teal);
logo(48, 48, 155, true);
eyebrow("Fiche rapide représentant", 48, 120, C.white);
h1("Ce qu'il faut retenir", 48, 144, 500, C.white);
const lines = [
  ["On vend quoi?", "Un service premium Vosthermos avec portail de suivi pour copropriétés."],
  ["À qui?", "Gestionnaires, syndicats, conseils d'administration et responsables maintenance."],
  ["Douleur client", "Courriels, photos et suivis dispersés. Historique difficile à retrouver."],
  ["Promesse", "Moins de suivis manuels, demandes plus claires, historique propre pour le CA."],
  ["Démo gagnante", "Unité + photos + demande d'intervention + résumé CA."],
  ["Closing", "Proposer une copropriété pilote pour démarrer rapidement."],
];
let ly = 258;
lines.forEach((row) => {
  doc.roundedRect(48, ly, 516, 58, 10).fill("#0f4a55");
  text(row[0], 72, ly + 15, { width: 130, size: 10, color: "#cfe3e7", font: "Helvetica-Bold" });
  text(row[1], 220, ly + 15, { width: 310, size: 11, color: C.white, font: "Helvetica-Bold", lineGap: 2 });
  ly += 70;
});
doc.roundedRect(48, 690, 516, 48, 10).fill(C.red);
doc.font("Helvetica-Bold").fontSize(13).fillColor(C.white).text(
  `${company.phone} | ${company.email} | ${company.web} | ${company.rbq}`,
  60,
  707,
  { width: 492, align: "center" }
);

doc.end();

console.log(outPath);
