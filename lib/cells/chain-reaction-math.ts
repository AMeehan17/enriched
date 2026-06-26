/**
 * Pure math helpers for the chain-reaction visualization.
 *
 * The neutron-population evolution under a constant multiplication
 * factor k follows the simplest possible recurrence:
 *
 *   N(g) = N₀ · k^g
 *
 * where g is the generation number (each generation ≈ one mean
 * neutron lifetime, ~10⁻⁴ s for thermal reactors). k = 1 is the
 * critical condition: the population stays constant. k > 1 is
 * supercritical (exponential growth). k < 1 is subcritical
 * (exponential decay).
 *
 * For the cell we normalize N₀ = 1 so the y-axis reads as
 * "population, multiples of initial." This makes the slider's effect
 * obvious without needing a starting-population control.
 *
 * No React, no DOM. Plain numbers in, plain numbers out.
 */

/** Lower bound of the slider — comfortably subcritical. */
export const K_MIN = 0.95;
/** Upper bound of the slider — comfortably supercritical. */
export const K_MAX = 1.05;
/** Default at critical, the visual "neutral" position. */
export const K_DEFAULT = 1.0;
/** Generation count the plot covers (one tick per generation). */
export const GENERATIONS = 20;

/**
 * Neutron population at generation g for a given multiplication
 * factor k. Returns N₀ · k^g, with N₀ = 1.
 */
export function populationAt(k: number, generation: number): number {
  if (k < 0) return 0;
  if (generation < 0) return 1;
  return Math.pow(k, generation);
}

/**
 * Sample populations across g = 0 .. GENERATIONS for a given k.
 * Returns an array of (generation, N) pairs for the SVG plotter.
 */
export function samplePopulation(
  k: number,
  generations: number = GENERATIONS,
): ReadonlyArray<{ generation: number; population: number }> {
  const out: { generation: number; population: number }[] = [];
  for (let g = 0; g <= generations; g++) {
    out.push({ generation: g, population: populationAt(k, g) });
  }
  return out;
}

/**
 * Y-axis range that keeps the curve well-framed for any k in
 * [K_MIN, K_MAX]. We display log-y so subcritical and supercritical
 * runs both read as straight lines, with the critical case as a flat
 * line at y = 1.
 */
export const Y_MIN = Math.pow(K_MIN, GENERATIONS); // smallest reachable population
export const Y_MAX = Math.pow(K_MAX, GENERATIONS); // largest reachable population

/**
 * Map a population value to a [0, 1] normalized vertical position on
 * a log-scaled axis between Y_MIN and Y_MAX. Returns 0 at the bottom
 * of the plot, 1 at the top.
 */
export function yPositionLog(population: number): number {
  if (population <= 0) return 0;
  const logP = Math.log(population);
  const logMin = Math.log(Y_MIN);
  const logMax = Math.log(Y_MAX);
  if (logMax === logMin) return 0.5;
  return (logP - logMin) / (logMax - logMin);
}
