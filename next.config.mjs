/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["pdfkit"],
  experimental: {
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
    formats: ["image/webp", "image/avif"],
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

      // Anciennes URLs villes avec extension .html (vieille structure)
      { source: "/villes/:ville.html", destination: "/reparation-portes-et-fenetres/:ville", permanent: true },
      { source: "/villes/:ville", destination: "/reparation-portes-et-fenetres/:ville", permanent: true },
      { source: "/villes", destination: "/services", permanent: true },

      // Blog singulier "blog" -> pluriel "blogue"
      { source: "/blog", destination: "/blogue", permanent: true },
      { source: "/blog/:slug*", destination: "/blogue/:slug*", permanent: true },

      // EN: pages qui n'existent pas mais Google les demande (content FR dans path EN)
      { source: "/en/blogue/:slug", destination: "/blogue/:slug", permanent: true },
      { source: "/en/blogue/:slug/:rest*", destination: "/blogue/:slug/:rest*", permanent: true },
      { source: "/en/secteurs/:ville", destination: "/en", permanent: true },
      { source: "/en/secteurs", destination: "/en", permanent: true },
      { source: "/en/villes/:ville.html", destination: "/en", permanent: true },
      { source: "/en/villes/:ville", destination: "/en", permanent: true },
      { source: "/en/carrieres", destination: "/en/contact?subject=careers", permanent: true },
      { source: "/en/panier", destination: "/panier", permanent: true },
      { source: "/en/rendez-vous", destination: "/en/contact", permanent: true },
      { source: "/en/services/calfeutrage", destination: "/services/calfeutrage", permanent: true },
      { source: "/en/services/calfeutrage/:ville", destination: "/services/calfeutrage/:ville", permanent: true },
      { source: "/en/services/reparation-porte-patio", destination: "/services/reparation-porte-patio", permanent: true },
      { source: "/en/services/reparation-porte-patio/:ville", destination: "/services/reparation-porte-patio/:ville", permanent: true },

      // Slugs anglais -> francais (pas de version EN dediee)
      { source: "/services/door-insert", destination: "/services/insertion-porte", permanent: true },
      { source: "/services/wooden-door-repair", destination: "/services/reparation-portes-bois", permanent: true },
      { source: "/services/sealed-glass-replacement", destination: "/services/remplacement-vitre-thermos", permanent: true },
      { source: "/services/hardware-replacement", destination: "/services/remplacement-quincaillerie", permanent: true },
      { source: "/services/custom-screen-doors", destination: "/services/moustiquaires-sur-mesure", permanent: true },
      { source: "/services/caulking", destination: "/services/calfeutrage", permanent: true },
      { source: "/services/defogging", destination: "/services/desembuage", permanent: true },
      { source: "/services/weatherstripping", destination: "/services/coupe-froid", permanent: true },
    ];
  },
};

export default nextConfig;
