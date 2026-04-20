"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import type {
  ReactorTaxonomy,
  ReactorDesign,
  FuelId,
  CoolantId,
  XFactorId,
} from "@/lib/reactor-types";
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
 * ReactorBuilderView — the interactive Reactor Builder.
 *
 * Owns the nuqs URL state (fuel/coolant/xFactor selections) and computes
 * matchReactors on every render. Renders the three-step configurator
 * with progressive dimming, the sticky spec card, and the match list.
 *
 * Layout (per the design review):
 *   - Desktop (≥880px): two-column grid, steps left (1fr), spec card right (360px).
 *   - Mobile (<880px): single-column stack with spec card below steps.
 *     At <640px, an additional sticky summary bar renders at the viewport
 *     top (implemented inside SpecCard with its own responsive logic).
 *
 * Step dimming:
 *   - Step 1 (Fuel) always active.
 *   - Step 2 (Coolant) dims at opacity 0.4 until Step 1 has ≥1 selection.
 *   - Step 3 (X-Factor) dims until Step 2 has ≥1 selection.
 *   - Preset links bypass dimming by directly setting xFactor state
 *     (which cascades visually — all prior steps stay enabled).
 */
export function ReactorBuilderView({
  taxonomy,
  reactors,
}: ReactorBuilderViewProps) {
  const [{ fuel, coolant, x: xFactor }, setState] = useQueryStates(
    REACTOR_BUILDER_SEARCH_PARAMS,
    { shallow: false },
  );

  // Compute matching reactors. Pure function over the data, recomputed on
  // every render — fast enough for 6 reactors (rerender-simple-expression
  // rule: don't memo trivial computations, but this is over external data
  // so useMemo keeps the ranked array reference stable for downstream
  // components that might memo off it).
  const matchResult = useMemo(
    () => matchReactors({ fuel, coolant, xFactor }, reactors),
    [fuel, coolant, xFactor, reactors],
  );

  // Progressive dim gates. Step N is dim until the prior step has a selection.
  const coolantDim = fuel.length === 0;
  const xFactorDim = coolant.length === 0;

  // Clear handlers for each step.
  const clearFuel = () => setState({ fuel: [] });
  const clearCoolant = () => setState({ coolant: [] });
  const clearXFactor = () => setState({ x: [] });
  const clearAll = () => setState({ fuel: [], coolant: [], x: [] });

  // Selected tag sets for fast membership checks in chip rendering.
  const fuelSet = useMemo(() => new Set(fuel), [fuel]);
  const coolantSet = useMemo(() => new Set(coolant), [coolant]);
  const xFactorSet = useMemo(() => new Set(xFactor), [xFactor]);

  // X-Factor tags split by group for the two-sub-group rendering (Scale + Capability).
  const scaleTags = useMemo(
    () => taxonomy.xFactorTags.filter((t) => t.group === "scale"),
    [taxonomy.xFactorTags],
  );
  const capabilityTags = useMemo(
    () => taxonomy.xFactorTags.filter((t) => t.group === "capability"),
    [taxonomy.xFactorTags],
  );

  const hasAnySelection = fuel.length + coolant.length + xFactor.length > 0;

  return (
    <>
      {/* Visually-hidden h2 so the aria-labelledby from the section header resolves. */}
      <h2 id="builder-title" className="sr-only">
        Reactor Builder
      </h2>

      <PresetLinks
        onPreset={(preset) => {
          setState({ fuel: [], coolant: [], x: preset });
        }}
      />

      {/* Two-column grid on desktop; stacks on mobile. */}
      <div className="grid grid-cols-1 min-[880px]:grid-cols-[minmax(0,1fr)_360px] gap-[var(--spacing-12)] pt-[var(--spacing-8)] items-start">
        {/* Left column: step sections */}
        <div>
          <StepSection
            stepNumber={1}
            title="Pick a fuel"
            intro="Your fuel determines the fissile material and how densely packed it is. Different fuels enable different reactor physics."
            tags={taxonomy.fuelTags}
            selected={fuelSet}
            onToggle={(id) => {
              const typedId = id as FuelId;
              const next = fuelSet.has(typedId)
                ? fuel.filter((f) => f !== typedId)
                : [...fuel, typedId];
              setState({ fuel: next });
            }}
            onClear={fuel.length > 0 ? clearFuel : undefined}
            dim={false}
          />

          <StepSection
            stepNumber={2}
            title="Pick a coolant"
            intro="Coolant choice defines outlet temperature and the safety profile. It's the most consequential physical decision in a reactor."
            tags={taxonomy.coolantTags}
            selected={coolantSet}
            onToggle={(id) => {
              const typedId = id as CoolantId;
              const next = coolantSet.has(typedId)
                ? coolant.filter((c) => c !== typedId)
                : [...coolant, typedId];
              setState({ coolant: next });
            }}
            onClear={coolant.length > 0 ? clearCoolant : undefined}
            dim={coolantDim}
          />

          <StepSection
            stepNumber={3}
            title="Pick capabilities"
            intro="What should this reactor be able to do? These tags capture scale (how big) and capability (what it unlocks)."
            tags={[]}
            selected={xFactorSet}
            onToggle={(id) => {
              const typedId = id as XFactorId;
              const next = xFactorSet.has(typedId)
                ? xFactor.filter((xf) => xf !== typedId)
                : [...xFactor, typedId];
              setState({ x: next });
            }}
            onClear={xFactor.length > 0 ? clearXFactor : undefined}
            dim={xFactorDim}
            subGroups={[
              { label: "Scale", tags: scaleTags },
              { label: "Capability", tags: capabilityTags },
            ]}
          />
        </div>

        {/* Right column: sticky spec card */}
        <SpecCard
          taxonomy={taxonomy}
          fuel={fuel}
          coolant={coolant}
          xFactor={xFactor}
          matchCount={matchResult.results.length}
          totalReactors={reactors.length}
          hasAnySelection={hasAnySelection}
          onClearAll={clearAll}
        />
      </div>

      {/* Match results below the configurator, full-width */}
      <MatchList
        taxonomy={taxonomy}
        selectedFuel={fuel}
        selectedCoolant={coolant}
        selectedXFactor={xFactor}
        result={matchResult}
        onClearAll={clearAll}
      />

      {/* Aria-live region announces filter changes to screen readers.
          Visually hidden but present in the DOM. Polite so it doesn't
          interrupt other speech. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {hasAnySelection
          ? `Showing ${matchResult.results.length} matching reactor ${matchResult.results.length === 1 ? "design" : "designs"}.`
          : `Showing all ${reactors.length} reactor designs.`}
      </div>
    </>
  );
}
