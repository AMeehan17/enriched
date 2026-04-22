import { describe, it, expect } from "vitest";
import { matchReactors, type MatchConfig } from "./reactor-match";
import { reactors } from "../data-src/reactors";

/**
 * Tests for matchReactors — schema v4.
 *
 * Uses the real reactor data from data-src/reactors.ts so tests stay
 * grounded in actual content.
 *
 * Schema v4 adds spectrum as a user-pickable filter dimension.
 *
 * Reactor set with spectrum annotation:
 *   AP1000         u-235 / ceramic-pellets / water+light-water / thermal / large, FOAK
 *   VOYGR          u-235 / ceramic-pellets / water+light-water / thermal / small, walk-away-safe, FOAK
 *   Xe-100         u-235 / triso / helium / thermal / small, walk-away-safe, process-heat
 *   BWRX-300       u-235 / ceramic-pellets / water+light-water / thermal / mid, walk-away-safe
 *   Natrium        u-235 / metal / sodium / fast / mid, walk-away-safe, load-following,
 *                  thermal-storage, waste-burner
 *   KP-FHR         u-235 / triso / molten-salt+flibe / thermal / small, walk-away-safe, process-heat
 *   Copenhagen     th-232 + u-235-kickstart / molten-salt+flibe / thermal (thorium!) /
 *                  small, walk-away-safe, fuel-breeder, non-proliferative
 */

const empty: MatchConfig = {
  fuelMaterial: null,
  kickstarter: null,
  fuelForm: null,
  coolant: [],
  coolantChemistry: [],
  spectrum: null,
  xFactor: [],
};

describe("matchReactors (schema v4)", () => {
  it("returns all reactors when no filters are set", () => {
    const result = matchReactors(empty, reactors);
    expect(result.results).toHaveLength(7);
    expect(result.noMatch).toBe(false);
  });

  it("filters by fissile element (single-value)", () => {
    const result = matchReactors(
      { ...empty, fuelMaterial: "th-232" },
      reactors,
    );
    // Only Copenhagen Atomics uses Th-232
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("copenhagen-atomics");
  });

  it("filters by fissile element u-235", () => {
    const result = matchReactors(
      { ...empty, fuelMaterial: "u-235" },
      reactors,
    );
    // All except Copenhagen Atomics
    expect(result.results).toHaveLength(6);
    expect(result.results.map((r) => r.id)).not.toContain("copenhagen-atomics");
  });

  it("filters by fuel form (single-value)", () => {
    const result = matchReactors(
      { ...empty, fuelForm: "triso" },
      reactors,
    );
    // Xe-100 and KP-FHR use TRISO
    expect(result.results).toHaveLength(2);
    expect(result.results.map((r) => r.id).sort()).toEqual(["kp-fhr", "xe-100"]);
  });

  it("filters by fuel form molten-salt", () => {
    const result = matchReactors(
      { ...empty, fuelForm: "molten-salt" },
      reactors,
    );
    // Only Copenhagen Atomics uses molten-salt fuel form
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("copenhagen-atomics");
  });

  it("filters by kickstarter (single-value)", () => {
    const result = matchReactors(
      { ...empty, kickstarter: "u-235-kickstart" },
      reactors,
    );
    // Only Copenhagen Atomics has a U-235 kickstarter
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("copenhagen-atomics");
  });

  it("filters by single coolant (array with one value)", () => {
    const result = matchReactors(
      { ...empty, coolant: ["sodium"] },
      reactors,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("OR semantics: multiple coolants broaden the filter", () => {
    const result = matchReactors(
      { ...empty, coolant: ["sodium", "helium"] },
      reactors,
    );
    // Natrium (sodium) + Xe-100 (helium)
    expect(result.results).toHaveLength(2);
    expect(result.results.map((r) => r.id).sort()).toEqual(["natrium", "xe-100"]);
  });

  it("single X-Factor tag filters correctly", () => {
    const result = matchReactors(
      { ...empty, xFactor: ["walk-away-safe"] },
      reactors,
    );
    // AP1000 is the only one not tagged walk-away-safe
    expect(result.results).toHaveLength(6);
    expect(result.results.map((r) => r.id)).not.toContain("ap1000");
  });

  it("AND across dimensions: u-235 + triso narrows results", () => {
    const result = matchReactors(
      { ...empty, fuelMaterial: "u-235", fuelForm: "triso" },
      reactors,
    );
    // Xe-100 and KP-FHR both use U-235 + TRISO
    expect(result.results).toHaveLength(2);
    expect(result.results.map((r) => r.id).sort()).toEqual(["kp-fhr", "xe-100"]);
  });

  it("returns noMatch=true for an impossible combination", () => {
    const result = matchReactors(
      {
        ...empty,
        fuelMaterial: "th-232",
        fuelForm: "ceramic-pellets",
      },
      reactors,
    );
    // No reactor has th-232 + ceramic-pellets (Copenhagen uses molten-salt)
    expect(result.results).toHaveLength(0);
    expect(result.noMatch).toBe(true);
  });

  it("returns noMatch=false when all dimensions are empty", () => {
    const result = matchReactors(empty, reactors);
    expect(result.noMatch).toBe(false);
  });

  it("ranks by number of matched tags", () => {
    // Natrium has walk-away-safe + load-following + thermal-storage + waste-burner
    // Other walk-away-safe reactors match just walk-away-safe (score 1)
    const result = matchReactors(
      {
        ...empty,
        xFactor: ["walk-away-safe", "load-following"],
      },
      reactors,
    );
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("alphabetical tiebreak when scores equal", () => {
    const result = matchReactors(
      { ...empty, xFactor: ["walk-away-safe"] },
      reactors,
    );
    const names = result.results.map((r) => r.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("three-dimension filter narrows to one design", () => {
    const result = matchReactors(
      {
        fuelMaterial: "u-235",
        kickstarter: null,
        fuelForm: "metal",
        coolant: ["sodium"],
        coolantChemistry: [],
        spectrum: null,
        xFactor: ["thermal-storage"],
      },
      reactors,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("Copenhagen Atomics matches via full thorium config", () => {
    const result = matchReactors(
      {
        fuelMaterial: "th-232",
        kickstarter: "u-235-kickstart",
        fuelForm: "molten-salt",
        coolant: ["molten-salt"],
        coolantChemistry: ["flibe"],
        spectrum: null,
        xFactor: [],
      },
      reactors,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("copenhagen-atomics");
  });

  it("broad selection returns all qualifying reactors", () => {
    const result = matchReactors(
      { ...empty, fuelMaterial: "u-235", xFactor: ["small"] },
      reactors,
    );
    // U-235 + small (v3: BWRX-300 reclassified to mid) → VOYGR, Xe-100, KP-FHR
    expect(result.results).toHaveLength(3);
    expect(result.results.map((r) => r.id).sort()).toEqual([
      "kp-fhr",
      "voygr",
      "xe-100",
    ]);
  });

  it("filters by coolant chemistry (light-water)", () => {
    const result = matchReactors(
      { ...empty, coolantChemistry: ["light-water"] },
      reactors,
    );
    // AP1000, VOYGR, BWRX-300 all use water + light-water chemistry
    expect(result.results).toHaveLength(3);
    expect(result.results.map((r) => r.id).sort()).toEqual([
      "ap1000",
      "bwrx-300",
      "voygr",
    ]);
  });

  it("filters by coolant parent + chemistry AND", () => {
    const result = matchReactors(
      {
        ...empty,
        coolant: ["molten-salt"],
        coolantChemistry: ["flibe"],
      },
      reactors,
    );
    // KP-FHR and Copenhagen both use molten-salt+flibe
    expect(result.results).toHaveLength(2);
    expect(result.results.map((r) => r.id).sort()).toEqual([
      "copenhagen-atomics",
      "kp-fhr",
    ]);
  });

  // ─── v4: spectrum dimension ──────────────────────────────────────

  it("filters by spectrum thermal (6 of 7 reactors are thermal)", () => {
    const result = matchReactors({ ...empty, spectrum: "thermal" }, reactors);
    expect(result.results).toHaveLength(6);
    expect(result.results.map((r) => r.id)).not.toContain("natrium");
  });

  it("filters by spectrum fast (Natrium is the only fast reactor)", () => {
    const result = matchReactors({ ...empty, spectrum: "fast" }, reactors);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("thorium + thermal + fuel-breeder matches Copenhagen (thermal breeder)", () => {
    // The thorium teaching moment: breeding in the thermal spectrum is
    // normally impossible, but Th-232 → U-233 does it.
    const result = matchReactors(
      {
        ...empty,
        fuelMaterial: "th-232",
        spectrum: "thermal",
        xFactor: ["fuel-breeder"],
      },
      reactors,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("copenhagen-atomics");
  });

  it("u-235 + thermal + fuel-breeder yields zero (U cannot thermally breed)", () => {
    const result = matchReactors(
      {
        ...empty,
        fuelMaterial: "u-235",
        spectrum: "thermal",
        xFactor: ["fuel-breeder"],
      },
      reactors,
    );
    // No current U-235 design is a thermal breeder.
    expect(result.results).toHaveLength(0);
    expect(result.noMatch).toBe(true);
  });

  it("waste-burner + thermal is an impossible combination", () => {
    const result = matchReactors(
      {
        ...empty,
        spectrum: "thermal",
        xFactor: ["waste-burner"],
      },
      reactors,
    );
    expect(result.results).toHaveLength(0);
    expect(result.noMatch).toBe(true);
  });

  it("spectrum + coolant AND narrows to one reactor", () => {
    const result = matchReactors(
      { ...empty, spectrum: "fast", coolant: ["sodium"] },
      reactors,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("empty reactor list returns empty filter", () => {
    const result = matchReactors(
      { ...empty, fuelMaterial: "u-235" },
      [],
    );
    expect(result.results).toHaveLength(0);
    expect(result.noMatch).toBe(true);
  });
});
