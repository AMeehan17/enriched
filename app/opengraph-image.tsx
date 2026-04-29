import { ImageResponse } from "next/og";
import { loadFamily } from "@/lib/og-fonts";

/**
 * Root-level OG image — the brand/typography card.
 *
 * Serves as the default unfurl for any page that doesn't supply its own
 * `openGraph.images` via generateMetadata. /compare overrides this with
 * its dynamic data-card chart at app/og/compare/route.tsx; everything
 * else inherits this typography card by Next.js's metadata file
 * convention.
 *
 * Design follows DESIGN.md: warm off-white bg, rust accent dot on the
 * wordmark, Spline Sans Mono for display + Instrument Sans for body, a
 * hairline rule above the footer. No icons, no shadows, no gradients.
 *
 * Runtime: Node.js (Fluid Compute). The /og/compare route also uses
 * Node.js — keeping this consistent so the module-scope font cache in
 * lib/og-fonts.ts is shared across both render paths on warm instances.
 */

export const runtime = "nodejs";
export const alt = "Enriched — Interactive Nuclear Energy Education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  bg: "#FAF9F6",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  textFaint: "#6F6963",
  ruleStrong: "#D8D4CC",
  accent: "#D04A1F",
} as const;

export default async function OpengraphImage() {
  const headline = "Enriched.";
  const tagline = "Interactive nuclear energy education.";
  const body =
    "Compare energy sources across eight dimensions. Every number is cited. Draw your own conclusions.";
  const footerLeft = "// open-source · cited · MIT";
  const footerRight = "enriched-delta.vercel.app";

  // Glyph subset — every character that appears in the render plus the
  // ASCII range we want available if any of the strings change. Keeps
  // each loaded weight well under the 500 KB ImageResponse budget.
  const text =
    headline +
    tagline +
    body +
    footerLeft +
    footerRight +
    " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·.,—-/";

  const [splineMono, instrument] = await Promise.all([
    loadFamily("Spline Sans Mono", [500, 600], text),
    loadFamily("Instrument Sans", [400], body),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily: "Spline Sans Mono",
          padding: "80px 88px",
          justifyContent: "space-between",
        }}
      >
        {/* Top: brand mark spacer — empty to push content down. The
            hero block sits at the optical-center of the frame, which
            looks better in unfurl thumbnails than truly vertical
            centering. */}
        <div style={{ display: "flex", height: 32 }} />

        {/* Middle: wordmark + tagline + body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 168,
              fontWeight: 600,
              letterSpacing: -5,
              lineHeight: 1,
              color: COLORS.text,
            }}
          >
            <span>Enriched</span>
            <span style={{ color: COLORS.accent }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: -0.5,
              lineHeight: 1.25,
              color: COLORS.text,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Sans",
              fontSize: 24,
              fontWeight: 400,
              lineHeight: 1.45,
              color: COLORS.textMuted,
              maxWidth: 880,
            }}
          >
            {body}
          </div>
        </div>

        {/* Bottom: hairline rule + footer row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              height: 1,
              background: COLORS.ruleStrong,
              width: "100%",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 0.5,
              color: COLORS.textFaint,
            }}
          >
            <span>{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [...splineMono, ...instrument],
      headers: {
        // Match /og/compare's caching policy: 1h browser, 7d edge,
        // 30d SWR. Long enough that crawlers hit the edge, short
        // enough that brand fixes propagate within a week.
        "cache-control":
          "public, immutable, no-transform, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
