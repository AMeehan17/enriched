import { describe, it, expect } from "vitest";
import {
  K_DEFAULT,
  K_MAX,
  K_MIN,
  GENERATIONS,
  Y_MIN,
  Y_MAX,
  populationAt,
  samplePopulation,
  yPositionLog,
} from "./chain-reaction-math";

describe("populationAt", () => {
  it("is 1 at generation 0 for any k > 0", () => {
    expect(populationAt(0.95, 0)).toBe(1);
    expect(populationAt(1.0, 0)).toBe(1);
    expect(populationAt(1.05, 0)).toBe(1);
  });

  it("stays at 1 at critical k = 1.0 for any generation", () => {
    for (const g of [0, 1, 5, 10, 20]) {
      expect(populationAt(1.0, g)).toBe(1);
    }
  });

  it("decays geometrically when k < 1", () => {
    // k = 0.95 over 20 generations → 0.95^20 ≈ 0.3585
    expect(populationAt(0.95, 20)).toBeCloseTo(0.3585, 4);
  });

  it("grows geometrically when k > 1", () => {
    // k = 1.05 over 20 generations → 1.05^20 ≈ 2.6533
    expect(populationAt(1.05, 20)).toBeCloseTo(2.6533, 4);
  });

  it("handles small supercritical excursions", () => {
    // k = 1.01 over 20 → 1.01^20 ≈ 1.2202
    expect(populationAt(1.01, 20)).toBeCloseTo(1.2202, 4);
  });

  it("returns 0 for negative k (guard)", () => {
    expect(populationAt(-0.5, 5)).toBe(0);
  });

  it("returns 1 for negative generations (guard)", () => {
    expect(populationAt(1.0, -1)).toBe(1);
    expect(populationAt(1.05, -10)).toBe(1);
  });
});

describe("samplePopulation", () => {
  it("returns GENERATIONS + 1 points (0 through GENERATIONS inclusive)", () => {
    const samples = samplePopulation(K_DEFAULT);
    expect(samples.length).toBe(GENERATIONS + 1);
    expect(samples[0]?.generation).toBe(0);
    expect(samples[samples.length - 1]?.generation).toBe(GENERATIONS);
  });

  it("at k = 1, every population is 1", () => {
    const samples = samplePopulation(1.0);
    expect(samples.every((s) => s.population === 1)).toBe(true);
  });

  it("at k = 1.05, populations strictly increase", () => {
    const samples = samplePopulation(1.05);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!.population).toBeGreaterThan(samples[i - 1]!.population);
    }
  });

  it("at k = 0.95, populations strictly decrease after generation 0", () => {
    const samples = samplePopulation(0.95);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!.population).toBeLessThan(samples[i - 1]!.population);
    }
  });

  it("respects an overridden generation count", () => {
    const samples = samplePopulation(1.0, 5);
    expect(samples.length).toBe(6);
  });
});

describe("Y_MIN / Y_MAX bounds", () => {
  it("Y_MIN = K_MIN^GENERATIONS", () => {
    expect(Y_MIN).toBeCloseTo(Math.pow(K_MIN, GENERATIONS), 10);
  });

  it("Y_MAX = K_MAX^GENERATIONS", () => {
    expect(Y_MAX).toBeCloseTo(Math.pow(K_MAX, GENERATIONS), 10);
  });

  it("Y_MIN < 1 < Y_MAX (critical point sits inside the visible range)", () => {
    expect(Y_MIN).toBeLessThan(1);
    expect(Y_MAX).toBeGreaterThan(1);
  });
});

describe("yPositionLog", () => {
  it("returns 0 at Y_MIN (bottom of plot)", () => {
    expect(yPositionLog(Y_MIN)).toBeCloseTo(0, 10);
  });

  it("returns 1 at Y_MAX (top of plot)", () => {
    expect(yPositionLog(Y_MAX)).toBeCloseTo(1, 10);
  });

  it("returns 0.5 at the geometric mean (population = 1, since Y_MIN and Y_MAX are mirrored in log)", () => {
    // K_MIN^G * K_MAX^G = (K_MIN * K_MAX)^G ≈ (1.0)^G when K_MIN ≈ 1/K_MAX
    // K_MIN = 0.95, K_MAX = 1.05 → product 0.9975, close to 1 but not exact.
    // The geometric mean of Y_MIN and Y_MAX is exp((logYmin + logYmax)/2).
    const geomMean = Math.exp((Math.log(Y_MIN) + Math.log(Y_MAX)) / 2);
    expect(yPositionLog(geomMean)).toBeCloseTo(0.5, 6);
  });

  it("handles non-positive populations as bottom-of-plot", () => {
    expect(yPositionLog(0)).toBe(0);
    expect(yPositionLog(-1)).toBe(0);
  });
});
