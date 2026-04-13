import { describe, it, expect } from "vitest";
import { normalizeValue, adjustConstructionTimeForCF, formatRatio } from "./chart-math";

describe("normalizeValue", () => {
  it("returns the simple ratio when baseline is safe", () => {
    expect(normalizeValue(10, 2, undefined)).toBe(5);
    expect(normalizeValue(90, 30, undefined)).toBe(3);
  });

  it("returns null when baseline is zero (divide-by-zero guard)", () => {
    expect(normalizeValue(5, 0, undefined)).toBeNull();
  });

  it("returns null when baseline is below the threshold (small-denominator guard)", () => {
    // Solar deaths/TWh is near-zero; a threshold of 0.05 should suppress
    // normalization against it rather than emitting huge multiples.
    expect(normalizeValue(24, 0.02, 0.05)).toBeNull();
  });

  it("applies normalization when baseline meets the threshold", () => {
    expect(normalizeValue(24, 0.1, 0.05)).toBe(240);
  });
});

describe("adjustConstructionTimeForCF", () => {
  it("reshapes nuclear construction time modestly (high CF = small adjustment)", () => {
    // Nuclear: 8.5 years raw, ~93% CF → ~9.14 years per GW delivered
    const adjusted = adjustConstructionTimeForCF(8.5, 93);
    expect(adjusted).toBeCloseTo(9.14, 1);
  });

  it("reshapes solar construction time dramatically (low CF = large adjustment)", () => {
    // Solar: 1.5 years raw, ~24.6% CF → ~6.10 years per GW delivered
    const adjusted = adjustConstructionTimeForCF(1.5, 24.6);
    expect(adjusted).toBeCloseTo(6.1, 1);
  });

  it("reshapes hydro so it surfaces as the real laggard", () => {
    // Hydro: 8 years raw, ~37% CF → ~21.6 years per GW delivered
    // This is the reframe the platform is built around — raw years make
    // nuclear look slow, CF-adjusted years make hydro look slow.
    const adjusted = adjustConstructionTimeForCF(8, 37);
    expect(adjusted).toBeCloseTo(21.62, 1);
  });

  it("returns the raw value unchanged when CF is zero or negative", () => {
    // Guards against divide-by-zero for flow-resource edge cases.
    expect(adjustConstructionTimeForCF(5, 0)).toBe(5);
    expect(adjustConstructionTimeForCF(5, -10)).toBe(5);
  });

  it("is an identity transform when CF is 100%", () => {
    // At 100% CF, nameplate and delivered are the same, so adjustment is no-op.
    expect(adjustConstructionTimeForCF(7, 100)).toBe(7);
  });
});

describe("formatRatio", () => {
  it("returns em-dash for non-positive or non-finite inputs", () => {
    expect(formatRatio(0)).toBe("—");
    expect(formatRatio(-1)).toBe("—");
    expect(formatRatio(Number.POSITIVE_INFINITY)).toBe("—");
    expect(formatRatio(Number.NaN)).toBe("—");
  });

  it("falls to scientific notation for tiny sub-unit ratios", () => {
    // Natural gas / nuclear = 56 / 3.9M ≈ 1.4e-5. Must NOT collapse to "0.0×".
    expect(formatRatio(56 / 3_900_000)).toBe("1.4e-5×");
  });

  it("uses two decimals for small but not tiny sub-unit ratios", () => {
    expect(formatRatio(0.05)).toBe("0.05×");
  });

  it("uses one decimal for order-of-magnitude-similar ratios", () => {
    expect(formatRatio(3.7)).toBe("3.7×");
    expect(formatRatio(9.9)).toBe("9.9×");
  });

  it("uses integer for 10–99", () => {
    expect(formatRatio(45)).toBe("45×");
  });

  it("rounds to 2 significant figures with ~ prefix for 100+", () => {
    // Nuclear / gas = 3.9M / 56 ≈ 69,643 → "~70,000×"
    expect(formatRatio(3_900_000 / 56)).toBe("~70,000×");
    // Nuclear / coal ≈ 162,500 → "~160,000×"
    expect(formatRatio(3_900_000 / 24)).toBe("~160,000×");
    expect(formatRatio(560)).toBe("~560×");
  });
});
