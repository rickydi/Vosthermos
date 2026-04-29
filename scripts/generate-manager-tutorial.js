const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const docsDir = path.join(root, "docs");
const assetsDir = path.join(docsDir, "portail-tutoriel-assets");
const htmlPath = path.join(docsDir, "tutoriel-portail-gestionnaires.html");
const publicTutorialDir = path.join(root, "public", "portail-gestionnaire");
const publicAssetsDir = path.join(publicTutorialDir, "tutoriel-assets");
const publicHtmlPath = path.join(publicTutorialDir, "tutoriel.html");

function toFileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
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

function prepareMobilePortalMockup(source) {
  return source.replace("</style>", `
  body { overflow-x: hidden; }
  .app {
    display: block;
    min-height: 100vh;
  }
  .sidebar {
    display: none !important;
  }
  .main {
    min-width: 0;
  }
  .topbar {
    position: static;
    padding: 10px 12px;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
  }
  .breadcrumb {
    width: 100%;
    font-size: 11px;
    gap: 6px;
  }
  .topbar-right {
    width: 100%;
    display: flex;
    gap: 8px;
  }
  .search-box {
    min-width: 0;
    flex: 1;
    padding: 6px 9px;
  }
  .search-kbd,
  .bell {
    display: none;
  }
  .content {
    padding: 22px 14px 38px;
    max-width: none;
  }
  .page-head {
    display: block;
    margin-bottom: 18px;
  }
  .page-title {
    font-size: 30px;
    line-height: 1.02;
  }
  .page-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    margin-top: 12px;
    overflow: hidden;
  }
  .btn {
    height: 36px;
    padding: 0 11px;
    font-size: 12px;
    white-space: nowrap;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .hero,
  .stats,
  .inbox,
  .units,
  .panel .card,
  .card {
    grid-column: 1 / -1 !important;
  }
  .hero,
  .card-lg {
    padding: 20px;
  }
  .stats-row {
    grid-template-columns: 1fr 1fr;
  }
  .inbox-list {
    grid-template-columns: 1fr;
  }
  .section-head {
    align-items: flex-start;
    gap: 12px;
  }
  .section-title {
    font-size: 11px;
    line-height: 1.24;
  }
  .status-legend {
    gap: 10px;
    flex-wrap: wrap;
    font-size: 10px;
  }
  .bldg {
    padding: 14px;
  }
  .bldg-head {
    flex-wrap: wrap;
    gap: 10px;
  }
  .bldg-meta {
    margin-left: 0;
    font-size: 10px;
  }
  .unit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .unit {
    min-height: 54px;
  }
  .table {
    min-width: 560px;
  }
  .modal {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }
  .modal-body {
    padding: 16px;
  }
  .modal-kv {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .openings {
    grid-template-columns: 1fr;
  }
</style>`);
}

function createPortalShot(chrome, source, tab, options = tab) {
  const shotOptions = typeof options === "string" ? { variant: options } : options;
  const variant = shotOptions.variant || tab;
  const tempHtml = path.join(assetsDir, `capture-${variant}.html`);
  const output = path.join(assetsDir, `capture-${variant}.png`);
  const width = shotOptions.width || 1400;
  const height = shotOptions.height || 1000;
  let html = activatePortalTab(source, tab);

  if (shotOptions.mobile) {
    html = prepareMobilePortalMockup(html);
  }

  if (variant === "unit-detail" || shotOptions.unitDetail) {
    html = html
      .replace('<div class="modal-backdrop" id="unitModal">', '<div class="modal-backdrop open" id="unitModal">')
      .replace("</style>", `
  body { overflow: hidden; }
</style>`);
  }

  fs.writeFileSync(tempHtml, html, "utf8");
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--run-all-compositor-stages-before-draw",
    "--no-sandbox",
    "--hide-scrollbars",
    `--window-size=${width},${height}`,
    "--virtual-time-budget=1000",
    `--screenshot=${output}`,
    toFileUrl(tempHtml),
  ], { stdio: "ignore", timeout: 30000 });
  fs.rmSync(tempHtml, { force: true });
  return `portail-tutoriel-assets/capture-${variant}.png`;
}

function buildHtml(assets) {
  const logoWhite = "../public/images/Vos-Thermos-Logo_Blanc.png";
  const logoRed = "../public/images/Vos-Thermos-Logo.png";
  const mobileShell = (content) => `
          <div class="mobile-capture-shell">
            <div class="mobile-ui">
              <div class="m-status"><span>9:41</span><span></span></div>
              ${content}
            </div>
          </div>`;
  const mobileView = (name) => {
    const views = {
      copro: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Nouvelle copropriété</b><span>Client gestionnaire</span></div>
              </div>
              <div class="m-body">
                <div class="m-field"><span>Nom</span><b class="typed" style="--w: 19ch; --delay: .2s;">Copro Saint-François</b></div>
                <div class="m-row">
                  <div class="m-field"><span>Ville</span><b class="typed" style="--w: 7ch; --delay: .7s;">Delson</b></div>
                  <div class="m-field"><span>Code</span><b class="typed" style="--w: 7ch; --delay: 1s;">J5B 1Y1</b></div>
                </div>
                <div class="m-field tall"><span>Adresse</span><b class="typed" style="--w: 18ch; --delay: 1.3s;">330 Saint-François</b></div>
                <button class="m-primary click-effect" style="--click-delay: 2.25s;">Créer</button>
              </div>`,
      building: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Ajouter bâtiment</b><span>Copro Saint-François</span></div>
              </div>
              <div class="m-body">
                <div class="m-field"><span>Code</span><b class="typed" style="--w: 2ch; --delay: .2s;">A</b></div>
                <div class="m-field"><span>Nom visible</span><b class="typed" style="--w: 11ch; --delay: .65s;">Bâtiment A</b></div>
                <div class="m-field tall"><span>Adresse</span><b class="typed" style="--w: 18ch; --delay: 1.05s;">330 Saint-François</b></div>
                <button class="m-primary click-effect" style="--click-delay: 1.75s;">Ajouter bâtiment</button>
                <div class="m-building-preview"><b>A</b><span>Bâtiment A · 0 unité</span></div>
              </div>`,
      units: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Ajouter unité</b><span>Bâtiment A</span></div>
              </div>
              <div class="m-body">
                <div class="m-row">
                  <div class="m-field"><span>Unité</span><b class="typed" style="--w: 6ch; --delay: .2s;">A-101</b></div>
                  <div class="m-field"><span>Bâtiment</span><b class="typed" style="--w: 2ch; --delay: .65s;">A</b></div>
                </div>
                <div class="m-field tall"><span>Notes</span><b class="typed" style="--w: 18ch; --delay: 1s;">Salon côté rue</b></div>
                <button class="m-primary click-effect" style="--click-delay: 1.8s;">Ajouter unité</button>
                <div class="m-section-title">Unités ajoutées</div>
                <div class="m-unit-grid"><div class="m-unit active">A-101</div><div class="m-unit">A-102</div><div class="m-unit">A-201</div><div class="m-unit">A-202</div></div>
              </div>`,
      dashboard: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Tableau de bord</b><span>Copro Saint-François</span></div>
              </div>
              <div class="m-body">
                <div class="m-summary"><div><b>3</b><span>bons actifs</span></div><div><b>2</b><span>factures dues</span></div></div>
                <div class="m-actions"><button>Exporter</button><button class="m-primary">Demande</button></div>
                <div class="m-section-title">Notifications</div>
                <div class="m-list red"><b>Facture à régler</b><span>VOS-2026-042 · 3 450$</span></div>
                <div class="m-list green"><b>Intervention complétée</b><span>Unité B-412 · photos dispo</span></div>
                <div class="m-section-title">Parc de fenêtres</div>
                <div class="m-building-preview"><b>A</b><span>Bâtiment A · 5 unités</span></div>
                <div class="m-unit-grid"><div class="m-unit done">A-101</div><div class="m-unit done">A-201</div><div class="m-unit">A-202</div><div class="m-unit active">B-412</div></div>
              </div>`,
      unit: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Unité B-412</b><span>Bâtiment B</span></div>
              </div>
              <div class="m-body">
                <div class="m-status-card"><span>Bon actif</span><b>MAR 22</b></div>
                <div class="m-section-title">Ouvertures</div>
                <div class="m-list"><b>Fenêtre salon</b><span>Thermos embué · priorité normale</span></div>
                <div class="m-list"><b>Porte-patio</b><span>Poignée difficile à fermer</span></div>
                <button class="m-primary click-effect" style="--click-delay: 2s;">Demander intervention</button>
                <div class="m-section-title">Historique</div>
                <div class="m-list green"><b>Thermos remplacé</b><span>Photos disponibles</span></div>
              </div>`,
      interventions: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Interventions</b><span>Suivi terrain</span></div>
              </div>
              <div class="m-body">
                <div class="m-list red"><b>Inspection à venir</b><span>12 mai · Bâtiment A</span></div>
                <div class="m-list"><b>Technicien assigné</b><span>Marc Tremblay · 8 unités</span></div>
                <div class="m-list green"><b>Complété</b><span>B-412 · photos déposées</span></div>
                <button class="m-primary">Nouvelle demande</button>
              </div>`,
      invoices: `
              <div class="m-head">
                <img src="${logoRed}" alt="Vosthermos">
                <div><b>Factures</b><span>Comptabilité</span></div>
              </div>
              <div class="m-body">
                <div class="m-summary"><div><b>3 450$</b><span>à payer</span></div><div><b>12 840$</b><span>total</span></div></div>
                <div class="m-list red"><b>VOS-2026-042</b><span>Échéance 30 avril · PDF</span></div>
                <div class="m-list green"><b>VOS-2026-038</b><span>Payée · reçu disponible</span></div>
                <div class="m-list"><b>Soumission U-201</b><span>Approbation requise</span></div>
              </div>`,
    };
    return mobileShell(views[name] || views.dashboard);
  };

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tutoriel marketing - Portail gestionnaires Vosthermos</title>
<style>
  :root {
    --teal: #003845;
    --teal-2: #0b4e5b;
    --red: #e30718;
    --ink: #09212a;
    --muted: #667985;
    --line: #d9e3e7;
    --paper: #f5f8fa;
    --white: #fff;
    --shadow: 0 24px 70px rgba(9, 33, 42, .18);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; height: 100%; background: #dfe8ec; color: var(--ink); font-family: Arial, Helvetica, sans-serif; }
  body { min-height: 100vh; display: grid; place-items: center; padding: 12px; }
  .stage {
    width: min(1600px, calc(100vw - 24px), calc((100vh - 24px) * 16 / 9));
    aspect-ratio: 16 / 9;
    min-height: 0;
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    background: var(--teal);
    box-shadow: var(--shadow);
  }
  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity .55s ease;
  }
  .slide.active { opacity: 1; pointer-events: auto; }
  .slide-inner {
    position: absolute;
    inset: 0;
    padding: 52px 64px;
    display: grid;
    grid-template-columns: .82fr 1.18fr;
    gap: 42px;
    align-items: center;
  }
  .intro-slide .slide-inner,
  .closing-slide .slide-inner {
    grid-template-columns: 1fr;
    align-items: center;
    text-align: left;
  }
  .bg-mark {
    position: absolute;
    right: -180px;
    top: -190px;
    width: 560px;
    height: 560px;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
  }
  .logo-white { width: 132px; display: block; margin-bottom: 34px; }
  .logo-red { width: 86px; display: block; margin-bottom: 16px; }
  .eyebrow {
    color: #bde1e7;
    text-transform: uppercase;
    letter-spacing: .16em;
    font-weight: 800;
    font-size: 12px;
    margin-bottom: 14px;
  }
  .slide:not(.intro-slide):not(.closing-slide) .eyebrow { color: var(--red); }
  h1 { margin: 0; font-size: clamp(40px, 4.8vw, 64px); line-height: .98; letter-spacing: -.02em; color: #fff; max-width: 850px; }
  h2 { margin: 0 0 14px; font-size: clamp(30px, 3.35vw, 45px); line-height: 1.02; letter-spacing: -.02em; }
  p { margin: 0; color: #d7e9ed; font-size: 21px; line-height: 1.45; max-width: 780px; }
  .content-panel {
    position: relative;
    z-index: 2;
    max-width: 760px;
  }
  .metric-row {
    display: flex;
    gap: 14px;
    margin-top: 28px;
    flex-wrap: wrap;
  }
  .metric {
    min-width: 174px;
    padding: 18px 20px;
    border-radius: 12px;
    background: rgba(255,255,255,.11);
    color: #fff;
  }
  .metric b { display: block; font-size: 28px; margin-bottom: 4px; }
  .metric span { display: block; color: #cfe3e7; font-size: 13px; line-height: 1.28; }
  .phone-shell {
    width: min(100%, 720px);
    position: relative;
    border-radius: 24px;
    padding: 14px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.85);
    box-shadow: 0 22px 60px rgba(9,33,42,.22);
    transform: translateY(16px) scale(.98);
    transition: transform .7s ease;
  }
  .slide.active .phone-shell { transform: translateY(0) scale(1); }
  .screen {
    display: block;
    width: 100%;
    aspect-ratio: 14 / 10;
    object-fit: cover;
    object-position: top left;
    border-radius: 16px;
    border: 1px solid #d5e2e7;
  }
  .screen.unit-detail { object-position: center center; }
  .paired-demo,
  .capture-pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 232px;
    gap: 14px;
    align-items: stretch;
  }
  .paired-demo .form-demo {
    min-width: 0;
  }
  .capture-pair .phone-shell {
    width: 100%;
  }
  .capture-pair .screen {
    min-height: 420px;
  }
  .mobile-capture-shell {
    position: relative;
    align-self: stretch;
    min-height: 430px;
    border-radius: 24px;
    padding: 10px;
    background: #0b1115;
    border: 1px solid rgba(255,255,255,.28);
    box-shadow: 0 22px 60px rgba(9,33,42,.2);
    overflow: hidden;
  }
  .mobile-capture-shell::before {
    content: "";
    position: absolute;
    top: 16px;
    left: 50%;
    width: 74px;
    height: 17px;
    border-radius: 999px;
    background: #05090c;
    transform: translateX(-50%);
    z-index: 2;
  }
  .mobile-ui {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 410px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.12);
    background: linear-gradient(180deg, #f8fbfc, #eef4f6);
    color: var(--ink);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .m-status {
    min-height: 26px;
    padding: 8px 13px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #5f717b;
    font-size: 9px;
    font-weight: 900;
  }
  .m-status span:last-child {
    width: 18px;
    height: 8px;
    border-radius: 999px;
    border: 1px solid #8aa0aa;
    position: relative;
  }
  .m-status span:last-child::after {
    content: "";
    position: absolute;
    right: 2px;
    top: 2px;
    bottom: 2px;
    width: 7px;
    border-radius: 999px;
    background: var(--teal);
  }
  .m-head {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 9px;
    align-items: center;
    padding: 11px 14px 10px;
    border-bottom: 1px solid #dce7eb;
    background: #fff;
  }
  .m-head img {
    width: 28px;
    height: auto;
  }
  .m-head b {
    display: block;
    font-size: 15px;
    line-height: 1.05;
  }
  .m-head span {
    display: block;
    margin-top: 3px;
    color: var(--muted);
    font-size: 9.5px;
    font-weight: 800;
  }
  .m-body {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }
  .m-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .m-field,
  .m-list,
  .m-status-card,
  .m-building-preview {
    border: 1px solid #d9e5e9;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 7px 20px rgba(9,33,42,.055);
  }
  .m-field {
    min-height: 58px;
    padding: 10px;
  }
  .m-field.tall {
    min-height: 66px;
  }
  .m-field span,
  .m-section-title {
    display: block;
    color: #6d7d86;
    font-size: 8.5px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .m-field b {
    display: block;
    margin-top: 7px;
    font-size: 14px;
    line-height: 1.16;
  }
  .m-primary,
  .m-actions button {
    min-height: 35px;
    border: 1px solid #d9e5e9;
    border-radius: 10px;
    background: #fff;
    color: var(--ink);
    font-weight: 900;
    font-size: 11px;
  }
  .m-primary {
    position: relative;
    overflow: hidden;
    border-color: var(--red);
    background: var(--red);
    color: #fff;
  }
  .m-primary.click-effect::after {
    content: "";
    position: absolute;
    inset: -36%;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(255,255,255,.58) 0 12%, rgba(255,255,255,.24) 28%, transparent 52%);
    opacity: 0;
    transform: scale(.28);
    pointer-events: none;
  }
  .slide.active .m-primary.click-effect {
    animation: buttonPress .72s ease-out var(--click-delay, 2s) 1 both;
  }
  .slide.active .m-primary.click-effect::after {
    animation: buttonRipple .72s ease-out var(--click-delay, 2s) 1 both;
  }
  .m-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .m-summary div {
    min-height: 54px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #d9e5e9;
    padding: 10px;
  }
  .m-summary b {
    display: block;
    color: var(--red);
    font-size: 17px;
    line-height: 1;
  }
  .m-summary span {
    display: block;
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
    margin-top: 5px;
  }
  .m-actions {
    display: grid;
    grid-template-columns: .85fr 1.15fr;
    gap: 8px;
  }
  .m-section-title {
    margin-top: 4px;
  }
  .m-list {
    padding: 10px 11px;
    border-left: 4px solid #c9d5da;
  }
  .m-list.red { border-left-color: var(--red); background: #fff5f6; }
  .m-list.green { border-left-color: #059669; background: #f3fbf7; }
  .m-list b {
    display: block;
    font-size: 12px;
    line-height: 1.16;
  }
  .m-list span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: 9.5px;
    line-height: 1.25;
    font-weight: 700;
  }
  .m-building-preview {
    min-height: 42px;
    padding: 8px 10px;
    display: grid;
    grid-template-columns: 29px 1fr;
    align-items: center;
    gap: 8px;
  }
  .m-building-preview b {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: var(--teal);
    color: #fff;
    font-size: 12px;
  }
  .m-building-preview span {
    color: var(--muted);
    font-size: 10px;
    font-weight: 900;
  }
  .m-unit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 7px;
  }
  .m-unit {
    min-height: 40px;
    border: 1px solid #d9e5e9;
    border-radius: 10px;
    background: #fff;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 900;
  }
  .m-unit.done {
    background: #effaf4;
    border-color: #bde8d2;
    color: #047857;
  }
  .m-unit.active {
    background: #fff2f4;
    border-color: #f4b7bf;
    color: var(--red);
  }
  .m-status-card {
    padding: 12px;
    background: #fff3f4;
    border-color: #f4b7bf;
  }
  .m-status-card span {
    display: block;
    color: var(--red);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .m-status-card b {
    display: block;
    margin-top: 4px;
    font-size: 20px;
  }
  .light { background: linear-gradient(135deg, #fff, #eef5f7); }
  .light .slide-inner { grid-template-columns: .78fr 1.22fr; }
  .light h2 { color: var(--ink); }
  .light p { color: var(--muted); font-size: 16.5px; line-height: 1.38; }
  .callouts {
    display: grid;
    gap: 8px;
    margin-top: 18px;
  }
  .callout {
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 11px;
    align-items: start;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: rgba(255,255,255,.78);
    transform: translateX(0);
    opacity: 1;
  }
  .slide.active .callout:nth-child(1) { animation: callIn .45s ease .35s forwards; }
  .slide.active .callout:nth-child(2) { animation: callIn .45s ease .65s forwards; }
  .slide.active .callout:nth-child(3) { animation: callIn .45s ease .95s forwards; }
  .badge {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: var(--teal);
    color: #fff;
    font-weight: 900;
  }
  .callout strong { display: block; font-size: 14px; margin-bottom: 2px; }
  .callout span { display: block; color: var(--muted); font-size: 12px; line-height: 1.28; }
  .form-demo {
    position: relative;
    border-radius: 24px;
    padding: 20px;
    background: rgba(255,255,255,.88);
    border: 1px solid #d7e3e8;
    box-shadow: 0 22px 60px rgba(9,33,42,.16);
  }
  .form-chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid #dfe8ec;
    margin-bottom: 16px;
  }
  .form-chrome b { font-size: 18px; }
  .form-tag {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: #edf8fa;
    color: var(--teal);
    font-size: 12px;
    font-weight: 900;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field {
    min-height: 70px;
    padding: 11px 12px;
    border: 1px solid #d8e3e8;
    border-radius: 12px;
    background: #fff;
  }
  .field.wide { grid-column: 1 / -1; }
  .label {
    display: block;
    color: #6b7d87;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .typed {
    display: inline-block;
    min-width: 1ch;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid transparent;
    color: var(--ink);
    font-size: 17px;
    font-weight: 800;
    vertical-align: bottom;
  }
  .slide.active .typed.is-typing {
    border-right-color: var(--red);
    animation: caretBlink .7s step-end infinite;
  }
  .save-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }
  .ghost-btn,
  .save-btn {
    min-height: 40px;
    border: 1px solid #d8e3e8;
    border-radius: 10px;
    padding: 0 14px;
    font-weight: 900;
    background: #fff;
    color: var(--ink);
  }
  .save-btn {
    border-color: var(--red);
    background: var(--red);
    color: #fff;
  }
  .save-btn.click-effect {
    position: relative;
    overflow: hidden;
    transform-origin: center;
  }
  .save-btn.click-effect::after {
    content: "";
    position: absolute;
    inset: -35%;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(255,255,255,.58) 0 12%, rgba(255,255,255,.24) 28%, transparent 52%);
    opacity: 0;
    transform: scale(.28);
    pointer-events: none;
  }
  .slide.active .save-btn.click-effect {
    animation: buttonPress .72s ease-out var(--click-delay, 2.15s) 1 both;
  }
  .slide.active .save-btn.click-effect::after {
    animation: buttonRipple .72s ease-out var(--click-delay, 2.15s) 1 both;
  }
  .mini-units {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 16px;
  }
  .mini-unit {
    min-height: 52px;
    border: 1px solid #d8e3e8;
    border-radius: 10px;
    background: #fff;
    padding: 9px;
    font-weight: 900;
    font-size: 13px;
  }
  .mini-unit.new {
    background: #fff3f4;
    border-color: #f7b7bf;
    color: var(--red);
  }
  .request-checks {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }
  .request-check {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 9px 11px;
    border-radius: 10px;
    background: #f6fafb;
    border: 1px solid #d8e3e8;
    font-weight: 800;
  }
  .request-check::before {
    content: "";
    width: 16px;
    height: 16px;
    border-radius: 5px;
    background: var(--red);
    box-shadow: inset 0 0 0 4px #fff;
  }
  .responsive-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 16px;
    align-items: end;
  }
  .desktop-preview,
  .mobile-preview {
    position: relative;
    border-radius: 22px;
    background: #07333d;
    border: 1px solid #d7e3e8;
    box-shadow: 0 22px 60px rgba(9,33,42,.16);
    overflow: hidden;
  }
  .desktop-preview {
    min-height: 440px;
    padding: 14px;
  }
  .preview-chrome {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 28px;
    color: rgba(255,255,255,.64);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .preview-chrome span {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255,255,255,.28);
  }
  .preview-chrome span:first-child { background: var(--red); }
  .preview-chrome b { margin-left: auto; }
  .desktop-window {
    min-height: 382px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid #d8e3e8;
    padding: 18px;
  }
  .desktop-window-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding-bottom: 13px;
    border-bottom: 1px solid #e1e9ec;
    margin-bottom: 14px;
  }
  .desktop-window-head b {
    color: var(--ink);
    font-size: 17px;
  }
  .desktop-window-head span {
    border-radius: 999px;
    background: #edf8fa;
    color: var(--teal);
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 900;
  }
  .desktop-mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .desktop-mini-grid .field { min-height: 64px; }
  .desktop-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 14px;
  }
  .desktop-actions button,
  .mobile-submit {
    min-height: 38px;
    border-radius: 10px;
    border: 1px solid #d8e3e8;
    padding: 0 13px;
    font-weight: 900;
    background: #fff;
    color: var(--ink);
  }
  .desktop-actions .primary,
  .mobile-submit {
    position: relative;
    overflow: hidden;
    border-color: var(--red);
    background: var(--red);
    color: #fff;
  }
  .desktop-actions .primary::after,
  .mobile-submit::after {
    content: "";
    position: absolute;
    inset: -36%;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(255,255,255,.58) 0 12%, rgba(255,255,255,.24) 28%, transparent 52%);
    opacity: 0;
    transform: scale(.28);
    pointer-events: none;
  }
  .slide.active .desktop-actions .primary {
    animation: buttonPress .72s ease-out 2.1s 1 both;
  }
  .slide.active .desktop-actions .primary::after {
    animation: buttonRipple .72s ease-out 2.1s 1 both;
  }
  .mobile-preview {
    width: 220px;
    padding: 10px;
    background: #0b1115;
    border-color: rgba(255,255,255,.22);
  }
  .mobile-preview::before {
    content: "";
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 82px;
    height: 18px;
    border-radius: 999px;
    background: #05090c;
    z-index: 2;
  }
  .mobile-screen {
    min-height: 430px;
    border-radius: 24px;
    padding: 46px 14px 14px;
    background: linear-gradient(180deg, #003845, #004d5e);
    color: #fff;
  }
  .mobile-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(255,255,255,.72);
    font-size: 10px;
    font-family: ui-monospace, Menlo, monospace;
    margin-bottom: 16px;
  }
  .mobile-status i {
    width: 20px;
    height: 9px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.55);
    position: relative;
  }
  .mobile-status i::after {
    content: "";
    position: absolute;
    right: 2px;
    top: 2px;
    bottom: 2px;
    width: 8px;
    border-radius: 999px;
    background: #fff;
  }
  .mobile-head {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,.12);
    margin-bottom: 14px;
  }
  .mobile-head b { display: block; color: #fff; font-size: 16px; }
  .mobile-head span { display: block; color: rgba(255,255,255,.58); font-size: 10.5px; margin-top: 2px; }
  .mobile-card {
    display: grid;
    gap: 9px;
  }
  .mobile-field {
    min-height: 62px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    padding: 10px;
  }
  .mobile-field .label { color: rgba(255,255,255,.56); margin-bottom: 7px; }
  .mobile-field .typed {
    color: #fff;
    font-size: 13.5px;
    white-space: normal;
  }
  .mobile-submit {
    width: 100%;
    min-height: 44px;
    border-radius: 999px;
    margin-top: 4px;
  }
  .slide.active .mobile-submit {
    animation: buttonPress .72s ease-out 3.45s 1 both;
  }
  .slide.active .mobile-submit::after {
    animation: buttonRipple .72s ease-out 3.45s 1 both;
  }
  .cursor {
    position: absolute;
    left: var(--cx, 50%);
    top: var(--cy, 50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--red);
    box-shadow: 0 0 0 9px rgba(227,7,24,.18);
    z-index: 5;
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  .cursor::after {
    content: attr(data-label);
    position: absolute;
    left: var(--label-left, 26px);
    top: var(--label-top, -8px);
    white-space: nowrap;
    background: var(--red);
    color: #fff;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 10px 26px rgba(227,7,24,.24);
  }
  .cursor.no-label {
    width: 24px;
    height: 24px;
    background: rgba(227,7,24,.08);
    border: 2px solid var(--red);
    box-shadow: 0 0 0 5px rgba(227,7,24,.12);
    opacity: 0;
  }
  .cursor.no-label::after { display: none; }
  .slide.active .cursor { animation: clickPulse 1.15s ease-in-out infinite; }
  .slide.active .cursor.no-label { animation: formClickPulse .72s ease-out var(--click-delay, 2.15s) 1 both; }
  .progress {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: 20px;
    height: 5px;
    border-radius: 999px;
    background: rgba(255,255,255,.25);
    overflow: hidden;
    z-index: 10;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    background: var(--red);
    transition: width .2s linear;
  }
  .controls {
    position: absolute;
    right: 22px;
    top: 22px;
    display: flex;
    gap: 8px;
    z-index: 12;
  }
  .control {
    border: 1px solid rgba(255,255,255,.36);
    background: rgba(255,255,255,.12);
    color: #fff;
    border-radius: 999px;
    padding: 9px 14px;
    font-weight: 800;
    cursor: pointer;
  }
  .stage.light-active .control { color: var(--ink); border-color: rgba(9,33,42,.16); background: rgba(255,255,255,.78); }
  .stage.light-active .dot { background: rgba(9,33,42,.22); }
  .stage.light-active .dot.active { background: var(--red); }
  .dots {
    position: absolute;
    left: 22px;
    top: 22px;
    z-index: 12;
    display: flex;
    gap: 7px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255,255,255,.36);
  }
  .dot.active { background: var(--red); }
  .cta-row {
    margin-top: 34px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0 22px;
    border-radius: 999px;
    background: var(--red);
    color: #fff;
    font-weight: 900;
    text-decoration: none;
  }
  .cta.secondary {
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.28);
  }
  .final-card {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    max-width: 850px;
  }
  .final-card div {
    padding: 18px;
    border-radius: 14px;
    background: rgba(255,255,255,.11);
    color: #fff;
  }
  .final-card b { display: block; font-size: 20px; margin-bottom: 6px; }
  .final-card span { display: block; font-size: 13px; line-height: 1.34; color: #cfe3e7; }
  @keyframes callIn {
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes typeField {
    to { max-width: var(--w, 28ch); }
  }
  @keyframes caretBlink {
    50% { border-color: transparent; }
  }
  @keyframes clickPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 8px rgba(227,7,24,.18); }
    50% { transform: translate(-50%, -50%) scale(.72); box-shadow: 0 0 0 15px rgba(227,7,24,.08); }
  }
  @keyframes formClickPulse {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(.72); box-shadow: 0 0 0 0 rgba(227,7,24,.18); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(.86); box-shadow: 0 0 0 4px rgba(227,7,24,.16); }
    48% { opacity: 1; transform: translate(-50%, -50%) scale(.62); box-shadow: 0 0 0 11px rgba(227,7,24,.10); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.28); box-shadow: 0 0 0 18px rgba(227,7,24,0); }
  }
  @keyframes buttonPress {
    0%, 100% { transform: translateY(0) scale(1); filter: brightness(1); }
    36% { transform: translateY(1px) scale(.965); filter: brightness(.94); }
    62% { transform: translateY(0) scale(1.015); filter: brightness(1.08); }
  }
  @keyframes buttonRipple {
    0% { opacity: 0; transform: scale(.22); }
    28% { opacity: .9; }
    100% { opacity: 0; transform: scale(1.05); }
  }
  @media (max-width: 820px) {
    body { padding: 0; }
    .stage { width: 100%; min-height: 100svh; border-radius: 0; aspect-ratio: auto; }
    .slide-inner, .light .slide-inner {
      grid-template-columns: 1fr;
    padding: 74px 24px 62px;
      gap: 24px;
    }
    .responsive-demo {
      grid-template-columns: 1fr;
      align-items: stretch;
    }
    .desktop-preview {
      min-height: auto;
    }
    .desktop-window {
      min-height: auto;
    }
    .paired-demo,
    .capture-pair {
      grid-template-columns: 1fr;
    }
    .capture-pair .screen {
      min-height: 260px;
    }
    .mobile-capture-shell {
      width: min(100%, 250px);
      justify-self: center;
    }
    .mobile-preview {
      justify-self: center;
      width: min(100%, 250px);
    }
    h1 { font-size: 44px; }
    h2 { font-size: 34px; }
    p { font-size: 17px; }
    .final-card { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <main class="stage" aria-label="Tutoriel marketing animé du portail gestionnaires Vosthermos">
    <div class="dots" aria-hidden="true"></div>
    <div class="controls">
      <button class="control" id="toggle">Pause</button>
      <button class="control" id="restart">Rejouer</button>
    </div>

    <section class="slide intro-slide active" data-theme="dark" data-duration="2800">
      <div class="bg-mark"></div>
      <div class="slide-inner">
        <div class="content-panel">
          <img class="logo-white" src="${logoWhite}" alt="Vosthermos">
          <div class="eyebrow">Tutoriel marketing</div>
          <h1>Utiliser le portail gestionnaire.</h1>
          <p>Le parcours complet : créer une copropriété, ajouter un bâtiment, ajouter des unités, ouvrir une fiche, demander une intervention et suivre le dossier sur ordinateur et mobile.</p>
          <div class="metric-row">
            <div class="metric"><b>1</b><span>registre vivant par copropriété</span></div>
            <div class="metric"><b>Gratuit</b><span>inclus avec le service Vosthermos</span></div>
            <div class="metric"><b>B2B</b><span>gestionnaires, syndicats, manufacturiers</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5600">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 1 · nouvelle copropriété</div>
          <h2>On commence par créer la copropriété.</h2>
          <p>Le gestionnaire clique sur Ajouter copropriété, puis remplit les informations principales du client.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Nom</strong><span>Nom de la copropriété ou du syndicat.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Adresse</strong><span>Ville, adresse et code postal pour classer le dossier.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Enregistrer</strong><span>La copropriété devient disponible dans le menu.</span></div></div>
          </div>
        </div>
        <div class="paired-demo">
          <div class="form-demo">
            <div class="form-chrome"><b>Ajouter une copropriété</b><span class="form-tag">Client gestionnaire</span></div>
            <div class="form-grid">
              <div class="field wide"><span class="label">Nom</span><span class="typed" style="--w: 24ch; --delay: .15s;">Copro Saint-François</span></div>
              <div class="field"><span class="label">Ville</span><span class="typed" style="--w: 7ch; --delay: .65s;">Delson</span></div>
              <div class="field"><span class="label">Code postal</span><span class="typed" style="--w: 7ch; --delay: .95s;">J5B 1Y1</span></div>
              <div class="field wide"><span class="label">Adresse</span><span class="typed" style="--w: 44ch; --delay: 1.25s;">330 Chem. Saint-François-Xavier, local 104</span></div>
            </div>
            <div class="save-row"><button class="ghost-btn">Annuler</button><button class="save-btn click-effect" style="--click-delay: 2.25s;">Créer la copropriété</button></div>
            <div class="cursor no-label" style="--cx: 82%; --cy: 86%; --click-delay: 2.25s;" data-label=""></div>
          </div>
          ${mobileView("copro")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5400">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 2 · ajouter un bâtiment</div>
          <h2>Ensuite on ajoute l'immeuble.</h2>
          <p>Un bâtiment sert à regrouper les unités. Exemple : Bâtiment A, Tour 1, Bloc Est ou Adresse principale.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Code court</strong><span>Un code simple comme A, B ou 330.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Nom visible</strong><span>Le nom que le client verra dans son parc de fenêtres.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Adresse optionnelle</strong><span>Utile quand un gestionnaire a plusieurs immeubles.</span></div></div>
          </div>
        </div>
        <div class="paired-demo">
          <div class="form-demo">
            <div class="form-chrome"><b>Ajouter bâtiment</b><span class="form-tag">Copro Saint-François</span></div>
            <div class="form-grid">
              <div class="field"><span class="label">Code</span><span class="typed" style="--w: 2ch; --delay: .15s;">A</span></div>
              <div class="field"><span class="label">Nom</span><span class="typed" style="--w: 12ch; --delay: .55s;">Bâtiment A</span></div>
              <div class="field wide"><span class="label">Adresse</span><span class="typed" style="--w: 34ch; --delay: .95s;">330 Saint-François-Xavier</span></div>
            </div>
            <div class="save-row"><button class="ghost-btn">Annuler</button><button class="save-btn click-effect" style="--click-delay: 1.75s;">Ajouter bâtiment</button></div>
            <div class="cursor no-label" style="--cx: 82%; --cy: 78%; --click-delay: 1.75s;" data-label=""></div>
          </div>
          ${mobileView("building")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5600">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 3 · ajouter des unités</div>
          <h2>Après ça, on ajoute les unités.</h2>
          <p>Chaque unité devient cliquable. C'est là qu'on pourra attacher les fenêtres, portes-patio, photos et interventions.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Code unité</strong><span>Exemple : A-101, A-102, B-412.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Bâtiment</strong><span>L'unité est classée sous le bon immeuble.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Résultat</strong><span>Le parc de fenêtres se construit visuellement.</span></div></div>
          </div>
        </div>
        <div class="paired-demo">
          <div class="form-demo">
            <div class="form-chrome"><b>Ajouter unité</b><span class="form-tag">Bâtiment A</span></div>
            <div class="form-grid">
              <div class="field"><span class="label">Code unité</span><span class="typed" style="--w: 6ch; --delay: .15s;">A-101</span></div>
              <div class="field"><span class="label">Bâtiment</span><span class="typed" style="--w: 12ch; --delay: .55s;">Bâtiment A</span></div>
              <div class="field wide"><span class="label">Notes</span><span class="typed" style="--w: 37ch; --delay: .95s;">Salon côté rue, accès par locataire.</span></div>
            </div>
            <div class="mini-units">
              <div class="mini-unit new">A-101</div>
              <div class="mini-unit">A-102</div>
              <div class="mini-unit">A-201</div>
              <div class="mini-unit">A-202</div>
              <div class="mini-unit">A-301</div>
            </div>
            <div class="save-row"><button class="ghost-btn">Annuler</button><button class="save-btn click-effect" style="--click-delay: 1.8s;">Ajouter unité</button></div>
            <div class="cursor no-label" style="--cx: 82%; --cy: 84%; --click-delay: 1.8s;" data-label=""></div>
          </div>
          ${mobileView("units")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5200">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 4 · clic sur une unité</div>
          <h2>Le client part du tableau de bord.</h2>
          <p>Il voit les priorités, puis clique sur une unité pour ouvrir le dossier détaillé.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Vue d'ensemble</strong><span>Notifications, bons actifs et factures sont visibles au départ.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Parc de fenêtres</strong><span>Les bâtiments et unités sont classés avec leur statut.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Action montrée</strong><span>Le curseur clique sur B-412 pour ouvrir la fiche.</span></div></div>
          </div>
        </div>
        <div class="capture-pair">
          <div class="phone-shell">
            <img class="screen" src="${assets.dashboard}" alt="Capture du tableau de bord du portail">
            <div class="cursor" style="--cx: 47%; --cy: 73%;" data-label="Cliquer B-412"></div>
          </div>
          ${mobileView("dashboard")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="6100">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 5 · fiche ouverte</div>
          <h2>La fiche de l'unité s'ouvre.</h2>
          <p>Le client voit les ouvertures, les notes et l'historique sans demander un suivi par courriel.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Fiche unité</strong><span>Le client comprend rapidement ce qui se passe pour A-101, B-412 ou C-301.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Ouvertures suivies</strong><span>Fenêtres, portes-patio, photos et notes restent rattachées au bon endroit.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Historique consultable</strong><span>Le CA peut revoir les travaux passés et les prochaines étapes.</span></div></div>
          </div>
        </div>
        <div class="capture-pair">
          <div class="phone-shell">
            <img class="screen unit-detail" src="${assets.unit}" alt="Capture d'une fiche unité ouverte dans le portail">
            <div class="cursor" style="--cx: 62%; --cy: 45%;" data-label="Ouvertures"></div>
          </div>
          ${mobileView("unit")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5800">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 6 · créer une demande</div>
          <h2>On peut demander une intervention.</h2>
          <p>Le gestionnaire choisit les unités ou ouvertures concernées, ajoute la priorité, puis décrit le problème.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Unités concernées</strong><span>On sélectionne les logements ou ouvertures à visiter.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Priorité</strong><span>Normal, urgent ou date souhaitée selon la situation.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Description</strong><span>Les détails arrivent déjà structurés chez Vosthermos.</span></div></div>
          </div>
        </div>
        <div class="paired-demo">
          <div class="form-demo">
            <div class="form-chrome"><b>Nouvelle demande d'intervention</b><span class="form-tag">Copro Saint-François</span></div>
            <div class="request-checks">
              <div class="request-check">Bâtiment A · Unité A-101 · fenêtre salon</div>
              <div class="request-check">Bâtiment A · Unité A-102 · porte-patio</div>
            </div>
            <div class="form-grid" style="margin-top:12px;">
              <div class="field"><span class="label">Priorité</span><span class="typed" style="--w: 7ch; --delay: .35s;">Normale</span></div>
              <div class="field"><span class="label">Date souhaitée</span><span class="typed" style="--w: 10ch; --delay: .75s;">14 mai</span></div>
              <div class="field wide"><span class="label">Description</span><span class="typed" style="--w: 48ch; --delay: 1.15s;">Thermos embué et poignée difficile à fermer.</span></div>
            </div>
            <div class="save-row"><button class="ghost-btn">Annuler</button><button class="save-btn click-effect" style="--click-delay: 2s;">Envoyer la demande</button></div>
            <div class="cursor no-label" style="--cx: 80%; --cy: 84%; --click-delay: 2s;" data-label=""></div>
          </div>
          ${mobileView("unit")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5600">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 7 · section interventions</div>
          <h2>Ensuite il va dans Interventions.</h2>
          <p>Le client voit les dates, les unités concernées, le technicien et l'historique sans relancer par téléphone.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Calendrier clair</strong><span>Les travaux à venir sont visibles dans une seule vue.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Contexte terrain</strong><span>Unités, bâtiment, notes et technicien restent liés au dossier.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Historique propre</strong><span>Les travaux terminés restent prêts pour le CA.</span></div></div>
          </div>
        </div>
        <div class="capture-pair">
          <div class="phone-shell">
            <img class="screen" src="${assets.interventions}" alt="Capture des interventions du portail">
            <div class="cursor" style="--cx: 9%; --cy: 48%;" data-label="Interventions"></div>
          </div>
          ${mobileView("interventions")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="5600">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 8 · section factures</div>
          <h2>Puis il retrouve ses factures.</h2>
          <p>Le portail réduit les demandes de renvoi par courriel et donne une vue claire pour la comptabilité.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Montants visibles</strong><span>À payer, payé et total facturé sont séparés clairement.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Documents PDF</strong><span>Le client retrouve les documents importants au même endroit.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Moins de relances</strong><span>Les réponses sont déjà disponibles dans le portail.</span></div></div>
          </div>
        </div>
        <div class="capture-pair">
          <div class="phone-shell">
            <img class="screen" src="${assets.factures}" alt="Capture des factures du portail">
            <div class="cursor" style="--cx: 8%; --cy: 54%;" data-label="Factures"></div>
          </div>
          ${mobileView("invoices")}
        </div>
      </div>
    </section>

    <section class="slide light" data-theme="light" data-duration="6200">
      <div class="slide-inner">
        <div>
          <img class="logo-red" src="${logoRed}" alt="Vosthermos">
          <div class="eyebrow">Étape 9 · version mobile</div>
          <h2>Le même portail fonctionne aussi sur mobile.</h2>
          <p>Le gestionnaire peut montrer le suivi au CA, vérifier une unité ou envoyer une demande même quand il n'est pas au bureau.</p>
          <div class="callouts">
            <div class="callout"><div class="badge">1</div><div><strong>Ordinateur</strong><span>Vue complète pour structurer copropriété, bâtiments et unités.</span></div></div>
            <div class="callout"><div class="badge">2</div><div><strong>Mobile</strong><span>Demande rapide à partir d'une unité ou d'une ouverture.</span></div></div>
            <div class="callout"><div class="badge">3</div><div><strong>Même information</strong><span>Le client garde le même suivi, peu importe l'écran utilisé.</span></div></div>
          </div>
        </div>
        <div class="capture-pair">
          <div class="phone-shell">
            <img class="screen" src="${assets.dashboard}" alt="Version ordinateur réelle du portail">
            <div class="cursor" style="--cx: 47%; --cy: 73%;" data-label="Desktop"></div>
          </div>
          ${mobileView("dashboard")}
        </div>
      </div>
    </section>

    <section class="slide closing-slide" data-theme="dark" data-duration="4800">
      <div class="bg-mark"></div>
      <div class="slide-inner">
        <div class="content-panel">
          <img class="logo-white" src="${logoWhite}" alt="Vosthermos">
          <div class="eyebrow">Argument de vente</div>
          <h1>Vosthermos répare, documente et garde le suivi propre.</h1>
          <p>Après ce parcours, le client sait créer sa copropriété, structurer ses immeubles, ajouter ses unités, demander un service et suivre les travaux sur ordinateur ou mobile.</p>
          <div class="final-card">
            <div><b>Gratuit</b><span>Le portail est inclus pour les clients Vosthermos.</span></div>
            <div><b>Simple</b><span>Aucun logiciel à installer, accès par lien sécurisé.</span></div>
            <div><b>Vendeur</b><span>Un outil concret à montrer en rendez-vous.</span></div>
          </div>
          <div class="cta-row">
            <a class="cta" href="https://www.vosthermos.com/portail-gestionnaire">Voir la page portail</a>
            <a class="cta secondary" href="https://www.vosthermos.com/contact?sujet=portail-demo">Demander une démo</a>
          </div>
        </div>
      </div>
    </section>

    <div class="progress"><div class="progress-fill"></div></div>
  </main>

<script>
  const slides = [...document.querySelectorAll(".slide")];
  const dotsWrap = document.querySelector(".dots");
  const fill = document.querySelector(".progress-fill");
  const toggle = document.getElementById("toggle");
  const restart = document.getElementById("restart");
  const defaultDuration = 5600;
  const requestedSlide = Number(new URLSearchParams(window.location.search).get("slide") || 0);
  let index = 0;
  let paused = false;
  let started = performance.now();
  let pauseAt = 0;
  let typingRun = 0;
  let typingTimers = [];

  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dotsWrap.appendChild(dot);
  });
  const dots = [...document.querySelectorAll(".dot")];

  function clearTypingTimers() {
    typingTimers.forEach((timer) => clearTimeout(timer));
    typingTimers = [];
    document.querySelectorAll(".typed.is-typing").forEach((field) => {
      field.classList.remove("is-typing");
    });
  }

  function cssTimeToMs(value) {
    const raw = String(value || "").trim();
    if (!raw) return 0;
    if (raw.endsWith("ms")) return Number.parseFloat(raw) || 0;
    if (raw.endsWith("s")) return (Number.parseFloat(raw) || 0) * 1000;
    return Number.parseFloat(raw) || 0;
  }

  function startTyping(slide) {
    clearTypingTimers();
    typingRun += 1;
    const run = typingRun;
    const fields = [...slide.querySelectorAll(".typed")];

    fields.forEach((field) => {
      const fullText = field.dataset.fullText || field.textContent;
      field.dataset.fullText = fullText;
      field.textContent = "";
      field.classList.remove("is-typing");

      const delay = cssTimeToMs(getComputedStyle(field).getPropertyValue("--delay"));
      const speed = Number(field.dataset.speed || 18);
      const starter = window.setTimeout(() => {
        if (run !== typingRun) return;
        let position = 0;

        function writeNext() {
          if (run !== typingRun) return;
          fields.forEach((item) => {
            if (item !== field) item.classList.remove("is-typing");
          });
          field.classList.add("is-typing");
          position += 1;
          field.textContent = fullText.slice(0, position);
          if (position < fullText.length) {
            typingTimers.push(window.setTimeout(writeNext, speed));
          } else {
            typingTimers.push(window.setTimeout(() => {
              if (run === typingRun) field.classList.remove("is-typing");
            }, 140));
          }
        }

        writeNext();
      }, delay);

      typingTimers.push(starter);
    });
  }

  function setSlide(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    document.querySelector(".stage").classList.toggle("light-active", slides[index].dataset.theme === "light");
    startTyping(slides[index]);
    started = performance.now();
    fill.style.width = "0%";
  }

  function frame(now) {
    if (!paused) {
      const duration = Number(slides[index].dataset.duration || defaultDuration);
      const pct = Math.min(1, (now - started) / duration);
      fill.style.width = (pct * 100).toFixed(2) + "%";
      if (pct >= 1) setSlide(index + 1);
    }
    requestAnimationFrame(frame);
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "Lecture" : "Pause";
    if (paused) {
      pauseAt = performance.now();
    } else {
      started += performance.now() - pauseAt;
    }
  });

  restart.addEventListener("click", () => {
    paused = false;
    toggle.textContent = "Pause";
    setSlide(0);
  });

  setSlide(Number.isFinite(requestedSlide) ? requestedSlide : 0);
  requestAnimationFrame(frame);
</script>
</body>
</html>`;
}

fs.mkdirSync(docsDir, { recursive: true });
fs.rmSync(assetsDir, { recursive: true, force: true });
fs.mkdirSync(assetsDir, { recursive: true });

const chrome = findChrome();
const mockupPath = path.join(root, "mockups", "gestionnaire-dashboard.html");
const source = preparePortalMockup(fs.readFileSync(mockupPath, "utf8"));
const assets = {
  dashboard: createPortalShot(chrome, source, "dashboard"),
  unit: createPortalShot(chrome, source, "dashboard", "unit-detail"),
  interventions: createPortalShot(chrome, source, "interventions"),
  factures: createPortalShot(chrome, source, "factures"),
};

fs.writeFileSync(htmlPath, buildHtml(assets), "utf8");

fs.rmSync(publicAssetsDir, { recursive: true, force: true });
fs.mkdirSync(publicTutorialDir, { recursive: true });
fs.cpSync(assetsDir, publicAssetsDir, { recursive: true });

const publicHtml = fs.readFileSync(htmlPath, "utf8")
  .replaceAll("../public/images/", "../images/")
  .replaceAll("portail-tutoriel-assets/", "tutoriel-assets/");

fs.writeFileSync(publicHtmlPath, publicHtml, "utf8");

console.log(htmlPath);
console.log(publicHtmlPath);
