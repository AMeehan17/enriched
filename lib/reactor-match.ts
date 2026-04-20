import type {
  FissileElementId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  XFactorId,
  ReactorDesign,
} from "./reactor-types";

/**
 * reactor-match.ts — pure matching function for the Reactor Builder.
 *
 * SCHEMA v2 (2026-04-20):
 *   Fuel is now 3 fields: fuelElement (single), kickstarter (single optional),
 *   fuelForm (single). Coolant and xFactor stay as arrays (multi-select).
 *
 * No React, no DOM, no side effects. Takes a user's configuration and
 * returns the qualifying reactor designs, ranked by relevance.
 *
 * Semantics:
 *   - Single-value dimensions (fuelElement, kickstarter, fuelForm): a
 *     reactor matches if its value equals the config's value, OR the
 *     config's value is null (dimension unfiltered).
 *   - Array dimensions (coolant, xFactor): AND across dimensions, OR
 *     within a dimension. A reactor matches if, for every non-empty
 *     dimension, it has at least one matching tag.
 *   - noMatch = true when at least one dimension is filtered but zero
 *     reactors qualify.
 *
 * Ranking: total matched-tag count across all dimensions (single-value
 * dimensions count 1 if matched). Alphabetical tiebreak on name.
 */

export interface MatchConfig {
  fuelElement: FissileElementId | null;
  kickstarter: KickstarterId | null;
  fuelForm: FuelFormId | null;
  coolant: CoolantId[];
  xFactor: XFactorId[];
}

export interface MatchResult {
  results: ReactorDesign[];
  noMatch: boolean;
}

/**
 * Check if reactor's single-value field matches config's single-value field.
 * Null config = unfiltered (always passes).
 */
function matchesSingle<T>(
  reactorValue: T | undefined,
  configValue: T | null,
): boolean {
  if (configValue === null) return true;
  return reactorValue === configValue;
}

/**
 * Check if a reactor qualifies for a multi-select array dimension.
 * Empty config array = dimension is unfiltered (always passes).
 */
function matchesArray(
  reactorTags: readonly string[],
  selectedTags: readonly string[],
): boolean {
  if (selectedTags.length === 0) return true;
  return selectedTags.some((tag) => reactorTags.includes(tag));
}

/**
 * Count how many of the selected tags a reactor has in an array dimension.
 */
function countArrayMatches(
  reactorTags: readonly string[],
  selectedTags: readonly string[],
): number {
  return selectedTags.filter((tag) => reactorTags.includes(tag)).length;
}

/**
 * Match reactors against a user's configuration.
 */
export function matchReactors(
  config: MatchConfig,
  allReactors: readonly ReactorDesign[],
): MatchResult {
  const hasAnyFilter =
    config.fuelElement !== null ||
    config.kickstarter !== null ||
    config.fuelForm !== null ||
    config.coolant.length > 0 ||
    config.xFactor.length > 0;

  const qualifying = allReactors.filter(
    (r) =>
      matchesSingle(r.fuelElement, config.fuelElement) &&
      matchesSingle(r.kickstarter, config.kickstarter) &&
      matchesSingle(r.fuelForm, config.fuelForm) &&
      matchesArray(r.coolantTags, config.coolant) &&
      matchesArray(r.xFactorTags, config.xFactor),
  );

  // Rank by total matched tags, alphabetical tiebreak.
  const ranked = [...qualifying].sort((a, b) => {
    const scoreA =
      (config.fuelElement !== null && a.fuelElement === config.fuelElement ? 1 : 0) +
      (config.kickstarter !== null && a.kickstarter === config.kickstarter ? 1 : 0) +
      (config.fuelForm !== null && a.fuelForm === config.fuelForm ? 1 : 0) +
      countArrayMatches(a.coolantTags, config.coolant) +
      countArrayMatches(a.xFactorTags, config.xFactor);
    const scoreB =
      (config.fuelElement !== null && b.fuelElement === config.fuelElement ? 1 : 0) +
      (config.kickstarter !== null && b.kickstarter === config.kickstarter ? 1 : 0) +
      (config.fuelForm !== null && b.fuelForm === config.fuelForm ? 1 : 0) +
      countArrayMatches(b.coolantTags, config.coolant) +
      countArrayMatches(b.xFactorTags, config.xFactor);

    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });

  return {
    results: ranked,
    noMatch: hasAnyFilter && ranked.length === 0,
  };
}
