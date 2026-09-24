/** @type {import('next').NextConfig} */

// Where Django is reachable from the Next.js server. The browser always talks
// to this app's own origin; /api, /accounts and /admin are proxied through,
// so session and CSRF cookies are first-party and no CORS is needed.
// In production a reverse proxy (see Caddyfile) usually routes these paths
// directly to Django and these rewrites are never hit.
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  // Django URLs rely on exact trailing slashes (e.g. /accounts/google/login/).
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Cloudinary images are resized by Cloudinary and rendered with
  // `unoptimized` (see src/utils/media.ts); Next only optimises local assets.
  async rewrites() {
    // Each prefix gets a trailing-slash rule first: `:path*` alone drops the
    // slash, and Django would answer with an endless APPEND_SLASH redirect.
    return ["api", "accounts", "admin", "static"].flatMap((prefix) => [
      {
        source: `/${prefix}/:path*/`,
        destination: `${BACKEND_URL}/${prefix}/:path*/`,
      },
      {
        source: `/${prefix}/:path*`,
        destination: `${BACKEND_URL}/${prefix}/:path*`,
      },
    ]);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
