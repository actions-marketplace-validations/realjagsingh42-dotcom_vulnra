import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

// ── Security response headers ─────────────────────────────────────────────────
// Applied to every page and API route via the headers() config.
const SECURITY_HEADERS = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  // Limit cross-origin info leakage
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Strict Transport Security (1 year, include subdomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Content Security Policy
  // Notes:
  //   - 'unsafe-inline' for styles is required by Tailwind CSS v4 at runtime
  //   - 'unsafe-eval' for scripts is required by Next.js dev/hot-reload
  //   - connect-src includes Supabase REST + realtime endpoints
  //   - frame-src allows Supabase auth popups
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      [
        "connect-src 'self'",
        API_ORIGIN,
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "http://host.docker.internal:54321",
        "ws://host.docker.internal:54321",
        "http://localhost:54321",
        "http://127.0.0.1:54321",

      ].join(" "),
      "img-src 'self' data: https:",
      "frame-src 'self' https://*.supabase.co",
      "frame-ancestors 'self'",
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  // Performance optimizations
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
  // Compression
  compress: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
