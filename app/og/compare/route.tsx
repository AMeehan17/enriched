/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { sources as allSources } from "@/data-src/sources";
import { presets as allPresets } from "@/data-src/presets";
import {
  NUMERIC_DIMENSION_IDS,
  type NumericDimensionId,
  type Source,
  type SourceId,
} from "@/lib/data-types";
import { parseOgParams } from "@/lib/og-params";
import { loadFamily } from "@/lib/og-fonts";
import { adjustConstructionTimeForCF } from "@/lib/chart-math";

/**
 * /og/compare — dynamic OG image renderer.
 *
 * Reads the same URL params as /compare (sources, normalize, year, preset)
 * and renders a 1200×630 PNG showing the selected comparison as a short
 * bar chart on one dimension. The page's generateMetadata points at this
 * route so every shared /compare URL unfurls into a proper preview.
 *
 * Runtime: Node (not Edge). Fluid Compute gives us a large heap for the
 * font fetches, and the warm-instance reuse means subsequent requests on
 * the same box are free (fonts hit the module-scope cache).
 */

export const runtime = "nodejs";

// Never statically prerender — the output depends on query params.
export const dynamic = "force-dynamic";

// Tokens that mirror globals.css. Kept here as plain values because
// Satori can't read CSS variables.
const COLORS = {
  bg: "#FAF9F6",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  textFaint: "#9A9591",
  rule: "#E8E5DE",
  accent: "#D04A1F",
  accentSoft: "#F4E4DD",
} as const;

/**
 * Stripe patterns paired 1:1 with opacity cycling so color-blind readers
 * can tell bars apart by texture. Index 0 stays solid (the anchor / full
 * opacity bar). The same patterns exist as CSS classes in globals.css for
 * the live site — keeping them visually identical means the OG unfurl
 * and the actual site look like the same product.
 *
 * Satori supports `linear-gradient` backgrounds and `backgroundSize`, so
 * the classic 4-stop 45° trick renders faithfully. `repeating-linear-
 * gradient` is less certain in Satori, so we use the fixed 4-stop pattern
 * which is well-documented to work.
 */
const BAR_PATTERNS: ReadonlyArray<{
  backgroundImage: string;
  backgroundSize: string;
} | null> = [
  null, // idx 0: solid baseline
  {
    backgroundImage:
      "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
    backgroundSize: "14px 14px",
  },
  {
    backgroundImage:
      "linear-gradient(135deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
    backgroundSize: "14px 14px",
  },
  {
    backgroundImage:
      "linear-gradient(90deg, rgba(0,0,0,0.22) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.22) 75%, transparent 75%, transparent)",
    backgroundSize: "10px 10px",
  },
];

// Human-readable labels for the OG image. Intentionally concise — these
// render at 24–32px and long strings wrap awkwardly in Satori. Mirrors
// DIMENSION_META in ChartGrid but shorter where it helps.
const OG_DIMENSION_LABEL: Record<NumericDimensionId, { label: string; unit: string }> = {
  capacityFactor: { label: "Capacity Factor", unit: "% of theoretical max" },
  landUse: { label: "Land Use", unit: "km² per TWh / year" },
  lifecycleCO2: { label: "Lifecycle CO₂", unit: "gCO₂eq / kWh" },
  deathsPerTWh: { label: "Deaths per TWh", unit: "incl. air pollution" },
  lcoe: { label: "Levelized Cost", unit: "$ / MWh" },
  energyDensity: { label: "Energy Density", unit: "MJ / kg" },
  constructionTime: { label: "Construction Time", unit: "yr to deliver 1 GW avg" },
};

function formatDisplayValue(value: number, dimId: NumericDimensionId): string {
  if (value === 0) return "N/A";
  switch (dimId) {
    case "capacityFactor":
      return `${value.toFixed(1)}%`;
    case "landUse":
      return value < 1 ? value.toFixed(1) : value.toFixed(0);
    case "lifecycleCO2":
      return value.toFixed(0);
    case "deathsPerTWh":
      return value < 1 ? value.toFixed(2) : value.toFixed(1);
    case "lcoe":
      return `$${value.toFixed(0)}`;
    case "energyDensity":
      return value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
          ? `${(value / 1_000).toFixed(0)}k`
          : value.toFixed(0);
    case "constructionTime":
      return `${value.toFixed(1)} yr`;
  }
}

/**
 * Pick the dimension to highlight in the OG image.
 *
 * Rule: if a preset is active and its highlightedDimensions list has a
 * numeric entry where every selected source has a non-zero value, use
 * that — it's the story the preset is telling. Otherwise fall back to
 * capacityFactor, which is the most universally applicable dimension
 * (bounded 0–100, non-zero for every source).
 */
function pickDimension(
  sources: ReadonlyArray<Source>,
  presetSlug: string,
): NumericDimensionId {
  const preset = presetSlug ? allPresets.find((p) => p.slug === presetSlug) : undefined;
  if (preset) {
    for (const hd of preset.highlightedDimensions) {
      if (!isNumericDim(hd)) continue;
      // Reject if any selected source has a zero value (e.g. energy density
      // with solar in the mix — would render as a zero-width bar).
      const allNonZero = sources.every((s) => s[hd].value > 0);
      if (allNonZero) return hd;
    }
  }
  return "capacityFactor";
}

function isNumericDim(d: string): d is NumericDimensionId {
  return (NUMERIC_DIMENSION_IDS as ReadonlyArray<string>).includes(d);
}

function resolveDisplay(source: Source, dimId: NumericDimensionId, year: number): number {
  const dim = source[dimId];
  // Match the chart's year-resolution logic for time-varying dimensions.
  let raw = dim.value;
  if (dim.history) {
    const historical = dim.history.find((h) => h.year === year);
    if (historical) raw = historical.value;
  }
  // Construction time renders as CF-adjusted years, same as the chart.
  if (dimId === "constructionTime") {
    const cf = source.capacityFactor.history?.find((h) => h.year === year)?.value
      ?? source.capacityFactor.value;
    return adjustConstructionTimeForCF(raw, cf);
  }
  return raw;
}

export async function GET(req: NextRequest) {
  try {
    return await renderOgImage(req);
  } catch (err) {
    // Observability: land in Vercel's function logs so cold-start font
    // fetch failures or Satori layout errors are debuggable post-hoc.
    // We return a plain 500 rather than a placeholder image so the
    // social crawler reveals the failure rather than caching bad output.
    console.error("[og/compare] render failed", {
      url: req.url,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response(
      JSON.stringify({
        error: "og render failed",
        message: err instanceof Error ? err.message : "unknown",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

async function renderOgImage(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = parseOgParams(url.searchParams);

  // On any validation failure, bail out with a tiny "invalid params" card
  // instead of redirecting to a static fallback. This keeps the implementation
  // simple (one route, one PNG) and is still cheap because there's no font
  // fetch on this path.
  if (!parsed.ok) {
    return new Response(
      JSON.stringify({ error: "invalid params", detail: parsed.reason }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const { sources: sourceIds, year, preset } = parsed.value;

  // Resolve IDs to Source objects. Drop any we can't find (shouldn't happen
  // given the whitelist, but be defensive).
  const selectedSources: Source[] = sourceIds
    .map((id) => allSources.find((s) => s.id === id))
    .filter((s): s is Source => s !== undefined);

  // Pick the dimension to render bars for.
  const dimId = pickDimension(selectedSources, preset);
  const meta = OG_DIMENSION_LABEL[dimId];

  // Compute the max value among selected sources so bars scale against
  // their own local range. For capacityFactor we use 100 so the scale is
  // the natural ceiling.
  const maxVal = dimId === "capacityFactor"
    ? 100
    : Math.max(
        ...selectedSources.map((s) => resolveDisplay(s, dimId, year)),
        1,
      );

  // Preset title/subtitle (only when a preset is active). Keep short —
  // long strings wrap weird in Satori.
  const presetObj = preset ? allPresets.find((p) => p.slug === preset) : undefined;
  const heroTitle = presetObj?.title ?? "Compare Energy Sources";

  // Build the text subset for font loading. Only include glyphs that
  // actually appear in this render — dramatically shrinks the payload.
  const dynamicText = [
    "ENRICHED",
    "MODULE",
    "01",
    "COMPARE",
    heroTitle,
    meta.label.toUpperCase(),
    meta.unit,
    `${year}`,
    "enriched-delta.vercel.app",
    ...selectedSources.map((s) => s.label),
    ...selectedSources.map((s) => formatDisplayValue(resolveDisplay(s, dimId, year), dimId)),
  ].join(" ");
  // Include every ASCII char we might emit plus the handful of symbols
  // (·, ², ₂, ⁂) the layout uses, so glyph subsetting doesn't strip them.
  const allText =
    dynamicText +
    " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·²₂/$%.,-—·/";

  const [splineMono, instrument, jetbrains] = await Promise.all([
    loadFamily("Spline Sans Mono", [500], allText),
    loadFamily("Instrument Sans", [400], allText),
    loadFamily("JetBrains Mono", [500], allText),
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
          fontFamily: "Instrument Sans",
          padding: "56px 64px",
        }}
      >
        {/* Top bar — brand mark left, domain right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: "Spline Sans Mono",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 1.5,
            color: COLORS.textMuted,
            textTransform: "uppercase",
          }}
        >
          <span>// ENRICHED · MODULE 01</span>
          <span style={{ color: COLORS.accent }}>/ COMPARE</span>
        </div>

        {/* Hero title */}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontFamily: "Spline Sans Mono",
            fontSize: 60,
            fontWeight: 500,
            letterSpacing: -1.5,
            lineHeight: 1.05,
            color: COLORS.text,
            maxWidth: "100%",
          }}
        >
          {heroTitle}
        </div>

        {/* Dimension header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: 36,
            paddingBottom: 10,
            borderBottom: `1px solid ${COLORS.rule}`,
            fontFamily: "Spline Sans Mono",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: COLORS.text,
          }}
        >
          <span>{meta.label} · {year}</span>
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 14,
              textTransform: "none",
              letterSpacing: 0,
              color: COLORS.textFaint,
            }}
          >
            {meta.unit}
          </span>
        </div>

        {/* Bar rows */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 20, gap: 14 }}>
          {selectedSources.map((source, idx) => {
            const value = resolveDisplay(source, dimId, year);
            const widthPct = maxVal > 0 ? Math.max(2, (value / maxVal) * 100) : 0;
            // Rust accent with stepped opacity so the first (benchmark) bar
            // is boldest. Mirrors the site's BAR_OPACITIES pattern.
            const opacity = idx === 0 ? 1 : idx === 1 ? 0.55 : idx === 2 ? 0.32 : 0.2;
            // Pattern overlay for color-blind distinguishability. Paired
            // 1:1 with opacity — idx 0 stays solid as the visual anchor.
            const pattern = BAR_PATTERNS[Math.min(idx, BAR_PATTERNS.length - 1)];
            return (
              <div
                key={source.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    display: "flex",
                    width: 180,
                    fontFamily: "Spline Sans Mono",
                    fontSize: 22,
                    fontWeight: 500,
                    color: COLORS.text,
                    justifyContent: "flex-end",
                  }}
                >
                  {source.label}
                </div>
                {/* Bar + track */}
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 32,
                    background: COLORS.rule,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${widthPct}%`,
                      height: "100%",
                      backgroundColor: COLORS.accent,
                      opacity,
                      ...(pattern ?? {}),
                    }}
                  />
                </div>
                {/* Value */}
                <div
                  style={{
                    display: "flex",
                    width: 120,
                    fontFamily: "JetBrains Mono",
                    fontSize: 24,
                    fontWeight: 500,
                    color: COLORS.text,
                    justifyContent: "flex-end",
                  }}
                >
                  {formatDisplayValue(value, dimId)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer — pushed to the bottom via marginTop:auto */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "auto",
            fontFamily: "JetBrains Mono",
            fontSize: 16,
            color: COLORS.textFaint,
          }}
        >
          <span>enriched-delta.vercel.app</span>
          <span>{selectedSources.length} sources · cited</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...splineMono, ...instrument, ...jetbrains],
      headers: {
        // 1 hour in browsers, 7 days on the edge, 30 days SWR.
        // Short enough to propagate design fixes within a week; long
        // enough that unfurl bots hit the edge, not the function.
        "cache-control":
          "public, immutable, no-transform, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
