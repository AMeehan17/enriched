import {
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs";
import {
  FUEL_IDS,
  COOLANT_IDS,
  X_FACTOR_IDS,
  type FuelId,
  type CoolantId,
  type XFactorId,
} from "./reactor-types";

/**
 * URL state parsers for Module 2 (Reactor Builder).
 *
 * These are the nuqs parser definitions for all query params that drive
 * the reactor builder tool. Defined in one place so the OG image route
 * (when v1.1 lands), preset links, and any future consumer reference the
 * same serialization.
 *
 * URL schema:
 *   /reactor-builder?fuel=haleu-metal,triso&coolant=helium&x=walk-away-safe,process-heat
 *
 * Invariants enforced by the parsers:
 *   - fuel: must be a subset of the 6 known fuel IDs. Unknown values filtered.
 *   - coolant: must be a subset of the 7 known coolant IDs. Unknown values filtered.
 *   - x (shorthand for xFactor): must be a subset of the 12 known X-Factor IDs.
 *     Unknown values filtered.
 *
 * Default is empty array for every dimension (no filter). Matching the
 * behavior from Module 2's matchReactors() pure function: empty dimension
 * = unfiltered on that axis.
 *
 * parseAsStringLiteral filters invalid values automatically — if someone
 * hits /reactor-builder?fuel=banana,triso, the fuel array becomes just
 * ["triso"] without a validation error thrown. Matches Module 1's
 * url-state pattern.
 */

// ─── fuel ────────────────────────────────────────────────────────────
export const fuelParser = parseAsArrayOf(
  parseAsStringLiteral(FUEL_IDS),
  ",",
).withDefault([] as FuelId[]);

// ─── coolant ─────────────────────────────────────────────────────────
export const coolantParser = parseAsArrayOf(
  parseAsStringLiteral(COOLANT_IDS),
  ",",
).withDefault([] as CoolantId[]);

// ─── x (X-Factor) ────────────────────────────────────────────────────
// Short key name because it's the dimension most likely to appear in
// shared URLs ("?x=walk-away-safe"). The preset links use this parser.
export const xFactorParser = parseAsArrayOf(
  parseAsStringLiteral(X_FACTOR_IDS),
  ",",
).withDefault([] as XFactorId[]);

// ─── combined search params descriptor ───────────────────────────────
// Consumers (nuqs useQueryStates) pass this to get all three parsers at
// once. Server components reading the URL for OG images or metadata use
// the same descriptor.
export const REACTOR_BUILDER_SEARCH_PARAMS = {
  fuel: fuelParser,
  coolant: coolantParser,
  x: xFactorParser,
} as const;
