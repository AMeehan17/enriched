"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import type {
  ReactorTaxonomy,
  ReactorDesign,
  FissileElementId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  XFactorId,
} from "@/lib/reactor-types";
import { SALT_COOLANT_IDS } from "@/lib/reactor-types";
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
 * ReactorBuilderView — the interactive Reactor Builder (schema v2).
 *
 * 4 main steps (+ 1 conditional):
 *   Step 1  — Fissile element (single-select radio)
 *   Step 1a — Kickstarter     (single-select, renders only when Th-232)
 *   Step 2  — Fuel form       (single-select)
 *   Step 3  — Coolant         (multi-select, restricted to salts when
 *                              fuel form = molten-salt)
 *   Step 4  — X-Factor        (multi-select)
 *
 * Progressive dimming cascade:
 *   Step 1: always active
 *   Step 1a: only renders when Step 1 = th-232
 *   Step 2: dim until Step 1 has a selection (and kickstarter if Th-232)
 *   Step 3: dim until Step 2 has a selection
 *   Step 4: always active (preset links go here)
 *
 * Single-select behavior: clicking a chip sets state to that chip. Clicking
 * an already-selected chip deselects (sets state to null).
 *
 * Multi-select behavior: toggle add/remove from array.
 */
export function ReactorBuilderView({
  taxonomy,
  reactors,
}: ReactorBuilderViewProps) {
  const [state, setState] = useQueryStates(REACTOR_BUILDER_SEARCH_PARAMS, {
    shallow: false,
  });

  // Destructure with typed aliases for clarity
  const fe: FissileElementId | null = state.fe;
  const ks: KickstarterId | null = state.ks;
  const ff: FuelFormId | null = state.ff;
  const c: CoolantId[] = state.c;
  const x: XFactorId[] = state.x;

  // Compute matches
  const matchResult = useMemo(
    () =>
      matchReactors(
        { fuelElement: fe, kickstarter: ks, fuelForm: ff, coolant: c, xFactor: x },
        reactors,
      ),
    [fe, ks, ff, c, x, reactors],
  );

  // Progressive dim gates
  const fissileMissing = fe === null;
  const kickstarterNeeded = fe === "th-232";
  const kickstarterMissing = kickstarterNeeded && ks === null;
  const formDim = fissileMissing || kickstarterMissing;
  const formMissing = ff === null;
  const coolantDim = formDim || formMissing;

  // If molten-salt fuel form: only the 3 salt coolants selectable
  const saltOnly = ff === "molten-salt";
  const lockedCoolants = useMemo(
    () =>
      saltOnly
        ? new Set<string>(
            taxonomy.coolantTags
              .filter((t) => !SALT_COOLANT_IDS.includes(t.id))
              .map((t) => t.id),
          )
        : new Set<string>(),
    [saltOnly, taxonomy.coolantTags],
  );

  // Single-select handlers
  const selectFissile = (id: string) => {
    const typedId = id as FissileElementId;
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
    if (ff === typedId) {
      // Deselect
      void setState({ ff: null, c: [] });
    } else {
      // Switching TO molten-salt: clear any non-salt coolants
      const newCoolants =
        typedId === "molten-salt"
          ? c.filter((cid) => SALT_COOLANT_IDS.includes(cid))
          : c;
      void setState({ ff: typedId, c: newCoolants });
    }
  };
  // Multi-select handlers
  const toggleCoolant = (id: string) => {
    const typedId = id as CoolantId;
    if (lockedCoolants.has(typedId)) return; // guard
    const next = c.includes(typedId)
      ? c.filter((cid) => cid !== typedId)
      : [...c, typedId];
    void setState({ c: next });
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
    void setState({ fe: null, ks: null, ff: null, c: [], x: [] });
  const clearFissile = () =>
    void setState({ fe: null, ks: null, ff: null, c: [] });
  const clearKickstarter = () => void setState({ ks: null });
  const clearForm = () => void setState({ ff: null, c: [] });
  const clearCoolant = () => void setState({ c: [] });
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
  const xSet: ReadonlySet<string> = useMemo(() => new Set<string>(x), [x]);

  const hasAnySelection =
    fe !== null ||
    ks !== null ||
    ff !== null ||
    c.length > 0 ||
    x.length > 0;

  return (
    <>
      <h2 id="builder-title" className="sr-only">
        Reactor Builder
      </h2>

      <PresetLinks
        onPreset={(preset) => {
          void setState({
            fe: null,
            ks: null,
            ff: null,
            c: [],
            x: preset,
          });
        }}
      />

      {/* Two-column grid on desktop; stacks on mobile */}
      <div className="grid grid-cols-1 min-[880px]:grid-cols-[minmax(0,1fr)_360px] gap-[var(--spacing-12)] pt-[var(--spacing-8)] items-start">
        <div>
          {/* Step 1: Fissile element */}
          <StepSection
            stepNumber={1}
            title="Pick a fissile element"
            intro="What atom is splitting? Uranium-235 is the workhorse of today's fleet. Thorium-232 breeds fissile U-233 but needs a kickstarter. Plutonium-239 comes from recycled spent fuel."
            tags={taxonomy.fissileElementTags}
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
            intro="How is the fissile material packaged? The form determines everything downstream — pressure, temperature, safety envelope. Molten salt fuel is the coolant too."
            tags={taxonomy.fuelFormTags}
            selected={ffSet}
            onToggle={selectForm}
            onClear={ff !== null ? clearForm : undefined}
            dim={formDim}
          />

          {/* Step 3: Coolant */}
          <StepSection
            stepNumber={3}
            title="Pick a coolant"
            intro={
              saltOnly
                ? "Your fuel is dissolved in salt, so the coolant IS the fuel carrier. Pick which salt chemistry — non-salt coolants are physically impossible here."
                : "Coolant defines outlet temperature and safety profile. It's the most consequential physical decision in a reactor."
            }
            tags={taxonomy.coolantTags}
            selected={cSet}
            lockedIds={lockedCoolants}
            onToggle={toggleCoolant}
            onClear={c.length > 0 ? clearCoolant : undefined}
            dim={coolantDim}
          />

          {/* Step 4: X-Factor */}
          <StepSection
            stepNumber={4}
            title="Pick capabilities"
            intro="What should this reactor be able to do? Scale (how big) and capability (what it unlocks). Multi-select — a reactor can have several."
            tags={[]}
            selected={xSet}
            onToggle={toggleXFactor}
            onClear={x.length > 0 ? clearXFactor : undefined}
            dim={false}
            subGroups={[
              { label: "Scale", tags: scaleTags },
              { label: "Capability", tags: capabilityTags },
            ]}
          />
        </div>

        {/* Right column: sticky spec card */}
        <SpecCard
          taxonomy={taxonomy}
          fuelElement={fe}
          kickstarter={ks}
          fuelForm={ff}
          coolant={c}
          xFactor={x}
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
