import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
      },
      {
        protocol: 'https',
        hostname: 'financialmodelingprep.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.parqet.com',
      },
      {
        protocol: 'https',
        hostname: 'companiesmarketcap.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.brandfetch.io',
      },
    ],
  },
};

export default nextConfig;
