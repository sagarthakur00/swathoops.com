import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization with Vercel Blob CDN domain
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  // Production optimizations
  poweredByHeader: false,

  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Force-bundle all server packages (prevent Turbopack from externalizing Prisma)
  serverExternalPackages: [],

  // Exclude unnecessary files from serverless function file tracing
  outputFileTracingExcludes: {
    "/*": [
      "./public/**",
      "./scripts/**",
      "./.git/**",
      "./docker-compose.yml",
      "./Dockerfile",
    ],
  },

  // Output standalone only for Docker/self-hosted (not Vercel)
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
