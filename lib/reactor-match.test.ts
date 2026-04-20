import { describe, it, expect } from "vitest";
import { matchReactors, type MatchConfig } from "./reactor-match";
import { reactors } from "../data-src/reactors";

/**
 * Tests for matchReactors — the core filtering + ranking logic.
 *
 * Uses the real reactor data from data-src/reactors.ts (6 designs)
 * so tests stay grounded in actual content. If a design is added or
 * removed, these tests may need updating.
 *
 * Current starting set:
 *   AP1000      — leu-uo2 / light-water / large, first-of-kind-licensed
 *   VOYGR       — leu-uo2 / light-water / small, walk-away-safe, first-of-kind-licensed
 *   Xe-100      — triso, haleu-metal / helium / small, walk-away-safe, process-heat
 *   BWRX-300    — leu-uo2 / light-water / small, walk-away-safe
 *   Natrium     — haleu-metal / sodium / mid, walk-away-safe, load-following, thermal-storage, waste-burner
 *   KP-FHR      — triso / flibe-salt / small, walk-away-safe, process-heat
 */

const empty: MatchConfig = { fuel: [], coolant: [], xFactor: [] };

describe("matchReactors", () => {
  it("returns all reactors when no filters are set", () => {
    const result = matchReactors(empty, reactors);
    expect(result.results).toHaveLength(6);
    expect(result.noMatch).toBe(false);
  });

  it("filters by a single fuel tag", () => {
    const result = matchReactors(
      { fuel: ["triso"], coolant: [], xFactor: [] },
      reactors,
    );
    // Xe-100 and KP-FHR use TRISO
    expect(result.results.map((r) => r.id)).toEqual(
      expect.arrayContaining(["xe-100", "kp-fhr"]),
    );
    expect(result.results).toHaveLength(2);
    expect(result.noMatch).toBe(false);
  });

  it("filters by a single coolant tag", () => {
    const result = matchReactors(
      { fuel: [], coolant: ["sodium"], xFactor: [] },
      reactors,
    );
    // Only Natrium uses sodium
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("filters by a single X-Factor tag", () => {
    const result = matchReactors(
      { fuel: [], coolant: [], xFactor: ["walk-away-safe"] },
      reactors,
    );
    // VOYGR, Xe-100, BWRX-300, Natrium, KP-FHR are walk-away-safe
    // AP1000 is NOT (it has passive safety features but isn't tagged walk-away-safe)
    expect(result.results).toHaveLength(5);
    expect(result.results.map((r) => r.id)).not.toContain("ap1000");
  });

  it("AND across dimensions: fuel + coolant narrows results", () => {
    const result = matchReactors(
      { fuel: ["leu-uo2"], coolant: ["light-water"], xFactor: [] },
      reactors,
    );
    // AP1000, VOYGR, BWRX-300 all use LEU-UO2 + light water
    expect(result.results).toHaveLength(3);
    expect(result.results.map((r) => r.id)).toEqual(
      expect.arrayContaining(["ap1000", "voygr", "bwrx-300"]),
    );
  });

  it("OR within a dimension: multiple fuel tags match either", () => {
    const result = matchReactors(
      { fuel: ["triso", "haleu-metal"], coolant: [], xFactor: [] },
      reactors,
    );
    // triso: Xe-100, KP-FHR. haleu-metal: Xe-100, Natrium. Union = Xe-100, KP-FHR, Natrium
    expect(result.results).toHaveLength(3);
    expect(result.results.map((r) => r.id)).toEqual(
      expect.arrayContaining(["xe-100", "kp-fhr", "natrium"]),
    );
  });

  it("returns noMatch=true for an impossible combination", () => {
    const result = matchReactors(
      { fuel: ["thorium"], coolant: ["lead"], xFactor: ["walk-away-safe"] },
      reactors,
    );
    expect(result.results).toHaveLength(0);
    expect(result.noMatch).toBe(true);
  });

  it("returns noMatch=false when all dimensions are empty", () => {
    const result = matchReactors(empty, reactors);
    expect(result.noMatch).toBe(false);
  });

  it("ranks by number of matched tags (more matches first)", () => {
    // Natrium has walk-away-safe + load-following + thermal-storage + waste-burner
    // VOYGR has walk-away-safe + first-of-kind-licensed
    // Selecting walk-away-safe + load-following should rank Natrium above VOYGR
    const result = matchReactors(
      {
        fuel: [],
        coolant: [],
        xFactor: ["walk-away-safe", "load-following"],
      },
      reactors,
    );
    // Natrium matches both tags (score 2), others match only walk-away-safe (score 1)
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("uses alphabetical tiebreak when scores are equal", () => {
    // With just walk-away-safe selected, BWRX-300, KP-FHR, Natrium, VOYGR, Xe-100
    // all have score 1. They should sort alphabetically by name.
    const result = matchReactors(
      { fuel: [], coolant: [], xFactor: ["walk-away-safe"] },
      reactors,
    );
    const names = result.results.map((r) => r.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("empty fuel + non-empty coolant filters only on coolant", () => {
    const result = matchReactors(
      { fuel: [], coolant: ["helium"], xFactor: [] },
      reactors,
    );
    // Only Xe-100 uses helium
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("xe-100");
  });

  it("all three dimensions filtered narrows to specific designs", () => {
    const result = matchReactors(
      {
        fuel: ["haleu-metal"],
        coolant: ["sodium"],
        xFactor: ["thermal-storage"],
      },
      reactors,
    );
    // Only Natrium matches all three
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("natrium");
  });

  it("broad selection returns all reactors that match any combination", () => {
    const result = matchReactors(
      {
        fuel: ["leu-uo2", "triso", "haleu-metal"],
        coolant: ["light-water", "helium", "sodium", "flibe-salt"],
        xFactor: [],
      },
      reactors,
    );
    // This covers all 6 designs' fuel + coolant combos
    expect(result.results).toHaveLength(6);
  });

  it("single reactor in dataset still returns correctly", () => {
    const firstReactor = reactors[0];
    if (!firstReactor) throw new Error("reactors[] is empty — test precondition failed");
    const singleReactor = [firstReactor]; // AP1000
    const result = matchReactors(
      { fuel: ["leu-uo2"], coolant: [], xFactor: [] },
      singleReactor,
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.id).toBe("ap1000");
  });
});
