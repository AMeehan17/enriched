"use client";

/**
 * <ChainReactionViz />
 *
 * The flagship cell for Module 3 article 1 (Fission and the Chain
 * Reaction). A slider sets the effective multiplication factor k; the
 * SVG plots the neutron population over 20 generations on a log y-axis
 * so subcritical and supercritical curves both read as straight lines.
 *
 * Three teaching moments the cell earns:
 *
 *   - At k = 1, the curve is exactly flat. That's "critical" — the
 *     chain reaction sustains itself without growing or dying.
 *   - At k = 0.95, the population falls to a third of its starting
 *     value in 20 generations. A subcritical core is shutting itself
 *     off, fast.
 *   - At k = 1.05, the population grows to roughly 2.65× over the same
 *     window. That looks slow until you remember each generation in a
 *     thermal reactor is ~10⁻⁴ s — 20 of them is two milliseconds.
 *
 * Visual contract: same shell as MaxwellBoltzmannSlider — hairline
 * card, rust accent for the active curve, tabular nums, no icons.
 */

import { useId, useMemo, useState } from "react";
import {
  GENERATIONS,
  K_DEFAULT,
  K_MAX,
  K_MIN,
  Y_MAX,
  Y_MIN,
  samplePopulation,
  yPositionLog,
} from "./chain-reaction-math";

// ─── Plot geometry ───────────────────────────────────────────────────
const PLOT_W = 800;
const PLOT_H = 400;
const MARGIN = { top: 24, right: 36, bottom: 52, left: 60 };
const INNER_W = PLOT_W - MARGIN.left - MARGIN.right;
const INNER_H = PLOT_H - MARGIN.top - MARGIN.bottom;

function xCoord(generation: number): number {
  return MARGIN.left + (generation / GENERATIONS) * INNER_W;
}
function yCoord(population: number): number {
  // yPositionLog returns 0 at bottom (Y_MIN), 1 at top (Y_MAX).
  // SVG y grows downward, so flip.
  return MARGIN.top + (1 - yPositionLog(population)) * INNER_H;
}

function buildPath(
  samples: ReadonlyArray<{ generation: number; population: number }>,
): string {
  if (samples.length === 0) return "";
  return samples
    .map(
      (s, i) =>
        `${i === 0 ? "M" : "L"}${xCoord(s.generation).toFixed(2)},${yCoord(s.population).toFixed(2)}`,
    )
    .join(" ");
}

// Tick positions for the x-axis (generation count).
const X_TICKS: ReadonlyArray<{ generation: number; label: string }> = [
  { generation: 0, label: "0" },
  { generation: 5, label: "5" },
  { generation: 10, label: "10" },
  { generation: 15, label: "15" },
  { generation: 20, label: "20" },
];

// Tick positions for the y-axis (log scale, marked at convenient values).
const Y_TICKS: ReadonlyArray<{ population: number; label: string }> = [
  { population: Y_MIN, label: Y_MIN.toFixed(2) + "×" },
  { population: 0.5, label: "0.5×" },
  { population: 1, label: "1×" },
  { population: 2, label: "2×" },
  { population: Y_MAX, label: Y_MAX.toFixed(2) + "×" },
];

// Reference curves: subcritical / critical / supercritical, drawn as
// faint guides so the active curve has a "where am I in this family"
// reading. Pre-computed once at module load.
const SUBCRIT_SAMPLES = samplePopulation(K_MIN);
const CRIT_SAMPLES = samplePopulation(K_DEFAULT);
const SUPERCRIT_SAMPLES = samplePopulation(K_MAX);
const SUBCRIT_PATH = buildPath(SUBCRIT_SAMPLES);
const CRIT_PATH = buildPath(CRIT_SAMPLES);
const SUPERCRIT_PATH = buildPath(SUPERCRIT_SAMPLES);

interface Preset {
  k: number;
  label: string;
  blurb: string;
}

const PRESETS: ReadonlyArray<Preset> = [
  { k: 0.97, label: "k = 0.97", blurb: "Subcritical — shutting down" },
  { k: 1.0, label: "k = 1.000", blurb: "Critical — steady" },
  { k: 1.003, label: "k = 1.003", blurb: "Slightly super — slow ramp" },
  { k: 1.03, label: "k = 1.03", blurb: "Supercritical — clear growth" },
];

function formatPopulation(pop: number): string {
  if (pop < 0.01) return pop.toFixed(4) + "×";
  if (pop < 1) return pop.toFixed(3) + "×";
  if (pop < 10) return pop.toFixed(3) + "×";
  return pop.toFixed(2) + "×";
}

function regime(k: number): "subcritical" | "critical" | "supercritical" {
  if (k < 0.999) return "subcritical";
  if (k > 1.001) return "supercritical";
  return "critical";
}

const REGIME_LABEL: Record<ReturnType<typeof regime>, string> = {
  subcritical: "Subcritical — population dies out",
  critical: "Critical — population steady",
  supercritical: "Supercritical — population grows",
};

export function ChainReactionViz() {
  const [k, setK] = useState<number>(K_DEFAULT);
  const sliderId = useId();

  const samples = useMemo(() => samplePopulation(k), [k]);
  const activePath = useMemo(() => buildPath(samples), [samples]);
  const finalPopulation = samples[samples.length - 1]?.population ?? 1;
  const currentRegime = regime(k);

  return (
    <figure
      style={{
        margin: "var(--spacing-12) 0",
        padding: "var(--spacing-6) var(--spacing-6) var(--spacing-4)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "var(--spacing-3)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Neutron population over generations
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            fontVariantNumeric: "tabular-nums",
            color: "var(--color-text-muted)",
          }}
        >
          k = {k.toFixed(3)}
        </span>
      </div>

      {/* Plot */}
      <svg
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
        role="img"
        aria-labelledby={`${sliderId}-title`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <title id={`${sliderId}-title`}>
          {`Neutron population vs generation at k = ${k.toFixed(3)}. After ${GENERATIONS} generations the population is ${formatPopulation(finalPopulation)} its starting value (${currentRegime}).`}
        </title>

        {/* X-axis gridlines */}
        {X_TICKS.map((tick) => (
          <line
            key={`xgrid-${tick.generation}`}
            x1={xCoord(tick.generation).toFixed(2)}
            x2={xCoord(tick.generation).toFixed(2)}
            y1={MARGIN.top}
            y2={MARGIN.top + INNER_H}
            stroke="var(--color-rule)"
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
        ))}

        {/* Y-axis gridlines */}
        {Y_TICKS.map((tick) => (
          <line
            key={`ygrid-${tick.population}`}
            x1={MARGIN.left}
            x2={MARGIN.left + INNER_W}
            y1={yCoord(tick.population).toFixed(2)}
            y2={yCoord(tick.population).toFixed(2)}
            stroke="var(--color-rule)"
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
        ))}

        {/* N = 1 reference line (the critical baseline, slightly stronger) */}
        <line
          x1={MARGIN.left}
          x2={MARGIN.left + INNER_W}
          y1={yCoord(1).toFixed(2)}
          y2={yCoord(1).toFixed(2)}
          stroke="var(--color-rule-strong)"
          strokeWidth={1}
          shapeRendering="crispEdges"
        />

        {/* Axis baselines */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + INNER_H}
          x2={MARGIN.left + INNER_W}
          y2={MARGIN.top + INNER_H}
          stroke="var(--color-rule-strong)"
          strokeWidth={1}
          shapeRendering="crispEdges"
        />

        {/* Reference family curves — faint guides so the user can see the
            shape of the regime they're moving toward. */}
        <path
          d={SUBCRIT_PATH}
          fill="none"
          stroke="var(--color-data-2)"
          strokeOpacity={0.3}
          strokeWidth={1.25}
          strokeDasharray="2 3"
        />
        <path
          d={CRIT_PATH}
          fill="none"
          stroke="var(--color-data-2)"
          strokeOpacity={0.3}
          strokeWidth={1.25}
          strokeDasharray="2 3"
        />
        <path
          d={SUPERCRIT_PATH}
          fill="none"
          stroke="var(--color-data-2)"
          strokeOpacity={0.3}
          strokeWidth={1.25}
          strokeDasharray="2 3"
        />

        {/* Active curve — rust accent */}
        <path
          d={activePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X-axis tick labels */}
        {X_TICKS.map((tick) => (
          <text
            key={`xtick-${tick.generation}`}
            x={xCoord(tick.generation).toFixed(2)}
            y={MARGIN.top + INNER_H + 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-text-faint)"
          >
            {tick.label}
          </text>
        ))}

        {/* X-axis title */}
        <text
          x={MARGIN.left + INNER_W / 2}
          y={MARGIN.top + INNER_H + 40}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          Generation
        </text>

        {/* Y-axis tick labels */}
        {Y_TICKS.map((tick) => (
          <text
            key={`ytick-${tick.population}`}
            x={MARGIN.left - 8}
            y={(yCoord(tick.population) + 3).toFixed(2)}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-text-faint)"
          >
            {tick.label}
          </text>
        ))}
      </svg>

      {/* Slider */}
      <div
        style={{
          marginTop: "var(--spacing-4)",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "var(--spacing-3)",
          alignItems: "center",
        }}
      >
        <label
          htmlFor={sliderId}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          k
        </label>
        <input
          id={sliderId}
          type="range"
          min={K_MIN}
          max={K_MAX}
          step={0.001}
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          aria-valuetext={`k = ${k.toFixed(3)}; ${currentRegime}; population after ${GENERATIONS} generations is ${formatPopulation(finalPopulation)}`}
          // Browser extensions inject caret-color/style attributes on inputs;
          // React 19 strict hydration flags the resulting diff. Benign.
          suppressHydrationWarning
          style={{
            width: "100%",
            accentColor: "var(--color-accent)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            fontVariantNumeric: "tabular-nums",
            color: "var(--color-text)",
            minWidth: "5.5ch",
            textAlign: "right",
          }}
        >
          {k.toFixed(3)}
        </span>
      </div>

      {/* Preset chips */}
      <div
        style={{
          marginTop: "var(--spacing-3)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--spacing-2)",
        }}
      >
        {PRESETS.map((p) => {
          const active = Math.abs(p.k - k) < 0.0005;
          return (
            <button
              key={p.k}
              type="button"
              onClick={() => setK(p.k)}
              title={p.blurb}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                fontVariantNumeric: "tabular-nums",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-rule-strong)"}`,
                background: active
                  ? "var(--color-accent-soft)"
                  : "transparent",
                color: active
                  ? "var(--color-accent-text)"
                  : "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Caption — restates the cell's state in prose. Also the
          accessible fallback if the SVG fails. */}
      <figcaption
        style={{
          marginTop: "var(--spacing-4)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
          lineHeight: 1.5,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {REGIME_LABEL[currentRegime]}. After {GENERATIONS} generations at{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
          k = {k.toFixed(3)}
        </strong>
        , the neutron population is{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
          {formatPopulation(finalPopulation)}
        </strong>{" "}
        its starting value. In a thermal reactor each generation is about
        10⁻⁴ s, so {GENERATIONS} generations is roughly{" "}
        {(GENERATIONS * 1e-4 * 1000).toFixed(0)} ms.
      </figcaption>
    </figure>
  );
}
