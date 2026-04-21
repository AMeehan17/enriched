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
 * SCHEMA v3 (2026-04-20): coolant is now a two-step drill-down. The
 * parent coolant set is 7 families (water, helium, molten-salt, sodium,
 * lead, lead-bismuth, heat-pipes). A conditional child dimension picks
 * the specific chemistry when the parent is water (light vs heavy) or
 * molten-salt (FLiBe / FLiNaK / Chloride). Mirrors the fuel material →
 * fuel form pattern.
 *
 * Prior history:
 *   v2 (2026-04-20): fuel dimension split into fissile element, optional
 *     kickstarter, and fuel form. Added reactorType derived field.
 */

// ─── Fuel material IDs ──────────────────────────────────────────────
// What atom is actually undergoing fission (or transmuting into something
// that does). Independent of physical form.
export type FuelMaterialId = "u-235" | "th-232" | "pu-239";

export const FUEL_MATERIAL_IDS: readonly FuelMaterialId[] = [
  "u-235",
  "th-232",
  "pu-239",
] as const;

// ─── Kickstarter IDs ────────────────────────────────────────────────
// Th-232 is fertile, not fissile — thorium reactors need a fissile starter
// to get the chain reaction going. This dimension is only meaningful
// when fuel material = th-232.
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
// v3: seven coolant families. Water and molten-salt are deliberately
// unified here — the specific chemistry (light vs heavy water, FLiBe vs
// FLiNaK vs Chloride) drills into the CoolantChemistryId dimension below,
// which mirrors the fuel material → fuel form pattern.
//
// Reactor architecture (PWR vs BWR vs PHWR, SFR vs LFR, MSR vs FHR) is
// NOT a coolant dimension — it's the derived `reactorType` shown on each
// design's match card.
export type CoolantId =
  | "water"
  | "helium"
  | "molten-salt"
  | "sodium"
  | "lead"
  | "lead-bismuth"
  | "heat-pipes";

export const COOLANT_IDS: readonly CoolantId[] = [
  "water",
  "helium",
  "molten-salt",
  "sodium",
  "lead",
  "lead-bismuth",
  "heat-pipes",
] as const;

// ─── Coolant chemistry IDs ──────────────────────────────────────────
// Sub-dimension for water and molten-salt coolants. Other coolants
// (helium, sodium, lead, lead-bismuth, heat-pipes) need no chemistry
// disambiguation — the parent IS the species.
export type CoolantChemistryId =
  | "light-water"
  | "heavy-water"
  | "flibe"
  | "flinak"
  | "chloride-salt";

export const COOLANT_CHEMISTRY_IDS: readonly CoolantChemistryId[] = [
  "light-water",
  "heavy-water",
  "flibe",
  "flinak",
  "chloride-salt",
] as const;

// Water-family chemistries: valid only when coolant includes "water".
export const WATER_CHEMISTRY_IDS: readonly CoolantChemistryId[] = [
  "light-water",
  "heavy-water",
] as const;

// Salt-family chemistries: valid only when coolant includes "molten-salt".
export const SALT_CHEMISTRY_IDS: readonly CoolantChemistryId[] = [
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
    | CoolantChemistryId
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
  // Coolant dimension (v3 schema — parent + optional chemistry)
  coolantTags: CoolantId[];
  /** Required when coolantTags includes "water" or "molten-salt". */
  coolantChemistry?: CoolantChemistryId;
  // Capability dimension (multi-tag, includes both scale and capability groups)
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
  coolantChemistryTags: ReadonlyArray<
    TaxonomyTag & { id: CoolantChemistryId }
  >;
  xFactorTags: ReadonlyArray<
    TaxonomyTag & { id: XFactorId; group: XFactorGroup }
  >;
}

// ─── Output JSON shapes ─────────────────────────────────────────────
export interface TaxonomyJson {
  lastUpdated: string;
  schemaVersion: 3;
  fuelMaterial: ReadonlyArray<TaxonomyTag>;
  kickstarter: ReadonlyArray<TaxonomyTag>;
  fuelForm: ReadonlyArray<TaxonomyTag>;
  coolant: ReadonlyArray<TaxonomyTag>;
  coolantChemistry: ReadonlyArray<TaxonomyTag>;
  xFactor: ReadonlyArray<TaxonomyTag>;
}

export interface ReactorsJson {
  lastUpdated: string;
  schemaVersion: 3;
  reactors: ReadonlyArray<ReactorDesign>;
}

// ─── Plausibility bounds ────────────────────────────────────────────
export const REACTOR_PLAUSIBILITY_BOUNDS = {
  outletTempC: { min: 0, max: 1200 },
} as const;
