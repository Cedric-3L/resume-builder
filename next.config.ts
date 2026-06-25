import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [],
  },

  // Disable x-powered-by
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Output as standalone for better deployment
  output: "standalone",

  // Strict TypeScript and ESLint in production builds
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
