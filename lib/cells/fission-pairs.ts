/**
 * U-235 thermal fission daughter pairs — high-yield examples.
 *
 * Each pair represents a real fission product distribution drawn from
 * the double-humped yield curve of U-235 thermal fission. The reaction
 * is U-235 + n → heavy fragment + light fragment + N free neutrons,
 * with mass number A and atomic number Z conserving exactly:
 *
 *   Z_heavy + Z_light = 92
 *   A_heavy + A_light + N_free = 236
 *
 * The animation renders a stylized ~70-nucleon cluster (scale factor
 * ~0.30 vs the real 235 nucleons). The scaled counts below preserve
 * exact mass + proton balance at the stylized scale:
 *
 *   Stylized U-236*  = 27p + 45n  (the parent after neutron capture)
 *   = heavy_scaled + light_scaled + free_scaled
 *
 * Selection: `pairForCycle(cycleIndex)` rotates deterministically
 * through this table so successive replays show different products
 * without any per-replay randomness.
 */

export interface FissionPair {
  /** Heavy fragment isotope name (e.g., "Ba-141"). */
  heavyName: string;
  /** Heavy: scaled proton count for the visual cluster. */
  heavyProtons: number;
  /** Heavy: scaled neutron count. */
  heavyNeutrons: number;
  /** Light fragment isotope name (e.g., "Kr-92"). */
  lightName: string;
  lightProtons: number;
  lightNeutrons: number;
  /** Real prompt-neutron count released by this branch. */
  freeN: number;
  /** Short pedagogical hook the article can reference. */
  blurb: string;
}

export const FISSION_PAIRS: ReadonlyArray<FissionPair> = [
  {
    heavyName: "Ba-141",
    heavyProtons: 16,
    heavyNeutrons: 25,
    lightName: "Kr-92",
    lightProtons: 11,
    lightNeutrons: 17,
    freeN: 3,
    blurb: "the textbook pair",
  },
  {
    heavyName: "Cs-137",
    heavyProtons: 16,
    heavyNeutrons: 24,
    lightName: "Rb-95",
    lightProtons: 11,
    lightNeutrons: 17,
    freeN: 4,
    blurb: "Cs-137 — a major long-lived waste product",
  },
  {
    heavyName: "Xe-140",
    heavyProtons: 16,
    heavyNeutrons: 26,
    lightName: "Sr-94",
    lightProtons: 11,
    lightNeutrons: 17,
    freeN: 2,
    blurb: "asymmetric mass split, 2-neutron branch",
  },
  {
    heavyName: "I-131",
    heavyProtons: 16,
    heavyNeutrons: 23,
    lightName: "Y-101",
    lightProtons: 11,
    lightNeutrons: 18,
    freeN: 4,
    blurb: "I-131 — the medical isotope",
  },
  {
    heavyName: "Xe-144",
    heavyProtons: 16,
    heavyNeutrons: 27,
    lightName: "Sr-90",
    lightProtons: 11,
    lightNeutrons: 16,
    freeN: 2,
    blurb: "Sr-90 — a long-lived waste isotope",
  },
  {
    heavyName: "Sn-134",
    heavyProtons: 15,
    heavyNeutrons: 25,
    lightName: "Mo-99",
    lightProtons: 12,
    lightNeutrons: 17,
    freeN: 3,
    blurb: "Mo-99 — parent of the medical Tc-99m",
  },
  {
    heavyName: "Te-132",
    heavyProtons: 15,
    heavyNeutrons: 23,
    lightName: "Zr-100",
    lightProtons: 12,
    lightNeutrons: 18,
    freeN: 4,
    blurb: "4-neutron branch toward symmetric split",
  },
];

/**
 * Pick the fission pair for the given replay cycle. Rotates through
 * the table deterministically so every replay shows a different pair
 * (cycling at length 7).
 */
export function pairForCycle(cycleIndex: number): FissionPair {
  const n = FISSION_PAIRS.length;
  // Use a coprime stride so consecutive cycles aren't sequentially
  // adjacent in the table.
  const idx = ((cycleIndex * 3) + 0) % n;
  return FISSION_PAIRS[idx]!;
}
