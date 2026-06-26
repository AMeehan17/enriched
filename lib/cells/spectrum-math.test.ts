import { describe, it, expect } from "vitest";
import {
  K_BOLTZMANN_EV_PER_K,
  maxwellBoltzmannDensity,
  maxwellBoltzmannPeakEnergy,
  wattFissionDensity,
  logSpaced,
  samplePeakNormalized,
  THERMAL_REFERENCE_EV,
  FAST_REFERENCE_EV,
} from "./spectrum-math";

describe("Boltzmann constant", () => {
  it("matches CODATA to seven figures (eV/K)", () => {
    expect(K_BOLTZMANN_EV_PER_K).toBeCloseTo(8.617333e-5, 10);
  });
});

describe("maxwellBoltzmannDensity", () => {
  it("returns 0 for non-positive energies and temperatures", () => {
    expect(maxwellBoltzmannDensity(0, 293)).toBe(0);
    expect(maxwellBoltzmannDensity(-1, 293)).toBe(0);
    expect(maxwellBoltzmannDensity(1, 0)).toBe(0);
    expect(maxwellBoltzmannDensity(1, -10)).toBe(0);
  });

  it("peaks near kT/2 (numerical sweep at T=293 K)", () => {
    const T = 293;
    const expectedPeak = maxwellBoltzmannPeakEnergy(T);
    // Sweep densely around the analytic peak and confirm it dominates.
    let max = 0;
    let argmax = 0;
    for (let i = 0; i < 1000; i++) {
      const E = (expectedPeak * 4 * i) / 999 + 1e-8;
      const v = maxwellBoltzmannDensity(E, T);
      if (v > max) {
        max = v;
        argmax = E;
      }
    }
    // Within ~5% of analytic peak (numerical sweep is coarse).
    expect(argmax).toBeGreaterThan(expectedPeak * 0.95);
    expect(argmax).toBeLessThan(expectedPeak * 1.05);
  });

  it("shifts right as temperature rises", () => {
    const peakCold = maxwellBoltzmannPeakEnergy(293);
    const peakHot = maxwellBoltzmannPeakEnergy(900);
    expect(peakHot).toBeGreaterThan(peakCold);
    // Specifically, peak scales linearly with T.
    expect(peakHot / peakCold).toBeCloseTo(900 / 293, 4);
  });

  it("is negligible at fast-spectrum energies even at hot moderator temperatures", () => {
    // At T=2000 K, kT ≈ 0.172 eV. At 1 MeV, ratio E/kT ≈ 5.8e6 → exp kills it.
    const v = maxwellBoltzmannDensity(1e6, 2000);
    expect(v).toBeLessThan(1e-30);
  });
});

describe("maxwellBoltzmannPeakEnergy", () => {
  it("returns kT/2 (293 K → ~0.01263 eV)", () => {
    expect(maxwellBoltzmannPeakEnergy(293)).toBeCloseTo(0.012624, 5);
  });
});

describe("wattFissionDensity", () => {
  it("returns 0 for E ≤ 0", () => {
    expect(wattFissionDensity(0)).toBe(0);
    expect(wattFissionDensity(-1)).toBe(0);
  });

  it("peaks in the high-keV to low-MeV range", () => {
    const energies = logSpaced(1e3, 1e8, 500);
    let argmax = 0;
    let max = 0;
    for (const E of energies) {
      const v = wattFissionDensity(E);
      if (v > max) {
        max = v;
        argmax = E;
      }
    }
    // Expected ~0.7 MeV; allow 0.4–1.2 MeV given coarse sampling.
    expect(argmax).toBeGreaterThan(4e5);
    expect(argmax).toBeLessThan(1.2e6);
  });

  it("is essentially zero at thermal energies", () => {
    // At 0.025 eV, the sinh(√(b·E)) term is tiny — no fast contribution down here.
    expect(wattFissionDensity(0.025)).toBeLessThan(1e-2);
  });
});

describe("logSpaced", () => {
  it("returns endpoints exactly", () => {
    const xs = logSpaced(1e-4, 1e7, 11);
    expect(xs[0]).toBeCloseTo(1e-4, 10);
    expect(xs[xs.length - 1]).toBeCloseTo(1e7, 0);
  });

  it("returns one point per decade for count=12 over 11 decades", () => {
    const xs = logSpaced(1e-4, 1e7, 12);
    // log10 differences should all equal 1.0
    for (let i = 1; i < xs.length; i++) {
      const curr = xs[i]!;
      const prev = xs[i - 1]!;
      expect(Math.log10(curr / prev)).toBeCloseTo(1.0, 6);
    }
  });

  it("throws on invalid ranges", () => {
    expect(() => logSpaced(0, 10, 5)).toThrow();
    expect(() => logSpaced(-1, 10, 5)).toThrow();
    expect(() => logSpaced(10, 1, 5)).toThrow();
    expect(() => logSpaced(1, 10, 1)).toThrow();
  });
});

describe("samplePeakNormalized", () => {
  it("normalizes the max y to 1", () => {
    const energies = logSpaced(1e-4, 1e1, 200);
    const samples = samplePeakNormalized(
      (E) => maxwellBoltzmannDensity(E, 293),
      energies,
    );
    let max = 0;
    for (const s of samples) if (s.y > max) max = s.y;
    expect(max).toBeCloseTo(1.0, 6);
  });

  it("returns zeros when the density is zero everywhere", () => {
    const samples = samplePeakNormalized(() => 0, logSpaced(1, 100, 5));
    expect(samples.every((s) => s.y === 0)).toBe(true);
  });
});

describe("reference energies", () => {
  it("THERMAL_REFERENCE_EV is kT at 293 K (~0.0253 eV)", () => {
    expect(THERMAL_REFERENCE_EV).toBeCloseTo(0.0253, 3);
  });

  it("FAST_REFERENCE_EV is at the Watt peak order of magnitude", () => {
    expect(FAST_REFERENCE_EV).toBeGreaterThan(1e5);
    expect(FAST_REFERENCE_EV).toBeLessThan(1e7);
  });
});
