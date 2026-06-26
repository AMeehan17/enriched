/**
 * Pure math helpers for the neutron-energy spectrum visualization.
 *
 * Two distributions live here:
 *
 * 1. Maxwell–Boltzmann (thermal) — the energy distribution of neutrons in
 *    thermal equilibrium with a moderator at temperature T. This is what a
 *    thermal reactor produces.
 *
 *    f(E) ∝ √E · exp(−E / kT)
 *
 *    Peaks at E = kT/2. At room temperature (293 K), kT ≈ 0.0253 eV, so the
 *    peak is around 0.0126 eV. The standard "thermal" reference energy of
 *    0.0253 eV is kT itself (the most-probable speed of the underlying
 *    Maxwell velocity distribution), not the peak of the energy distribution.
 *
 * 2. Watt fission spectrum — the energy distribution of neutrons born from
 *    U-235 fission. Fast reactors run on (or close to) this unmoderated
 *    spectrum.
 *
 *    ψ(E) ∝ exp(−E / a) · sinh(√(b · E))
 *
 *    With a = 0.965 MeV and b = 2.29 / MeV for U-235. Peaks around 0.7 MeV.
 *
 * Functions return un-normalized density values; the slider component
 * normalizes both curves so the peak of each is 1, which is the right
 * visual for "compare these shapes" — not "compare absolute neutron counts."
 *
 * No React, no DOM. Plain numbers in, plain numbers out. Unit-testable.
 */

/** Boltzmann constant in eV/K. */
export const K_BOLTZMANN_EV_PER_K = 8.617_333_262e-5;

/** Watt distribution parameters for U-235 prompt fission (energies in eV). */
const WATT_A_EV = 0.965e6; // 0.965 MeV
const WATT_B_PER_EV = 2.29e-6; // 2.29 / MeV → 2.29e-6 / eV

/**
 * Maxwell–Boltzmann neutron energy density at energy E (eV) and
 * moderator temperature T (K). Returns un-normalized density.
 *
 * Below E = 0 returns 0 (energies are non-negative). At E = 0 returns 0
 * (the √E term kills it). Above the high-energy tail returns ~0 due to
 * the exponential.
 */
export function maxwellBoltzmannDensity(E_eV: number, T_K: number): number {
  if (E_eV <= 0 || T_K <= 0) return 0;
  const kT = K_BOLTZMANN_EV_PER_K * T_K;
  return Math.sqrt(E_eV) * Math.exp(-E_eV / kT);
}

/**
 * Energy at which the Maxwell–Boltzmann distribution peaks, for the
 * pedagogically useful "most-probable energy" marker.
 *
 *   d/dE [√E · exp(−E/kT)] = 0 → E_peak = kT/2
 */
export function maxwellBoltzmannPeakEnergy(T_K: number): number {
  return (K_BOLTZMANN_EV_PER_K * T_K) / 2;
}

/**
 * Watt fission spectrum density at energy E (eV) for U-235 prompt fission.
 * Un-normalized.
 */
export function wattFissionDensity(E_eV: number): number {
  if (E_eV <= 0) return 0;
  return (
    Math.exp(-E_eV / WATT_A_EV) * Math.sinh(Math.sqrt(WATT_B_PER_EV * E_eV))
  );
}

/**
 * Log-spaced array of `count` points from `min` to `max` (inclusive).
 * Used to sample the energy axis with constant density per decade — the
 * natural sampling for a log-x plot.
 */
export function logSpaced(min: number, max: number, count: number): number[] {
  if (min <= 0 || max <= 0 || min >= max || count < 2) {
    throw new Error(
      `logSpaced: invalid range (${min} → ${max}, ${count} points)`,
    );
  }
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const step = (logMax - logMin) / (count - 1);
  const out = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    out[i] = 10 ** (logMin + i * step);
  }
  return out;
}

/**
 * Sample a density function across a log-spaced energy range and return
 * (E, y) pairs normalized so the maximum y is 1.
 *
 * If the function is zero everywhere across the sample (shouldn't happen
 * for either density above), y values are returned as zeros to keep the
 * plot path well-formed.
 */
export function samplePeakNormalized(
  densityFn: (E_eV: number) => number,
  energies: ReadonlyArray<number>,
): ReadonlyArray<{ E_eV: number; y: number }> {
  const raw = energies.map((E) => densityFn(E));
  let max = 0;
  for (const v of raw) {
    if (v > max) max = v;
  }
  const scale = max > 0 ? 1 / max : 0;
  return energies.map((E_eV, i) => ({ E_eV, y: (raw[i] ?? 0) * scale }));
}

/** The conventional thermal-neutron reference energy (kT at 293 K, ≈ 0.0253 eV). */
export const THERMAL_REFERENCE_EV = K_BOLTZMANN_EV_PER_K * 293;

/** Approximate Watt peak energy (eV), used as the "fast" reference marker. */
export const FAST_REFERENCE_EV = 700_000; // ~0.7 MeV
