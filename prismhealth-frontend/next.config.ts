import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Note: headers are not supported with static export
  // COOP/COEP headers should be set at server/CDN level
};

export default nextConfig;
