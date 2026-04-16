import type { FuelId, CoolantId, XFactorId, ReactorDesign } from "./reactor-types";

/**
 * reactor-match.ts — pure matching function for the Reactor Builder.
 *
 * No React, no DOM, no side effects. Takes a user's F/C/X selection and
 * returns the qualifying reactor designs, ranked by relevance.
 *
 * Semantics:
 *   - AND across dimensions: a reactor must match in EVERY non-empty dimension
 *   - OR within a dimension: selecting [helium, sodium] matches reactors with either
 *   - Empty dimension = unfiltered on that axis
 *   - noMatch = true when at least one dimension is filtered but zero reactors qualify
 *
 * Ranking (applied only to qualifying reactors):
 *   Score = (matched fuel tags) + (matched coolant tags) + (matched X-factor tags)
 *   Higher score first. Alphabetical tiebreak on name.
 */

export interface MatchConfig {
  fuel: FuelId[];
  coolant: CoolantId[];
  xFactor: XFactorId[];
}

export interface MatchResult {
  results: ReactorDesign[];
  noMatch: boolean;
}

/**
 * Check if a reactor qualifies for a single dimension.
 * Empty selection = dimension is unfiltered (always passes).
 */
function matchesDimension(
  reactorTags: readonly string[],
  selectedTags: readonly string[],
): boolean {
  if (selectedTags.length === 0) return true;
  return selectedTags.some((tag) => reactorTags.includes(tag));
}

/**
 * Count how many of the selected tags a reactor has in a single dimension.
 */
function countMatches(
  reactorTags: readonly string[],
  selectedTags: readonly string[],
): number {
  return selectedTags.filter((tag) => reactorTags.includes(tag)).length;
}

/**
 * Match reactors against a user's F/C/X configuration.
 */
export function matchReactors(
  config: MatchConfig,
  allReactors: readonly ReactorDesign[],
): MatchResult {
  const hasAnyFilter =
    config.fuel.length > 0 ||
    config.coolant.length > 0 ||
    config.xFactor.length > 0;

  const qualifying = allReactors.filter(
    (r) =>
      matchesDimension(r.fuelTags, config.fuel) &&
      matchesDimension(r.coolantTags, config.coolant) &&
      matchesDimension(r.xFactorTags, config.xFactor),
  );

  // Rank by total matched tags across all dimensions, then alphabetical
  const ranked = [...qualifying].sort((a, b) => {
    const scoreA =
      countMatches(a.fuelTags, config.fuel) +
      countMatches(a.coolantTags, config.coolant) +
      countMatches(a.xFactorTags, config.xFactor);
    const scoreB =
      countMatches(b.fuelTags, config.fuel) +
      countMatches(b.coolantTags, config.coolant) +
      countMatches(b.xFactorTags, config.xFactor);

    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });

  return {
    results: ranked,
    noMatch: hasAnyFilter && ranked.length === 0,
  };
}
