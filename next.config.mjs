/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      {
        source: "/secteurs/:ville",
        destination: "/reparation-portes-et-fenetres/:ville",
        permanent: true, // 301
      },
      {
        source: "/secteurs",
        destination: "/reparation-portes-et-fenetres",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
