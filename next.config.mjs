/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["pdfkit", "pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  experimental: {
    cpus: 2,
    // Backstop memoire : l'optimiseur /_next/image (endpoint public) decode toute image locale
    // avec sharp/libvips. Le defaut Next (~268 MP) laisse passer des images-bombes capables de
    // faire exploser la memoire native sur ce conteneur 16 Go sans swap. On l'aligne sur la borne
    // d'upload (80 MP) ; les uploads etant deja bornes a 2048px a la source, ceci ne couvre que
    // les fichiers legacy / un acces direct forge a l'optimiseur.
    imgOptMaxInputPixels: 80_000_000,
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
    // AVIF retire : son encodage est tres lourd en CPU/memoire native et s'execute
    // sur CHAQUE image affichee (next/image). Sur ce conteneur 16 Go sans swap, le
    // ré-encodage AVIF d'images sources pleine resolution participait aux pics memoire
    // qui faisaient hard-reset le conteneur. WebP suffit et coute bien moins cher.
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  async redirects() {
    return [
      // ── Canonicalization: non-www → www (évite duplicate content SEO) ──
      {
        source: "/:path*",
        has: [{ type: "host", value: "vosthermos.com" }],
        destination: "https://www.vosthermos.com/:path*",
        permanent: true,
      },

      // ── Anciennes URLs (pre-refonte Next.js) — 301 pour recuperer le SEO ──
      { source: "/secteurs/:ville", destination: "/reparation-portes-et-fenetres/:ville", permanent: true },
      { source: "/secteurs", destination: "/services", permanent: true },

      // ── CONSOLIDATION calfeutrage: une seule famille d'URLs par ville ──
      // /calfeutrage/[ville] et /services/calfeutrage/[ville] coexistaient en 200
      // self-canonical (122 pages en concurrence directe, Google indexait LES DEUX).
      { source: "/calfeutrage", destination: "/services/calfeutrage", permanent: true },
      { source: "/calfeutrage/:ville", destination: "/services/calfeutrage/:ville", permanent: true },

      // Anciennes URLs villes avec extension .html (vieille structure)
      { source: "/villes/:ville.html", destination: "/reparation-portes-et-fenetres/:ville", permanent: true },
      { source: "/villes/:ville", destination: "/reparation-portes-et-fenetres/:ville", permanent: true },
      { source: "/villes", destination: "/services", permanent: true },

      // Vieilles URLs racine de l'ancien site statique (encore demandées par les bots)
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/merci.html", destination: "/", permanent: true },

      // Blog singulier "blog" -> pluriel "blogue"
      { source: "/blog", destination: "/blogue", permanent: true },
      { source: "/blog/:slug*", destination: "/blogue/:slug*", permanent: true },

      // Slugs glossaire inventés (liens hardcodés dans d'anciens billets de blogue)
      { source: "/glossaire/intercalaire", destination: "/glossaire/espaceur", permanent: true },
      { source: "/glossaire/unite-scellee", destination: "/glossaire/vitre-thermos", permanent: true },
      { source: "/glossaire/quincaillerie", destination: "/glossaire/quincaillerie-fenetre", permanent: true },
      { source: "/glossaire/buee-entre-vitres", destination: "/glossaire/condensation-fenetre", permanent: true },

      // EN: pages qui n'existent pas mais Google les demande (content FR dans path EN)
      { source: "/en/blogue/:slug", destination: "/blogue/:slug", permanent: true },
      { source: "/en/blogue/:slug/:rest*", destination: "/blogue/:slug/:rest*", permanent: true },
      // /en/villes + /en/secteurs: vers la page service phare EN de la ville
      // (avant: vers /en = traité comme soft-404 par Google)
      { source: "/en/secteurs/:ville", destination: "/en/services/sealed-glass-replacement/:ville", permanent: true },
      { source: "/en/secteurs", destination: "/en", permanent: true },
      { source: "/en/villes/:ville.html", destination: "/en/services/sealed-glass-replacement/:ville", permanent: true },
      { source: "/en/villes/:ville", destination: "/en/services/sealed-glass-replacement/:ville", permanent: true },
      { source: "/en/carrieres", destination: "/en/contact?subject=careers", permanent: true },
      { source: "/en/panier", destination: "/panier", permanent: true },
      { source: "/en/rendez-vous", destination: "/en/contact", permanent: true },
      { source: "/en/services/calfeutrage", destination: "/services/calfeutrage", permanent: true },
      { source: "/en/services/calfeutrage/:ville", destination: "/services/calfeutrage/:ville", permanent: true },
      { source: "/en/services/reparation-porte-patio", destination: "/services/reparation-porte-patio", permanent: true },
      { source: "/en/services/reparation-porte-patio/:ville", destination: "/services/reparation-porte-patio/:ville", permanent: true },

      // ── Récupération des 404 /en/* générés par l'ancien sélecteur de langue ──
      // (2129 hits 404 en mai; les bots ont ces URLs en mémoire pour des mois)
      { source: "/en/calfeutrage/:ville", destination: "/services/calfeutrage/:ville", permanent: true },
      { source: "/en/guides/:slug*", destination: "/en/blogue", permanent: true },
      { source: "/en/outils/:slug*", destination: "/en/diagnostic", permanent: true },
      { source: "/en/copropriete/:slug+", destination: "/en/contact?subject=condos", permanent: true },
      { source: "/en/commercial/:slug+", destination: "/en/contact?subject=commercial", permanent: true },
      { source: "/en/mcp-docs", destination: "/mcp-docs", permanent: true },

      // Slugs anglais -> francais (pas de version EN dediee) + variantes :ville
      { source: "/services/door-insert", destination: "/services/insertion-porte", permanent: true },
      { source: "/services/door-insert/:ville", destination: "/services/insertion-porte/:ville", permanent: true },
      { source: "/services/wooden-door-repair", destination: "/services/reparation-portes-bois", permanent: true },
      { source: "/services/wooden-door-repair/:ville", destination: "/services/reparation-portes-bois/:ville", permanent: true },
      { source: "/services/sealed-glass-replacement", destination: "/services/remplacement-vitre-thermos", permanent: true },
      { source: "/services/sealed-glass-replacement/:ville", destination: "/services/remplacement-vitre-thermos/:ville", permanent: true },
      { source: "/services/hardware-replacement", destination: "/services/remplacement-quincaillerie", permanent: true },
      { source: "/services/hardware-replacement/:ville", destination: "/services/remplacement-quincaillerie/:ville", permanent: true },
      { source: "/services/custom-screen-doors", destination: "/services/moustiquaires-sur-mesure", permanent: true },
      { source: "/services/custom-screen-doors/:ville", destination: "/services/moustiquaires-sur-mesure/:ville", permanent: true },
      { source: "/services/caulking", destination: "/services/calfeutrage", permanent: true },
      { source: "/services/caulking/:ville", destination: "/services/calfeutrage/:ville", permanent: true },
      { source: "/services/defogging", destination: "/services/desembuage", permanent: true },
      { source: "/services/defogging/:ville", destination: "/services/desembuage/:ville", permanent: true },
      { source: "/services/weatherstripping", destination: "/services/coupe-froid", permanent: true },
      { source: "/services/weatherstripping/:ville", destination: "/services/coupe-froid/:ville", permanent: true },
    ];
  },
};

export default nextConfig;
