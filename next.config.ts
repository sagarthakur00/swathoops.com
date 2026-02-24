import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization in production with proper domains
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
  },

  // Production optimizations
  poweredByHeader: false,

  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Output standalone for containerized deployments
  output: "standalone",
};

export default nextConfig;
