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
 * Format a ratio for display in a "N× more than" callout.
 *
 * Uses graduated precision so the number stays readable across wildly
 * different magnitudes:
 * - Under 10 → one decimal ("2.3×")
 * - 10 to 99 → integer ("45×")
 * - 100 and up → rounded to 2 significant figures with a thousands
 *   separator and a "~" prefix to telegraph approximation ("~70,000×")
 *
 * The approximation matters for this product: energy density ratios
 * between nuclear and fossil fuels land around 70,000× to 160,000×, and
 * the exact digit is noise. "~70,000× more energy per kg" lands
 * intuitively; "69,642.857×" just looks like false precision.
 */
export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "—";
  // Sub-unit ratios: avoid collapsing tiny-but-meaningful values to "0.0×".
  // Below ~1/1000 we escape to scientific notation — at that point, a decimal
  // rendering becomes visual noise anyway. 56/3,900,000 becomes "1.4e-5×",
  // which correctly signals "the two numbers are in different universes"
  // without lying about precision.
  if (ratio < 0.001) return `${ratio.toExponential(1)}×`;
  if (ratio < 0.1) return `${ratio.toFixed(2)}×`;
  if (ratio < 10) return `${ratio.toFixed(1)}×`;
  if (ratio < 100) return `${Math.round(ratio)}×`;
  const magnitude = Math.floor(Math.log10(ratio));
  const divisor = Math.pow(10, magnitude - 1);
  const rounded = Math.round(ratio / divisor) * divisor;
  return `~${rounded.toLocaleString()}×`;
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
