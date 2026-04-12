/**
 * Pure math helpers for the comparison chart grid.
 *
 * Kept in their own module so they can be unit-tested without pulling in the
 * React component, the data layer, or the full Source type surface. The
 * functions here take plain numbers in, return plain numbers out — no
 * cross-cutting dependencies.
 */

/**
 * Compute the normalized display value (ratio of value to baseline).
 *
 * Returns null when the baseline is unsafe to divide by:
 * - baseline is exactly 0 (divide-by-zero)
 * - baseline is below an explicit threshold (guards against tiny denominators
 *   producing absurd multiples, e.g. "10,000× more deaths" from a rounding
 *   error on a near-zero value)
 *
 * @param value      The source value being normalized
 * @param baseline   The reference value to divide against
 * @param threshold  Optional minimum baseline below which the result is
 *                   suppressed. If undefined, only the zero check applies.
 */
export function normalizeValue(
  value: number,
  baseline: number,
  threshold: number | undefined,
): number | null {
  if (baseline === 0) return null;
  if (threshold !== undefined && baseline < threshold) return null;
  return value / baseline;
}

/**
 * Convert raw project construction years into "years to deliver 1 GW of
 * average continuous output" by dividing by capacity factor.
 *
 * Raw construction time is typically quoted per ~1 GW of *nameplate* capacity,
 * but nameplate hides how much energy the plant actually delivers: a 1 GW
 * solar farm with a 25% capacity factor produces roughly a quarter of the
 * energy a 1 GW nuclear plant (93% CF) produces over the same year. This
 * function normalizes to a per-energy basis so the metric compares apples
 * to apples across sources.
 *
 * Returns the raw value unchanged when CF is non-positive (prevents
 * divide-by-zero and nonsensical negative adjustments).
 *
 * @param rawYears          Raw project years (per ~1 GW nameplate build)
 * @param capacityFactorPct Capacity factor as a percentage (0–100), not a ratio
 */
export function adjustConstructionTimeForCF(
  rawYears: number,
  capacityFactorPct: number,
): number {
  if (capacityFactorPct <= 0) return rawYears;
  return rawYears / (capacityFactorPct / 100);
}
