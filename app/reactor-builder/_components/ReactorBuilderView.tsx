"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import type {
  ReactorTaxonomy,
  ReactorDesign,
  FuelMaterialId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  CoolantChemistryId,
  SpectrumId,
  XFactorId,
} from "@/lib/reactor-types";
import { WATER_CHEMISTRY_IDS, SALT_CHEMISTRY_IDS } from "@/lib/reactor-types";
import { matchReactors } from "@/lib/reactor-match";
import { REACTOR_BUILDER_SEARCH_PARAMS } from "@/lib/reactor-url-state";
import { StepSection } from "./StepSection";
import { SpecCard } from "./SpecCard";
import { MatchList } from "./MatchList";
import { PresetLinks } from "./PresetLinks";

interface ReactorBuilderViewProps {
  taxonomy: ReactorTaxonomy;
  reactors: readonly ReactorDesign[];
}

/**
 * ReactorBuilderView — the interactive Reactor Builder (schema v4).
 *
 * Steps (conditional sub-steps in brackets):
 *   Step 1  — Fuel material     (single-select)
 *   [Step 1a — Kickstarter      (renders when Step 1 = th-232)]
 *   Step 2  — Fuel form         (single-select)
 *   Step 3  — Coolant           (multi-select, restricted to molten-salt
 *                                when fuel form = molten-salt)
 *   [Step 3a — Coolant chemistry (renders when coolant includes water
 *                                 or molten-salt)]
 *   Step 4  — Neutron spectrum  (single-select, v4)
 *   Step 5  — Size              (multi-select, scale tags)
 *   Step 6  — Capabilities      (multi-select, capability tags)
 *
 * v4 spectrum coupling (bidirectional, prevention at input time):
 *   Forward (other → spectrum):
 *     - water coolant or water chemistry → thermal only
 *     - sodium / lead / lead-bismuth coolant → fast only
 *     - chloride-salt chemistry → fast only
 *     - flibe / flinak chemistry → thermal only
 *     - waste-burner capability → fast only
 *     - fuel-breeder + fuel ≠ th-232 → fast only
 *     - fuel-breeder + fuel === th-232 → both thermal and fast OK
 *       (the Thorium thermal-breeder exception)
 *   Reverse (spectrum → others):
 *     - fast → locks water coolant, water/fluoride-salt chemistries
 *     - thermal → locks sodium / lead / lead-bismuth coolants,
 *       chloride-salt chemistry, waste-burner capability, and
 *       fuel-breeder capability (unless fuel === th-232)
 *   Capability → coolant shortcut (so user sees the lock without
 *   needing to commit a spectrum first):
 *     - waste-burner or (fuel-breeder + non-thorium fuel) →
 *       lock water coolant and water / fluoride-salt chemistries
 *
 * Progressive dimming cascade:
 *   Step 1: always active
 *   Step 1a: only renders when Step 1 = th-232
 *   Step 2: dim until Step 1 has a selection (and kickstarter if Th-232)
 *   Step 3: dim until Step 2 has a selection
 *   Step 3a: only renders when coolant needs disambiguation
 *   Step 4, 5, 6: always active (preset links land in 5+6)
 */
export function ReactorBuilderView({
  taxonomy,
  reactors,
}: ReactorBuilderViewProps) {
  const [state, setState] = useQueryStates(REACTOR_BUILDER_SEARCH_PARAMS, {
    shallow: false,
  });

  // Destructure with typed aliases for clarity
  const fe: FuelMaterialId | null = state.fe;
  const ks: KickstarterId | null = state.ks;
  const ff: FuelFormId | null = state.ff;
  const c: CoolantId[] = state.c;
  const cc: CoolantChemistryId[] = state.cc;
  const s: SpectrumId | null = state.s;
  const x: XFactorId[] = state.x;

  // Compute matches
  const matchResult = useMemo(
    () =>
      matchReactors(
        {
          fuelMaterial: fe,
          kickstarter: ks,
          fuelForm: ff,
          coolant: c,
          coolantChemistry: cc,
          spectrum: s,
          xFactor: x,
        },
        reactors,
      ),
    [fe, ks, ff, c, cc, s, x, reactors],
  );

  // Progressive dim gates
  const fissileMissing = fe === null;
  const kickstarterNeeded = fe === "th-232";
  const kickstarterMissing = kickstarterNeeded && ks === null;
  const formDim = fissileMissing || kickstarterMissing;
  const formMissing = ff === null;
  const coolantDim = formDim || formMissing;

  // Flags used both by the locking engine and by intro-copy below.
  const saltFuel = ff === "molten-salt";
  const hasNonSaltCoolant = c.some((cid) => cid !== "molten-salt");

  // ─── Physics coupling — all derived, recomputed on any change ───
  //
  // The whole physics constraint network lives in one useMemo so the
  // rules read top-to-bottom. Output is five Sets of locked chip IDs,
  // consumed by the StepSections via `lockedIds`.
  const {
    lockedCoolants,
    lockedForms,
    lockedChemistries,
    lockedSpectrums,
    lockedCapabilities,
  } = useMemo(() => {
    const hasWasteBurner = x.includes("waste-burner");
    const hasFuelBreeder = x.includes("fuel-breeder");
    const nonThoriumBreed =
      hasFuelBreeder && fe !== null && fe !== "th-232";
    // Thorium thermal-breeder exception: fuel-breeder + th-232 does NOT
    // force fast spectrum. This is the whole reason spectrum is a step.
    const hasFastForcingCapability = hasWasteBurner || nonThoriumBreed;

    // ─── Spectrum constraints (forward: other dimensions → spectrum)
    // Start with all three allowed; each constraint prunes the set.
    const possibleSpectrums = new Set<SpectrumId>([
      "thermal",
      "fast",
      "epithermal",
    ]);
    // Coolant constraints
    for (const cid of c) {
      if (cid === "water") {
        possibleSpectrums.delete("fast");
        possibleSpectrums.delete("epithermal");
      }
      if (
        cid === "sodium" ||
        cid === "lead" ||
        cid === "lead-bismuth"
      ) {
        possibleSpectrums.delete("thermal");
        possibleSpectrums.delete("epithermal");
      }
    }
    // Chemistry constraints
    for (const chem of cc) {
      if (WATER_CHEMISTRY_IDS.includes(chem)) {
        possibleSpectrums.delete("fast");
        possibleSpectrums.delete("epithermal");
      }
      if (chem === "chloride-salt") {
        possibleSpectrums.delete("thermal");
        possibleSpectrums.delete("epithermal");
      }
      if (chem === "flibe" || chem === "flinak") {
        possibleSpectrums.delete("fast");
        possibleSpectrums.delete("epithermal");
      }
    }
    // Capability constraints
    if (hasFastForcingCapability) {
      possibleSpectrums.delete("thermal");
      possibleSpectrums.delete("epithermal");
    }

    const allSpectrums: SpectrumId[] = ["thermal", "fast", "epithermal"];
    const lockedSpectrums = new Set<string>(
      allSpectrums.filter((sp) => !possibleSpectrums.has(sp)),
    );

    // ─── Reverse: spectrum → other dimensions ───────────────────
    const lockedCoolantsFromSpectrum = new Set<string>();
    const lockedChemistriesFromSpectrum = new Set<string>();
    const lockedCapabilitiesFromSpectrum = new Set<string>();
    if (s === "fast") {
      lockedCoolantsFromSpectrum.add("water");
      lockedChemistriesFromSpectrum.add("light-water");
      lockedChemistriesFromSpectrum.add("heavy-water");
      lockedChemistriesFromSpectrum.add("flibe");
      lockedChemistriesFromSpectrum.add("flinak");
    } else if (s === "thermal") {
      lockedCoolantsFromSpectrum.add("sodium");
      lockedCoolantsFromSpectrum.add("lead");
      lockedCoolantsFromSpectrum.add("lead-bismuth");
      lockedChemistriesFromSpectrum.add("chloride-salt");
      lockedCapabilitiesFromSpectrum.add("waste-burner");
      // Fuel-breeder lock is conditional on fuel — thorium thermal
      // breeding is valid, so only lock when fuel is committed
      // non-thorium.
      if (fe !== null && fe !== "th-232") {
        lockedCapabilitiesFromSpectrum.add("fuel-breeder");
      }
    }
    // Epithermal locks nothing downstream — it's rare and will just
    // produce zero matches if the user picks it.

    // ─── Capability → coolant shortcut ──────────────────────────
    // So users see the lock without having to pick spectrum first.
    const lockedCoolantsFromCapability = new Set<string>();
    const lockedChemistriesFromCapability = new Set<string>();
    if (hasFastForcingCapability) {
      lockedCoolantsFromCapability.add("water");
      lockedChemistriesFromCapability.add("light-water");
      lockedChemistriesFromCapability.add("heavy-water");
      lockedChemistriesFromCapability.add("flibe");
      lockedChemistriesFromCapability.add("flinak");
    }

    // ─── Final unions ───────────────────────────────────────────
    const lockedCoolants = new Set<string>([
      ...(saltFuel
        ? taxonomy.coolantTags
            .filter((t) => t.id !== "molten-salt")
            .map((t) => t.id)
        : []),
      ...lockedCoolantsFromSpectrum,
      ...lockedCoolantsFromCapability,
    ]);
    const lockedForms = new Set<string>(
      hasNonSaltCoolant ? ["molten-salt"] : [],
    );
    const lockedChemistries = new Set<string>([
      ...lockedChemistriesFromSpectrum,
      ...lockedChemistriesFromCapability,
    ]);
    const lockedCapabilities = lockedCapabilitiesFromSpectrum;

    return {
      lockedCoolants,
      lockedForms,
      lockedChemistries,
      lockedSpectrums,
      lockedCapabilities,
    };
  }, [fe, ff, c, cc, s, x, taxonomy.coolantTags]);

  // Chemistry step visibility + tag pool.
  const wantsWater = c.includes("water");
  const wantsSalt = c.includes("molten-salt");
  const chemistryNeeded = wantsWater || wantsSalt;
  const chemistryTags = useMemo(() => {
    if (!chemistryNeeded) return [];
    const water = wantsWater
      ? taxonomy.coolantChemistryTags.filter((t) =>
          WATER_CHEMISTRY_IDS.includes(t.id),
        )
      : [];
    const salt = wantsSalt
      ? taxonomy.coolantChemistryTags.filter((t) =>
          SALT_CHEMISTRY_IDS.includes(t.id),
        )
      : [];
    return [...water, ...salt];
  }, [chemistryNeeded, wantsWater, wantsSalt, taxonomy.coolantChemistryTags]);

  // Single-select handlers
  const selectFissile = (id: string) => {
    const typedId = id as FuelMaterialId;
    if (fe === typedId) {
      // Deselect, also clear downstream that depended on this
      void setState({ fe: null, ks: null, ff: null, c: [] });
    } else {
      // Change element: clear kickstarter if switching away from th-232
      const newKs = typedId === "th-232" ? ks : null;
      void setState({ fe: typedId, ks: newKs });
    }
  };
  const selectKickstarter = (id: string) => {
    const typedId = id as KickstarterId;
    void setState({ ks: ks === typedId ? null : typedId });
  };
  const selectForm = (id: string) => {
    const typedId = id as FuelFormId;
    if (lockedForms.has(typedId)) return; // guard
    if (ff === typedId) {
      // Deselect
      void setState({ ff: null, c: [], cc: [] });
    } else if (typedId === "molten-salt") {
      // Switching TO molten-salt: collapse coolant to just molten-salt and
      // drop any water chemistries that don't fit anymore.
      const dropsWaterChem = cc.filter(
        (chem) => !WATER_CHEMISTRY_IDS.includes(chem),
      );
      void setState({
        ff: typedId,
        c: ["molten-salt"],
        cc: dropsWaterChem,
      });
    } else {
      void setState({ ff: typedId });
    }
  };
  // Multi-select handlers
  const toggleCoolant = (id: string) => {
    const typedId = id as CoolantId;
    if (lockedCoolants.has(typedId)) return; // guard
    const adding = !c.includes(typedId);
    const next = adding ? [...c, typedId] : c.filter((cid) => cid !== typedId);
    // When removing a parent coolant, drop any chemistry that no longer
    // belongs to a still-selected parent.
    const stillWantsWater = next.includes("water");
    const stillWantsSalt = next.includes("molten-salt");
    const nextCc = cc.filter((chem) => {
      if (WATER_CHEMISTRY_IDS.includes(chem)) return stillWantsWater;
      if (SALT_CHEMISTRY_IDS.includes(chem)) return stillWantsSalt;
      return true;
    });
    void setState({ c: next, cc: nextCc });
  };
  const toggleChemistry = (id: string) => {
    const typedId = id as CoolantChemistryId;
    if (lockedChemistries.has(typedId)) return; // guard
    const next = cc.includes(typedId)
      ? cc.filter((chem) => chem !== typedId)
      : [...cc, typedId];
    void setState({ cc: next });
  };
  const selectSpectrum = (id: string) => {
    const typedId = id as SpectrumId;
    if (lockedSpectrums.has(typedId)) return; // guard
    // Single-select: click again to deselect.
    void setState({ s: s === typedId ? null : typedId });
  };
  const toggleXFactor = (id: string) => {
    const typedId = id as XFactorId;
    if (lockedCapabilities.has(typedId)) return; // guard
    const next = x.includes(typedId)
      ? x.filter((xid) => xid !== typedId)
      : [...x, typedId];
    void setState({ x: next });
  };

  // Clear handlers
  const clearAll = () =>
    void setState({ fe: null, ks: null, ff: null, c: [], cc: [], s: null, x: [] });
  const clearFissile = () =>
    void setState({ fe: null, ks: null, ff: null, c: [], cc: [] });
  const clearKickstarter = () => void setState({ ks: null });
  const clearForm = () => void setState({ ff: null, c: [], cc: [] });
  const clearCoolant = () => void setState({ c: [], cc: [] });
  const clearChemistry = () => void setState({ cc: [] });
  const clearSpectrum = () => void setState({ s: null });
  const clearXFactor = () => void setState({ x: [] });

  // Split X-Factor tags by group
  const scaleTags = useMemo(
    () => taxonomy.xFactorTags.filter((t) => t.group === "scale"),
    [taxonomy.xFactorTags],
  );
  const capabilityTags = useMemo(
    () => taxonomy.xFactorTags.filter((t) => t.group === "capability"),
    [taxonomy.xFactorTags],
  );

  // Selected sets for the chip grid
  const feSet: ReadonlySet<string> = useMemo(
    () => new Set<string>(fe ? [fe] : []),
    [fe],
  );
  const ksSet: ReadonlySet<string> = useMemo(
    () => new Set<string>(ks ? [ks] : []),
    [ks],
  );
  const ffSet: ReadonlySet<string> = useMemo(
    () => new Set<string>(ff ? [ff] : []),
    [ff],
  );
  const cSet: ReadonlySet<string> = useMemo(() => new Set<string>(c), [c]);
  const ccSet: ReadonlySet<string> = useMemo(() => new Set<string>(cc), [cc]);
  const sSet: ReadonlySet<string> = useMemo(
    () => new Set<string>(s ? [s] : []),
    [s],
  );
  const xSet: ReadonlySet<string> = useMemo(() => new Set<string>(x), [x]);

  // Step explainer lookup — one map built once so every StepSection
  // can grab its content by key.
  const explainerMap = useMemo(
    () => new Map(taxonomy.stepExplainers.map((e) => [e.key, e])),
    [taxonomy.stepExplainers],
  );

  const scaleIdSet = useMemo(
    () => new Set<string>(scaleTags.map((t) => t.id)),
    [scaleTags],
  );
  const capabilityIdSet = useMemo(
    () => new Set<string>(capabilityTags.map((t) => t.id)),
    [capabilityTags],
  );
  const hasScaleSelection = x.some((xid) => scaleIdSet.has(xid));
  const hasCapabilitySelection = x.some((xid) => capabilityIdSet.has(xid));
  const clearScale = () =>
    void setState({ x: x.filter((xid) => !scaleIdSet.has(xid)) });
  const clearCapability = () =>
    void setState({ x: x.filter((xid) => !capabilityIdSet.has(xid)) });

  const hasAnySelection =
    fe !== null ||
    ks !== null ||
    ff !== null ||
    c.length > 0 ||
    cc.length > 0 ||
    s !== null ||
    x.length > 0;

  return (
    <>
      <h2 id="builder-title" className="sr-only">
        Reactor Builder
      </h2>

      <PresetLinks
        onPreset={(config) => {
          void setState(config);
        }}
      />

      {/* Two-column grid on desktop; stacks on mobile */}
      <div className="grid grid-cols-1 min-[880px]:grid-cols-[minmax(0,1fr)_360px] gap-[var(--spacing-12)] pt-[var(--spacing-8)] items-start">
        <div>
          {/* Step 1: Fuel material */}
          <StepSection
            stepNumber={1}
            title="Choose a fuel"
            intro="What's in the fuel? Uranium-235 is fissile — it splits directly and powers today's fleet. Thorium-232 is fertile — it can't split on its own but transmutes into fissile U-233 once the reactor is running. Plutonium-239 is fissile and comes from recycled spent fuel."
            tags={taxonomy.fuelMaterialTags}
            selected={feSet}
            onToggle={selectFissile}
            onClear={fe !== null ? clearFissile : undefined}
            dim={false}
            explainer={explainerMap.get("fuelMaterial")}
          />

          {/* Step 1a: Kickstarter — only when Th-232 */}
          {kickstarterNeeded ? (
            <StepSection
              stepNumber={1}
              subStepLabel="1a"
              title="Pick a kickstarter"
              intro="Thorium isn't itself fissile — you need a fissile starter to light the fire. After the reactor runs, bred U-233 from thorium takes over."
              tags={taxonomy.kickstarterTags}
              selected={ksSet}
              onToggle={selectKickstarter}
              onClear={ks !== null ? clearKickstarter : undefined}
              dim={false}
              explainer={explainerMap.get("kickstarter")}
            />
          ) : null}

          {/* Step 2: Fuel form */}
          <StepSection
            stepNumber={2}
            title="Pick a fuel form"
            intro={
              hasNonSaltCoolant
                ? "How is the fuel packaged? Molten-salt fuel is locked because you've picked a non-salt coolant — molten-salt fuel IS the coolant, so it can only pair with a salt chemistry."
                : "How is the fuel packaged? The form determines everything downstream — pressure, temperature, safety envelope. Molten-salt fuel is the coolant too."
            }
            tags={taxonomy.fuelFormTags}
            selected={ffSet}
            lockedIds={lockedForms}
            onToggle={selectForm}
            onClear={ff !== null ? clearForm : undefined}
            dim={formDim}
            explainer={explainerMap.get("fuelForm")}
          />

          {/* Step 3: Coolant */}
          <StepSection
            stepNumber={3}
            title="Pick a coolant"
            intro={
              saltFuel
                ? "Your fuel is dissolved in salt, so the coolant IS the fuel carrier. Coolant is locked to molten-salt — everything else is physically impossible here."
                : "Coolant defines outlet temperature and safety profile. It's the most consequential physical decision in a reactor."
            }
            tags={taxonomy.coolantTags}
            selected={cSet}
            lockedIds={lockedCoolants}
            onToggle={toggleCoolant}
            onClear={c.length > 0 ? clearCoolant : undefined}
            dim={coolantDim}
            explainer={explainerMap.get("coolant")}
          />

          {/* Step 3a: Coolant chemistry — only when water or molten-salt. */}
          {chemistryNeeded ? (
            <StepSection
              stepNumber={3}
              subStepLabel="3a"
              title="Pick a chemistry"
              intro={
                wantsWater && wantsSalt
                  ? "Water and molten-salt both have specific chemistries that change the physics. Light vs heavy water sets enrichment needs; FLiBe vs FLiNaK vs Chloride sets moderation and spectrum."
                  : wantsSalt
                    ? "Which salt? FLiBe and FLiNaK moderate neutrons (thermal spectrum); Chloride does not (fast spectrum — enables breeding and waste burning)."
                    : "Light water needs enriched fuel; heavy water absorbs fewer neutrons and can sustain a chain reaction with natural uranium."
              }
              tags={chemistryTags}
              selected={ccSet}
              lockedIds={lockedChemistries}
              onToggle={toggleChemistry}
              onClear={cc.length > 0 ? clearChemistry : undefined}
              dim={false}
              explainer={explainerMap.get("coolantChemistry")}
            />
          ) : null}

          {/* Step 4: Neutron spectrum — single-select (v4) */}
          <StepSection
            stepNumber={4}
            title="Pick a spectrum"
            intro="Thermal neutrons make cheap electricity from cheap fuel. Fast neutrons unlock breeding and waste burning — but demand HALEU or plutonium. Thorium in thermal is the exception that makes fuel-breeder + thermal actually work."
            tags={taxonomy.spectrumTags}
            selected={sSet}
            lockedIds={lockedSpectrums}
            onToggle={selectSpectrum}
            onClear={s !== null ? clearSpectrum : undefined}
            dim={false}
            explainer={explainerMap.get("spectrum")}
          />

          {/* Step 5: Size (scale tags) */}
          <StepSection
            stepNumber={5}
            title="Choose a size"
            intro="How big? Micro (<20 MWe) is truck-transportable. Small (20–200 MWe) is factory-modular. Mid (200–700 MWe) is the economics sweet spot. Large (>700 MWe) is the gigawatt-class baseload play."
            tags={scaleTags}
            selected={xSet}
            onToggle={toggleXFactor}
            onClear={hasScaleSelection ? clearScale : undefined}
            dim={false}
            explainer={explainerMap.get("size")}
          />

          {/* Step 6: Capabilities */}
          <StepSection
            stepNumber={6}
            title="Pick capabilities"
            intro="What should this reactor be able to do? Multi-select — a reactor can deliver several of these at once. Some force a fast spectrum (waste-burner; fuel-breeder without thorium)."
            tags={capabilityTags}
            selected={xSet}
            lockedIds={lockedCapabilities}
            onToggle={toggleXFactor}
            onClear={hasCapabilitySelection ? clearCapability : undefined}
            dim={false}
            explainer={explainerMap.get("capabilities")}
          />
        </div>

        {/* Right column: sticky spec card */}
        <SpecCard
          taxonomy={taxonomy}
          fuelMaterial={fe}
          kickstarter={ks}
          fuelForm={ff}
          coolant={c}
          coolantChemistry={cc}
          spectrum={s}
          xFactor={x}
          scaleIdSet={scaleIdSet}
          matchCount={matchResult.results.length}
          totalReactors={reactors.length}
          hasAnySelection={hasAnySelection}
          onClearAll={clearAll}
        />
      </div>

      <MatchList
        taxonomy={taxonomy}
        selectedFuelElement={fe}
        selectedKickstarter={ks}
        selectedFuelForm={ff}
        selectedCoolant={c}
        selectedCoolantChemistry={cc}
        selectedSpectrum={s}
        selectedXFactor={x}
        result={matchResult}
        onClearAll={clearAll}
      />

      {/* Aria-live announces filter changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {hasAnySelection
          ? `Showing ${matchResult.results.length} matching reactor ${matchResult.results.length === 1 ? "design" : "designs"}.`
          : `Showing all ${reactors.length} reactor designs.`}
      </div>
    </>
  );
}
