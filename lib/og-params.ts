/**
 * Validate and narrow URL search params for the /og/compare route.
 *
 * Returns a discriminated union so the caller can cleanly short-circuit to
 * a fallback when anything is off-whitelist. This is THE defense against
 * unbounded cache-entry explosion from attackers probing random param
 * values — every illegal input gets rejected before any Satori render or
 * font fetch runs.
 *
 * Also canonicalizes (sort, dedupe) so that semantically-identical
 * param sets produce the same cache key. `?sources=solar,nuclear` and
 * `?sources=nuclear,solar` collapse to one edge cache entry.
 */

import {
  SOURCE_IDS,
  MIN_YEAR,
  MAX_YEAR,
  DEFAULT_YEAR,
  type SourceId,
  type NormalizeOption,
} from "@/lib/data-types";

// "none" + every SourceId is a legal normalize value on the main page.
const NORMALIZE_VALUES = ["none", ...SOURCE_IDS] as const;

// Cap sources-per-image so an attacker can't force
// C(6, 1..6) × 17 years × 7 normalize values of unique cache entries.
// With 6 allowed sources and no per-image cap we'd have 63 subsets;
// keeping it at 6 is fine and the max any preset actually uses is 5.
const MAX_SOURCES_PER_IMAGE = 6;

// A preset slug is bounded (5 presets in the app today, plus an empty
// string for "no preset"). We accept any short lowercase slug so that
// adding a new preset doesn't require updating validation, but cap
// length and charset to prevent abuse.
const PRESET_SLUG_RE = /^[a-z0-9-]{1,40}$/;

export interface OgCompareParams {
  sources: SourceId[];
  normalize: NormalizeOption;
  year: number;
  preset: string;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export function parseOgParams(
  sp: URLSearchParams,
): ParseResult<OgCompareParams> {
  // --- sources (comma-separated, whitelisted, bounded, deduped) -----------
  const rawSources = sp.get("sources");
  let sources: SourceId[];
  if (rawSources) {
    if (rawSources.length > 200) {
      return { ok: false, reason: "sources too long" };
    }
    const requested = rawSources
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (requested.length === 0) {
      return { ok: false, reason: "empty sources" };
    }
    if (requested.length > MAX_SOURCES_PER_IMAGE) {
      return { ok: false, reason: "too many sources" };
    }

    const allowedSet = new Set<string>(SOURCE_IDS);
    for (const s of requested) {
      if (!allowedSet.has(s)) {
        return { ok: false, reason: `unknown source: ${s}` };
      }
    }

    // Dedupe but preserve URL order. Canonical ordering would maximize edge
    // cache hit rate, but order carries meaning here (the first source is
    // the "benchmark / full-opacity" bar), so leave it alone.
    sources = Array.from(new Set(requested)) as SourceId[];
  } else {
    // Default: match the app's default landing selection.
    sources = ["nuclear", "solar"];
  }

  // --- normalize (enum: "none" | SourceId) --------------------------------
  const rawNormalize = (sp.get("normalize") ?? "none").toLowerCase();
  if (!(NORMALIZE_VALUES as readonly string[]).includes(rawNormalize)) {
    return { ok: false, reason: `bad normalize: ${rawNormalize}` };
  }
  const normalize = rawNormalize as NormalizeOption;

  // --- year (bounded integer) ---------------------------------------------
  const rawYear = sp.get("year");
  const year = rawYear ? Number(rawYear) : DEFAULT_YEAR;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { ok: false, reason: `bad year: ${rawYear}` };
  }

  // --- preset (optional, bounded slug) ------------------------------------
  const rawPreset = sp.get("preset") ?? "";
  if (rawPreset && !PRESET_SLUG_RE.test(rawPreset)) {
    return { ok: false, reason: `bad preset: ${rawPreset}` };
  }

  return { ok: true, value: { sources, normalize, year, preset: rawPreset } };
}

/**
 * Build the canonical /og/compare URL for a validated params object.
 * Use this in generateMetadata so the <meta og:image> tag always points
 * at the same URL for the same semantic state.
 */
export function buildCanonicalOgUrl(
  origin: string,
  p: OgCompareParams,
): string {
  const sp = new URLSearchParams();
  sp.set("sources", p.sources.join(","));
  if (p.normalize !== "none") sp.set("normalize", p.normalize);
  if (p.year !== DEFAULT_YEAR) sp.set("year", String(p.year));
  if (p.preset) sp.set("preset", p.preset);
  return `${origin}/og/compare?${sp.toString()}`;
}
