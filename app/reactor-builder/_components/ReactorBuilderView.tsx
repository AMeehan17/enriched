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
 * ReactorBuilderView — the interactive Reactor Builder (schema v3).
 *
 * Steps (conditional sub-steps in brackets):
 *   Step 1  — Fuel material     (single-select)
 *   [Step 1a — Kickstarter      (renders when Step 1 = th-232)]
 *   Step 2  — Fuel form         (single-select)
 *   Step 3  — Coolant           (multi-select, restricted to molten-salt
 *                                when fuel form = molten-salt)
 *   [Step 3a — Coolant chemistry (renders when coolant includes water
 *                                 or molten-salt)]
 *   Step 4  — Size              (multi-select, scale tags)
 *   Step 5  — Capabilities      (multi-select, capability tags)
 *
 * Progressive dimming cascade:
 *   Step 1: always active
 *   Step 1a: only renders when Step 1 = th-232
 *   Step 2: dim until Step 1 has a selection (and kickstarter if Th-232)
 *   Step 3: dim until Step 2 has a selection
 *   Step 3a: only renders when coolant needs disambiguation
 *   Step 4, 5: always active (preset links land here too)
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
          xFactor: x,
        },
        reactors,
      ),
    [fe, ks, ff, c, cc, x, reactors],
  );

  // Progressive dim gates
  const fissileMissing = fe === null;
  const kickstarterNeeded = fe === "th-232";
  const kickstarterMissing = kickstarterNeeded && ks === null;
  const formDim = fissileMissing || kickstarterMissing;
  const formMissing = ff === null;
  const coolantDim = formDim || formMissing;

  // Fuel form ↔ coolant coupling: molten-salt fuel IS the coolant, so
  // when ff=molten-salt the coolant step is locked to just molten-salt.
  const saltFuel = ff === "molten-salt";
  const lockedCoolants = useMemo(
    () =>
      saltFuel
        ? new Set<string>(
            taxonomy.coolantTags
              .filter((t) => t.id !== "molten-salt")
              .map((t) => t.id),
          )
        : new Set<string>(),
    [saltFuel, taxonomy.coolantTags],
  );

  // Reverse coupling: if any non-molten-salt coolant is selected, lock the
  // molten-salt fuel form chip.
  const hasNonSaltCoolant = c.some((cid) => cid !== "molten-salt");
  const lockedForms = useMemo(
    () =>
      hasNonSaltCoolant
        ? new Set<string>(["molten-salt"])
        : new Set<string>(),
    [hasNonSaltCoolant],
  );

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
    const next = cc.includes(typedId)
      ? cc.filter((chem) => chem !== typedId)
      : [...cc, typedId];
    void setState({ cc: next });
  };
  const toggleXFactor = (id: string) => {
    const typedId = id as XFactorId;
    const next = x.includes(typedId)
      ? x.filter((xid) => xid !== typedId)
      : [...x, typedId];
    void setState({ x: next });
  };

  // Clear handlers
  const clearAll = () =>
    void setState({ fe: null, ks: null, ff: null, c: [], cc: [], x: [] });
  const clearFissile = () =>
    void setState({ fe: null, ks: null, ff: null, c: [], cc: [] });
  const clearKickstarter = () => void setState({ ks: null });
  const clearForm = () => void setState({ ff: null, c: [], cc: [] });
  const clearCoolant = () => void setState({ c: [], cc: [] });
  const clearChemistry = () => void setState({ cc: [] });
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
  const xSet: ReadonlySet<string> = useMemo(() => new Set<string>(x), [x]);

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
              onToggle={toggleChemistry}
              onClear={cc.length > 0 ? clearChemistry : undefined}
              dim={false}
            />
          ) : null}

          {/* Step 4: Size (scale tags) */}
          <StepSection
            stepNumber={4}
            title="Choose a size"
            intro="How big? Micro (<20 MWe) is truck-transportable. Small (20–200 MWe) is factory-modular. Mid (200–700 MWe) is the economics sweet spot. Large (>700 MWe) is the gigawatt-class baseload play."
            tags={scaleTags}
            selected={xSet}
            onToggle={toggleXFactor}
            onClear={hasScaleSelection ? clearScale : undefined}
            dim={false}
          />

          {/* Step 5: Capabilities */}
          <StepSection
            stepNumber={5}
            title="Pick capabilities"
            intro="What should this reactor be able to do? Multi-select — a reactor can deliver several of these at once."
            tags={capabilityTags}
            selected={xSet}
            onToggle={toggleXFactor}
            onClear={hasCapabilitySelection ? clearCapability : undefined}
            dim={false}
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
