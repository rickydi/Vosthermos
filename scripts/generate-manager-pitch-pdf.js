const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const docsDir = path.join(root, "docs");
const publicDocsDir = path.join(root, "public", "documents");
const tempDir = path.join(docsDir, ".pitch-tmp");
const htmlPath = path.join(tempDir, "pitch-vente-portail-gestionnaires-vosthermos.html");
const pdfPath = path.join(docsDir, "pitch-vente-portail-gestionnaires-vosthermos.pdf");
const publicPdfPath = path.join(publicDocsDir, "pitch-vente-portail-gestionnaires-vosthermos.pdf");
const keepTemp = process.env.KEEP_PITCH_TEMP === "1";

function toFileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
}

function readCompanyInfo() {
  const file = path.join(root, "src", "lib", "company-info.js");
  const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const pick = (key, fallback = "") => {
    const match = source.match(new RegExp(`${key}:\\s*"([^"]*)"`));
    return match?.[1] || fallback;
  };
  const rbq = pick("rbqNumber", "5820-0684-01");
  return {
    phone: pick("phone", "514-825-8411"),
    email: pick("email", "info@vosthermos.com"),
    web: pick("web", "vosthermos.com"),
    address: [pick("address"), pick("city"), pick("province"), pick("postalCode")].filter(Boolean).join(", "),
    rbq: `RBQ ${rbq}`,
  };
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Chrome ou Edge introuvable. Definis CHROME_PATH ou installe Chrome/Edge.");
  }
  return found;
}

function resetTempDir() {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
}

function cleanupTempDir() {
  if (!keepTemp) fs.rmSync(tempDir, { recursive: true, force: true });
}

function activatePortalTab(source, tab) {
  const labels = {
    dashboard: "Tableau de bord",
    interventions: "Interventions",
    factures: "Factures",
  };
  const tabs = ["dashboard", "interventions", "plan", "factures", "documents", "parametres"];
  let html = source;

  for (const name of tabs) {
    html = html.replace(new RegExp(`class="nav-item active" data-tab="${name}"`, "g"), `class="nav-item" data-tab="${name}"`);
    html = html.replace(new RegExp(`class="panel active" id="tab-${name}"`, "g"), `class="panel" id="tab-${name}"`);
  }

  html = html.replace(`class="nav-item" data-tab="${tab}"`, `class="nav-item active" data-tab="${tab}"`);
  html = html.replace(`class="panel" id="tab-${tab}"`, `class="panel active" id="tab-${tab}"`);
  html = html.replace(/<span class="current" id="crumb">[^<]*<\/span>/, `<span class="current" id="crumb">${labels[tab] || "Portail"}</span>`);
  return html;
}

function preparePortalMockup(source) {
  const logoWhite = toFileUrl(path.join(root, "public", "images", "Vos-Thermos-Logo_Blanc.png"));
  return source
    .replace("</style>", `
  .brand-logo-img {
    display: block;
    width: 82px;
    height: auto;
  }
</style>`)
    .replace('<div class="brand-logo">VOS<span>THERMOS</span></div>', `<img class="brand-logo-img" src="${logoWhite}" alt="Vosthermos">`)
    .replaceAll("Le Marronnier", "Copro Saint-François")
    .replaceAll("lemarronnier.ca", "vosthermos.com")
    .replaceAll("Laval · 18 unités", "Delson · 18 unités")
    .replaceAll("Yannis D'Almeida", "Compte démo")
    .replaceAll("ydalmeida@vosthermos.com", "demo@vosthermos.com");
}

function createPortalShot(chrome, tab) {
  const mockupPath = path.join(root, "mockups", "gestionnaire-dashboard.html");
  if (!fs.existsSync(mockupPath)) throw new Error(`Mockup introuvable: ${mockupPath}`);

  const htmlFile = path.join(tempDir, `portal-${tab}.html`);
  const pngFile = path.join(tempDir, `portal-${tab}.png`);
  const html = activatePortalTab(preparePortalMockup(fs.readFileSync(mockupPath, "utf8")), tab);
  fs.writeFileSync(htmlFile, html, "utf8");

  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--run-all-compositor-stages-before-draw",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=1400,1000",
    "--virtual-time-budget=1000",
    `--screenshot=${pngFile}`,
    toFileUrl(htmlFile),
  ], { stdio: "ignore", timeout: 30000 });

  return `data:image/png;base64,${fs.readFileSync(pngFile).toString("base64")}`;
}

function createPortalShots(chrome) {
  return {
    dashboard: createPortalShot(chrome, "dashboard"),
    interventions: createPortalShot(chrome, "interventions"),
    factures: createPortalShot(chrome, "factures"),
  };
}

function buildHtml(company, shots) {
  const logoRed = toFileUrl(path.join(root, "public", "images", "Vos-Thermos-Logo.png"));
  const logoWhite = toFileUrl(path.join(root, "public", "images", "Vos-Thermos-Logo_Blanc.png"));
  const portalUrl = "https://www.vosthermos.com/portail-gestionnaire";
  const tutorialUrl = "https://www.vosthermos.com/portail-gestionnaire/tutoriel.html";

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Pitch de vente - Portail gestionnaires Vosthermos</title>
<style>
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e8edf0; color: #10252e; font-family: Arial, Helvetica, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page {
    position: relative;
    width: 8.5in;
    height: 11in;
    padding: .58in .62in;
    background: #fff;
    page-break-after: always;
    overflow: hidden;
  }
  .cover { background: #003845; color: #fff; }
  .cover::after {
    content: "";
    position: absolute;
    right: -1.1in;
    top: -1.0in;
    width: 4.6in;
    height: 4.6in;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
  }
  .logo { width: 1.82in; height: auto; display: block; }
  .topline { display: flex; align-items: center; justify-content: space-between; margin-bottom: .46in; }
  .pill {
    display: inline-flex;
    align-items: center;
    min-height: .29in;
    padding: .07in .17in;
    border-radius: 999px;
    background: #e30718;
    color: #fff;
    font-size: 8.5pt;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .eyebrow {
    color: #e30718;
    font-size: 8.5pt;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    margin: 0 0 .12in;
  }
  .cover .eyebrow { color: #bde1e7; }
  h1 { margin: 0; font-size: 31pt; line-height: 1.03; letter-spacing: -.01em; max-width: 6.9in; }
  h1.tight { font-size: 28pt; }
  h2 { margin: 0 0 .20in; font-size: 20pt; line-height: 1.12; }
  h3 { margin: 0 0 .08in; font-size: 12pt; line-height: 1.2; }
  p { margin: 0; font-size: 10.5pt; line-height: 1.45; color: #5f6f78; }
  .cover p { color: #d7e9ed; font-size: 13.2pt; line-height: 1.45; max-width: 6.45in; }
  .cover-quote {
    margin-top: .58in;
    padding: .28in;
    border-left: .08in solid #e30718;
    background: rgba(255,255,255,.08);
    border-radius: .12in;
    max-width: 6.9in;
  }
  .cover-quote strong { display: block; font-size: 18pt; line-height: 1.22; }
  .cover-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: .18in; margin-top: .58in; }
  .cover-stat { background: rgba(255,255,255,.11); border-radius: .12in; padding: .18in; min-height: .86in; }
  .cover-stat b { display: block; font-size: 19pt; color: #fff; margin-bottom: .04in; }
  .cover-stat span { display: block; font-size: 8.7pt; color: #cfe3e7; line-height: 1.25; }
  .cover-link-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .14in;
    margin-top: .28in;
  }
  .cover-link {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: .18in;
    padding: .15in .18in;
    border-radius: .12in;
    background: #e30718;
    color: #fff;
    font-size: 10.4pt;
    line-height: 1.2;
    font-weight: 800;
    text-decoration: none;
    min-height: .72in;
  }
  .cover-link strong { display: block; font-size: 13pt; letter-spacing: .04em; text-transform: uppercase; margin-bottom: .04in; }
  .cover-link span { color: rgba(255,255,255,.84); font-size: 8.5pt; font-weight: 700; }
  .footer {
    position: absolute;
    left: .62in;
    right: .62in;
    bottom: .34in;
    display: flex;
    justify-content: space-between;
    gap: .2in;
    border-top: 1px solid #d8e1e5;
    padding-top: .11in;
    color: #718088;
    font-size: 8pt;
  }
  .cover .footer { color: #cfe3e7; border-color: rgba(255,255,255,.22); }
  .intro { max-width: 6.95in; font-size: 11.6pt; line-height: 1.43; margin: .16in 0 .30in; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: .24in; }
  .card {
    border: 1px solid #d8e1e5;
    border-radius: .12in;
    padding: .18in;
    background: #fff;
    min-height: 1.04in;
  }
  .card.red { background: #fff3f4; border-color: #f5c8cd; }
  .card.teal { background: #edf8fa; border-color: #c9e4e8; }
  .card h3 { color: #10252e; }
  .num {
    display: inline-flex;
    width: .28in;
    height: .28in;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background: #e30718;
    color: #fff;
    font-size: 9pt;
    font-weight: 800;
    margin-right: .08in;
  }
  ul.clean { margin: .12in 0 0; padding: 0; list-style: none; }
  ul.clean li { position: relative; padding-left: .20in; margin: 0 0 .09in; font-size: 9.8pt; line-height: 1.34; color: #31444d; }
  ul.clean li::before { content: ""; position: absolute; left: 0; top: .12in; width: .06in; height: .06in; border-radius: 50%; background: #e30718; }
  .target-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .16in; margin-top: .18in; }
  .target-card {
    display: grid;
    grid-template-columns: .50in 1fr;
    gap: .14in;
    padding: .18in;
    border: 1px solid #d8e1e5;
    border-radius: .12in;
    background: #f6fafb;
    min-height: 1.45in;
  }
  .target-letter {
    width: .42in;
    height: .42in;
    border-radius: .10in;
    background: #003845;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }
  .target-card p { font-size: 9.6pt; line-height: 1.35; }
  .seller-line {
    margin-top: .20in;
    padding: .20in .24in;
    border-radius: .12in;
    background: #003845;
    color: #fff;
    font-size: 12.2pt;
    line-height: 1.35;
    font-weight: 800;
  }
  .seller-line span { color: #bde1e7; }
  .feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: .12in; margin-top: .16in; }
  .feature {
    display: grid;
    grid-template-columns: .40in 1fr;
    gap: .12in;
    align-items: start;
    padding: .125in;
    border-radius: .11in;
    background: #f4f8fa;
    border: 1px solid #d8e1e5;
  }
  .feature .icon { width: .34in; height: .34in; border-radius: .09in; background: #003845; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 9pt; }
  .feature h3 { font-size: 10.8pt; margin-bottom: .04in; }
  .feature p { font-size: 8.9pt; line-height: 1.30; }
  .quote {
    margin-top: .24in;
    padding: .20in .24in;
    background: #edf8fa;
    border-left: .07in solid #003845;
    border-radius: .08in;
    color: #10252e;
    font-size: 13.5pt;
    font-weight: 800;
    line-height: 1.32;
  }
  .quote.tight { margin-top: .18in; padding: .16in .20in; font-size: 11.2pt; line-height: 1.27; }
  .shot-frame {
    margin-top: .18in;
    border-radius: .12in;
    border: 1px solid #d4dde2;
    background: #f3f7f9;
    padding: .09in;
    box-shadow: 0 .08in .22in rgba(16,37,46,.10);
  }
  .shot-img {
    display: block;
    width: 100%;
    height: 4.58in;
    object-fit: cover;
    object-position: top left;
    border-radius: .08in;
    border: 1px solid #dbe4e8;
  }
  .shot-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: .10in; margin-top: .13in; }
  .shot-note {
    padding: .10in .11in;
    border-radius: .10in;
    background: #f6fafb;
    border: 1px solid #d8e1e5;
    min-height: .66in;
  }
  .shot-note b { display: block; font-size: 8.9pt; margin-bottom: .03in; color: #10252e; }
  .shot-note span { display: block; font-size: 7.9pt; line-height: 1.25; color: #5f6f78; }
  .script-block { display: grid; gap: .13in; margin-top: .20in; }
  .script-block .card { min-height: auto; padding: .16in; }
  .script-block p, .script-block li { font-size: 9.4pt; }
  .objection { display: grid; grid-template-columns: 2.05in 1fr; gap: .17in; padding: .145in .16in; border: 1px solid #d8e1e5; border-radius: .12in; margin-bottom: .10in; }
  .objection strong { color: #e30718; font-size: 10.2pt; line-height: 1.22; }
  .objection p { font-size: 9pt; line-height: 1.33; }
  .quick { background: #003845; color: #fff; }
  .quick .eyebrow { color: #bde1e7; }
  .quick-grid { display: grid; gap: .08in; margin-top: .22in; }
  .quick-row { display: grid; grid-template-columns: 1.52in 1fr; gap: .16in; padding: .11in .15in; border-radius: .12in; background: rgba(255,255,255,.10); }
  .quick-row b { color: #bde1e7; font-size: 8.6pt; text-transform: uppercase; letter-spacing: .06em; }
  .quick-row span { color: #fff; font-size: 10.1pt; font-weight: 800; line-height: 1.2; }
  .quick-row a { color: #fff; text-decoration: none; font-size: 10.1pt; font-weight: 800; line-height: 1.2; }
  .quick-click {
    display: inline-block;
    background: #e30718;
    color: #fff;
    border-radius: .09in;
    padding: .08in .12in;
    margin-bottom: .05in;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .contact-bar {
    position: absolute;
    left: .62in;
    right: .62in;
    bottom: 1.06in;
    min-height: .42in;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e30718;
    color: #fff;
    border-radius: .12in;
    padding: .12in .18in;
    text-align: center;
    font-size: 10.4pt;
    line-height: 1.2;
    font-weight: 800;
  }
</style>
</head>
<body>

<section class="page cover" id="p1">
  <div class="topline">
    <img class="logo" src="${logoWhite}" alt="Vosthermos">
    <div class="pill">Document représentants</div>
  </div>
  <div class="eyebrow">Pitch de vente B2B</div>
  <h1>Portail gestionnaires de copropriétés</h1>
  <p class="intro">Un portail gratuit inclus avec le service Vosthermos pour aider les gestionnaires, syndicats et partenaires en fenestration à suivre bâtiments, unités, ouvertures, demandes, photos, factures et rapports.</p>
  <div class="cover-quote">
    <strong>« On ne vous vend pas seulement une réparation. On vous donne un outil pour mieux gérer le parc de fenêtres de vos copropriétés. »</strong>
  </div>
  <div class="cover-stats">
    <div class="cover-stat"><b>1</b><span>registre vivant par copropriété</span></div>
    <div class="cover-stat"><b>Gratuit</b><span>inclus avec le service Vosthermos</span></div>
    <div class="cover-stat"><b>B2B</b><span>gestionnaires, syndicats, manufacturiers</span></div>
  </div>
  <div class="cover-link-grid">
    <a class="cover-link" href="${portalUrl}">
      <strong>Cliquez ici</strong>
      Voir la page du portail
      <span>${portalUrl}</span>
    </a>
    <a class="cover-link" href="${tutorialUrl}" style="background:#0a697e;">
      <strong>Cliquez ici</strong>
      Voir le tutoriel animé
      <span>${tutorialUrl}</span>
    </a>
  </div>
  <div class="footer"><span>${company.address}</span><span>${company.rbq}</span></div>
</section>

<section class="page" id="p2">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Pourquoi ça vend</div></div>
  <div class="eyebrow">Le vrai problème client</div>
  <h1>Le problème n'est pas seulement la vitre. C'est le suivi.</h1>
  <p class="intro">Les clients B2B ne veulent pas perdre du temps à chercher des photos, des courriels, des unités ou des factures. Le portail transforme l'intervention en dossier clair et consultable.</p>
  <div class="two-col">
    <div class="card red">
      <h3>Sans portail</h3>
      <ul class="clean">
        <li>Photos dispersées dans les courriels et textos.</li>
        <li>Demandes imprécises ou mal localisées.</li>
        <li>Suivis manuels auprès du fournisseur.</li>
        <li>Historique difficile à retrouver pour le CA.</li>
        <li>Factures et bons séparés du contexte terrain.</li>
      </ul>
    </div>
    <div class="card teal">
      <h3>Avec Vosthermos</h3>
      <ul class="clean">
        <li>Dossiers classés par copropriété, bâtiment et unité.</li>
        <li>Photos et ouvertures rattachées au bon endroit.</li>
        <li>Demandes envoyées avec priorité et détails.</li>
        <li>Historique, factures et interventions centralisés.</li>
        <li>Résumé imprimable pour les rencontres du CA.</li>
      </ul>
    </div>
  </div>
  <div class="quote">Promesse à retenir : moins de suivis manuels, moins d'information perdue, plus de clarté pour le gestionnaire et son conseil.</div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>2</span></div>
</section>

<section class="page" id="p3">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">À qui vendre</div></div>
  <div class="eyebrow">Cibles prioritaires</div>
  <h1 class="tight">Qui peut acheter ou référer ce service?</h1>
  <p class="intro">Le portail sert à vendre la réparation, mais aussi à accrocher des partenaires qui ont des clients de fenêtres sans vouloir gérer le service après-vente.</p>
  <div class="target-grid">
    <div class="target-card"><div class="target-letter">G</div><div><h3>Gestionnaires de copropriétés</h3><p>Ils veulent centraliser les demandes, réduire les appels et retrouver rapidement l'historique d'une unité.</p></div></div>
    <div class="target-card"><div class="target-letter">CA</div><div><h3>Syndicats et conseils</h3><p>Ils veulent des preuves visuelles, des rapports simples et une vision claire des travaux à faire.</p></div></div>
    <div class="target-card"><div class="target-letter">M</div><div><h3>Maintenance d'immeubles</h3><p>Ils ont besoin d'un registre propre pour planifier, prioriser et suivre les interventions terrain.</p></div></div>
    <div class="target-card"><div class="target-letter">F</div><div><h3>Manufacturiers / installateurs</h3><p>Ils vendent ou installent des fenêtres, mais n'offrent pas toujours la réparation. Vosthermos devient leur partenaire de service.</p></div></div>
  </div>
  <div class="seller-line"><span>Phrase à dire :</span> Vous gardez votre relation client et votre image; Vosthermos prend le service terrain, les réparations, les photos et le suivi.</div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>3</span></div>
</section>

<section class="page" id="p4">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Démonstration</div></div>
  <div class="eyebrow">Fonctions à montrer</div>
  <h1>Ce que le portail permet déjà de vendre</h1>
  <p class="intro">Le représentant doit faire une démonstration courte : ouvrir une copropriété, montrer une unité, ses ouvertures, ses photos, puis créer une demande d'intervention.</p>
  <div class="feature-list">
    <div class="feature"><div class="icon">1</div><div><h3>Registre de copropriété</h3><p>Bâtiments, unités, ouvertures, types, localisation, photos et état.</p></div></div>
    <div class="feature"><div class="icon">2</div><div><h3>Demandes structurées</h3><p>Unités concernées, priorité, date souhaitée et description.</p></div></div>
    <div class="feature"><div class="icon">3</div><div><h3>Suivi des interventions</h3><p>Bons actifs, historique récent, technicien assigné et photos.</p></div></div>
    <div class="feature"><div class="icon">4</div><div><h3>Factures centralisées</h3><p>Montants à payer, payé, échéances, consultation et PDF.</p></div></div>
    <div class="feature"><div class="icon">5</div><div><h3>Résumé CA</h3><p>Rapport imprimable pour présenter dossiers, travaux et factures.</p></div></div>
    <div class="feature"><div class="icon">6</div><div><h3>Logo client</h3><p>Le portail peut afficher le logo du client ou de la copropriété.</p></div></div>
    <div class="feature"><div class="icon">7</div><div><h3>Historique avec photos</h3><p>Photos avant/après, notes et interventions rattachées à l'unité.</p></div></div>
    <div class="feature"><div class="icon">8</div><div><h3>Partenaire manufacturier</h3><p>Solution de service pour fabricants sans équipe de réparation.</p></div></div>
  </div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>4</span></div>
</section>

<section class="page" id="p5">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Capture portail</div></div>
  <div class="eyebrow">Vue 1</div>
  <h1 class="tight">Tableau de bord : les priorités au même endroit</h1>
  <p class="intro">Cette vue sert à montrer que le gestionnaire sait rapidement quoi suivre : notifications, bons actifs, factures et état du parc par bâtiment.</p>
  <div class="shot-frame"><img class="shot-img" src="${shots.dashboard}" alt="Capture du tableau de bord du portail"></div>
  <div class="shot-notes">
    <div class="shot-note"><b>Priorités visibles</b><span>Factures, soumissions et interventions ressortent sans chercher dans les courriels.</span></div>
    <div class="shot-note"><b>Parc par bâtiment</b><span>Chaque unité a un statut clair : terminé, actif ou aucun dossier.</span></div>
    <div class="shot-note"><b>Action rapide</b><span>Le bouton de demande d'intervention lance un dossier structuré.</span></div>
  </div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>5</span></div>
</section>

<section class="page" id="p6">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Capture portail</div></div>
  <div class="eyebrow">Vue 2</div>
  <h1 class="tight">Interventions : calendrier, technicien et historique</h1>
  <p class="intro">Le portail aide le client à savoir ce qui est prévu, ce qui est en cours et ce qui vient d'être terminé, sans relancer l'équipe au téléphone.</p>
  <div class="shot-frame"><img class="shot-img" src="${shots.interventions}" alt="Capture des interventions du portail"></div>
  <div class="shot-notes">
    <div class="shot-note"><b>Planification claire</b><span>Les dates et événements à venir sont visibles dans une seule vue.</span></div>
    <div class="shot-note"><b>Contexte terrain</b><span>Unités, bâtiment, technicien et notes restent attachés au bon dossier.</span></div>
    <div class="shot-note"><b>Historique utile</b><span>Les travaux terminés restent consultables pour le CA ou la maintenance.</span></div>
  </div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>6</span></div>
</section>

<section class="page" id="p7">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Capture portail</div></div>
  <div class="eyebrow">Vue 3</div>
  <h1 class="tight">Factures : montants, statut et documents PDF</h1>
  <p class="intro">La facturation centralisée donne au gestionnaire une vue propre pour payer, imprimer, retrouver les PDF et répondre aux questions du conseil.</p>
  <div class="shot-frame"><img class="shot-img" src="${shots.factures}" alt="Capture des factures du portail"></div>
  <div class="shot-notes">
    <div class="shot-note"><b>Montants à payer</b><span>Les soldes ouverts et les factures payées sont séparés clairement.</span></div>
    <div class="shot-note"><b>Documents simples</b><span>Le client peut consulter ou télécharger les PDF quand il en a besoin.</span></div>
    <div class="shot-note"><b>Moins de relances</b><span>L'information comptable est accessible sans demander un renvoi par courriel.</span></div>
  </div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>7</span></div>
</section>

<section class="page" id="p8">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Script</div></div>
  <div class="eyebrow">Déroulé recommandé</div>
  <h1>Script simple pour le représentant</h1>
  <div class="script-block">
    <div class="card teal">
      <h3><span class="num">1</span>Accroche 30 secondes</h3>
      <p>« On sait que gérer les fenêtres d'une copropriété devient vite lourd : courriels, photos, unités, suivis, factures. Avec Vosthermos, vous avez un portail pour tout centraliser. »</p>
    </div>
    <div class="card">
      <h3><span class="num">2</span>Questions de découverte</h3>
      <ul class="clean">
        <li>Combien de copropriétés ou immeubles gérez-vous?</li>
        <li>Comment recevez-vous les photos et demandes des propriétaires?</li>
        <li>Est-ce facile de retrouver l'historique d'une unité?</li>
        <li>Recevez-vous des demandes de réparation que vous devez référer ailleurs?</li>
      </ul>
    </div>
    <div class="card red">
      <h3><span class="num">3</span>Démonstration gagnante</h3>
      <p>Montrer le tableau de bord, ouvrir le parc de fenêtres, créer une demande d'intervention, puis montrer les factures et le résumé CA.</p>
    </div>
    <div class="card">
      <h3><span class="num">4</span>Variante manufacturier</h3>
      <p>« Quand un client vous rappelle pour un thermos embué, une roulette ou une quincaillerie, vous pouvez nous référer le service au lieu de perdre du temps sur la réparation. »</p>
    </div>
  </div>
  <div class="quote tight">Phrase de conclusion : « Donnez-nous une première copropriété pilote ou quelques références de service, et on vous montre comment le suivi devient plus simple. »</div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>8</span></div>
</section>

<section class="page" id="p9">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Objections</div></div>
  <div class="eyebrow">Réponses rapides</div>
  <h1>Répondre sans trop parler</h1>
  <p class="intro">L'objectif n'est pas de vendre un logiciel. C'est de montrer que Vosthermos simplifie la gestion des travaux, des suivis et du service après-vente.</p>
  <div class="objection"><strong>« On a déjà nos courriels. »</strong><p>Justement. Le portail évite que les photos, demandes, unités et factures restent dispersées dans les courriels.</p></div>
  <div class="objection"><strong>« On ne veut pas apprendre un logiciel. »</strong><p>Il n'y a rien à installer. Le gestionnaire reçoit un lien et fait une demande en quelques clics.</p></div>
  <div class="objection"><strong>« Est-ce seulement pour les gros immeubles? »</strong><p>Non. Même une petite copropriété gagne à garder un historique clair des ouvertures, photos et interventions.</p></div>
  <div class="objection"><strong>« Pourquoi Vosthermos plutôt qu'un autre? »</strong><p>La plupart réparent et envoient une facture. Vosthermos ajoute un outil de suivi qui rend la gestion plus simple.</p></div>
  <div class="objection"><strong>« Nous sommes manufacturier, pas réparateur. »</strong><p>C'est exactement l'occasion. Vous gardez la relation et nous prenons le service terrain que vous ne voulez pas gérer.</p></div>
  <div class="objection"><strong>« Combien ça coûte? »</strong><p>Le portail est gratuit pour nos clients Vosthermos. La valeur vendue est le service de réparation, le suivi, les photos et l'historique propre.</p></div>
  <div class="footer"><span>Pitch de vente | Portail gestionnaires</span><span>9</span></div>
</section>

<section class="page quick" id="p10">
  <div class="topline"><img class="logo" src="${logoWhite}" alt="Vosthermos"><div class="pill">Fiche rapide</div></div>
  <div class="eyebrow">À retenir</div>
  <h1>La fiche du représentant</h1>
  <div class="quick-grid">
    <div class="quick-row"><b>On vend quoi?</b><span>Un service Vosthermos de réparation et suivi, avec portail client gratuit.</span></div>
    <div class="quick-row"><b>À qui?</b><span>Gestionnaires, syndicats, CA, maintenance et manufacturiers/installateurs sans service de réparation.</span></div>
    <div class="quick-row"><b>Enjeu client</b><span>Courriels, photos, unités, suivis et factures dispersés.</span></div>
    <div class="quick-row"><b>Promesse</b><span>Moins de suivis manuels, dossiers plus clairs, historique propre.</span></div>
    <div class="quick-row"><b>Démo gagnante</b><span>Tableau de bord, parc de fenêtres, demande, factures, résumé CA.</span></div>
    <div class="quick-row"><b>Page portail</b><a href="${portalUrl}"><span class="quick-click">Cliquez ici</span><br>${portalUrl}</a></div>
    <div class="quick-row"><b>Tutoriel animé</b><a href="${tutorialUrl}"><span class="quick-click">Cliquez ici</span><br>${tutorialUrl}</a></div>
    <div class="quick-row"><b>Manufacturier</b><span>Vosthermos devient le partenaire de réparation et de suivi après-vente.</span></div>
    <div class="quick-row"><b>Closing</b><span>Proposer une copropriété pilote ou un partenariat de références.</span></div>
  </div>
  <div class="contact-bar">${company.phone} | ${company.email} | ${company.web} | ${company.rbq}</div>
</section>

</body>
</html>`;
}

fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(publicDocsDir, { recursive: true });
resetTempDir();

try {
  const chrome = findChrome();
  const company = readCompanyInfo();
  const shots = createPortalShots(chrome);

  fs.writeFileSync(htmlPath, buildHtml(company, shots), "utf8");

  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--no-sandbox",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdfPath}`,
    toFileUrl(htmlPath),
  ], { stdio: "inherit", timeout: 60000 });

  fs.copyFileSync(pdfPath, publicPdfPath);
  console.log(pdfPath);
  console.log(publicPdfPath);
  if (keepTemp) console.log(`Preview HTML kept: ${htmlPath}`);
} finally {
  cleanupTempDir();
}
