import type { NextConfig } from "next";

const config: NextConfig = {
  // Strict mode is on by default in Next.js 16
  // We are not using image optimization in Ship 1 (no images)
  // We are not using i18n in Ship 1 (English only)

  // Pin the workspace root explicitly. Without this, Next.js scans upward
  // and may pick a stray lockfile in a parent directory as the root.
  // import.meta.dirname is native in Node 22+.
  turbopack: {
    root: import.meta.dirname,
  },

  // Cache static data files aggressively. Browsers and CDNs hold them for 1h,
  // then revalidate in background. This is the `headers` config method on
  // NextConfig — long-standing API for declaring response headers.
  async headers() {
    return [
      {
        source: "/data/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default config;
