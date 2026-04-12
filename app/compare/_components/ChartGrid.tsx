"use client";

import type {
  Source,
  NormalizeOption,
  NumericDimensionId,
  CategoricalDimensionId,
  NumericDimensionValue,
  Citation,
} from "@/lib/data-types";
import {
  NUMERIC_DIMENSION_IDS,
  CATEGORICAL_DIMENSION_IDS,
  TIME_VARYING_DIMENSION_IDS,
  DEFAULT_YEAR,
} from "@/lib/data-types";
import { normalizeValue, adjustConstructionTimeForCF, formatRatio } from "@/lib/chart-math";
import { CiteButton } from "./CiteButton";

interface ChartGridProps {
  sources: ReadonlyArray<Source>;
  allSources: ReadonlyArray<Source>;
  normalizeBaseline: NormalizeOption;
  year: number;
}

/**
 * Resolve the effective value + citation for a dimension at a given year.
 * If the dimension has a `history` array and the year matches an entry,
 * return that entry's value and citation. Otherwise return the current
 * (default-year) value. Static dimensions always return the current value.
 */
function resolveAtYear(
  dim: NumericDimensionValue,
  year: number,
): { value: number; citation: Citation; isHistorical: boolean } {
  if (dim.history && year !== DEFAULT_YEAR) {
    const historical = dim.history.find((h) => h.year === year);
    if (historical) {
      return {
        value: historical.value,
        citation: historical.citation ?? dim.citation,
        isHistorical: true,
      };
    }
  }
  return { value: dim.value, citation: dim.citation, isHistorical: false };
}

/**
 * Whether a dimension actually varies year-over-year in our data.
 * Only LCOE and capacityFactor have real history arrays; the others
 * are near-static physical constants or slow-moving aggregates.
 */
function isTimeVarying(dimId: NumericDimensionId): boolean {
  return (TIME_VARYING_DIMENSION_IDS as ReadonlyArray<NumericDimensionId>).includes(dimId);
}

// Human-readable labels and units for each dimension
const DIMENSION_META: Record<
  NumericDimensionId | CategoricalDimensionId,
  { label: string; unit: string }
> = {
  capacityFactor: { label: "Capacity Factor", unit: "% of theoretical maximum output" },
  landUse: { label: "Land Use", unit: "km² per TWh per year" },
  lifecycleCO2: { label: "Lifecycle CO₂", unit: "gCO₂eq / kWh (median)" },
  deathsPerTWh: { label: "Deaths per TWh", unit: "including air pollution (OWID)" },
  lcoe: { label: "Levelized Cost of Energy", unit: "$/MWh (Lazard 2024)" },
  energyDensity: { label: "Energy Density", unit: "MJ per kg of fuel" },
  constructionTime: { label: "Construction Time", unit: "years to deliver 1 GW avg continuous (raw yr ÷ CF)" },
  dispatchability: { label: "Dispatchability", unit: "can it respond to demand?" },
};

/**
 * Construction time is stored as raw project years (typical ~1 GW build),
 * but that's misleading on its own: a 1 GW solar farm delivers ~25% of a
 * 1 GW nuclear plant's actual energy. Dividing raw years by capacity factor
 * gives "years to bring 1 GW of *average continuous output* online," which
 * normalizes the metric to a per-energy basis.
 *
 * We apply this adjustment at render time so the underlying data file stays
 * a clean store of raw observed values.
 */
function adjustForEnergyBasis(
  rawValue: number,
  dimId: NumericDimensionId,
  source: Source,
  year: number,
): number {
  if (dimId !== "constructionTime") return rawValue;
  const cf = resolveAtYear(source.capacityFactor, year).value;
  return adjustConstructionTimeForCF(rawValue, cf);
}

/**
 * Fixed axis ceilings for dimensions with a natural scale (e.g. percentages).
 * When set, the bar axis uses this instead of max-across-sources — so capacity
 * factor reads against a canonical 0–100 scale rather than a relative one.
 */
const FIXED_SCALE_MAX: Partial<Record<NumericDimensionId, number>> = {
  capacityFactor: 100,
};

/**
 * Get the max value for a numeric dimension across ALL sources (not just selected),
 * so the bar scale stays consistent as sources are toggled on/off.
 * Zero values are excluded so "N/A" flow-resource markers don't break the scale.
 *
 * For time-varying dimensions, also considers the history max so the bar
 * scale doesn't rescale as the year slider moves.
 */
function getMaxValue(
  allSources: ReadonlyArray<Source>,
  dimId: NumericDimensionId,
  year: number,
): number {
  const fixed = FIXED_SCALE_MAX[dimId];
  if (fixed !== undefined) return fixed;

  let max = 0;
  for (const source of allSources) {
    const dim = source[dimId];
    // For constructionTime we scale against the CF-adjusted values so the
    // bar axis matches what the user actually sees in the numbers column.
    const adjusted = adjustForEnergyBasis(dim.value, dimId, source, year);
    if (adjusted > 0 && adjusted > max) max = adjusted;
    if (dim.history) {
      for (const h of dim.history) {
        const hAdjusted = adjustForEnergyBasis(h.value, dimId, source, h.year);
        if (hAdjusted > max) max = hAdjusted;
      }
    }
  }
  return max || 1;
}

/**
 * Cycling rust-accent opacities for stacked sources in a single dimension.
 * First source is full strength; subsequent sources step down so they stay
 * distinguishable without introducing new hues.
 */
const BAR_OPACITIES = [1, 0.55, 0.32, 0.2] as const;

export function ChartGrid({ sources, allSources, normalizeBaseline, year }: ChartGridProps) {
  // Only treat the baseline as active when it's actually on-screen. If the
  // user deselects the baseline source but URL state hasn't caught up (or
  // some other code path leaves a stale value), we drop the ×N multiples
  // rather than comparing to an invisible reference point.
  const baselineSource = normalizeBaseline !== "none"
    ? allSources.find((s) => s.id === normalizeBaseline)
    : undefined;
  const baselineIsVisible =
    baselineSource !== undefined &&
    sources.some((s) => s.id === baselineSource.id);
  const effectiveBaseline = baselineIsVisible ? baselineSource : undefined;

  return (
    <div className="flex flex-col gap-[var(--spacing-12)]">
      {/* Numeric dimensions — rendered as horizontal bars */}
      {NUMERIC_DIMENSION_IDS.map((dimId) => {
        const meta = DIMENSION_META[dimId];

        // Energy density breaks the linear-bar paradigm — nuclear is ~70,000×
        // natural gas, and every other source collapses to a zero-width
        // sliver if we try to draw it as a bar. Render it as a typography
        // callout instead: big ratio headline, raw values as a mono list.
        if (dimId === "energyDensity") {
          return (
            <EnergyDensityCallout
              key={dimId}
              sources={sources}
              meta={meta}
            />
          );
        }

        const maxVal = getMaxValue(allSources, dimId, year);
        const timeVarying = isTimeVarying(dimId);

        return (
          <div key={dimId}>
            {/* Dimension header */}
            <div className="flex justify-between items-baseline border-b border-[var(--color-rule)] pb-[var(--spacing-2)] mb-[var(--spacing-4)]">
              <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium uppercase tracking-[0.02em] text-[var(--color-text)]">
                {meta.label}
                {!timeVarying && year !== DEFAULT_YEAR && (
                  <span className="ml-[var(--spacing-3)] text-[var(--color-text-faint)] text-[length:var(--text-xs)] font-normal normal-case tracking-normal italic">
                    does not vary year-over-year
                  </span>
                )}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                {meta.unit}
              </span>
            </div>

            {/* Bars for each selected source */}
            <div className="flex flex-col gap-[var(--spacing-3)]">
              {sources.map((source, idx) => {
                const dim = source[dimId];
                const resolved = resolveAtYear(dim, year);
                const displayValue = adjustForEnergyBasis(resolved.value, dimId, source, year);
                const displayCitation = resolved.citation;
                // Energy density's flow-resource N/A case is handled in the
                // callout branch above, so every dim in this loop has a real
                // numeric value for every source.
                const isNotApplicable = false;
                const barWidth = maxVal > 0
                  ? (displayValue / maxVal) * 100
                  : 0;

                // Normalize if a baseline is set, on-screen, and dim isn't N/A
                let normalizedMultiple: number | null = null;
                if (effectiveBaseline && !isNotApplicable) {
                  const baselineDim = effectiveBaseline[dimId];
                  const baselineResolved = resolveAtYear(baselineDim, year);
                  const baselineAdjusted = adjustForEnergyBasis(
                    baselineResolved.value,
                    dimId,
                    effectiveBaseline,
                    year,
                  );
                  normalizedMultiple = normalizeValue(
                    displayValue,
                    baselineAdjusted,
                    baselineDim.normalizeThreshold,
                  );
                }

                // Cycle rust opacity so stacked sources stay distinguishable
                const barOpacity = BAR_OPACITIES[idx % BAR_OPACITIES.length];

                return (
                  <div
                    key={source.id}
                    className="grid items-center gap-[var(--spacing-4)]"
                    style={{ gridTemplateColumns: "110px 1fr 140px 28px" }}
                    role="group"
                    aria-label={
                      isNotApplicable
                        ? `${source.label} ${meta.label}: not applicable (flow resource)`
                        : `${source.label} ${meta.label}: ${displayValue} ${dim.unit}`
                    }
                  >
                    {/* Source label */}
                    <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] text-right">
                      {source.label}
                    </span>

                    {/* Bar — rust fill against a faint track so the full axis reads as the scale */}
                    <div className="h-[22px] relative bg-[var(--color-rule)]">
                      {isNotApplicable ? (
                        <div className="h-full flex items-center pl-[var(--spacing-2)]">
                          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)] italic">
                            not applicable — flow resource
                          </span>
                        </div>
                      ) : (
                        <div
                          className="h-full transition-[width] duration-[var(--duration-medium)]"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: "var(--color-accent)",
                            opacity: barOpacity,
                          }}
                        />
                      )}
                    </div>

                    {/* Value + normalized multiple — right-justified so the numbers
                        line up in a clean column. The baseline row itself never shows
                        "1.0×" because a source compared to itself is always 1 (pure noise). */}
                    <span className="block text-right font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] tabular-nums">
                      {isNotApplicable ? (
                        <span className="text-[var(--color-text-faint)]">N/A</span>
                      ) : (
                        <>
                          {formatValue(displayValue, dimId)}
                          {normalizedMultiple !== null && source.id !== effectiveBaseline?.id && (
                            <span className="text-[var(--color-accent)] font-semibold ml-[var(--spacing-2)]">
                              {formatRatio(normalizedMultiple)}
                            </span>
                          )}
                        </>
                      )}
                    </span>

                    {/* Cite button — uses the resolved (year-specific) citation */}
                    <CiteButton
                      citation={displayCitation}
                      sourceLabel={source.label}
                      dimensionLabel={meta.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Categorical dimensions — rendered as chips */}
      {CATEGORICAL_DIMENSION_IDS.map((dimId) => {
        const meta = DIMENSION_META[dimId];

        return (
          <div key={dimId}>
            <div className="flex justify-between items-baseline border-b border-[var(--color-rule)] pb-[var(--spacing-2)] mb-[var(--spacing-4)]">
              <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium uppercase tracking-[0.02em] text-[var(--color-text)]">
                {meta.label}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                {meta.unit}
              </span>
            </div>

            <div className="flex flex-col gap-[var(--spacing-3)]">
              {sources.map((source) => {
                const dim = source[dimId];
                return (
                  <div
                    key={source.id}
                    className="grid items-center gap-[var(--spacing-4)]"
                    style={{ gridTemplateColumns: "110px 1fr 28px" }}
                    role="group"
                    aria-label={`${source.label} ${meta.label}: ${dim.label}`}
                  >
                    <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] text-right">
                      {source.label}
                    </span>
                    <span
                      className={`
                        inline-block w-fit
                        font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium
                        px-[var(--spacing-3)] py-[var(--spacing-1)]
                        rounded-[var(--radius-sm)]
                        ${dim.category === "yes-baseload" || dim.category === "yes-dispatchable"
                          ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                          : dim.category === "variable"
                            ? "bg-[var(--color-rule)] text-[var(--color-text)]"
                            : "bg-[var(--color-rule)] text-[var(--color-text-muted)]"
                        }
                      `}
                    >
                      {dim.label}
                    </span>
                    <CiteButton
                      citation={dim.citation}
                      sourceLabel={source.label}
                      dimensionLabel={meta.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Typography-driven callout for energy density. The numeric gap between
 * nuclear fuel and anything else is so large (~70,000× over natural gas,
 * ~160,000× over coal) that a linear bar chart can only show one source at
 * a time — everything else collapses to pixel dust. We render:
 *
 * 1. The standard dimension header
 * 2. A big ratio headline expressing the nuclear-vs-next-best gap in words
 * 3. A right-aligned mono list of raw values per source
 *
 * Flow resources (solar, wind, hydro — no fuel to weigh) show "not applicable"
 * in the same faint treatment as in the bar rows.
 */
function EnergyDensityCallout({
  sources,
  meta,
}: {
  sources: ReadonlyArray<Source>;
  meta: { label: string; unit: string };
}) {
  // Split into fuel-bearing sources (have real numbers) and flow resources
  // (value of 0 means "not applicable — no fuel"). The ratio story only
  // exists among the fuel sources; flow resources get their own note.
  const withFuel = sources.filter((s) => s.energyDensity.value > 0);
  const withoutFuel = sources.filter((s) => s.energyDensity.value === 0);

  // Compute the ratio headline: biggest value over smallest non-zero value
  // among the selected fuel sources. Only makes sense with 2+ fuel sources.
  let headline: string | null = null;
  if (withFuel.length >= 2) {
    const sortedByValue = [...withFuel].sort(
      (a, b) => b.energyDensity.value - a.energyDensity.value,
    );
    const top = sortedByValue[0];
    const bottom = sortedByValue[sortedByValue.length - 1];
    if (top && bottom && bottom.energyDensity.value > 0) {
      const ratio = top.energyDensity.value / bottom.energyDensity.value;
      headline = `${top.label} fuel packs ${formatRatio(ratio)} more energy per kilogram than ${bottom.label}.`;
    }
  }

  return (
    <div>
      {/* Dimension header — matches the other rows for visual consistency */}
      <div className="flex justify-between items-baseline border-b border-[var(--color-rule)] pb-[var(--spacing-2)] mb-[var(--spacing-4)]">
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium uppercase tracking-[0.02em] text-[var(--color-text)]">
          {meta.label}
          <span className="ml-[var(--spacing-3)] text-[var(--color-text-faint)] text-[length:var(--text-xs)] font-normal normal-case tracking-normal italic">
            off-the-charts — rendered as values, not bars
          </span>
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
          {meta.unit}
        </span>
      </div>

      {/* Ratio headline — the story, in words */}
      {headline && (
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] leading-[1.4] text-[var(--color-text)] mb-[var(--spacing-4)] max-w-[640px]">
          {headline}
        </p>
      )}

      {/* Raw values list — mono, right-aligned, with cite buttons */}
      <div className="flex flex-col gap-[var(--spacing-3)]">
        {sources.map((source) => {
          const dim = source.energyDensity;
          const isNotApplicable = dim.value === 0;
          return (
            <div
              key={source.id}
              className="grid items-center gap-[var(--spacing-4)]"
              style={{ gridTemplateColumns: "110px 1fr 28px" }}
              role="group"
              aria-label={
                isNotApplicable
                  ? `${source.label} energy density: not applicable (flow resource)`
                  : `${source.label} energy density: ${dim.value} ${dim.unit}`
              }
            >
              <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] text-right">
                {source.label}
              </span>
              <span className="block text-right font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] tabular-nums">
                {isNotApplicable ? (
                  <span className="text-[var(--color-text-faint)] italic">
                    not applicable — flow resource
                  </span>
                ) : (
                  <>
                    {formatEnergyDensityValue(dim.value)}
                    <span className="text-[var(--color-text-faint)] ml-[var(--spacing-2)] font-normal">
                      {dim.unit}
                    </span>
                  </>
                )}
              </span>
              <CiteButton
                citation={dim.citation}
                sourceLabel={source.label}
                dimensionLabel={meta.label}
              />
            </div>
          );
        })}
      </div>

      {/* If there are flow-resource sources, ground the "N/A" treatment
          with a one-line explanation so it doesn't feel like missing data */}
      {withoutFuel.length > 0 && (
        <p className="mt-[var(--spacing-4)] font-[family-name:var(--font-body)] text-[length:var(--text-xs)] text-[var(--color-text-faint)] italic max-w-[640px]">
          {withoutFuel.map((s) => s.label).join(", ")} convert flowing energy
          (photons, wind, water) directly into electricity — there&apos;s no
          fuel to weigh, so the concept doesn&apos;t apply.
        </p>
      )}
    </div>
  );
}

/**
 * Render energy density values with enough precision at every magnitude.
 * 3,900,000 → "3,900,000" (not "3.9M", which the ratio headline already
 * conveys and which the eye can't compare precisely against "56").
 */
function formatEnergyDensityValue(value: number): string {
  return Math.round(value).toLocaleString();
}

/** Format a numeric value with appropriate precision for each dimension */
function formatValue(value: number, dimId: NumericDimensionId): string {
  if (value === 0) return "N/A";

  switch (dimId) {
    case "capacityFactor":
      return `${value.toFixed(1)}%`;
    case "landUse":
      return value < 1 ? value.toFixed(1) : value.toFixed(0);
    case "lifecycleCO2":
      return value.toFixed(0);
    case "deathsPerTWh":
      return value < 1 ? value.toFixed(2) : value.toFixed(1);
    case "lcoe":
      return `$${value.toFixed(0)}`;
    case "energyDensity":
      return value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
          ? `${(value / 1_000).toFixed(0)}k`
          : value.toFixed(0);
    case "constructionTime":
      return `${value.toFixed(1)} yr`;
    default:
      return value.toString();
  }
}
