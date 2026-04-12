"use client";

import type { Source, NormalizeOption, NumericDimensionId, CategoricalDimensionId } from "@/lib/data-types";
import { NUMERIC_DIMENSION_IDS, CATEGORICAL_DIMENSION_IDS } from "@/lib/data-types";

interface ChartGridProps {
  sources: ReadonlyArray<Source>;
  allSources: ReadonlyArray<Source>;
  normalizeBaseline: NormalizeOption;
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
  constructionTime: { label: "Construction Time", unit: "years to commercial operation" },
  dispatchability: { label: "Dispatchability", unit: "can it respond to demand?" },
};

/**
 * Get the max value for a numeric dimension across ALL sources (not just selected),
 * so the bar scale stays consistent as sources are toggled on/off.
 * Zero values are excluded so "N/A" flow-resource markers don't break the scale.
 */
function getMaxValue(allSources: ReadonlyArray<Source>, dimId: NumericDimensionId): number {
  let max = 0;
  for (const source of allSources) {
    const dim = source[dimId];
    if (dim.value > 0 && dim.value > max) max = dim.value;
  }
  return max || 1; // avoid division by zero
}

/**
 * Compute the normalized display value. Returns null if the baseline value
 * is below the normalize threshold (divide-by-small-number guard).
 */
function normalizeValue(
  value: number,
  baselineValue: number,
  threshold: number | undefined,
): number | null {
  if (baselineValue === 0) return null;
  if (threshold !== undefined && baselineValue < threshold) return null;
  return value / baselineValue;
}

export function ChartGrid({ sources, allSources, normalizeBaseline }: ChartGridProps) {
  const baselineSource = normalizeBaseline !== "none"
    ? allSources.find((s) => s.id === normalizeBaseline)
    : undefined;

  return (
    <div className="flex flex-col gap-[var(--spacing-12)]">
      {/* Numeric dimensions — rendered as horizontal bars */}
      {NUMERIC_DIMENSION_IDS.map((dimId) => {
        const meta = DIMENSION_META[dimId];
        const maxVal = getMaxValue(allSources, dimId);

        return (
          <div key={dimId}>
            {/* Dimension header */}
            <div className="flex justify-between items-baseline border-b border-[var(--color-rule)] pb-[var(--spacing-2)] mb-[var(--spacing-4)]">
              <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium uppercase tracking-[0.02em] text-[var(--color-text)]">
                {meta.label}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                {meta.unit}
              </span>
            </div>

            {/* Bars for each selected source */}
            <div className="flex flex-col gap-[var(--spacing-3)]">
              {sources.map((source, idx) => {
                const dim = source[dimId];
                const isNotApplicable = dim.value === 0 && dimId === "energyDensity";
                const barWidth = maxVal > 0 && !isNotApplicable
                  ? (dim.value / maxVal) * 100
                  : 0;

                // Normalize if a baseline is set (and dim isn't N/A)
                let normalizedMultiple: number | null = null;
                if (baselineSource && !isNotApplicable) {
                  const baselineDim = baselineSource[dimId];
                  normalizedMultiple = normalizeValue(
                    dim.value,
                    baselineDim.value,
                    baselineDim.normalizeThreshold,
                  );
                }

                // Cycle through data colors so 3rd+ sources stay visually distinct
                const barColorVar = `--color-data-${(idx % 3) + 1}`;

                return (
                  <div
                    key={source.id}
                    className="grid items-center gap-[var(--spacing-4)]"
                    style={{ gridTemplateColumns: "110px 1fr 140px" }}
                    role="img"
                    aria-label={
                      isNotApplicable
                        ? `${source.label} ${meta.label}: not applicable (flow resource)`
                        : `${source.label} ${meta.label}: ${dim.value} ${dim.unit}`
                    }
                  >
                    {/* Source label */}
                    <span className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] text-right">
                      {source.label}
                    </span>

                    {/* Bar */}
                    <div className="h-[22px] relative">
                      {isNotApplicable ? (
                        <div className="h-full flex items-center">
                          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)] italic">
                            not applicable — flow resource
                          </span>
                        </div>
                      ) : (
                        <div
                          className="h-full transition-[width] duration-[var(--duration-medium)]"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: `var(${barColorVar})`,
                          }}
                        />
                      )}
                    </div>

                    {/* Value + normalized multiple */}
                    <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] tabular-nums">
                      {isNotApplicable ? (
                        <span className="text-[var(--color-text-faint)]">N/A</span>
                      ) : (
                        <>
                          {formatValue(dim.value, dimId)}
                          {normalizedMultiple !== null && (
                            <span className="text-[var(--color-accent)] font-semibold ml-1">
                              {normalizedMultiple.toFixed(1)}×
                            </span>
                          )}
                          {normalizedMultiple === null && baselineSource && (
                            <span className="text-[var(--color-text-faint)] text-[length:var(--text-xs)] ml-1">
                              abs
                            </span>
                          )}
                        </>
                      )}
                    </span>
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
                    style={{ gridTemplateColumns: "110px 1fr" }}
                    role="img"
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
