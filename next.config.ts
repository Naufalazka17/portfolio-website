import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Abaikan TypeScript errors saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Abaikan ESLint errors saat build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;