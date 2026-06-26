import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  // Remark/rehype plugins (e.g., auto-linked headings or math) can be wired
  // here later if Module 3 prose demands it. Empty for the stub.
});

const config: NextConfig = {
  // Strict mode is on by default in Next.js 16
  // We are not using image optimization in Ship 1 (no images)
  // We are not using i18n in Ship 1 (English only)

  // Module 3 articles dynamic-import MDX from content/reference/<slug>.mdx
  // rather than file-based MDX routes, but extending pageExtensions keeps
  // future MDX-as-route experiments config-free.
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  // Pin the workspace root explicitly. Without this, Next.js scans upward
  // and may pick a stray lockfile in a parent directory as the root.
  // import.meta.dirname is native in Node 22+.
  turbopack: {
    root: import.meta.dirname,
  },

  // The dev-only /library tool uploads PDF reports via a Server Action. Next's
  // default Server Action body limit (1MB) rejects most real reports before the
  // handler runs; raise it to match the 25MB cap the action enforces itself.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
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

export default withMDX(config);
