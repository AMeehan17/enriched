/**
 * Data types — single source of truth for the Enriched data schema.
 *
 * The build script (scripts/build-data.ts) compiles `data-src/sources.ts`
 * and `data-src/presets.ts` to `public/data/*.json` files. The validator
 * script enforces these types plus runtime plausibility checks.
 *
 *   data-src/sources.ts ─┐
 *                        ├── scripts/build-data.ts ──▶ public/data/sources.json
 *   data-src/presets.ts ─┘                            public/data/presets.json
 *
 * Server components import data-src/* directly via TypeScript imports.
 * The public JSON files exist for external consumers (researchers, journalists,
 * other sites) but the React tree reads the typed source.
 */

// ─── Source IDs ──────────────────────────────────────────────────────
// The 6 energy sources we compare in Ship 1. Adding a new source means
// adding it here, then to data-src/sources.ts. Type system prevents typos.
export type SourceId = "nuclear" | "solar" | "wind" | "gas" | "coal" | "hydro";

export const SOURCE_IDS: readonly SourceId[] = [
  "nuclear",
  "solar",
  "wind",
  "gas",
  "coal",
  "hydro",
] as const;

// ─── Dimension IDs ───────────────────────────────────────────────────
// The 8 dimensions across which sources are compared.
// LCOE and capacityFactor are NUMERIC and time-varying (have history series).
// The other 6 are NUMERIC but mostly static (no time series).
// dispatchability is CATEGORICAL — see DimensionKind below.
export type NumericDimensionId =
  | "capacityFactor"
  | "landUse"
  | "lifecycleCO2"
  | "deathsPerTWh"
  | "lcoe"
  | "energyDensity"
  | "constructionTime";

export type CategoricalDimensionId = "dispatchability";

export type DimensionId = NumericDimensionId | CategoricalDimensionId;

export const NUMERIC_DIMENSION_IDS: readonly NumericDimensionId[] = [
  "capacityFactor",
  "landUse",
  "lifecycleCO2",
  "deathsPerTWh",
  "lcoe",
  "energyDensity",
  "constructionTime",
] as const;

export const CATEGORICAL_DIMENSION_IDS: readonly CategoricalDimensionId[] = [
  "dispatchability",
] as const;

export const ALL_DIMENSION_IDS: readonly DimensionId[] = [
  ...NUMERIC_DIMENSION_IDS,
  ...CATEGORICAL_DIMENSION_IDS,
] as const;

// Dimensions that have genuine annual time series in the data.
// Other dimensions render as static lines on the year slider.
export const TIME_VARYING_DIMENSION_IDS: readonly NumericDimensionId[] = [
  "lcoe",
  "capacityFactor",
] as const;

// ─── Year range ──────────────────────────────────────────────────────
export const MIN_YEAR = 2010;
export const MAX_YEAR = 2026;
export const DEFAULT_YEAR = 2024;

// ─── Citation ────────────────────────────────────────────────────────
// Every data point carries a complete citation object. The bibtex_key
// pattern is {author}{year}{shortname}_{source-id} to guarantee
// uniqueness across the dataset (e.g., lazard2024lcoe_nuclear).
//
// The validator catches duplicate keys at build time.
//
// Module 3 reference articles reuse this same shape via the optional
// fields below; one citation library serves both modules.
export interface Citation {
  /** Unique key for BibTeX export. Pattern: {author}{year}{shortname}_{source-id}. Lowercase, no spaces. */
  bibtex_key: string;
  author: string;
  title: string;
  year: number;
  /** Optional version (e.g., "v16.0" for Lazard reports). */
  version?: string;
  /** Optional publisher name. Defaults to author when omitted. */
  publisher?: string;
  url: string;
  /** ISO date string (YYYY-MM-DD) when the citation was last verified. */
  accessed: string;
  /** Optional DOI for peer-reviewed papers. */
  doi?: string;
  /** Optional page reference (e.g., "p. 12", "pp. 45–47"). */
  page?: string;
  /** Optional editorial note shown in the bibliography under the citation. */
  note?: string;
}

// ─── Numeric dimension value ─────────────────────────────────────────
// A scalar value with unit, citation, and optional notes.
// Time-varying dimensions also include a `history` array.
export interface NumericDimensionValue {
  value: number;
  unit: string;
  citation: Citation;
  /** Optional explanatory note shown on hover or in the cite popover. */
  note?: string;
  /** Optional time series. Required for LCOE and capacityFactor. */
  history?: ReadonlyArray<{
    year: number;
    value: number;
    citation?: Citation;
  }>;
  /** Optional minimum threshold below which "normalize to" falls back to absolute. */
  normalizeThreshold?: number;
}

// ─── Categorical dimension value ─────────────────────────────────────
// dispatchability is the only Ship 1 categorical. Future categoricals
// may follow the same shape.
export type DispatchabilityCategory =
  | "yes-baseload"
  | "yes-dispatchable"
  | "intermittent"
  | "variable";

export interface CategoricalDimensionValue {
  category: DispatchabilityCategory;
  /** Human-readable label (e.g., "Yes (baseload)"). */
  label: string;
  citation: Citation;
  note?: string;
}

// ─── Source ──────────────────────────────────────────────────────────
// One energy source with values for every dimension.
export interface Source {
  id: SourceId;
  label: string;
  /** Optional short blurb (1-2 sentences). Shown in the about page. */
  blurb?: string;
  // Numeric dimensions
  capacityFactor: NumericDimensionValue;
  landUse: NumericDimensionValue;
  lifecycleCO2: NumericDimensionValue;
  deathsPerTWh: NumericDimensionValue;
  lcoe: NumericDimensionValue;
  energyDensity: NumericDimensionValue;
  constructionTime: NumericDimensionValue;
  // Categorical dimensions
  dispatchability: CategoricalDimensionValue;
}

// ─── Preset ──────────────────────────────────────────────────────────
// A curated comparison configuration that loads via /compare?preset=<slug>.
export type NormalizeOption = SourceId | "none";

export interface Preset {
  slug: string;
  title: string;
  description: string;
  sources: ReadonlyArray<SourceId>;
  normalize: NormalizeOption;
  year: number;
  /** Dimensions the preset wants to highlight (rendered with rust accent line). */
  highlightedDimensions: ReadonlyArray<DimensionId>;
  /** One-line rhetorical framing shown in the preset banner. */
  rhetoricalPoint: string;
}

// ─── Output JSON shape ───────────────────────────────────────────────
// What the build script writes to public/data/sources.json and presets.json.
export interface SourcesJson {
  /** ISO timestamp of the build. */
  lastUpdated: string;
  /** Schema version, in case we ever need to migrate. */
  schemaVersion: 1;
  sources: ReadonlyArray<Source>;
}

export interface PresetsJson {
  lastUpdated: string;
  schemaVersion: 1;
  presets: ReadonlyArray<Preset>;
}

// ─── Plausibility bounds ─────────────────────────────────────────────
// The validator enforces these ranges. Values outside the bounds throw
// a build error with the offending field path. Catches typo/unit errors.
export const PLAUSIBILITY_BOUNDS: Readonly<
  Record<NumericDimensionId, { min: number; max: number }>
> = {
  capacityFactor: { min: 0, max: 100 },
  landUse: { min: 0, max: 1000 },
  lifecycleCO2: { min: 0, max: 2000 },
  deathsPerTWh: { min: 0, max: 100 },
  lcoe: { min: 0, max: 1000 },
  energyDensity: { min: 0, max: 100_000_000 },
  constructionTime: { min: 0, max: 30 },
} as const;
