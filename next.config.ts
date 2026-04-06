import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow cross-origin requests from Vercel preview URLs (optional)
  // experimental: { serverActions: { allowedOrigins: ['*.vercel.app'] } },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

