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
 *
 * SCHEMA v2 (2026-04-20): the fuel dimension split into fissile element,
 * (conditional) kickstarter, and fuel form. Coolant dimension expanded
 * to include specific salt chemistries and liquid metal species.
 * Added `reactorType` as a derived PRIS-sourced field on each design.
 */

// ─── Fissile element IDs ────────────────────────────────────────────
// What atom is actually undergoing fission. Independent of physical form.
export type FuelMaterialId = "u-235" | "th-232" | "pu-239";

export const FUEL_MATERIAL_IDS: readonly FuelMaterialId[] = [
  "u-235",
  "th-232",
  "pu-239",
] as const;

// ─── Kickstarter IDs ────────────────────────────────────────────────
// Th-232 is not itself fissile — thorium reactors need a fissile starter
// to get the chain reaction going. This dimension is only meaningful
// when fissile element = th-232.
export type KickstarterId = "u-235-kickstart" | "pu-239-kickstart";

export const KICKSTARTER_IDS: readonly KickstarterId[] = [
  "u-235-kickstart",
  "pu-239-kickstart",
] as const;

// ─── Fuel form IDs ──────────────────────────────────────────────────
// How the fissile material is physically packaged.
// - ceramic-pellets: traditional UO₂ pellets in zirconium cladding (LWR fuel)
// - metal: metallic fuel rods (fast reactors, HALEU metal)
// - triso: ceramic particles with built-in containment layers
// - molten-salt: fuel dissolved in a liquid salt carrier — COUPLING: locks
//   coolant to a salt chemistry (FLiBe / FLiNaK / Chloride)
export type FuelFormId =
  | "ceramic-pellets"
  | "metal"
  | "triso"
  | "molten-salt";

export const FUEL_FORM_IDS: readonly FuelFormId[] = [
  "ceramic-pellets",
  "metal",
  "triso",
  "molten-salt",
] as const;

// ─── Coolant IDs ────────────────────────────────────────────────────
// Expanded in schema v2: salt chemistries split into 3, liquid metal
// split into 3. Water stays unified — BWR/PWR/PHWR distinction lives
// on the reactorType field of each design, not in the coolant dimension.
export type CoolantId =
  | "light-water"
  | "heavy-water"
  | "helium"
  | "flibe"
  | "flinak"
  | "chloride-salt"
  | "sodium"
  | "lead"
  | "lead-bismuth"
  | "heat-pipes";

export const COOLANT_IDS: readonly CoolantId[] = [
  "light-water",
  "heavy-water",
  "helium",
  "flibe",
  "flinak",
  "chloride-salt",
  "sodium",
  "lead",
  "lead-bismuth",
  "heat-pipes",
] as const;

// Salt-family coolants — when fuel form = molten-salt, only these are
// selectable. The UI dims non-salt coolants and the matching function
// enforces the coupling.
export const SALT_COOLANT_IDS: readonly CoolantId[] = [
  "flibe",
  "flinak",
  "chloride-salt",
] as const;

// ─── X-Factor IDs (unchanged from v1) ───────────────────────────────
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

// ─── Reactor type (derived from PRIS, shown on match cards) ─────────
// Not a user-pickable dimension — a consequence of the F/C/X choices.
// Displayed on the MatchCard as "Type: PWR" etc.
export type ReactorType =
  | "PWR"   // Pressurized water reactor (most common)
  | "BWR"   // Boiling water reactor (direct cycle)
  | "PHWR"  // Pressurized heavy water reactor (CANDU)
  | "HTGR"  // High-temperature gas-cooled reactor
  | "SFR"   // Sodium-cooled fast reactor
  | "LFR"   // Lead-cooled fast reactor
  | "MSR"   // Molten salt reactor
  | "other";

export const REACTOR_TYPES: readonly ReactorType[] = [
  "PWR",
  "BWR",
  "PHWR",
  "HTGR",
  "SFR",
  "LFR",
  "MSR",
  "other",
] as const;

// ─── Taxonomy tag ───────────────────────────────────────────────────
// Every chip in the UI renders from one of these.
export interface TaxonomyTag {
  id: string;
  label: string;
  /** ≤1 sentence shown on the chip as the hook line. */
  oneLineHook: string;
  /** ≤1 paragraph shown in the tag popover body. */
  popoverBody: string;
  /** X-Factor tags only: which visual sub-group in the UI. */
  group?: XFactorGroup;
  /** ≥1 citation per tag. Every citation must pass the allowlist. */
  citations: Citation[];
}

// ─── Reactor design ─────────────────────────────────────────────────
export interface WhyChainStep {
  /** Plain-English statement. */
  text: string;
  /** Optional tag ID this step references. */
  tagRef?:
    | FuelMaterialId
    | FuelFormId
    | KickstarterId
    | CoolantId
    | XFactorId;
}

export interface ReactorDesign {
  id: string;
  name: string;
  description: string;
  pursuedBy: ReadonlyArray<{ name: string; url: string }>;
  // Fuel dimension (v2 schema)
  fuelMaterial: FuelMaterialId;
  fuelForm: FuelFormId;
  /** Only set when fuelMaterial is "th-232". */
  kickstarter?: KickstarterId;
  // Other dimensions
  coolantTags: CoolantId[];
  xFactorTags: XFactorId[];
  outletTempC: number;
  spectrum: "thermal" | "fast" | "epithermal";
  /** Derived from PRIS. Shown on match cards. */
  reactorType: ReactorType;
  whyChain: WhyChainStep[];
  citations: Citation[];
}

// ─── Taxonomy collections ───────────────────────────────────────────
export interface ReactorTaxonomy {
  fuelMaterialTags: ReadonlyArray<TaxonomyTag & { id: FuelMaterialId }>;
  kickstarterTags: ReadonlyArray<TaxonomyTag & { id: KickstarterId }>;
  fuelFormTags: ReadonlyArray<TaxonomyTag & { id: FuelFormId }>;
  coolantTags: ReadonlyArray<TaxonomyTag & { id: CoolantId }>;
  xFactorTags: ReadonlyArray<
    TaxonomyTag & { id: XFactorId; group: XFactorGroup }
  >;
}

// ─── Output JSON shapes ─────────────────────────────────────────────
export interface TaxonomyJson {
  lastUpdated: string;
  schemaVersion: 2;
  fuelMaterial: ReadonlyArray<TaxonomyTag>;
  kickstarter: ReadonlyArray<TaxonomyTag>;
  fuelForm: ReadonlyArray<TaxonomyTag>;
  coolant: ReadonlyArray<TaxonomyTag>;
  xFactor: ReadonlyArray<TaxonomyTag>;
}

export interface ReactorsJson {
  lastUpdated: string;
  schemaVersion: 2;
  reactors: ReadonlyArray<ReactorDesign>;
}

// ─── Plausibility bounds ────────────────────────────────────────────
export const REACTOR_PLAUSIBILITY_BOUNDS = {
  outletTempC: { min: 0, max: 1200 },
} as const;
