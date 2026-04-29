const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const docsDir = path.join(root, "docs");
const publicDocsDir = path.join(root, "public", "documents");
const tempDir = path.join(docsDir, ".client-pdf-tmp");
const htmlPath = path.join(tempDir, "presentation-client-portail-gestionnaires-vosthermos.html");
const pdfName = "presentation-client-portail-gestionnaires-vosthermos.pdf";
const docsPdfPath = path.join(docsDir, pdfName);
const publicPdfPath = path.join(publicDocsDir, pdfName);

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
    phoneTel: pick("phoneTel", "5148258411"),
    email: pick("email", "info@vosthermos.com"),
    web: pick("url", "https://www.vosthermos.com").replace(/^https?:\/\//, ""),
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
  if (process.env.KEEP_CLIENT_PDF_TEMP !== "1") {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function imageSrc(...parts) {
  return toFileUrl(path.join(root, ...parts));
}

function buildHtml(company) {
  const logoRed = imageSrc("public", "images", "Vos-Thermos-Logo.png");
  const logoWhite = imageSrc("public", "images", "Vos-Thermos-Logo_Blanc.png");
  const dashboard = imageSrc("public", "portail-gestionnaire", "tutoriel-assets", "capture-dashboard.png");
  const unit = imageSrc("public", "portail-gestionnaire", "tutoriel-assets", "capture-unit-detail.png");
  const interventions = imageSrc("public", "portail-gestionnaire", "tutoriel-assets", "capture-interventions.png");
  const invoices = imageSrc("public", "portail-gestionnaire", "tutoriel-assets", "capture-factures.png");
  const portalUrl = "https://www.vosthermos.com/portail-gestionnaire";
  const tutorialUrl = "https://www.vosthermos.com/portail-gestionnaire/tutoriel.html";

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Presentation client - Portail gestionnaires Vosthermos</title>
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
    right: -1.05in;
    top: -1.10in;
    width: 4.6in;
    height: 4.6in;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
  }
  .logo { width: 1.80in; height: auto; display: block; }
  .topline { display: flex; align-items: center; justify-content: space-between; margin-bottom: .42in; }
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
  h1.tight { font-size: 27pt; }
  h2 { margin: 0 0 .20in; font-size: 20pt; line-height: 1.12; }
  h3 { margin: 0 0 .08in; font-size: 12pt; line-height: 1.2; color: #10252e; }
  p { margin: 0; font-size: 10.5pt; line-height: 1.45; color: #5f6f78; }
  .cover p { color: #d7e9ed; font-size: 13pt; line-height: 1.45; max-width: 6.45in; }
  .intro { max-width: 6.95in; font-size: 11.6pt; line-height: 1.43; margin: .16in 0 .30in; }
  .hero-box {
    margin-top: .50in;
    padding: .28in;
    border-left: .08in solid #e30718;
    background: rgba(255,255,255,.08);
    border-radius: .12in;
    max-width: 6.9in;
  }
  .hero-box strong { display: block; font-size: 18pt; line-height: 1.22; }
  .cover-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .18in; margin-top: .52in; }
  .cover-card { background: rgba(255,255,255,.11); border-radius: .12in; padding: .18in; min-height: .90in; }
  .cover-card b { display: block; font-size: 18pt; color: #fff; margin-bottom: .04in; }
  .cover-card span { display: block; font-size: 8.6pt; color: #cfe3e7; line-height: 1.25; }
  .link-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .14in; margin-top: .28in; }
  .link-box {
    display: block;
    margin-top: .28in;
    padding: .15in .18in;
    border-radius: .12in;
    background: #e30718;
    color: #fff;
    font-size: 10.1pt;
    line-height: 1.28;
    font-weight: 800;
    text-decoration: none;
  }
  .link-grid .link-box { margin-top: 0; min-height: .70in; }
  .link-box strong { display: block; font-size: 13pt; letter-spacing: .04em; text-transform: uppercase; margin-bottom: .04in; }
  .link-box span { display: block; color: rgba(255,255,255,.86); font-size: 8.4pt; margin-top: .03in; }
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
  .cover .footer, .dark .footer { color: #cfe3e7; border-color: rgba(255,255,255,.22); }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: .24in; }
  .card {
    border: 1px solid #d8e1e5;
    border-radius: .12in;
    padding: .18in;
    background: #fff;
    min-height: 1.05in;
  }
  .card.red { background: #fff3f4; border-color: #f5c8cd; }
  .card.teal { background: #edf8fa; border-color: #c9e4e8; }
  ul.clean { margin: .12in 0 0; padding: 0; list-style: none; }
  ul.clean li { position: relative; padding-left: .20in; margin: 0 0 .09in; font-size: 9.8pt; line-height: 1.34; color: #31444d; }
  ul.clean li::before { content: ""; position: absolute; left: 0; top: .12in; width: .06in; height: .06in; border-radius: 50%; background: #e30718; }
  .quote {
    margin-top: .24in;
    padding: .20in .24in;
    background: #edf8fa;
    border-left: .07in solid #003845;
    border-radius: .08in;
    color: #10252e;
    font-size: 13.2pt;
    font-weight: 800;
    line-height: 1.32;
  }
  .steps { display: grid; grid-template-columns: 1fr 1fr; gap: .13in; margin-top: .18in; }
  .step { display: grid; grid-template-columns: .40in 1fr; gap: .12in; align-items: start; padding: .14in; border-radius: .11in; background: #f4f8fa; border: 1px solid #d8e1e5; min-height: 1.08in; }
  .num { width: .34in; height: .34in; border-radius: .09in; background: #003845; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 9pt; }
  .step h3 { font-size: 10.8pt; margin-bottom: .04in; }
  .step p { font-size: 9pt; line-height: 1.32; }
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
    height: 4.70in;
    object-fit: cover;
    object-position: top left;
    border-radius: .08in;
    border: 1px solid #dbe4e8;
  }
  .shot-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .11in; margin-top: .14in; }
  .mini { border: 1px solid #d8e1e5; border-radius: .10in; padding: .11in; background: #f6fafb; min-height: .70in; }
  .mini b { display: block; font-size: 8.9pt; color: #10252e; margin-bottom: .03in; }
  .mini span { display: block; font-size: 7.9pt; line-height: 1.25; color: #5f6f78; }
  .screen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .18in; margin-top: .18in; }
  .screen-card { border: 1px solid #d8e1e5; border-radius: .12in; background: #f4f8fa; padding: .10in; }
  .screen-card img { width: 100%; height: 2.78in; object-fit: cover; object-position: top left; border-radius: .08in; border: 1px solid #dbe4e8; display: block; }
  .screen-card h3 { margin-top: .10in; font-size: 10.6pt; }
  .screen-card p { font-size: 8.8pt; line-height: 1.30; }
  .dark { background: #003845; color: #fff; }
  .dark .eyebrow { color: #bde1e7; }
  .benefit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .15in; margin-top: .20in; }
  .benefit { padding: .18in; background: rgba(255,255,255,.10); border-radius: .12in; min-height: 1.10in; }
  .benefit b { display: block; color: #fff; font-size: 12pt; margin-bottom: .06in; }
  .benefit span { display: block; color: #d7e9ed; font-size: 9.4pt; line-height: 1.32; }
  .cta {
    position: absolute;
    left: .62in;
    right: .62in;
    bottom: 1.04in;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .14in;
  }
  .cta-box { display: block; padding: .17in; border-radius: .12in; background: #e30718; color: #fff; min-height: .78in; text-decoration: none; }
  .cta-box b { display: block; font-size: 12pt; margin-bottom: .04in; }
  .cta-box span { display: block; font-size: 9pt; line-height: 1.25; color: rgba(255,255,255,.88); }
</style>
</head>
<body>

<section class="page cover">
  <div class="topline">
    <img class="logo" src="${logoWhite}" alt="Vosthermos">
    <div class="pill">Présentation client</div>
  </div>
  <div class="eyebrow">Portail gestionnaires de copropriétés</div>
  <h1>Un suivi plus clair pour vos fenêtres, vos unités et vos interventions.</h1>
  <p class="intro">Vosthermos accompagne les gestionnaires, syndicats et partenaires en fenestration avec un portail gratuit inclus avec nos services : copropriétés, bâtiments, unités, demandes, photos, interventions et factures au même endroit.</p>
  <div class="hero-box">
    <strong>Moins de courriels éparpillés. Moins de relances. Plus de visibilité pour votre équipe.</strong>
  </div>
  <div class="cover-grid">
    <div class="cover-card"><b>Gratuit</b><span>Inclus pour les clients Vosthermos admissibles.</span></div>
    <div class="cover-card"><b>Web</b><span>Accessible sur ordinateur, tablette et mobile.</span></div>
    <div class="cover-card"><b>Centralisé</b><span>Chaque unité garde son contexte, ses photos et ses suivis.</span></div>
  </div>
  <div class="link-grid">
    <a class="link-box" href="${portalUrl}"><strong>Cliquez ici</strong>Voir la page du portail<span>${portalUrl}</span></a>
    <a class="link-box" href="${tutorialUrl}" style="background:#0a697e;"><strong>Cliquez ici</strong>Voir le tutoriel animé<span>${tutorialUrl}</span></a>
  </div>
  <div class="footer"><span>${company.address}</span><span>${company.rbq}</span></div>
</section>

<section class="page">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Pourquoi</div></div>
  <div class="eyebrow">Le problème que l'on règle</div>
  <h1 class="tight">La réparation de fenêtres est simple. Le suivi peut devenir compliqué.</h1>
  <p class="intro">Quand les demandes arrivent par téléphone, courriel, texto ou photo isolée, il devient difficile de savoir quelle unité est touchée, ce qui a été fait et où retrouver les preuves.</p>
  <div class="two-col">
    <div class="card red">
      <h3>Avant</h3>
      <ul class="clean">
        <li>Demandes et photos dispersées.</li>
        <li>Historique difficile à retrouver.</li>
        <li>Unités et ouvertures mal identifiées.</li>
        <li>Factures séparées du contexte terrain.</li>
        <li>Relances répétées pour savoir où en est le dossier.</li>
      </ul>
    </div>
    <div class="card teal">
      <h3>Avec Vosthermos</h3>
      <ul class="clean">
        <li>Dossiers classés par copropriété, bâtiment et unité.</li>
        <li>Demandes d'intervention structurées.</li>
        <li>Photos et notes rattachées au bon endroit.</li>
        <li>Factures et PDF accessibles dans le portail.</li>
        <li>Vue plus claire pour le gestionnaire et le conseil.</li>
      </ul>
    </div>
  </div>
  <div class="quote">L'objectif : donner au gestionnaire un registre vivant de ses fenêtres et de ses interventions Vosthermos.</div>
  <div class="footer"><span>Présentation client | Vosthermos</span><span>2</span></div>
</section>

<section class="page">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Fonctionnement</div></div>
  <div class="eyebrow">Comment ça marche</div>
  <h1 class="tight">Un parcours simple, pensé pour les gestionnaires.</h1>
  <p class="intro">Le portail ne remplace pas votre relation avec Vosthermos. Il rend les informations plus faciles à créer, retrouver et partager au bon moment.</p>
  <div class="steps">
    <div class="step"><div class="num">1</div><div><h3>Créer les copropriétés</h3><p>Le client peut créer ses copropriétés, bâtiments et unités dans son portail.</p></div></div>
    <div class="step"><div class="num">2</div><div><h3>Documenter les unités</h3><p>Chaque unité peut conserver ses ouvertures, photos et informations utiles.</p></div></div>
    <div class="step"><div class="num">3</div><div><h3>Envoyer une demande</h3><p>Une demande d'intervention indique l'unité, la priorité et le contexte du problème.</p></div></div>
    <div class="step"><div class="num">4</div><div><h3>Suivre le dossier</h3><p>Le statut, les dates, les notes et les interventions restent au même endroit.</p></div></div>
    <div class="step"><div class="num">5</div><div><h3>Retrouver les factures</h3><p>Les documents PDF et factures sont centralisés pour consultation.</p></div></div>
    <div class="step"><div class="num">6</div><div><h3>Présenter au conseil</h3><p>Le gestionnaire dispose d'un historique plus clair pour répondre au CA.</p></div></div>
  </div>
  <a class="link-box" href="${tutorialUrl}" style="background:#003845;"><strong>Cliquez ici</strong>Voir le tutoriel animé<span>${tutorialUrl}</span></a>
  <div class="footer"><span>Présentation client | Vosthermos</span><span>3</span></div>
</section>

<section class="page">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Aperçu</div></div>
  <div class="eyebrow">Tableau de bord</div>
  <h1 class="tight">Une vue d'ensemble de vos copropriétés et dossiers actifs.</h1>
  <p class="intro">Le tableau de bord montre les éléments à suivre : bons actifs, unités concernées, interventions terminées, factures et actions importantes.</p>
  <div class="shot-frame"><img class="shot-img" src="${dashboard}" alt="Capture du tableau de bord du portail Vosthermos"></div>
  <div class="shot-row">
    <div class="mini"><b>Priorités visibles</b><span>Les dossiers importants ressortent rapidement.</span></div>
    <div class="mini"><b>Unités structurées</b><span>Chaque unité est liée à une copropriété et un bâtiment.</span></div>
    <div class="mini"><b>Accès rapide</b><span>Le client peut créer une demande et ouvrir ses suivis.</span></div>
  </div>
  <div class="footer"><span>Présentation client | Vosthermos</span><span>4</span></div>
</section>

<section class="page">
  <div class="topline"><img class="logo" src="${logoRed}" alt="Vosthermos"><div class="pill">Aperçu</div></div>
  <div class="eyebrow">Fiches, interventions et factures</div>
  <h1 class="tight">Les informations restent liées au bon dossier.</h1>
  <p class="intro">Le portail aide à conserver le contexte d'une unité, suivre les interventions et retrouver les documents importants sans fouiller dans les courriels.</p>
  <div class="screen-grid">
    <div class="screen-card"><img src="${unit}" alt="Capture d'une fiche unité"><h3>Fiche unité</h3><p>Ouvertures, photos, notes et demandes rattachées à la bonne unité.</p></div>
    <div class="screen-card"><img src="${interventions}" alt="Capture des interventions"><h3>Interventions</h3><p>Vue des travaux planifiés, terminés et en suivi.</p></div>
    <div class="screen-card"><img src="${invoices}" alt="Capture des factures"><h3>Factures</h3><p>Montants, statuts et documents PDF consultables au même endroit.</p></div>
    <div class="screen-card"><img src="${dashboard}" alt="Capture du portail"><h3>Résumé</h3><p>Une vision plus claire pour la gestion interne et les rencontres du conseil.</p></div>
  </div>
  <div class="footer"><span>Présentation client | Vosthermos</span><span>5</span></div>
</section>

<section class="page dark">
  <div class="topline"><img class="logo" src="${logoWhite}" alt="Vosthermos"><div class="pill">Bénéfices</div></div>
  <div class="eyebrow">Ce que votre équipe gagne</div>
  <h1 class="tight">Un fournisseur de fenêtres plus facile à suivre.</h1>
  <p class="intro" style="color:#d7e9ed;">Le portail est conçu pour réduire les frictions autour des travaux de fenêtres : meilleures demandes, meilleur suivi, meilleure traçabilité.</p>
  <div class="benefit-grid">
    <div class="benefit"><b>Moins de relances</b><span>Les informations clés sont visibles sans multiplier les appels et les courriels.</span></div>
    <div class="benefit"><b>Demandes plus précises</b><span>L'unité, les photos et le problème sont transmis dans un dossier structuré.</span></div>
    <div class="benefit"><b>Historique consultable</b><span>Les travaux et documents restent liés à la copropriété et à l'unité.</span></div>
    <div class="benefit"><b>Meilleure transparence</b><span>Le gestionnaire peut expliquer les dossiers plus facilement au conseil d'administration.</span></div>
  </div>
  <div class="cta">
    <a class="cta-box" href="tel:${company.phoneTel}"><b>Cliquez ici pour appeler</b><span>${company.phone} | ${company.email}</span></a>
    <a class="cta-box" href="${portalUrl}"><b>Cliquez ici pour voir le portail</b><span>${portalUrl}</span></a>
  </div>
  <div class="footer"><span>${company.address}</span><span>${company.rbq}</span></div>
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

  fs.writeFileSync(htmlPath, buildHtml(company), "utf8");

  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--no-sandbox",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${docsPdfPath}`,
    toFileUrl(htmlPath),
  ], { stdio: "inherit", timeout: 60000 });

  fs.copyFileSync(docsPdfPath, publicPdfPath);
  console.log(docsPdfPath);
  console.log(publicPdfPath);
  if (process.env.KEEP_CLIENT_PDF_TEMP === "1") {
    console.log(`Preview HTML kept: ${htmlPath}`);
  }
} finally {
  cleanupTempDir();
}
