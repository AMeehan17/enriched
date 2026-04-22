import {
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs";
import {
  FUEL_MATERIAL_IDS,
  KICKSTARTER_IDS,
  FUEL_FORM_IDS,
  COOLANT_IDS,
  COOLANT_CHEMISTRY_IDS,
  SPECTRUM_IDS,
  X_FACTOR_IDS,
  type CoolantId,
  type CoolantChemistryId,
  type XFactorId,
} from "./reactor-types";

/**
 * URL state parsers for Module 2 (Reactor Builder) — SCHEMA v3.
 *
 * URL schema (v4):
 *   /reactor-builder
 *     ?fe=th-232                   (fuel material, single)
 *     &ks=u-235-kickstart           (kickstarter, single, optional)
 *     &ff=molten-salt               (fuel form, single)
 *     &c=molten-salt,helium         (coolant parent, array)
 *     &cc=flibe,light-water         (coolant chemistry, array)
 *     &s=thermal                    (spectrum, single — v4)
 *     &x=walk-away-safe,process-heat (x-factor, array)
 *
 * Single-value dimensions (fe, ks, ff, s) serialize as their raw string id
 * via parseAsStringLiteral. Default is null.
 *
 * Array dimensions (c, cc, x) use parseAsArrayOf for multi-select filtering.
 *
 * parseAsStringLiteral filters invalid values automatically — if someone
 * hits ?fe=banana, the value becomes null. Matches Module 1's robustness.
 */

// ─── fissile element (single, nullable) ─────────────────────────────
export const fuelMaterialParser = parseAsStringLiteral(
  FUEL_MATERIAL_IDS,
).withDefault(null as never).withOptions({ clearOnDefault: true });

// ─── kickstarter (single, nullable, conditional on th-232) ──────────
export const kickstarterParser = parseAsStringLiteral(
  KICKSTARTER_IDS,
).withDefault(null as never).withOptions({ clearOnDefault: true });

// ─── fuel form (single, nullable) ───────────────────────────────────
export const fuelFormParser = parseAsStringLiteral(
  FUEL_FORM_IDS,
).withDefault(null as never).withOptions({ clearOnDefault: true });

// ─── coolant (array) ────────────────────────────────────────────────
export const coolantParser = parseAsArrayOf(
  parseAsStringLiteral(COOLANT_IDS),
  ",",
).withDefault([] as CoolantId[]);

// ─── coolant chemistry (array) ──────────────────────────────────────
export const coolantChemistryParser = parseAsArrayOf(
  parseAsStringLiteral(COOLANT_CHEMISTRY_IDS),
  ",",
).withDefault([] as CoolantChemistryId[]);

// ─── spectrum (single, nullable) — v4 ───────────────────────────────
export const spectrumParser = parseAsStringLiteral(
  SPECTRUM_IDS,
).withDefault(null as never).withOptions({ clearOnDefault: true });

// ─── x-factor (array) ───────────────────────────────────────────────
export const xFactorParser = parseAsArrayOf(
  parseAsStringLiteral(X_FACTOR_IDS),
  ",",
).withDefault([] as XFactorId[]);

// ─── combined search params descriptor ───────────────────────────────
export const REACTOR_BUILDER_SEARCH_PARAMS = {
  fe: fuelMaterialParser,
  ks: kickstarterParser,
  ff: fuelFormParser,
  c: coolantParser,
  cc: coolantChemistryParser,
  s: spectrumParser,
  x: xFactorParser,
} as const;
