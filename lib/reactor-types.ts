import type { Citation } from "./data-types";

/**
 * Reactor types — Module 2 type definitions.
 *
 * Types only, no data. Data lives in data-src/reactor-taxonomy.ts and
 * data-src/reactors.ts, following the same pattern as Module 1's
 * data-src/sources.ts.
 *
 * The build script (scripts/build-data.ts) compiles:
 *   data-src/reactor-taxonomy.ts ──▶ public/data/taxonomy.json
 *   data-src/reactors.ts         ──▶ public/data/reactors.json
 *
 * The validator (scripts/validate-data.ts) enforces schema correctness,
 * citation allowlist membership, plausibility bounds, and tag validity.
 */

// ─── Fuel IDs ───────────────────────────────────────────────────────
export type FuelId =
  | "leu-uo2"
  | "haleu-metal"
  | "triso"
  | "molten-fuel-salt"
  | "thorium"
  | "mox";

export const FUEL_IDS: readonly FuelId[] = [
  "leu-uo2",
  "haleu-metal",
  "triso",
  "molten-fuel-salt",
  "thorium",
  "mox",
] as const;

// ─── Coolant IDs ────────────────────────────────────────────────────
export type CoolantId =
  | "light-water"
  | "heavy-water"
  | "helium"
  | "flibe-salt"
  | "sodium"
  | "lead"
  | "heat-pipes";

export const COOLANT_IDS: readonly CoolantId[] = [
  "light-water",
  "heavy-water",
  "helium",
  "flibe-salt",
  "sodium",
  "lead",
  "heat-pipes",
] as const;

// ─── X-Factor IDs ───────────────────────────────────────────────────
// Single flat union. The `group` field on each tag distinguishes
// "scale" from "capability" for UI rendering. The matching function
// treats all X-Factor tags identically (OR within dimension).
export type XFactorId =
  | "micro"
  | "small"
  | "mid"
  | "large"
  | "walk-away-safe"
  | "load-following"
  | "process-heat"
  | "thermal-storage"
  | "first-of-kind-licensed"
  | "fuel-breeder"
  | "waste-burner"
  | "non-proliferative";

export const X_FACTOR_IDS: readonly XFactorId[] = [
  "micro",
  "small",
  "mid",
  "large",
  "walk-away-safe",
  "load-following",
  "process-heat",
  "thermal-storage",
  "first-of-kind-licensed",
  "fuel-breeder",
  "waste-burner",
  "non-proliferative",
] as const;

export type XFactorGroup = "scale" | "capability";

// ─── Taxonomy tag ───────────────────────────────────────────────────
// Every F/C/X chip in the UI renders from one of these.
export interface TaxonomyTag {
  id: string;
  label: string;
  /** ≤1 sentence shown on the chip tooltip / first line of popover. */
  oneLineHook: string;
  /** ≤1 paragraph shown in the tag popover body. */
  popoverBody: string;
  /** X-Factor tags only: which visual sub-group in the UI. */
  group?: XFactorGroup;
  /** ≥1 citation per tag. Every citation must pass the allowlist. */
  citations: Citation[];
}

// ─── Reactor design ─────────────────────────────────────────────────
// One entry per historical or in-development reactor design.

export interface WhyChainStep {
  /** Plain-English statement (e.g., "Uses HALEU metal fuel"). */
  text: string;
  /** Optional tag ID this step references (renders as a popover link). */
  tagRef?: FuelId | CoolantId | XFactorId;
}

export interface ReactorDesign {
  id: string;
  name: string;
  /** 1-2 sentence description of what this reactor is. */
  description: string;
  /** Company or national lab pursuing this design. Name + public URL only. */
  pursuedBy: ReadonlyArray<{ name: string; url: string }>;
  fuelTags: FuelId[];
  coolantTags: CoolantId[];
  xFactorTags: XFactorId[];
  /** Coolant outlet temperature in °C. Used in the spec card. */
  outletTempC: number;
  /** Neutron spectrum. */
  spectrum: "thermal" | "fast" | "epithermal";
  /** "Why this design?" expandable logic chain. 3-5 steps per design. */
  whyChain: WhyChainStep[];
  /** ≥1 citation per design. */
  citations: Citation[];
}

// ─── Taxonomy collections ───────────────────────────────────────────
// What data-src/reactor-taxonomy.ts exports.
export interface ReactorTaxonomy {
  fuelTags: ReadonlyArray<TaxonomyTag & { id: FuelId }>;
  coolantTags: ReadonlyArray<TaxonomyTag & { id: CoolantId }>;
  xFactorTags: ReadonlyArray<TaxonomyTag & { id: XFactorId; group: XFactorGroup }>;
}

// ─── Output JSON shapes ─────────────────────────────────────────────
// What build-data.ts writes to public/data/.
export interface TaxonomyJson {
  lastUpdated: string;
  schemaVersion: 1;
  fuel: ReadonlyArray<TaxonomyTag>;
  coolant: ReadonlyArray<TaxonomyTag>;
  xFactor: ReadonlyArray<TaxonomyTag>;
}

export interface ReactorsJson {
  lastUpdated: string;
  schemaVersion: 1;
  reactors: ReadonlyArray<ReactorDesign>;
}

// ─── Plausibility bounds ────────────────────────────────────────────
// The validator enforces these ranges for reactor numeric fields.
export const REACTOR_PLAUSIBILITY_BOUNDS = {
  outletTempC: { min: 0, max: 1200 },
} as const;
